import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import BookingWrapper from "./style";
import ReminderButton from "../../components/ReminderButton";
import ReminderPopup from "../../components/ReminderPopup";
import "./BookingSummary.css";
import axiosInstance from "../../utilities/axiosInstance";
import API_ENDPOINTS from "../../utilities/apiConfig";
import { formatDisplayDate, toLocalIsoDate } from "../../utilities/dateUtils";

export default function BookingSummary({ bookingId: propBookingId }) {
    const params = useParams();
    const id = propBookingId || params.id;
    const navigate = useNavigate();
    const [bookingData, setBookingData] = useState(null);
    const [bookingProgress, setBookingProgress] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showReminderPopup, setShowReminderPopup] = useState(false);

    // Consolidated data fetching
    useEffect(() => {
        const fetchAllData = async () => {
            if (!id) {
                setError('No booking ID provided');
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                // Fetch booking data
                const bookingResponse = await axiosInstance.get(
                    `${API_ENDPOINTS.GET_BOOKING_BY_ID}?bookingId=${id}`
                );

                if (bookingResponse.data) {
                    // Transform API response to match our booking structure
                    const transformedBooking = {
                        id: bookingResponse.data.id,
                        township: bookingResponse.data.townshipName,
                        plotNumber: bookingResponse.data.plotNo,
                        plotSize: bookingResponse.data.plotSize,
                        createdAt: bookingResponse.data.createdDate || bookingResponse.data.createdAt || bookingResponse.data.bookingDate ?
                            toLocalIsoDate(bookingResponse.data.createdDate || bookingResponse.data.createdAt || bookingResponse.data.bookingDate) :
                            toLocalIsoDate(new Date()),
                        confirmedDate: bookingResponse.data.dateOfTransfer ? toLocalIsoDate(bookingResponse.data.dateOfTransfer) : null,
                        clientName: bookingResponse.data.clientName,
                        clientEmail: bookingResponse.data.clientEmail,
                        clientMobile: bookingResponse.data.contactNo,
                        associateName: bookingResponse.data.associateName,
                        associateReraNo: bookingResponse.data.associateReraNo,
                        associateContactNo: bookingResponse.data.associateContactNo,
                        leaderName: bookingResponse.data.leaderName,
                        status: (bookingResponse.data.status || "booking_created").toLowerCase(),
                        updatedAt: new Date().toISOString(),
                        // Additional fields from API
                        currentStage: bookingResponse.data.currentStage,
                        paymentMode: bookingResponse.data.paymentMode,
                        amount_2: bookingResponse.data.amount_2,
                        transNo: bookingResponse.data.transNo,
                        dateOfTransfer: bookingResponse.data.dateOfTransfer,
                        isPaymentVerified: bookingResponse.data.isPaymentVerified,
                        notes_2: bookingResponse.data.notes_2,
                        dateOfLogin: bookingResponse.data.dateOfLogin,
                        bankName: bookingResponse.data.bankName,
                        branchName: bookingResponse.data.branchName,
                        loginRefNo: bookingResponse.data.loginRefNo,
                        notes_3: bookingResponse.data.notes_3,
                        isDraftPrepared: bookingResponse.data.isDraftPrepared,
                        draftPreparedOn: bookingResponse.data.draftPreparedOn,
                        isDraftGivenToBank: bookingResponse.data.isDraftGivenToBank,
                        draftGivenToBankOn: bookingResponse.data.draftGivenToBankOn,
                        notes_4: bookingResponse.data.notes_4,
                        isLoanSanctioned: bookingResponse.data.isLoanSanctioned,
                        loanSanctionDate: bookingResponse.data.loanSanctionDate,
                        loanSanctionNotes: bookingResponse.data.loanSanctionNotes,
                        isCompletedOnAllSides: bookingResponse.data.isCompletedOnAllSides,
                        completionDate: bookingResponse.data.completionDate,
                        markFileCheckNotes: bookingResponse.data.markFileCheckNotes,
                        // Bank DD fields
                        isDDSubmittedToBank: bookingResponse.data.isDDSubmittedToBank,
                        ddSubmittedDate: bookingResponse.data.ddSubmittedDate,
                        ddClearedOn: bookingResponse.data.ddClearedOn,
                        notes: bookingResponse.data.notes,
                        totalTDSDeducted: bookingResponse.data.totalTDSDeducted
                    };
                    setBookingData(transformedBooking);

                    // Fetch booking progress
                    try {
                        const progressResponse = await axiosInstance.get(
                            `${API_ENDPOINTS.GET_BOOKING_PROGRESS}?bookingId=${id}`
                        );

                        if (progressResponse.data && Array.isArray(progressResponse.data)) {
                            setBookingProgress(progressResponse.data);
                        } else {
                            setBookingProgress([]);
                        }
                    } catch (progressErr) {
                        // Silent error for progress data
                        setBookingProgress([]);
                    }
                } else {
                    setError('Booking not found');
                }
            } catch (err) {
                setError('Failed to load booking information');
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [id]);

    if (loading) {
        return (
            <BookingWrapper className="booking-summary-container">
                <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
                    <span>Loading booking information...</span>
                </div>
            </BookingWrapper>
        );
    }

    if (error) {
        return (
            <BookingWrapper className="booking-summary-container">
                <div className="card" style={{ padding: '40px', textAlign: 'center', background: '#fee', border: '1px solid #fcc' }}>
                    <div style={{ color: '#c62828' }}>
                        <h3>Error Loading Booking</h3>
                        <p>{error}</p>
                        <button className="primary-btn" onClick={() => window.location.reload()} style={{ marginRight: '8px' }}>
                            Retry
                        </button>
                        <button className="primary-btn" onClick={() => navigate('/property/dashboard')}>
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </BookingWrapper>
        );
    }

    if (!bookingData) {
        return (
            <BookingWrapper className="booking-summary-container">
                <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
                    <p>No booking data available</p>
                    <button className="primary-btn" onClick={() => navigate('/property/dashboard')}>
                        Back to Dashboard
                    </button>
                </div>
            </BookingWrapper>
        );
    }

    return (
        <BookingWrapper className="dashboard-container">
            <div className="dashboard-header">
                <div className="dashboard-header-content">
                    <div>
                        <h2 className="dashboard-title">Booking Summary </h2>
                        <p className="dashboard-subtitle">Complete overview of booking details</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    
                    <button className="primary-btn" onClick={() => navigate(-1)}>
                        Back
                    </button>
                    <ReminderButton
                        size="small"
                        onClick={() => setShowReminderPopup(true)}
                        
                    />
                </div>
            </div>

            {/* Booking Info Card */}
            <div className="card">
                <div className="">
                    <div className="booking-info-matrix">

                        <div className="booking-info-row">
                            <label>Township :</label>
                            <span className="booking-info-value">
                                {bookingData.township || 'N/A'}
                            </span>
                        </div>

                        <div className="booking-info-row">
                            <label>Plot :</label>
                            <span className="booking-info-value">
                                {bookingData.plotNumber || 'N/A'}
                            </span>
                        </div>

                        <div className="booking-info-row">
                            <label>Size :</label>
                            <span className="booking-info-value">
                                {bookingData.plotSize || 'N/A'}
                            </span>
                        </div>

                        <div className="booking-info-row">
                            <label>Client :</label>
                            <span className="booking-info-value">
                                {bookingData.clientName || "N/A"}
                            </span>
                        </div>

                        <div className="booking-info-row">
                            <label>Mobile :</label>
                            <span className="booking-info-value">
                                {bookingData.clientMobile || 'N/A'}
                            </span>
                        </div>

                        <div className="booking-info-row">
                            <label>Booking Date :</label>
                            <span className="booking-info-value">
                                {formatDisplayDate(bookingData.createdAt)}
                            </span>
                        </div>

                    </div>
                </div>


                {/* Second Row for Confirmed Date and DD Info */}
                <div className="booking-info-grid">
                    {/* <div className="info-item">
                        <span className="info-label">Confirmed Date:</span>
                        <span className="info-value">
                            {bookingData.confirmedDate ? formatDisplayDate(bookingData.confirmedDate) : "Pending"}
                        </span>
                    </div> */}

                    {bookingData.isDDSubmittedToBank && (
                        <>
                            <div className="info-item">
                                <span className="info-label">DD Submitted:</span>
                                <span className="info-value">Yes</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">DD Date:</span>
                                <span className="info-value">
                                    {bookingData.ddSubmittedDate ? formatDisplayDate(bookingData.ddSubmittedDate) : 'N/A'}
                                </span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">DD Cleared:</span>
                                <span className="info-value">
                                    {bookingData.ddClearedOn ? formatDisplayDate(bookingData.ddClearedOn) : "Pending"}
                                </span>
                            </div>
                        </>
                    )}
                </div>

                {bookingData.isDDSubmittedToBank && bookingData.notes && (
                    <div className="booking-info-grid" style={{ marginTop: '20px' }}>
                        <div className="info-item" style={{ flex: 1 }}>
                            <span className="info-label">Notes:</span>
                            <span className="info-value">{bookingData.notes}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Booking Progress */}
            <div className="card">
                <div className="workflow-steps-header">
                    <h3>Booking File Progress {bookingProgress.length > 0 && <span className="progress-count">({bookingProgress.length} entries)</span>}</h3>
                </div>

                {bookingProgress.length > 0 ? (
                    <div className="table-wrapper">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th className="step-number">S.No</th>
                                    <th className="step-name">Progress Details</th>
                                    <th className="step-status-col">Date</th>
                                    <th>Days from Booking</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookingProgress.map((progress, index) => (
                                    <tr key={index}>
                                        <td className="step-number">
                                            <div className="step-number-badge">{index + 1}</div>
                                        </td>
                                        <td className="step-name">
                                            <div className="step-name-content">
                                                <span className="step-title">{progress.progressDetails}</span>
                                            </div>
                                        </td>
                                        <td className="step-status-col">
                                            <span className="progress-date">
                                                {progress.progressDate ? formatDisplayDate(progress.progressDate) : 'N/A'}
                                            </span>
                                        </td>
                                        <td>
                                                <span>{progress.daysFromBooking || 0} days</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="no-progress-data">
                        <p>No booking progress data available for this booking.</p>
                    </div>
                )}
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
