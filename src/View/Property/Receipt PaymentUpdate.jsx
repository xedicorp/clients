import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReminderButton from '../../components/ReminderButton';
import ReminderPopup from "../../components/ReminderPopup";
import API_ENDPOINTS from '../../utilities/apiConfig';
import axiosInstance from '../../utilities/axiosInstance';
import { formatDisplayDate } from '../../utilities/dateUtils';
import { sendVerificationRequestWithNotifications } from '../../utilities/receiptVerificationAPI';
import GenerateReceipt from '../GenerateReceipt';
import './Receipt PaymentUpdate.css';
import BookingWrapper from './style';
import LargeModal from "../../Components/NewComponent/Modal/LargeModal";
import Swal from "sweetalert2";
import { FiX } from "react-icons/fi";
import { t } from 'i18next';
import hasPermission, { PERMISSIONS } from '../../utilities/HasPermission';

// const receiptData = {
//     buyerName: "Naresh Kumar Meena",
//     relationName: "Harkesh Meena",
//     address: "Dev Colony Ward 7 Hindaun",
//     aadhar: "2803-7241-0453",
//     amountWords: "Nine Lakh Thirty Eight Thousand Only",
//     paymentMethod: "RTGS",
//     refNo: "ICICR1202507030549393",
//     date: "03/07/2025",
//     bank: "ICICI Bank",
//     type: "Plot",
//     plotNo: "07",
//     township: "The Greater Jagatpura-1",
//     location: "Jaipur",
//     rera: "RAJ/P/2025/3645",
//     amountNumber: "938000"
// };





