import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BookingWrapper from "./style";
import PropertyNavigation from "./PropertyNavigation";
import SmallModal from "../../components/Modal/SmallModal";
import axiosInstance from "../../utilities/axiosInstance";
import API_ENDPOINTS from "../../utilities/apiConfig";
import Swal from "sweetalert2";
import { formatDisplayDate } from "../../utilities/dateUtils";
import { getCurrentUserRole } from "../../utilities/rolePermissions";
import "./RefundList.css";

export default function RefundList() {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("0");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [showAddStatusModal, setShowAddStatusModal] = useState(false);
  const [selectedStatusBooking, setSelectedStatusBooking] = useState(null);
  const [statusDate, setStatusDate] = useState("");
  const [statusType, setStatusType] = useState("initiated");
  const [statusNote, setStatusNote] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusLogs, setStatusLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const navigate = useNavigate();
  const role = getCurrentUserRole();

  const getUserId = () => {
    const stored = localStorage.getItem("userId");
    const parsed = stored ? Number(stored) : NaN;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  };

  const STATUS_MAPPING = {
    initiated: 1,
    rejected: 3,
    approved: 2,
    closed: 4
  };


  const getStatusString = (status) => {
    const mapping = {
      1: "Pending",
      2: "Approved",
      3: "Rejected",
      4: "Closed",
      initiated: "Pending",
      rejected: "Rejected",
      approved: "Approved",
      closed: "Closed"
    };

    if (!status) return "Pending";

    return mapping[status] || mapping[String(status).toLowerCase()] || "Pending";
  };


  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus]);

  useEffect(() => {
    fetchRefundsData();
  }, []);

  const fetchRefundsData = async () => {
    setLoading(true);
    setError(null);

    const timeoutId = setTimeout(() => {
      setLoading(currentLoading => {
        if (currentLoading) {
          setError("API call is taking longer than expected. Please check your connection.");
          return false;
        }
        return currentLoading;
      });
    }, 30000);

    try {
      const response = await axiosInstance.get(API_ENDPOINTS.REFUND_LIST+"?status="+filterStatus);
      clearTimeout(timeoutId);
      const refundsList = extractRefundsFromResponse(response);
 
      if (refundsList.length > 0) {
        const transformedRefunds = transformRefundsData(refundsList);
        setRefunds(transformedRefunds);
      } else {
        setRefunds([]);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      handleFetchError(error);
      setRefunds([]);
    } finally {
      setLoading(false);
    }
  };

  const extractRefundsFromResponse = (response) => {
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data?.value && Array.isArray(response.data.value)) {
      return response.data.value;
    }
    return [];
  };

  const transformRefundsData = (refundsList) => {
    return refundsList.map((item) => {
      const customerName = extractFieldValue(item, [
        'bookingInfo.customerName',
        'bookingInfo.clientName',
        'customerName',
        'clientName',
        'booking.customerName',
        'booking.clientName',
        'Customer',
        'customer',
        'name',
        'Name'
      ]);

      const plotNumber = extractFieldValue(item, [
        'bookingInfo.plotNumber',
        'bookingInfo.plotNo',
        'plotNumber',
        'plotNo',
        'PlotNo',
        'plot_no',
        'booking.plotNumber',
        'booking.plotNo',
        'Plot',
        'plot',
        'plotId',
        'PlotId'
      ]);

      const townshipName = extractFieldValue(item, [
        'bookingInfo.townshipName',
        'bookingInfo.township',
        'townshipName',
        'township',
        'Township',
        'booking.townshipName',
        'booking.township',
        'location',
        'Location'
      ]);

      const finalCustomerName = customerName !== "N/A" ? customerName : `Customer-${item.bookingId || item.id}`;
      const finalPlotNumber = plotNumber !== "N/A" ? plotNumber : `Plot-${item.bookingId || item.id}`;
      const finalTownshipName = townshipName !== "N/A" ? townshipName : `Township-${item.bookingId || item.id}`;

      return {
        id: item.id,
        bookingId: item.bookingId || item.id,
        status: getStatusString(item.status),
        refundAmount: item.refundAmount || item.amount || 0,
        notes: item.notes || "",
        cancelledOn: item.cancelledOn,
        bookingInfo: {
          id: item.bookingInfo?.id || item.id,
          customerName: finalCustomerName,
          plotNumber: finalPlotNumber,
          townshipName: finalTownshipName
        }
      };
    });
  };

  const extractFieldValue = (item, possibleKeys, defaultValue = "N/A") => {
    for (const key of possibleKeys) {
      const keys = key.split('.');
      let value = item;

      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          value = null;
          break;
        }
      }
      if (value !== null && value !== undefined && value !== '') {
        return String(value);
      }
    }
    return defaultValue;
  };

  const handleFetchError = (error) => {
    let errorMessage = "Failed to fetch refunds. Please try again.";

    if (error.response?.status === 404) {
      errorMessage = "Refunds endpoint not found. Please contact support.";
    } else if (error.response?.status === 403) {
      errorMessage = "You don't have permission to view refunds.";
    } else if (error.response?.status === 401) {
      errorMessage = "Authentication required. Please login again.";
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (!error.response && error.request) {
      errorMessage = "Network error. Please check your internet connection and try again.";
    }

    setError(errorMessage);
    setRefunds([]);
  };

  const filterRefunds = (refundsList) => {
    return refundsList.filter(refund => {
      const matchesStatus = filterStatus === "all" ||
        refund.status.toLowerCase() === filterStatus.toLowerCase();

      return matchesStatus;
    });
  };

  const handleStatusUpdate = async (refundId, newStatus) => {
    try {
      const result = await Swal.fire({
        title: `${newStatus} Refund?`,
        text: `Are you sure you want to ${newStatus.toLowerCase()} this refund request?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#1a8287',
        cancelButtonColor: '#6b7280',
        confirmButtonText: `Yes, ${newStatus}!`
      });

      if (result.isConfirmed) {
        // Call API to update status
        const statusId = newStatus === 'Approve' ? STATUS_MAPPING.approved : STATUS_MAPPING.rejected;
        
        await axiosInstance.post(API_ENDPOINTS.REFUND_SAVE_STATUS, {
          refundRequestId: refundId,
          newStatus: statusId,
          actualDate: new Date().toISOString(),
          notes: `Status updated to ${newStatus}`,
          userId: getUserId()
        });

        // Refresh data after update
        await fetchRefundsData();

        Swal.fire({
          title: 'Updated!',
          text: `Refund has been ${newStatus.toLowerCase()}d.`,
          icon: 'success',
          timer: 2000
        });
      }
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: error.response?.data?.message || 'Failed to update refund status.',
        icon: 'error'
      });
    }
  };

  const handleEditRefund = (refund) => {
    // Navigate to edit page or open edit modal
    // For now, just show an alert
    Swal.fire({
      title: 'Edit Refund',
      text: `Edit functionality for refund ID: ${refund.id}`,
      icon: 'info'
    });
  };

  const handleDeleteRefund = async (refundId) => {
    try {
      const result = await Swal.fire({
        title: 'Delete Refund?',
        text: 'Are you sure you want to delete this refund request? This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, Delete!'
      });

      if (result.isConfirmed) {
        // Call API to delete refund
        await axiosInstance.delete(`${API_ENDPOINTS.REFUND_DELETE}?id=${refundId}`);
        
        // Refresh data after deletion
        await fetchRefundsData();

        Swal.fire({
          title: 'Deleted!',
          text: 'Refund has been deleted.',
          icon: 'success',
          timer: 2000
        });
      }
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: error.response?.data?.message || 'Failed to delete refund.',
        icon: 'error'
      });
    }
  };

  const fetchStatusLogs = async (refundId) => {
    setLogsLoading(true);
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.REFUND_STATUS_LOGS, {
        params: { refundRequestId: refundId }
      });

      setStatusLogs(response.data || []);
    } catch (error) {
      setStatusLogs([]);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleAddStatus = (refund) => {
    setSelectedStatusBooking(refund);
    setStatusDate(new Date().toISOString().split('T')[0]);
    setStatusType("initiated");
    setStatusNote("");
    setShowAddStatusModal(true);
    fetchStatusLogs(refund.id);
  };

    const handleResetFilters = async () => {
    setFilterStatus("0");   // reset dropdown to "All Status"
    setCurrentPage(1);

    await fetchRefundsData();
  };

  const submitAddStatus = async () => {
    if (!statusDate.trim() || !statusNote.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Missing Information",
        text: "Please fill in all required fields.",
      });
      return;
    }

    setStatusLoading(true);
    try {
      const payload = {
        refundRequestId: selectedStatusBooking.id,
        newStatus: STATUS_MAPPING[statusType] || 0,
        actualDate: new Date(statusDate).toISOString(),
        notes: statusNote,
        userId: getUserId()
      };

      // console.log('Sending refund status payload:', payload);
      // console.log('API Endpoint:', API_ENDPOINTS.REFUND_SAVE_STATUS);

      const response = await axiosInstance.post(API_ENDPOINTS.REFUND_SAVE_STATUS, payload);
      
      // console.log('Refund status response:', response);

      setShowAddStatusModal(false);
      setSelectedStatusBooking(null);
      setStatusDate("");
      setStatusType("initiated");
      setStatusNote("");

      Swal.fire({
        icon: "success",
        title: "Status Added",
        text: "Status has been successfully added.",
        timer: 3000,
        showConfirmButton: false
      });

      // Refresh the list
      fetchRefundsData();
    } catch (error) {
      // console.error('Refund status error:', error);
      // console.error('Error response:', error.response);
      
      let errorMessage = "Failed to add status. Please try again.";
      let errorTitle = "Status Addition Failed";

      if (error.response?.status === 404) {
        errorTitle = "API Endpoint Not Found";
        errorMessage = "The refund status endpoint is not available on the server. Please contact your system administrator.";
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || "Invalid data. Please check all fields and try again.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Swal.fire({
        icon: "error",
        title: errorTitle,
        text: errorMessage,
        confirmButtonText: "OK"
      });
    } finally {
      setStatusLoading(false);
    }
  };

  const filteredRefunds = filterRefunds(refunds);
  const totalPages = Math.ceil(filteredRefunds.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRefunds = filteredRefunds.slice(startIndex, endIndex);

  return (
    <BookingWrapper className="dashboard-container">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="refund-list-header-content">
          <div className="refund-list-header-text">
            <h2>Refund Management</h2>
            <p className="refund-list-subtitle">Manage and process booking refund requests</p>
          </div>
        </div>
        <div className="refund-list-header-actions">
          <PropertyNavigation />
        </div>
      </div>

      {/* Main Content Card */}
      <div className="refund-content-card">
        {/* Filters Section */}
        <div className="refund-filters">
          <div className="filter-group">
            <label>Filter by Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="form-select"
            >
              <option value="0">All Status</option>
              <option value="1">Pending</option>
              <option value="2">Approved</option>
              <option value="3">Rejected</option>
              <option value="4">Processed</option>
              <option value="5">Completed</option>
            </select>
          </div>
           <div className="filter-group">
              <br />
              <div style={{ display: "flex", gap: "10px" }}>

                {/* Search Button */}
                <button
                  className="primary-btn"
                  type="button"
                  onClick={fetchRefundsData}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                  <span>Search</span>
                </button>

                {/* ✅ Reset Button with Icon */}
                <button
                  className="primary-btn"
                  type="button"
                  onClick={handleResetFilters}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M3 12a9 9 0 1 0 3-6.7"></path>
                    <polyline points="3 3 3 9 9 9"></polyline>
                  </svg>
                  <span>Reset</span>
                </button>

              </div>
            </div>
          </div>

        {/* Results Summary with Enhanced Stats */}
        {/* <div className="results-summary">
          
          {filteredRefunds.length > 0 && (
            <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#6b7280' }}>
              <span>⏳ Pending: {filteredRefunds.filter(r => r.status.toLowerCase() === 'pending').length}</span>
              <span>✅ Approved: {filteredRefunds.filter(r => r.status.toLowerCase() === 'approved').length}</span>
              <span>❌ Rejected: {filteredRefunds.filter(r => r.status.toLowerCase() === 'rejected').length}</span>
            </div>
          )}
        </div> */}

        {/* Loading State */}
        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading refunds...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="error-container">
            <div>
              <p><strong>Error loading refunds:</strong></p>
              <p>{error}</p>
              <button onClick={fetchRefundsData}>
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Refunds Table */}
        {!loading && !error && (
          <div className="refund-table-container">
            <table className="refund-table">
              <colgroup>
                <col style={{ width: '12%' }} />
                <col style={{ width: '18%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '18%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '13%' }} />
                <col style={{ width: '10%' }} />
              </colgroup>
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Customer</th>
                  <th>Plot</th>
                  <th>Township</th>
                  <th>Refund Amount</th>
                  <th>Status</th>
                  <th>Requested Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {refunds.length > 0 ? (
                  refunds.map((refund) => (
                    <tr key={refund.id}>
                      <td className="booking-id">{refund.bookingId}</td>
                      <td>{refund.bookingInfo?.customerName || "N/A"}</td>
                      <td>{refund.bookingInfo?.plotNumber || "N/A"}</td>
                      <td>{refund.bookingInfo?.townshipName || "N/A"}</td>
                      <td className="amount">₹{refund.refundAmount.toLocaleString()}</td>
                      <td>
                        <span className={`status-badge ${refund.status.toLowerCase()}`}>
                          {refund.status}
                        </span>
                      </td>
                      <td>{formatDisplayDate(refund.cancelledOn)}</td>
                      <td>
                        <button
                          className="primary-btn"
                          onClick={() => handleAddStatus(refund)}
                          title="Add Status Update"
                        >
                          Add Status
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="no-data">
                      No refund requests found for the selected criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && filteredRefunds.length > itemsPerPage && (
          <div className="pagination">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              Previous
            </button>

            <div className="pagination-info">
              Page {currentPage} of {totalPages}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Enhanced Add Status Modal */}
      <SmallModal
        show={showAddStatusModal}
        onClose={() => {
          if (!statusLoading) {
            setShowAddStatusModal(false);
            setSelectedStatusBooking(null);
            setStatusDate("");
            setStatusType("initiated");
            setStatusNote("");
          }
        }}
      >
        <div className="simple-add-status-modal">
          {/* Modal Header */}
          <div className="simple-add-status-header">
            <p className="add-status-message">
              Add status update for booking <strong>#{selectedStatusBooking?.bookingId || selectedStatusBooking?.id}</strong>
            </p>
          </div>

          {/* Status Form */}
          {selectedStatusBooking && (
            <div className="add-status-form">
              <h4>Status Information</h4>

              <div className="status-form-grid">
                <div className="form-item">
                  <label htmlFor="status-date">
                    Status Date <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    id="status-date"
                    value={statusDate}
                    onChange={(e) => setStatusDate(e.target.value)}
                    className="simple-input"
                    disabled={statusLoading}
                  />
                </div>

                <div className="form-item">
                  <label htmlFor="status-type">
                    Status Type <span className="required">*</span>
                  </label>
                  <select
                    id="status-type"
                    value={statusType}
                    onChange={(e) => {
                      setStatusType(e.target.value);
                    }}
                    className="simple-select"
                    disabled={statusLoading}
                  >
                    <option value="initiated">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div className="form-item">
                  <label htmlFor="refund-amount">
                    Refund Amount <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    id="refund-amount"
                    value={selectedStatusBooking?.refundAmount || 0}
                    className="simple-input"
                    disabled
                    readOnly
                    style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                  />
                </div>

                <div className="form-item">
                  <label htmlFor="status-note">
                    Status Note <span className="required">*</span>
                  </label>
                  <textarea
                    id="status-note"
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    className="simple-textarea"
                    placeholder="Enter detailed status note..."
                    disabled={statusLoading}
                    rows="3"
                  ></textarea>
                </div>
              </div>

              <div className="add-status-actions">
                <button
                  className="cancel-btn"
                  onClick={() => setShowAddStatusModal(false)}
                  disabled={statusLoading}
                >
                  Cancel
                </button>
                <button
                  className="submit-btn"
                  onClick={submitAddStatus}
                  disabled={statusLoading}
                >
                  {statusLoading ? (
                    <>
                      <span className="spinner-small"></span> Saving...
                    </>
                  ) : (
                    'Save Status'
                  )}
                </button>
              </div>

              {/* Status History Section */}
              <div className="status-history-section" style={{ marginTop: '20px', borderTop: '1px solid #ddd', paddingTop: '15px' }}>
                <h4>Status History</h4>

                {logsLoading ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                    Loading history...
                  </div>
                ) : statusLogs.length > 0 ? (
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Status</th>
                          <th>Changed By</th>
                          <th>Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {statusLogs.map((log, index) => (
                          <tr key={index}>
                            <td>{formatDisplayDate(log.statusChangedOn)}</td>
                            <td>
                              <span className={`status-badge ${log.status?.toLowerCase() || 'default'}`}>
                                {log.status}
                              </span>
                            </td>
                            <td>{log.statusChangedBy}</td>
                            <td style={{ maxWidth: '200px', wordWrap: 'break-word' }}>{log.notes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p style={{ color: '#666', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>
                    No status history available.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </SmallModal>
    </BookingWrapper>
  );
}