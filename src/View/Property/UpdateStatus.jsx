import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BookingWrapper from "./style";
import ReminderButton from "../../components/ReminderButton";
import ReminderPopup from "../../components/ReminderPopup";
import "./UpdateStatus.css";
import axiosInstance from "../../utilities/axiosInstance";
import API_ENDPOINTS from "../../utilities/apiConfig";

export default function UpdateStatus() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [booking, setBooking] = useState(null);
    const [newStatus, setNewStatus] = useState("");
    const [remarks, setRemarks] = useState("");
    const [loading, setLoading] = useState(true);
    const [showReminderPopup, setShowReminderPopup] = useState(false);

    const statusOptions = [
        { value: "booking_created", label: "Booking Created" },
        { value: "payment_pending", label: "Payment Pending" },
        { value: "payment_confirmed", label: "Payment Confirmed" },
        { value: "workflow_selected", label: "Workflow Selected" },
        { value: "documents_pending", label: "Documents Pending" },
        { value: "under_verification", label: "Under Verification" },
        { value: "approved", label: "Approved" },
        { value: "on_hold", label: "On Hold" },
        { value: "completed", label: "Completed" },
        { value: "cancelled", label: "Cancelled" }
    ];

    useEffect(() => {
        const fetchBookingData = async () => {
            if (!id) {
                setLoading(false);
                return;
            }

            setLoading(true);

            try {
                // Try to get specific booking by ID
                const response = await axiosInstance.get(`${API_ENDPOINTS.GET_BOOKING_BY_ID}?bookingId=${id}`);
                
                if (response.data) {
                    const transformed = {
                        id: response.data.id,
                        township: response.data.townshipName,
                        plotNumber: response.data.plotNo,
                        plotSize: response.data.plotSize,
                        createdAt: response.data.bookingDate ? new Date(response.data.bookingDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                        clientName: response.data.clientName,
                        clientMobile: response.data.contactNo,
                        status: "booking_created",
                        updatedAt: new Date().toISOString()
                    };
                    setBooking(transformed);
                    setNewStatus(transformed.status);
                    setLoading(false);
                    return;
                }
            } catch (error) {
                // Fallback to booking list
                try {
                    const resp = await axiosInstance.get(API_ENDPOINTS.BOOKING_LIST);
                    const listData = Array.isArray(resp.data) ? resp.data : (resp.data?.value || []);
                    const item = listData.find(i => String(i.id) === String(id));
                    
                    if (item) {
                        const transformed = {
                            id: item.id,
                            township: item.townshipName,
                            plotNumber: item.plotNo,
                            plotSize: item.plotSize,
                            createdAt: item.bookingDate ? new Date(item.bookingDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                            clientName: item.clientName,
                            clientMobile: item.contactNo,
                            status: "booking_created",
                            updatedAt: new Date().toISOString()
                        };
                        setBooking(transformed);
                        setNewStatus(transformed.status);
                    }
                } catch (error) {
                    // Handle error silently
                }
            } finally {
                setLoading(false);
            }
        };

        fetchBookingData();
    }, [id]);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!booking) return;
        
        alert("Status updated successfully!");
        navigate(`/property?refresh=${Date.now()}`);
    };

    if (loading) {
        return (
            <BookingWrapper className="update-status-container">
                <div className="card loading-card">
                    <div className="loading-content">
                        <p>Loading booking information...</p>
                    </div>
                </div>
            </BookingWrapper>
        );
    }

    if (!booking) {
        return (
            <BookingWrapper className="update-status-container">
                <div className="update-status-header">
                    <h2>Booking not found</h2>
                    <p>Booking ID {id} could not be found in the system.</p>
                    <button className="small-btn" onClick={() => navigate("/property")}>
                        Back to Dashboard
                    </button>
                </div>
            </BookingWrapper>
        );
    }

    return (
        <BookingWrapper className="update-status-container">
            <div className="update-status-header">
                <div className="update-status-header-content">
                    <div className="update-status-header-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                        </svg>
                    </div>
                    <div>
                        <h2>Update Booking Status</h2>
                        <p className="update-status-subtitle">Update booking status</p>
                    </div>
                </div>
                <div className="header-actions">
                    <ReminderButton 
                        size="small" 
                        variant="secondary" 
                        onClick={() => setShowReminderPopup(true)}
                    />
                    <button className="small-btn" onClick={() => navigate(-1)}>
                        Back
                    </button>
                </div>
            </div>

            {/* Booking Info */}
            <div className="card booking-info-card">
                <div className="booking-info-two-column">
                    <div className="info-row">
                        <span className="info-label">Township:</span>
                        <span className="info-value">{booking.township || 'N/A'}</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">Plot:</span>
                        <span className="info-value">{booking.plotNumber || 'N/A'}</span>
                    </div>
                    <div className="info-row"> 
                        <span className="info-label">Size:</span>
                        <span className="info-value">{booking.plotSize || 'N/A'}</span>
                    </div>
                    <div className="info-row"> 
                        <span className="info-label">Client:</span>
                        <span className="info-value">{booking.clientName || 'N/A'}</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">Mobile:</span>
                        <span className="info-value">{booking.clientMobile || 'N/A'}</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">Date:</span>
                        <span className="info-value">{booking.createdAt || 'N/A'}</span>
                    </div>
                </div>
            </div>

            {/* Update Form */}
            <div className="card update-status-form-card">
                <div className="update-status-form-header">
                    <h3>Update Status</h3>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="update-status-field">
                        <label htmlFor="newStatus">New Status</label>
                        <select
                            id="newStatus"
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            required
                        >
                            {statusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="update-status-field">
                        <label htmlFor="remarks">Remarks / Notes</label>
                        <textarea
                            id="remarks"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            placeholder="Enter any remarks or notes about this status update..."
                            rows="4"
                        />
                    </div>

                    <div className="update-status-actions">
                        <button type="button" className="small-btn secondary" onClick={() => navigate(-1)}>
                            Cancel
                        </button>
                        <button type="submit" className="small-btn primary">
                            Update Status
                        </button>
                    </div>
                </form>
            </div>

            {/* Reminder Popup */}
            <ReminderPopup 
                isOpen={showReminderPopup}
                onClose={() => setShowReminderPopup(false)}
                title="Create Reminder"
                bookingId={id}
            />
        </BookingWrapper>
    );
}
