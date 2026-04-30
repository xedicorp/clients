import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BookingWrapper from "./style";
import PropertyNavigation from "./PropertyNavigation";
import ReminderButton from "../../components/ReminderButton";
import ReminderPopup from "../../components/ReminderPopup";
import axiosInstance from "../../utilities/axiosInstance";
import API_ENDPOINTS from "../../utilities/apiConfig";
import { formatDisplayDate, toLocalIsoDate } from "../../utilities/dateUtils";
import Swal from "sweetalert2";
import "./UpdateLoginLiveStatus.css";

export default function UpdateLoginLiveStatus() {
    const navigate = useNavigate();
    const { id } = useParams();
    
    const [dateOfLogin, setDateOfLogin] = useState("");
    const [loginNumber, setLoginNumber] = useState("");
    const [bankName, setBankName] = useState("");
    const [bankBranch, setBankBranch] = useState("");
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);
    const [booking, setBooking] = useState(null);
    const [loadingBooking, setLoadingBooking] = useState(true);
    const [showReminderPopup, setShowReminderPopup] = useState(false);
    const [bankList, setBankList] = useState([]);
    // Fetch booking details
    useEffect(() => {
        const fetchBookingDetails = async () => {
            if (!id) return;
            
            try {
                const response = await axiosInstance.get(API_ENDPOINTS.BOOKING_LIST);
                const bookingsList = Array.isArray(response.data) ? response.data : (response.data?.value || []);
                const bookingData = bookingsList.find(b => b.id === Number(id));
                
                if (bookingData) {
                    setBooking({
                        id: bookingData.id,
                        township: bookingData.townshipName,
                        plotNumber: bookingData.plotNo,
                        plotSize: bookingData.plotSize,
                        clientName: bookingData.clientName,
                        clientMobile: bookingData.contactNo,
                        bookingDate: bookingData.bookingDate || toLocalIsoDate(new Date())
                    });

                    // Prefill login status data if exists
                    try {
                        const detailRes = await axiosInstance.get(
                            `${API_ENDPOINTS.GET_BOOKING_BY_ID}?bookingId=${bookingData.id}`
                        );
                        const detail = detailRes?.data || {};

                        if (detail.dateOfLogin) {
                            const formattedDate = toLocalIsoDate(detail.dateOfLogin);
                            if (formattedDate) {
                                setDateOfLogin(formattedDate);
                            }
                        }
                        if (detail.loginRefNo) {
                            setLoginNumber(detail.loginRefNo);
                        }
                        if (detail.bankName) {
                            setBankName(detail.bankName);
                        }
                        if (detail.branchName) {
                            setBankBranch(detail.branchName);
                        }
                        if (detail.notes_3) {
                            setNote(detail.notes_3);
                        }
                    } catch (prefillErr) {
                        // Silently fail prefill
                    }
                }
            } catch (error) {
                // Handle error silently
            } finally {
                setLoadingBooking(false);
            }
        };

        fetchBookingDetails();
    }, [id]);


    useEffect(() => {
  const fetchBanks = async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.BANK_LIST);

      const raw = response?.data;

      const banks = Array.isArray(raw)
        ? raw
        : raw?.value || raw?.data || [];

      setBankList(banks);
    } catch (err) {
      console.error(err);
    }
  };

  fetchBanks();
}, []);


    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!dateOfLogin || !bankName || !bankBranch || !loginNumber) {
            Swal.fire({
                icon: "warning",
                title: "Incomplete Information",
                text: "Please fill Date of Login, Bank Name, Branch Name and Login Number",
            });
            return;
        }

        const bookingId = Number(id);
        if (!bookingId) {
            Swal.fire({
                icon: "error",
                title: "Missing Booking ID",
                text: "Invalid booking ID in URL.",
            });
            return;
        }

        const payload = {
            bookingId,
            dateOfLogin: new Date(dateOfLogin).toISOString(),
            bankName: bankName.trim(),
            branchName: bankBranch.trim(),
            loginRefNo: loginNumber.trim(),
            notes: note.trim() || "string",
        };

        setLoading(true);
        try {
            await axiosInstance.post(
                API_ENDPOINTS.UPDATE_LOGIN_STATUS,
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            Swal.fire({
                icon: "success",
                title: "Login Status Updated Successfully",
                timer: 1800,
                showConfirmButton: false,
            });

            navigate(`/property?refresh=${Date.now()}`);
        } catch (err) {
            const status = err.response?.status;
            const errorData = err.response?.data;
            let msg = "Something went wrong";

            if (status === 400) {
                msg = errorData?.message || errorData?.title || "Invalid request data";
            } else if (status === 404) {
                msg = `Booking ID ${id} not found`;
            } else if (status === 500) {
                msg = errorData?.message || errorData?.title || "Internal Server Error";
            } else if (!err.response) {
                msg = "Network Error - Cannot connect to server";
            }

            Swal.fire({
                icon: "error",
                title: `Failed (${status || "Network Error"})`,
                text: msg,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <BookingWrapper className="dashboard-container">
            <div className="dashboard-header">
                <div className="dashboard-header-content">
                    <div>
                        <h2 className="dashboard-title">Update Login Status</h2>
                        <p className="dashboard-subtitle">Track and manage loan login file status</p>
                    </div>
                </div>
                <PropertyNavigation hideHealthButton />
            </div>

            {/* Booking Information */}
            {!loadingBooking && booking ? (
                <div className="card booking-info-card">
                    <div className="markfilecheck-info-matrix">
                        <div className="markfilecheck-info-row">
                            <span className="markfilecheck-info-label">Township:</span>
                            <span className="markfilecheck-info-value">{booking.township || 'N/A'}</span>
                        </div>
                        <div className="markfilecheck-info-row">
                            <span className="markfilecheck-info-label">Plot:</span>
                            <span className="markfilecheck-info-value">{booking.plotNumber || 'N/A'}</span>
                        </div>
                        <div className="markfilecheck-info-row">
                            <span className="markfilecheck-info-label">Size:</span>
                            <span className="markfilecheck-info-value">{booking.plotSize || 'N/A'}</span>
                        </div>
                        <div className="markfilecheck-info-row">
                            <span className="markfilecheck-info-label">Client:</span>
                            <span className="markfilecheck-info-value">{booking.clientName || 'N/A'}</span>
                        </div>
                        <div className="markfilecheck-info-row">
                            <span className="markfilecheck-info-label">Mobile:</span>
                            <span className="markfilecheck-info-value">{booking.clientMobile || 'N/A'}</span>
                        </div>
                        <div className="markfilecheck-info-row">
                            <span className="markfilecheck-info-label">Booking Date:</span>
                            <span className="markfilecheck-info-value">
                                {booking.bookingDate ? formatDisplayDate(booking.bookingDate) : 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="card">
                    <div className="loading-message">
                        <p>Loading booking information...</p>
                    </div>
                </div>
            )}

            <div className="card">
                <div className="dashboard-table-header">
                    <h3 className="dashboard-table-title">Login File Details</h3>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="update-login-form-grid">
                        <div className="update-login-field">
                            <label htmlFor="dateOfLogin">
                                Date of Login <span className="required-star">*</span>
                            </label> 
                            <input
                                id="dateOfLogin"
                                type="date"
                                value={dateOfLogin}
                                onChange={(e) => setDateOfLogin(e.target.value)}
                                required
                                className="form-control"
                            />
                        </div>

                        <div className="update-login-field">
                            <label htmlFor="loginNumber">
                                Login Number <span className="required-star">*</span>
                            </label>
                            <input
                                id="loginNumber"
                                type="text"
                                value={loginNumber}
                                onChange={(e) => setLoginNumber(e.target.value)}
                                placeholder="Enter login number"
                                required
                                className="form-control"
                            />
                        </div>

                        <div className="update-login-field">
                            <label htmlFor="bankName">
                                Bank Name <span className="required-star">*</span>
                            </label>
                            <select
                                id="bankName"
                                value={bankName}
                                onChange={(e) => setBankName(e.target.value)}
                                required
                                className="form-control"
                                >
                                <option value="">Select Bank</option>

                                {bankList.map((bank) => (
                                    <option key={bank.id} value={bank.name}>
                                    {bank.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="update-login-field">
                            <label htmlFor="bankBranch">
                                Bank Branch <span className="required-star">*</span>
                            </label>
                            <input
                                id="bankBranch"
                                type="text"
                                value={bankBranch}
                                onChange={(e) => setBankBranch(e.target.value)}
                                placeholder="Enter bank branch"
                                required
                                className="form-control"
                            />
                        </div>

                        <div className="update-login-field update-login-note-field">
                            <label htmlFor="note">Notes & Remarks</label>
                            <textarea
                                id="note"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Enter any notes or remarks"
                                rows="5"
                                className="form-control"
                            />
                        </div>
                    </div>

                    <div className="update-login-actions">
                        {/* <ReminderButton 
                            size="small" 
                            variant="outline" 
                            onClick={() => setShowReminderPopup(true)}
                        /> */}
                        <button type="button" className="primary-btn" onClick={() => navigate(-1)}>
                            Cancel
                        </button>
                        <button type="submit" className="primary-btn" disabled={loading}>
                            {loading ? "Saving..." : "Save Status"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Reminder Popup */}
            {/* <ReminderPopup
                isOpen={showReminderPopup}
                onClose={() => setShowReminderPopup(false)}
                title="Create Reminder"
                bookingId={id}
            /> */}
        </BookingWrapper>
    );
}
