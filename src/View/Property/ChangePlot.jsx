import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import axiosInstance from "../../utilities/axiosInstance";
import API_ENDPOINTS from "../../utilities/apiConfig";
import PropertyNavigation from "./PropertyNavigation";
import "./ChangePlot.css";

export default function ChangePlot() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  
  const [booking, setBooking] = useState(null);
  const [availablePlots, setAvailablePlots] = useState([]);
  const [selectedPlot, setSelectedPlot] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reason, setReason] = useState("");
  const [agreementValue, setAgreementValue] = useState("");

  
  useEffect(() => {
    const fetchAllData = async () => {
      if (!bookingId || isNaN(parseInt(bookingId))) {
        navigate("/property");
        return;
      }

      try {
        setLoading(true);
        
        // Fetch booking details
        const bookingResponse = await axiosInstance.get(API_ENDPOINTS.BOOKING_LIST);
        let bookingsList = [];
        
        // Handle different response structures
        if (Array.isArray(bookingResponse.data)) {
          bookingsList = bookingResponse.data;
        } else if (bookingResponse.data?.value && Array.isArray(bookingResponse.data.value)) {
          bookingsList = bookingResponse.data.value;
        } else if (bookingResponse.data?.data && Array.isArray(bookingResponse.data.data)) {
          bookingsList = bookingResponse.data.data;
        } else if (typeof bookingResponse.data === 'object') {
          // If it's an object, try to find an array property
          const possibleArrays = Object.values(bookingResponse.data).filter(val => Array.isArray(val));
          if (possibleArrays.length > 0) {
            bookingsList = possibleArrays[0];
          }
        }
        
        console.log('Bookings list:', bookingsList);
        console.log('Looking for booking ID:', parseInt(bookingId));
        
        const bookingData = bookingsList.find(b => {
          const id = b.id || b.Id || b.ID || b.bookingId || b.BookingId;
          return String(id) === String(bookingId);
        });
        
        console.log('Found booking:', bookingData);
        
        if (!bookingData) {
          navigate("/property");
          return;
        }
        
        setBooking(bookingData);
        
        // Get townshipId from booking - check all possible field names
        const bookingTownshipId = bookingData.townshipId || bookingData.TownshipId || 
                                 bookingData.TownshipID || bookingData.township_id ||
                                 bookingData.townShipId || bookingData.TownShipId ||
                                 bookingData.township?.id || bookingData.Township?.id || 
                                 bookingData.Township?.ID;
        
        console.log('Booking township ID:', bookingTownshipId);
        console.log('Full booking data:', bookingData);
        
        if (!bookingTownshipId) {
          setAvailablePlots([]);
          return;
        }
        
        // Fetch all plots
        const plotsResponse = await axiosInstance.get(API_ENDPOINTS.PLOTS_LIST);
        let allPlots = [];
        
        // Handle different response structures
        if (Array.isArray(plotsResponse.data)) {
          allPlots = plotsResponse.data;
        } else if (plotsResponse.data?.value && Array.isArray(plotsResponse.data.value)) {
          allPlots = plotsResponse.data.value;
        } else if (plotsResponse.data?.data && Array.isArray(plotsResponse.data.data)) {
          allPlots = plotsResponse.data.data;
        } else if (typeof plotsResponse.data === 'object') {
          // If it's an object, try to find an array property
          const possibleArrays = Object.values(plotsResponse.data).filter(val => Array.isArray(val));
          if (possibleArrays.length > 0) {
            allPlots = possibleArrays[0];
          }
        }
        
        console.log('All plots from API:', allPlots);
        console.log('Booking Township ID:', bookingTownshipId);
        console.log('Full plots response:', plotsResponse.data);
        
        // Filter plots by township - check multiple possible field names
        const filteredPlots = allPlots.filter(plot => {
          const plotTownshipId = plot.townshipId || plot.TownshipId || plot.TownshipID || 
                                plot.townShipId || plot.TownshipID || plot.township_id ||
                                plot.township?.id || plot.Township?.id || plot.Township?.ID;
          const matches = String(plotTownshipId) === String(bookingTownshipId);
          if (matches) {
            console.log('Matched plot:', plot);
          }
          return matches;
        });
        
        console.log('Plots in same township:', filteredPlots);
        
        // Fetch all bookings to check which plots are booked
        const allBookingsResponse = await axiosInstance.get(API_ENDPOINTS.BOOKING_LIST);
        let allBookings = [];
        
        if (Array.isArray(allBookingsResponse.data)) {
          allBookings = allBookingsResponse.data;
        } else if (allBookingsResponse.data?.value && Array.isArray(allBookingsResponse.data.value)) {
          allBookings = allBookingsResponse.data.value;
        } else if (allBookingsResponse.data?.data && Array.isArray(allBookingsResponse.data.data)) {
          allBookings = allBookingsResponse.data.data;
        }
        
        // Get list of booked plot IDs (excluding cancelled bookings)
        const bookedPlotIds = allBookings
          .filter(b => {
            const status = (b.status || '').toLowerCase();
            const bookingStatus = (b.bookingStatus || '').toLowerCase();
            // Exclude cancelled, refunded, or rejected bookings
            return !status.includes('cancel') && 
                   !status.includes('refund') && 
                   !bookingStatus.includes('cancel') &&
                   !bookingStatus.includes('refund') &&
                   !bookingStatus.includes('reject');
          })
          .map(b => b.plotId || b.PlotId || b.PlotID || b.plot_id);
        
        console.log('Booked plot IDs:', bookedPlotIds);
        
        // Filter plots by availability (not in booked list, but include current plot)
        const availablePlots = filteredPlots.filter(plot => {
          const plotId = plot.id || plot.Id || plot.ID || plot.plotId || plot.PlotId;
          const currentPlotId = bookingData.plotId || bookingData.PlotId || bookingData.PlotID;
          const isCurrentPlot = String(plotId) === String(currentPlotId);
          const isBooked = bookedPlotIds.includes(plotId);
          
          // Include plot if it's not booked OR if it's the current plot
          return !isBooked || isCurrentPlot;
        });
        
        console.log('Available plots:', availablePlots);
        console.log('Total available plots count:', availablePlots.length);
        
        setAvailablePlots(availablePlots);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        Swal.fire({
          icon: "error",
          title: "Error Loading Data",
          text: "Failed to load booking or plot information. Please try again.",
          confirmButtonText: 'Go Back'
        }).then(() => {
          navigate("/property");
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [bookingId, navigate]);

  const handleCancel = () => {
    setSelectedPlot("");
    setReason("");
    setAgreementValue("");
  };

  const handleChangePlot = async () => {
    // Validation checks
    if (availablePlots.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Plots Available",
        text: `No available plots found in ${booking.townshipName} township. Please check with admin.`,
      });
      return;
    }

    if (!selectedPlot) {
      Swal.fire({
        icon: "warning",
        title: "Plot Required",
        text: "Please select a new plot.",
      });
      return;
    }

    if (!agreementValue || parseFloat(agreementValue) <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Agreement Value Required",
        text: "Please enter a valid agreement value greater than 0.",
      });
      return;
    }

    if (!reason.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Reason Required",
        text: "Please provide a reason for changing the plot.",
      });
      return;
    }

    // Check if selected plot is different from current plot
    if (Number(selectedPlot) === Number(booking.plotId)) {
      Swal.fire({
        icon: "warning",
        title: "Same Plot Selected",
        text: "Please select a different plot from the current one.",
      });
      return;
    }

    // Confirmation dialog
    const result = await Swal.fire({
      title: 'Confirm Plot Change',
      html: `
        <div style="text-align: left; margin: 20px 0;">
          <p><strong>Current Plot:</strong> Plot ${booking.plotNo} (ID: ${booking.plotId})</p>
          <p><strong>New Plot:</strong> Plot ${availablePlots.find(p => p.id == selectedPlot)?.plotNo} (ID: ${selectedPlot})</p>
          <p><strong>New Agreement Value:</strong> ₹${Number(agreementValue).toLocaleString()}</p>
          <p><strong>Reason:</strong> ${reason}</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Change Plot',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) {
      return;
    }

    setSaving(true);
    try {
      // Get current user ID for plotChangedBy
      const currentUser = JSON.parse(localStorage.getItem("spendwise_user") || "{}");
      const currentUserId = currentUser.id || 0;

      const payload = {
        bookingId: Number(booking.id),
        newPlotId: Number(selectedPlot),
        newAgreementValue: Number(agreementValue),
        plotChangedBy: Number(currentUserId),
        plotChangedOn: Math.floor(Date.now() / 1000), // Unix timestamp
        clientContactNo: booking.contactNo || booking.clientMobile || "",
        clientEmail: booking.clientEmail || ""
      };
      await axiosInstance.post(API_ENDPOINTS.CHANGE_PLOT, payload);

      Swal.fire({
        icon: "success",
        title: "Plot Changed Successfully!",
        html: `
          <div style="text-align: left; margin: 20px 0;">
            <p>✅ Plot has been successfully changed</p>
            <p><strong>New Plot:</strong> Plot ${availablePlots.find(p => p.id == selectedPlot)?.plotNo}</p>
            <p><strong>New Agreement Value:</strong> ₹${Number(agreementValue).toLocaleString()}</p>
          </div>
        `,
        timer: 4000,
        showConfirmButton: true,
        confirmButtonText: 'OK'
      });

      // Reset form and refresh booking data
      setSelectedPlot("");
      setReason("");
      setAgreementValue("");
      
      // Refresh booking data to show updated information
      try {
        const bookingResponse = await axiosInstance.get(API_ENDPOINTS.BOOKING_LIST);
        let bookingsList = [];
        
        if (Array.isArray(bookingResponse.data)) {
          bookingsList = bookingResponse.data;
        } else if (bookingResponse.data?.value && Array.isArray(bookingResponse.data.value)) {
          bookingsList = bookingResponse.data.value;
        } else if (bookingResponse.data?.data && Array.isArray(bookingResponse.data.data)) {
          bookingsList = bookingResponse.data.data;
        }
        
        const updatedBooking = bookingsList.find(b => {
          const id = b.id || b.Id || b.ID || b.bookingId || b.BookingId;
          return String(id) === String(bookingId);
        });
        
        if (updatedBooking) {
          setBooking(updatedBooking);
          console.log('Booking refreshed:', updatedBooking);
        }
      } catch (refreshError) {
        console.error('Error refreshing booking:', refreshError);
      }
      
    } catch (error) {
      let errorMessage = "Failed to change plot. Please try again.";
      
      if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || "Invalid request. Please check your input.";
      } else if (error.response?.status === 404) {
        errorMessage = "Booking or plot not found. Please refresh and try again.";
      } else if (error.response?.status === 500) {
        errorMessage = "Server error occurred. Please contact support.";
      } else if (error.message?.includes('Network Error')) {
        errorMessage = "Network connection failed. Please check your internet connection.";
      }

      Swal.fire({
        icon: "error",
        title: "Change Failed",
        text: errorMessage,
        confirmButtonText: 'Try Again'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="change-plot-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    navigate("/property");
    return null;
  }

  return (
    <div className="change-plot-container">
      <div className="change-plot-header">
        <div className="header-content">
          <div className="header-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
          <div>
            <h2>Change Plot</h2>
            <p className="subtitle">Update plot assignment for Booking ID {bookingId}</p>
          </div>
        </div>
        <PropertyNavigation />
      </div>

      <div className="card change-plot-card">
        <div className="current-booking-info">
          <h3>Current Booking Details</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Client Name:</label>
              <span>{booking.clientName || 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Township:</label>
              <span>{booking.townshipName || 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Current Plot:</label>
              <span>Plot {booking.plotNo || 'N/A'} ({booking.plotId || 'N/A'})</span>
            </div>
            <div className="info-item">
              <label>Plot Size:</label>
              <span>{booking.plotSize || "N/A"}</span>
            </div>
          </div>
        </div>

        <div className="change-plot-form">
          <h3>Select New Plot</h3>
          
          <div className="form-group">
            <label htmlFor="plot-select">Available Plots in {booking.townshipName || 'Selected Township'}:</label>
            <select
              id="plot-select"
              value={selectedPlot}
              onChange={(e) => setSelectedPlot(e.target.value)}
              className="form-control"
              disabled={availablePlots.length === 0}
            >
              <option value="">
                {availablePlots.length === 0 ? "No plots available" : "Select a plot..."}
              </option>
              {availablePlots.map(plot => {
                const plotId = plot.id || plot.Id || plot.ID || plot.plotId || plot.PlotId;
                const plotNo = plot.plotNo || plot.PlotNo || plot.PlotNumber || plot.plot_no || plot.number || plotId;
                const plotSize = plot.plotSize || plot.PlotSize || plot.size || plot.Size || plot.plot_size || '';
                const facing = plot.facing || plot.Facing || plot.facingType || plot.FacingType || '';
                const plotType = plot.plotType || plot.PlotType || plot.type || plot.Type || '';
                
                return (
                  <option key={plotId} value={plotId}>
                    Plot {plotNo}{plotSize ? ` - ${plotSize}` : ''}{facing ? ` | ${facing}` : ''}{plotType ? ` | ${plotType}` : ''}
                  </option>
                );
              })}
            </select>
            {availablePlots.length === 0 && (
              <div className="no-plots-message">
                <p style={{ color: '#dc3545', marginBottom: '8px' }}>
                  No available plots found in this township.
                </p>
                <p style={{ color: '#6c757d', fontSize: '13px', marginBottom: '12px' }}>
                  This could mean all plots are already booked or there's an issue loading the data.
                </p>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => window.location.reload()}
                  style={{ fontSize: '13px', padding: '4px 12px' }}
                >
                  Refresh Page
                </button>
              </div>
            )}
            {availablePlots.length > 0 && (
              <p style={{ color: '#28a745', fontSize: '14px', marginTop: '8px' }}>
                Found {availablePlots.length} available plot(s) in {booking.townshipName || 'this township'}
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="agreement-value">New Agreement Value: <span style={{color: 'red'}}>*</span></label>
            <input
              type="number"
              id="agreement-value"
              value={agreementValue}
              onChange={(e) => {
                const value = e.target.value;
                // Allow only positive numbers
                if (value === '' || (!isNaN(value) && parseFloat(value) >= 0)) {
                  setAgreementValue(value);
                }
              }}
              placeholder="Enter new agreement value..."
              className="form-control"
              min="0"
              step="1000"
            />
            {agreementValue && (
              <p style={{ color: '#10b981', fontSize: '14px', marginTop: '8px' }}>
                Amount: ₹{Number(agreementValue).toLocaleString('en-IN')}
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="reason">Reason for Change: <span style={{color: 'red'}}>*</span></label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a reason for changing the plot..."
              rows={4}
              className="form-control"
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => navigate("/property")}
              disabled={saving}
            >
              Back to Property
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCancel}
              disabled={saving}
            >
              Reset Form
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleChangePlot}
              disabled={saving || !selectedPlot || !reason.trim() || availablePlots.length === 0 || !agreementValue || parseFloat(agreementValue) <= 0}
              title={availablePlots.length === 0 ? "No plots available in this township" : ""}
            >
              {saving ? "Changing Plot..." : "Change Plot"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}