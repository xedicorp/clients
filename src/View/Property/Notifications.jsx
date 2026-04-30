import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ReminderPopup from "../../components/ReminderPopup";
import "./Notifications.css";
import {
  FiBell as Bell,
  FiClock as Clock,
  FiAlertCircle as AlertCircle,
  FiEye
} from "react-icons/fi";
import axiosInstance from "../../utilities/axiosInstance";
import API_ENDPOINTS from "../../utilities/apiConfig";
import Swal from "sweetalert2";

export default function Notifications({ isPopup = false, onClose }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingIdFromUrl = searchParams.get("bookingId");
  
  const [reminders, setReminders] = useState([]);
  const [loadingReminders, setLoadingReminders] = useState(false);
  const [remindersError, setRemindersError] = useState("");

  // Reminder popup state
  const [showReminderPopup, setShowReminderPopup] = useState(false);
  const [openDirectlyToCreate, setOpenDirectlyToCreate] = useState(false);

  const IST_OFFSET_MINUTES = 330;
  const IST_OFFSET_MS = IST_OFFSET_MINUTES * 60 * 1000;

  const getUserId = () => {
    const stored = localStorage.getItem("userId") || localStorage.getItem("spendwise_userId");
    const parsed = stored ? Number(stored) : NaN;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  };

  const parseReminderDateTime = (reminderDate, reminderTime) => {
    if (!reminderDate || !reminderTime) return null;

    const dateStr = String(reminderDate).trim();
    const timeStr = String(reminderTime).trim();

    let year, month, day;

    const ymdMatch = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (ymdMatch) {
      year = Number(ymdMatch[1]);
      month = Number(ymdMatch[2]);
      day = Number(ymdMatch[3]);
    } else {
      const dmyMatch = dateStr.match(/(\d{2})-(\d{2})-(\d{4})/);
      if (dmyMatch) {
        day = Number(dmyMatch[1]);
        month = Number(dmyMatch[2]);
        year = Number(dmyMatch[3]);
      } else {
        return null;
      }
    }

    const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})(?::(\d{2})(?:\.(\d+))?)?/);
    if (!timeMatch) return null;

    const hour = Number(timeMatch[1]);
    const minute = Number(timeMatch[2]);
    const second = timeMatch[3] ? Number(timeMatch[3]) : 0;
    const msRaw = timeMatch[4] ? String(timeMatch[4]) : "";
    const ms = msRaw ? Number(msRaw.slice(0, 3).padEnd(3, "0")) : 0;

    const parts = [year, month, day, hour, minute, second, ms];
    if (parts.some((n) => !Number.isFinite(n))) return null;

    const epochMs = Date.UTC(year, month - 1, day, hour, minute, second, ms) - IST_OFFSET_MS;
    const date = new Date(epochMs);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const fetchReminders = async () => {
    setLoadingReminders(true);
    setRemindersError("");

    try {
      const userId = getUserId();
      const url = `${API_ENDPOINTS.REMINDER_LIST}?userId=${encodeURIComponent(userId)}&isPending=true`;
      
      const response = await axiosInstance.get(url);
      
      const data = Array.isArray(response.data) ? response.data : [];

      // Fetch booking details for reminders with bookingId
      const bookingIds = [...new Set(data.filter(item => item.bookingId).map(item => item.bookingId))];
      let bookingsMap = {};
      
      if (bookingIds.length > 0) {
        try {
          const bookingsResponse = await axiosInstance.get(API_ENDPOINTS.BOOKING_LIST);
          const bookingsList = Array.isArray(bookingsResponse.data) ? bookingsResponse.data : (bookingsResponse.data?.value || []);
          
          bookingsList.forEach(booking => {
            if (bookingIds.includes(booking.id)) {
              bookingsMap[booking.id] = {
                clientName: booking.clientName,
                clientMobile: booking.contactNo,
                township: booking.townshipName,
                plotNo: booking.plotNo || booking.PlotNo,
                plotSize: booking.plotSize,
                status: booking.status
              };
            }
          });
        } catch (err) {
          // Silent fail - bookings data is optional
        }
      }

      const mapped = data.map((item) => {
        const reminderDateTime = parseReminderDateTime(
          item.reminderDate,
          item.reminderTime
        );

        const notes = item.notes || "";
        const titleFromNotes = notes.split(" - ")[0] || notes;
        const remainingNotes = notes.includes(" - ") ? notes.split(" - ").slice(1).join(" - ") : "";

        return {
          id: item.id,
          title: item.title || titleFromNotes || `Notification #${item.id}`,
          reminderDateTime,
          reminderDate: item.reminderDate,
          reminderTime: item.reminderTime,
          isCompleted: item.isCompleted,
          createdOn: item.createdOn,
          createdBy: item.createdBy,
          notes: remainingNotes || notes || "",
          bookingId: item.bookingId,
          bookingDetails: item.bookingId ? bookingsMap[item.bookingId] : null
        };
      });

      mapped.sort((a, b) => {
        if (!a.reminderDateTime) return 1;
        if (!b.reminderDateTime) return -1;
        return b.reminderDateTime - a.reminderDateTime;
      });

      // Filter by bookingId if provided in URL
      const filteredReminders = bookingIdFromUrl 
        ? mapped.filter(r => String(r.bookingId) === String(bookingIdFromUrl))
        : mapped;

      setReminders(filteredReminders);
    } catch (error) {
      setRemindersError("Unable to load notifications. Please try again.");
      setReminders([]);
    } finally {
      setLoadingReminders(false);
    }
  };

  const handleDismiss = async (reminderId) => {
    try {
      const response = await axiosInstance.post(`${API_ENDPOINTS.REMINDER_DISMISS}?reminderId=${reminderId}`, null, {
        headers: {
          'Accept': 'text/plain',
          'Content-Type': 'application/json'
        }
      });

      if (response.data === true || response.data === "true") {
        setReminders(prev => prev.filter(reminder => reminder.id !== reminderId));

        Swal.fire({
          icon: "success",
          title: "Deleted",
          text: "Reminder deleted successfully",
          timer: 1500,
          showConfirmButton: false
        });
        
        setTimeout(() => {
          fetchReminders();
        }, 2000);
      } else {
        throw new Error(`Unexpected response from dismiss API: ${response.data}`);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text: `Failed to delete reminder: ${error.response?.data || error.message}`,
      });
    }
  };

  const formatDate = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return "";
    }

    return new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  };


  useEffect(() => {
    // Main data fetching
    fetchReminders();

    // Handle focus event for refresh
    const handleFocus = () => {
      fetchReminders();
    };
    
    // Keyboard shortcut for creating reminder (Ctrl+N or Cmd+N)
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        navigate("/property/reminder-save");
      }
    };
    
    window.addEventListener('focus', handleFocus);
    window.addEventListener('keydown', handleKeyDown);
    
    // Cleanup function
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate]);

  const handleBackClick = () => {
    if (typeof onClose === "function") {
      onClose();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="notifications-container">
      {/* Header */}
      <div className="notifications-header">
        <div className="header-left">
          <h1>Notifications</h1>
          <div className="subtitle">
            {bookingIdFromUrl ? (
              <>
                Follow-up reminders for <strong>Booking ID: {bookingIdFromUrl}</strong>
                <button 
                  className="btn-clear-filter"
                  onClick={() => navigate("/property/notifications")}
                  style={{
                    marginLeft: '10px',
                    padding: '4px 8px',
                    fontSize: '12px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Show All
                </button>
              </>
            ) : (
              "Stay updated with your latest reminders and alerts"
            )}
          </div>
        </div>
        <div className="header-actions">
          <button className="dashboard-btn reminder-btn-custom" onClick={() => {
            setOpenDirectlyToCreate(true);
            setShowReminderPopup(true);
          }} title="Create new reminder (Ctrl+N)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span>Reminder</span>
          </button>
          <button className="dashboard-btn" onClick={() => navigate('/admin-dashboard')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span>Dashboard</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="notifications-content">
        {loadingReminders ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading notifications...</p>
          </div>
        ) : remindersError ? (
          <div className="error-state">
            <AlertCircle size={48} color="#ef4444" />
            <p>{remindersError}</p>
            <button className="primary-btn" onClick={fetchReminders}>
              Retry
            </button>
          </div>
        ) : reminders.length > 0 ? (
          <div className="notifications-sections">
            {/* Group reminders by booking ID */}
            {(() => {
              // Separate reminders with and without booking IDs
              const withBooking = reminders.filter(r => r.bookingId);
              const withoutBooking = reminders.filter(r => !r.bookingId);
              
              // Group by booking ID
              const groupedByBooking = withBooking.reduce((acc, reminder) => {
                const bookingId = reminder.bookingId;
                if (!acc[bookingId]) {
                  acc[bookingId] = [];
                }
                acc[bookingId].push(reminder);
                return acc;
              }, {});

              return (
                <>
                  {/* Booking-based sections */}
                  {Object.entries(groupedByBooking).map(([bookingId, bookingReminders]) => (
                    <div key={`booking-${bookingId}`} className="notification-section">
                      <div className="section-header">
                        <div 
                          className="booking-id-badge"
                          onClick={() => navigate(`/property/booking-summary/${bookingId}`)}
                          title="Go to Booking"
                        >
                          <span className="booking-icon">🏠</span>
                          <span className="booking-id-text">Booking ID: {bookingId}</span>
                        </div>
                        {bookingReminders[0]?.bookingDetails && (
                          <div className="booking-quick-info">
                            {bookingReminders[0].bookingDetails.clientName && (
                              <span className="quick-info-item">
                                👤 {bookingReminders[0].bookingDetails.clientName}
                              </span>
                            )}
                            {bookingReminders[0].bookingDetails.township && bookingReminders[0].bookingDetails.plotNo && (
                              <span className="quick-info-item">
                                📍 {bookingReminders[0].bookingDetails.township} - {bookingReminders[0].bookingDetails.plotNo}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="notifications-list">
                        {bookingReminders.map((item) => (
                          <div
                            key={item.id}
                            className={`notification-card ${item.isCompleted ? "completed" : ""}`}
                          >
                            <div className="notification-icon">
                              <Bell size={24} />
                            </div>

                            <div className="notification-details">
                              <div className="notification-top">
                                <div>
                                  {item.bookingId && (
                                    <div 
                                      className="notification-booking-badge"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/property/booking-summary/${item.bookingId}`);
                                      }}
                                      title="Go to Booking"
                                    >
                                      🏠 Booking ID: {item.bookingId}
                                    </div>
                                  )}
                                  <h3 className="notification-title">{item.title}</h3>
                                </div>
                                <span className="notification-time">
                                  <Clock size={14} />{" "}
                                  {formatDate(item.reminderDateTime)}
                                </span>
                              </div>

                              {item.notes && item.notes !== item.title && (
                                <p className="notification-message">{item.notes}</p>
                              )}
                              
                              {item.bookingDetails && (
                                <div className="booking-details-inline">
                                  {item.bookingDetails.clientName && (
                                    <span className="booking-detail-item">
                                      <strong>Client:</strong> {item.bookingDetails.clientName}
                                    </span>
                                  )}
                                  {item.bookingDetails.township && item.bookingDetails.plotNo && (
                                    <span className="booking-detail-item">
                                      <strong>Plot:</strong> {item.bookingDetails.township} - {item.bookingDetails.plotNo}
                                    </span>
                                  )}
                                  {item.bookingDetails.clientMobile && (
                                    <span className="booking-detail-item">
                                      <strong>Mobile:</strong> {item.bookingDetails.clientMobile}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="notification-actions">
                              <button
                                className="btn-action btn-view"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate("/property/reminder-save", { state: { reminder: item, mode: 'view' } });
                                }}
                                title="View"
                              >
                                <FiEye size={14} /> View
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* General notifications section (without booking ID) */}
                  {withoutBooking.length > 0 && (
                    <div className="notification-section">
                      <div className="section-header">
                        <div className="general-section-title">
                          <Bell size={20} />
                          <span>General Notifications</span>
                        </div>
                      </div>
                      
                      <div className="notifications-list">
                        {withoutBooking.map((item) => (
                          <div
                            key={item.id}
                            className={`notification-card ${item.isCompleted ? "completed" : ""}`}
                          >
                            <div className="notification-icon">
                              <Bell size={24} />
                            </div>

                            <div className="notification-details">
                              <div className="notification-top">
                                <div className="notification-title-wrapper">
                                  <h3 className="notification-title">{item.title}</h3>
                                  {item.bookingId && (
                                    <span className="notification-booking-badge-inline">
                                      🏠 Booking ID {item.bookingId}
                                    </span>
                                  )}
                                </div>
                                <span className="notification-time">
                                  <Clock size={14} />{" "}
                                  {formatDate(item.reminderDateTime)}
                                </span>
                              </div>

                              {item.notes && item.notes !== item.title && (
                                <p className="notification-message">{item.notes}</p>
                              )}
                            </div>

                            <div className="notification-actions">
                              <button
                                className="btn-action btn-view"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate("/property/reminder-save", { state: { reminder: item, mode: 'view' } });
                                }}
                                title="View"
                              >
                                <FiEye size={14} /> View
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        ) : (
          <div className="empty-state">
            <Bell size={48} color="#cbd5e1" />
            <h3>No Notifications</h3>
            <p>You're all caught up! Check back later.</p>
          </div>
        )}
      </div>

      {/* Reminder Popup */}
      <ReminderPopup 
        isOpen={showReminderPopup}
        onClose={() => {
          setShowReminderPopup(false);
          setOpenDirectlyToCreate(false);
        }}
        title="Create Reminder"
        openDirectlyToCreate={openDirectlyToCreate}
        bookingId={bookingIdFromUrl}
      />
    </div>
  );
}