export default function OCRPaymentUpdate() {
    const navigate = useNavigate();
    const { id: routeBookingId } = useParams();
    const [showReceipt, setShowReceipt] = useState(false);
    const [showViewReceiptModal, setShowViewReceiptModal] = useState(false);
   const [receiptData, setReceiptData ] = useState('');
    // Check if current user is user7
    const currentUsername =
        localStorage.getItem('userName') ||
        localStorage.getItem('userName') ||
        '';
    const isUser7 = currentUsername.toLowerCase() === 'user7';
 const [showDeletePopup, setShowDeletePopup] = useState(false);
    // Form state
    const [receiptId, setReceiptId] = useState('');
    const [bookingId, setBookingId] = useState(routeBookingId || '');
    const [totalAmount, setTotalAmount] = useState('');
    const [paymentDate, setPaymentDate] = useState('');
    const [paymentMode, setPaymentMode] = useState('2');
    const [transactionId, setTransactionId] = useState('');
    const [bankList, setBankList] = useState([]);
    const [bankName, setBankName] = useState('');
    const [remarks, setRemarks] = useState('');

    // Edit mode state
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingReceiptId, setEditingReceiptId] = useState(null);
    const [deleteReason, setDeleteReason] = useState("");
    // API state
    const [receipts, setReceipts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [booking, setBooking] = useState(null);
    const [loadingBooking, setLoadingBooking] = useState(false);
    const [showReminderPopup, setShowReminderPopup] = useState(false);
    const [sendingToVerify, setSendingToVerify] = useState(null);
    const [paymentReceiptsFile, setPaymentReceiptsFile] = useState(null);
    const [receiptPreview, setReceiptPreview] = useState(null);
      const [selectedReceiptId, setSelectedReceiptId] = useState(0);
const [processing, setProcessing] = useState(false);
        const [clicked, setClicked] = useState(false);


        const [showEditDateModal, setShowEditDateModal] = useState(false);
        const [receiptDate, setReceiptDate] = useState('');

    // Payment options
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

    const ALLOWED_FILE_REGEX = /\.(jpg|jpeg|png|pdf)$/i;
    const MAX_FILE_SIZE = 20 * 1024 * 1024;

    const isPdf = (file) => {
        if (!file) return false;

        if (file instanceof File) {
            return file.type === "application/pdf";
        }

        return typeof file === "string" && file.toLowerCase().endsWith(".pdf");
    };

    const loadReceipt=async(id)=>
    {  
        const response = await axiosInstance.get(API_ENDPOINTS.RECEIPT_BY_ID+ "/"+id);
        setReceiptData(response.data);
      
        setShowViewReceiptModal(true);
           
    };
      const closePopups = () => {
         setShowDeletePopup(false);
    };

      const deleteReceipt=async(id)=>
    {  
        setSelectedReceiptId(id);
       setShowDeletePopup(true);
           
    };
     const confirmDelete = async () => {
            if (clicked) return; 
            setClicked(true);
            
    
           
     
    
            if (!deleteReason  .trim()) {
                Swal.fire({
                    icon: "warning",
                    title: "Delete reason required",
                    text: "Please enter delete reason "
                });
                return;
            }
    
            setProcessing(true);
    
            try {
    
                await axiosInstance.post(API_ENDPOINTS.RECEIPT_DELETE, {
                    receiptId: selectedReceiptId,                   
                    deleteReason: deleteReason,
                    userId: getUserId()
                });
    
                setReceipts(prev => prev.filter(r => r.id !== selectedReceiptId));
    
                setShowDeletePopup(false);
                setSelectedReceiptId(0);
                setDeleteReason("");
    
                Swal.fire({
                    icon: "success",
                    title: "Delete",
                    text: "Receipt deleted successfully"
                });
    
            } catch (err) {
                setClicked(false);
                console.error(err);
    
                Swal.fire({
                    icon: "error",
                    title: "Delete Failed",
                    text: "Failed to delete receipt. Please try again."
                });
    
            } finally {
    
                setProcessing(false);
    
            }
    
        };
    const handleFileChange = (fileList) => {
        const file = fileList && fileList.length > 0 ? fileList[0] : null;

                    if (file && !ALLOWED_FILE_REGEX.test(file.name)) {
                        Swal.fire({
            icon: "warning",
            title: "Invalid File",
            text: "Only JPG, JPEG, PNG or PDF files allowed"
            });
            return;
        }

        if (file && file.size > MAX_FILE_SIZE) {
            Swal.fire({
  icon: "warning",
  title: "File Too Large",
  text: "File must be less than 20MB"
});
            return;
        }

        setPaymentReceiptsFile(file);

        // Remove old preview if exists
        if (receiptPreview?.startsWith?.("blob:")) {
            URL.revokeObjectURL(receiptPreview);
        }

        setReceiptPreview(file ? URL.createObjectURL(file) : null);
    };


    useEffect(() => {
        return () => {
            if (receiptPreview?.startsWith?.("blob:")) {
                URL.revokeObjectURL(receiptPreview);
            }
        };
    }, [receiptPreview]);


    // Initialize bookingId from route
    useEffect(() => {
        if (routeBookingId) {
            setBookingId(routeBookingId);
        }
    }, [routeBookingId]);


    useEffect(() => {
  const fetchBanks = async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.BANK_LIST);

      const raw = response?.data;

      const banks = Array.isArray(raw)
        ? raw
        : raw?.value || raw?.data || [];

      setBankList(banks);

    } catch (err) {
      console.error(err);
    }
  };

  fetchBanks();
}, []);
    // Fetch booking details
    useEffect(() => {
        const fetchBookingDetails = async () => {
            if (!bookingId) return;

            try {
                setLoadingBooking(true);
                const response = await axiosInstance.get(
                    API_ENDPOINTS.BOOKING_LIST,
                );
                const bookingsList = Array.isArray(response.data)
                    ? response.data
                    : response.data?.value || [];
                const bookingData = bookingsList.find(
                    (b) => b.id === Number(bookingId),
                );

                if (bookingData) {
                    setBooking({
                        id: bookingData.id,
                        township: bookingData.townshipName,
                        plotNumber: bookingData.plotNo,
                        plotSize: bookingData.plotSize,
                        clientName: bookingData.clientName,
                        clientMobile: bookingData.contactNo,
                        bookingDate: bookingData.bookingDate,

                    });
                } else {
                    setBooking(null);
                }
            } catch (error) {
                setBooking(null);
            } finally {
                setLoadingBooking(false);
            }
        };

        fetchBookingDetails();
    }, [bookingId]);

    // Fetch receipts
    useEffect(() => {
        fetchReceipts(bookingId);
    }, [bookingId]);

    // Edit receipt
    const handleEditReceipt = (receipt) => {
      //  setIsEditMode(true);
    
        setEditingReceiptId(receipt.id);
        setReceiptId(receipt.id.toString());
        setTotalAmount(receipt.amount?.toString() || '');
 
         setReceiptDate(formatDate(receipt.receiptDate));
        // if (receipt.receiptDate) {
        //     const d = new Date(receipt.receiptDate);
        //     const pad = (n) => String(n).padStart(2, '0');
        //     const dateString = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        //     setReceiptDate(dateString);
        // }

       // setPaymentMode(receipt.receiptMethod?.toString() || '3');
        setTransactionId(receipt.transactionId  );
      //  setBankName(receipt.bankName || '');

       // setRemarks(receipt.notes || 'Receipt save payment');
        // if (receipt.receiptImage) {
        //     setReceiptPreview(receipt.receiptImage);
        //     setPaymentReceiptsFile(null);
        // } else {
        //     setReceiptPreview(null);
        // }
    };

    // Cancel edit
    const handleCancelEdit = () => {
        setIsEditMode(false);
        setEditingReceiptId(null);
        setReceiptId('');
        setTotalAmount('');
        setPaymentDate('');
        setPaymentMode('3');
        setTransactionId('');
        setBankName('');

         setRemarks('');
        setPaymentReceiptsFile(null);
        setReceiptPreview(null);
        setShowEditDateModal(false)

    };

    // Send receipt for verification
    const handleSendToVerify = async (receipt) => {
        if (!receipt || !receipt.id) {
            return;
        }

        try {
            setSendingToVerify(receipt.id);

            const result = await sendVerificationRequestWithNotifications(
                receipt.id,
            );

            if (result.success) {
                // Refresh the receipts list to show updated status
                await fetchReceipts(bookingId);
            }
        } catch (error) {
        } finally {
            setSendingToVerify(null);
        }
    };

    // Fetch receipts function
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
                bookingId: receipt.bookingId  ,
                receiptDate: receipt.receiptDate  ,
                amount: receipt.amount || receipt.Amount,
                receiptMethod: receipt.receiptMethod || receipt.ReceiptMethod,
                transactionId: receipt.transactionId || receipt.TransactionId,
                bankName: receipt.bankName || receipt.BankName,
                status: receipt.status  ,
                notes: receipt.notes || receipt.Notes,
                statusText: receipt.statusText,
                receiptImage: receipt.receiptImage || receipt.ReceiptImage
            }));

            // Filter for current booking
            if (hasBookingId) {
                const filteredReceipts = normalizedReceipts.filter(
                    (r) => String(r.bookingId) === String(currentBookingId),
                );
                setReceipts(filteredReceipts);
            } else {
                setReceipts(normalizedReceipts);
            }
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

    const getUserId = () => {
        const stored = localStorage.getItem("userId") || localStorage.getItem("spendwise_userId");
        const parsed = stored ? Number(stored) : NaN;
        return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
      };
      const formatDate = (dateStr) => {
            if (!dateStr) return null;
            const date = new Date(dateStr);
            const formatted = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
            return formatted;
        };

    // Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();

        const trimmedTransactionId = transactionId?.trim() || '';
        const trimmedPaymentMode = paymentMode?.toString().trim() || '';

        // Validation
        if (
            !totalAmount ||
            !paymentDate ||
            !trimmedPaymentMode ||
            !trimmedTransactionId
        ) {
            const missingFields = [];
            if (!totalAmount) missingFields.push('• Amount');
            if (!paymentDate) missingFields.push('• Receipt Date');
            if (!trimmedPaymentMode) missingFields.push('• Payment Method');
            if (!trimmedTransactionId) missingFields.push('• Transaction ID');

            Swal.fire({
  icon: "warning",
  title: "Validation Error",
  html: missingFields.join("<br/>")
});
            return;
        }

        setSaving(true);

        try {
            const formattedDate = new Date(paymentDate).toISOString();
            const safeBookingId = bookingId ? parseInt(bookingId, 10) : 0;

            // Validate bookingId
            if (!safeBookingId || safeBookingId === 0) {
                Swal.fire({
  icon: "warning",
  title: "Invalid Booking ID",
  text: "Please enter a valid Booking ID"
});
                setSaving(false);
                return;
            }

            const formData = new FormData();
            formData.append("id", receiptId ? parseInt(receiptId, 10) : 0);
            formData.append("bookingId", safeBookingId);
            formData.append("amount", parseFloat(totalAmount));
            formData.append("receiptDate", formattedDate);
            formData.append("receiptMethod", trimmedPaymentMode);
            formData.append("transactionId", trimmedTransactionId);
            formData.append("bankName", bankName?.trim() || '');

            formData.append("notes", remarks?.trim() || 'Receipt save payment');
              formData.append("userId", getUserId());

            if (paymentReceiptsFile) {
                formData.append("receiptImage", paymentReceiptsFile);
            }

            const response = await axiosInstance.post(
                API_ENDPOINTS.RECEIPT_SAVE,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            if (response.status === 200 || response.status === 201) {
                await fetchReceipts(bookingId);

                const actionText = isEditMode ? 'updated' : 'saved';
                const successMessage =
                    `Receipt ${actionText} successfully!\n\n` +
                    `Amount: ₹${parseFloat(totalAmount).toLocaleString()}\n` +
                    `Transaction ID: ${transactionId}`;

                Swal.fire({
  icon: "success",
  title: isEditMode ? "Receipt Updated" : "Receipt Saved",
  html: `
    Amount: ₹${parseFloat(totalAmount).toLocaleString()} <br/>
    Transaction ID: ${transactionId}
  `
});
                handleCancelEdit();
                setPaymentReceiptsFile(null);
                setReceiptPreview(null);


                if (!routeBookingId) {
                    setBookingId('');
                }
            }

        } catch (error) {
            console.error('Receipt save error:', error);
            let errorMessage = 'Failed to save receipt. Please try again.';

            if (error.response?.data?.title) {
                errorMessage = error.response.data.title;
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.errors) {
                const errors = error.response.data.errors;
                const errorList = Object.keys(errors).map(key => `${key}: ${errors[key].join(', ')}`).join('\n');
                errorMessage = `Validation errors:\n${errorList}`;
            } else if (error.message) {
                errorMessage = error.message;
            }

            Swal.fire({
  icon: "error",
  title: "Save Failed",
  text: errorMessage
});
        } finally {
            setSaving(false);
        }
    };


    const handleUpdate = async () => {
    if (!receiptDate) {
        Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Date is required'
        });
        return;
    }

  try {
    setLoading(true);

    const payload = {
      receiptId: editingReceiptId,
      receiptDate: new Date(receiptDate).toISOString(),
       transactionId: transactionId,
        amount:  totalAmount
    };

    console.log("Update Payload:", payload);

    await axiosInstance.post(
      API_ENDPOINTS.RECEIPT_UPDATE,
      payload
    );

    Swal.fire({
      icon: 'success',
      title: 'Success',
      text: 'Receipt date updated successfully'
    });

    setShowEditDateModal(false);
    fetchReceipts(bookingId);

  } catch (error) {
    console.log("Full Error:", error.response);
    console.log("Error Data:", error.response?.data);

    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error?.response?.data?.message || 'Something went wrong'
    });
  } finally {
    setLoading(false);
  }
};

    // Filter receipts for current booking
    const filteredReceipts = bookingId
        ? receipts.filter((r) => String(r.bookingId) === String(bookingId))
        : receipts;

    return (
        <BookingWrapper className="dashboard-container">
            {/* Header */}
            <div className="dashboard-header">
                <div className="dashboard-header-content">
                    <div className="dashboard-header-icon">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <line x1="12" y1="1" x2="12" y2="23"></line>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                    </div>
                    <div>
                        <h2 className="dashboard-title">OCR Payment Update</h2>
                        <p className="dashboard-subtitle">
                            Manage and track payment transactions
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>

                    <button className="primary-btn" onClick={() => navigate(-1)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                        </svg>
                        Back
                    </button>
                    <ReminderButton
                        size="small"
                        onClick={() => setShowReminderPopup(true)}

                    />
                </div>
            </div>

            {/* Booking Information */}
            {bookingId &&
                (!loadingBooking && booking ? (
                    <div className="card">
                        <div className="booking-info-matrix">

                            <div className="booking-info-row">
                                <label>Township :</label>
                                <span className="booking-info-value">
                                    {booking.township || 'N/A'}
                                </span>
                            </div>

                            <div className="booking-info-row">
                                <label>Plot :</label>
                                <span className="booking-info-value">
                                    {booking.plotNumber || 'N/A'}
                                </span>
                            </div>

                            <div className="booking-info-row">
                                <label>Size :</label>
                                <span className="booking-info-value">
                                    {booking.plotSize || 'N/A'}
                                </span>
                            </div>

                            <div className="booking-info-row">
                                <label>Client :</label>
                                <span className="booking-info-value">
                                    {booking.clientName || 'N/A'}
                                </span>
                            </div>

                            <div className="booking-info-row">
                                <label>Mobile :</label>
                                <span className="booking-info-value">
                                    {booking.clientMobile || 'N/A'}
                                </span>
                            </div>

                            <div className="booking-info-row">
                                <label>Booking Date :</label>
                                <span className="booking-info-value">
                                    {booking.bookingDate
                                        ? formatDisplayDate(booking.bookingDate)
                                        : 'N/A'}
                                </span>
                            </div>

                        </div>
                    </div>

                ) : (
                    <div className="card">
                        <div className="loading-message">
                            {bookingId
                                ? 'Loading booking information...'
                                : 'Enter a Booking ID to view details'}
                        </div>
                    </div>
                ))}

            {/* Payment Form */}
            <div
                className={`card ${isEditMode ? 'edit-mode' : ''}`}
            >
                <div className="ocr-payment-form-header">
                    <h3>
                        {isEditMode
                            ? 'Edit Payment Information'
                            : 'Payment Information'}
                    </h3>
                    {/* <div
                        className={`ocr-payment-form-badge ${isEditMode ? 'edit-mode' : ''}`}
                    >
                        {isEditMode
                            ? `Editing Receipt #${editingReceiptId}`
                            : 'OCR Transaction'}
                    </div> */}
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="ocr-payment-form-grid">
                        <div className="ocr-form-field">
                            <label htmlFor="totalAmount">
                                Amount *
                            </label>
                            <input
                                id="totalAmount"
                                type="number"
                                value={totalAmount}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === "" || Number(value) >= 0) {
                                    setTotalAmount(value);
                                    }
                                }}
                                placeholder="Enter amount"
                                min="0"
                                step="0.01"
                                required
                                className="form-control"
                                />
                        </div>

                        <div className="ocr-form-field">
                            <label htmlFor="paymentDate">
                                Receipt Date *
                            </label>
                            <input
                                id="paymentDate"
                                type="date"
                                value={paymentDate}
                                onChange={(e) => setPaymentDate(e.target.value)}
                                required
                                className='form-control'
                            />
                        </div>

                        <div className="ocr-form-field">
                            <label htmlFor="paymentMode">
                                Payment Method *
                            </label>
                            <select
                                id="paymentMode"
                                value={paymentMode}
                                onChange={(e) => setPaymentMode(e.target.value)}
                                required
                                className='form-control'
                            >
                                {paymentModes.map((mode) => (
                                    <option key={mode.value} value={mode.value}>
                                        {mode.label}
                                    </option>
                                ))}
                            </select>
                        </div>



                        <div className="ocr-form-field">
                            <label htmlFor="transactionId">
                                Transaction ID / Reference No/ Cheque No *
                            </label>
                            <input
                                id="transactionId"
                                type="text"
                                value={transactionId}
                                onChange={(e) =>
                                    setTransactionId(
                                        e.target.value ,
                                    )
                                }
                                placeholder="Enter transaction ID"
                                required
                                className='form-control'
                            />
                        </div>

                        <div className="ocr-form-field">
                        <label htmlFor="bankName">
                            Bank Name
                        </label>

                        <select
                            id="bankName"
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            className="form-control"
                        >
                            <option value="">Select Bank</option>

                            {bankList.map((bank) => (
                            <option key={bank.id} value={bank.name}>
                                {bank.name}
                            </option>
                            ))}

                        </select>
                        </div>



                        <div className="ocr-form-field ocr-remarks-field">
                            <div className="ocr-remarks-section">
                                <label htmlFor="remarks">
                                    Remarks / Notes
                                </label>
                                <textarea
                                    id="remarks"
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    placeholder="Enter any remarks or notes"
                                    rows="4"
                                    className='form-control'
                                />
                            </div>
                            <div className="ocr-file-upload-section">
                                <label>
                                    Payment Receipt (PDF/Image)
                                </label>
                                <div className="file-item-wrapper">
                                    <label className="upload-box">
                                        <span className="upload-text">Click to Upload</span>

                                        <input
                                            type="file"
                                            accept="image/*,application/pdf"
                                            onChange={(e) => handleFileChange(e.target.files)}
                                            className='form-control'
                                        />
                                    </label>


                                    <div className="file-preview-box">
                                        {receiptPreview ? (
                                            isPdf(paymentReceiptsFile || receiptPreview) ? (
                                                <div className="pdf-preview-box">
                                                    <button
                                                        className="pdf-preview-btn"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            window.open(receiptPreview, "_blank");
                                                        }}
                                                    >
                                                        Preview PDF
                                                    </button>
                                                </div>
                                            ) : (
                                                <img
                                                    src={receiptPreview}
                                                    alt="receipt"
                                                    className="preview-image"
                                                />
                                            )
                                        ) : (
                                            <div className="empty-preview">No file selected</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="ocr-payment-actions">
                        <button
                            type="submit"
                            className="primary-btn"
                            disabled={saving}
                        >
                            {saving
                                ? 'Saving...'
                                : isEditMode
                                    ? ' Save '
                                    : ' Save '}
                        </button>
                    </div>
                </form>
            </div>

            {/* Receipt History Table */}
            <div className="card">
                <div className="dashboard-table-header">
                    <h3 className="dashboard-table-title">
                        Receipt History
                    </h3>
                    <div className="dashboard-badge">
                        {filteredReceipts.length} Records
                        {bookingId && ` for Booking ID ${bookingId}`}
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
                                onClick={() => fetchReceipts(bookingId)}
                                className="primary-btn"
                            >
                                Retry
                            </button>
                        </div>
                    ) : filteredReceipts.length === 0 ? (
                        <div className="no-data">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
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
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredReceipts.map((receipt) => {
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
                                            <td>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        gap: '8px',
                                                        flexWrap: 'nowrap',
                                                        alignItems: 'center',
                                                    }}
                                                >
                                                    {receipt.status == 3 && (
                                                        <>
                                                            <button
                                                            className="primary-btn"
                                                            onClick={() => loadReceipt(receipt.id)}
                                                            >
                                                            Print Receipt
                                                            </button>

                                                            {hasPermission(PERMISSIONS.CAN_EDIT_RECEIPT_DATE) && (
                                                            <button
                                                                className="primary-btn"
                                                                onClick={() => {
                                                                handleEditReceipt(receipt);
                                                                setShowEditDateModal(true);
                                                                }}
                                                            >
                                                                Edit
                                                            </button>
                                                            )}
                                                        </>
                                                        )}
                                                
                                                     <button
                                                        className="primary-btn"
                                                        onClick={() => deleteReceipt(receipt.id)}
                                                        >
                                                         Delete  
                                                        </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {showEditDateModal && (
  <div className="modal-overlay">
    <div className="modal-content">

      <div className="modal-header">
        <h3>Update</h3>
        <button className='modal-close-btn' onClick={() => setShowEditDateModal(false)}>
          <FiX size={20} />
        </button>
      </div>

      <div className="form-group">
        <label>Select Date *</label>
        <input
          type="date"
          className="form-control"
          value={receiptDate}
          onChange={(e) => setReceiptDate(e.target.value)}
        />
      </div>
        <div className="form-group">
        <label>Transaction ID *</label>
        <input
          type="text"
          className="form-control"
          value={transactionId}
          onChange={(e) => setTransactionId(e.target.value)}
        />
      </div>
        <div className="form-group">
        <label>Amount *</label>
        <input
          type="number"
          className="form-control"
          value={totalAmount}
          onChange={(e) => setTotalAmount(e.target.value)}
        />
      </div>

      <div className="modal-actions gap-3">
        <button className="primary-btn" onClick={handleUpdate}>
          Submit
        </button>

        <button
          className="primary-btn"
          onClick={() => handleCancelEdit()}
        >
          Cancel
        </button>
      </div>

    </div>
  </div>
)}
            {showViewReceiptModal && (
  <div className="modal-overlay">
    <div className="modal-content print-reciept-modal">

      <div className="modal-header">
        <h3>Receipt</h3>
        <button
          className="modal-close-btn"
          onClick={() => setShowViewReceiptModal(false)}
        >
          <FiX size={20} />
        </button>
      </div>

      <div className="">
        <GenerateReceipt data={receiptData} />
      </div>

    </div>
  </div>
)}

            <ReminderPopup
                isOpen={showReminderPopup}
                onClose={() => setShowReminderPopup(false)}
                title="Create Reminder"
                bookingId={bookingId}
            />

            
            {/* delete Popup */}
            {showDeletePopup && (
                <div className="modal-overlay" onClick={(e) => e.target.className === 'popup-overlay' && closePopups()}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Delete Receipt</h3>
                            <button className="close-btn" onClick={closePopups}>×</button>
                        </div>
                        <div className="">
                               
                            <div className="rejection-reason">
                                <label>Delete Reason <span style={{ color: "red" }}>*</span></label> 
                                <textarea
                                    value={deleteReason}
                                    onChange={(e) => setDeleteReason(e.target.value)}
                                    placeholder="Enter reson to delete this receipt"
                                    disabled={processing}
                                    className="form-control"
                                />
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button
                                className="primary-btn"
                                onClick={closePopups}
                                disabled={processing}
                            >
                                Cancel Delete
                            </button> &nbsp;
                            <button
                                className="primary-btn"
                                onClick={confirmDelete}
                                disabled={
                                    processing ||
                                    !deleteReason.trim()
                                }
                            >
                                {processing ? "Processing..." : "Confirm Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </BookingWrapper >
    );
}
