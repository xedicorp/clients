import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import BookingWrapper from "./style";
 import { formatDateTime } from '../../utilities/dateUtils';
import axiosInstance from "../../utilities/axiosInstance";
import API_ENDPOINTS from "../../utilities/apiConfig";
import "./CollectionDetailReport.css";

const STORAGE_KEY = "property_bookings_v1";
 

export default function CancelledBookingsReport() {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

 

  // Fetch collection summary from API
  useEffect(() => {
   
   // const townshipId= Number(townshipId);  ;
    const fetchReportData = async () => {
      try {
        const response = await axiosInstance.get(API_ENDPOINTS.CANCELLED_BOOKING_REPORT );
        const listData =   response.data  ; 
        setReportData(listData); 
      } catch (error) {
        
        
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  
  
const handleExport = () => {
  if (!reportData || reportData.length === 0) {
    alert("No data to export");
    return;
  }

  const headers = [
    "BookingId",
    "Booking Date",
    "Cancelled On",
    "Township",
    "Plot No",
    "Customer Name",
    "Customer Contact",
    "Associate Name",
    "Associate Contact",
    "Reason"
  ];

  //Function to escape CSV values
const escapeCSV = (value, isNumber = false) => {
  if (value === null || value === undefined) return "";

  let stringValue = String(value).replace(/"/g, '""');

  // Force Excel to treat as TEXT (important for phone numbers)
  if (isNumber) {
    return `="${stringValue}"`;
  }

  return `"${stringValue}"`;
};

  const rows = reportData.map(item => [
    escapeCSV(item.bookingId),
    escapeCSV(formatDateTime(item.bookingDate)),
    escapeCSV(formatDateTime(item.cancelledOn)),
    escapeCSV(item.township),
    escapeCSV(item.plotNo),
    escapeCSV(item.clientName),
    escapeCSV(item.clientContactNo, true),
    escapeCSV(item.associateName),
    escapeCSV(item.associateContactNo, true),
    escapeCSV(item.reason)
  ]);

  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers.map(escapeCSV), ...rows].map(e => e.join(",")).join("\n");

  const link = document.createElement("a");
  link.setAttribute("href", encodeURI(csvContent));
  link.setAttribute("download", "cancelled_bookings_report.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

  if (loading) {
    return (
      <BookingWrapper className="reports-container">
        <div className="reports-header">
          <div className="reports-header-content">
            <div className="reports-header-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3v18h18"></path>
                <path d="M18 17V9"></path>
                <path d="M13 17V5"></path>
                <path d="M8 17v-3"></path>
              </svg>
            </div>
            <div>
              <h2>Loading   reports...</h2>
              <p className="reports-subtitle">Please wait while we fetch the latest data</p>
            </div>
          </div>
        
        </div>
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </BookingWrapper>
    );
  }

  return (
    <BookingWrapper className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <div>
            <h2 className="dashboard-tile">Cancelled Bookings Report</h2>
            <p className="dashboard-subtitle">Comprehensive overview of Cancelled Bookings</p>
          </div>
          
        </div>
    <div className="dashboard-header-actions">
            <button className="primary-btn" onClick={() => navigate(-1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back
        </button>
          </div>
        
      </div> 
      {/* Collection Summary Table */}
      <div className="card dashboard-table-card">
        <div className="dashboard-table-header">
          <h3 className="dashboard-table-title"> </h3>
          <div className="table-actions">
            <button className="primary-btn" onClick={handleExport}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Export Data
            </button>
          </div>
        </div>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
              
                <th>BookingId</th>
                <th>Booking Date</th>
                <th>Cancelled On</th>
                <th>Township</th>
                <th>Plot No</th>
                <th>Customer</th>
                
                <th>Associate</th>
               
              
                <th>Reason</th>
                
              </tr>
            </thead>
            <tbody>
              {reportData.map((item) => (
                
                <tr key={item.bookingId}>
                  <td className="today-collection-cell">
                    <div className="amount-badge today">{item.bookingId}</div>
                  
                  </td>
                  <td className="today-collection-cell">
                    <div className="amount-badge today">
                   
                       {formatDateTime(item.bookingDate)}
                    </div>
                  </td>
                  <td className="total-collection-cell">
                    <div className="amount-badge total">
                    
                      {formatDateTime(item.cancelledOn)}
                    </div>
                  </td>
                   <td className="total-collection-cell">
                    <div className="amount-badge total">
                     { item.township }
                    </div>
                  </td> <td className="total-collection-cell">
                    <div className="amount-badge total">
                     {item.plotNo}
                    </div>
                  </td>
                   <td className="total-collection-cell">
                    <div className="amount-badge total">
                     {item.clientName}
                    </div>
                     <div className="amount-badge total">
                     {item.clientContactNo}
                    </div>
                  </td>
                   
                   <td className="total-collection-cell">
                    <div className="amount-badge total">
                     {item.associateName}
                    </div>
                     <div className="amount-badge total">
                     {item.associateContactNo}
                    </div>
                  </td>
                     
                     <td className="total-collection-cell">
                    <div className="amount-badge total">
                     {item.reason}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </BookingWrapper>
  );
}