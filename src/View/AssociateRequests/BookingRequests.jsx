import { useEffect, useState } from "react";
import axiosInstance from "../../utilities/axiosInstance";
import API_ENDPOINTS from "../../utilities/apiConfig";
import Swal from "sweetalert2";
import { FiX } from "react-icons/fi";

const AssociateBookingRequests = () => {

  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    townshipId: "",
    status: ""
  });
  const adminId = Number(localStorage.getItem("userId"));
  console.log("Admin ID 👉", adminId);

  const [townshipList, setTownshipList] = useState([]);

  const [selectedItem, setSelectedItem] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [remarks, setRemarks] = useState("");

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "0", label: "Pending" },
    { value: "1", label: "Approved" },
    { value: "2", label: "Rejected" },
    
  ];

  //  Fetch Township
  useEffect(() => {
    const fetchTownships = async () => {
      try {
        const res = await axiosInstance.get(API_ENDPOINTS.TOWNSHIP_LIST);
        const list = res.data || [];
        setTownshipList(list);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTownships();
  }, []);

  //  Fetch List
  const fetchList = async () => {
  setLoading(true);

  try {
    let url = API_ENDPOINTS.GET_BOOKING_REQUESTS;

    const params = [];

    //  Backend expects associateId + requestStatus
    if (filters.townshipId) {
      params.push(`associateId=${filters.townshipId}`);
    }

    if (filters.status) {
      params.push(`requestStatus=${filters.status}`);
    }

    if (params.length > 0) {
      url += "?" + params.join("&");
    }

    console.log("📡 API URL =>", url);

    const res = await axiosInstance.get(url);

    console.log(" FULL RESPONSE =>", res);
    console.log(" DATA =>", res.data);

    setList(res.data?.data || []);
  } catch (err) {
    console.error(" API ERROR =>", err);
    setError("Failed to load data");
    setList([]);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchList();
  }, []);

  //  Approve
  const handleApprove = async () => {
  try {
    await axiosInstance.post(
      API_ENDPOINTS.APPROVE_REJECT_BOOKING_REQUEST,
      {
        requestId: selectedItem.id,
        isApproved: true,
        adminId: adminId, 
        rejectionReason: remarks || ""
      }
    );

    Swal.fire("Approved!", "Request approved successfully", "success");

    setShowApproveModal(false);
    setRemarks("");
    fetchList();
  } catch (err) {
    Swal.fire("Error", "Approve failed", "error");
  }
};

  //  Reject
  const handleReject = async () => {
  if (!remarks) {
    Swal.fire("Error", "Reject reason is required", "error");
    return;
  }

  try {
    await axiosInstance.post(
      API_ENDPOINTS.APPROVE_REJECT_BOOKING_REQUEST,
      {
        requestId: selectedItem.id,
        isApproved: false,
        adminId: adminId, 
        rejectionReason: remarks
      }
    );

    Swal.fire("Rejected!", "Request rejected successfully", "success");

    setShowRejectModal(false);
    setRemarks("");
    fetchList();
  } catch (err) {
    Swal.fire("Error", "Reject failed", "error");
  }
};

  return (
    <div className="dashboard-container">

      {/* HEADER */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Booking Requests</h1>
          <p className="dashboard-subtitle">Manage associate booking requests</p>
        </div>

        <button className="primary-btn" onClick={() => window.history.back()}>
          Back
        </button>
      </div>

      {/* FILTER CARD */}
      <div className="card">
        <div className="row">

          <div className="col-md-4">
            <select
              className="form-control"
              value={filters.townshipId}
              onChange={(e) =>
                setFilters(prev => ({ ...prev, townshipId: e.target.value }))
              }
            >
              <option value="">All Townships</option>
              {townshipList.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <select
              className="form-control"
              value={filters.status}
              onChange={(e) =>
                setFilters(prev => ({ ...prev, status: e.target.value }))
              }
            >
              {statusOptions.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <button className="primary-btn" onClick={fetchList}>
  Apply Filter
</button>
          </div>

        </div>
      </div>

      {/* TABLE CARD */}
      <div className="card">

        {loading ? (
          <p>Loading...</p>
        ) : list.length === 0 ? (
          <p>No data found</p>
        ) : (
            <div className="table-responsive">
                <table className="table">
            <thead>
              <tr>
                <th>Booking Amount / Type / Date </th>
                <th>Township / Plot</th>
                <th>Agreement Rate / Total Agreement Value</th>
                <th>Associate Name / RERA No / Contact</th>
                <th>Status</th>
                <th>Payment Details</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
  {list.map(item => (
    <tr key={item.id}>
      <td>{item.initialAmount} / {item.bookingType} / {item.createdOn?.split("T")[0]} </td>
      <td className="property-info">
                          <div className="property-name">
                            {item.townshipName || 'N/A'}
                          </div>
                          <div className="property-details">
                            Plot {item.plotNo || 'N/A'} /
                            {' '}{item.plotSize && item.plotSize !== 'N/A'
                              ? (String(item.plotSize).toLowerCase().includes('sq')
                                ? item.plotSize
                                : `${item.plotSize} sq.ft.`)
                              : 'N/A'}
                          </div>
                        </td>
      <td>{item.agreementValue} / {item.totalAgreementValue}</td>
      <td>{item.associateName} <br /> {item.associateReraNo} <br /> {item.associateContactNo}</td>
      <td>{item.requestStatusText}</td>
<td><button
          className="primary-btn"
          onClick={() => {
            setSelectedItem(item);
            setShowViewModal(true);
          }}
        >
          View
        </button></td>
      <td>
        

        <div className="d-flex gap-2">
  <button
    className="primary-btn"
    disabled={item.requestStatus !== 0}
    onClick={() => {
      setSelectedItem(item);
      setRemarks(""); 
      setShowApproveModal(true);
    }}
  >
    Approve
  </button>

  <button
    className="primary-btn"
    disabled={item.requestStatus !== 0}
    onClick={() => {
      setSelectedItem(item);
      setRemarks(""); 
      setShowRejectModal(true);
    }}
  >
    Reject
  </button>
</div>
      </td>
    </tr>
  ))}
</tbody>
          </table>
            </div>


          
        )}
      </div>

      {/* VIEW MODAL */}
      {showViewModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Booking Details</h3>
              <div className="modal-close-btn">
                <FiX  size={20} onClick={() => setShowViewModal(false)} />
              </div>
            </div>

            <p><b>Booking Type:</b> {selectedItem?.bookingType}</p>
            <p><b>Plot No:</b> {selectedItem?.plotNo}</p>
            <p><b>Total Value:</b> {selectedItem?.totalValue}</p>
            <p><b>Payment Method:</b> {selectedItem?.paymentMethod}</p>
            <p><b>RERA No:</b> {selectedItem?.reraNo}</p>
            <p><b>Contact No:</b> {selectedItem?.contactNo}</p>
          </div>
        </div>
      )}

      {/* APPROVE MODAL */}
      {showApproveModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Approve Request</h3>
              <div className="modal-close-btn" onClick={() => setShowApproveModal(false)}>
                <FiX  size={20}/>
              </div>
              
            </div>
            <div className="form-group">
                <label htmlFor="">Notes</label>
                <textarea
              placeholder="Remarks (optional)"
              className="form-control"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
            </div>

            
            <div className="modal-actions">
                <button className="primary-btn" onClick={handleApprove}>
                  Confirm Approve
                </button>

            </div>
            
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {showRejectModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Reject Request</h3>
              <div className="modal-close-btn" onClick={() => setShowRejectModal(false)}>
                <FiX  size={20}/>
              </div>
            </div>
            <div className="form-group">
                <label htmlFor="">Reject Reason <span className="required">*</span></label>
                <textarea
              placeholder="Enter reject reason"
              className="form-control"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
            </div>
            <div className="modal-actions">
                <button className="primary-btn" onClick={handleReject}>
                    Confirm Reject
                </button>   
            </div>

            
          </div>
        </div>
      )}

    </div>
  );
};
export default AssociateBookingRequests;