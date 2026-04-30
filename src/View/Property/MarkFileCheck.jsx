import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BookingWrapper from "./style";
import axiosInstance from "../../utilities/axiosInstance";
import API_ENDPOINTS from "../../utilities/apiConfig";
import Swal from "sweetalert2";
import { FaClipboardCheck, FaArrowLeft,FaTimes  } from "react-icons/fa";
import "./MarkFileCheck.css";
import { FiX } from "react-icons/fi";


export default function MarkFileCheck() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fileCheckList, setFileCheckList] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionType, setActionType] = useState("");

  const [form, setForm] = useState({
    date: "",
    notes: ""
  });

  // ✅ FETCH BOOKING LIST & FILTER statusId = 15
  const fetchFileCheckList = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get(
        API_ENDPOINTS.BOOKING_LIST
      );

      const raw =
        res.data?.value || res.data?.data || res.data || [];

      // 🔥 MAIN LOGIC
      const filtered = (raw || []).filter(
        (b) => b.statusId === 15
      );

      setFileCheckList(filtered);

    } catch (err) {
      Swal.fire("Error", "Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFileCheckList();
  }, []);

  // ✅ OPEN MODAL
  const openModal = (item, type) => {
    setSelectedItem(item);
    setActionType(type);
    setForm({ date: "", notes: "" });
    setShowModal(true);
  };

  // ✅ HANDLE INPUT
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // ✅ SUBMIT (APPROVE / REJECT)
  const handleSubmit = async () => {
    if (!form.date) {
      return Swal.fire("Warning", "Please select date", "warning");
    }

    try {
      Swal.fire({
        title: "Processing...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      const payload = {
        bookingId: selectedItem.id, // 🔥 IMPORTANT
        completionDate: form.date,
        notes: form.notes,
        action: actionType // "approve" / "reject"
      };

      const res = await axiosInstance.post(
        API_ENDPOINTS.UPDATE_MARK_FILE_CHECK_STATUS,
        payload
      );

      if (res.status !== 200) {
        throw new Error("Failed");
      }

      Swal.close();

      Swal.fire({
        icon: "success",
        title:
          actionType === "approve"
            ? "Approved Successfully"
            : "Rejected Successfully",
        timer: 1500,
        showConfirmButton: false
      });

      setShowModal(false);

      // 🔥 REFRESH LIST
      fetchFileCheckList();

    } catch (error) {
      Swal.close();

      console.error("ERROR:", error);

      Swal.fire(
        "Error",
        error?.response?.data?.message ||
          error.message ||
          "Something went wrong",
        "error"
      );
    }
  };

  // 🔥 DATE FORMAT
  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString();
  };

  return (
    <BookingWrapper>
      <div className="dashboard-container">

        {/* HEADER */}
        <div className="dashboard-header">
          <div className="dashboard-header-content">
            <div className="dashboard-header-icon">
              <FaClipboardCheck />
            </div>
            <div>
              <h2 className="dashboard-title">
                File Check Requests
              </h2>
              <p className="dashboard-subtitle">
                Approve / Reject file checks
              </p>
            </div>
          </div>

          <button
            className="primary-btn"
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft /> Back
          </button>
        </div>

        {/* TABLE */}
        <div className="card">
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Township / Plot</th>
                  <th>Client</th>
                  <th>Booking Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="no-data">
                      Loading...
                    </td>
                  </tr>
                ) : fileCheckList.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="no-data">
                      No File Check Pending
                    </td>
                  </tr>
                ) : (
                  fileCheckList.map((b) => (
                    <tr key={b.id}>
                      <td>
                        <span
                          style={{
                            cursor: "pointer",
                            color: "#2563eb",
                            textDecoration: "underline"
                          }}
                          onClick={() =>
                            navigate(
                              `/booking-summery-report/${b.id}`
                            )
                          }
                        >
                          {b.id}
                        </span>
                      </td>

                      <td>
                        {b.townshipName || "N/A"} <br />
                        <small>
                          Plot {b.plotNo || "-"} •{" "}
                          {b.plotSize || "-"} sq.ft.
                        </small>
                      </td>

                      <td>
                        {b.clientName} <br />
                        <small>{b.contactNo}</small>
                      </td>

                      <td>{formatDate(b.bookingDate)}</td>

                      <td>{b.status || "Pending"}</td>

                      <td>
                        <div className="d-flex gap-2">
                          <button
                            className="primary-btn"
                            onClick={() =>
                              openModal(b, "approve")
                            }
                          >
                            Approve
                          </button>

                          <button
                            className="primary-btn"
                            onClick={() =>
                              openModal(b, "reject")
                            }
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">

              <div className="modal-header">
                <h4>
                  {actionType === "approve"
                    ? "Approve File"
                    : "Reject File"}
                </h4>
                <button
                  onClick={() => setShowModal(false)}
                  className="modal-close-btn"
                >
                  
                  <FiX />
                </button>
              </div>

              <div className="">
                <div className="form-group">
                  <label htmlFor="date" className="">
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="notes" className="">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    className="form-control mt-2"
                    placeholder="Enter notes"
                  />
                </div>
              </div>

              <div className="modal-actions gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="primary-btn"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSubmit}
                  className="primary-btn"
                >
                  {actionType === "approve"
                    ? "Approve"
                    : "Reject"}
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </BookingWrapper>
  );
}