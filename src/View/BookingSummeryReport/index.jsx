import Wrapper from './style';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API_ENDPOINTS from '../../utilities/apiConfig';
import axiosInstance from '../../utilities/axiosInstance';
import LargeModal from '../../components/Modal/LargeModal';
import GenerateReceipt from '../../View/GenerateReceipt';
import Swal from 'sweetalert2';
import { FiX } from "react-icons/fi";
import hasPermission, { PERMISSIONS } from '../../utilities/HasPermission';

import { formatDisplayDate, formatDateTime } from '../../utilities/dateUtils';
const BookingSummeryReport = () => {
    const navigate = useNavigate();
    const [bookingId, setBookingId] = useState('');
    const [loading, setLoading] = useState(true);
    const [documents, setDocuments] = useState([]);
    const [loadingDocuments, setLoadingDocuments] = useState(false);
    const [loadingBooking, setLoadingBooking] = useState(false);
    const [transactionsList, setTransactionsList] = useState([]);
    const [error, setError] = useState(null);
    const [booking, setBooking] = useState(null);
    const [totalAmountReceived, setTotalAmountReceived] = useState('');
    const [totalDiscount, setTotalDiscount] = useState('');

    const [amountUnderVerification, setAmountUnderVerification] = useState('');
    const [showViewReceiptModal, setShowViewReceiptModal] = useState(false);
    const [receiptData, setReceiptData] = useState('');
    const [showReopenModal, setShowReopenModal] = useState(false);
    const [reopenReason, setReopenReason] = useState('');
    const [statusList, setStatusList] = useState([]);
const [selectedStatus, setSelectedStatus] = useState('');

    const statusOptions = [
        { value: '1', label: 'Pending' },
        { value: '2', label: 'Received' },
        { value: '3', label: 'Cleared' },
    ];
    const getStatusData = async () => {
    try {
      const response = await axiosInstance.get(
        API_ENDPOINTS.BOOKING_STATUS_TYPE_LIST
      );

      const formattedData = response.data.map(item => ({
        id: item.id,
        name: item.name
      }));

      setStatusList(formattedData);
    } catch (error) {
    }
  };

  useEffect(() => {
  getStatusData();
}, []);
    const formatDateOnly = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const loadReceipt = async (id) => {
        const response = await axiosInstance.get(
            API_ENDPOINTS.RECEIPT_BY_ID + '/' + id,
        );
        setReceiptData(response.data);
        console.log('Receipt data:', response.data);

        setShowViewReceiptModal(true);
    };
    const [transactionModeList, setTransactionModeList] = useState([]);
    const { id } = useParams();

    const fetchTransactionModeList = async () => {
        try {
            setLoading(true);

            const res = await axiosInstance.get(
                API_ENDPOINTS.TRANSACTIONMODE_LIST,
            );
            const list = res.data;
            setTransactionModeList(list);
        } catch (err) {
            Swal.fire(
                'Error',
                'Failed to load Transaction Modes list',
                'error',
            );
        } finally {
            setLoading(false);
        }
    };

    // Fetch receipts function
    const fetchTransactions = async (currentBookingId) => {
        setLoading(true);
        setError(null);

        try {
            const hasBookingId =
                currentBookingId && String(currentBookingId).trim() !== '';
            let url = `${API_ENDPOINTS.TRANSACTIONS_BY_BOOKINGID}?bookingId=${currentBookingId}`;

            const response = await axiosInstance.get(url);
            let transList = [];

            if (Array.isArray(response.data)) {
                transList = response.data;
            } else if (response.data && typeof response.data === 'object') {
                transList = response.data || [];
            }
            setTransactionsList(transList);
            // Filter for current booking
            let amount = 0;
            let discount = 0;
            let amtUnderVarification = 0;
            transList.map((receipt) => {
                if (receipt.status == 3 && receipt.headName == 'Receipt')
                    //3:Verified
                    amount = amount + receipt.amount;

                if (receipt.headName == 'Excess Refund')
                    //3:Verified
                    amount = amount - receipt.amount;

                if (receipt.headName == 'Discount')
                    //3:Verified
                    discount = discount + receipt.amount;

                if (receipt.status == 2 && receipt.headName == 'Receipt')
                    //2:Under Vaification
                    amtUnderVarification =
                        amtUnderVarification + receipt.amount;
            });

            setTotalAmountReceived(amount);
            setAmountUnderVerification(amtUnderVarification);
            setTotalDiscount(discount);
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
            setTransactionsList([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadDocument = async (doc) => {
        if (!doc?.documentId) {
            Swal.fire('Invalid Document', 'Missing document ID.', 'error');
            return;
        }

        try {
            Swal.fire({
                title: 'Downloading...',
                allowOutsideClick: false,
                showConfirmButton: false,
                didOpen: () => Swal.showLoading(),
            });

            const { data, headers } = await axiosInstance.get(
                `${API_ENDPOINTS.DOCUMENT_DOWNLOAD}?id=${doc.documentId}`,
                { responseType: 'blob' },
            );

            Swal.close();

            if (!data || data.size === 0) {
                throw new Error('Empty file received.');
            }

            const blob = new Blob([data], {
                type: headers['content-type'],
            });

            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = doc.fileName || `Document_${doc.documentId}`;
            link.click();

            URL.revokeObjectURL(url);
        } catch (error) {
            Swal.close();
            Swal.fire('Error', 'Download failed.', 'error');
        }
    };
    // Fetch booking details
    useEffect(() => {
        const fetchBookingDetails = async () => {
            try {
                setLoadingBooking(true);
                const response = await axiosInstance.get(
                    API_ENDPOINTS.GET_BOOKING_BY_ID + `?bookingId=${id}`,
                );
                console.log('Booking details response:', response.data);
                if (response.data) {
                    setBooking(response.data);
                } else {
                    setBooking(null);
                }
            } catch (error) {
                setBooking(null);
            } finally {
                setLoadingBooking(false);
            }
        };

        const loadDocuments = async () => {
            const docsResponse = await axiosInstance.get(
                `${API_ENDPOINTS.GET_DOCUMENTS_BY_BOOKING_ID}?bookingId=${id}`,
            );
            setDocuments(
                Array.isArray(docsResponse.data) ? docsResponse.data : [],
            );
        };
        fetchTransactionModeList();
        fetchBookingDetails();
        fetchTransactions(id);
        loadDocuments();
    }, [id]);

    // Fetch receipts
    // useEffect(() => {
    //     fetchTransactions(id);
    // }, [bookingId]);
useEffect(() => {
  const getUserId = () => {
    const stored = localStorage.getItem("userId");
    const parsed = stored ? Number(stored) : NaN;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  };

  const userId = getUserId();
  console.log("Logged User ID:", userId);

}, []);

    const handleReopenSubmit = async () => {
  const getUserId = () => {
    const stored = localStorage.getItem("userId");
    const parsed = stored ? Number(stored) : NaN;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  };

  // 🔒 Validation
  if (!reopenReason.trim()) {
    Swal.fire({
      icon: 'warning',
      title: 'Validation Error',
      text: 'Reopen reason is required'
    });
    return;
  }

  if (!selectedStatus) {
    Swal.fire({
      icon: 'warning',
      title: 'Validation Error',
      text: 'Booking status is required'
    });
    return;
  }

  try {
    setLoading(true);

    const payload = {
      bookingId: Number(id),
      statusId: Number(selectedStatus),
      userId: getUserId(),
      notes: reopenReason
    };

    console.log("Payload:", payload);

    await axiosInstance.post(
      API_ENDPOINTS.BOOKING_STATUS_CHANGE,
      payload
    );

    // ✅ Success popup
    Swal.fire({
      icon: 'success',
      title: 'Success',
      text: 'Booking reopened successfully'
    });

    // modal close
    setShowReopenModal(false);

    // reset
    setReopenReason('');
    setSelectedStatus('');

    

  } catch (error) {
    console.error(error);

    Swal.fire({
  icon: 'error',
  title: 'Error',
  text: error?.response?.data?.message || JSON.stringify(error.response?.data)
});
  } finally {
    setLoading(false);
  }
};

    return (
        <Wrapper className="dashboard-container">
            {/* ===== HEADER ===== */}
            <div className="dashboard-header">
                <div className="dashboard-header-content">
                    <div className="dashboard-header-text">
                        <div className="d-flex align-items-center gap-3">
                            <h2 className="dashboard-title">
                                Booking Summary{' '}
                            </h2>
                            <div className="dashboard-table-badge">{id}</div>
                        </div>

                        <p className="dashboard-subtitle">
                            Here is the summary of booking details, payment
                            information, client and associate details. You can
                            also view uploaded documents related to this
                            booking.
                        </p>
                    </div>
                </div>

                <div className="dashboard-header-actions">
                    <button
                        className="primary-btn"
                        onClick={() => navigate(-1)}
                    >
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
                </div>
            </div>

            {/* Booking Information */}

            <div className="card">
                <div className="dashboard-table-header">
                    <h3 className="dashboard-table-title">Booking Details</h3>
                </div>
                <div className="booking-info-matrix">
                    <div className="booking-info-row">
                        <label>Township</label>
                        <span className="booking-info-value">
                            {booking?.townshipName || 'N/A'}
                        </span>
                    </div>

                    <div className="booking-info-row">
                        <label>Plot</label>
                        <span className="booking-info-value">
                            {booking?.plotNo || 'N/A'}
                        </span>
                    </div>

                    <div className="booking-info-row">
                        <label>Size</label>
                        <span className="booking-info-value">
                            {booking?.plotSize || 'N/A'}
                        </span>
                    </div>

                    <div className="booking-info-row">
                        <label>Client</label>
                        <span className="booking-info-value">
                            {booking?.clientName || 'N/A'}
                        </span>
                    </div>

                    <div className="booking-info-row">
                        <label>Mobile</label>
                        <span className="booking-info-value">
                            {booking?.contactNo || 'N/A'}
                        </span>
                    </div>
                    <div className="booking-info-row">
                        <label>Client Email</label>
                        <span className="booking-info-value">
                            {booking?.clientEmail || 'N/A'}
                        </span>
                    </div>
                    <div className="booking-info-row">
                        <label>Client Address</label>
                        <span className="booking-info-value">
                            {booking?.clientAddress || 'N/A'}
                        </span>
                    </div>
                    <div className="booking-info-row">
                        <label>Booking Date</label>
                        <span className="booking-info-value">
                            {booking?.bookingDate
                                ? formatDisplayDate(booking?.bookingDate)
                                : 'N/A'}
                        </span>
                    </div>

                    {booking?.statusId === 50 &&
                        hasPermission(PERMISSIONS.CAN_REOPEN_BOOKING) && (
                            <div className="booking-info-row">
                            <button
                                className="primary-btn"
                                onClick={() => setShowReopenModal(true)}
                            >
                                Reopen Booking
                            </button>
                            </div>
                        )}
                </div>
            </div>
            {showReopenModal && (
  <div className="modal-overlay">
    <div className="modal-content">
        <div className="modal-header">
  <h3>Re-open Booking</h3>

  <button className='modal-close-btn' onClick={() => setShowReopenModal(false)}>
    <FiX size={20} />
  </button>
</div>
      

     

      {/* Booking Status Dropdown */}
      <div className="form-group">
  <label>Booking Status *</label>

  <select
    value={selectedStatus}
    onChange={(e) => setSelectedStatus(e.target.value)}
    className='form-control'
  >
    <option value="">Select Status</option>

    {statusList.map((status) => (
      <option key={status.id} value={status.id}>
        {status.name}
      </option>
    ))}
  </select>
</div>
 {/* Reopen Reason */}
      <div className="form-group ocr-remarks-section">
        <label>Re-open Reason *</label>
        <textarea
          value={reopenReason}
          onChange={(e) => setReopenReason(e.target.value)}
          placeholder="Enter reason"
          rows={4}
          className='form-control'
        />
      </div>
      {/* Buttons */}
      <div className='modal-actions gap-3'>
        <button 
  className="primary-btn" 
  onClick={handleReopenSubmit}
  disabled={loading}
>
  {loading ? "Submitting..." : "Submit"}
</button>

        <button
          className="primary-btn"
          onClick={() => setShowReopenModal(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

            <div className="card">
                <div className="dashboard-table-header">
                    <h3 className="dashboard-table-title">Financial Summary</h3>
                </div>
                <div className="booking-info-matrix">
                    <div className="booking-info-row">
                        <table>
                            <tr>
                                <td>
                                    {' '}
                                    <label>Total Agreement Value</label>
                                </td>
                                <td>
                                    {' '}
                                    <span className="booking-info-value">
                                        ₹{' '}
                                        {booking?.totalAgreementValue?.toFixed(
                                            2,
                                        ) || '0.00'}
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <label>TDS Deducted</label>
                                </td>
                                <td>
                                    {' '}
                                    <span className="booking-info-value">
                                        ₹{' '}
                                        {booking?.totalTDSDeducted?.toFixed(
                                            2,
                                        ) || '0.00'}
                                    </span>
                                </td>
                            </tr>

                            <tr>
                                <td>
                                    <label>Discount</label>
                                </td>
                                <td>
                                    <span className="booking-info-value">
                                        ₹{' '}
                                        {parseFloat(totalDiscount)?.toFixed(
                                            2,
                                        ) || '0.00'}
                                    </span>
                                </td>
                            </tr>
                        </table>
                    </div>

                    <div className="booking-info-row">
                        <label>Amount Received</label>
                        <span className="booking-info-value">
                            ₹ {parseFloat(totalAmountReceived).toFixed(2)}
                        </span>

                        <div className="booking-info-row">
                            <label>Under verification</label>{' '}
                            <span className="booking-info-value">
                                {' '}
                                ₹{' '}
                                {parseFloat(amountUnderVerification).toFixed(2)}
                            </span>
                        </div>
                    </div>

                    <div className="booking-info-row">
                        <label>Balance</label>
                        <span className="booking-info-value">
                            <h4>
                                ₹{' '}
                                {(
                                    booking?.totalAgreementValue -
                                    totalAmountReceived -
                                    booking?.totalTDSDeducted -
                                    totalDiscount
                                ).toFixed(2)}
                            </h4>
                        </span>
                    </div>
                </div>
            </div>
            <div className="card">
                <div className="dashboard-table-header">
                    <h3 className="dashboard-table-title">Associate Detail</h3>
                </div>
                <div className="booking-info-matrix">
                    <div className="booking-info-row">
                        <label>Name</label>
                        <span className="booking-info-value">
                            {booking?.associateName || 'N/A'}
                        </span>
                    </div>

                    <div className="booking-info-row">
                        <label>RERA No</label>
                        <span className="booking-info-value">
                            {booking?.associateReraNo || 'N/A'}
                        </span>
                    </div>

                    <div className="booking-info-row">
                        <label>Contact No</label>
                        <span className="booking-info-value">
                            {booking?.associateContactNo || 'N/A'}
                        </span>
                    </div>

                    <div className="booking-info-row">
                        <label>Leader Name</label>
                        <span className="booking-info-value">
                            {booking?.leaderName || 'N/A'}
                        </span>
                    </div>

                    <div className="booking-info-row">
                        <label>Leader Contact No</label>
                        <span className="booking-info-value">
                            {booking?.leaderContactNo || 'N/A'}
                        </span>
                    </div>
                </div>
            </div>

            <div class="card ">
                <div class="dashboard-table-header">
                    <h3 class="dashboard-table-title">Documents</h3>
                </div>
                <div className="table-wrapper">
                    {loadingDocuments ? (
                        <div className="loading-state">
                            <div className="loading-spinner"></div>
                            <p>Loading documents...</p>
                        </div>
                    ) : (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th className="left">Document ID</th>
                                    <th className="left">Document Type</th>
                                    <th className="left">Uploaded On</th>
                                    <th className="left">Uploaded By</th>
                                    <th className="left">Notes</th>
                                    {/* <th className="center">View</th> */}
                                    <th className="center">Download</th>
                                </tr>
                            </thead>
                            <tbody>
                                {documents
                                    .filter((doc) => doc && doc.documentId)
                                    .map((doc) => (
                                        <tr
                                            key={
                                                doc.documentId || Math.random()
                                            }
                                        >
                                            <td className="doc-id">
                                                <span className="doc-id-badge">
                                                    #{doc.documentId || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="doc-type">
                                                <span className="doc-type-badge">
                                                    {doc.documentTypeName ||
                                                        'Unknown'}
                                                </span>
                                            </td>
                                            <td className="date">
                                                {doc.uploadedOn ? (
                                                    formatDateOnly(
                                                        doc.uploadedOn,
                                                    )
                                                ) : (
                                                    <span className="empty-value">
                                                        -
                                                    </span>
                                                )}
                                            </td>
                                            <td className="uploaded-by">
                                                {doc.uploadedBy || (
                                                    <span className="empty-value">
                                                        -
                                                    </span>
                                                )}
                                            </td>
                                            <td className="notes">
                                                {doc.notes || (
                                                    <span className="empty-value">
                                                        No notes
                                                    </span>
                                                )}
                                            </td>
                                            {/* <td className="view center">
                                                        <button 
                                                            className="view-btn" 
                                                            onClick={() => handleViewDocument(doc)}
                                                            title="View Document Details"
                                                            disabled={!doc.documentId}
                                                        >
                                                            View
                                                        </button>
                                                    </td> */}
                                            <td className="download center">
                                                <button
                                                    className="primary-btn"
                                                    onClick={() =>
                                                        handleDownloadDocument(
                                                            doc,
                                                        )
                                                    }
                                                    title="Download Document"
                                                    disabled={!doc.documentId}
                                                >
                                                    <svg
                                                        viewBox="0 0 24 24"
                                                        width="16"
                                                        height="16"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                    >
                                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                                        <polyline points="7 10 12 15 17 10"></polyline>
                                                        <line
                                                            x1="12"
                                                            y1="15"
                                                            x2="12"
                                                            y2="3"
                                                        ></line>
                                                    </svg>
                                                    <span>Download</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                {documents.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="no-data">
                                            <svg
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <circle
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                ></circle>
                                                <line
                                                    x1="12"
                                                    y1="8"
                                                    x2="12"
                                                    y2="12"
                                                ></line>
                                                <line
                                                    x1="12"
                                                    y1="16"
                                                    x2="12.01"
                                                    y2="16"
                                                ></line>
                                            </svg>
                                            <p>No documents uploaded yet</p>
                                            <span>
                                                Start by uploading your first
                                                loan document
                                            </span>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
            {/* Receipt History Table */}
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
                        Transactions List
                    </h3>
                    <div className="ocr-payment-table-badge">
                        {transactionsList.length} Records
                        {id && ` for Booking ID ${id}`}
                    </div>
                </div>

                <div className="table-wrapper">
                    {loading ? (
                        <div className="loading-state">
                            <p>Loading transactions...</p>
                        </div>
                    ) : error ? (
                        <div className="error-state">
                            <p>{error}</p>
                            <button
                                onClick={() => fetchTransactions(id)}
                                className="primary-btn"
                            >
                                Retry
                            </button>
                        </div>
                    ) : transactionsList.length === 0 ? (
                        <div className="no-data">
                            <p>No transaction records found</p>
                            {bookingId && (
                                <span>
                                    No transaction found for Booking ID{' '}
                                    {bookingId}
                                </span>
                            )}
                        </div>
                    ) : (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Date</th>

                                    <th>Transaction Detail</th>
                                    <th>Type</th>
                                    <th>Status</th>

                                    <th>Notes</th>
                                    <th style={{ textAlign: 'right' }}>
                                        Amount
                                    </th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactionsList.map((receipt) => {
                                    const methodLabel =
                                        transactionModeList.find(
                                            (m) =>
                                                m.id ===
                                                receipt.transactionMethod,
                                        )?.modeName ||
                                        receipt.transactionMethod ||
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
                                            <td className="date">
                                                {receipt.transactionDate
                                                    ? new Date(
                                                          receipt.transactionDate,
                                                      ).toLocaleDateString()
                                                    : '-'}
                                            </td>

                                            <td>
                                                {methodLabel}
                                                <p>
                                                    {' '}
                                                    {receipt.transactionId ||
                                                        '-'}
                                                </p>
                                                <p>{receipt.bankName || '-'}</p>
                                            </td>
                                            <td>
                                                {receipt.headName ===
                                                    'Excess Refund' && (
                                                    <span
                                                        style={{ color: 'red' }}
                                                    >
                                                        {' '}
                                                        {receipt.headName}{' '}
                                                    </span>
                                                )}

                                                {receipt.headName ===
                                                    'Receipt' && (
                                                    <span
                                                        style={{
                                                            color: 'green',
                                                        }}
                                                    >
                                                        {' '}
                                                        {receipt.headName}{' '}
                                                    </span>
                                                )}

                                                {receipt.headName ===
                                                    'Discount' && (
                                                    <span
                                                        style={{
                                                            color: 'blue',
                                                        }}
                                                    >
                                                        {' '}
                                                        {receipt.headName}{' '}
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                <span
                                                    className={`ocr-status-badge status-${statusClass}`}
                                                >
                                                    {receipt.statusText}
                                                </span>
                                            </td>

                                            <td>{receipt.notes || '-'}</td>
                                            <td
                                                className="amount"
                                                style={{ textAlign: 'right' }}
                                            >
                                                {receipt.amount
                                                    ? `₹${parseFloat(receipt.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                                                    : '-'}
                                            </td>
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
                                                        <button
                                                            className="primary-btn"
                                                            onClick={() =>
                                                                loadReceipt(
                                                                    receipt.id,
                                                                )
                                                            }
                                                        >
                                                            Print Receipt
                                                        </button>
                                                    )}
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
        </Wrapper>
    );
};

// ===== REUSABLE FIELD COMPONENT =====
const SummaryField = ({ label, value }) => (
    <div className="summary-field">
        <label>{label}</label>
        <span className="summary-value">{value || '—'}</span>
    </div>
);

export default BookingSummeryReport;
