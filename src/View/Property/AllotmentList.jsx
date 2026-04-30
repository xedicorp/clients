import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utilities/axiosInstance';
import API_ENDPOINTS from '../../utilities/apiConfig';
import SmallModal from '../../components/Modal/SmallModal';
import ReminderPopup from '../../components/ReminderPopup';
import './AllotmentList.css';

const AllotmentList = () => {
    const navigate = useNavigate();
    const [allotments, setAllotments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [markingComplete, setMarkingComplete] = useState({});
    const [bookings, setBookings] = useState([]);
    const [townships, setTownships] = useState([]);
    const [showReminderPopup, setShowReminderPopup] = useState(false);
    const [markCompleteFile, setMarkCompleteFile] = useState(null);
    const [markCompleteFileName, setMarkCompleteFileName] = useState("");
    const [markCompletePreview, setMarkCompletePreview] = useState("");
    // Send for Allotment Letter Modal States
    const [showSendForAllotmentModal, setShowSendForAllotmentModal] = useState(false);
    const [selectedAllotmentBooking, setSelectedAllotmentBooking] = useState(null);
    const [allotmentClientInfo, setAllotmentClientInfo] = useState({
        applicationName: '',
        fatherMotherCo: '',
        address: '',
        mobileNo: '',
        aadharCard: '',
        panCard: '',
    });
    const [allotmentNotes, setAllotmentNotes] = useState('');
    const [allotmentAadharFile, setAllotmentAadharFile] = useState(null);
    const [allotmentPanFile, setAllotmentPanFile] = useState(null);
    const [sendAllotmentLoading, setSendAllotmentLoading] = useState(false);
    const [allotmentInfoSource, setAllotmentInfoSource] = useState('existing');

    // Mark Letter Complete Modal States
    const [showMarkCompleteModal, setShowMarkCompleteModal] = useState(false);
    const [selectedMarkCompleteAllotment, setSelectedMarkCompleteAllotment] = useState(null);
    const [markCompleteClientInfo, setMarkCompleteClientInfo] = useState({
        applicationName: '',
        fatherMotherCo: '',
        address: '',
        mobileNo: '',
        aadharCard: '',
        panCard: '',
    });
    const [markCompleteNotes, setMarkCompleteNotes] = useState('');
    const [markCompleteLoading, setMarkCompleteLoading] = useState(false);
    const [markCompleteInfoSource, setMarkCompleteInfoSource] = useState('existing');

    // Helper function to safely get non-empty string value
    const getValidValue = (value) => {
        if (value === null || value === undefined) return '';
        const trimmed = String(value).trim();
        return trimmed === '' || trimmed === 'null' || trimmed === 'undefined' ? '' : trimmed;
    };

    useEffect(() => {
        fetchAllotments();
        fetchBookings();
        fetchTownships();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.BOOKING_SEARCH);
            const bookingsData = Array.isArray(response.data) ? response.data : (response.data?.value || []);
            setBookings(bookingsData);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        }
    };

    const fetchTownships = async () => {
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.TOWNSHIP_LIST);
            const townshipsData = Array.isArray(response.data) ? response.data : (response.data?.value || []);
            setTownships(townshipsData);
        } catch (error) {
            console.error('Error fetching townships:', error);
        }
    };

    const fetchAllotments = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(API_ENDPOINTS.GET_ALLOTMENT_LETTER_REQUESTS);
            const data = Array.isArray(response.data)
                ? response.data
                : response.data?.value || [];
            setAllotments(data);
        } finally {
            setLoading(false);
        }
    };

    const markDraftComplete = async (allotmentId, bookingId, customerName = '', plotNumber = '') => {
        // Find the allotment details
        const allotment = allotments.find(a => a.id === allotmentId);
        if (!allotment) {
            toast.error('Allotment not found');
            return;
        }

        // Pre-populate with existing data
        setMarkCompleteClientInfo({
            applicationName: allotment.applicationName || customerName || '',
            fatherMotherCo: allotment.relativeName || allotment.fatherName || '',
            address: allotment.address || '',
            mobileNo: allotment.contactNo || allotment.phone || '',
            aadharCard: allotment.aadhar || '',
            panCard: allotment.pan || '',
        });

        setSelectedMarkCompleteAllotment(allotment);
        setMarkCompleteInfoSource('existing');
        setMarkCompleteNotes('');
        setShowMarkCompleteModal(true);
    };

    // Submit mark letter complete with client information
   const submitMarkComplete = async () => {
    try {
        const finalClientInfo =
            markCompleteInfoSource === "existing"
                ? {
                    applicationName:
                        selectedMarkCompleteAllotment.applicationName ||
                        selectedMarkCompleteAllotment.customerName ||
                        "",
                    mobileNo:
                        selectedMarkCompleteAllotment.contactNo ||
                        selectedMarkCompleteAllotment.phone ||
                        "",
                }
                : { ...markCompleteClientInfo };

        // validation
        if (!finalClientInfo.applicationName.trim())
            return Swal.fire("Missing Information", "Application Name is required.", "warning");

        if (!finalClientInfo.mobileNo.trim())
            return Swal.fire("Missing Information", "Mobile Number is required.", "warning");

        if (!markCompleteNotes.trim())
            return Swal.fire("Missing Information", "Completion reason is required.", "warning");

        if (markCompleteNotes.trim().length < 10)
            return Swal.fire("Invalid Notes", "Completion reason must be at least 10 characters.", "warning");

        setMarkCompleteLoading(true);

        const userId = parseInt(
            localStorage.getItem("spendwise_user_id") ||
            localStorage.getItem("userId") ||
            "5"
        );

        // FormData (FIXED BY Sibankar)
        const formData = new FormData();
        formData.append("Id", selectedMarkCompleteAllotment.id);
        formData.append("UserId", userId);
        formData.append("Notes", markCompleteNotes);
        if (markCompleteFile) {
            formData.append("File", markCompleteFile);
        }
        // loading
        Swal.fire({
            title: "Processing...",
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
        });

        await axiosInstance.post(
            API_ENDPOINTS.MARK_ALLOTMENT_LETTER_COMPLETE,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        //  FIRST close modal
        setShowMarkCompleteModal(false);

        //  THEN success Swal
        await Swal.fire({
            icon: "success",
            title: "Success",
            text: "Allotment letter marked complete.",
        });

        // update UI
        setAllotments((prev) =>
            prev.map((a) =>
                a.id === selectedMarkCompleteAllotment.id
                    ? { ...a, status: "Completed" }
                    : a
            )
        );

        await fetchAllotments();

    } catch (error) {
        const msg =
            error.response?.data?.message ||
            error.message ||
            "Failed to mark allotment letter complete";

        // ❗ modal close korbi na → Swal overlay hobe
        Swal.fire("Error", msg, "error");

    } finally {
        setMarkCompleteLoading(false);
    }
};

const handleMarkCompleteFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
        setMarkCompleteFile(file);
        setMarkCompleteFileName(file.name);

        const reader = new FileReader();
        reader.onloadend = () => {
            setMarkCompletePreview(reader.result);
        };
        reader.readAsDataURL(file);
    }
};
const removeMarkCompleteFile = () => {
    setMarkCompleteFile(null);
    setMarkCompleteFileName("");
    setMarkCompletePreview("");

    const input = document.getElementById("markCompleteFile");
    if (input) input.value = "";
};
    // Submit send for allotment letter
    const submitSendForAllotment = async () => {
        // Determine which client info to use
        let finalClientInfo = { ...allotmentClientInfo };

        if (allotmentInfoSource === 'existing') {
            finalClientInfo = {
                applicationName: selectedAllotmentBooking.clientName || '',
                fatherMotherCo: selectedAllotmentBooking.clientFatherName || selectedAllotmentBooking.relativeName || '',
                address: selectedAllotmentBooking.clientAddress || selectedAllotmentBooking.address || '',
                mobileNo: selectedAllotmentBooking.clientMobile || selectedAllotmentBooking.contactNo || '',
                aadharCard: '',
                panCard: '',
            };
        }

        // Validation
        if (!finalClientInfo.applicationName.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Application Name is required.',
            });
            return;
        }

        if (!finalClientInfo.mobileNo.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Mobile Number is required.',
            });
            return;
        }

        if (!allotmentNotes.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Notes are required for allotment letter requests.',
            });
            return;
        }

        if (allotmentNotes.trim().length < 3) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Notes',
                text: 'Notes must be at least 3 characters long.',
            });
            return;
        }

        setSendAllotmentLoading(true);

        try {
            // Get current user information
            const userId = localStorage.getItem('spendwise_userId') || localStorage.getItem('userId') || 5;
            const currentUser = localStorage.getItem('userName') || localStorage.getItem('userName') || 'admin';

            const formData = new FormData();
            formData.append('userId', parseInt(userId));
            formData.append('bookingId', parseInt(selectedAllotmentBooking.id));
            formData.append('notes', allotmentNotes.trim());
            formData.append('applicantName', finalClientInfo.applicationName);
            formData.append('relativeName', finalClientInfo.fatherMotherCo);
            formData.append('address', finalClientInfo.address);
            formData.append('contactNo', finalClientInfo.mobileNo);

            if (allotmentAadharFile) {
                formData.append('aadharFile', allotmentAadharFile);
            }
            if (allotmentPanFile) {
                formData.append('panFile', allotmentPanFile);
            }

            const response = await axiosInstance.post(API_ENDPOINTS.SEND_FOR_ALLOTMENT_LETTER, formData);

            setShowSendForAllotmentModal(false);

            // Show success message
            await Swal.fire({
                icon: 'success',
                title: 'Success!',
                html: `
                    <div style="text-align: left;">
                        <p><strong>Booking ${selectedAllotmentBooking.id}</strong> has been sent for allotment letter preparation successfully.</p>
                        <p><strong>Client:</strong> ${finalClientInfo.applicationName}</p>
                        <p><strong>Notes:</strong> ${allotmentNotes.trim()}</p>
                        <p><strong>Requested by:</strong> ${currentUser}</p>
                        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                        ${allotmentAadharFile ? `<p><strong>Aadhar:</strong> ${allotmentAadharFile.name} uploaded</p>` : ''}
                        ${allotmentPanFile ? `<p><strong>PAN:</strong> ${allotmentPanFile.name} uploaded</p>` : ''}
                    </div>
                `,
                timer: 5000,
                showConfirmButton: true,
                confirmButtonText: 'OK',
            });

            toast.success('Allotment letter request sent successfully!');

            // Refresh allotments list
            await fetchAllotments();

        } catch (error) {
            let errorMessage = 'Failed to send booking for allotment letter. Please try again.';

            if (error.response?.status === 400) {
                errorMessage = error.response?.data?.message || 'Invalid request data. Please check the booking details.';
            } else if (error.response?.status === 401) {
                errorMessage = 'You are not authorized to perform this action. Please login again.';
            } else if (error.response?.status === 404) {
                errorMessage = 'Booking not found. Please refresh the page and try again.';
            } else if (error.response?.status === 500) {
                errorMessage = 'Server error occurred. Please contact support if the issue persists.';
            } else if (error.code === 'NETWORK_ERROR') {
                errorMessage = 'Network error. Please check your internet connection.';
            }

            Swal.fire({
                icon: 'error',
                title: 'Error',
                html: `
                    <div style="text-align: left;">
                        <p><strong>Error:</strong> ${errorMessage}</p>
                        <p><strong>Booking ID:</strong> ${selectedAllotmentBooking.id}</p>
                        <p><strong>Status Code:</strong> ${error.response?.status || 'N/A'}</p>
                        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                    </div>
                `,
                confirmButtonColor: '#d33',
                confirmButtonText: 'OK',
            });

            toast.error(errorMessage);
        } finally {
            setSendAllotmentLoading(false);
        }
    };

    // if (loading) {
    //     return (
    //         <div className="allotment-container">
    //             <div className="allotment-header">
    //                 <div className="header-content">
    //                     <div className="header-icon">
    //                         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    //                             <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
    //                             <polyline points="17 21 17 13 7 13 7 21"></polyline>
    //                             <polyline points="7 3 7 8 15 8"></polyline>
    //                         </svg>
    //                     </div>
    //                     <div>
    //                         <h2> Allotment Letter Management</h2>
    //                         <p>📋 Loading allotment letter requests...</p>
    //                     </div>
    //                 </div>
    //             </div>
    //             <div className="loading-spinner">
    //                 <div style={{ textAlign: 'center' }}>
    //                     <div className="spinner"></div>
    //                     <div style={{ marginTop: '20px', color: '#6c757d' }}>
    //                         <h3>🔄 Loading Data</h3>
    //                         <p>Please wait while we fetch the allotment letter requests...</p>
    //                     </div>
    //                 </div>
    //             </div>
    //         </div>
    //     );
    // }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div className="dashboard-header-content">
                    <div>
                        <h2 className='dashboard-title'> Allotment Letter Management</h2>
                        <p className='dashboard-subtitle'> Manage allotment letter requests and mark them as complete with detailed tracking</p>
                        {/* <div style={{
                            marginTop: '10px',
                            display: 'flex',
                            gap: '15px',
                            fontSize: '14px',
                            opacity: '0.9'
                        }}>
                             <span>📊 Total Requests: {allotments.length}</span> 
                            <span>📝 Draft: {allotments.filter(a => a.status === 'Draft').length}</span>
                            <span>✅ Completed: {allotments.filter(a => a.status === 'Completed').length}</span> 
                        </div> */}
                    </div>
                </div>
                <div className='dashboard-header-actions'>
                    <button
                        className="primary-btn"
                        onClick={() => navigate(-1)}
                    >
                        <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    width="20"
                                    height="20"
                                >
                                    <path d="M15 18l-6-6 6-6" />
                                </svg>
                        Back
                    </button>
                    <button
                        className="primary-btn"
                        onClick={() => setShowReminderPopup(true)}
                        title="Open Reminders"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                        </svg>
                        Reminder
                    </button>
                </div>
            </div>

            <div className="card">
                <div className="dashboard-table-header">
                    
                       
                        <h3 className='dashboard-table-title'>Allotment Letter Requests</h3>
                    <p>View and manage all allotment letter requests with real-time status updates</p>
                    {/* {allotments.length > 0 && (
                        <div style={{ 
                            marginTop: '15px',
                            padding: '12px',
                            background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
                            borderRadius: '8px',
                            display: 'flex',
                            gap: '20px',
                            fontSize: '14px',
                            fontWeight: '600'
                        }}>
                            <span style={{ color: '#1976d2' }}>📊 Total: {allotments.length}</span>
                            <span style={{ color: '#f57c00' }}>📝 Draft: {allotments.filter(a => a.status === 'Draft').length}</span>
                            <span style={{ color: '#388e3c' }}>✅ Completed: {allotments.filter(a => a.status === 'Completed').length}</span>
                            <span style={{ color: '#7b1fa2' }}>📈 Success Rate: {allotments.length > 0 ? Math.round((allotments.filter(a => a.status === 'Completed').length / allotments.length) * 100) : 0}%</span>
                        </div>
                    )} */}
                </div>

                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Booking Details</th>
                                <th>Customer Details</th>
                                <th>Plot Details</th>
                                <th>Amount</th>
                                <th>Requested By</th>
                                <th>Notes</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allotments.map((allotment) => (
                                <tr key={allotment.id}>
                                    <td className="booking-details">
                                        <div className="booking-info">
                                            <div className="booking-id">{allotment.bookingId}</div>
                                            <div className="allotment-date">
                                                {allotment.requestedOn ? new Date(allotment.requestedOn).toLocaleDateString() : ''}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="customer-info">
                                        <div className="customer-details-cell">
                                            <div style={{ marginBottom: '4px' }}>
                                                <strong>Customer:</strong> {allotment.applicantName || 'N/A'}
                                            </div>
                                            <div style={{ marginBottom: '4px' }}>
                                                <strong>{allotment?.relationType || "Relation Type"}</strong> {allotment.relativeName || 'N/A'}
                                            </div>
                                            <div style={{ marginBottom: '4px' }} title={allotment.address}>
                                                <strong>Address:</strong> {allotment.address ?
                                                    (allotment.address.length > 50 ?
                                                        allotment.address.substring(0, 50) + '...' :
                                                        allotment.address
                                                    ) : 'N/A'
                                                }
                                            </div>
                                            <div>
                                                <strong>Contact No:</strong> {allotment.contactNo || 'N/A'}
                                            </div>
                                        </div>
                                    </td>
                                   <td className="plot-details">
                                        <div>
                                           Township: {allotment.townshipName || 'N/A'}
                                        </div>
                                        <div>
                                           Plot No:{allotment.plotNo || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="amount">
                                        <div className="amount-badge">
                                            ₹{allotment.amount ? allotment.amount.toLocaleString() : '0'}
                                        </div>
                                    </td>
                                    <td className="requested-by">
                                        <div className="requested-info">
                                            <div className="requested-by-name">{allotment.requestedByName}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="notes-cell">
                                            {allotment.notes}
                                        </div>
                                    </td>
                                    <td className="actions">
                                        <button
                                            className="primary-btn"
                                            onClick={() => markDraftComplete(allotment.id, allotment.bookingId, allotment.customerName, allotment.plotNumber)}
                                            disabled={markingComplete[allotment.id]}
                                            
                                            onMouseEnter={(e) => {
                                                if (!markingComplete[allotment.id]) {
                                                    e.target.style.transform = 'translateY(-2px)';
                                                    e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!markingComplete[allotment.id]) {
                                                    e.target.style.transform = 'translateY(0)';
                                                    e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                                                }
                                            }}
                                        >
                                            {markingComplete[allotment.id] ? (
                                                <>
                                                    <div className="btn-spinner" style={{
                                                        width: '16px',
                                                        height: '16px',
                                                        border: '2px solid #ffffff',
                                                        borderTop: '2px solid transparent',
                                                        borderRadius: '50%',
                                                        animation: 'spin 1s linear infinite'
                                                    }}></div>
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
                                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                                        <polyline points="22,4 12,14.01 9,11.01"></polyline>
                                                    </svg>
                                                    Mark Letter Complete
                                                </>
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* {allotments.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                                <polyline points="7 3 7 8 15 8"></polyline>
                            </svg>
                        </div>
                        <h3>📭 No Allotment Letter Requests Found</h3>
                        <p>There are currently no allotment letter requests to display. New requests will appear here automatically when they are submitted.</p>
                        <div style={{ 
                            marginTop: '20px',
                            padding: '15px',
                            background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
                            borderRadius: '8px',
                            display: 'inline-block'
                        }}>
                            <p style={{ margin: '0', fontSize: '14px', color: '#1976d2' }}>
                                💡 <strong>Tip:</strong> Allotment letter requests are created from the booking dashboard when users click "Send for Allotment Letter"
                            </p>
                        </div>
                    </div>
                )} */}
            </div>

            {/* Mark Letter Complete Modal */}
            <SmallModal
                show={showMarkCompleteModal}
                title="Mark Complete"
                onClose={() => {
                    if (!markCompleteLoading) {
                        setShowMarkCompleteModal(false);
                        setSelectedMarkCompleteAllotment(null);
                        setMarkCompleteClientInfo({
                            applicationName: '',
                            fatherMotherCo: '',
                            address: '',
                            mobileNo: '',
                            aadharCard: '',
                            panCard: '',
                        });
                        setMarkCompleteNotes('');
                    }
                }}
            >
                <div className="mark-complete-modal-content">
                    {selectedMarkCompleteAllotment && (
                        <>
                            {/* Booking Reference */}
                            <div
                                className="booking-reference-section">
                                    <div>
                                        <strong>Allotment ID:</strong> {selectedMarkCompleteAllotment.id}
                                    </div>
                                    <div>
                                        <strong>Booking ID:</strong> {selectedMarkCompleteAllotment.bookingId}
                                    </div>
                                    <div>
                                        <strong>Township:</strong> {selectedMarkCompleteAllotment.townshipName}
                                    </div>
                                    <div>
                                        <strong>Plot:</strong> {selectedMarkCompleteAllotment.plotNo}
                                    </div>
                            </div>
                            <div className="form-group">
    <label>Upload File</label>

    {!markCompletePreview ? (
        <div
            className="upload-bank-dd-upload-box"
            onClick={() => document.getElementById("markCompleteFile").click()}
        >
            <input
                id="markCompleteFile"
                type="file"
                onChange={handleMarkCompleteFile}
                accept="image/*,.pdf"
                style={{ display: "none" }}
            />

            <div>Click to upload file</div>
            <small>JPG, PNG, PDF</small>
        </div>
    ) : (
        <div className="upload-allotment-preview-box">
            <div className="upload-allotment-preview-content">

                {/* PDF */}
                {markCompleteFileName.toLowerCase().endsWith(".pdf") ? (
                    <div>📄 PDF File</div>
                ) : (
                    <img
                        src={markCompletePreview}
                        alt="preview"
                        style={{ width: "100%", maxHeight: "200px" }}
                    />
                )}

                <div style={{ marginTop: "10px" }}>
                    <strong>{markCompleteFileName}</strong>
                </div>

                <div  style={{
                    display: "flex",
                    gap: "8px",
                    flexWrap: "wrap",          
                    marginTop: "10px"
                }}>
                    <button
                        type="button"
                        onClick={removeMarkCompleteFile}
                        className="primary-btn"
                    >
                        Remove
                    </button>
                </div>
            </div>
        </div>
    )}
</div>

                            {/* Completion Reason Section */}
                            <div className="notes-section" style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                                    Completion Reason <span style={{ color: '#dc3545' }}>*</span>
                                </label>
                                <textarea
                                    value={markCompleteNotes}
                                    onChange={(e) => setMarkCompleteNotes(e.target.value)}
                                    placeholder="Enter completion reason (minimum 10 characters)..."
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
                                            setSelectedMarkCompleteAllotment(null);
                                            setMarkCompleteClientInfo({
                                                applicationName: '',
                                                fatherMotherCo: '',
                                                address: '',
                                                mobileNo: '',
                                                aadharCard: '',
                                                panCard: '',
                                            });
                                            setMarkCompleteNotes('');
                                        }
                                    }}
                                    disabled={markCompleteLoading}
                                    className='primary-btn'
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={submitMarkComplete}
                                    disabled={markCompleteLoading || !markCompleteNotes.trim()}
                                    className='primary-btn'
                                >
                                    {markCompleteLoading ? 'Processing...' : 'Mark Letter Complete'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </SmallModal>

            {/* Send for Allotment Letter Modal */}
            <SmallModal
                show={showSendForAllotmentModal}
                onClose={() => {
                    if (!sendAllotmentLoading) {
                        setShowSendForAllotmentModal(false);
                        setSelectedAllotmentBooking(null);
                        setAllotmentClientInfo({
                            applicationName: '',
                            fatherMotherCo: '',
                            address: '',
                            mobileNo: '',
                            aadharCard: '',
                            panCard: '',
                        });
                        setAllotmentNotes('');
                        setAllotmentAadharFile(null);
                        setAllotmentPanFile(null);
                    }
                }}
            >
                <div className="send-allotment-modal-content">
                    {selectedAllotmentBooking && (
                        <>
                            {/* Booking Reference */}
                            <div
                                className="booking-reference-section">
                                    <div>
                                        <strong>ID:</strong> #{selectedAllotmentBooking.id}
                                    </div>
                                    <div>
                                        <strong>Township:</strong> {selectedAllotmentBooking.townshipName || selectedAllotmentBooking.township}
                                    </div>
                                    <div>
                                        <strong>Plot:</strong> {selectedAllotmentBooking.plotNo || selectedAllotmentBooking.plotNumber} ({selectedAllotmentBooking.plotSize})
                                    </div>
                            </div>

                            {/* Use Existing Information Section */}
                            <div
                                className="existing-info-section"
                                style={{
                                    marginBottom: '20px',
                                    opacity: allotmentInfoSource === 'existing' ? 1 : 0.6,
                                    transition: 'all 0.3s ease',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                    <input
                                        type="radio"
                                        id="useExistingSourceAllotment"
                                        name="allotmentInfoSource"
                                        checked={allotmentInfoSource === 'existing'}
                                        onChange={() => setAllotmentInfoSource('existing')}
                                    />
                                    <label htmlFor="useExistingSourceAllotment" style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
                                        Use Existing Information
                                    </label>
                                </div>

                                <div
                                    style={{
                                        backgroundColor: '#f8f9fa',
                                        padding: '15px',
                                        borderRadius: '0px',
                                        border: allotmentInfoSource === 'existing' ? '2px solid #007bff' : '1px solid #ccc',
                                        fontSize: '14px',
                                        pointerEvents: allotmentInfoSource === 'existing' ? 'auto' : 'none',
                                    }}
                                >
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '10px' }}>
                                        <div>
                                            <strong>Application Name:</strong> <br />
                                            {selectedAllotmentBooking.clientName || '-'}
                                        </div>
                                        <div>
                                            <strong>Relative:</strong> <br />
                                            {selectedAllotmentBooking?.clientInformation?.fatherMotherCo ||
                                                selectedAllotmentBooking?.clientFatherName ||
                                                selectedAllotmentBooking?.relativeName || '-'}
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                        <div>
                                            <strong>Address:</strong> <br />
                                            {selectedAllotmentBooking.clientAddress || selectedAllotmentBooking.address || '-'}
                                        </div>
                                        <div>
                                            <strong>Mobile Number:</strong> <br />
                                            {selectedAllotmentBooking.clientMobile || selectedAllotmentBooking.contactNo || '-'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* New Information Section */}
                            <div
                                className="new-info-section"
                                style={{
                                    marginBottom: '20px',
                                    opacity: allotmentInfoSource === 'new' ? 1 : 0.6,
                                    transition: 'all 0.3s ease',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                                    <input
                                        type="radio"
                                        id="useNewSourceAllotment"
                                        name="allotmentInfoSource"
                                        checked={allotmentInfoSource === 'new'}
                                        onChange={() => setAllotmentInfoSource('new')}
                                        style={{ marginRight: '8px', cursor: 'pointer', width: '18px', height: '18px' }}
                                    />
                                    <label htmlFor="useNewSourceAllotment" style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
                                        (New)
                                    </label>
                                </div>

                                <div
                                    style={{
                                        border: allotmentInfoSource === 'new' ? '2px solid #007bff' : '1px solid transparent',
                                        borderRadius: '8px',
                                        padding: allotmentInfoSource === 'new' ? '15px' : '0',
                                        pointerEvents: allotmentInfoSource === 'new' ? 'auto' : 'none',
                                    }}
                                >
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                                                Application Name <span style={{ color: '#dc3545' }}>*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={allotmentClientInfo.applicationName}
                                                onChange={(e) => setAllotmentClientInfo(prev => ({ ...prev, applicationName: e.target.value }))}
                                                placeholder="Enter client name"
                                                disabled={sendAllotmentLoading}
                                                style={{ width: '100%', padding: '8px 12px', border: '1px solid #ced4da', borderRadius: '4px', fontSize: '14px' }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                                                Relative
                                            </label>
                                            <input
                                                type="text"
                                                value={allotmentClientInfo.fatherMotherCo}
                                                onChange={(e) => setAllotmentClientInfo(prev => ({ ...prev, fatherMotherCo: e.target.value }))}
                                                placeholder="Enter father/mother/husband/co name"
                                                disabled={sendAllotmentLoading}
                                                style={{ width: '100%', padding: '8px 12px', border: '1px solid #ced4da', borderRadius: '4px', fontSize: '14px' }}
                                            />
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                                                Address
                                            </label>
                                            <textarea
                                                value={allotmentClientInfo.address}
                                                onChange={(e) => setAllotmentClientInfo(prev => ({ ...prev, address: e.target.value }))}
                                                placeholder="Enter complete address"
                                                disabled={sendAllotmentLoading}
                                                rows={1}
                                                style={{ width: '100%', padding: '8px 12px', border: '1px solid #ced4da', borderRadius: '4px', fontSize: '14px', resize: 'vertical', minHeight: '38px' }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                                                Mobile Number <span style={{ color: '#dc3545' }}>*</span>
                                            </label>
                                            <input
                                                type="tel"
                                                value={allotmentClientInfo.mobileNo}
                                                onChange={(e) => setAllotmentClientInfo(prev => ({ ...prev, mobileNo: e.target.value }))}
                                                placeholder="Enter mobile number"
                                                disabled={sendAllotmentLoading}
                                                style={{ width: '100%', padding: '8px 12px', border: '1px solid #ced4da', borderRadius: '4px', fontSize: '14px' }}
                                            />
                                        </div>
                                    </div>

                                    {/* File Uploads */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                                                Aadhar Card (PDF/Image)
                                            </label>
                                            <input
                                                type="file"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={(e) => setAllotmentAadharFile(e.target.files[0] || null)}
                                                disabled={sendAllotmentLoading}
                                                style={{ width: '100%', padding: '8px 12px', border: '1px solid #ced4da', borderRadius: '4px', fontSize: '14px' }}
                                            />
                                            {allotmentAadharFile && (
                                                <div style={{ marginTop: '5px', fontSize: '12px', color: '#28a745' }}>
                                                    ✓ {allotmentAadharFile.name} selected
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                                                PAN Card (PDF/Image)
                                            </label>
                                            <input
                                                type="file"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={(e) => setAllotmentPanFile(e.target.files[0] || null)}
                                                disabled={sendAllotmentLoading}
                                                style={{ width: '100%', padding: '8px 12px', border: '1px solid #ced4da', borderRadius: '4px', fontSize: '14px' }}
                                            />
                                            {allotmentPanFile && (
                                                <div style={{ marginTop: '5px', fontSize: '12px', color: '#28a745' }}>
                                                    ✓ {allotmentPanFile.name} selected
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Notes Section */}
                            <div className="notes-section" style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                                    Notes <span style={{ color: '#dc3545' }}>*</span>
                                </label>
                                <textarea
                                    value={allotmentNotes}
                                    onChange={(e) => setAllotmentNotes(e.target.value)}
                                    placeholder="Enter notes for the allotment letter request..."
                                    disabled={sendAllotmentLoading}
                                    rows={4}
                                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #ced4da', borderRadius: '4px', fontSize: '14px', resize: 'vertical' }}
                                />
                            </div>

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '15px', borderTop: '1px solid #e9ecef' }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!sendAllotmentLoading) {
                                            setShowSendForAllotmentModal(false);
                                            setSelectedAllotmentBooking(null);
                                            setAllotmentClientInfo({
                                                applicationName: '',
                                                fatherMotherCo: '',
                                                address: '',
                                                mobileNo: '',
                                                aadharCard: '',
                                                panCard: '',
                                            });
                                            setAllotmentNotes('');
                                            setAllotmentAadharFile(null);
                                            setAllotmentPanFile(null);
                                        }
                                    }}
                                    disabled={sendAllotmentLoading}
                                    style={{
                                        padding: '10px 20px',
                                        border: '1px solid #6c757d',
                                        borderRadius: '4px',
                                        background: 'white',
                                        color: '#6c757d',
                                        cursor: sendAllotmentLoading ? 'not-allowed' : 'pointer',
                                        fontSize: '14px',
                                    }}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={submitSendForAllotment}
                                    disabled={sendAllotmentLoading || !allotmentNotes.trim()}
                                    style={{
                                        padding: '10px 20px',
                                        border: 'none',
                                        borderRadius: '4px',
                                        background: (sendAllotmentLoading || !allotmentNotes.trim()) ? '#6c757d' : '#007bff',
                                        color: 'white',
                                        cursor: (sendAllotmentLoading || !allotmentNotes.trim()) ? 'not-allowed' : 'pointer',
                                        fontSize: '14px',
                                    }}
                                >
                                    {sendAllotmentLoading ? 'Sending...' : 'Send for Allotment Letter'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </SmallModal>

            {/* Reminder Popup */}
            <ReminderPopup
                isOpen={showReminderPopup}
                onClose={() => setShowReminderPopup(false)}
                title="Reminder List"
            // bookingId={selectedBookingId}
            />
        </div>
    );
};

export default AllotmentList;
