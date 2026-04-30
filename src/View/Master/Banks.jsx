import { useState, useEffect } from "react";
import { FiX, FiTrash2, FiEdit2 } from "react-icons/fi";
import axiosInstance from "../../utilities/axiosInstance";
import API_ENDPOINTS from "../../utilities/apiConfig";
import Swal from "sweetalert2";

export default function Banks() {

  const [bankList, setBankList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [bankName, setBankName] = useState("");
  const [editingId, setEditingId] = useState(0);

  useEffect(() => {
    getAllBanks();
  }, []);

  // ✅ Get All Banks
  const getAllBanks = async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.BANK_LIST);

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.value || [];

      setBankList(data);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to load banks", "error");
    }
  };

  // ✅ Open Add Modal
  const handleAdd = () => {
    setEditingId(0);
    setBankName("");
    setShowModal(true);
  };

  // ✅ Open Edit Modal
  const handleEdit = async (id) => {
    try {
      const res = await axiosInstance.get(
  `${API_ENDPOINTS.BANK_GET_BY_ID}/${id}`
);

      const data = res.data;

      setEditingId(data.id);
      setBankName(data.name);
      setShowModal(true);

    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to fetch bank details", "error");
    }
  };

  // ✅ Save (Add + Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!bankName.trim()) {
      Swal.fire("Error", "Please enter bank name", "error");
      return;
    }

    const payload = {
      id: editingId || 0,
      name: bankName
    };

    try {
      await axiosInstance.post(API_ENDPOINTS.BANK_SAVE, payload);

      Swal.fire(
        "Success",
        editingId ? "Bank updated successfully" : "Bank added successfully",
        "success"
      );

      setShowModal(false);
      setBankName("");
      setEditingId(0);

      getAllBanks();

    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Save failed", "error");
    }
  };

  // ✅ Delete
  const handleDelete = async (id) => {
  const confirm = await Swal.fire({
    title: "Are you sure?",
    text: "You want to delete this bank?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!"
  });

  if (!confirm.isConfirmed) return;

  try {
    await axiosInstance.delete(
      `${API_ENDPOINTS.BANK_DELETE}/${id}`
    );

    Swal.fire("Deleted!", "Bank deleted successfully", "success");

    getAllBanks();

  } catch (error) {
    console.error(error);
    Swal.fire("Error", "Delete failed", "error");
  }
};
  return (
    <div className="dashboard-container">

      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Bank List</h1>
          <p className="dashboard-subtitle">Manage Banks</p>
        </div>

        <div className="dashboard-header-actions">
          <button className="primary-btn" onClick={handleAdd}>
            <span>Add Bank</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="dashboard-table-header">
          <h3>Bank List</h3>
          <p>Showing {bankList.length} records</p>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Bank Name</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {bankList.length > 0 ? (
                bankList.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td style={{ display: "flex", gap: "10px" }}>

                      {/* Edit */}
                      <button
                        className="primary-btn"
                        onClick={() => handleEdit(item.id)}
                      >
                        Edit
                      </button>

                      {/* Delete */}
                      {/* <button
                        className="primary-btn"
                        onClick={() => handleDelete(item.id)}
                      >
                        Delete
                      </button> */}

                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" className="no-data">
                    No banks found
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">

            <div className="modal-header">
              <h3>{editingId ? "Edit Bank" : "Add Bank"}</h3>
              <button
                className="modal-close-btn"
                onClick={() => setShowModal(false)}
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Bank Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Enter bank name"
                />
              </div>

              <div className="modal-actions">
                <button type="submit" className="primary-btn">
                  {editingId ? "Update" : "Save"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}