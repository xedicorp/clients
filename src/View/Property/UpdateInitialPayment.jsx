import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BookingWrapper from "./style";
import PropertyNavigation from "./PropertyNavigation";
import ReminderButton from "../../components/ReminderButton";
import ReminderPopup from "../../components/ReminderPopup";
import axiosInstance from "../../utilities/axiosInstance";
import API_ENDPOINTS from "../../utilities/apiConfig";
import { formatDisplayDate } from "../../utilities/dateUtils";
import Swal from "sweetalert2";
import "./UpdateInitialPayment.css";

export default function UpdateInitialPayment() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [checkCleared, setCheckCleared] = useState(false);
    const [paymentMode, setPaymentMode] = useState("");
    const [transactionId, setTransactionId] = useState("");
    const [amount, setAmount] = useState("");
    const [bankName, setBankName] = useState("");
    const [note, setNote] = useState("");
    const [dateOfTransfer, setDateOfTransfer] = useState("");
    const [loading, setLoading] = useState(false);
    const [bookingExists, setBookingExists] = useState(null);
    const [checkingBooking, setCheckingBooking] = useState(true);
    const [booking, setBooking] = useState(null);
    const [showReminderPopup, setShowReminderPopup] = useState(false);

    const paymentModes = [
        { label: "Bank Transfer", value: 1 },
        { label: "Cheque", value: 2 },
        // { label: "Cash", value: 3 },
        { label: "UPI", value: 4 },
        { label: "NEFT/RTGS", value: 5 },
        { label: "Demand Draft", value: 6 },
    ];

    useEffect(() => {
        const verifyBooking = async () => {
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
                const response = await axiosInstance.get(API_ENDPOINTS.BOOKING_LIST);
                const bookingsList = Array.isArray(response.data) ? response.data : (response.data?.value || []);
                const booking = bookingsList.find(b => b.id === Number(id));

                if (booking) {
                    setBookingExists(true);
                    setBooking({
                        id: booking.id,
                        township: booking.townshipName,
                        plotNumber: booking.plotNo,
                        plotSize: booking.plotSize,
                        clientName: booking.clientName,
                        clientMobile: booking.contactNo,
                        createdAt: booking.bookingDate
                    });

                    try {
                        const detailRes = await axiosInstance.get(
                            `${API_ENDPOINTS.GET_BOOKING_BY_ID}?bookingId=${booking.id}`
                        );
                        const detail = detailRes?.data || {};

                        if (detail.paymentMode !== undefined && detail.paymentMode !== null) {
                            setPaymentMode(String(detail.paymentMode));
                        }
                        if (detail.amount_2 !== undefined && detail.amount_2 !== null) {
                            setAmount(String(detail.amount_2));
                        }
                        if (detail.transNo) {
                            setTransactionId(detail.transNo);
                        }
                        if (detail.bankName || detail.BankName) {
                            setBankName(detail.bankName || detail.BankName);
                        }
                        if (detail.dateOfTransfer) {
                            const dateStr = detail.dateOfTransfer.split("T")[0];
                            setDateOfTransfer(dateStr);
                        }
                        if (typeof detail.isPaymentVerified === "boolean") {
                            setCheckCleared(detail.isPaymentVerified);
                        }
                        if (detail.notes_2) {
                            setNote(detail.notes_2);
                        }
                    } catch (prefillErr) {
                        // Silently fail prefill
                    }
                } else {
                    setBookingExists(false);
                    Swal.fire({
                        icon: "warning",
                        title: "Booking Not Found",
                        html: `
                            <p>Booking ID <strong>${id}</strong> does not exist.</p>
                            <p>Please select a valid booking from the dashboard.</p>
                        `,
                        confirmButtonText: "Go to Dashboard"
                    }).then(() => {
                        navigate("/property");
                    });
                }
            } catch (error) {
                setBookingExists(true);
            } finally {
                setCheckingBooking(false);
            }
        };

        verifyBooking();
    }, [id, navigate]);

    const handleSave = async (e) => {
        e.preventDefault();

        if (!paymentMode || !amount || !dateOfTransfer || !transactionId?.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Incomplete Information",
                text: "Please fill Payment Mode, Amount, Date and Transaction ID",
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

        const amountNum = Number(amount);
        if (amountNum <= 0 || isNaN(amountNum)) {
            Swal.fire({
                icon: "warning",
                title: "Invalid Amount",
                text: "Amount must be greater than 0",
            });
            return;
        }

        const paymentModeNum = parseInt(paymentMode);
        if (paymentModeNum < 1 || paymentModeNum > 6) {
            Swal.fire({
                icon: "warning",
                title: "Invalid Payment Mode",
                text: "Please select a valid payment mode",
            });
            return;
        }

        const formattedDate = dateOfTransfer ? new Date(dateOfTransfer).toISOString() : null;

        const payload = {
            bookingId: bookingId,
            paymentMode: paymentModeNum,
            amount: amountNum,
            transNo: transactionId.trim(),
            transactionId: transactionId.trim(),
            bankName: bankName?.trim(),
            dateOfTransfer: formattedDate,
            isPaymentVerified: checkCleared,
            notes: note?.trim(),
        };

        setLoading(true);
        try {
            const res = await axiosInstance.post(
                API_ENDPOINTS.UPDATE_INITIAL_PAYMENT,
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            const isSuccess = res.data === true || res.data?.success === true || res.status === 200;

            if (isSuccess) {
                Swal.fire({
                    icon: "success",
                    title: "Payment Updated Successfully",
                    text: "Initial payment has been recorded",
                    timer: 2000,
                    showConfirmButton: false,
                });

                setTimeout(() => {
                    navigate(`/property?refresh=${Date.now()}`);
                }, 2000);
            } else {
                Swal.fire({
                    icon: "warning",
                    title: "Unexpected Response",
                    text: "The payment may not have been saved. Please verify.",
                });
            }
        } catch (err) {
            const status = err.response?.status;
            let msg = "Something went wrong";
            let detailMsg = "";

            if (status === 400) {
                msg = "Invalid request data";
                detailMsg = err.response?.data?.message || err.response?.data?.title || "";
            } else if (status === 404) {
                msg = `Booking ID ${id} not found`;
                detailMsg = "The booking does not exist in the database.";
            } else if (status === 500) {
                msg = "Internal Server Error";
                detailMsg = "Please try again later or contact support.";
            } else if (!err.response) {
                msg = "Network Error";
                detailMsg = "Cannot connect to server.";
            }

            Swal.fire({
                icon: "error",
                title: `Failed (${status || "Network Error"})`,
                html: `
                    <p><strong>${msg}</strong></p>
                    ${detailMsg ? `<p>${detailMsg}</p>` : ''}
                `,
            });
        } finally {
            setLoading(false);
        }
    };

    if (checkingBooking) {
        return (
            <BookingWrapper className="update-initial-payment-container">
                <div className="update-initial-payment-header">
                    <div className="update-initial-payment-header-content">
                        <div className="update-initial-payment-header-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="1" x2="12" y2="23"></line>
                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                            </svg>
                        </div>
                        <div>
                            <h2>Update Initial Payment</h2>
                            <p className="update-initial-payment-subtitle">
                                Verifying booking...
                            </p>
                        </div>
                    </div>
                    <PropertyNavigation hideHealthButton />
                </div>
                <div className="card update-initial-payment-form-card">
                    <div className="loading-container">
                        <p>Verifying booking ID {id}...</p>
                    </div>
                </div>
            </BookingWrapper>
        );
    }

    if (bookingExists === false) {
        return (
            <BookingWrapper className="update-initial-payment-container">
                <div className="update-initial-payment-header">
                    <div className="update-initial-payment-header-content">
                        <div className="update-initial-payment-header-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="1" x2="12" y2="23"></line>
                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                            </svg>
                        </div>
                        <div>
                            <h2>Update Initial Payment</h2>
                            <p className="update-initial-payment-subtitle">
                                Booking not found
                            </p>
                        </div>
                    </div>
                    <PropertyNavigation hideHealthButton />
                </div>
                <div className="card update-initial-payment-form-card">
                    <div className="error-container">
                        <p>Booking ID {id} does not exist.</p>
                        <button
                            className="small-btn primary"
                            onClick={() => navigate("/property")}
                        >
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            </BookingWrapper>
        );
    }

    return (
        <BookingWrapper className="update-initial-payment-container">
            <div className="update-initial-payment-header">
                <div className="update-initial-payment-header-content">
                    <div className="update-initial-payment-header-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="1" x2="12" y2="23"></line>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                    </div>
                    <div>
                        <h2>Update Initial Payment</h2>
                        <p className="update-initial-payment-subtitle">
                            Update and track initial payment details
                        </p>
                    </div>
                </div>
                <PropertyNavigation hideHealthButton />
            </div>

            {booking && (
                <div className="updateinitialpayment-info-strip">

                    <div className="updateinitialpayment-info-row">
                        <div className="updateinitialpayment-info-item">
                            <span className="updateinitialpayment-info-label">TOWNSHIP</span>
                            <div className="updateinitialpayment-info-value">
                                {booking?.township || "N/A"}
                            </div>
                        </div>

                        <div className="updateinitialpayment-info-item">
                            <span className="updateinitialpayment-info-label">PLOT</span>
                            <div className="updateinitialpayment-info-value">
                                {booking?.plotNumber || "N/A"}
                            </div>
                        </div>

                        <div className="updateinitialpayment-info-item">
                            <span className="updateinitialpayment-info-label">SIZE</span>
                            <div className="updateinitialpayment-info-value">
                                {booking?.plotSize || "N/A"}
                            </div>
                        </div>
                    </div>

                    <div className="updateinitialpayment-info-divider"></div>

                    <div className="updateinitialpayment-info-row">
                        <div className="updateinitialpayment-info-item">
                            <span className="updateinitialpayment-info-label">CLIENT</span>
                            <div className="updateinitialpayment-info-value">
                                {booking?.clientName || "N/A"}
                            </div>
                        </div>

                        <div className="updateinitialpayment-info-item">
                            <span className="updateinitialpayment-info-label">MOBILE</span>
                            <div className="updateinitialpayment-info-value">
                                {booking?.clientMobile || "N/A"}
                            </div>
                        </div>

                        <div className="updateinitialpayment-info-item">
                            <span className="updateinitialpayment-info-label">BOOKING DATE</span>
                            <div className="updateinitialpayment-info-value">
                                {booking?.createdAt
                                    ? formatDisplayDate(booking.createdAt)
                                    : "N/A"}
                            </div>
                        </div>
                    </div>

                </div>

            )}

            <div className="card update-initial-payment-form-card">
                <form onSubmit={handleSave}>
                    <div className="update-initial-payment-form-grid">
                        <div className="update-initial-payment-field">
                            <label>Payment Mode *</label>
                            <select
                                value={paymentMode}
                                onChange={(e) => setPaymentMode(e.target.value)}
                                required
                            >
                                <option value="">Select Payment Mode</option>
                                {paymentModes.map((x) => (
                                    <option key={x.value} value={x.value}>
                                        {x.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="update-initial-payment-field">
                            <label>Amount *</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Enter amount"
                                min="0.01"
                                step="0.01"
                                required
                            />
                        </div>

                        <div className="update-initial-payment-field">
                            <label>Transaction ID *</label>
                            <input
                                type="text"
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value)}
                                placeholder="Enter transaction ID"
                                required
                            />
                        </div>

                        <div className="update-initial-payment-field">
                            <label>Date of Transfer *</label>
                            <input
                                type="date"
                                value={dateOfTransfer}
                                onChange={(e) => setDateOfTransfer(e.target.value)}
                                required
                            />
                        </div>

                        <div className="update-initial-payment-checkbox-field">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={checkCleared}
                                    onChange={(e) => setCheckCleared(e.target.checked)}
                                />
                                Payment Verified
                            </label>
                        </div>

                        <div className="update-initial-payment-field">
                            <label>Notes</label>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Enter notes"
                            ></textarea>
                        </div>
                    </div>

                    <div className="update-initial-payment-actions">
                        <ReminderButton
                            size="small"
                            variant="outline"
                            onClick={() => setShowReminderPopup(true)}
                        />
                        <button
                            type="button"
                            className="small-btn secondary"
                            onClick={() => navigate(-1)}
                        >
                            Cancel
                        </button>
                        <button type="submit" className="small-btn primary" disabled={loading}>
                            {loading ? "Saving..." : "Save Payment"}
                        </button>
                    </div>
                </form>
            </div>

            <ReminderPopup
                isOpen={showReminderPopup}
                onClose={() => setShowReminderPopup(false)}
                title="Create Reminder"
                bookingId={id}
            />
        </BookingWrapper>
    );
}
