import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./ReminderSave.css";
import { FiSave, FiX } from "react-icons/fi";
import axiosInstance from "../../utilities/axiosInstance";
import API_ENDPOINTS from "../../utilities/apiConfig";
import Swal from "sweetalert2";

export default function ReminderSave() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  
  const { reminder, mode } = location.state || {};
  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';

  // Form State
  const [title, setTitle] = useState(() => {
    if (reminder?.title) return reminder.title;
    if (reminder?.notes) {
      // Extract title from notes if it contains " - "
      return reminder.notes.split(" - ")[0] || reminder.notes;
    }
    return "";
  });
  
  // Helper to safely format date for input
  const getInitialDate = (dateStr) => {
    if (!dateStr) {
      // Default to today's date
      const today = new Date();
      return today.toISOString().split('T')[0];
    }
    // If it's a full ISO string, take the date part
    if (dateStr.includes("T")) return dateStr.split("T")[0];
    return dateStr;
  };

  const [reminderDate, setReminderDate] = useState(getInitialDate(reminder?.reminderDate));
  const [reminderTime, setReminderTime] = useState(() => {
    if (reminder?.reminderTime) {
      // Handle both HH:MM and HH:MM:SS formats
      const timeParts = reminder.reminderTime.split(':');
      return `${timeParts[0]}:${timeParts[1]}`;
    }
    return "09:00";
  });
  const [notes, setNotes] = useState(() => {
    if (reminder?.notes && reminder.notes.includes(" - ")) {
      // Extract notes part after title
      return reminder.notes.split(" - ").slice(1).join(" - ");
    }
    return reminder?.notes || "";
  });

  const getUserId = () => {
    const stored =
      localStorage.getItem("userId")  ;
    const parsed = stored ? Number(stored) : NaN;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!title.trim()) {
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
    
    if (selectedDateTime < now && !reminder?.id) {
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
  id: reminder?.id || 0,
  reminderDate: reminderDate,        // "2026-01-04"
  reminderTime: `${reminderTime}:00`, // "12:10:00"
  createdOn: reminder?.createdOn || now,
  createdBy: reminder?.createdBy || userId,
  notes: title.trim() + (notes.trim() ? ` - ${notes.trim()}` : "")
};

    

      const response = await axiosInstance.post(API_ENDPOINTS.REMINDER_SAVE, payload);
      
      Swal.fire({
        icon: "success",
        title: "Success",
        text: reminder?.id ? "Reminder updated successfully" : "Reminder created successfully",
        timer: 1500,
        showConfirmButton: false
      });

      navigate("/property/notifications");

    } catch (error) {
     
      
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

  return (
    <div className="reminder-save-container">
      <div className="reminder-save-header">
        <h1>{isViewMode ? "View Reminder" : (reminder?.id ? "Edit Reminder" : "Create Reminder")}</h1>
        <button className="btn-cancel" onClick={() => navigate(-1)}>
          <FiX size={18} /> Close
        </button>
      </div>

      <div className="reminder-save-content">
        <form className="reminder-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter reminder title"
              required
              disabled={isViewMode}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Date *</label>
              <input
                type="date"
                id="date"
                value={reminderDate}
                onChange={(e) => setReminderDate(e.target.value)}
                required
                disabled={isViewMode}
              />
            </div>

            <div className="form-group">
              <label htmlFor="time">Time *</label>
              <input
                type="time"
                id="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                required
                disabled={isViewMode}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter additional details..."
              disabled={isViewMode}
            />
          </div>

          {!isViewMode && (
            <div className="form-actions">
              <button 
                type="button" 
                className="btn-cancel"
                onClick={() => navigate(-1)}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-save"
                disabled={loading}
              >
                {loading ? (
                  <>Saving...</>
                ) : (
                  <>
                    <FiSave size={18} /> Save Reminder
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
