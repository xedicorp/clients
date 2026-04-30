import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BookingWrapper from "./style";
import PropertyNavigation from "./PropertyNavigation";
import ReminderButton from "../../components/ReminderButton";
import ReminderPopup from "../../components/ReminderPopup";
import axiosInstance from "../../utilities/axiosInstance";
import API_ENDPOINTS from "../../utilities/apiConfig";
import { determineWorkflowCode } from "../../utilities/workflowUtils";
import "./PaymentEntry.css";

export default function PaymentEntry() {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedWorkflow, setSelectedWorkflow] = useState("all"); // Filter by workflow type

    // Reminder popup state
    const [showReminderPopup, setShowReminderPopup] = useState(false);

    const STORAGE_KEY = "property_bookings_v1";
    const toLowerSafe = (value) => String(value ?? "").toLowerCase();
    const toStringSafe = (value) => String(value ?? "");

    useEffect(() => {
        const fetchBookings = async () => {
            setLoading(true);
            try {
                const response = await axiosInstance.get(API_ENDPOINTS.BOOKING_LIST);
                const bookingsList = Array.isArray(response.data) ? response.data : (response.data?.value || []);
                setBookings(bookingsList);

                // Sync minimal workflow mapping to localStorage for menu filtering
                try {
                    const bookingsForStorage = bookingsList
                        .map(item => {
                            const resolvedId = item?.id ?? item?.bookingId ?? item?.BookingId;
                            if (!resolvedId) return null;
                            const wfCode = determineWorkflowCode(item);
                            return {
                                id: resolvedId,
                                workflowCode: wfCode,
                                workflowType: wfCode
                            };
                        })
                        .filter(Boolean);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookingsForStorage));
                } catch {}
            } catch (error) {

                setBookings([]);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    const filteredBookings = bookings.filter(booking => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase().trim();
        
        // Check if search term is a number for exact booking ID match
        const isNumericSearch = /^\d+$/.test(searchTerm.trim());
        const bookingIdStr = toStringSafe(booking.id);
        const bookingIdMatches = isNumericSearch 
            ? bookingIdStr === searchTerm.trim() // Exact match for numeric search
            : bookingIdStr.includes(search); // Partial match for text search
        
        return (
            bookingIdMatches ||
            toLowerSafe(booking.clientName).includes(search) ||
            toStringSafe(booking.contactNo).includes(search) ||
            toLowerSafe(booking.townshipName).includes(search) ||
            toLowerSafe(booking.plotNo).includes(search)
        );
    });

    const handleSelectBooking = (selectedBookingId) => {
        if (selectedBookingId) {
            const found = bookings.find(b => String(b?.id ?? b?.bookingId ?? b?.BookingId) === String(selectedBookingId));
            const wfCode = found ? determineWorkflowCode(found) : null;
            if (wfCode) {
                try {
                    localStorage.setItem("current_workflow_code", wfCode);
                    window.dispatchEvent(new Event("stepChanged"));
                } catch {}
            }
            navigate(`/property/receipt-list/${selectedBookingId}`);
        }
    };

    return (
        <BookingWrapper className="dashboard-container">
            <div className="dashboard-header">
                <div className="dashboard-header-content">
                    <div>
                        <h1 className="dashboard-title">Receipt Entry</h1>
                        <p className="dashboard-subtitle">Select a booking to enter   receipt</p>
                    </div>
                </div>
                <div className="dashboard-header-actions">
                    <ReminderButton
                        size="small"
                        variant="outline"
                        onClick={() => setShowReminderPopup(true)}
                    />
                </div>
            </div>

            <div className="card">
                <div className="dashboard-table-header">
                    <h3 className="dashboard-table-title">
                        Available Bookings ({filteredBookings.length})
                    </h3>
                    <div className="payment-entry-search">
                        <input
                            type="text"
                            placeholder="Search by ID, name, mobile, township, or plot..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="form-control"
                        />
                    </div>
                </div>

                <div className="table-wrapper">
                    {loading ? (
                        <div className="loading-state">
                            <p>Loading bookings...</p>
                        </div>
                    ) : (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th className="left">Booking ID</th>
                                    <th className="left">Client Name</th>
                                    <th className="left">Mobile</th>
                                    <th className="left">Township</th>
                                    <th className="left">Plot</th>
                                    <th className="center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBookings.length > 0 ? (
                                    filteredBookings.map((booking, index) => {
                                        const resolvedBookingId = booking?.id ?? booking?.bookingId ?? booking?.BookingId;

                                        return (
                                            <tr key={resolvedBookingId ?? `booking-row-${index}`}>
                                                <td className="booking-id-cell">
                                                    <span>{resolvedBookingId ?? "N/A"}</span>
                                                </td>
                                                <td>{booking.clientName || 'N/A'}</td>
                                                <td>{booking.contactNo || 'N/A'}</td>
                                                <td>{booking.townshipName || 'N/A'}</td>
                                                <td>{booking.plotNo || 'N/A'}</td>
                                                <td className="d-flex gap-2">
                                                     
                                                    <button
                                                        type="button"
                                                        className="primary-btn"
                                                        onClick={() => handleSelectBooking(resolvedBookingId)}
                                                        disabled={!resolvedBookingId}
                                                        title={resolvedBookingId ? `Receipt entry open for Booking ID ${resolvedBookingId}` : "Booking ID not available"}
                                                    >
                                                        Enter Receipt
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="no-data">
                                            <p>No bookings found matching your search</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Reminder Popup */}
            <ReminderPopup 
              isOpen={showReminderPopup}
              onClose={() => setShowReminderPopup(false)}
              title="Create Reminder"
            //   bookingId={selectedBookingId}
            />
        </BookingWrapper>
    );
}
