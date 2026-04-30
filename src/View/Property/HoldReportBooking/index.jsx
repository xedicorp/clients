import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Wrapper } from './style';
import axiosInstance from '../../../utilities/axiosInstance';
import API_ENDPOINTS from '../../../utilities/apiConfig';
import { formatDateTime } from '../../../utilities/dateUtils';
import Lottie from 'lottie-react';
import Loading from '../../../assets/Loading.json';
import ReminderPopup from '../../../components/ReminderPopup';

import {
  RefreshCw,
  XCircle
} from 'lucide-react';

const HoldBookingReport = () => {
  const [holdBookings, setHoldBookings] = useState([]);
  const [filteredHoldBookings, setFilteredHoldBookings] = useState([]);
  const [townshipList, setTownshipList] = useState([]);
  const [selectedTownshipId, setSelectedTownshipId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [associateList, setAssociateList] = useState([]);
  const [retryCount, setRetryCount] = useState(0);
  const [showReminderPopup, setShowReminderPopup] = useState(false);
  const [townshipPlotList, setTownshipPlotList] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const MAX_RETRIES = 3;

  const navigate = useNavigate();


  const fetchAssociates = useCallback(async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.ASSOCIATE_LIST, {
        timeout: 10000
      });

      const raw = response?.data;
      const listData = Array.isArray(raw)
        ? raw
        : raw?.value || raw?.data || [];

      setAssociateList(listData);
    } catch (error) {
      toast.error('Failed to load associate list');
    }
  }, []);
 const getUserId = () => {
        const stored = localStorage.getItem("userId") || localStorage.getItem("spendwise_userId");
        const parsed = stored ? Number(stored) : NaN;
        return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
      };
  // Fetch townships on component mount
  const fetchTownships = useCallback(async () => {
    try {
      const response = await axiosInstance.get(
        // API_ENDPOINTS.TOWNSHIP_LIST+"?userId="+getUserId(),
        API_ENDPOINTS.TOWNSHIP_LIST,
         {
        timeout: 10000
      });

      const raw = response?.data;
      if (!raw) throw new Error('No data received from server');

      let townshipData = [];
      if (Array.isArray(raw)) {
        townshipData = raw;
      } else if (Array.isArray(raw?.value)) {
        townshipData = raw.value;
      } else if (Array.isArray(raw?.data)) {
        townshipData = raw.data;
      } else {
        throw new Error('Invalid response format from server');
      }

      setTownshipList(townshipData);
      if (townshipData.length > 0) {
        setSelectedTownshipId(townshipData[0].id);
      }
    } catch (err) {
      toast.error('Failed to load townships');
    }
  }, []);

  useEffect(() => {
    const fetchPlots = async () => {
      try {
        const params = selectedTownshipId ? { townshipId: selectedTownshipId } : {};
        const response = await axiosInstance.get(
          API_ENDPOINTS.PLOTS_LIST,
          { params }
        );
        const plots = Array.isArray(response.data)
          ? response.data
          : response.data?.value || [];
        setTownshipPlotList(plots);
        // console.log('Township Plot List:', plots);
      } catch (err) {
        setTownshipPlotList([]);
      }
    };
    fetchPlots();
  }, [selectedTownshipId]);

  // Fetch hold bookings based on selected township
  const fetchHoldBookings = useCallback(async () => {
    if (!selectedTownshipId) {
      toast.warning("Please select township first");
      return;
    }

    if (associateList.length === 0) return;

    try {
      setLoading(true);

      const response = await axiosInstance.get(API_ENDPOINTS.PLOT_HOLD_LIST, {
        params: { townshipId: selectedTownshipId }
      });

      const raw = response?.data;
      const holdData = Array.isArray(raw)
        ? raw
        : raw?.value || raw?.data || [];

      const plotRes = await axiosInstance.get(API_ENDPOINTS.PLOTS_LIST, {
        params: { townshipId: selectedTownshipId }
      });

      const allPlots = Array.isArray(plotRes.data)
        ? plotRes.data
        : plotRes.data?.value || [];

      const mapped = holdData.map(booking => {
        const associate = associateList.find(a => a.id === booking.associateId);
        const plot = allPlots.find(p => p.id === booking.plotId);
        const township = townshipList.find(t => t.id === selectedTownshipId);

        return {
          plotId: booking.plotId,
          plotNo: plot?.plotNo || "-",
          townshipName: township?.name || "N/A",
          associateId: booking.associateId,
          associateName: associate?.firstName || associate?.fullName || `Associate #${booking.associateId}`,
          associateContactNo: associate?.contactNo || "",
          associateReraNo: associate?.reraNo || "",
          leaderName: associate?.leaderName || "",
          leaderContactNo: associate?.leaderContactNo || "",
          holdDateTime: booking.holdDateTime,
          townshipId: booking.townshipId,
          plotSize: booking.plotSize,
          status: booking.status
        };
      });

      setHoldBookings(mapped);
      setFilteredHoldBookings(mapped);
      setHasSearched(true);
      setError(null);

    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to load hold bookings";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [selectedTownshipId, associateList, townshipList]);

  useEffect(() => {
    fetchAssociates();
    fetchTownships();
  }, [fetchAssociates, fetchTownships]);

  // Handle search button click
  const handleSearchClick = () => {
    if (associateList.length === 0) {
      toast.warning('Loading associate data, please wait...');
      return;
    }
    fetchHoldBookings();
  };


  useEffect(() => {
    if (!hasSearched) {
      setFilteredHoldBookings([]);
      return;
    }
    if (!searchTerm) {
      setFilteredHoldBookings(holdBookings);
      return;
    }
    const lower = searchTerm.toLowerCase();
    const filtered = holdBookings.filter(booking =>
      booking.plotNo?.toString().toLowerCase().includes(lower) ||
      booking.townshipName?.toLowerCase().includes(lower) ||
      booking.plotId?.toString().includes(lower) ||
      booking.associateId?.toString().includes(lower) ||
      booking.associateName?.toLowerCase().includes(lower) ||
      booking.status?.toLowerCase().includes(lower)
    );
    setFilteredHoldBookings(filtered);
  }, [searchTerm, holdBookings, hasSearched]);

  const handleRetry = () => {
    setRetryCount(0);
    fetchHoldBookings();
  };

  const handleConfirmBooking = (booking) => {
    console.log(booking)
    const matchedAssociate = associateList.find(
      associate => associate.id === booking.associateId
    );

    const bookingData = {
      plotId: booking.plotId,
      plotNo: booking.plotNo,
      associateId: booking.associateId,
      associateName: booking.associateName,
      associateContactNo: booking.associateContactNo,
      associateReraNo: matchedAssociate?.reraNo || '',
      leaderName: booking.leaderName,
      leaderContactNo: booking.leaderContactNo,
      workflowTypeId: booking.workflowTypeId,
      townshipId: booking.townshipId,
      plotSize: booking.plotSize,
      agreementRate: booking.agreementRate,
      totalAgreementValue: booking.totalAgreementValue,
      fromHoldBooking: true
    };

    localStorage.setItem('holdBookingData', JSON.stringify(bookingData));

    navigate('/property/new', {
      state: { fromHoldBooking: true }
    });
  };

  const handleResetFilters = () => {
  // Reset filters
  setSelectedTownshipId('');
  setSearchTerm('');

  // Reset data
  setHoldBookings([]);
  setFilteredHoldBookings([]);

  // Reset state flags
  setHasSearched(false);
  setError(null);
  setRetryCount(0);
};
  const handleTownshipChange = (e) => {
    const value = e.target.value;

    if (value === '') {
      setSelectedTownshipId('');
      setHoldBookings([]);
      setFilteredHoldBookings([]);
      setHasSearched(false);
    } else {
      setSelectedTownshipId(Number(value));
    }

    setRetryCount(0);
  };

  useEffect(() => {
    if (selectedTownshipId && associateList.length > 0 && townshipList.length > 0) {
      fetchHoldBookings();
    }
  }, [selectedTownshipId, associateList, townshipList, fetchHoldBookings]);

  if (loading) {
    return (
      <Wrapper>
        <div className="loading-container">
          <Lottie animationData={Loading} style={{ height: 120 }} />
          <p>Loading hold bookings...</p>
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper className='dashboard-container'>
      <div className="dashboard-header">
        <div className="">
          <h1 className='dashboard-title'>Hold Booking List</h1>
          <p className="dashboard-subtitle">View and manage hold bookings</p>
        </div>
        <div className="dashboard-header-actions">
          <button
            className="primary-btn"
            onClick={() => navigate('/property/hold-booking')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="16" />
                            <line x1="8" y1="12" x2="16" y2="12" />
                        </svg>
            <span>Add Hold Booking</span>
          </button>
          <button
            className="primary-btn"
            onClick={() => setShowReminderPopup(true)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"  >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span>Reminder</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <div className="error-content">
            <XCircle size={20} />
            <span>{error}</span>
          </div>
          <button onClick={handleRetry} className="btn-retry">
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      <div className="filters-section">
        <div className="filter-group">
          <label>Township</label>
          <select
            value={selectedTownshipId || ''}
            onChange={handleTownshipChange}
            className="form-control"
          >
            <option value="">Select Township</option>
            {townshipList.map((township) => (
              <option key={township.id} value={township.id}>
                {township.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Search</label>
          <input
            type="text"
            placeholder="Search by Plot ID, Associate Name, or Status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control"
            disabled={!hasSearched}
          />
        </div>

        <div className="filter-group">
  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
    
    <button
      onClick={handleSearchClick}
      className="primary-btn"
      disabled={loading}
    >
      {loading ? (
        <>
          <RefreshCw size={20} className="spinning" />
          <span>Searching...</span>
        </>
      ) : (
        <>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <span>Search</span>
        </>
      )}
    </button>

    <button
      type="button"
      className="primary-btn"
      onClick={handleResetFilters}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 12a9 9 0 1 0 3-6.7"></path>
      <polyline points="3 3 3 9 9 9"></polyline>
    </svg>
      Reset
    </button>

  </div>
</div>
      </div>
      <div className="card">
        <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Plot No</th>
              <th>Township</th>
              <th>Associate Name</th>
              <th>Hold Date & Time</th>

              <th>Plot Size (Sq. Yds)</th>

              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredHoldBookings.length > 0 ? (
              filteredHoldBookings.map((booking, index) => (
                <tr key={index}>
                  <td>{booking.plotNo || 'N/A'}</td>
                  <td>{booking.townshipName || 'N/A'}</td>
                  <td>{booking.associateName || 'N/A'}</td>
                  <td>{formatDateTime(booking.holdDateTime) || 'N/A'}</td>
                  <td>{booking.plotSize || 'N/A'}</td>

                  <td>
                    <button
                      className="primary-btn"
                      onClick={() => handleConfirmBooking(booking)}
                      title="Confirm Booking"
                    >
                      Confirm Booking
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="no-data">
                  {!hasSearched
                    ? 'Please select township and Click Search button to view hold bookings'
                    : selectedTownshipId
                      ? 'No hold bookings found for the selected township'
                      : 'No hold bookings found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      </div>
      

      {/* {filteredHoldBookings.length > 0 && (
        <div className="table-footer">
          <p>Total Records: {filteredHoldBookings.length}</p>
        </div>
      )} */}

      <ReminderPopup
        isOpen={showReminderPopup}
        onClose={() => setShowReminderPopup(false)}
        title="Reminder List"
      />
    </Wrapper>
  );
}

export default HoldBookingReport;
