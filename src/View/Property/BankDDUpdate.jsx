import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BookingWrapper from "./style";
import PropertyNavigation from "./PropertyNavigation";
import ReminderButton from "../../components/ReminderButton";
import ReminderPopup from "../../components/ReminderPopup";
import axiosInstance from "../../utilities/axiosInstance";
import API_ENDPOINTS from "../../utilities/apiConfig";
import { formatDisplayDate, formatDateForInput } from "../../utilities/dateUtils";
import Swal from "sweetalert2";
import "./BankDDUpdate.css";

export default function BankDDUpdate() {
    const navigate = useNavigate();
    const { id } = useParams();
    
    const [loading, setLoading] = useState(false);
    const [bookingExists, setBookingExists] = useState(null);
    const [checkingBooking, setCheckingBooking] = useState(true);
    const [booking, setBooking] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    
    // Form fields matching the new design
    const [ddSubmittedToBank, setDdSubmittedToBank] = useState(false);
    const [ddSubmittedDate, setDdSubmittedDate] = useState("");
    const [notes, setNotes] = useState("");
    const [ddNumber, setDdNumber] = useState("");
const [ddAmount, setDdAmount] = useState("");

    // Reminder popup state
    const [showReminderPopup, setShowReminderPopup] = useState(false);


    useEffect(() => {
        const fetchAllData = async () => {
            if (!id || isNaN(Number(id))) {
                setBookingExists(false);
                setCheckingBooking(false);
                
                Swal.fire({
                    icon: "error",
                    title: "Invalid Booking ID",
                    text: "Please navigate from the Booking Dashboard",
                    confirmButtonText: "Go to Dashboard"
                }).then(() => {
                    navigate("/property");
                });
                return;
            }

            try {
                setCheckingBooking(true);
                
                // Fetch all bookings to check if this ID exists
                const response = await axiosInstance.get(API_ENDPOINTS.BOOKING_LIST);
                const bookingsList = Array.isArray(response.data) 
                    ? response.data 
                    : (response.data?.value || []);
                
                const bookingData = bookingsList.find(b => b.id === Number(id));
                
                if (!bookingData) {
                    setBookingExists(false);
                    
                    Swal.fire({
                        icon: "warning",
                        title: "Booking Not Found",
                        html: `
                            <p>Booking ID <strong>${id}</strong> does not exist in the system.</p>
                            <p>Please select a valid booking from the dashboard.</p>
                        `,
                        confirmButtonText: "Go to Dashboard"
                    }).then(() => {
                        navigate("/property");
                    });
                    return;
                }

                // Set booking exists and details
                setBookingExists(true);
                setBooking({
                    id: bookingData.id,
                    township: bookingData.townshipName,
                    plotNumber: bookingData.plotNo,
                    plotSize: bookingData.plotSize,
                    clientName: bookingData.clientName,
                    clientMobile: bookingData.contactNo,
                    bookingDate: bookingData.bookingDate || new Date().toISOString().split('T')[0]
                });

                // Fetch booking detail for prefill
                const detailRes = await axiosInstance.get(
                    `${API_ENDPOINTS.GET_BOOKING_BY_ID}?bookingId=${bookingData.id}`
                );
                const detail = detailRes?.data || {};
 
                // Prefill fields if they exist in the booking detail
                if (detail.isDDSubmittedToBank) {
                    setDdSubmittedToBank(detail.isDDSubmittedToBank);
                }
                if (detail.ddSubmittedOn) {
                    setDdSubmittedDate(formatDateForInput(detail.ddSubmittedOn));
                }
                if (detail.ddUpdateNotes) {
                    setNotes(detail.ddUpdateNotes);
                }
                if (detail.ddSubmittedDDNo) {
                    setDdNumber(detail.ddSubmittedDDNo);
                }

                if (detail.ddSubmittedAmount) {
                    setDdAmount(detail.ddSubmittedAmount);
                }

            } catch (error) {
                // If we can't verify, allow user to proceed (might be API issue)
                setBookingExists(true);
                Swal.fire({
                    icon: "error",
                    title: "Error Loading Data",
                    text: "Failed to load booking details. You may continue, but some data may not load.",
                });
            } finally {
                setCheckingBooking(false);
            }
        };

        fetchAllData();
    }, [id, navigate]);

    // Validate form before submission
    const validateForm = () => {
        const errors = {};
        
        // BookingId is required
        if (!id || isNaN(Number(id))) {
            errors.bookingId = "Valid booking ID is required";
        }
        
        // If DD is submitted to bank, date is required
        if (ddSubmittedToBank && !ddSubmittedDate.trim()) {
            errors.ddSubmittedDate = "DD Submitted Date is required when DD is submitted to bank";
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form
        if (!validateForm()) {
            const errorMessages = Object.values(formErrors);
            Swal.fire({
                icon: "error",
                title: "Validation Error",
                html: `
                    <p>Please fix the following issues:</p>
                    <ul style="text-align: left; margin: 10px 0;">
                        ${errorMessages.map(error => `<li>${error}</li>`).join('')}
                    </ul>
                `,
                confirmButtonText: "OK"
            });
            return;
        }

        const bookingId = Number(id);
        if (!bookingId || isNaN(bookingId)) {
            Swal.fire({
                icon: "error",
                title: "Missing Booking ID",
                text: "Invalid booking ID in URL. Please navigate from the booking list.",
            });
            return;
        }

        // Create request data for Bank DD Update
        const requestData = {
    BookingId: bookingId,
    IsDDSubmittedToBank: ddSubmittedToBank,
    DDSubmittedOn: ddSubmittedDate,
    Notes: notes.trim() || null,
    ddSubmittedDDNo: ddNumber || null,
    ddSubmittedAmount: Number(ddAmount) || 0
};
        
        setLoading(true);
        try {
            const res = await axiosInstance.post(
                API_ENDPOINTS.UPDATE_BANK_DD_STATUS, // You'll need to add this endpoint
                requestData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    }
                }
            );

            // Check if response indicates success
            const isSuccess = res.status === 200 || res.data === true || res.data?.success === true;

            if (isSuccess) {
                Swal.fire({
                    icon: "success",
                    title: "Bank DD Status Updated Successfully",
                    text: "Bank DD information has been updated",
                    timer: 2000,
                    showConfirmButton: false,
                });

                // Wait a bit before navigating to show the success message
                setTimeout(() => {
                    navigate(`/property?refresh=${Date.now()}`);
                }, 2000);
            } else {
                // API returned false or unexpected response
                Swal.fire({
                    icon: "warning",
                    title: "Unexpected Response",
                    html: `
                        <p>The update may not have been saved. Please verify.</p>
                    `,
                });
            }
        } catch (err) {
            const status = err.response?.status;
            const errorData = err.response?.data;
            let msg = "Something went wrong";
            let detailMsg = "";

            if (status === 400) {
                msg = "Invalid request data";
                detailMsg = errorData?.message || errorData?.title || JSON.stringify(errorData);
            } else if (status === 404) {
                msg = `Booking ID ${id} not found`;
                detailMsg = "The booking does not exist in the database. Please check the booking ID.";
            } else if (status === 500) {
                msg = "Internal Server Error";
                detailMsg = errorData?.message || errorData?.title || "Server encountered an error";
            } else if (!err.response) {
                msg = "Network Error - Cannot connect to server";
                detailMsg = "Check CORS settings or server availability";
            }

            Swal.fire({
                icon: "error",
                title: `Failed (${status || "Network Error"})`,
                html: `
                    <p><strong>${msg}</strong></p>
                    <p>${detailMsg}</p>
                `,
            });
        } finally {
            setLoading(false);
        }
    };

    // Show loading while checking booking
    if (checkingBooking) {
        return (
            <BookingWrapper className="dashboard-container">
                <div className="dashboard-header">
                    <div className="dashboard-header-content">
                        
                        <div>
                            <h1 className="dashboard-title">Bank DD Update</h1>
                            <p className="dashboard-subtitle">
                                Verifying booking...
                            </p>
                        </div>
                    </div>
                    <PropertyNavigation hideHealthButton />
                </div>
                <div className="card">
                    <div style={{ padding: '40px', textAlign: 'center' }}>
                        <p>Verifying booking ID {id}...</p>
                    </div>
                </div>
            </BookingWrapper>
        );
    }

    // Don't show form if booking doesn't exist
    if (bookingExists === false) {
        return (
            <BookingWrapper className="dashboard-container">
                <div className="dashboard-header">
                    <div className="dashboard-header-content">
                        <div className="dashboard-header-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                                <line x1="1" y1="10" x2="23" y2="10"></line>
                            </svg>
                        </div>
                        <div>
                            <h1 className="dashboard-title">Bank DD Update</h1>
                            <p className="dashboard-subtitle">
                                Booking not found
                            </p>
                        </div>
                    </div>
                    <PropertyNavigation hideHealthButton />
                </div>
                <div className="bank-dd-form-section">
                    <div style={{ padding: '40px', textAlign: 'center' }}>
                        <p>Booking ID {id} does not exist.</p>
                        <button 
                            className="primary-btn" 
                            onClick={() => navigate("/property")}
                            style={{ marginTop: '20px' }}
                        >
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            </BookingWrapper>
        );
    }

    return (
        <BookingWrapper className="dashboard-container">
            {/* Header */}
            <div className="dashboard-header">
                <div className="dashboard-header-content">
                    <div>
                        <h1 className="dashboard-title">Bank DD Update</h1>
                        <p className="dashboard-subtitle">Track bank demand draft submission and clearance</p>
                    </div>
                </div>
                <div className="dashboard-header-actions">
                                    
                                    <button
                                        onClick={() => navigate("/property")}
                                        className="primary-btn"
                                    >
                                        Back
                                    </button>
                                    <ReminderButton
                                        size="small"
                                        variant="outline"
                                        onClick={() => setShowReminderPopup(true)}
                                    />
                                </div>
            </div>

            {/* Booking Information Section */}
            <div className="card">
                {!checkingBooking && booking ? (
                    <div className="">
    <div className="booking-info-matrix">

        <div className="booking-info-row">
            <label>Township :</label>
            <span className="booking-info-value">
                {booking?.township || 'N/A'}
            </span>
        </div>

        <div className="booking-info-row">
            <label>Plot :</label>
            <span className="booking-info-value">
                {booking?.plotNumber || 'N/A'}
            </span>
        </div>

        <div className="booking-info-row">
            <label>Size :</label>
            <span className="booking-info-value">
                {booking?.plotSize || 'N/A'}
            </span>
        </div>

        <div className="booking-info-row">
            <label>Client :</label>
            <span className="booking-info-value">
                {booking?.clientName || 'N/A'}
            </span>
        </div>

        <div className="booking-info-row">
            <label>Mobile :</label>
            <span className="booking-info-value">
                {booking?.clientMobile || 'N/A'}
            </span>
        </div>

        <div className="booking-info-row">
            <label>Booking Date :</label>
            <span className="booking-info-value">
                {booking?.bookingDate
                    ? formatDisplayDate(booking.bookingDate)
                    : 'N/A'}
            </span>
        </div>

    </div>
</div>

                ) : (
                    <div className="booking-info-loading">
                        <p>{id ? 'Loading booking information...' : 'No booking selected'}</p>
                    </div>
                )}
            </div>

            {/* Bank DD Update Form Section */}
            <div className="card">
                <div className="dashboard-table-header">
                    <div className="dashboard-table-title">
                        Bank DD Status Update
                    </div>
                </div>
                <div className="bank-dd-form-container">
                <form onSubmit={handleSubmit}>
                    <div className="row">
                        <div className="col-md-12">
                            <div className={`bank-dd-checkbox-container ${ddSubmittedToBank ? 'checked' : ''}`}>
                        <input
                            type="checkbox"
                            id="ddSubmittedToBank"
                            checked={ddSubmittedToBank}
                            onChange={(e) => {
                                setDdSubmittedToBank(e.target.checked);
                                // Clear date if unchecking
                                if (!e.target.checked) {
                                    setDdSubmittedDate("");
                                }
                            }}
                            className="bank-dd-checkbox"
                        />
                        <label htmlFor="ddSubmittedToBank" className="bank-dd-checkbox-label">
                            DD Submitted to Bank <span className="required-asterisk">*</span>
                        </label>
                        {ddSubmittedToBank && !formErrors.ddSubmittedDate && (
                            <div className="bank-dd-checkmark">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="20,6 9,17 4,12"></polyline>
                                </svg>
                            </div>
                        )}
                    </div>
                        </div>
                        <div className="col-md-6">
                            {/* DD Submitted Date */}
                    <div className={`form-group ${formErrors.ddSubmittedDate ? 'has-error' : ''}`}>
                        <label htmlFor="ddSubmittedDate" className="bank-dd-field-label">
                            DD Submitted to Bank Date <span className="required-asterisk">*</span>
                        </label>
                        <input
                            type="date"
                            id="ddSubmittedDate"
                            value={ddSubmittedDate}
                            onChange={(e) => {
                                setDdSubmittedDate(e.target.value);
                                if (e.target.value.trim()) {
                                    setFormErrors(prev => ({ ...prev, ddSubmittedDate: undefined }));
                                }
                            }}
                            className="form-control"
                            placeholder="Please select a date"
                        />
                        {formErrors.ddSubmittedDate && (
                            <div className="error-message">{formErrors.ddSubmittedDate}</div>
                        )}
                        {/* <p className="required-note">Please select a date</p> */}
                    </div>
                        </div>
                        <div className="col-md-6">
                            {/* Notes Field */}
                    <div className="form-group">
                        <label htmlFor="notes" className="bank-dd-field-label">
                            Notes (Optional)
                        </label>
                        <textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Enter any notes about the DD update..."
                            className="form-control"
                        />
                    </div>
                        </div>
                        <div className="col-md-6">
  <div className="form-group">
    <label className="bank-dd-field-label">
      Transaction ID (DD No)
    </label>
    <input
      type="text"
      value={ddNumber}
      onChange={(e) => setDdNumber(e.target.value)}
      className="form-control"
      placeholder="Enter transaction / DD number"
    />
  </div>
</div>

<div className="col-md-6">
  <div className="form-group">
    <label className="bank-dd-field-label">
      Amount
    </label>
    <input
      type="number"
      value={ddAmount}
      onChange={(e) => setDdAmount(e.target.value)}
      className="form-control"
      placeholder="Enter amount"
    />
  </div>
</div>
                    </div>
                    

                    

                    

                    {/* Action Buttons */}
                    <div className="form-actions">
                        {/* <ReminderButton 
                            size="small" 
                            variant="outline" 
                            onClick={() => setShowReminderPopup(true)}
                        /> */}
                        {/* <button 
                            type="button" 
                            className="small-btn secondary" 
                            onClick={() => navigate(-1)}
                        >
                            Cancel
                        </button> */}
                        <button 
                            type="submit" 
                            className="primary-btn" 
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Save Bank DD Status"}
                        </button>
                    </div>
                </form>
                </div>
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