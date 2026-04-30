import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BookingWrapper from "./style";
import axiosInstance from "../../utilities/axiosInstance";
import API_ENDPOINTS from "../../utilities/apiConfig";
import ReminderPopup from "../../components/ReminderPopup";
import "./ReceiptVerification.css";
import Swal from "sweetalert2";

export default function ReceiptVerification() {
    const navigate = useNavigate();
    const [clicked, setClicked] = useState(false);
    const [receipts, setReceipts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showReminderPopup, setShowReminderPopup] = useState(false);
    const [selectedReason, setSelectedReason] = useState("");
    const [customReason, setCustomReason] = useState("");
    const [searchLoading, setSearchLoading] = useState(false);
    // Popup states
    const [showApprovePopup, setShowApprovePopup] = useState(false);
    const [showRejectPopup, setShowRejectPopup] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [rejectDate, setRejectDate] = useState("");
    const [rejectReasonOption, setRejectReasonOption] = useState("");
    const [rejectionReason, setRejectionReason] = useState("");
    const [approvalReason, setApprovalReason] = useState("");
    const [approvalDate, setApprovalDate] = useState("");
    const [processing, setProcessing] = useState(false);
    const itemsPerPage = 10;
const [townships, setTownships] = useState([]);
const [currentPage, setCurrentPage] = useState(1);

const totalPages = Math.ceil(receipts.length / itemsPerPage);

const indexOfLastItem = currentPage * itemsPerPage;
const indexOfFirstItem = indexOfLastItem - itemsPerPage;

const currentReceipts = receipts.slice(indexOfFirstItem, indexOfLastItem);
const [searchParams, setSearchParams] = useState({
    
    plotNo: '' ,
    townshipId:0
    
  });
const paginate = (pageNumber) => {
  setCurrentPage(pageNumber);
};

    const paymentModes = [
        { value: "1", label: "Bank Transfer" },
        { value: "2", label: "Cheque" },

        { value: "4", label: "UPI" },
        { value: "5", label: "NEFT/RTGS" },
        { value: "6", label: "Demand Draft" }
    ];

    const reasonOptions = [
        "Payment by Cheque credited to A/C ",
        "Payment by DD credited to A/C",
        "Payment by UPI credited to A/C",
        "Payment by NEFT/RTGS credited to A/C",
        "Other"
    ];

    const rejectReasonOptions = [
        "Insufficient Funds",
        "Signature Mismatch",
        "Alteration/Correction",
        "Expired cheque",
        "Post dated cheque",
        "Incorrect information",
        "Unendorsed cheque",
        "Bank specific policy",
        "Other"
    ];



    useEffect(() => {
        fetchAllReceipts();
          fetchTownshipList();
    }, []);

    const getUserId = () => {
        const stored = localStorage.getItem("userId") || localStorage.getItem("spendwise_userId");
        const parsed = stored ? Number(stored) : NaN;
        return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
    };
    const createSeacrhParams=()=>{

   
      const queryParams = new URLSearchParams();
      if (searchParams.townshipId)
        queryParams.append('townshipId', searchParams.townshipId) || '';
      if (searchParams.bookingType)
        queryParams.append('bookingType', searchParams.bookingType || '');
      if (searchParams.bookingStatus)
        queryParams.append('bookingStatus', searchParams.bookingStatus || '');
      if (searchParams.reraNo)
        queryParams.append('reraNo', searchParams.reraNo || '');
      if (searchParams.plotNo && searchParams.plotNo.trim())
        queryParams.append('plotNo', searchParams.plotNo.trim());
      if (searchParams.fromDate)
        queryParams.append('fromDate', searchParams.fromDate || '');

      queryParams.append('userId', getUserId());

      //local store search criteria
       let searchObj = { 
          'plotNo': searchParams.plotNo?.trim() || '', 
          'userId': getUserId()
       }; 
      localStorage.setItem("searchCriteria",JSON.stringify( searchObj));
      return queryParams;
  }
   const fetchTownshipList = async () => {
            const townshipsResponse = await axiosInstance.get(
                    API_ENDPOINTS.TOWNSHIP_LIST+"?userId="+getUserId()
                );
             
                setTownships(townshipsResponse.data);
        };


    const fetchAllReceipts = async () => {
        setLoading(true);
        setError(null);

          const queryParams =  createSeacrhParams(); 
        try {
             const apiUrl = `${API_ENDPOINTS.RECEIPT_VERIFICATION_REQUESTS}?${queryParams.toString()}`;
            const response = await axiosInstance.get(apiUrl);
             
            let receiptList = [];
            if (Array.isArray(response.data)) {
                receiptList = response.data;
            } else if (response.data?.value) {
                receiptList = response.data.value;
            } else if (response.data?.data) {
                receiptList = response.data.data;
            }

            // Enhance receipt data with booking details if plotNo is missing
            const enhancedReceipts = await Promise.all(
                receiptList.map(async (receipt) => {
                    // If plotNo is missing or invalid, fetch booking details
                    if (!receipt.plotNo || receipt.plotNo === 'string' || receipt.plotNo === 'null') {
                        try {
                            const bookingResponse = await axiosInstance.get(
                                `${API_ENDPOINTS.GET_BOOKING_BY_ID}?id=${receipt.bookingId}`
                            );
                            const bookingData = bookingResponse.data;

                            return {
                                ...receipt,
                                plotNo: bookingData.plotNo || bookingData.PlotNo || bookingData.plot_no || 'N/A',
                                customerName: receipt.customerName || bookingData.clientName || 'N/A',
                                townshipName: bookingData.townshipName || bookingData.TownshipName || 'N/A'
                            };
                        } catch (err) {
                            console.error(`Error fetching booking details for receipt ${receipt.id}:`, err);
                            return receipt;
                        }
                    }
                    return receipt;
                })
            );

            setReceipts(enhancedReceipts);
        } catch (err) {
            console.error("Error fetching receipts:", err);
            setError("Failed to load receipt verification requests");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (receiptId) => {
        const receipt = receipts.find(r => r.id === receiptId);
        setSelectedReceipt(receipt);
        setShowApprovePopup(true);
    };

    const handleReject = async (receiptId) => {
        const receipt = receipts.find(r => r.id === receiptId);
        setSelectedReceipt(receipt);
        setShowRejectPopup(true);
    };

    const confirmApprove = async () => {

        if (!selectedReceipt) return;

        if (!approvalDate) {
            Swal.fire({
                icon: "warning",
                title: "Date Required",
                text: "Please select date"
            });
            return;
        }

        if (!selectedReason) {
            Swal.fire({
                icon: "warning",
                title: "Reason Required",
                text: "Please select approval reason"
            });
            return;
        }

        if (selectedReason === "Other" && !approvalReason.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Note Required",
                text: "Please enter note for 'Other' reason"
            });
            return;
        }

        setProcessing(true);

        try {

            await axiosInstance.post(API_ENDPOINTS.RECEIPT_VERIFY, {
                receiptId: selectedReceipt.id,
                status: 1,
                approvalReason: selectedReason === "Other"
                    ? approvalReason
                    : selectedReason,
                approvalDate: approvalDate,
                userId: getUserId()
            });

            setReceipts(prev => prev.filter(r => r.id !== selectedReceipt.id));

            closePopups();

            Swal.fire({
                icon: "success",
                title: "Approved",
                text: "Receipt approved successfully"
            });

        } catch (err) {

            console.error(err);

            Swal.fire({
                icon: "error",
                title: "Approval Failed",
                text: "Failed to approve receipt. Please try again."
            });

        } finally {

            setProcessing(false);

        }

    };
    const confirmReject = async () => {
        if (clicked) return; 
        setClicked(true);
        if (!selectedReceipt) return;

        if (!rejectDate) {
            Swal.fire({
                icon: "warning",
                title: "Date Required",
                text: "Please select reject date"
            });
            return;
        }

        if (!rejectReasonOption) {
            Swal.fire({
                icon: "warning",
                title: "Reason Required",
                text: "Please select reject reason"
            });
            return;
        }

        if (rejectReasonOption === "Other" && !rejectionReason.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Note Required",
                text: "Please enter note for 'Other' reason"
            });
            return;
        }

        setProcessing(true);

        try {

            await axiosInstance.post(API_ENDPOINTS.RECEIPT_VERIFY, {
                receiptId: selectedReceipt.id,
                status: 2,
                rejectReason: rejectionReason,
                userId: getUserId()
            });

            setReceipts(prev => prev.filter(r => r.id !== selectedReceipt.id));

            setShowRejectPopup(false);
            setSelectedReceipt(null);
            setRejectionReason("");

            Swal.fire({
                icon: "success",
                title: "Rejected",
                text: "Receipt rejected successfully"
            });

        } catch (err) {
            setClicked(false);
            console.error(err);

            Swal.fire({
                icon: "error",
                title: "Reject Failed",
                text: "Failed to reject receipt. Please try again."
            });

        } finally {

            setProcessing(false);

        }

    };

    const handleResetFilters = async () => {
    const resetParams = {
        plotNo: '',
        townshipId: 0
    };

    setSearchParams(resetParams);
    setCurrentPage(1);
    localStorage.removeItem("searchCriteria");

    const queryParams = new URLSearchParams();
    queryParams.append('userId', getUserId());

    await fetchAllReceipts(queryParams);
    };

    const closePopups = () => {
        setShowApprovePopup(false);
        setShowRejectPopup(false);
        setSelectedReceipt(null);
        setRejectionReason("");
        setApprovalReason("");
    };

    const searchReceipts = async (showSuccessModal = true) => {
    setSearchLoading(true);
    setError(null);

    try {
          
        fetchAllReceipts();
      
      }
     catch (error) {
     
      setError(error.message || 'Failed to search receipts');
      setBookings([]);

      let errorMessage = 'Failed to search receipts. Please try again.';

      if (error.response?.status === 404) {
        errorMessage =
          'Search endpoint not found. Please contact administrator.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error occurred. Please try again later.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (
        error.name === 'TypeError' &&
        error.message.includes('Cannot read properties of undefined')
      ) {
        errorMessage =
          'Invalid data received from server. Please try again or contact support.';
      }
 
      const queryParams = createSeacrhParams();
        loadData(showSuccessModal, queryParams);
    } finally {
        setSearchLoading(false);
    }
  };
    // Handle ESC key to close popups
    useEffect(() => {
        const handleEscKey = (event) => {
            if (event.key === 'Escape') {
                closePopups();
            }
        };

        if (showApprovePopup || showRejectPopup) {
            document.addEventListener('keydown', handleEscKey);
            return () => {
                document.removeEventListener('keydown', handleEscKey);
            };
        }
    }, [showApprovePopup, showRejectPopup]);

    const displayValue = (value) => {
        if (!value) return "-";
        const v = String(value).trim();
        if (v === "" || v.toLowerCase() === "-" || v.toLowerCase() === "undefined" || v.toLowerCase() === "string" || v.toLowerCase() === "-") {
            return "-";
        }
        return value;
    };

    return (
        <BookingWrapper className="dashboard-container">
            {/* Header */}
            <div className="dashboard-header">
                <div className="dashboard-header-content">
                    <div>
                        <h1 className="dashboard-title">Pending Receipt Verification Requests</h1>
                        <p className="dashboard-subtitle">Review and verify pending receipts</p>
                    </div>

                </div>
                <div className="header-buttons">
                    {/* <button 
                        className="primary-btn" 
                        onClick={() => navigate('/property')}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                            <path d="M9 12h6m-6 4h6"></path>
                        </svg>
                        Booking List
                    </button> */}
                    <button
                        className="primary-btn"
                        onClick={() => setShowReminderPopup(true)}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                        </svg>
                        Reminder
                    </button>
                </div>
            </div>

 <div className="card dashboard-filters-card">
        <div className="dashboard-filters"> 
           <div className="filter-group">
            <label htmlFor="search-township-filter">
              {/* <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg> */}
              Township
            </label>
            <select
              id="search-township-filter"
              className="form-control"
              value={searchParams.townshipId}
              onChange={(e) =>
                setSearchParams((prev) => ({
                  ...prev,
                  townshipId: e.target.value,
                }))
              }
            >
              <option value="">Select Township</option>
              {townships.map((township) => (
                <option key={township.id} value={township.id}>
                  {township.name}
                </option>
              ))}
            </select>
          </div>
           
          <div className="filter-group ">
            <label htmlFor="search-plot-no">
              Plot No.
            </label>
           <div className="d-flex gap-2">

  <input
    type="text"
    id="search-plot-no"
    className="form-control"
    placeholder="Plot Number..."
    value={searchParams.plotNo}
    onChange={(e) =>
      setSearchParams((prev) => ({
        ...prev,
        plotNo: e.target.value,
      }))
    }
  />

  {/* Search Button */}
  <button
    className="primary-btn"
    type="button"
    onClick={searchReceipts}
    disabled={searchLoading}
    style={{
      cursor: searchLoading ? 'not-allowed' : 'pointer',
    }}
  >
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"></circle>
      <path d="m21 21-4.35-4.35"></path>
    </svg>
    <span>{searchLoading ? 'Searching...' : 'Search'}</span>
  </button>

  {/* ✅ Reset Button with Icon */}
  <button
    type="button"
    className="primary-btn"
    onClick={handleResetFilters}
  >
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 12a9 9 0 1 0 3-6.7"></path>
      <polyline points="3 3 3 9 9 9"></polyline>
    </svg>
    <span>Reset</span>
  </button>

</div>
            
          </div>
         
          <div className="filter-group">
            
          </div>
           {/* <div className="filter-group">
            <button
              className="primary-btn"
              type="button"
              onClick={searchReceipts}
              disabled={searchLoading}
              style={{
                cursor: searchLoading
                  ? 'not-allowed'
                  : 'pointer',
              }}
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
              <span>
               Reset
              </span>
            </button>
          </div> */}
        </div>
      </div>
            {/* Receipt Table */}
            <div className="card">
                <div className="dashboard-table-header">
                    <h3 className="dashboard-table-title">Pending Receipts ({receipts.length})</h3>
                </div>


                <div className="table-wrapper">
                    {loading ? (
                        <div className="loading-state">
                            <p>Loading receipts...</p>
                        </div>
                    ) : error ? (
                        <div className="error-state">
                            <p>{error}</p>
                            <button className="primary-btn" onClick={fetchAllReceipts}>
                                Retry
                            </button>
                        </div>
                    ) : receipts.length === 0 ? (
                        <div className="empty-state">
                            <p>No receipts pending verification</p>
                        </div>
                    ) : (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Booking ID</th>
                                    <th>Customer  </th>
                                
                                    <th>Amount</th>
                                    <th>Receipt Date</th>
                                    <th>Payment Detail</th>
                                  
                                  
                                    <th>Notes</th>
                                    <th>Requested By</th>
                                    <th>Requested On</th>

                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {currentReceipts.map((receipt) => {
                                    const methodValue = displayValue(receipt.receiptMethod);
                                    const method = methodValue !== "-"
                                        ? (paymentModes.find(m => m.value === String(methodValue))?.label || methodValue)
                                        : "-";

                                    return (
                                        <tr key={receipt.id}>
                                            <td>
                                                
                                                <span onClick={() => navigate(`/booking-summery-report/${receipt.bookingId}`)}  style={{
                                                cursor: "pointer",
                                                color: "#2563eb",
                                                fontWeight: "600",
                                                textDecoration: "underline"
                                                }}>{receipt.bookingId}</span>
                                            
                                                <p>
                                                {receipt.townshipName}</p>

                                            </td>
                                            <td>{displayValue(receipt.customerName)}
                                            <p>Plot No: {displayValue(receipt.plotNo)}</p>

                                            </td>
                                           
                                            <td>
                                                ₹{parseFloat(receipt.amount || 0).toLocaleString("en-IN", {
                                                    minimumFractionDigits: 2
                                                })}
                                            </td>
                                            <td>
                                                {receipt.receiptDate
                                                    ? new Date(receipt.receiptDate).toLocaleDateString("en-IN")
                                                    : "-"}
                                            </td>
                                            <td>{method}
                                                <p> Trans Id: {displayValue(receipt.transactionId)} </p>
                                                <p>Bank: {displayValue(receipt.bankName)}</p>  

                                            </td>
                                            
                                             
                                            <td>{displayValue(receipt.notes)}</td>
                                            <td>{displayValue(receipt.requestedByName)}</td>
                                            <td>
                                                {receipt.requestedOn
                                                    ? new Date(receipt.requestedOn).toLocaleDateString("en-IN")
                                                    : "-"}
                                            </td>

                                            <td>
                                                <div className="d-flex gap-2">
                                                    <button
                                                        className="primary-btn"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handleApprove(receipt.id);
                                                        }}
                                                        type="button"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        className="primary-btn"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handleReject(receipt.id);
                                                        }}
                                                        type="button"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        
                    )}
                </div>
                {receipts.length > itemsPerPage && (
  <div
    className="pagination-controls"
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: '20px',
      gap: '15px',
      paddingBottom: '20px',
    }}
  >
    <button
      onClick={() => paginate(currentPage - 1)}
      disabled={currentPage === 1}
      className="primary-btn"
    >
      Previous
    </button>

    <span style={{ fontSize: '14px', color: '#666' }}>
      Page <strong>{currentPage}</strong> of{' '}
      <strong>{totalPages}</strong>
    </span>

    <button
      onClick={() => paginate(currentPage + 1)}
      disabled={currentPage === totalPages}
      className="primary-btn"
    >
      Next
    </button>
  </div>
)}
            </div>

            {/* Approve Popup */}
            {showApprovePopup && (
                <div className="modal-overlay" onClick={(e) => e.target.className === 'popup-overlay' && closePopups()}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Approve Receipt</h3>
                            <button className="modal-close-btn" onClick={closePopups}>×</button>
                        </div>
                        <div className="">
                            {selectedReceipt && (
                                <div className="receipt-details">
                                    <div className="row">
                                        <div className="col-6">

                                            <p><strong>Booking ID:</strong> {selectedReceipt.bookingId}</p>
                                            <p><strong>Township:</strong> {selectedReceipt.townshipName || "-"}</p>

                                            <p><strong>Amount:</strong> ₹{parseFloat(selectedReceipt.amount || 0).toLocaleString("en-IN")}</p>
                                        </div>
                                        <div className="col-6">
                                            <p><strong>Customer:</strong> {selectedReceipt.customerName}</p>
                                            <p><strong>Plot No:</strong> {selectedReceipt.plotNo}</p>
                                            <p><strong>Transaction ID:</strong> {selectedReceipt.transactionId || "-"}</p>

                                        </div>
                                    </div>


                                </div>
                            )}
                            <div className="rejection-reason">
                                <label htmlFor="approvalDate">Date <span style={{ color: "red" }}>*</span></label>
                                <input
                                    id="approvalDate"
                                    type="date"
                                    value={approvalDate}
                                    onChange={(e) => setApprovalDate(e.target.value)}
                                    disabled={processing}
                                    className="form-control"
                                />
                            </div>
                            <div className="rejection-reason">
                                <label htmlFor="approvalReason">Reason <span style={{ color: "red" }}>*</span></label>

                                <select
                                    id="approvalReason"
                                    value={selectedReason}
                                    onChange={(e) => {
                                        setSelectedReason(e.target.value);
                                        if (e.target.value !== "Other") {
                                            setCustomReason("");
                                        }
                                    }}
                                    disabled={processing}
                                    className="form-control"
                                >
                                    <option value="">-- Select Reason --</option>
                                    {reasonOptions.map((reason, index) => (
                                        <option key={index} value={reason}>
                                            {reason}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="rejection-reason">
                                <label htmlFor="approvalReason">Note {selectedReason === "Other" && <span style={{ color: "red" }}>*</span>}</label>
                                <textarea
                                    id="approvalReason"
                                    value={approvalReason}
                                    onChange={(e) => setApprovalReason(e.target.value)}
                                    placeholder="Please enter other reason for approval..."
                                    rows="4"
                                    disabled={processing}
                                    className="form-control"
                                />
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button
                                className="primary-btn"
                                onClick={closePopups}
                                disabled={processing}
                            >
                                Cancel
                            </button>
                            <button
                                className="primary-btn"
                                onClick={confirmApprove}
                                disabled={
                                    processing ||
                                    !selectedReason ||
                                    (selectedReason === "Other" && !approvalReason.trim())
                                }
                            >
                                {processing ? "Processing..." : "Approve"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Popup */}
            {showRejectPopup && (
                <div className="modal-overlay" onClick={(e) => e.target.className === 'popup-overlay' && closePopups()}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Reject Receipt</h3>
                            <button className="close-btn" onClick={closePopups}>×</button>
                        </div>
                        <div className="">
                            {selectedReceipt && (
                                <div className="receipt-details">
                                    <div className="row">
                                        <div className="col-6">
                                            <p><strong>Booking ID:</strong> {selectedReceipt.bookingId}</p>
                                            <p><strong>Township:</strong> {selectedReceipt.townshipName || "-"}</p>
                                            <p><strong>Amount:</strong> ₹{parseFloat(selectedReceipt.amount || 0).toLocaleString("en-IN")}</p>
                                        </div>
                                        <div className="col-6">
                                            <p><strong>Customer:</strong> {selectedReceipt.customerName}</p>
                                            <p><strong>Plot No:</strong> {selectedReceipt.plotNo}</p>
                                            <p><strong>Transaction ID:</strong> {selectedReceipt.transactionId || "-"}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="rejection-reason">
                                <label>Date <span style={{ color: "red" }}>*</span></label>
                                <input
                                    type="date"
                                    value={rejectDate}
                                    onChange={(e) => setRejectDate(e.target.value)}
                                    className="form-control"
                                />
                            </div>
                            <div className="rejection-reason">
                                <label>Reason <span style={{ color: "red" }}>*</span></label>

                                <select
                                    value={rejectReasonOption}
                                    onChange={(e) => {
                                        setRejectReasonOption(e.target.value)
                                        if (e.target.value !== "Other") {
                                            setRejectionReason("")
                                        }
                                    }}
                                    className="form-control"
                                >

                                    <option value="">-- Select Reason --</option>

                                    {rejectReasonOptions.map((r, i) => (
                                        <option key={i} value={r}>{r}</option>
                                    ))}

                                </select>
                            </div>
                            <div className="rejection-reason">
                                <label htmlFor="rejectionReason">Note {rejectReasonOption === "Other" && <span style={{ color: "red" }}>*</span>}</label>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Enter note"
                                    disabled={processing}
                                    className="form-control"
                                />
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button
                                className="primary-btn"
                                onClick={closePopups}
                                disabled={processing}
                            >
                                Cancel
                            </button>
                            <button
                                className="primary-btn"
                                onClick={confirmReject}
                                disabled={
                                    processing ||
                                    !rejectReasonOption ||
                                    (rejectReasonOption === "Other" && !rejectionReason.trim())
                                }
                            >
                                {processing ? "Processing..." : "Reject"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ReminderPopup
                isOpen={showReminderPopup}
                onClose={() => setShowReminderPopup(false)}
                title="Reminder List"
            />
        </BookingWrapper>
    );
}