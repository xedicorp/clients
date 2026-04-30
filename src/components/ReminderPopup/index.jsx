import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utilities/axiosInstance";
import API_ENDPOINTS from "../../utilities/apiConfig";
import Swal from "sweetalert2";
import "./ReminderPopup.css";

export default function ReminderPopup({
  isOpen,
  onClose,
  title = "Reminders",
  bookingId,
  openDirectlyToCreate = false
}) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [reminders, setReminders] = useState([]);
  const [loadingReminders, setLoadingReminders] = useState(false);

  // Form State
  const [reminderTitle, setReminderTitle] = useState("");

  const [reminderDate, setReminderDate] = useState(() => {
    // Default to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });

  const [reminderTime, setReminderTime] = useState("10:00");

  const [notes, setNotes] = useState("");

  const resetForm = () => {
    setReminderTitle("");
    setNotes("");
    setReminderDate(() => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split("T")[0];
    });
    setReminderTime("10:00");
  };

  const getUserId = () => {
    const stored =
      localStorage.getItem("userId") ||
      localStorage.getItem("spendwise_userId");
    const parsed = stored ? Number(stored) : NaN;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  };

  // Fetch reminders
  const fetchReminders = async () => {
    setLoadingReminders(true);
    try {
      const userId = getUserId();
      let response;
      if (!bookingId) {
        response = await axiosInstance.get(`${API_ENDPOINTS.REMINDER_LIST}?userId=${userId}`);
      } else {
        response = await axiosInstance.get(`${API_ENDPOINTS.REMINDER_LIST_BY_USER_ID}?bookingId=${bookingId}`);
      }
      const data = Array.isArray(response.data) ? response.data : [];
      setReminders(data);
    } catch (error) {
      console.error("Error fetching reminders:", error);
      setReminders([]);
    } finally {
      setLoadingReminders(false);
    }
  };

  // Fetch reminders when popup opens
  useEffect(() => {
    if (isOpen) {
      if (openDirectlyToCreate) {
        setShowCreateForm(true);
      } else {
        fetchReminders();
        setShowCreateForm(false);
      }
    } else {
      // Reset when popup closes
      setShowCreateForm(false);
    }
  }, [isOpen, openDirectlyToCreate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!reminderTitle.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Missing Title",
        text: "Please enter a title for the reminder",
      });
      return;
    }

    if (!reminderDate) {
      Swal.fire({
        icon: "warning",
        title: "Missing Date",
        text: "Please select a reminder date",
      });
      return;
    }

    if (!reminderTime) {
      Swal.fire({
        icon: "warning",
        title: "Missing Time",
        text: "Please select a reminder time",
      });
      return;
    }

    // Check if the reminder date/time is in the past
    const selectedDateTime = new Date(`${reminderDate}T${reminderTime}`);
    const now = new Date();

    if (selectedDateTime < now) {
      const result = await Swal.fire({
        icon: "warning",
        title: "Past Date/Time",
        text: "The selected date and time is in the past. Do you want to continue?",
        showCancelButton: true,
        confirmButtonText: "Yes, Continue",
        cancelButtonText: "Cancel"
      });

      if (!result.isConfirmed) {
        return;
      }
    }

    setLoading(true);

    try {
      const userId = getUserId();
      const now = new Date().toISOString();

      const payload = {
        id: 0,
        reminderDate: reminderDate,
        reminderTime: `${reminderTime}:00`,
        createdOn: now,
        createdBy: userId,
        notes: reminderTitle.trim() + (notes.trim() ? ` - ${notes.trim()}` : ""),
        bookingId: bookingId ? Number(bookingId) : undefined
      };

      console.log("Creating reminder with payload:", payload);

      const response = await axiosInstance.post(API_ENDPOINTS.REMINDER_SAVE, payload);

      console.log("Reminder save response:", response.data);

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Reminder created successfully",
        timer: 1500,
        showConfirmButton: false
      });

      resetForm();

      if (openDirectlyToCreate) {
        // If opened directly to create, close the popup after success
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        // Otherwise, go back to list
        setShowCreateForm(false);
        fetchReminders();
      }

    } catch (error) {
      console.error("Error saving reminder:", error);

      let errorMessage = "Failed to save reminder. Please try again.";

      if (error.response?.status === 400) {
        errorMessage = "Invalid data provided. Please check your inputs.";
      } else if (error.response?.status === 401) {
        errorMessage = "You are not authorized to perform this action.";
      } else if (error.response?.status === 500) {
        errorMessage = "Server error occurred. Please try again later.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoToBooking = () => {
    onClose();
    navigate("/property");
  };

  const handleDismiss = () => {
    resetForm();
  };

  const handleClose = () => {
    onClose();
  };

  const handleDeleteReminder = async (reminderId) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Delete Reminder",
      text: "Are you sure you want to delete this reminder?",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626"
    });

    if (!result.isConfirmed) return;

    try {
      await axiosInstance.delete(`${API_ENDPOINTS.REMINDER_DELETE}?id=${reminderId}`);

      Swal.fire({
        icon: "success",
        title: "Deleted",
        text: "Reminder deleted successfully",
        timer: 1500,
        showConfirmButton: false
      });

      fetchReminders(); // Refresh the list
    } catch (error) {
      console.error("Error deleting reminder:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to delete reminder. Please try again.",
      });
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "N/A";
    return timeStr.substring(0, 5); // HH:MM
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div className="modal-header">
          <h3>{showCreateForm ? "Create Reminder" : title}</h3>
          <button className="modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {!showCreateForm ? (
          // Reminder List View
          <div className="">

            {!loadingReminders && reminders.length > 0 && (
  <div className="reminder-list-header">
    <button
      className="primary-btn"
      onClick={() => setShowCreateForm(true)}
    >
      Create New Reminder
    </button>
  </div>
)}

            {loadingReminders ? (
              <div className="reminder-loading">Loading reminders...</div>
            ) : reminders.length === 0 ? (
              <div className="reminder-empty">
                <p>No reminders found</p>
                <button
                  className="primary-btn m-auto"
                  onClick={() => setShowCreateForm(true)}
                >
                  Create Your First Reminder
                </button>
              </div>
            ) : (
              <div className="reminder-list">
                {reminders.map((reminder) => (
                  <div key={reminder.id} className="reminder-item">
                    <div className="reminder-item-content">
                      <div className="reminder-item-header">
                        <h4>{reminder.notes || "No title"}</h4>
                        <button
                          className="primary-btn"
                          onClick={() => handleDeleteReminder(reminder.id)}
                          title="Delete"
                        >
                          Delete
                        </button>
                      </div>
                      <div className="reminder-item-details">
                        <span className="reminder-date">
                          {formatDate(reminder.reminderDate)}
                        </span>
                        <span className="reminder-time">
                          {formatTime(reminder.reminderTime)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="modal-footer gap-3">
              <button
                type="button"
                className="primary-btn"
                onClick={handleClose}
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          // Create Form View
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="reminderTitle">Title *</label>
              <input
                type="text"
                id="reminderTitle"
                value={reminderTitle}
                onChange={(e) => setReminderTitle(e.target.value)}
                placeholder="Enter reminder title"
                required
                className="form-control"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="reminderDate">Date *</label>
                <input
                  type="date"
                  id="reminderDate"
                  value={reminderDate}
                  onChange={(e) => setReminderDate(e.target.value)}
                  required
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label htmlFor="reminderTime">Time *</label>
                <input
                  type="time"
                  id="reminderTime"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  required
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reminderNotes">Notes</label>
              <textarea
                id="reminderNotes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter additional details..."
                rows="4"
                className="form-control"
              />
            </div>

            <div className="modal-footer gap-3">
              <button
                type="button"
                className="primary-btn"
                onClick={() => {
                  if (openDirectlyToCreate) {
                    // If opened directly to create, close the popup on cancel
                    onClose();
                  } else {
                    // Otherwise, go back to list
                    setShowCreateForm(false);
                    fetchReminders();
                  }
                }}
                disabled={loading}
              >
                {openDirectlyToCreate ? "Cancel" : "Back to List"}
              </button>
              <button
                type="submit"
                className="primary-btn"
                disabled={loading}
              >
                {loading ? "Creating..." : "Save"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
