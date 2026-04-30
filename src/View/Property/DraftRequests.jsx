import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import SmallModal from '../../components/Modal/SmallModal';
import ReminderPopup from '../../components/ReminderPopup';
import API_ENDPOINTS from '../../utilities/apiConfig';
import axiosInstance from '../../utilities/axiosInstance';
import hasPermission, { PERMISSIONS } from '../../utilities/HasPermission';
import './DraftRequests.css';

const DraftRequests = () => {
    const navigate = useNavigate();
    const currentUserId = localStorage.getItem('spendwise_userId') || localStorage.getItem('userId');
    const [draftRequests, setDraftRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showReminderPopup, setShowReminderPopup] = useState(false);
    const [showMarkCompleteModal, setShowMarkCompleteModal] = useState(false);
    const [selectedCompleteRequest, setSelectedCompleteRequest] = useState(null);
    const [completionReason, setCompletionReason] = useState('');
    const [markCompleteLoading, setMarkCompleteLoading] = useState(false);
    const [filePreview, setFilePreview] = useState(null);
    const [uploadedFile, setUploadedFile] = useState(null);

    const ALLOWED_FILE_REGEX = /\.(jpg|jpeg|png|pdf)$/i;
    const MAX_FILE_SIZE = 20 * 1024 * 1024; // 5MB

    const handleCompleteFileChange = (fileList) => {
        const file = fileList && fileList.length > 0 ? fileList[0] : null;

        if (file && !ALLOWED_FILE_REGEX.test(file.name)) {
            alert("Only JPG, JPEG, PNG or PDF files allowed");
            return;
        }

        if (file && file.size > MAX_FILE_SIZE) {
            alert("File must be less than 5MB");
            return;
        }

        setUploadedFile(file);
        if (filePreview?.startsWith?.("blob:")) {
            URL.revokeObjectURL(filePreview);
        }

        setFilePreview(file ? URL.createObjectURL(file) : null);
    };

    const isFilePdf = (file) => {
        if (!file) return false;
        return file instanceof File && file.type === "application/pdf";
    };

    useEffect(() => {
        fetchDraftRequests();
    }, []);


    const fetchDraftRequests = async () => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.GET_DRAFT_REQUESTS);
            const data = Array.isArray(response.data)
                ? response.data
                : response.data?.value || [];
            const sorted = data.sort(
                (a, b) =>
                    new Date(b.requestedOn || 0) - new Date(a.requestedOn || 0) ||
                    b.id - a.id
            );
            setDraftRequests(sorted);
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Failed to fetch draft requests");
            setDraftRequests([]);
        } finally {
            setIsLoading(false);
        }
    };


    const markDraftComplete = async (request) => {
       // if (!hasPermission(PERMISSIONS.CAN_CREATE_DRAFT)) {
            // await Swal.fire({
            //     icon: 'error',
            //     title: 'Access Denied',
            //     text: 'You do not have permission to mark draft as complete.',
            //     confirmButtonColor: '#dc3545'
            // });
            // return;
       // }
        setSelectedCompleteRequest(request);
        setShowMarkCompleteModal(true);
    };

    const uploadDocument = async ({
        bookingId,
        documentTypeId,
        file,
        notes = ''
    }) => {
        if (!bookingId || !documentTypeId || !file) {
            throw new Error('Missing required document upload fields.');
        }

        const formData = new FormData();

        formData.append('BookingId', Number(bookingId));
        formData.append('DocumentTypeId', Number(documentTypeId));
        formData.append('File', file);
        formData.append('Notes', notes);

        return axiosInstance.post(
            API_ENDPOINTS.UPLOAD_DOCUMENT,
            formData
        );
    };


    const submitMarkDraftComplete = async () => {
        setMarkCompleteLoading(true);

        try {
            
                const formData = new FormData();
                        formData.append("id", selectedCompleteRequest.id);                        
                        formData.append("notes", completionReason);
                          formData.append("userId", currentUserId);
                                    if (uploadedFile) {
                            formData.append("file", uploadedFile);
                        }
            
                        const res = await axiosInstance.post(
                            API_ENDPOINTS.MARK_DRAFT_COMPLETE,
                            formData,
                            {
                                headers: {
                                    'Content-Type': 'multipart/form-data',
                                },
                            }
                        ); 
            if (res.status === 200 || res.data === true) {
                setShowMarkCompleteModal(false);


                
                await Swal.fire({
                    icon: "success",
                    title: "Draft Completed",
                    text: `Draft for booking ${selectedCompleteRequest.bookingId} marked complete.`,
                    confirmButtonText: "OK",
                });
                setCompletionReason('');
                setUploadedFile(null);
                setFilePreview(null);
                await fetchDraftRequests();
            } else {
                throw new Error("Unexpected response");
            }
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.message ||
                "Failed to mark draft complete";

            await Swal.fire({
                icon: "error",
                title: "Error",
                text: message,
                confirmButtonText: "OK",
            });

            toast.error(message);
        } finally {
            setMarkCompleteLoading(false);
        }
    };

    return (
        <div className="dashboard-container">
            {/* Header */}
            <div className="dashboard-header">
                <div className="dashboard-header-content">
                    
                    <div>
                        <h1 className='dashboard-title'>Draft Requests</h1>
                        <p className='dashboard-subtitle'>Manage draft requests for bookings</p>
                    </div>
                </div>
                <div className="dashboard-header-actions">
                        <button className="primary-btn" onClick={() => setShowReminderPopup(true)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            Reminder
                        </button>
                </div>
            </div>

            {/* Content */}
            <div className="card">
                {isLoading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading draft requests...</p>
                    </div>
                ) : draftRequests.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14,2 14,8 20,8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                <line x1="12" y1="9" x2="8" y2="9"></line>
                            </svg>
                        </div>
                        <h3>No Draft Requests Found</h3>
                        <p>There are currently no draft requests to display.</p>
                    </div>
                ) : (
                    
                        <div className="table-wrapper">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Booking ID</th>
                                        <th>Plot No</th>
                                        <th>Applicant Details</th>
                                        <th>Amount</th>
                                        <th>Requested By</th>
                                        <th>Requested On</th>
                                        <th>Notes</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {draftRequests.map((request) => (
                                        <tr key={request.id}>
                                            <td>
                                                <div className="booking-id-cell">
                                                    <strong>{request.bookingId}</strong>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="plot-info">
                                                    {request.plotNo || 'N/A'}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="customer-details-cell">
                                                    <div style={{ marginBottom: "4px" }}>
                                                        <strong>Applicant:</strong> {request.applicantName || "N/A"} <br />
                                                        <strong>{request.relationType || "N/A"}:</strong>{" "}
                                                        {request.relativeName || "N/A"}
                                                    </div>

                                                    <div style={{ marginBottom: '4px' }}>
                                                        <strong>Contact No:</strong> {request.contactNo || 'N/A'}
                                                    </div>
                                                    <div title={request.address}>
                                                        <strong>Address:</strong> {request.address ?
                                                            (request.address.length > 50 ?
                                                                request.address.substring(0, 50) + '...' :
                                                                request.address
                                                            ) : 'N/A'
                                                        }
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="amount-badge">
                                                    ₹{request.amount ? request.amount.toLocaleString() : '0'}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="requested-by">
                                                    {request.requestedByName || 'N/A'}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="requested-date">
                                                    {request.requestedOn ?
                                                        new Date(request.requestedOn).toLocaleString('en-IN', {
                                                            timeZone: 'Asia/Kolkata',
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                            hour12: true
                                                        }) : 'N/A'
                                                    }
                                                </div>
                                            </td>
                                            <td>
                                                <div className="notes-cell" title={request.notes}>
                                                    {request.notes ?
                                                        request.notes
                                                        : 'No notes'
                                                    }
                                                </div>
                                            </td>
                                            <td>
                                                <div className="actions-cell">
                                                    <button
                                                        className="primary-btn"
                                                        onClick={() => markDraftComplete(request)}
                                                        disabled={isLoading}
                                                        title="Mark Draft Complete"
                                                    >
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M20 6L9 17l-5-5" />
                                                        </svg>
                                                        {isLoading ? 'Processing...' : 'Mark Complete'}
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

            <ToastContainer
                position="top-right"
                autoClose={2500}
                theme="dark"
                limit={3}
            />

            <SmallModal
                show={showMarkCompleteModal}
                title="Mark Draft Complete"
                onClose={() => {
                    if (!markCompleteLoading) {
                        setShowMarkCompleteModal(false);
                        setSelectedCompleteRequest(null);
                        setCompletionReason('');
                        setUploadedFile(null);
                        if (filePreview?.startsWith?.("blob:")) {
                            URL.revokeObjectURL(filePreview);
                        }
                        setFilePreview(null);
                    }
                }}
            >
                <div className="mark-complete-modal-content">
                    {selectedCompleteRequest && (
                        <>
                            <h3 className='dashboard-table-title'>Booking Reference</h3>
                            {/* Draft Reference */}
                            <div className="booking-reference-section">
                                    <div>
                                        <strong>Draft ID:</strong> {selectedCompleteRequest.id}
                                    </div>
                                    <div>
                                        <strong>Booking ID:</strong> {selectedCompleteRequest.bookingId}
                                    </div>
                                    <div>
                                        <strong>Plot:</strong> {selectedCompleteRequest.plotNo || 'N/A'}
                                    </div>
                            </div>
                            {/* Upload File Section */}
                            <div className="upload-file-section" style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500', fontSize: '14px' }}>
                                    Upload File
                                </label>

                                <label className={`upload-box ${markCompleteLoading ? "disabled" : ""}`} style={{
                                    display: 'block',
                                    padding: '20px',
                                    border: '2px dashed #ced4da',
                                    borderRadius: '0px',
                                    textAlign: 'center',
                                    cursor: markCompleteLoading ? 'not-allowed' : 'pointer',
                                    backgroundColor: '#f8f9fa',
                                    transition: 'all 0.3s ease',
                                    marginBottom: '10px'
                                }}>
                                    <span className="upload-text" style={{ fontSize: '14px', color: '#6c757d' }}>
                                        {uploadedFile ? uploadedFile.name : 'Click to Upload File (PDF/Image)'}
                                    </span>

                                    <input
                                        type="file"
                                        accept="image/*,application/pdf"
                                        disabled={markCompleteLoading}
                                        onChange={(e) => handleCompleteFileChange(e.target.files)}
                                        style={{ display: 'none' }}
                                    />
                                </label>

                                {filePreview && (
                                    <div className="file-preview-box" style={{
                                        border: '1px solid #e9ecef',
                                        borderRadius: '8px',
                                        padding: '15px',
                                        minHeight: '150px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: '#fff'
                                    }}>
                                        {isFilePdf(uploadedFile) ? (
                                            <div className="pdf-preview-box">
                                                <button
                                                    className="primary-btn"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        window.open(filePreview, "_blank");
                                                    }}
                                                >
                                                    📄 Preview PDF
                                                </button>
                                            </div>
                                        ) : (
                                            <img
                                                src={filePreview}
                                                alt="uploaded file"
                                                className="preview-image"
                                                style={{ maxWidth: '100%', maxHeight: '150px', objectFit: 'contain' }}
                                            />
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Completion Reason Section */}
                            <div className="reason-section" style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                                    Remarks <span style={{ color: '#dc3545' }}>*</span>
                                </label>
                                <textarea
                                    value={completionReason}
                                    onChange={(e) => setCompletionReason(e.target.value)}
                                    placeholder="Enter reason for marking draft as complete (minimum 10 characters)..."
                                    disabled={markCompleteLoading}
                                    rows={4}
                                    className='form-control'
                                    />
                            </div>

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '15px', borderTop: '1px solid #e9ecef' }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!markCompleteLoading) {
                                            setShowMarkCompleteModal(false);
                                            setCompletionReason('');
                                            setUploadedFile(null);
                                            setFilePreview(null);
                                        }
                                    }}
                                    disabled={markCompleteLoading}
                                    className='primary-btn'
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={submitMarkDraftComplete}
                                    disabled={markCompleteLoading || !completionReason.trim()}
                                    className='primary-btn'
                                >
                                    {markCompleteLoading ? 'Processing...' : 'Mark Complete'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </SmallModal>

            <ReminderPopup
                isOpen={showReminderPopup}
                onClose={() => setShowReminderPopup(false)}
                title="Draft Reminders"
                bookingId={selectedCompleteRequest?.bookingId}
            />
        </div>
    );
};

export default DraftRequests;
