import { useEffect, useState } from "react";
import axiosInstance from "../../../utilities/axiosInstance";
import API_ENDPOINTS from "../../../utilities/apiConfig";
import Swal from "sweetalert2";
    import { Wrapper } from "./style";
    import AssociateBooking from "../AssociateBooking";
import { FiX } from "react-icons/fi";

const AssociateBookingList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
const [rejectReason, setRejectReason] = useState("");
const [selectedRequestId, setSelectedRequestId] = useState(null);

  const adminId = Number(localStorage.getItem("userId"));
  console.log("Admin ID 👉", adminId);

  // 🔥 Fetch Booking Requests
  const fetchRequests = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get(
        API_ENDPOINTS.GET_BOOKING_REQUESTS
      );

      console.log("API RESPONSE 👉", res.data);

      const raw = res?.data;

let list = [];

if (Array.isArray(raw)) {
  list = raw;
} else if (Array.isArray(raw?.data)) {
  list = raw.data;
} else if (Array.isArray(raw?.value)) {
  list = raw.value;
}

// ✅ ONLY PENDING SHOW
const filtered = list.filter(req => req.requestStatus === 0);

setRequests(filtered);

      setRequests(list);
    } catch (err) {
      Swal.fire("Error", "Failed to load requests", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // ✅ Approve
 const handleApprove = async (id) => {
  const confirm = await Swal.fire({
    title: "Approve Booking?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Yes, Approve",
  });

  if (!confirm.isConfirmed) return;

  try {
    const payload = {
      
      adminId: Number(adminId),
      isApproved: true,
      rejectionReason: "",
      
      requestId: Number(id)
    };

    console.log("PAYLOAD 👉", payload);

    await axiosInstance.post(
      API_ENDPOINTS.APPROVE_REJECT_BOOKING_REQUEST,
      payload
    );

    Swal.fire("Success", "Booking Approved", "success");
    fetchRequests();
  } catch (err) {
    console.log("ERROR 👉", err.response?.data);
    console.log("HEADERS 👉", err.response?.headers)

    Swal.fire(
      "Error",
      err.response?.data?.message || "Approval failed",
      "error"
    );
  }
};

  // ❌ Reject
 const handleRejectSubmit = async () => {
  if (!rejectReason.trim()) {
    Swal.fire("Validation", "Rejection reason required", "warning");
    return;
  }

  try {
    await axiosInstance.post(
  API_ENDPOINTS.APPROVE_REJECT_BOOKING_REQUEST,
  {
    requestId: Number(selectedRequestId),
    isApproved: false,
    adminId: Number(adminId),
    rejectionReason: rejectReason
  }
);

    Swal.fire("Rejected", "Booking Rejected", "success");

    setShowRejectModal(false);
    setRejectReason("");
    setSelectedRequestId(null);

    fetchRequests();
  } catch (err) {
    console.log("ERROR 👉", err.response?.data);
    Swal.fire("Error", "Rejection failed", "error");
  }
};

  return (
    <Wrapper className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">
          Associate Booking Requests
        </h1>
        <p className="dashboard-subtitle">Manage all associate booking requests</p>
        </div>
        
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Client Name</th>
              <th>Plot No</th>
              <th>Township</th>
              <th>Mobile</th>
              <th>Status</th>
              <th>Requested On</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center">
                  Loading...
                </td>
              </tr>
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">
                  No booking requests found
                </td>
              </tr>
            ) : (
              requests.map((req) => (
               <tr key={req.id}>
  <td>{req.clientName || "-"}</td>
  <td>{req.plotNo || "-"}</td>
  <td>{req.townshipName || "-"}</td>
  <td>{req.clientContactNo || "-"}</td>
  <td>
  {req.requestStatus === 0 && <span style={{color:'orange'}}>Pending</span>}
  {req.requestStatus === 1 && <span style={{color:'green'}}>Approved</span>}
  {req.requestStatus === 2 && <span style={{color:'red'}}>Rejected</span>}
</td>
  <td>
    {req.createdOn
      ? new Date(req.createdOn).toLocaleDateString()
      : "-"}
  </td>

  <td className="d-flex gap-2">
  <button
    className="primary-btn"
    onClick={() => handleApprove(req.id)}
    disabled={req.requestStatus !== 0}
    style={{
      opacity: req.requestStatus !== 0 ? 0.5 : 1,
      cursor: req.requestStatus !== 0 ? "not-allowed" : "pointer"
    }}
  >
    Approve
  </button>

  <button
    className="primary-btn"
    onClick={() => {
      if (req.requestStatus !== 0) return; // extra safety
      handleRejectClick(req.id);
      setShowRejectModal(true);
    }}
    disabled={req.requestStatus !== 0}
    style={{
      opacity: req.requestStatus !== 0 ? 0.5 : 1,
      cursor: req.requestStatus !== 0 ? "not-allowed" : "pointer"
    }}
  >
    Reject
  </button>
</td>
</tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {showRejectModal && (
  <div className="modal-overlay">
    <div className="modal-content">

      <div className="modal-header">
        <h3>Reject Booking</h3>
        <button
          className="modal-close-btn"
          onClick={() => setShowRejectModal(false)}
        >
          <FiX size={20} />
        </button>
      </div>

      <div className="form-group">
        <label>Rejection Reason</label>
        <textarea
          className="form-control"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Enter reason..."
        />
      </div>

      <div className="modal-actions gap-2">
        <button
          className="primary-btn"
          onClick={() => setShowRejectModal(false)}
        >
          Close
        </button>

        <button
          className="primary-btn"
          style={{ background: "#ef4444" }}
          onClick={handleRejectSubmit}
        >
          Submit
        </button>
      </div>

    </div>
  </div>
)}
    </Wrapper>
  );
};

export default AssociateBookingList;