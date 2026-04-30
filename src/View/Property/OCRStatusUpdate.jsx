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
 

export default function OCRStatusUpdate() {
    const navigate = useNavigate();
    const [bookingId, setBookingId] = useState(  '');
    const { id } = useParams();
    const [error, setError] = useState(null);
    const [isOcrClearanceSentToBank, setIsOcrClearanceSentToBank] = useState(false);
    const [ocrClearanceSentOn, setOcrClearanceSentOn] = useState("");
    const [receipts, setReceipts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [booking, setBooking] = useState(null);
    const [loadingBooking, setLoadingBooking] = useState(true);
    const [showReminderPopup, setShowReminderPopup] = useState(false);
    const [isReminderPopupOpen, setIsReminderPopupOpen] = useState(false);
const [totalAmountReceived, setTotalAmountReceived] = useState("");
  const [amountUnderVerification, setAmountUnderVerification] = useState("");
  
   const paymentModes = [
{ value: '1', label: 'Bank Transfer' },
{ value: '2', label: 'Cheque' },

{ value: '4', label: 'UPI' },
{ value: '5', label: 'NEFT/RTGS' },
{ value: '6', label: 'Demand Draft' },
];
const statusOptions = [
    { value: '1', label: 'Pending' },
    { value: '2', label: 'Received' },
    { value: '3', label: 'Cleared' },
];
    const fetchReceipts = async (currentBookingId) => {
            setLoading(true);
            setError(null);
    
            try {
                const hasBookingId =
                    currentBookingId && String(currentBookingId).trim() !== '';
                let url = API_ENDPOINTS.RECEIPT_LIST;
    
                if (hasBookingId) {
                    url = `${API_ENDPOINTS.RECEIPT_LIST_BY_BOOKING_ID}?bookingId=${currentBookingId}`;
                }
    
                const response = await axiosInstance.get(url);
                let receiptsList = [];
    
                if (Array.isArray(response.data)) {
                    receiptsList = response.data;
                } else if (response.data && typeof response.data === 'object') {
                    receiptsList = response.data.value || response.data.data || [];
                }
    
                // Normalize receipts
                const normalizedReceipts = receiptsList.map((receipt) => ({
                    id: receipt.id || receipt.Id,
                    bookingId: receipt.bookingId || receipt.BookingId,
                    receiptDate: receipt.receiptDate || receipt.ReceiptDate,
                    amount: receipt.amount || receipt.Amount,
                    receiptMethod: receipt.receiptMethod || receipt.ReceiptMethod,
                    transactionId: receipt.transactionId || receipt.TransactionId,
                    bankName: receipt.bankName || receipt.BankName,
                    status: receipt.status || receipt.Status,
                    notes: receipt.notes || receipt.Notes,
                    statusText: receipt.statusText,
                    receiptImage: receipt.receiptImage || receipt.ReceiptImage
                }));
    
                // Filter for current booking
              
                    const filteredReceipts = normalizedReceipts;
                    setReceipts(filteredReceipts);
                      let amount=0;
                      let amtUnderVarification=0;
                     receiptsList.map((receipt) => {
                           if(receipt.status==3)  //3:Verified
                           amount= amount+ receipt.amount;
    
                             if(receipt.status==2)  //2:Under Vaification
                                amtUnderVarification= amtUnderVarification+ receipt.amount;
                            });
                    
                            setTotalAmountReceived(amount);
                            setAmountUnderVerification(amtUnderVarification);
                
            } catch (error) {
                let errorMsg = 'Failed to load receipts.';
                if (error.message?.includes('Network Error')) {
                    errorMsg =
                        'Network error. Please check your internet connection.';
                } else if (error.response?.status === 404) {
                    errorMsg = 'Receipt list endpoint not found.';
                } else if (error.response?.status === 500) {
                    errorMsg = 'Server error. Please try again later.';
                }
                setError(errorMsg);
                setReceipts([]);
            } finally {
                setLoading(false);
            }
        };
    // Fetch booking details
    useEffect(() => {
        const fetchBookingDetails = async () => {
            if (!id) return;

            try {
                const response = await axiosInstance.get(API_ENDPOINTS.GET_BOOKING_BY_ID+"?bookingId="+id);
               
                const bookingData = response.data;

                if (bookingData) {
                    setBooking({
                        id: bookingData.id,
                        township: bookingData.townshipName,
                        plotNumber: bookingData.plotNo,
                        plotSize: bookingData.plotSize,
                        clientName: bookingData.clientName,
                        clientMobile: bookingData.contactNo,
                        bookingDate: bookingData.bookingDate || toLocalIsoDate(new Date()),
                        totalAgreementValue:bookingData.totalAgreementValue
                    });

                    // Prefill loan sanction data if exists
                    try {
                        const detailRes = await axiosInstance.get(
                            `${API_ENDPOINTS.GET_BOOKING_BY_ID}?bookingId=${bookingData.id}`
                        );
                        const detail = detailRes?.data || {};

                        if (typeof detail.isOcrClearanceSentToBank === "boolean") {
                            setIsOcrClearanceSentToBank(detail.isOcrClearanceSentToBank);
                        }
                        if (detail.isOcrClearanceSentToBank) {
                            const formattedDate = toLocalIsoDate(detail.ocrClearanceSentOn);
                            if (formattedDate) {
                                setOcrClearanceSentOn(formattedDate);
                            }
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
        fetchReceipts(id);
      
    }, [id]);

     const getUserId = () => {
        const stored = localStorage.getItem("userId") || localStorage.getItem("spendwise_userId");
        const parsed = stored ? Number(stored) : NaN;
        return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
      };
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isOcrClearanceSentToBank) {
            Swal.fire({
                icon: "warning",
                title: "Incomplete Information",
                text: "Please confirm Is OCR Clearance sent  ",
            });
            return;
        }

        if (!isOcrClearanceSentToBank) {
            Swal.fire({
                icon: "warning",
                title: "Incomplete Information",
                text: "Please fill OCR Clearance sent on Date",
            });
            return;
        }

     

        const payload = {
            bookingId:id,
            isOcrClearanceSentToBank:isOcrClearanceSentToBank,
            ocrClearanceSentOn: ocrClearanceSentOn,
            userId:getUserId()
        };

        setLoading(true);
        try {
            await axiosInstance.post(
                API_ENDPOINTS.UPDATE_LOCR_CLEARANCE_STATUS,
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            Swal.fire({
                icon: "success",
                title: "OCR Clearance Status Updated Successfully",
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
                        <h2 className="dashboard-title">OCR Clearance Sent Status</h2>
                        <p className="dashboard-subtitle">Track and manage OCR clearance sent to bank status</p>
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
                            checked={isOcrClearanceSentToBank}
                            onChange={setIsOcrClearanceSentToBank}
                            label={<span>Is OCR Clearance Sent To Bank <span className="required-star">*</span></span>}
                        />

                        <div className="loan-field">
                            <label htmlFor="loanSanctionedOn">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                                OCR Clearance Sent On <span className="required-star">*</span>
                            </label>
                            <input
                                type="date"
                                id="ocrClearanceSentOn"
                                value={ocrClearanceSentOn}
                                onChange={(e) => setOcrClearanceSentOn(e.target.value)}
                                required
                                className="form-control"
                            />
                        </div>

                        
                    </div>

                    <div className="loan-form-actions">
                      
                        <button type="submit" className="primary-btn" disabled={loading}>
                            {loading ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            </div>

<div className="card">
         <div className="dashboard-table-header">
          <h3 className="dashboard-table-title">Financial Summary</h3>
        </div>
         <div className="booking-info-matrix">

                            <div className="booking-info-row">
                                <label>Total Agreement Value</label>
                                <span className="booking-info-value">
                                  <h4> ₹ {booking?.totalAgreementValue?.toFixed(2)|| '0.00'}</h4>
                                </span>
                            </div>

                            {/* <div className="booking-info-row">
                                <label>Discount</label>
                                <span className="booking-info-value">
                                    {booking?.discount || 'N/A'}
                                </span>
                            </div> */}

                            <div className="booking-info-row">
                                <label>Amount Received</label>
                                <span className="booking-info-value">
                                     <h4>₹ {parseFloat(totalAmountReceived).toFixed(2) }
                                    
                                     </h4>
                                     <span style={{color:'darkgreen'}}>( 
                                    {((parseFloat(totalAmountReceived)*100)/parseFloat(booking?.totalAgreementValue)).toFixed(2)}
                                        %)
                                     </span>
                                 
                                </span> 
                                 
                               <div className="booking-info-row">
                                <label>Under verification</label>   <span className="booking-info-value">  ₹ {parseFloat(amountUnderVerification).toFixed(2) }</span>
                            </div>
                               </div>
                             
                            <div className="booking-info-row">
                                <label>Balance</label>
                                <span className="booking-info-value">
                                     <h4>₹ { (booking?.totalAgreementValue - totalAmountReceived).toFixed(2) }</h4>
                                </span>
                            </div>

                            
                            

                        </div>
      </div>
   <div className="card">
                <div className="dashboard-table-header">
                    <h3 className="dashboard-table-title">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <line x1="8" y1="6" x2="21" y2="6"></line>
                            <line x1="8" y1="12" x2="21" y2="12"></line>
                            <line x1="8" y1="18" x2="21" y2="18"></line>
                        </svg>
                        Receipt List  
                    </h3>
                    <div className="ocr-payment-table-badge">
                        {receipts.length} Records
                        {id && ` for Booking ID ${id}`}
                    </div>
                </div>

                <div className="table-wrapper">
                    {loading ? (
                        <div className="loading-state">
                            <p>Loading receipts...</p>
                        </div>
                    ) : error ? (
                        <div className="error-state">
                            <p>{error}</p>
                            <button
                                onClick={() => fetchReceipts(id)}
                                className="primary-btn"
                            >
                                Retry
                            </button>
                        </div>
                    ) : receipts.length === 0 ? (
                        <div className="no-data">
                            <p>No receipt records found</p>
                            {bookingId && (
                                <span>
                                    No receipts found for Booking ID {bookingId}
                                </span>
                            )}
                        </div>
                    ) : (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Amount</th>
                                    <th>Date</th>
                                    <th>Payment Method</th>
                                    <th>Status</th>
                                    <th>Transaction ID</th>
                                    <th>Bank Name</th>
                                    <th>Notes</th>
                                     
                                </tr>
                            </thead>
                            <tbody>
                                {receipts.map((receipt) => {
                                    const methodLabel =
                                        paymentModes.find(
                                            (m) =>
                                                m.value ===
                                                String(receipt.receiptMethod),
                                        )?.label ||
                                        receipt.receiptMethod ||
                                        '-';
                                    const statusLabel =
                                        statusOptions.find(
                                            (s) =>
                                                s.value ===
                                                String(receipt.status),
                                        )?.label || 'Unknown';
                                    const statusNum = parseInt(
                                        receipt.status,
                                        10,
                                    );
                                    const statusClass =
                                        statusNum === 2
                                            ? 'received'
                                            : statusNum === 3
                                                ? 'cleared'
                                                : 'pending';

                                    return (
                                        <tr key={receipt.id}>
                                            <td className="amount">
                                                {receipt.amount
                                                    ? `₹${parseFloat(receipt.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                                                    : '-'}
                                            </td>
                                            <td className="date">
                                                {receipt.receiptDate
                                                    ? new Date(
                                                        receipt.receiptDate,
                                                    ).toLocaleDateString()
                                                    : '-'}
                                            </td>
                                            <td>{methodLabel}</td>
                                            <td>
                                                <span
                                                    className={`ocr-status-badge status-${statusClass}`}
                                                >
                                                    {receipt.statusText}
                                                </span>
                                            </td>
                                            <td>
                                                {receipt.transactionId || '-'}
                                            </td>
                                            <td>{receipt.bankName || '-'}</td>
                                            <td>{receipt.notes || '-'}</td>
                                            
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
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