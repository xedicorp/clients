import { useState, useEffect } from "react";
import { useNavigate, useSearchParams , useParams} from "react-router-dom";
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
 

const STORAGE_KEY = "property_bookings_v1";
 

export default function Reports() {
  const [collectionSummary, setCollectionSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
 const { townshipId } = useParams(); 
const [filteredData, setFilteredData] = useState([]);
const [search, setSearch] = useState("");

const formatDateOnly = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};
  // Fetch collection summary from API
  useEffect(() => {
  const fetchCollectionSummary = async () => {
    try {
      setLoading(true);

      const response = await axiosInstance.get(
        API_ENDPOINTS.TOWNSHIP_COLLECTION_DETAIL +
        "?townshipId=" + townshipId
      );

      const listData = Array.isArray(response.data)
        ? response.data
        : (response.data?.value || []);

      setCollectionSummary(listData);
      setFilteredData(listData);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  fetchCollectionSummary();
}, [townshipId]);

useEffect(() => {
  if (!search) {
    setFilteredData(collectionSummary);
    return;
  }

  const lower = search.toLowerCase();

  const filtered = collectionSummary.filter(item =>
    item.bookingId?.toString().includes(lower) ||
    item.townshipName?.toLowerCase().includes(lower) ||
    item.plotNo?.toLowerCase().includes(lower) ||
    item.customerName?.toLowerCase().includes(lower) ||
    item.customerContactNo?.toLowerCase().includes(lower)
  );

  setFilteredData(filtered);

}, [search, collectionSummary]);
  
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
              <h2>Loading collection reports...</h2>
              <p className="reports-subtitle">Please wait while we fetch the latest data</p>
            </div>
          </div>
        
        </div>
          <div class="loader-container">
           <span class="loader"></span>
         </div>
      </BookingWrapper>
    );
  }

  const formatPaymentMethod = (paymentMode) => {
  switch (paymentMode) {
    case 1:
      return "Bank Transfer";
    case 2:
      return "Cheque";
    case 4:
      return "UPI";
    case 5:
      return "NEFT/RTGS";
    case 6:
      return "Demand Draft";
    default:
      return paymentMode;
  }
  };

  const totalAmount = filteredData.reduce((sum, item) => {
  return sum + (Number(item.amount) || 0);
  }, 0);

  return (
    <BookingWrapper className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <div>
            <h2 className="dashboard-tile">Collection Details</h2>
            <p className="dashboard-subtitle">Comprehensive overview of township collections and performance metrics</p>
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
  
  {/* LEFT: Title */}
  <h3 className="dashboard-table-title">
    Detailed Collection Summary
  </h3>

  {/* RIGHT: Search + Button */}
  <div className="table-actions">
    <input
      type="text"
      placeholder="Search"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="form-control search-input"
    />

    <button className="primary-btn">
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
              <th>Booking ID</th>
              <th>Township</th>
              <th>Plot No</th>
              <th>Payment Method</th>
              <th>Customer Name</th>
              <th>Contact No</th>
              <th>Receipt Date</th>
              <th>Amount</th>
            </tr>
            </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr key={item.bookingId}>
                    
                    <td
                      style={{ cursor: "pointer",
                              color: "#2563eb",
                              fontWeight: "600",
                              textDecoration: "underline"
                             }}
                      onClick={() => navigate(`/booking-summery-report/${item.bookingNo}`)}
                    >
                        {item.bookingNo}
                    </td>

                    <td>{item.townshipName}</td>
                    <td>{item.plotNo}</td>
                    <td>{formatPaymentMethod(item.receiptMethod)}</td>

                    <td>{item.customerName}</td>
                    <td>{item.customerContactNo}</td>

                    <td>{formatDateOnly(item.receiptDate)}</td>
                    <td>{item.amount}</td>

                  </tr>
                ))}
                  {filteredData.length > 0 && (
                    <tr style={{ fontWeight: "bold", background: "#f8fafc" }}>
                      <td colSpan="7" style={{ textAlign: "right" }}>Total</td>
                      <td>₹ {totalAmount.toLocaleString()}</td>
                    </tr>
                  )}
              </tbody>
          </table>
        </div>
      </div>
    </BookingWrapper>
  );
}