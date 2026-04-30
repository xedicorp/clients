import { useState, useEffect, Fragment } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BookingWrapper from "./style";
import axiosInstance from "../../utilities/axiosInstance";
import API_ENDPOINTS from "../../utilities/apiConfig";
import ReminderPopup from "../../components/ReminderPopup";
import "./PaymentHistory.css";

export default function PaymentHistory() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [booking, setBooking] = useState(null);
    const [receipts, setReceipts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [allBookingsReceipts, setAllBookingsReceipts] = useState([]);
    const [bookingsMap, setBookingsMap] = useState({});
    const [isReminderPopupOpen, setIsReminderPopupOpen] = useState(false);



    const paymentModes = [
        { value: "1", label: "Bank Transfer" },
        { value: "2", label: "Cheque" },
       
        { value: "4", label: "UPI" },
        { value: "5", label: "NEFT/RTGS" },
        { value: "6", label: "Demand Draft" }
    ];

    const statusOptions = [
        { value: "1", label: "Pending" },
        { value: "2", label: "Received" },
        { value: "3", label: "Cleared" }
    ];

    useEffect(() => {
        const fetchData = async () => {
            // If no ID provided, fetch all bookings with their receipts
            if (!id) {
                setLoading(true);
                setError(null);

                try {
                    // Fetch all bookings
                    const bookingsResponse = await axiosInstance.get(API_ENDPOINTS.BOOKING_LIST);
                    let bookingsList = [];

                    if (Array.isArray(bookingsResponse.data)) {
                        bookingsList = bookingsResponse.data;
                    } else if (bookingsResponse.data && typeof bookingsResponse.data === 'object') {
                        bookingsList = bookingsResponse.data.value || bookingsResponse.data.data || bookingsResponse.data.bookings || [];
                    }

                    // Create bookings map
                    const bMap = {};
                    bookingsList.forEach(b => {
                        const bookingId = b.id ?? b.Id ?? b.bookingId;
                        bMap[bookingId] = {
                            id: bookingId,
                            clientName: b.clientName ?? b.ClientName,
                            contactNo: b.contactNo ?? b.ContactNo,
                            townshipName: b.townshipName ?? b.TownshipName,
                            plotNo: b.plotNo ?? b.PlotNo,
                            bookingDate: b.bookingDate ?? b.BookingDate
                        };
                    });
                    setBookingsMap(bMap);



                    let receiptsList = [];

                    if (Array.isArray(receiptsResponse.data)) {
                        receiptsList = receiptsResponse.data;
                    } else if (receiptsResponse.data && typeof receiptsResponse.data === 'object') {
                        receiptsList = receiptsResponse.data.value || receiptsResponse.data.data || receiptsResponse.data.receipts || [];
                    }


                    const normalizedReceipts = receiptsList.map((receipt, idx) => ({
                        id: receipt.id ?? receipt.Id ?? `receipt-${idx}`,
                        bookingId: receipt.bookingId ?? receipt.BookingId,
                        receiptDate: receipt.receiptDate ?? receipt.ReceiptDate,
                        amount: receipt.amount ?? receipt.Amount,
                        receiptMethod: receipt.receiptMethod ?? receipt.ReceiptMethod ?? receipt.paymentMethod,
                        transactionId: receipt.transactionId ?? receipt.TransactionId ?? receipt.transNo,
                        bankName: receipt.bankName ?? receipt.BankName,
                        chequeNo: receipt.chequeNo ?? receipt.ChequeNo,
                        status: receipt.status ?? receipt.Status,
                        notes: receipt.notes ?? receipt.Notes ?? receipt.remarks,
                    }));


                    setAllBookingsReceipts(normalizedReceipts);
                } catch (err) {

                    setError("Failed to load payment history");
                } finally {
                    setLoading(false);
                }
                return;
            }

            // Original code for single booking
            setLoading(true);
            setError(null);

            try {
                let bookingDetail = null;
                try {
                    const bookingRes = await axiosInstance.get(`${API_ENDPOINTS.GET_BOOKING_BY_ID}?bookingId=${id}`);
                    bookingDetail = bookingRes?.data || null;
                } catch (e) {
                    bookingDetail = null;
                }

                if (bookingDetail) {
                    setBooking({
                        id: bookingDetail.id ?? Number(id),
                        township: bookingDetail.townshipName,
                        plotNumber: bookingDetail.plotNo,
                        plotSize: bookingDetail.plotSize,
                        clientName: bookingDetail.clientName,
                        clientMobile: bookingDetail.contactNo,
                        bookingDate: bookingDetail.bookingDate || new Date().toISOString().split('T')[0],
                    });
                }

                // Fetch receipts for this booking only
                const receiptResponse = await axiosInstance.get(
                    `${API_ENDPOINTS.RECEIPT_LIST_BY_BOOKING_ID}?bookingId=${id}`
                );

                let receiptsList = [];
                if (Array.isArray(receiptResponse.data)) {
                    receiptsList = receiptResponse.data;
                } else if (receiptResponse.data && typeof receiptResponse.data === 'object') {
                    receiptsList = receiptResponse.data.value || receiptResponse.data.data || receiptResponse.data.receipts || [];
                }

                const normalizedReceipts = (Array.isArray(receiptsList) ? receiptsList : []).map((receipt, idx) => ({
                    id: receipt.id ?? receipt.Id ?? `receipt-${idx}-${Date.now()}`,
                    bookingId: receipt.bookingId ?? receipt.BookingId,
                    receiptDate: receipt.receiptDate ?? receipt.ReceiptDate,
                    amount: receipt.amount ?? receipt.Amount,
                    receiptMethod: receipt.receiptMethod ?? receipt.ReceiptMethod ?? receipt.paymentMethod ?? receipt.PaymentMethod,
                    transactionId: receipt.transactionId ,
                    bankName: receipt.bankName ,
                    chequeNo: receipt.chequeNo ,
                    status: receipt.status  ,
                     statusText: receipt.statusText  ,
                    notes: receipt.notes ?? receipt.Notes ?? receipt.remarks ?? receipt.Remarks,
                    __raw: receipt
                }));

                const mergedReceipts = [...normalizedReceipts];

                // Add Bank DD information from booking detail if available
                if (bookingDetail) {
                    // Check for Bank DD upload information
                    const ddAmount = bookingDetail.ddAmount ?? bookingDetail.DDAmount;
                    const ddNo = bookingDetail.ddNo ?? bookingDetail.DDNo ?? bookingDetail.ddNumber ?? bookingDetail.DDNumber;
                    const ddNotes = bookingDetail.ddNotes ?? bookingDetail.DDNotes;
                    const ddUploadDate = bookingDetail.ddUploadDate ?? bookingDetail.DDUploadDate ?? bookingDetail.ddSubmittedDate ?? bookingDetail.DDSubmittedDate;

                    // If Bank DD information exists, add it as a payment record
                    if (ddAmount && ddNo) {
                        const ddRecord = {
                            id: `bank-dd-${id}`,
                            bookingId: Number(id),
                            receiptDate: ddUploadDate || bookingDetail.bookingDate,
                            amount: ddAmount,
                            receiptMethod: "6", // Demand Draft
                            transactionId: ddNo,
                            bankName: "",
                            chequeNo: "",
                            status: "2", // Received
                            notes: ddNotes || "Bank DD Upload",
                            __raw: bookingDetail,
                            __type: "bank-dd" // Mark this as Bank DD record
                        };

                        // Check if this DD record already exists in receipts (avoid duplicates)
                        const existingDD = mergedReceipts.find(r =>
                            r.transactionId === ddNo ||
                            (r.receiptMethod === "6" && Math.abs(parseFloat(r.amount || 0) - parseFloat(ddAmount || 0)) < 0.01)
                        );

                        if (!existingDD) {
                            mergedReceipts.push(ddRecord);
                        }
                    }

                    // Handle initial payment (existing logic)
                    const initialAmount = bookingDetail.amount_2 ?? bookingDetail.amount2 ?? bookingDetail.amount;
                    const hasInitialPayment = initialAmount !== null && initialAmount !== undefined && String(initialAmount).trim() !== "" && Number(initialAmount) > 0;
                    const initialTransNo = bookingDetail.transNo ?? bookingDetail.TransNo ?? bookingDetail.transno ?? bookingDetail.trans_no ?? bookingDetail.transactionId ?? bookingDetail.TransactionId ?? bookingDetail.transactionNumber ?? bookingDetail.TransactionNumber;
                    const initialDate = bookingDetail.dateOfTransfer ?? bookingDetail.DateOfTransfer ?? bookingDetail.paymentDate ?? bookingDetail.PaymentDate;
                    const initialMethod = bookingDetail.paymentMode ?? bookingDetail.PaymentMode ?? bookingDetail.paymentMethod ?? bookingDetail.receiptMethod ?? bookingDetail.ReceiptMethod;
                    const initialBankName = bookingDetail.bankName ?? bookingDetail.BankName ?? bookingDetail.bank ?? bookingDetail.Bank;
                    const initialStatus = bookingDetail.isPaymentVerified === true ? 3 : (hasInitialPayment ? 2 : null);

                    const norm = (v) => String(v ?? "").trim().toLowerCase();
                    const toAmountNumber = (v) => {
                        const n = Number.parseFloat(String(v ?? "").replace(/,/g, "").trim());
                        return Number.isFinite(n) ? n : null;
                    };
                    const toDateKey = (v) => {
                        if (!v) return "";
                        const d = new Date(v);
                        if (Number.isNaN(d.getTime())) return "";
                        const yyyy = d.getFullYear();
                        const mm = String(d.getMonth() + 1).padStart(2, "0");
                        const dd = String(d.getDate()).padStart(2, "0");
                        return `${yyyy}-${mm}-${dd}`;
                    };

                    const initialTransNoNorm = norm(initialTransNo);
                    const initialAmountNum = toAmountNumber(initialAmount);
                    const initialDateKey = toDateKey(initialDate || bookingDetail.bookingDate);

                    let matchingReceiptIndex = -1;

                    // 1. Try to find by Transaction ID first (if available)
                    if (Boolean(initialTransNoNorm)) {
                        matchingReceiptIndex = mergedReceipts.findIndex((r) => {
                            const t = norm(r.transactionId);
                            return Boolean(t) && t === initialTransNoNorm;
                        });
                    }

                    // 2. If not found, try to find by Amount and Date
                    if (matchingReceiptIndex === -1 && initialAmountNum !== null && Boolean(initialDateKey)) {
                        matchingReceiptIndex = mergedReceipts.findIndex((r) => {
                            const amountNum = toAmountNumber(r.amount);
                            const dateKey = toDateKey(r.receiptDate);
                            if (amountNum === null || !dateKey) return false;
                            return Math.abs(amountNum - initialAmountNum) < 0.0001 && dateKey === initialDateKey;
                        });
                    }

                    if (matchingReceiptIndex !== -1) {
                        // Found a matching receipt! Enrich it with missing details from bookingDetail
                        const receipt = mergedReceipts[matchingReceiptIndex];

                        if ((!receipt.transactionId || String(receipt.transactionId).trim() === "") && initialTransNo) {
                            receipt.transactionId = initialTransNo;
                        }

                        if ((!receipt.receiptMethod || String(receipt.receiptMethod).trim() === "") && initialMethod) {
                            receipt.receiptMethod = String(initialMethod);
                        }

                        // Update the array
                        mergedReceipts[matchingReceiptIndex] = receipt;
                    } else if (hasInitialPayment) {
                        mergedReceipts.unshift({
                            id: `initial-${id}`,
                            bookingId: Number(id),
                            receiptDate: initialDate || bookingDetail.bookingDate,
                            amount: initialAmount,
                            receiptMethod: initialMethod != null ? String(initialMethod) : "",
                            transactionId: initialTransNo || "",
                            bankName: "",
                            chequeNo: "",
                            status: initialStatus ?? 2,
                            notes: bookingDetail.notes_2 || bookingDetail.notes || bookingDetail.remarks || "",
                            __raw: bookingDetail
                        });
                    }
                }

                const isBlank = (v) => String(v ?? "").trim() === "";
                const cleanedReceipts = mergedReceipts.filter((r) => {
                    const notes = String(r.notes ?? "").trim().toLowerCase().replace(/\s+/g, " ");

                    // Don't filter out Bank DD records - we want to show them now
                    // The previous filter was removing "bank dd" entries, but now we want to show them

                    const amountNum = Number.parseFloat(String(r.amount ?? "").replace(/,/g, "").trim());
                    const isZeroOrMissing = !Number.isFinite(amountNum) || amountNum === 0;
                    const hasAnyDetails = !isBlank(r.transactionId) || !isBlank(r.bankName) || !isBlank(r.receiptDate) || !isBlank(r.receiptMethod);

                    // Filter out empty/placeholder records only
                    if (isZeroOrMissing && !hasAnyDetails) return false;

                    return true;
                }).map((receipt, index) => ({
                    ...receipt,
                    id: receipt.id || `unique-receipt-${index}-${Date.now()}`
                }));

                // Sort receipts by date (newest first)
                cleanedReceipts.sort((a, b) => {
                    const dateA = new Date(a.receiptDate || 0);
                    const dateB = new Date(b.receiptDate || 0);
                    return dateB - dateA;
                });

                setReceipts(cleanedReceipts);
            } catch (err) {

                setError("Failed to load payment history");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    // If no ID, show all bookings receipts
    if (!id) {
        const totalAmount = allBookingsReceipts.reduce((sum, receipt) => {
            const amount = parseFloat(receipt.amount) || 0;
            return sum + amount;
        }, 0);

        const displayValue = (value) => {
            if (value === null || value === undefined) return null;
            const v = String(value).trim();
            if (!v) return null;
            if (v.toLowerCase() === "string") return null;
            if (v.toLowerCase() === "null" || v.toLowerCase() === "undefined") return null;
            return v;
        };

        return (
            <>
                <BookingWrapper className="dashboard-container">
                    <div className="dashboard-header">
                        <div className="dashboard-header-content">
                            <div className="dashboard-header-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="12" y1="1" x2="12" y2="23"></line>
                                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                                </svg>
                            </div>
                            <div>
                                <h2 className="dashboard-title">Payment History</h2>
                                <p className="dashboard-subtitle">All payment records across bookings</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
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
                            <button className="primary-btn" onClick={() => setIsReminderPopupOpen(true)}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                                Reminder
                            </button>
                        </div>
                    </div>

                    <div className="card ">
                        <div className="booking-info-two-column">
                            <div className="info-row">
                                <span className="info-label">Total Records:</span>
                                <span className="info-value">{allBookingsReceipts.length}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Total Amount:</span>
                                <span className="info-value total-amount">
                                    ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="card payment-history-table-card">
                        <div className="payment-history-table-header">
                            <h3 className="payment-history-table-title">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="8" y1="6" x2="21" y2="6"></line>
                                    <line x1="8" y1="12" x2="21" y2="12"></line>
                                    <line x1="8" y1="18" x2="21" y2="18"></line>
                                </svg>
                                Payment Records ({allBookingsReceipts.length})
                            </h3>
                        </div>

                        <div className="payment-history-table-wrapper">
                            {loading ? (
                                <div className="loading-state">
                                    <p>Loading payment history...</p>
                                </div>
                            ) : error ? (
                                <div className="error-state">
                                    <p>{error}</p>
                                </div>
                            ) : allBookingsReceipts.length === 0 ? (
                                <div className="no-data">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <line x1="12" y1="8" x2="12" y2="12"></line>
                                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                    </svg>
                                    <p>No payment records found</p>
                                </div>
                            ) : (
                                <table className="payment-history-table">
                                    <thead>
                                        <tr>
                                            <th className="left">Client Name</th>
                                            <th className="left">Plot</th>
                                            <th className="left">Amount</th>
                                            <th className="center">Date</th>
                                            <th className="left">Payment Method</th>
                                            <th className="left">Transaction ID</th>
                                            <th className="left">Bank Name</th>
                                            <th className="center">Status</th>
                                            <th className="left">Notes</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allBookingsReceipts.map((receipt) => {
                                            const bookingInfo = bookingsMap[receipt.bookingId] || {};
                                            const methodLabel = paymentModes.find(m => m.value === String(receipt.receiptMethod))?.label || receipt.receiptMethod || "-";
                                            const statusLabel = statusOptions.find(s => s.value === String(receipt.status))?.label || (receipt.status ? String(receipt.status).charAt(0).toUpperCase() + String(receipt.status).slice(1).toLowerCase() : "-");
                                            const transactionId = displayValue(receipt.transactionId);
                                            const bankName = displayValue(receipt.bankName);
                                            const notes = displayValue(receipt.notes);

                                            return (
                                                <tr key={receipt.id}>
                                                    <td className="left">{bookingInfo.clientName || "-"}</td>
                                                    <td className="left">{bookingInfo.plotNo || "-"}</td>
                                                    <td className="amount">
                                                        {receipt.amount !== null && receipt.amount !== undefined && receipt.amount !== ""
                                                            ? `₹${parseFloat(receipt.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                                            : <span className="empty-value">-</span>
                                                        }
                                                    </td>
                                                    <td className="center date-primary">
                                                        {receipt.receiptDate ? new Date(receipt.receiptDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : "-"}
                                                    </td>
                                                    <td className="mode">{methodLabel}</td>
                                                    <td className="transaction">{transactionId || <span className="empty-value">-</span>}</td>
                                                    <td className="mode">{bankName || <span className="empty-value">-</span>}</td>
                                                    <td className="center">
                                                        
                                                            {receipt.statusText}
                                                         
                                                    </td>
                                                    <td className="mode">{notes || <span className="empty-value">-</span>}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </BookingWrapper>

                <ReminderPopup
                    isOpen={isReminderPopupOpen}
                    onClose={() => setIsReminderPopupOpen(false)}
                    title="Payment Reminders"
                    bookingId={id}
                />
            </>
        );
    }

    // Original single booking view code continues below
    const totalAmount = receipts.reduce((sum, receipt) => {
        const amount = parseFloat(receipt.amount) || 0;
        return sum + amount;
    }, 0);

    const displayValue = (value) => {
        if (value === null || value === undefined) return null;
        const v = String(value).trim();
        if (!v) return null;
        if (v.toLowerCase() === "string") return null;
        if (v.toLowerCase() === "null" || v.toLowerCase() === "undefined") return null;
        return v;
    };

    if (loading) {
        return (
            <>
                <BookingWrapper className="payment-history-container">
                    <div className="loading-state">
                        <p>Loading payment history...</p>
                    </div>
                </BookingWrapper>

                <ReminderPopup
                    isOpen={isReminderPopupOpen}
                    onClose={() => setIsReminderPopupOpen(false)}
                    title="Payment Reminders"
                    bookingId={id}
                />
            </>
        );
    }

    if (!loading && !booking && !error) {
        return (
            <>
                <BookingWrapper className="dashboard-container">
                    <div className="dashboard-header">
                        <div className="dashboard-header-content">
                            <div className="dashboard-header-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="12" y1="1" x2="12" y2="23"></line>
                                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                                </svg>
                            </div>
                            <div>
                                <h2>Payment History</h2>
                                <p className="dashboard-subtitle">View all payments for this booking</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            
                            <button className="primary-btn" onClick={() => setIsReminderPopupOpen(true)}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                                Reminder
                            </button>
                        </div>
                    </div>
                    <div className="error-state">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        <h3>Booking not found</h3>
                        <p>The booking you're looking for doesn't exist or has been removed.</p>
                    </div>
                </BookingWrapper>

                <ReminderPopup
                    isOpen={isReminderPopupOpen}
                    onClose={() => setIsReminderPopupOpen(false)}
                    title="Payment Reminders"
                    bookingId={id}
                />
            </>
        );
    }

    return (
        <>
            <BookingWrapper className="dashboard-container">
                <div className="dashboard-header">
                    <div className="dashboard-header-content">
                        <div className="dashboard-header-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="1" x2="12" y2="23"></line>
                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                            </svg>
                        </div>
                        <div>
                            <h2>Payment History</h2>
                            <p className="dashboard-subtitle">View all payments for this booking</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
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
                        <button className="primary-btn" onClick={() => setIsReminderPopupOpen(true)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            Reminder
                        </button>
                    </div>
                </div>

                {booking && (
                    <div className="card">
                        <div className="booking-info-matrix">

                            <div className="booking-info-row">
                                <label>Township : </label>
                                <span className="booking-info-value">
                                    {booking.township || 'N/A'}
                                </span>
                            </div>

                            <div className="booking-info-row">
                                <label>Plot : </label>
                                <span className="booking-info-value">
                                    {booking.plotNumber || 'N/A'}
                                </span>
                            </div>

                            <div className="booking-info-row">
                                <label>Client : </label>
                                <span className="booking-info-value">
                                    {booking.clientName || 'N/A'}
                                </span>
                            </div>

                            <div className="booking-info-row">
                                <label>Mobile : </label>
                                <span className="booking-info-value">
                                    {booking.clientMobile || 'N/A'}
                                </span>
                            </div>

                            <div className="booking-info-row">
                                <label>Total Paid : </label>
                                <span className="booking-info-value booking-total-amount">
                                    ₹{totalAmount.toLocaleString('en-IN', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    })}
                                </span>
                            </div>

                        </div>
                    </div>


                )}

                <div className="card dashboard-table-card">
                    <div className="dashboard-table-header">
                        <h3 className="dashboard-table-title">
                            Payment Records ({receipts.length})
                        </h3>
                    </div>

                    <div className="table-wrapper">
                        {loading ? (
                            <div className="loading-state">
                                <p>Loading payment history...</p>
                            </div>
                        ) : error ? (
                            <div className="error-state">
                                <p>{error}</p>
                            </div>
                        ) : receipts.length === 0 ? (
                            <div className="no-data">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                                <p>No payment records found for this booking</p>
                            </div>
                        ) : (
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th className="left">Amount</th>
                                        <th className="center">Date</th>
                                        <th className="left">Payment Method</th>
                                        <th className="left">Transaction ID</th>
                                        <th className="left">Bank Name</th>
                                        <th className="center">Status</th>
                                        <th className="left">Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {receipts.map((receipt) => {
                                        const methodLabel = paymentModes.find(m => m.value === String(receipt.receiptMethod))?.label || receipt.receiptMethod || "-";
                                        const statusLabel = statusOptions.find(s => s.value === String(receipt.status))?.label || (receipt.status ? String(receipt.status).charAt(0).toUpperCase() + String(receipt.status).slice(1).toLowerCase() : "-");
                                        const transactionId = displayValue(receipt.transactionId);
                                        const bankName = displayValue(receipt.bankName);
                                        const notes = displayValue(receipt.notes);
                                        const isBankDD = receipt.__type === "bank-dd";

                                        return (
                                            <tr key={receipt.id} className={isBankDD ? "bank-dd-row" : ""}>
                                                <td className="amount">
                                                    {receipt.amount !== null && receipt.amount !== undefined && receipt.amount !== ""
                                                        ? `₹${parseFloat(receipt.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                                        : <span className="empty-value">-</span>
                                                    }
                                                    {isBankDD && <span className="dd-badge">DD</span>}
                                                </td>
                                                <td className="center date-primary">
                                                    {receipt.receiptDate ? new Date(receipt.receiptDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : "-"}
                                                </td>
                                                <td className="mode">{methodLabel}</td>
                                                <td className="transaction">{transactionId || <span className="empty-value">-</span>}</td>
                                                <td className="mode">{bankName || <span className="empty-value">-</span>}</td>
                                                <td className="center">
                                                    <span>
                                                        {receipt.statusText}
                                                    </span>
                                                </td>
                                                <td className="mode">{notes || <span className="empty-value">-</span>}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </BookingWrapper>

            <ReminderPopup
                isOpen={isReminderPopupOpen}
                onClose={() => setIsReminderPopupOpen(false)}
                title="Payment Reminders"
                bookingId={id}
            />


        </>
    );
}
