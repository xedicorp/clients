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
import PropertyNavigation from "./PropertyNavigation";
import ReminderButton from "../../components/ReminderButton";
import ReminderPopup from "../../components/ReminderPopup";
import axiosInstance from "../../utilities/axiosInstance";
import API_ENDPOINTS from "../../utilities/apiConfig";
import "./Reports.css";

const STORAGE_KEY = "property_bookings_v1";

// Custom Tooltip for charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="chart-tooltip-label">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="chart-tooltip-item">
            <span className="chart-tooltip-color" style={{ backgroundColor: entry.color }}></span>
            {entry.name}: <strong>₹{entry.value.toLocaleString()}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function loadBookings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { }
  return [];
}

export default function Reports() {
  const [collectionSummary, setCollectionSummary] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChart, setSelectedChart] = useState("bar");
  const [timeRange, setTimeRange] = useState("monthly");
  const navigate = useNavigate();

  // Reminder popup state
  const [showReminderPopup, setShowReminderPopup] = useState(false);

  // Mock time series data for demonstration
  const generateTimeSeriesData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(month => ({
      month,
      collection: Math.floor(Math.random() * 1000000) + 500000,
      target: 1000000,
      previousYear: Math.floor(Math.random() * 800000) + 400000
    }));
  };

   const getUserId = () => {
        const stored = localStorage.getItem("userId") || localStorage.getItem("spendwise_userId");
        const parsed = stored ? Number(stored) : NaN;
        return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
      };
  // Fetch collection summary from API
  useEffect(() => {
    

    const fetchCollectionSummary = async () => {
      try {
        // Fetch both collection summary and township list (to get addresses)
        const [summaryResponse, listResponse] = await Promise.all([
          axiosInstance.get(API_ENDPOINTS.TOWNSHIP_COLLECTION_SUMMARY+"?userId="+getUserId()),
          axiosInstance.get(API_ENDPOINTS.TOWNSHIP_LIST+"?userId="+getUserId())
        ]);

        // Process Township List to create an address map
        let townshipList = [];
        if (Array.isArray(listResponse.data)) townshipList = listResponse.data;
        else if (Array.isArray(listResponse.data?.value)) townshipList = listResponse.data.value;
        else if (Array.isArray(listResponse.data?.data)) townshipList = listResponse.data.data;
        else if (Array.isArray(listResponse.data?.result)) townshipList = listResponse.data.result;

        const addressMap = {};
        townshipList.forEach(t => {
          const id = t.id ?? t.townshipId ?? t.TownshipId;
          const addr = t.address ?? t.townshipAddress ?? t.TownshipAddress;
          if (id) {
            addressMap[id] = addr;
          }
        });

        const listData = Array.isArray(summaryResponse.data) ? summaryResponse.data : (summaryResponse.data?.value || []);

        const transformedCollectionSummary = (listData || []).map((item, index) => {
          const id = item.id || item.Id || item.ID || item.townshipId || item.TownshipId || item.TownshipID || item.township_id;
          
          return {
            id: id,
            townshipName: item.townshipName || item.TownshipName || item.Township_Name,
            address: addressMap[id] || item.address || item.Address || item.townshipAddress || "Address not available",
            totalCollection: item.totalCollection || 0,
            todaysCollection: item.todaysCollection || 0,
            targetCollection: Math.floor((item.totalCollection || item.TotalCollection || 0) * 1.2),
            percentage: Math.min(100, Math.floor(((item.totalCollection || item.TotalCollection || 0) / Math.floor((item.totalCollection || item.TotalCollection || 0) * 1.2)) * 100)),
            _raw: item
          };
        });

   

        setCollectionSummary(transformedCollectionSummary);

        // Prepare data for charts
        const chartData = transformedCollectionSummary.map(item => ({
          name: item.townshipName.length > 12 ? item.townshipName.substring(0, 10) + '...' : item.townshipName,
          total: item.totalCollection,
          today: item.todaysCollection,
          target: item.targetCollection,
          fill: getColorForTownship(item.townshipName)
        }));

        setChartData(chartData);

        // Generate time series data for demonstration
        setTimeSeriesData(generateTimeSeriesData());

      } catch (error) {
        console.error("Error fetching reports data:", error);
        // Fallback to mock data for demo
        const mockData = [];

        setCollectionSummary(mockData);
        const chartData = mockData.map(item => ({
          name: item.townshipName.length > 12 ? item.townshipName.substring(0, 10) + '...' : item.townshipName,
          total: item.totalCollection,
          today: item.todaysCollection,
          target: item.targetCollection,
          fill: getColorForTownship(item.townshipName)
        }));
        setChartData(chartData);
        setTimeSeriesData(generateTimeSeriesData());
      } finally {
        setLoading(false);
      }
    };

    fetchCollectionSummary();
  }, []);

  // Function to generate colors for townships
  const getColorForTownship = (name) => {
    const colors = [
      '#6366f1', // Indigo
      '#8b5cf6', // Purple
      '#ec4899', // Pink
      '#f43f5e', // Rose
      '#f97316', // Orange
      '#eab308', // Yellow
      '#84cc16', // Lime
      '#22c55e', // Green
      '#10b981', // Emerald
      '#14b8a6', // Teal
      '#06b6d4', // Cyan
      '#0ea5e9', // Sky
      '#3b82f6', // Blue
      '#6366f1', // Indigo
      '#a855f7'  // Purple
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  // Calculate summary statistics
  const totalCollection = collectionSummary.reduce((sum, item) => sum + item.totalCollection, 0);
  const totalTodayCollection = collectionSummary.reduce((sum, item) => sum + item.todaysCollection, 0);
  const averagePercentage = collectionSummary.length > 0
    ? collectionSummary.reduce((sum, item) => sum + item.percentage, 0) / collectionSummary.length
    : 0;

  // Data for pie chart
  const pieData = collectionSummary.map(item => ({
    name: item.townshipName,
    value: item.totalCollection,
    color: getColorForTownship(item.townshipName)
  }));

  // Function to download CSV report
  const downloadReport = () => {
    try {
      // Prepare CSV data
      const csvHeaders = ['Township Name', 'Total Collection', 'Today\'s Collection', 'Target Collection', 'Achievement %'];
      const csvData = collectionSummary.map(item => [
        item.townshipName,
        item.totalCollection,
        item.todaysCollection,
        item.targetCollection,
        item.percentage + '%'
      ]);

      // Create CSV content
      const csvContent = [
        csvHeaders.join(','),
        ...csvData.map(row => row.join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `collection-summary-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      alert('Error downloading report. Please try again.');
    }
  };

  if (loading) {
    return (
      <BookingWrapper className="dashboard-container">
        <div className="dashboard-header">
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
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <ReminderButton size="small" variant="secondary" />
            {/* <PropertyNavigation /> */}
          </div>
        </div>
        <div class="loader-container">
           <span class="loader"></span>
        </div>
     
      </BookingWrapper>
    );
  }

  return (
    <BookingWrapper className="dashboard-container">
      <div className="dashboard-header">
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
            <h2 className="dashboard-title">Reports</h2>
            <p className="dashboard-subtitle">Comprehensive overview of township collections and performance metrics</p>
          </div>
        </div>
        <div className="dashboard-header-actions">
          <ReminderButton 
            size="small" 
            variant="secondary" 
            onClick={() => setShowReminderPopup(true)}
          />
        </div>
      </div>

      {/* Township and Address Information */}
      <div className="card">
        <div className="row">
          <div className="col-lg-4">
              <div className="info-card">
                {/* <div className="info-label">Township Name</div> */}
                <div className="info-card-detail">
                  <div className="info-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9,22 9,12 15,12 15,22" />
                    </svg>
                  </div>
                  <div className="info-content">
                    <div className="info-value">Miscelleneous Reports</div>
                    
                  </div>
                </div>
                <h4 className="report-title">Reports</h4>
                <div className="info-action-btn">                 
                   <button className=""
                    onClick={() => {                     
                      navigate(`/reports/daily-comprehensive-report`);
                    }}                   
                  >   Daily Comprehensive Report </button>
                  
                </div>
                  <div className="info-action-btn">                 
                   <button className=""
                    onClick={() => {                     
                      navigate(`/reports/cancelled-bookings-report`);
                    }}                   
                  >   Cancelled Bookings   </button>
                  
                </div>
                <div className="info-action-btn"> 
                <button className=""
                    onClick={() => {                     
                      navigate(`/reports/booking-report`);
                    }}  >
                     Booking Report
                  </button>
                    </div>
                    <div className="info-action-btn"> 
                <button className=""
                    onClick={() => {                     
                      navigate(`/reports/tds-report`);
                    }}  >
                     TDS Report
                  </button>
                    </div>
                <div className="info-action-btn"> 
                <button className=""
                    onClick={() => {                     
                      navigate(`/reports/expired-rera-list/${1}`);
                    }}  >
                     Expired RERA List
                  </button>
                    </div>

                    <div className="info-action-btn"> 
                <button className=""
                    onClick={() => {                     
                      navigate(`/reports/closure-report`);
                    }}  >
                      Closure Report
                  </button>
                    </div>
              </div>
              </div>
          {collectionSummary.map((township, index) => {
            return (
              <div className="col-lg-4">
              <div key={township.id} className="info-card">
                {/* <div className="info-label">Township Name</div> */}
                <div className="info-card-detail">
                  <div className="info-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9,22 9,12 15,12 15,22" />
                    </svg>
                  </div>
                  <div className="info-content">
                    <div className="info-value">{township.townshipName}</div>
                    <div className="info-address">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: '14px', height: '14px', marginRight: '6px' }}>
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {township.address || "Address not available"}
                    </div>
                  </div>
                </div>
                <h4 className="report-title">Reports</h4>
                <div className="info-action-btn">
                  <button
                    className=""
                    onClick={() => {
                      const townshipId = township.id || 1;
                      navigate(`/property/township-progress-report/${townshipId}`);
                    }}
                    
                  >
                    File Progress Report
                  </button>
                  <button
                    className=""
                    onClick={() => {
                      const townshipId = township.id || 1;
                      navigate(`/property/township-health/${townshipId}`);
                    }}
                   
                  >
                    Health Report
                  </button>
                
                  <button
                    className=""
                    onClick={() => {
                      const townshipId = township.id || 1;
                      navigate(`/property/township-progress-summary-report/${townshipId}`);
                    }}
                    
                  >
                      Progress Summary Report
                  </button>
                  <button
                    className=""
                    onClick={() => {
                      const townshipId = township.id || 1;
                      navigate(`/reports/collection-detail-report/${townshipId}`);
                    }}
                    
                  >
                    Collection Report
                  </button>
                  <button
                    className=""
                    onClick={() => {
                      const townshipId = township.id || 1;
                      navigate(`/reports/availability-report/${townshipId}`);
                    }}
                    
                  >
                    Availability Report
                  </button>
                  <button
                    className=""
                    onClick={() => {
                      const townshipId = township.id || 1;
                      navigate(`/reports/funds-report/${townshipId}`);
                    }}
                    
                  >
                    Reserved Funds Report
                  </button>
                     <button    className=""
                    onClick={() => {    
                         const townshipId = township.id || 1;                 
                      navigate(`/reports/management-status-report/${townshipId}`);
                    }}  >
                    Management Status Report
                  </button>
                  
                </div>
              </div>
              </div>
              
            );
          })}
        </div>
      </div>

      {/* Charts Section */}
      <div className="card">
        <div className="dashboard-table-header">
          <h3 className="dashboard-table-title">Collection Analytics</h3>
        </div>

        <div className="charts-grid">
          {/* Main Chart */}
          <div className="main-chart">
            <div className="chart-header">
              <h4>Township Collection Overview</h4>
              <span className="chart-subtitle">Total vs Today's Collection (in ₹)</span>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                {selectedChart === 'bar' ? (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="total" name="Total Collection" fill="#8884d8" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="today" name="Today's Collection" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : selectedChart === 'pie' ? (
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ₹${(entry.value / 1000000).toFixed(1)}M`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Collection']} />
                    <Legend />
                  </PieChart>
                ) : (
                  <AreaChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `₹${(value / 1000000).toFixed(1)}M`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area type="monotone" dataKey="collection" name="Current Year" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                    <Area type="monotone" dataKey="previousYear" name="Previous Year" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>


        </div>
      </div>

      {/* Collection Summary Table */}
      <div className="card">
        <div className="dashboard-table-header">
          <h3 className="dashboard-table-title">Detailed Collection Summary ({collectionSummary.length} Townships)</h3>
          <div className="table-actions">
            <div className="township-actions">
              <button className="primary-btn" onClick={() => window.print()}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6,9 6,2 18,2 18,9"></polyline>
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                  <polyline points="6,14 6,22 18,22 18,14"></polyline>
                </svg>
                Print Report
              </button>
              <button className="primary-btn" onClick={downloadReport}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-15"></path>
                  <polyline points="7,10 12,15 17,10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download CSV
              </button>
            </div>
          </div>
        </div>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Township Name</th>
                <th>Today's Collection</th>
                <th>Total Collection</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {collectionSummary.length > 0 ? (
                collectionSummary.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td className="property-info">
                      <div className="property-name">{item.townshipName}</div>
                      <div className="property-details">ID: {item.id}</div>
                    </td>
                    <td className="today-collection-cell">
                      <div className="amount-badge today">
                        ₹{item.todaysCollection.toLocaleString()}
                      </div>
                    </td>
                    <td className="total-collection-cell">
                      <div className="amount-badge total">
                        ₹{item.totalCollection.toLocaleString()}
                      </div>
                    </td>
                    <td className="center">
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                          className="primary-btn"
                          onClick={() => {
                            if (!item.id) {
                              navigate(`/property/township-collection/1`);
                              return;
                            }
                            navigate(`/property/township-collection/${item.id}`);
                          }}
                        >
                          Collection Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    No township data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      
      <ReminderPopup 
        isOpen={showReminderPopup}
        onClose={() => setShowReminderPopup(false)}
        title="Create Reminder"
      />
    </BookingWrapper >
  );
}