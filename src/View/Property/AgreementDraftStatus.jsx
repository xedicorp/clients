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
import "./AgreementDraftStatus.css";

export default function AgreementDraftStatus() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [agreementDraftReady, setAgreementDraftReady] = useState(false);
    const [draftReadyDate, setDraftReadyDate] = useState("");
    const [agreementDraftGivenToBank, setAgreementDraftGivenToBank] = useState(false);
    const [givenToBankDate, setGivenToBankDate] = useState("");
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);
    const [apiResponse, setApiResponse] = useState(null);
    const [booking, setBooking] = useState(null);
    const [loadingBooking, setLoadingBooking] = useState(true);
    const [showReminderPopup, setShowReminderPopup] = useState(false);


    useEffect(() => {
        const fetchAllData = async () => {
            if (!id) return;

            try {
                setLoadingBooking(true);
                
                // Fetch booking list
                const response = await axiosInstance.get(API_ENDPOINTS.BOOKING_LIST);
                const bookingsList = Array.isArray(response.data) 
                    ? response.data 
                    : (response.data?.value || []);
                
                const bookingData = bookingsList.find(b => b.id === Number(id));

                if (!bookingData) {
                    Swal.fire({
                        icon: "error",
                        title: "Booking Not Found",
                        text: `Booking with ID ${id} was not found.`,
                    });
                    navigate("/property");
                    return;
                }

                // Set booking details
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

                const detail = detailRes?.data;

                if (detail) {
                    // Prefill draft prepared data
                    if (typeof detail.isDraftPrepared === "boolean") {
                        setAgreementDraftReady(detail.isDraftPrepared);
                    }
                    if (detail.draftPreparedOn) {
                        setDraftReadyDate(formatDateForInput(detail.draftPreparedOn));
                    }

                    // Prefill draft given to bank data
                    if (typeof detail.isDraftGivenToBank === "boolean") {
                        setAgreementDraftGivenToBank(detail.isDraftGivenToBank);
                    }
                    if (detail.draftGivenToBankOn) {
                        setGivenToBankDate(formatDateForInput(detail.draftGivenToBankOn));
                    }

                    // Prefill notes
                    if (detail.notes && detail.notes !== "string") {
                        setNote(detail.notes);
                    }
                }

            } catch (error) {
                Swal.fire({
                    icon: "error",
                    title: "Error Loading Data",
                    text: "Failed to load booking details. Please try again.",
                });
            } finally {
                setLoadingBooking(false);
            }
        };

        fetchAllData();
    }, [id, navigate]);

    const handleDraftReadyChange = (checked) => {
        setAgreementDraftReady(checked);
        if (checked && !draftReadyDate) {
            setDraftReadyDate(new Date().toISOString().split('T')[0]);
        }
    };

    const handleGivenToBankChange = (checked) => {
        setAgreementDraftGivenToBank(checked);
        if (checked && !givenToBankDate) {
            setGivenToBankDate(new Date().toISOString().split('T')[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const bookingId = Number(id);
        if (!bookingId) {
            Swal.fire({
                icon: "error",
                title: "Missing Booking ID",
                text: "Invalid booking ID in URL.",
            });
            return;
        }

        // Validation
        if (agreementDraftReady && !draftReadyDate) {
            Swal.fire({
                icon: "warning",
                title: "Missing Date",
                text: "Please select a date when Agreement Draft is ready.",
            });
            return;
        }

        if (agreementDraftGivenToBank && !givenToBankDate) {
            Swal.fire({
                icon: "warning",
                title: "Missing Date", 
                text: "Please select a date when Agreement Draft was given to bank.",
            });
            return;
        }

        // Check if form is completely empty
        if (!agreementDraftReady && !agreementDraftGivenToBank && !note.trim()) {
            Swal.fire({
                icon: "warning",
                title: "No Changes to Save",
                text: "Please make at least one selection or add a note before saving.",
            });
            return;
        }

        // Prepare dates
        let draftPreparedOnValue = null;
        let draftGivenToBankOnValue = null;

        if (agreementDraftReady && draftReadyDate) {
            try {
                const date = new Date(draftReadyDate);
                if (isNaN(date.getTime())) {
                    throw new Error("Invalid date");
                }
                draftPreparedOnValue = date.toISOString();
            } catch (error) {
                Swal.fire({
                    icon: "error",
                    title: "Invalid Date",
                    text: "Please provide a valid draft ready date.",
                });
                return;
            }
        }

        if (agreementDraftGivenToBank && givenToBankDate) {
            try {
                const date = new Date(givenToBankDate);
                if (isNaN(date.getTime())) {
                    throw new Error("Invalid date");
                }
                draftGivenToBankOnValue = date.toISOString();
            } catch (error) {
                Swal.fire({
                    icon: "error",
                    title: "Invalid Date",
                    text: "Please provide a valid bank date.",
                });
                return;
            }
        }

        // Create payload
        const payload = {
            bookingId,
            isDraftPrepared: agreementDraftReady,
            isDraftGivenToBank: agreementDraftGivenToBank,
            notes: note.trim() || ""
        };

        if (agreementDraftReady && draftPreparedOnValue) {
            payload.draftPreparedOn = draftPreparedOnValue;
        }

        if (agreementDraftGivenToBank && draftGivenToBankOnValue) {
            payload.draftGivenToBankOn = draftGivenToBankOnValue;
        }

        setLoading(true);
        try {
            const res = await axiosInstance.post(
                API_ENDPOINTS.UPDATE_DRAFT_PREPARATION_STATUS,
                payload,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "text/plain"
                    }
                }
            );

            setApiResponse(res.data);

            Swal.fire({
                icon: "success",
                title: "Success!",
                text: "Draft preparation status updated successfully!",
                timer: 2500,
                showConfirmButton: true,
            });

            setTimeout(() => {
                navigate(`/property?refresh=${Date.now()}`);
            }, 1000);
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
                msg = "Network Error - Cannot connect to server.";
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
        <div className="agreement-checkbox-field">
            <label className="agreement-checkbox-container">
                <input
                    type="checkbox"
                    id={id}
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    className="agreement-checkbox"
                />
                <span className="agreement-checkbox-label">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    {label}
                </span>
            </label>
        </div>
    );

    return (
        <BookingWrapper className="agreement-draft-container">
            <div className="agreement-draft-header">
                <div className="agreement-draft-header-content">
                    <div className="agreement-draft-header-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                    </div>
                    <div>
                        <h2>Agreement Draft Status</h2>
                        <p className="agreement-draft-subtitle">Track agreement draft preparation and submission</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <PropertyNavigation hideHealthButton />
                </div>
            </div>

            {/* Booking Information */}
            {!loadingBooking && booking ? (
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
                            <span className="info-label">Booking Date:</span>
                            <span className="info-value">
                                {booking.bookingDate ? formatDisplayDate(booking.bookingDate) : 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="card booking-info-card">
                    <div style={{ padding: '15px', textAlign: 'center' }}>
                        <p>Loading booking information...</p>
                    </div>
                </div>
            )}

            <div className="card agreement-draft-form-card">
                <div className="agreement-draft-form-header">
                    <h3>Draft Status</h3>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="agreement-draft-section">
                        <div className="agreement-form-row">
                            <CheckboxItem
                                id="agreementDraftReady"
                                checked={agreementDraftReady}
                                onChange={handleDraftReadyChange}
                                label="Agreement Draft Ready"
                            />
                            <div className="agreement-date-field-inline">
                                <label htmlFor="draftReadyDate" className="date-label">
                                    Ready Date {agreementDraftReady && <span className="required-asterisk">*</span>}
                                </label>
                                <input
                                    type="date"
                                    id="draftReadyDate"
                                    value={draftReadyDate}
                                    onChange={(e) => setDraftReadyDate(e.target.value)}
                                    disabled={!agreementDraftReady}
                                />
                            </div>
                        </div>

                        <div className="agreement-form-row">
                            <CheckboxItem
                                id="agreementDraftGivenToBank"
                                checked={agreementDraftGivenToBank}
                                onChange={handleGivenToBankChange}
                                label="Agreement Draft Given to Bank"
                            />
                            <div className="agreement-date-field-inline">
                                <label htmlFor="givenToBankDate" className="date-label">
                                    Given to Bank Date {agreementDraftGivenToBank && <span className="required-asterisk">*</span>}
                                </label>
                                <input
                                    type="date"
                                    id="givenToBankDate"
                                    value={givenToBankDate}
                                    onChange={(e) => setGivenToBankDate(e.target.value)}
                                    disabled={!agreementDraftGivenToBank}
                                />
                            </div>
                        </div>

                        <div className="agreement-note-field">
                            <label htmlFor="note">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                </svg>
                                Notes & Remarks
                            </label>
                            <textarea
                                id="note"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Enter any notes or remarks about the agreement draft..."
                                rows="3"
                            />
                        </div>
                    </div>

                    <div className="agreement-draft-actions">
                        <button 
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
                        </button>
                        <button type="button" className="small-btn secondary" onClick={() => navigate(-1)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                            Cancel
                        </button>
                        <button type="submit" className="small-btn primary" disabled={loading}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            {loading ? "Saving..." : "Save Status"}
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
