import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Wrapper } from '../AdminView/style';
import axiosInstance from '../../utilities/axiosInstance';
import API_ENDPOINTS from '../../utilities/apiConfig';
import Lottie from 'lottie-react';
import Loading from '../../assets/Loading.json';
import ReminderPopup from '../../components/ReminderPopup';
 import { FiX } from "react-icons/fi";
 import Swal from "sweetalert2";
import getCurrentUser from '../../utilities/getCurrentUser';
import XediLoader from '../../components/XediLoader';
const ClosureRequests = () => {
  const [closureRequestList, setClosureRequestList] = useState([]);
 
  const [loading, setLoading] = useState(false);
  const [showReminderPopup, setShowReminderPopup] = useState(false);
   const [selectedReason, setSelectedReason] = useState("");
   const [showApprovePopup, setShowApprovePopup] = useState(false);
    const [showRejectPopup, setShowRejectPopup] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [approvalReason, setApprovalReason] = useState("");
    const [approvalDate, setApprovalDate] = useState("");
    const [processing, setProcessing] = useState(false);

  const navigate = useNavigate();

  // Fetch closure request from API
  const fetchClosureRequests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_ENDPOINTS.CLOSURE_REQUEST_LIST, {
        timeout: 10000
      });

      const raw = response?.data;
      const listData = Array.isArray(raw)
        ? raw
        : raw?.value || raw?.data || [];

        setClosureRequestList(listData);
     

      // toast.success(`✅ Loaded ${listData.length} associates`);
    } catch (error) {
      toast.error('Failed to load closure request list');
       
    } finally {
      setLoading(false);
    }
  }, []); 
  // Handle Search filter when data is already loaded
  useEffect(() => { 
    fetchClosureRequests()
  }, [ ]);

   const handleApprove = async (receiptId) => {
   
        const receipt = closureRequestList.find(r => r.id === receiptId);
        setSelectedRequest(receipt);
        setShowApprovePopup(true);
    };

    const handleReject = async (receiptId) => {
        const receipt = closureRequestList.find(r => r.id === receiptId);
        setSelectedRequest(receipt);
        setShowRejectPopup(true);
    };
 const getUserId = () => {
        const stored = localStorage.getItem("userId") || localStorage.getItem("spendwise_userId");
        const parsed = stored ? Number(stored) : NaN;
        return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
      };
