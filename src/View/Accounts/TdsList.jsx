import { useEffect, useState } from "react";
import BookingWrapper from "../Property/style";
import axiosInstance from "../../utilities/axiosInstance";
import API_ENDPOINTS from "../../utilities/apiConfig";
import Swal from "sweetalert2";
import { FiX } from "react-icons/fi";

export default function TdsList() {

  const [tdsList, setTdsList] = useState([]);
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
  const fetchTdsList = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get(API_ENDPOINTS.TDS_LIST);

      const list =
        Array.isArray(res.data) ? res.data :
        Array.isArray(res.data?.value) ? res.data.value : [];

      setTdsList(list);

    } catch (err) {
      Swal.fire("Error", "Failed to load TDS list", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTdsList();
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
      fetchTdsList();

    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Update failed", "error");
    }
  };

  const totalAmount = tdsList.reduce((sum, item) => {
    return sum + (Number(item.amount) || 0);
  }, 0);

  return (
    <BookingWrapper className="dashboard-container">

      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">TDS List</h1>
          <p className="dashboard-subtitle">Manage TDS Entries</p>
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
                <th>Township</th>
                <th>Plot</th>
                <th>Amount</th>
                <th>Transaction Date</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>

           <tbody>
  {loading ? (
    <tr>
      <td colSpan="6">Loading...</td>
    </tr>
  ) : tdsList.length === 0 ? (
    <tr>
      <td colSpan="6">No records found</td>
    </tr>
  ) : (
    <>
      {tdsList.map((item) => (
        <tr key={item.id}>
          <td>{item.townshipName}</td>
          <td>{item.plotNo}</td>
          <td>{item.amount}</td>
          <td>
            {item.transactionDate
              ? new Date(item.transactionDate).toLocaleDateString("en-GB")
              : ""}
          </td>
          <td>{item.notes}</td>
          <td>
            <button
              className="primary-btn"
              onClick={() => handleEditClick(item)}
            >
              Edit
            </button>
          </td>
        </tr>
      ))}

      {/* ✅ TOTAL ROW */}
      <tr style={{ fontWeight: "bold", background: "#f8fafc" }}>
        <td colSpan="2">Total</td>
        <td>₹ {totalAmount.toLocaleString()}</td>
        <td colSpan="3"></td>
      </tr>
    </>
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