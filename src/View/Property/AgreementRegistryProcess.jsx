import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BookingWrapper from "./style";
import PropertyNavigation from "./PropertyNavigation";
import axiosInstance from "../../utilities/axiosInstance";
import API_ENDPOINTS from "../../utilities/apiConfig";
import { formatDisplayDate, formatDateForInput } from "../../utilities/dateUtils";
import Swal from "sweetalert2";
import "./AgreementDraftStatus.css";

export default function AgreementRegistryProcess() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [registrySubmitted, setRegistrySubmitted] = useState(false);
    const [submissionDate, setSubmissionDate] = useState("");
    const [registryCompleted, setRegistryCompleted] = useState(false);
    const [completionDate, setCompletionDate] = useState("");
    const [registryReceived, setRegistryReceived] = useState(false);
    const [receivedDate, setReceivedDate] = useState("");
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);
    const [booking, setBooking] = useState(null);
    const [loadingBooking, setLoadingBooking] = useState(true);

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
                        bookingDate: bookingData.bookingDate || new Date().toISOString().split('T')[0]
                    });
                }
            } catch (error) {

            } finally {
                setLoadingBooking(false);
            }
        };

        fetchBookingDetails();
    }, [id]);

    const handleSubmittedChange = (checked) => {
        setRegistrySubmitted(checked);
        if (checked && !submissionDate) {
            setSubmissionDate(new Date().toISOString().split('T')[0]);
        }
    };

    const handleCompletedChange = (checked) => {
        setRegistryCompleted(checked);
        if (checked && !completionDate) {
            setCompletionDate(new Date().toISOString().split('T')[0]);
        }
    };

    const handleReceivedChange = (checked) => {
        setRegistryReceived(checked);
        if (checked && !receivedDate) {
            setReceivedDate(new Date().toISOString().split('T')[0]);
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

        if (!registrySubmitted && !registryCompleted && !registryReceived && !note.trim()) {
            Swal.fire({
                icon: "warning",
                title: "No Changes to Save",
                text: "Please make at least one selection or add a note before saving.",
            });
            return;
        }

        const payload = {
            bookingId,
            isRegistrySubmitted: registrySubmitted,
            registrySubmittedOn: registrySubmitted && submissionDate ? new Date(submissionDate).toISOString() : null,
            isRegistryCompleted: registryCompleted,
            registryCompletedOn: registryCompleted && completionDate ? new Date(completionDate).toISOString() : null,
            isRegistryReceived: registryReceived,
            registryReceivedOn: registryReceived && receivedDate ? new Date(receivedDate).toISOString() : null,
            notes: note.trim() || "",
            request: "update_registry_status"
        };

        setLoading(true);
        try {
            Swal.fire({
                icon: "success",
                title: "Agreement Registry Status Updated Successfully",
                timer: 1800,
                showConfirmButton: false,
            });

            navigate(`/property?refresh=${Date.now()}`);
        } catch (err) {

            Swal.fire({
                icon: "error",
                title: "Failed to Update",
                text: "Something went wrong while updating the registry status.",
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
                        </svg>
                    </div>
                    <div>
                        <h2>Agreement Registry Process</h2>
                        <p className="agreement-draft-subtitle">Track agreement registry submission and completion</p>
                    </div>
                </div>
                <PropertyNavigation hideHealthButton />
            </div>

            {!loadingBooking && booking ? (
                <div className="card booking-info-card">
                    <div className="booking-info-two-column">
                        <div className="info-row">
                            <span className="info-label">Township:</span>
                            <span className="info-value">{booking?.township || 'N/A'}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Plot:</span>
                            <span className="info-value">{booking?.plotNumber || 'N/A'}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Client:</span>
                            <span className="info-value">{booking?.clientName || 'N/A'}</span>
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
                    <h3>Registry Status</h3>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="agreement-draft-section">
                        <div className="agreement-form-row">
                            <CheckboxItem
                                id="registrySubmitted"
                                checked={registrySubmitted}
                                onChange={handleSubmittedChange}
                                label="Registry Submitted"
                            />
                            <div className="agreement-date-field-inline">
                                <label htmlFor="submissionDate" className="date-label">
                                    Submission Date {registrySubmitted && <span className="required-asterisk">*</span>}
                                </label>
                                <input
                                    type="date"
                                    id="submissionDate"
                                    value={submissionDate}
                                    onChange={(e) => setSubmissionDate(e.target.value)}
                                    disabled={!registrySubmitted}
                                />
                            </div>
                        </div>

                        <div className="agreement-form-row">
                            <CheckboxItem
                                id="registryCompleted"
                                checked={registryCompleted}
                                onChange={handleCompletedChange}
                                label="Registry Completed"
                            />
                            <div className="agreement-date-field-inline">
                                <label htmlFor="completionDate" className="date-label">
                                    Completion Date {registryCompleted && <span className="required-asterisk">*</span>}
                                </label>
                                <input
                                    type="date"
                                    id="completionDate"
                                    value={completionDate}
                                    onChange={(e) => setCompletionDate(e.target.value)}
                                    disabled={!registryCompleted}
                                />
                            </div>
                        </div>

                        <div className="agreement-form-row">
                            <CheckboxItem
                                id="registryReceived"
                                checked={registryReceived}
                                onChange={handleReceivedChange}
                                label="Registry Documents Received"
                            />
                            <div className="agreement-date-field-inline">
                                <label htmlFor="receivedDate" className="date-label">
                                    Received Date {registryReceived && <span className="required-asterisk">*</span>}
                                </label>
                                <input
                                    type="date"
                                    id="receivedDate"
                                    value={receivedDate}
                                    onChange={(e) => setReceivedDate(e.target.value)}
                                    disabled={!registryReceived}
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
                                placeholder="Enter any notes or remarks about the registry process..."
                                rows="3"
                            />
                        </div>
                    </div>

                    <div className="agreement-draft-actions">
                        <button type="button" className="small-btn secondary" onClick={() => navigate(-1)}>
                            Cancel
                        </button>
                        <button type="submit" className="small-btn primary" disabled={loading}>
                            {loading ? "Saving..." : "Save Status"}
                        </button>
                    </div>
                </form>
            </div>
        </BookingWrapper>
    );
}