import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BookingWrapper from "./style";
import PropertyNavigation from "./PropertyNavigation";
import ReminderButton from "../../components/ReminderButton";
import ReminderPopup from "../../components/ReminderPopup";
import axiosInstance from "../../utilities/axiosInstance";
import API_ENDPOINTS from "../../utilities/apiConfig";
import Swal from "sweetalert2";
import "./DokitSigning.css";

// Utility function to safely parse dates
const safeParseDate = (dateString) => {
  if (!dateString) return null;

  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return null;
  }

  return date;
};

// Format date for input field (YYYY-MM-DD)
const formatInputDate = (dateString) => {
  if (!dateString) return "";

  try {
    if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }

    const date = safeParseDate(dateString);
    if (!date) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  } catch (error) {
    return "";
  }
};

export default function DokitSigning() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [signed, setSigned] = useState(false);
  const [signedOn, setSignedOn] = useState("");
  const [jdaFileSigned, setJdaFileSigned] = useState(false);
  const [jdaFileSignedOn, setJdaFileSignedOn] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingBooking, setCheckingBooking] = useState(true);
  const [booking, setBooking] = useState(null);
  const [showReminderPopup, setShowReminderPopup] = useState(false);


  useEffect(() => {
    const fetchAllData = async () => {
      if (!id || isNaN(Number(id))) {
        const today = new Date();
        setBooking({
          id: Number(id) || 0,
          township: 'N/A',
          plotNumber: 'N/A',
          plotSize: 'N/A',
          clientName: 'N/A',
          clientMobile: 'N/A',
          bookingDate: today.toISOString(),
          bookingDateDisplay: formatInputDate(today.toISOString())
        });
        setCheckingBooking(false);
        return;
      }

      try {
        // First try to get booking details directly
        try {
          const detailRes = await axiosInstance.get(
            `${API_ENDPOINTS.GET_BOOKING_BY_ID}?bookingId=${id}`
          );
          const detail = detailRes?.data || {};

          if (detail && (detail.id || detail.bookingId)) {
            const bookingDate = detail.bookingDate || detail.createdDate || detail.createdAt || new Date();

            setBooking({
              id: detail.id || detail.bookingId || Number(id),
              township: detail.townshipName || detail.township || 'N/A',
              plotNumber: detail.plotNo || detail.plotNumber || 'N/A',
              plotSize: detail.plotSize || 'N/A',
              clientName: detail.clientName || 'N/A',
              clientMobile: detail.contactNo || detail.clientMobile || 'N/A',
              bookingDate: bookingDate,
              bookingDateDisplay: formatInputDate(bookingDate)
            });

            // Prefill form fields if data exists
            if (typeof detail.isDokitSigned === "boolean") {
              setSigned(detail.isDokitSigned);
            }

            const dokitDate = detail.dokitSignedDate || detail.dokitSignDate || detail.dokitSignedOn;
            if (dokitDate) {
              const formattedDate = formatInputDate(dokitDate);
              if (formattedDate) {
                setSignedOn(formattedDate);
              }
            }

            if (typeof detail.isJDAFileSigned === "boolean") {
              setJdaFileSigned(detail.isJDAFileSigned);
            }

            const jdaDate = detail.jdaFileSignedDate || detail.jdaFileSignDate || detail.jdaSignedOn;
            if (jdaDate) {
              const formattedDate = formatInputDate(jdaDate);
              if (formattedDate) {
                setJdaFileSignedOn(formattedDate);
              }
            }

            if (detail.notes) {
              setNote(detail.notes);
            }

            setCheckingBooking(false);
            return;
          }
        } catch (detailErr) {
          // Continue to fallback method
        }

        // Fallback: Fetch from booking list
        const response = await axiosInstance.get(API_ENDPOINTS.BOOKING_LIST);
        const bookingsList = Array.isArray(response.data) ? response.data : (response.data?.value || []);

        const booking = bookingsList.find(b => b.id === Number(id));

        if (booking) {
          const bookingDate = booking.bookingDate || booking.createdDate || booking.createdAt || new Date();

          setBooking({
            id: booking.id,
            township: booking.townshipName,
            plotNumber: booking.plotNo,
            plotSize: booking.plotSize,
            clientName: booking.clientName,
            clientMobile: booking.contactNo,
            bookingDate: bookingDate,
            bookingDateDisplay: formatInputDate(bookingDate)
          });

          // Try to get additional details
          try {
            const detailRes = await axiosInstance.get(
              `${API_ENDPOINTS.GET_BOOKING_BY_ID}?bookingId=${booking.id}`
            );
            const detail = detailRes?.data || {};

            if (typeof detail.isDokitSigned === "boolean") {
              setSigned(detail.isDokitSigned);
            }

            const dokitDate = detail.dokitSignedDate || detail.dokitSignDate || detail.dokitSignedOn;
            if (dokitDate) {
              const formattedDate = formatInputDate(dokitDate);
              if (formattedDate) {
                setSignedOn(formattedDate);
              }
            }

            if (typeof detail.isJDAFileSigned === "boolean") {
              setJdaFileSigned(detail.isJDAFileSigned);
            }

            const jdaDate = detail.jdaFileSignedDate || detail.jdaFileSignDate || detail.jdaSignedOn;
            if (jdaDate) {
              const formattedDate = formatInputDate(jdaDate);
              if (formattedDate) {
                setJdaFileSignedOn(formattedDate);
              }
            }

            if (detail.notes) {
              setNote(detail.notes);
            }
          } catch (prefillErr) {
            // Silently ignore prefill errors
          }
        } else {
          const today = new Date();
          setBooking({
            id: Number(id),
            township: 'N/A',
            plotNumber: 'N/A',
            plotSize: 'N/A',
            clientName: 'N/A',
            clientMobile: 'N/A',
            bookingDate: today.toISOString(),
            bookingDateDisplay: formatInputDate(today.toISOString())
          });
        }
      } catch (error) {
        const today = new Date();
        setBooking({
          id: Number(id) || 0,
          township: 'N/A',
          plotNumber: 'N/A',
          plotSize: 'N/A',
          clientName: 'N/A',
          clientMobile: 'N/A',
          bookingDate: today.toISOString(),
          bookingDateDisplay: formatInputDate(today.toISOString())
        });
      } finally {
        setCheckingBooking(false);
      }
    };

    fetchAllData();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const bookingId = Number(id);
    if (!bookingId || isNaN(bookingId)) {
      Swal.fire({
        icon: "error",
        title: "Missing Booking ID",
        text: "Invalid booking ID in URL. Please navigate from the booking list.",
      });
      return;
    }

    // Validate required fields
    const validationErrors = [];

    if (!signed && !jdaFileSigned) {
      validationErrors.push("At least one document must be signed (Dokit or JDA)");
    }

    if (signed && !signedOn) {
      validationErrors.push("Signed On Date is required when Dokit Document is signed");
    }

    if (jdaFileSigned && !jdaFileSignedOn) {
      validationErrors.push("JDA Signed On Date is required when JDA File is signed");
    }

    if (validationErrors.length > 0) {
      Swal.fire({
        icon: "warning",
        title: "Required Fields Missing",
        html: `
            <p>Please complete the following required fields:</p>
            <ul style="text-align: left; margin: 10px 0;">
              ${validationErrors.map(error => `<li>${error}</li>`).join('')}
            </ul>
          `,
        confirmButtonText: "OK"
      });
      return;
    }

    // Format dates for API
    const formatDateForAPI = (dateStr) => {
      if (!dateStr) return null;
      const [year, month, day] = dateStr.split("-");
      return new Date(
        Date.UTC(year, month - 1, day)
      ).toISOString();
    };

    const payload = {
      bookingId: Number(bookingId),
      isDokitSigned: Boolean(signed),
      dokitSignDate: formatDateForAPI(signedOn),
      dokitSignedDate: formatDateForAPI(signedOn),
      isJDAFileSigned: Boolean(jdaFileSigned),
      jdaFileSignDate: formatDateForAPI(jdaFileSignedOn),
      jdaFileSignedDate: formatDateForAPI(jdaFileSignedOn),
      notes: note?.trim() || "",
    };

    setLoading(true);
    try {
      const res = await axiosInstance.post(
        API_ENDPOINTS.UPDATE_DOKIT_SIGNING_STATUS,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }
        }
      );

      const isSuccess = res.data === true || res.data?.success === true || res.status === 200;

      if (isSuccess) {
        Swal.fire({
          icon: "success",
          title: "Dokit Signing Status Updated Successfully",
          text: "Document signing status has been recorded",
          timer: 2000,
          showConfirmButton: false,
        });

        setTimeout(() => {
          navigate(`/property?refresh=${Date.now()}`);
        }, 2000);
      } else {
        Swal.fire({
          icon: "warning",
          title: "Unexpected Response",
          html: `
              <p>The status may not have been saved. Please verify.</p>
            `,
        });
      }
    } catch (err) {
      const status = err.response?.status;
      const errorData = err.response?.data;
      let msg = "Something went wrong";

      if (status === 400) {
        msg = "Invalid request data";
      } else if (status === 404) {
        msg = `Booking ID ${id} not found`;
      } else if (status === 500) {
        msg = "Internal Server Error";
      } else if (!err.response) {
        msg = "Network Error - Cannot connect to server";
      }

      Swal.fire({
        icon: "error",
        title: `Failed (${status || "Network Error"})`,
        html: `<p><strong>${msg}</strong></p>`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <BookingWrapper className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <div className="dashboard-header-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <div>
            <h2 className="dashboard-title">Dokit Signing Management</h2>
            <p className="dashboard-subtitle">Track and manage document signing status</p>
          </div>
        </div>
        <div className="dashboard-header-actions">
                                            
                                            <button
                                                onClick={() => navigate("/property")}
                                                className="primary-btn"
                                            >
                                                Back
                                            </button>
                                            <ReminderButton
                                                size="small"
                                                variant="outline"
                                                onClick={() => setShowReminderPopup(true)}
                                            />
                                        </div>
      </div>

      {/* Booking Information */}
      {booking ? (
        <div className="card">
          <div className="booking-info-matrix">

            <div className="booking-info-row">
              <label>Township :</label>
              <span className="booking-info-value">
                {booking?.township || 'N/A'}
              </span>
            </div>

            <div className="booking-info-row">
              <label>Plot :</label>
              <span className="booking-info-value">
                {booking?.plotNumber || 'N/A'}
              </span>
            </div>

            <div className="booking-info-row">
              <label>Size :</label>
              <span className="booking-info-value">
                {booking?.plotSize || 'N/A'}
              </span>
            </div>

            <div className="booking-info-row">
              <label>Client :</label>
              <span className="booking-info-value">
                {booking?.clientName || 'N/A'}
              </span>
            </div>

            <div className="booking-info-row">
              <label>Mobile :</label>
              <span className="booking-info-value">
                {booking?.clientMobile || 'N/A'}
              </span>
            </div>

            <div className="booking-info-row">
              <label>Booking Date :</label>
              <span className="booking-info-value">
                {booking?.bookingDateDisplay || 'N/A'}
              </span>
            </div>

          </div>
        </div>

      ) : (
        <div className="card">
          <div style={{ padding: '15px', textAlign: 'center' }}>
            <p>{checkingBooking ? 'Loading booking information...' : 'Setting up booking information...'}</p>
          </div>
        </div>
      )}

      {/* Dokit Signing Form */}
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6">
              <div className="dokit-checkbox-field">
                <label className="dokit-checkbox-container-inline">
                  <input
                    type="checkbox"
                    id="signed"
                    checked={signed}
                    onChange={(e) => {
                      setSigned(e.target.checked);
                      if (!e.target.checked) setSignedOn("");
                    }}
                    className="dokit-checkbox"
                  />
                  <span className="dokit-checkbox-label">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Dokit Document Signed
                  </span>
                </label>
              </div>

              <div className="dokit-date-field-inline">
                <label htmlFor="signedOn" className="date-label">
                  Signed On Date {signed && <span className="required-asterisk">*</span>}
                </label>
                <input
                  type="date"
                  id="signedOn"
                  value={signedOn}
                  onChange={(e) => setSignedOn(e.target.value)}
                  required={signed}
                  disabled={!signed}
                  className="form-control"
                />
              </div>
            </div>

            <div className="col-md-6">
              <div className="dokit-checkbox-field">
                <label className="dokit-checkbox-container-inline">
                  <input
                    type="checkbox"
                    id="jdaFileSigned"
                    checked={jdaFileSigned}
                    onChange={(e) => {
                      setJdaFileSigned(e.target.checked);
                      if (!e.target.checked) setJdaFileSignedOn("");
                    }}
                    className="dokit-checkbox"
                  />
                  <span className="dokit-checkbox-label">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    JDA File Signed
                  </span>
                </label>
              </div>

              <div className="form-group">
                <label htmlFor="jdaFileSignedOn" className="date-label">
                  JDA Signed On Date {jdaFileSigned && <span className="required-asterisk">*</span>}
                </label>
                <input
                  type="date"
                  id="jdaFileSignedOn"
                  value={jdaFileSignedOn}
                  onChange={(e) => setJdaFileSignedOn(e.target.value)}
                  required={jdaFileSigned}
                  disabled={!jdaFileSigned}
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="note">Note</label>
              <textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Enter any notes..."
                className="form-control"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>

      {/* Reminder Popup */}
      <ReminderPopup 
        isOpen={showReminderPopup}
        onClose={() => setShowReminderPopup(false)}
        title="Create Reminder"
        bookingId={id}
      />
    </BookingWrapper>
  );
}
