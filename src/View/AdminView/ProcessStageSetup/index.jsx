import { useEffect, useState } from "react";
import axiosInstance from "../../../utilities/axiosInstance";
import API_ENDPOINTS from "../../../utilities/apiConfig";
import SmallModal from "../../../components/Modal/SmallModal";
import Swal from "sweetalert2";

const ProcessStage = () => {
  const [list, setList] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [form, setForm] = useState({
    id: 0,
    stage: "",
    days: "",
    userID: ""
  });

  const stages = [
    "Booked",
    "Login",
    "Sanction",
    "DD Print",
    "JDA Patta Applied",
    "JDA Patta Received",
    "DD Received",
    "Collection Received"
  ];

  // ===== Fetch List =====
  const fetchList = async () => {
  try {
    const res = await axiosInstance.get(API_ENDPOINTS.PROGRESS_STAGE_LIST);
    setList(res.data);
  } catch (err) {
    Swal.fire(
      "Error",
      err.response?.data?.message || "Failed to load data",
      "error"
    );
  }
};

  // ===== Fetch Users =====
  const fetchUsers = async () => {
  try {
    const res = await axiosInstance.get(API_ENDPOINTS.USER_LIST);
    setUsers(res.data);
  } catch (err) {
    Swal.fire(
      "Error",
      err.response?.data?.message || "Failed to load users",
      "error"
    );
  }
};

  useEffect(() => {
    fetchList();
    fetchUsers();
  }, []);

  // ===== Handle Input =====
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "days") {
      if (!/^\d*$/.test(value)) return; // only number
    }

    setForm({ ...form, [name]: value });
  };

  // ===== Open Add =====
  const handleAdd = () => {
    setForm({ id: 0, stage: "", days: "", userID: "" });
    setEditingItem(null);
    setShowModal(true);
  };

  // ===== Edit =====
  const handleEdit = (item) => {
  setForm({
    id: item.id,
    stage: item.stage,
    days: item.days,
    userID: item.userID
  });

  setEditingItem(item);
  setShowModal(true);
};

  // ===== Save =====
 const handleSave = async () => {
  if (!form.stage || !form.days || !form.userID) {
    Swal.fire("Warning", "All fields are required", "warning");
    return;
  }

  try {
    await axiosInstance.post(API_ENDPOINTS.PROGRESS_STAGE_SAVE, {
      id: form.id,
      stage: form.stage,
      days: Number(form.days),
      userID: Number(form.userID)
    });

    Swal.fire("Success", "Stage saved successfully", "success");

    setShowModal(false);
    fetchList();
  } catch (err) {
    const msg =
      err.response?.data?.message ||
      err.message ||
      "Something went wrong";

    Swal.fire("Error", msg, "error");
  }
};
  // ===== Delete =====
  const handleDelete = async (id) => {
  const confirm = await Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!"
  });

  if (!confirm.isConfirmed) return;

  try {
    await axiosInstance.post(
      `${API_ENDPOINTS.PROGRESS_STAGE_DELETE}/${id}` // ✅ FIX HERE
    );

    Swal.fire("Deleted!", "Stage has been deleted.", "success");

    fetchList();
  } catch (err) {
    const msg =
      err.response?.data?.message ||
      err.message ||
      "Delete failed";

    Swal.fire("Error", msg, "error");
  }
};

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Process Stage</h2>

        <button className="primary-btn" onClick={handleAdd}>
          Add Stage
        </button>
      </div>

      {/* ===== Table ===== */}
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Stage</th>
              <th>Days</th>
              <th>User</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {list.map((item) => (
              <tr key={item.id}>
                <td>{item.stage}</td>
                <td>{item.days}</td>
                <td>
                  {users.find((u) => u.id === item.userID)?.userName}
                </td>
                <td>
                    <div className="d-flex gap-2">
                      <button className="primary-btn" onClick={() => handleEdit(item)}>
                        Edit
                      </button>
                      <button className="primary-btn" onClick={() => handleDelete(item.id)}>
                        Delete
                      </button>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== Modal ===== */}
      <SmallModal
        title={editingItem ? "Edit Stage" : "Add Stage"}
        show={showModal}
        onClose={() => setShowModal(false)}
        actions={
          <>
            <button className="primary-btn" onClick={() => setShowModal(false)}>
              Cancel
            </button>
            <button className="primary-btn" onClick={handleSave}>
              Save
            </button>
          </>
        }
      >
        <div className="form-group">
          <label>Stage</label>
          <select
            name="stage"
            value={form.stage}
            onChange={handleChange}
            className="form-control"
          >
            <option value="">Select Stage</option>
            {stages.map((s, i) => (
              <option key={i} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Days</label>
          <input
            type="text"
            name="days"
            value={form.days}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label>User</label>
          <select
            name="userID"
            value={form.userID}
            onChange={handleChange}
            className="form-control"
          >
            <option value="">Select User</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.userName}
              </option>
            ))}
          </select>
        </div>
      </SmallModal>
    </div>
  );
};

export default ProcessStage;