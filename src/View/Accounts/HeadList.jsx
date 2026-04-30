import { useEffect, useState } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import BookingWrapper from "../Property/style";
import axiosInstance from "../../utilities/axiosInstance";
import API_ENDPOINTS from "../../utilities/apiConfig";
import Swal from "sweetalert2";
import { FiX } from "react-icons/fi";

export default function HeadList() {
  const navigate = useNavigate();
  const [headsList, setHeadsList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showEditModal, setShowEditModal] = useState(false);

  const [formData, setFormData] = useState({
    id: 0,
    plotId: "",
    amount: "",
    transactionDate: "",
    notes: ""
  });

  // ✅ Load List
  const fetchHeadList = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get(API_ENDPOINTS.HEAD_LIST); 
      const list = res.data  ; 
      setHeadsList(list); 
    } catch (err) {
      Swal.fire("Error", "Failed to load Account Heads list", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeadList();
  }, []);

  // ✅ Open Edit Modal
  const showLedger = (id) => {
    navigate(`/accounts/ledger/${id}`);
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
      fetchTdsList();

    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Update failed", "error");
    }
  };

  return (
    <BookingWrapper className="dashboard-container">

      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Account Head List</h1>
          <p className="dashboard-subtitle">Manage account heads</p>
        </div>
        <div className="dashboard-header-actions">
          <button className="primary-btn" onClick={() => window.history.back()}>
            Back
          </button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">

          <table className="table">
            <thead>
              <tr>
                <th>Head Name</th>
                   <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {loading ? (
                <tr>
                  <td colSpan="6">Loading...</td>
                </tr>
              ) : headsList.length === 0 ? (
                <tr>
                  <td colSpan="6">No records found</td>
                </tr>
              ) : (
                headsList.map((item) => (
                  <tr key={item.id}>

                    <td>{item.headName}</td>
                  <td>{item.accountType}</td>

                    <td>
                      <button
                        className="primary-btn"
                        onClick={() => showLedger(item.id)}
                      >
                        Records
                      </button>
                    </td>

                  </tr>
                ))
              )}

            </tbody>
          </table>

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