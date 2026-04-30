import { useState, useEffect } from "react";
import { useNavigate, useSearchParams , useParams} from "react-router-dom";
import BookingWrapper from "./style";
import PropertyNavigation from "../Property/PropertyNavigation";
import ReminderButton from "../../components/ReminderButton";
import ReminderPopup from "../../components/ReminderPopup";
import axiosInstance from "../../utilities/axiosInstance";
import API_ENDPOINTS from "../../utilities/apiConfig";
import { determineWorkflowCode } from "../../utilities/workflowUtils";
import "./FundsReport.css";

export default function FundsReport() {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedWorkflow, setSelectedWorkflow] = useState("all"); // Filter by workflow type
    const [reportData, setReportData] = useState([]);
    // Reminder popup state
    const [showReminderPopup, setShowReminderPopup] = useState(false);
    const { townshipId } = useParams(); 
    const STORAGE_KEY = "property_bookings_v1";
    const toLowerSafe = (value) => String(value ?? "").toLowerCase();
    const toStringSafe = (value) => String(value ?? "");

   useEffect(() => { 
        const fetchReportData = async () => { 
            setLoading(true);
            debugger;
            try {
                const response = await axiosInstance.get(API_ENDPOINTS.AVAILABILITY_REPORT + "?townshipId=" + townshipId);
                const data = Array.isArray(response.data) ? response.data : (response.data?.value || []);
                console.log("REPORT DATA:", response.data);
                setReportData(data); 
            } catch (error) {

                setReportData([]);
            } finally {
                setLoading(false);
            }
        };
        fetchReportData();
    }, []);

    
 

    return (
        <BookingWrapper className="dashboard-container">
            <div className="dashboard-header">
                <div className="dashboard-header-content">
                    <div>
                        <h1 className="dashboard-title">Reserved Funds Report</h1>
                        <p className="dashboard-subtitle">Here Reserved Funds Report</p>
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
                   <button className="primary-btn">
                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-15"></path><polyline points="7,10 12,15 17,10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    Download Excel</button>
                </div>
            </div>

            <div className="card">
                <div className="dashboard-table-header">
                   
                     
                </div>

                <div className="table-wrapper">
                    {loading ? (
                        <div className="loading-state">
                            <p>Loading Report...</p>
                        </div>
                    ) : (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th className="left">Fund Name</th>
                                    <th className="left">Month</th>
                                     <th className="left">Target</th>
                                    <th className="left">Available</th>
                                     <th className="left">Required</th>
                                    
                                   
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.length > 0 ? (
                                    reportData.map((data, index) => {
                                        const id = data?.id ?? data?.bookingId ?? data?.BookingId;

                                        return (
                                            <tr key={id ?? `booking-row-${index}`}>
                                                <td className="booking-id-cell">
                                                    {data.plotNo}
                                                </td>
                                                <td>{data.plotSize || 'N/A'}</td>
                                                <td>{data.plotSizeInSqrmtr || 'N/A'}</td>
                                                <td>{data.saleableSize || 'N/A'}</td>
                                                <td>{data.plotTypeName || 'N/A'}</td>
                                                  
                                                
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
