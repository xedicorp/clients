import { useEffect, useState } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import BookingWrapper from "../Property/style";
import axiosInstance from "../../utilities/axiosInstance";
import API_ENDPOINTS from "../../utilities/apiConfig";
import Swal from "sweetalert2";
import { FiX } from "react-icons/fi";

export default function Ledger() {

    const { id  } = useParams();
    const [loading, setLoading] = useState(true);
    const [transactionsList, setTransactionsList] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [error, setError] = useState(null);
    const [ledgerName, setLedgerName] = useState('');
    const [runningTotal, setRunningTotal] = useState(0);
    const [transactionModeList, setTransactionModeList] = useState([]);
    const [formData, setFormData] = useState({
    id: 0,
    plotId: "",
    amount: "",
    transactionDate: "",
    notes: ""
  });
   const statusOptions = [
        { value: '1', label: 'Pending' },
        { value: '2', label: 'Received' },
        { value: '3', label: 'Cleared' },
    ];
    const [filters, setFilters] = useState({
  accountId: "",
  fromDate: "",
  toDate: ""
});
const paymentModes = [
  { value: "1", label: "Bank Transfer" },
  { value: "2", label: "Cheque" },
  { value: "4", label: "UPI" },
  { value: "5", label: "NEFT/RTGS" },
  { value: "6", label: "Demand Draft" },
];
const getTransactionType = (headName) => {
  switch (headName) {
    case "Receipt":
      return "RECEIPT";
    case "Discount":
      return "DISCOUNT";
    case "Excess Refund":
      return "REFUND";
    default:
      return "";
  }
};

const [townshipList, setTownshipList] = useState([]);
useEffect(() => {
  const fetchTownships = async () => {
    try {
      const res = await axiosInstance.get(API_ENDPOINTS.TOWNSHIP_LIST);
      const list = Array.isArray(res.data) ? res.data : res.data?.value || [];
      setTownshipList(list);
    } catch (err) {
      console.error(err);
    }
  };

  fetchTownships();
}, []);
   // Fetch transactions  
    const fetchTransactions = async () => {
    setLoading(true);
    setError(null);

    try {

        let url = `${API_ENDPOINTS.LEDGER}?`; 
            url += `accountId=${id}&`; 
        if (filters.fromDate) {
            url += `fromDate=${filters.fromDate}&`;
        }
        if (filters.toDate) {
            url += `toDate=${filters.toDate}&`;
        } 
        const response = await axiosInstance.get(url);
        let transList = []; 
        transList = response.data || [];       
        if(transList.length > 0){  
          setLedgerName(transList[0]?.ledgerName || ''); 
          setTransactionsList(transList);
        }

    } catch (error) {
        // ❌ ekhane kichu change kori ni (sir er code same)
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


  useEffect(() => {
    fetchTransactions();
  }, []);

  // ✅ Open Edit Modal
  const handleEditClick = (item) => {
    setFormData({
      id: item.id,
      plotId: item.plotId,
      amount: item.amount,
      transactionDate: item.transactionDate?.split("T")[0],
      notes: item.notes || ""
    });

    setShowEditModal(true);
  };

  // ✅ Handle Change
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // ✅ Update
  const handleUpdate = async () => {

    if (!formData.amount || !formData.transactionDate) {
      Swal.fire("Error", "Please fill required fields", "error");
      return;
    }

    const payload = {
      id: formData.id, // 🔥 important
      plotId: Number(formData.plotId),
      amount: Number(formData.amount),
      transactionDate: formData.transactionDate,
      notes: formData.notes
    };

    try {
      await axiosInstance.post(API_ENDPOINTS.TDS_ENTRY, payload);

      Swal.fire("Success", "TDS updated successfully", "success");

      setShowEditModal(false);
    //  fetchTdsList();

    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Update failed", "error");
    }
  };


  const handleDelete = async (item) => {
  const confirm = await Swal.fire({
    title: "Are you sure?",
    text: "This transaction will be deleted permanently",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
  });

  if (!confirm.isConfirmed) return;

  try {
    const payload = {
      transactionId: item.id,
      transactionType: getTransactionType(item.headName),
    };

    await axiosInstance.post(
      API_ENDPOINTS.TRANSACTION_DELETE, // "/Account/delete-transaction"
      payload
    );

    Swal.fire("Deleted!", "Transaction deleted successfully", "success");

    fetchTransactions(); // refresh

  } catch (err) {
    

    const msg =
      err.response?.data?.message ||
      err.response?.data?.title ||
      "Delete failed";

    Swal.fire("Error", msg, "error");
  }
  
};
let prev=0;
  return (
    <BookingWrapper className="dashboard-container">

      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Ledger : {ledgerName}</h1>
          <p className="dashboard-subtitle">Transactions List</p>
        </div>
        <div className="dashboard-header-actions">
          <button className="primary-btn" onClick={() => window.history.back()}>
            Back
          </button>
        </div>
      </div>
        <div className="card">
            <div className="filter-section">
                <div className="row">
                     
                    <div className="col-md-3">
                        {/* From Date */}
  <input
    type="date"
    value={filters.fromDate}
    onChange={(e) =>
      setFilters(prev => ({ ...prev, fromDate: e.target.value }))
    }
    className="form-control"
  />
                    </div>
                    <div className="col-md-3">
                        {/* To Date */}
  <input
    type="date"
    value={filters.toDate}
    onChange={(e) =>
      setFilters(prev => ({ ...prev, toDate: e.target.value }))
    }
    className="form-control"
  />
                    </div>
                    <div className="col-md-2">
                        {/* Apply Button */}
                  <button className="primary-btn" onClick={fetchTransactions}>
                    Search
                  </button>
                      </div>
                </div> 
</div>
        </div>
        <div className="card">
                <div className="dashboard-table-header">
                    <h3 className="dashboard-table-title">
                        Transactions List
                    </h3>
                    <div className="ocr-payment-table-badge">
                        {transactionsList.length} Records
                     
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
                           
                        </div>
                    ) : (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Date</th>

                                    <th>Transaction Detail</th>
                                     <th>Notes</th>
                                    <th style={{textAlign:"right"}}>
                                        Debit(+)
                                    </th>
                                     <th style={{textAlign:"right"}}>
                                        Credit(+)
                                    </th>
                                    <th style={{textAlign:"right"}}>Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactionsList.map((receipt) => {
                                    prev= prev + receipt.debit ;
                                    const methodLabel =
                                    paymentModes.find(
                                      (m) => m.value === String(receipt.transactionMethod)
                                    )?.label || '-';
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
                                    const status = receipt.statusText?.toLowerCase();
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
                                                    ? new Date(receipt.transactionDate).toLocaleDateString("en-GB")
                                                    : '-'}
                                            </td>

                                            <td>
                                                <p>
                                                    {' '}
                                                    {receipt.transactionId ||
                                                        '-'}
                                                </p>
                                              
                                                <p>{methodLabel} - {receipt.bankName || '-'}</p>
                                               
                                            </td>
                                             <td>{receipt.notes || '-'}</td>
                                          
                                            <td style={{textAlign:"right"}}>
                                                {receipt.debit
                                                    ? `₹${parseFloat(receipt.debit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                                                    : '-'}
                                            </td>
                                            <td style={{textAlign:"right"}}>{receipt.credit
                                                    ? `₹${parseFloat(receipt.credit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                                                    : '-'}</td>
                                            <td style={{textAlign:"right"}} className="amount">
                                                      {`₹${prev.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}            

                                            </td>
                                                                                      
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>


      {/* ✅ Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">

            <div className="modal-header">
              <h3>Edit TDS Entry</h3>
              <button
                className="modal-close-btn"
                onClick={() => setShowEditModal(false)}
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="form-group">
              <label>Amount *</label>
              <input
                type="text"
                className="form-control"
                value={formData.amount}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*\.?\d{0,2}$/.test(value)) {
                    handleChange("amount", value);
                  }
                }}
              />
            </div>

            <div className="form-group">
              <label>Transaction Date *</label>
              <input
                type="date"
                className="form-control"
                value={formData.transactionDate}
                onChange={(e) => handleChange("transactionDate", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea
                className="form-control"
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
              />
            </div>

            <div className="modal-actions">
              <button
                className="primary-btn"
                onClick={() => setShowEditModal(false)}
              >
                Close
              </button>

              <button
                className="primary-btn"
                onClick={handleUpdate}
              >
                Update
              </button>
            </div>

          </div>
        </div>
      )}

    </BookingWrapper>
  );
}