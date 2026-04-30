import { useState, useEffect } from "react";
import { useNavigate, useSearchParams , useParams} from "react-router-dom";
import BookingWrapper from "./style";
import PropertyNavigation from "../Property/PropertyNavigation";
import ReminderButton from "../../components/ReminderButton";
import ReminderPopup from "../../components/ReminderPopup";
import axiosInstance from "../../utilities/axiosInstance";
import API_ENDPOINTS from "../../utilities/apiConfig";
import { determineWorkflowCode } from "../../utilities/workflowUtils";
import "./AvailabilityReport.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";



export default function AvailabilityReport() {
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
    const [statusId, setStatusId] = useState(0);
    const [plotTypeId, setPlotTypeId] = useState(0);

    const handleDownloadExcel = () => {
    if (!reportData.length) {
        Swal.fire("No Data", "No data to export", "info");
        return;
    }

    const formattedData = reportData.map(item => ({
        Township: item.townshipName || "N/A",
        PlotNo: item.plotNo || "N/A",
        Type: item.plotTypeName || "N/A",
        "Size (sq.yards)": item.plotSize || "N/A",
        "Size (sq.mtrs)": item.plotSizeInSqrmtr || "N/A",
        "Saleable Size": item.saleableSize || "N/A",
        Status: item.status || "N/A"
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Availability Report");

    const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array"
    });

    const file = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8"
    });

    saveAs(file, `Availability_Report_${new Date().toISOString().slice(0,10)}.xlsx`);
};
    
 const fetchReportData = async () => {
    setLoading(true);
    try {
        const response = await axiosInstance.get(
            `${API_ENDPOINTS.AVAILABILITY_REPORT}?townshipId=${townshipId}&statusId=${statusId}&plotTypeId=${plotTypeId}`
        );

        const data = Array.isArray(response.data)
            ? response.data
            : (response.data?.value || []);

        setReportData(data);
    } catch (error) {
        setReportData([]);
    } finally {
        setLoading(false);
    }
};

    useEffect(() => {
    fetchReportData();
}, []);
 

    return (
        <BookingWrapper className="dashboard-container">
            <div className="dashboard-header">
                <div className="dashboard-header-content">
                    <div>
                        <h1 className="dashboard-title">Availability Report</h1>
                        <p className="dashboard-subtitle">Here is list of bookings availabilities</p>
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
                   <button className="primary-btn" onClick={handleDownloadExcel}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-15"></path>
        <polyline points="7,10 12,15 17,10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
    Download Excel
</button>
                </div>
            </div>

            <div className="card">
                <div className="dashboard-table-header">

                            {/* Township (Fixed) */}
                            <div className="filter-group">
                                <label>Township</label>
                                <select value={townshipId} disabled className="form-control">
                                    <option value={townshipId}>
                                        {reportData[0]?.townshipName || "Loading..."}
                                    </option>
                                </select>
                            </div>

                            {/* Status Filter */}
                            <div className="filter-group">
                                <label>Status</label>
                                <select
                                    value={statusId}
                                    onChange={(e) => setStatusId(Number(e.target.value))}
                                    className="form-control"
                                >
                                    <option value={0}>All Status</option>
                                    <option value={1}>Available</option>
                                    <option value={2}>Booked</option>
                                    <option value={3}>Hold</option>
                                </select>
                            </div>

                            {/* Plot Type Filter */}
                            <div className="filter-group">
                                <label>Plot Type</label>
                                <select
                                    value={plotTypeId}
                                    onChange={(e) => setPlotTypeId(Number(e.target.value))}
                                    className="form-control"
                                >
                                    <option value={0}>All Plot Types</option>
                                    <option value={1}>Shop</option>
                                    <option value={2}>Plot</option>
                                    <option value={3}>Commercial</option>
                                    <option value={4}>Informal Commercial</option>
                                    <option value={5}>JDA Commercial</option>
                                    <option value={6}>Facility Area</option>
                                    <option value={7}>EWS</option>
                                    <option value={8}>LIG</option>
                                    <option value={9}>Khatedar Commercial</option>                                     
                                </select>
                            </div>

                            {/* Search Button */}
                            <div className="filter-group">
                                <label></label>
                                <button className="primary-btn" onClick={fetchReportData}>
                                    Search
                                </button>
                            </div>

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
                                    <th className="text-center">Township</th>
                                    <th className="text-center">Plot No</th>
                                    <th className="text-center">Type</th>
                                    <th className="text-center">Size (sq.yards)</th>
                                    <th className="text-center">Size (sq.mtrs)</th>
                                    <th className="text-center">Saleable Size</th>
                                    <th className="text-center">Status</th>                  
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.length > 0 ? (
                                    reportData.map((data, index) => {
                                        const id = data?.id ?? data?.bookingId ?? data?.BookingId;

                                        return (
                                            <tr key={id ?? `booking-row-${index}`}>
                                                <td className="text-center">{data.townshipName || 'N/A'}</td>
                                                <td className="booking-id-cell text-center">
                                                    {data.plotNo}
                                                </td>
                                                <td className="text-center">{data.plotTypeName || 'N/A'}</td>
                                                <td className="text-center">{data.plotSize || 'N/A'}</td> {/* sq.yards */}
                                                <td className="text-center">{data.plotSizeInSqrmtr || 'N/A'}</td> {/* sq.mtrs */}
                                                <td className="text-center">{data.saleableSize || 'N/A'}</td>
                                                 <td className="text-center">
                                                        <span className={
                                                        data.status === "Available"
                                                        ? "status-available"
                                                        : data.status === "Booked"
                                                        ? "status-booked"
                                                        : "status-hold"
                                                    }>
                                                            {data.status || "N/A"}
                                                        </span>
                                                    
                                                    </td>
                                                
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="no-data">
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
