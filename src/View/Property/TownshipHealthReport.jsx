import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import BookingWrapper from "./style";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import axiosInstance from "../../utilities/axiosInstance";
import API_ENDPOINTS from "../../utilities/apiConfig";
import "./TownshipHealthReport.css";

const COLORS = ["#60a5fa", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];

export default function TownshipHealthReport() {
  const navigate = useNavigate();
  const { townshipId } = useParams();
  const [townshipData, setTownshipData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch township health report data
  useEffect(() => {
    const fetchTownshipHealthReport = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use townshipId from URL params, fallback to 1 if not provided
        const id = townshipId || 1;

        
        const response = await axiosInstance.get(`${API_ENDPOINTS.TOWNSHIP_HEALTH_REPORT}?townshipId=${id}`);

        
        setTownshipData(response.data);
      } catch (error) {        setError(error.message || 'Failed to fetch township health report');
        
        // Fallback to dummy data for demo purposes
        setTownshipData({
          townshipName: "Tarang",
          townshipAddress: "",
          totalPlotsCount: 2,
          totalBookedPlotsCount: 1,
          totalUnbookedPlotsCount: 1,
          totalArea: 4020,
          totalBookedArea: 2010,
          totalUnbookedArea: 2010,
          totalBookedValue: 401995980,
          totalAmountReceived: 424680,
          totalAmountPending: 401571300
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTownshipHealthReport();
  }, [townshipId]);

  // Show loading state
  if (loading) {
    return (
      <BookingWrapper className="reports-container">
        <div className="reports-header">
          <div className="reports-header-content">
            <div className="reports-header-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12h4l2-3 3 6 2-3h5"></path>
                <circle cx="5" cy="19" r="2"></circle>
                <circle cx="12" cy="19" r="2"></circle>
                <circle cx="19" cy="19" r="2"></circle>
              </svg>
            </div>
            <div>
              <h2>Township Health Report</h2>
              <p className="reports-subtitle">Loading township data...</p>
            </div>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <button
              className="add-township-btn"
              onClick={() => navigate(-1)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6"></path>
              </svg>
              Back
            </button>
          </div>
        </div>
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </BookingWrapper>
    );
  }

  // Show error state
  if (error && !townshipData) {
    return (
      <BookingWrapper className="reports-container">
        <div className="reports-header">
          <div className="reports-header-content">
            <div className="reports-header-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12h4l2-3 3 6 2-3h5"></path>
                <circle cx="5" cy="19" r="2"></circle>
                <circle cx="12" cy="19" r="2"></circle>
                <circle cx="19" cy="19" r="2"></circle>
              </svg>
            </div>
            <div>
              <h2>Township Health Report</h2>
              <p className="reports-subtitle">Error loading data</p>
            </div>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <button
              className="add-township-btn"
              onClick={() => navigate(-1)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6"></path>
              </svg>
              Back
            </button>
          </div>
        </div>
        <div className="error-message">
          <p>Failed to load township health report: {error}</p>
          <button className="primary-btn" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </BookingWrapper>
    );
  }

  // Prepare data for charts using API response
  const plotPieData = [
    { name: "Booked Plots", value: townshipData.totalBookedPlotsCount },
    { name: "Unbooked Plots", value: townshipData.totalUnbookedPlotsCount }
  ];

  const areaBarData = [
    { name: "Total Area", value: townshipData.totalArea },
    { name: "Booked Area", value: townshipData.totalBookedArea },
    { name: "Unbooked Area", value: townshipData.totalUnbookedArea }
  ];

  const financeBarData = [
    { name: "Booked Value", value: townshipData.totalBookedValue },
    { name: "Amount Received", value: townshipData.totalAmountReceived },
    { name: "Amount Pending", value: townshipData.totalAmountPending }
  ];

  return (
    <BookingWrapper className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <div className="dashboard-header-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h4l2-3 3 6 2-3h5"></path>
              <circle cx="5" cy="19" r="2"></circle>
              <circle cx="12" cy="19" r="2"></circle>
              <circle cx="19" cy="19" r="2"></circle>
            </svg>
          </div>
          <div>
            <h2>Township Health Report</h2>
            <p className="dashboard-subtitle">Overview of plots, area, and financial health</p>
          </div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <button
            className="primary-btn"
            onClick={() => navigate(-1)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6"></path>
            </svg>
            Back
          </button>
        </div>
      </div>

      {/* Township Information */}
      <div className="card">
          <div className="township-info-header">
            <h3>{townshipData.townshipName}</h3>
            {townshipData.townshipAddress && (
              <p className="township-address">{townshipData.townshipAddress}</p>
            )}
          </div>
        </div>
      <div className="township-health-cards">
        {/* Township Card */}
        <div className="health-card compact-card township-card">
          <div className="compact-card-icon township-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M8 12h8M12 8v8"></path>
            </svg>
          </div>
          <div className="compact-card-content">
            <div className="compact-card-header">
              <span className="compact-card-label">TOWNSHIP</span>
              <h3 className="compact-card-title">{townshipData.townshipName}</h3>
            </div>
          </div>
          <div className="compact-card-details horizontal">
            <div className="detail-item">Total Plots: <span>{townshipData.totalPlotsCount}</span></div>
            <div className="detail-item">Booked: <span>{townshipData.totalBookedPlotsCount}</span></div>
            <div className="detail-item">Unbooked: <span>{townshipData.totalUnbookedPlotsCount}</span></div>
          </div>
        </div>

        {/* Area Card */}
        <div className="health-card compact-card area-card">
          <div className="compact-card-icon area-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <path d="M9 9h6v6H9z"></path>
            </svg>
          </div>
          <div className="compact-card-content">
            <div className="compact-card-header">
              <span className="compact-card-label">AREA</span>
              <h3 className="compact-card-title">{townshipData.totalArea} SqYds</h3>
            </div>
          </div>
          <div className="compact-card-details horizontal">
            <div className="detail-item">Booked: <span>{townshipData.totalBookedArea} SqYds</span></div>
            <div className="detail-item">Unbooked: <span>{townshipData.totalUnbookedArea} SqYds</span></div>
          </div>
        </div>

        {/* Total Value Card */}
        <div className="health-card compact-card total-valid-card">
          <div className="compact-card-icon total-valid-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div className="compact-card-content">
            <div className="compact-card-header">
              <span className="compact-card-label">TOTAL VALUE</span>
              <h3 className="compact-card-title">₹{townshipData.totalBookedValue.toLocaleString('en-IN')}</h3>
            </div>
          </div>
          <div className="compact-card-details horizontal">
            <div className="detail-item">Amount Received: <span>₹{townshipData.totalAmountReceived.toLocaleString('en-IN')}</span></div>
            <div className="detail-item">Amount Pending: <span>₹{townshipData.totalAmountPending.toLocaleString('en-IN')}</span></div>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-header">
            <h4>Plots Distribution</h4>
            <span className="chart-subtitle">Booked vs Unbooked</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Tooltip />
                <Legend />
                <Pie data={plotPieData} dataKey="value" nameKey="name" outerRadius={100} label>
                  {plotPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h4>Area Overview</h4>
            <span className="chart-subtitle">SqYds by category</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={areaBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="SqYds" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card" >
          <div className="chart-header">
            <h4>Financial Summary</h4>
            <span className="chart-subtitle">Amounts in ₹</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={financeBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`} />
                <Tooltip formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Amount']} />
                <Legend />
                <Bar dataKey="value" name="Amount" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

     
    </BookingWrapper>
  );
}
