import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BookingWrapper from "./style";
import ReminderButton from "../../components/ReminderButton";
import ReminderPopup from "../../components/ReminderPopup";
import axiosInstance from "../../utilities/axiosInstance";
import API_ENDPOINTS from "../../utilities/apiConfig";
import { formatDisplayDate, formatTimeDisplay } from "../../utilities/dateUtils";
import "./FollowUp.css";
import { FiX } from "react-icons/fi";

export default function FollowUp() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [followType, setFollowType] = useState("");
  const [followDatetime, setFollowDatetime] = useState("");
  const [followText, setFollowText] = useState("");
  const [followUps, setFollowUps] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [isViewing, setIsViewing] = useState(false);
  const [followupsLoading, setFollowupsLoading] = useState(false);
  const [followupsError, setFollowupsError] = useState(null);
  const [showReminderPopup, setShowReminderPopup] = useState(false);
  const datetimeRef = useRef(null);

  const followupTypes = [
    { id: 1, name: "Call" },
    { id: 2, name: "Message" },
    { id: 3, name: "Meeting" },
    { id: 4, name: "Email" }
  ];

  const getUserId = () => {
    const stored = localStorage.getItem("userId") || localStorage.getItem("spendwise_userId");
    const parsed = stored ? Number(stored) : NaN;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  };

  const parseDate = (value) => {
    if (!value) return null;

    if (value instanceof Date) {
      return isNaN(value.getTime()) ? null : value;
    }

    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) return null;

      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        const [y, m, d] = trimmed.split("-").map(Number);
        return new Date(y, m - 1, d);
      }

      const d = new Date(trimmed);
      return isNaN(d.getTime()) ? null : d;
    }

    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  };

  const toDatetimeLocalValue = (date) => {
    const d = parseDate(date);
    if (!d) return "";

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  };

  const openNewModal = () => {
    setFollowupsError(null);
    setEditingIndex(null);
    setIsViewing(false);
    setFollowType("");

    const now = new Date();
    const defaultDateTime = toDatetimeLocalValue(now);
    setFollowDatetime(defaultDateTime);

    setFollowText("");
    setShowModal(true);
  };

  // Consolidated data fetching
  const fetchFollowups = useCallback(async () => {
    if (!id) return;
    setFollowupsLoading(true);
    setFollowupsError(null);
    try {
      const res = await axiosInstance.get(`${API_ENDPOINTS.GET_FOLLOWUP_BY_BOOKING_ID}?bookingId=${id}`);
      const data = Array.isArray(res.data) ? res.data : [];

      const mapped = data.map((item, index) => {
        const apiTypeName = item.followupTypeName || "Call";
        const typeKey = apiTypeName.toLowerCase().replace(/\s+/g, '');

        return {
          id: item.id ?? index,
          type: typeKey,
          typeName: apiTypeName,
          datetime: item.followupDate || "",
          text: item.notes || "",
          createdBy: item.createdBy || ""
        };
      });

      setFollowUps(mapped);
    } catch (e) {
      setFollowupsError("Failed to load follow-ups");
      setFollowUps([]);
    } finally {
      setFollowupsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const fetchAllData = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);
      setFollowupsLoading(true);
      setFollowupsError(null);

      try {
        // Fetch booking details
        const bookingRes = await axiosInstance.get(`${API_ENDPOINTS.GET_BOOKING_BY_ID}?bookingId=${id}`);
        if (bookingRes && bookingRes.data) {
          setBooking(bookingRes.data);
        } else {
          setError("Booking not found");
        }

        // Fetch followups
        const followupRes = await axiosInstance.get(`${API_ENDPOINTS.GET_FOLLOWUP_BY_BOOKING_ID}?bookingId=${id}`);
        const data = Array.isArray(followupRes.data) ? followupRes.data : [];

        const mapped = data.map((item, index) => {
          const apiTypeName = item.followupTypeName || "Call";
          const typeKey = apiTypeName.toLowerCase().replace(/\s+/g, '');

          return {
            id: item.id ?? index,
            type: typeKey,
            typeName: apiTypeName,
            datetime: item.followupDate || "",
            text: item.notes || "",
            createdBy: item.createdBy || ""
          };
        });

        setFollowUps(mapped);
      } catch (e) {
        setError("Failed to load data");
        setFollowupsError("Failed to load follow-ups");
        setFollowUps([]);
      } finally {
        setLoading(false);
        setFollowupsLoading(false);
      }
    };

    fetchAllData();
  }, [id]);

  const openPicker = () => {
    const el = datetimeRef.current;
    if (!el) return;

    if (typeof el.showPicker === "function") {
      try {
        el.showPicker();
        return;
      } catch (e) { }
    }

    try {
      el.click();
      el.focus();
    } catch (e) {
      try {
        el.focus();
      } catch (e2) { }
    }
  };

  const handleSaveFollowUp = async () => {
    if (!id) return;

    if (!followType) {
      setFollowupsError("Please select a follow-up type.");
      return;
    }

    if (!followDatetime) {
      setFollowupsError("Please select a date and time.");
      return;
    }

    if (!followText.trim()) {
      setFollowupsError("Please enter follow-up notes.");
      return;
    }

    try {
      setFollowupsError(null);

      const selectedTypeId = parseInt(followType, 10);
      const selectedTypeObj = followupTypes.find(t => t.id === selectedTypeId);
      const typeName = selectedTypeObj ? selectedTypeObj.name : "Call";

      const existing = editingIndex !== null && editingIndex >= 0 && editingIndex < followUps.length
        ? followUps[editingIndex]
        : null;

      const selectedDate = new Date(`${followDatetime}:00+05:30`);

      if (isNaN(selectedDate.getTime())) {
        setFollowupsError("Please select a valid date and time.");
        return;
      }

      const localDate = new Date(followDatetime);

      const payload = {
        id: existing?.id ?? 0,
        bookingId: Number(id),
        followupDate: `${followDatetime}:00`,
        notes: followText.trim(),
        createdBy: getUserId(),
        followupTypeId: selectedTypeId
      };

      const response = await axiosInstance.post(API_ENDPOINTS.FOLLOWUP_SAVE, payload);

      // Create a reminder notification
      try {
        const [reminderDate, reminderTime] = followDatetime.split("T");

        const reminderPayload = {
          id: 0,
          reminderDate: reminderDate,
          reminderTime: `${reminderTime}:00`,
          createdOn: new Date().toISOString(),
          createdBy: getUserId(),
          notes: `Follow-up scheduled for ${booking?.clientName || 'client'} - ${typeName}: ${followText.trim()}`
        };

        await axiosInstance.post(API_ENDPOINTS.REMINDER_SAVE, reminderPayload);
      } catch (reminderError) {
        // Silently ignore reminder creation failures
      }

      // Refresh data
      try {
        const followupRes = await axiosInstance.get(`${API_ENDPOINTS.GET_FOLLOWUP_BY_BOOKING_ID}?bookingId=${id}`);
        const data = Array.isArray(followupRes.data) ? followupRes.data : [];

        const mapped = data.map((item, index) => {
          const apiTypeName = item.followupTypeName || "Call";
          const typeKey = apiTypeName.toLowerCase().replace(/\s+/g, '');

          return {
            id: item.id ?? index,
            type: typeKey,
            typeName: apiTypeName,
            datetime: item.followupDate || "",
            text: item.notes || "",
            createdBy: item.createdBy || ""
          };
        });

        setFollowUps(mapped);
      } catch (refreshError) {
        // Silently handle refresh error
      }

      setFollowType("");
      setFollowDatetime("");
      setFollowText("");
      setEditingIndex(null);
      setShowModal(false);
    } catch (e) {
      const errorMessage = e.response?.data?.message || e.message || "Failed to save follow-up. Please try again.";
      setFollowupsError(errorMessage);
    }
  };

  const handleEditFollowUp = (index) => {
    const fu = followUps[index];
    if (!fu) return;

    setFollowupsError(null);
    const typeObj = followupTypes.find(t => t.name.toLowerCase() === fu.type.toLowerCase());
    setFollowType(typeObj ? typeObj.id.toString() : "1");

    // Automatically set to current date/time when editing
    const now = new Date();
    const datetimeValue = toDatetimeLocalValue(now);

    setFollowDatetime(datetimeValue);
    setFollowText(fu.text || "");
    setEditingIndex(index);
    setIsViewing(false);
    setShowModal(true);
  };

  const handleViewFollowUp = (index) => {
    const fu = followUps[index];
    if (!fu) return;

    setFollowupsError(null);
    const typeObj = followupTypes.find(t => t.name.toLowerCase() === fu.type.toLowerCase());
    setFollowType(typeObj ? typeObj.id.toString() : "1");
    const datetimeValue = toDatetimeLocalValue(fu.datetime || "");
    setFollowDatetime(datetimeValue);
    setFollowText(fu.text || "");
    setEditingIndex(index);
    setIsViewing(true);
    setShowModal(true);
  };

  const handleDeleteFollowUp = async (index) => {
    if (!window.confirm("Are you sure you want to delete this follow-up?")) return;

    const fu = followUps[index];

    try {
      if (fu.id) {
        await axiosInstance.delete(`${API_ENDPOINTS.FOLLOWUP_DELETE}?id=${fu.id}`);
      }

      setFollowUps(prev => prev.filter((_, i) => i !== index));
      alert("Follow-up deleted successfully!");

    } catch (error) {
      alert("Failed to delete follow-up. Please try again.");
    }
  };

  return (
    <BookingWrapper className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <div>
            <h2 className="dashboard-title">Follow Up</h2>
            <p className="dashboard-subtitle">Notes and actions for booking</p>
          </div>
        </div>
        <div className="dashboard-header-actions">
          
          <button className="primary-btn" onClick={() => navigate(-1)}>
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
          <ReminderButton
            size="small"
            onClick={() => setShowReminderPopup(true)}
          />
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="card-padding">Loading booking details...</div>
        ) : error ? (
          <div className="card-padding card-error">{error}</div>
        ) : (
          <div>
  <div className="booking-info-matrix">

    <div className="booking-info-row">
      <label>Client</label>
      <div className="booking-info-value">
        {booking?.clientName || 'N/A'}
      </div>
    </div>

    <div className="booking-info-row">
      <label>Mobile</label>
      <div className="booking-info-value">
        {(() => {
          const raw = booking?.contactNo || booking?.clientMobile || "";
          const digits = String(raw).replace(/\D/g, "");
          if (!digits) return "N/A";
          if (digits.length === 10)
            return `${digits.slice(0, 5)} ${digits.slice(5)}`;
          return raw || "N/A";
        })()}
      </div>
    </div>

    <div className="booking-info-row">
      <label>Booking Date</label>
      <div className="booking-info-value">
        {booking?.bookingDate
          ? formatDisplayDate(booking.bookingDate)
          : booking?.createdAt
            ? formatDisplayDate(booking.createdAt)
            : 'N/A'}
      </div>
    </div>

    <div className="booking-info-row">
      <label>Township</label>
      <div className="booking-info-value">
        {booking?.townshipName || booking?.township || 'N/A'}
      </div>
    </div>

    <div className="booking-info-row">
      <label>Plot</label>
      <div className="booking-info-value">
        {booking?.plotNo || booking?.plotNumber || 'N/A'}
      </div>
    </div>

    <div className="booking-info-row">
      <label>Size</label>
      <div className="booking-info-value">
        {booking?.plotSize || 'N/A'}
      </div>
    </div>

  </div>
</div>

        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{isViewing ? "View Follow-up" : (editingIndex !== null ? "Edit Follow-up" : "Add Follow-up")}</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => { setShowModal(false); setEditingIndex(null); }}
                aria-label="Close"
              >
                <FiX size={20} />
              </button>
            </div>

            {isViewing ? (
              /* View Mode - Display as read-only information */
              <div className="view-mode-content">
                <div className="modal-grid">
                  <div className="view-field">
                    <label>Type</label>
                    <div className="view-value">
                      {followupTypes.find(t => t.id.toString() === followType)?.name || 'N/A'}
                    </div>
                  </div>

                  <div className="view-field">
                    <label>Date & Time</label>
                    <div className="view-value">
                      {followDatetime ? (
                        <>
                          {formatDisplayDate(followDatetime)} at {formatTimeDisplay(followDatetime)}
                        </>
                      ) : 'Not scheduled'}
                    </div>
                  </div>
                </div>

                <div className="view-field">
                  <label>Follow-up Notes</label>
                  <div className="view-value view-notes">
                    {followText || 'No notes provided'}
                  </div>
                </div>

                {editingIndex !== null && followUps[editingIndex]?.createdBy && (
                  <div className="view-field">
                    <label>Created By</label>
                    <div className="view-value">
                      User ID: {followUps[editingIndex].createdBy}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Edit/Add Mode - Display as form */
              <>
                <div className="modal-grid">
                  <div>
                    <label htmlFor="followup-type">Type</label>
                    <select
                      id="followup-type"
                      value={followType}
                      onChange={(e) => setFollowType(e.target.value)}
                      required
                      className="form-control"
                    >
                      <option value="" disabled>Select Type</option>
                      {followupTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="followup-datetime">Date & Time</label>
                    <div className="datetime-wrapper">
                      <input
                        id="followup-datetime"
                        ref={datetimeRef}
                        className="form-control"
                        type="datetime-local"
                        value={followDatetime}
                        onChange={(e) => setFollowDatetime(e.target.value)}
                        min={editingIndex !== null ? undefined : new Date().toISOString().slice(0, 16)}
                        required
                      />

                      {/* <button
                        className="picker-btn"
                        type="button"
                        onClick={openPicker}
                        aria-label="Open date and time picker"
                        tabIndex="-1"
                      >
                        📅
                      </button> */}
                    </div>
                  </div>
                </div>

                {followupsError && (
                  <div className="modal-error">
                    {followupsError}
                  </div>
                )}

                <div>
                  <label htmlFor="followup-notes">Follow-up Notes</label>
                  <textarea
                    id="followup-notes"
                    className="form-control"
                    value={followText}
                    onChange={(e) => setFollowText(e.target.value)}
                    placeholder="Enter detailed notes about this follow-up..."
                    required
                  />
                </div>
              </>
            )}

            <div className="modal-actions">
              <button className="primary-btn" onClick={() => { setShowModal(false); setEditingIndex(null); }}>
                {isViewing ? "Close" : "Cancel"}
              </button>
              {!isViewing && (
                <button className="primary-btn" onClick={handleSaveFollowUp}>Save</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Follow-ups list card */}
      <div className="card">
        <div className="dashboard-table-header">
          <h3 className="dashboard-table-title">Follow-ups</h3>
          <button onClick={openNewModal} className="primary-btn" type="button">
            Add Follow-up
          </button>
        </div>

        {followupsLoading ? (
          <div className="empty-state">
            <p>Loading follow-ups...</p>
          </div>
        ) : followupsError ? (
          <div className="empty-state">
            <p className="card-error">{followupsError}</p>
          </div>
        ) : followUps.length === 0 ? (
          <div className="empty-state">
            <p>No follow-ups scheduled</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th className="type-col">Type</th>
                  <th className="datetime-col">Date & Time</th>
                  <th className="text-col">Details</th>
                  <th className="status-col">Status</th>
                  <th className="actions-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {followUps.map((fu, i) => {
                  const dt = parseDate(fu.datetime);
                  const now = new Date();
                  const statusKey = !dt
                    ? "pending"
                    : dt.getTime() > now.getTime()
                      ? "upcoming"
                      : "past";

                  const statusLabel = statusKey === "pending" ? "Pending" : (statusKey === "upcoming" ? "Upcoming" : "Completed");
                  return (
                    <tr key={i} className="followup-row">
                      <td className="followups-td type-cell">
                        <div className="type-badge">
                          <span className="type-label">
                            {fu.typeName || fu.type}
                          </span>
                        </div>
                      </td>
                      <td className="followups-td datetime-cell">
                        {fu.datetime ? (
                          <>
                            <div className="datetime-primary">{formatDisplayDate(fu.datetime)}</div>
                            <div className="datetime-secondary">{formatTimeDisplay(fu.datetime)}</div>
                          </>
                        ) : (
                          <span className="no-datetime">Not scheduled</span>
                        )}
                      </td>
                      <td className="followups-td text-cell"><div className="text-truncate" title={fu.text}>{fu.text || 'No details provided'}</div></td>
                      <td className="followups-td status-cell"><div className={`status-badge ${statusKey}`}>{statusLabel}</div></td>
                      <td className="followups-td actions-cell">
                        <div className="action-buttons">
                          <button className="primary-btn" onClick={() => handleViewFollowUp(i)} title="View">
                            View
                          </button>
                          <button className="primary-btn" onClick={() => handleEditFollowUp(i)} title="Edit">
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reminder Popup */}
      <ReminderPopup
        isOpen={showReminderPopup}
        onClose={() => setShowReminderPopup(false)}
        title="Reminders"
        bookingId={id}
      />
    </BookingWrapper>
  );
}
