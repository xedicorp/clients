import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BookingWrapper from "./style";
import PropertyNavigation from "./PropertyNavigation";
import ReminderButton from "../../components/ReminderButton";
import ReminderPopup from "../../components/ReminderPopup";
import axiosInstance from "../../utilities/axiosInstance";
import API_ENDPOINTS from "../../utilities/apiConfig";
import { formatDisplayDate, toLocalIsoDate } from "../../utilities/dateUtils";
import Swal from "sweetalert2";
import "./LoanSanctionStatus.css";

export default function LoanSanctionStatus() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [isLoanSanctioned, setIsLoanSanctioned] = useState(false);
    const [loanSanctionedOn, setLoanSanctionedOn] = useState("");
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);
    const [booking, setBooking] = useState(null);
    const [loadingBooking, setLoadingBooking] = useState(true);
    const [showReminderPopup, setShowReminderPopup] = useState(false);
    const [isReminderPopupOpen, setIsReminderPopupOpen] = useState(false);

    // Fetch booking details
    useEffect(() => {
        const fetchBookingDetails = async () => {
            if (!id) return;

            try {
                const response = await axiosInstance.get(API_ENDPOINTS.BOOKING_LIST);
                const bookingsList = Array.isArray(response.data) ? response.data : (response.data?.value || []);
                const bookingData = bookingsList.find(b => b.id === Number(id));

                if (bookingData) {
                    setBooking({
                        id: bookingData.id,
                        township: bookingData.townshipName,
                        plotNumber: bookingData.plotNo,
                        plotSize: bookingData.plotSize,
                        clientName: bookingData.clientName,
                        clientMobile: bookingData.contactNo,
                        bookingDate: bookingData.bookingDate || toLocalIsoDate(new Date())
                    });

                    // Prefill loan sanction data if exists
                    try {
                        const detailRes = await axiosInstance.get(
                            `${API_ENDPOINTS.GET_BOOKING_BY_ID}?bookingId=${bookingData.id}`
                        );
                        const detail = detailRes?.data || {};

                        if (typeof detail.isLoanSanctioned === "boolean") {
                            setIsLoanSanctioned(detail.isLoanSanctioned);
                        }
                        if (detail.loanSanctionDate) {
                            const formattedDate = toLocalIsoDate(detail.loanSanctionDate);
                            if (formattedDate) {
                                setLoanSanctionedOn(formattedDate);
                            }
                        }
                        if (detail.loanSanctionNotes) {
                            setNote(detail.loanSanctionNotes);
                        }
                    } catch (prefillErr) {
                        // Silently fail prefill
                    }
                }
            } catch (error) {
                // Handle error silently
            } finally {
                setLoadingBooking(false);
            }
        };

        fetchBookingDetails();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isLoanSanctioned) {
            Swal.fire({
                icon: "warning",
                title: "Incomplete Information",
                text: "Please confirm Is Loan Sanctioned",
            });
            return;
        }

        if (!loanSanctionedOn) {
            Swal.fire({
                icon: "warning",
                title: "Incomplete Information",
                text: "Please fill Loan Sanction Date",
            });
            return;
        }

        const bookingId = Number(id);
        if (!bookingId) {
            Swal.fire({
                icon: "error",
                title: "Missing Booking ID",
                text: "Invalid booking ID in URL.",
            });
            return;
        }

        const payload = {
            bookingId,
            isLoanSanctioned,
            loanSanctionDate: loanSanctionedOn,
            notes: note.trim() || "string",
        };

        setLoading(true);
        try {
            await axiosInstance.post(
                API_ENDPOINTS.UPDATE_LOAN_SANCTION_STATUS,
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            Swal.fire({
                icon: "success",
                title: "Loan Sanction Status Updated Successfully",
                timer: 1800,
                showConfirmButton: false,
            });

            navigate(`/property?refresh=${Date.now()}`);
        } catch (err) {
            const status = err.response?.status;
            const errorData = err.response?.data;
            let msg = "Something went wrong";

            if (status === 400) {
                msg = errorData?.message || errorData?.title || "Invalid request data";
            } else if (status === 404) {
                msg = `Booking ID ${id} not found`;
            } else if (status === 500) {
                msg = errorData?.message || errorData?.title || "Internal Server Error";
            } else if (!err.response) {
                msg = "Network Error - Cannot connect to server";
            }

            Swal.fire({
                icon: "error",
                title: `Failed (${status || "Network Error"})`,
                text: msg,
            });
        } finally {
            setLoading(false);
        }
    };

    const CheckboxItem = ({ id, checked, onChange, label }) => (
        <div
            className={`bank-dd-checkbox-container  ${checked ? 'checked' : ''}`}
            onClick={() => onChange(!checked)}
        >
            <input
                type="checkbox"
                id={id}
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="loan-checkbox"
                onClick={(e) => e.stopPropagation()}
            />
            <label htmlFor={id} className="loan-checkbox-label">{label}</label>
            {checked && (
                <svg className="loan-checkmark" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            )}
        </div>
    );

    return (
        <BookingWrapper className="dashboard-container">
            <div className="dashboard-header">
                <div className="dashboard-header-content">
                    <div className="dashboard-header-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                        </svg>
                    </div>
                    <div>
                        <h2 className="dashboard-title">Loan Sanction Status</h2>
                        <p className="dashboard-subtitle">Track and manage loan sanction status</p>
                    </div>
                </div>
                <div className="dashboard-header-actions">
                    <button className="primary-btn" onClick={() => navigate(-1)}>
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
                    {/* <PropertyNavigation hideHealthButton bookingId={id} /> */}
                    <button className="primary-btn" onClick={() => setIsReminderPopupOpen(true)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            Reminder
                        </button>
                </div>
            </div>

            {/* Booking Information */}
            {!loadingBooking && booking ? (
                <div className="card">
                    <div className="booking-info-matrix">
                        <div className="booking-info-row">
                            <label>Township</label>
                            <span className="booking-info-value">{booking.township || 'N/A'}</span>
                        </div>

                        <div className="booking-info-row">
                            <label>Plot</label>
                            <span className="booking-info-value">{booking.plotNumber || 'N/A'}</span>
                        </div>

                        <div className="booking-info-row">
                            <label>Size</label>
                            <span className="booking-info-value">{booking.plotSize || 'N/A'}</span>
                        </div>

                        <div className="booking-info-row">
                            <label>Client</label>
                            <span className="booking-info-value">{booking.clientName || 'N/A'}</span>
                        </div>

                        <div className="booking-info-row">
                            <label>Mobile</label>
                            <span className="booking-info-value">{booking.clientMobile || 'N/A'}</span>
                        </div>

                        <div className="booking-info-row">
                            <label>Booking Date</label>
                            <span className="booking-info-value">
                                {booking.bookingDate ? formatDisplayDate(booking.bookingDate) : 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>

            ) : (
                <div className="card">
                    <div style={{ padding: '15px', textAlign: 'center' }}>
                        <p>Loading booking information...</p>
                    </div>
                </div>
            )}

            <div className="card">
                <form onSubmit={handleSubmit}>
                    <div className="loan-sanction-form">
                        <CheckboxItem
                            id="isLoanSanctioned"
                            checked={isLoanSanctioned}
                            onChange={setIsLoanSanctioned}
                            label={<span>Is Loan Sanctioned <span className="required-star">*</span></span>}
                        />

                        <div className="loan-field">
                            <label htmlFor="loanSanctionedOn">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                                Loan Sanctioned On <span className="required-star">*</span>
                            </label>
                            <input
                                type="date"
                                id="loanSanctionedOn"
                                value={loanSanctionedOn}
                                onChange={(e) => setLoanSanctionedOn(e.target.value)}
                                required
                                className="form-control"
                            />
                        </div>

                        <div className="loan-field loan-note-field">
                            <label htmlFor="note">Note</label>
                            <textarea
                                id="note"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Enter any notes..."
                                className="form-control"
                            />
                        </div>
                    </div>

                    <div className="loan-form-actions">
                        {/* <button 
                            type="button" 
                            className="reminder-btn small outline"
                            onClick={() => setShowReminderPopup(true)}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M6 2v6h.01M6 8.01L6 8M6 8v6l4 4h8a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H8L6 8z"/>
                                <path d="M12 12h4"/>
                                <path d="M12 16h2"/>
                            </svg>
                            <span>Reminder</span>
                        </button> */}
                        <button type="submit" className="primary-btn" disabled={loading}>
                            {loading ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Reminder Popup */}
           <ReminderPopup
                                   isOpen={isReminderPopupOpen}
                                   onClose={() => setIsReminderPopupOpen(false)}
                                   title="Payment Reminders"
                                   bookingId={id}
                               />
        </BookingWrapper>
    );
}