const confirmApproveReject = async (isApprove) => {

    if (!selectedRequest) return;

    const notes = isApprove ? approvalReason.trim() : rejectionReason.trim();

    if (!notes) {
        Swal.fire({
            icon: "warning",
            title: "Reason Required",
            text: "Please enter a reason."
        });
        return;
    }

    if (isApprove && !approvalDate) {
        Swal.fire({
            icon: "warning",
            title: "Approval Date Required"
        });
        return;
    }

    setProcessing(true);

    try {

        const payload = {
            closerRequestId: selectedRequest.id,
            userId: getUserId(),
            approverResponse: isApprove,
            notes: notes
        };

        console.log("API Payload:", payload);

        await axiosInstance.post(
            API_ENDPOINTS.APPROVE_REJECT_CLOSURE_REQUEST,
            payload
        );

        Swal.fire({
            icon: "success",
            title: isApprove ? "Approved!" : "Rejected!",
            text: `Closure request ${isApprove ? "approved" : "rejected"} successfully`
        });

        closePopups();
        fetchClosureRequests();

    } catch (err) {

        console.error("API ERROR:", err);

        Swal.fire({
            icon: "error",
            title: "Failed",
            text: err?.response?.data?.message || "Something went wrong"
        });

    } finally {

        setProcessing(false);

    }
};

    

    const closePopups = () => {
        setShowApprovePopup(false);
        setShowRejectPopup(false);
        setSelectedRequest(null);
        setRejectionReason("");
        setApprovalReason("");
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

  if (loading) {
    return (
      <div className="loading-container">
          <XediLoader />
          <p>Loading closure requests...</p>
        </div>
    );
  }

  return (
    <Wrapper className='dashboard-container'>
      
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <div>
            <h1 className="dashboard-title">Closure Request List</h1>
          <p className="dashboard-subtitle">View and manage all closure requests</p>
          </div>
        </div>
        <div className="dashboard-header-actions">
          
         
        </div>
      </div>

      
      <div className="card">
                <div className="dashboard-table-header">
                    <h3 className="dashboard-table-title">Pending closure requests ({closureRequestList.length})</h3>
                </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Booking ID</th>
                {/* <th>Username</th> */}
                <th>Customer Name</th>
                <th>Township</th>
                <th>Plot No</th>
                <th>Requested By</th>
                <th>Requested On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {closureRequestList.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                    No closure requests available
                  </td>
                </tr>
              ) : (
                closureRequestList.map((associate) => (
                  <tr key={associate.id}>
                    <td>{associate.bookingId}</td>
                    {/* <td>{associate.userName || '-'}</td> */}
                    <td>{associate.customerName || '-'}</td>
                    <td>{associate.townshipName || '-'}</td>
                    <td>{associate.plotNo || '-'}</td>
                    <td>{associate.requestedBy || '-'}</td>
                    <td> 

                      {associate.requestedOn ?
                                        new Date(associate.requestedOn).toLocaleString('en-IN', {
                                            timeZone: 'Asia/Kolkata',
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: true
                                        }) : 'N/A'
                                    }


                    </td>
                    <td>
                       <div className="d-flex gap-2">
                                                    <button 
                                                        className="primary-btn"
                                                        onClick={() => handleApprove(associate.id)}
                                                        type="button"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button 
                                                        className="primary-btn"
                                                       onClick={() => handleReject(associate.id)}
                                                        type="button"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      
      </div>
      <ReminderPopup
        isOpen={showReminderPopup}
        onClose={() => setShowReminderPopup(false)}
        title="Reminder List"
      />

      {/* Approve Popup */}
                {showApprovePopup && (
                    <div className="modal-overlay" onClick={(e) => e.target.className === 'popup-overlay' && closePopups()}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3>Approve Closure Request</h3>
                                <button className="modal-close-btn" onClick={closePopups}><FiX size={20} /></button>
                            </div>
                            <div className="">
                                {selectedRequest && (
                                    <div className="receipt-details">
                                        <div className="row">
                                        <div className="col-md-6">
                                            <p><strong>Booking ID:</strong> {selectedRequest.bookingId}</p>
                                            <p><strong>Plot No:</strong> {selectedRequest.plotNo}</p>
                                            
                                        </div>
                                        <div className="col-md-6">
                                            <p><strong>Customer:</strong> {selectedRequest.customerName}</p>
                                            <p><strong>Township:</strong> {selectedRequest.townshipName || "-"}</p>
                                            
                                        </div>
                                        </div>
                                        
                                        
                                        
                                    </div>
                                )}
                                  
                                          <div className="form-group-full">
                                <div className="rejection-reason  ">
                                    <label htmlFor="approvalDate">Approval Date *</label>
                                    <input
                                        id="approvalDate"
                                        type="date"
                                        value={approvalDate}
                                        onChange={(e) => setApprovalDate(e.target.value)}
                                        disabled={processing}
                                        className="form-control"
                                    />
                                </div>
                              
    
                                
                                </div>
                              
                                
                                <div className="rejection-reason">
                                    <label htmlFor="approvalReason">Notes {selectedReason === "Other" && (
                                        <span>*</span>
                                        )}</label>
                                    <textarea
                                        id="approvalReason"
                                        value={approvalReason}
                                        onChange={(e) => setApprovalReason(e.target.value)}
                                        placeholder="Please enter the reason for approval..."
                                        rows="4"
                                        disabled={processing}
                                        className="form-control"
                                    />
                                </div>
                            </div>
                            <div className="modal-actions mt-0">
                                <button 
                                    className="primary-btn" 
                                    onClick={closePopups}
                                    disabled={processing}
                                >
                                    Cancel
                                </button>
                                <button
className="primary-btn"
onClick={() => confirmApproveReject(true)}
>
Approve
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
                                <h3>Reject Closure Request</h3>
                                <button className="modal-close-btn" onClick={closePopups}><FiX size={20} /></button>
                            </div>
                            <div className="">
                                {selectedRequest && (
                                    <div className="receipt-details">
                                        <div className="row">
                                            <div className="col-md-6">
                                                 <p><strong>Booking ID:</strong> {selectedRequest.bookingId}</p>
                                            <p><strong>Plot No:</strong> {selectedRequest.plotNo}</p>
                                            
                                        </div>
                                        <div className="col-md-6">
                                            <p><strong>Customer:</strong> {selectedRequest.customerName}</p>
                                           <p><strong>Township:</strong> {selectedRequest.townshipName || "-"}</p>
                                             
                                        </div>
                                        </div>
                                        
                                    </div>
                                )}
                              
                                
                                <div className="rejection-reason">
                                    <label htmlFor="rejectionReason">Notes{selectedReason === "Other" && (
                                        <span>*</span>
                                        )}</label>
                                    <textarea
                                        id="rejectionReason"
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder="Please enter the reason for rejection..."
                                        rows="4"
                                        disabled={processing}
                                        className="form-control"
                                    />
                                </div>
                            </div>
                            <div className="modal-actions mt-0">
                                <button 
                                    className="primary-btn" 
                                    onClick={closePopups}
                                    disabled={processing}
                                >
                                    Cancel
                                </button>
                                <button
                                className="primary-btn"
                                onClick={() => confirmApproveReject(false)}
                                >
                                Reject
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                
   
   
   
    </Wrapper>
  );
}

export default ClosureRequests;
