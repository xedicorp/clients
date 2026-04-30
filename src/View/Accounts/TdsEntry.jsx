import { useEffect, useState } from "react";
import BookingWrapper from "../Property/style";
import axiosInstance from "../../utilities/axiosInstance";
import API_ENDPOINTS from "../../utilities/apiConfig";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export default function TdsEntry() {
  const navigate = useNavigate();

  const [townshipList, setTownshipList] = useState([]);
  const [plotList, setPlotList] = useState([]);

  const [formData, setFormData] = useState({
    townshipId: "",
    plotId: "",    
    amount: "",
   transactionDate:"",
    notes: ""
  });

  const getUserId = () => {
    const stored = localStorage.getItem("userId") || localStorage.getItem("spendwise_userId");
    const parsed = stored ? Number(stored) : NaN;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  };

  // ✅ Fetch Townships
  useEffect(() => {
    const fetchTownships = async () => {
      try {
        const res = await axiosInstance.get(
          // API_ENDPOINTS.TOWNSHIP_LIST + "?userId=" + getUserId()
          API_ENDPOINTS.TOWNSHIP_LIST
        );
        const data = Array.isArray(res.data) ? res.data : res.data?.value || [];
        setTownshipList(data);
      } catch (err) {
        Swal.fire("Error", "Failed to load townships", "error");
      }
    };
    fetchTownships();
  }, []);

  // ✅ Fetch Plots based on Township
  const fetchPlots = async (townshipId) => {
    try {
      let status=2;
      const res = await axiosInstance.get(API_ENDPOINTS.PLOTS_LIST, {
        params: { townshipId, status }
      });

      const plots = Array.isArray(res.data)
        ? res.data
        : res.data?.value || [];

      setPlotList(plots);
    } catch {
      setPlotList([]);
    }
  };

  // ✅ Handle Change
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));

    if (field === "townshipId") {
      setFormData((prev) => ({
        ...prev,
        townshipId: value,
        plotId: ""
      }));
      fetchPlots(value);
    }
  };

  // ✅ Submit
  const handleSubmit = async () => {

    if (!formData.townshipId || !formData.plotId || !formData.amount ) {
      Swal.fire("Error", "Please fill all required fields", "error");
      return;
    }

    const payload = {
      id: 0, 
      transactionDate:formData.transactionDate ,
      plotId: Number(formData.plotId),    
      amount: Number(formData.amount), 
      notes: formData.notes,
      userId: getUserId()
    };

    try {
      await axiosInstance.post(API_ENDPOINTS.TDS_ENTRY, payload);

      Swal.fire("Success", "TDS entry saved", "success");

      // reset form
      setFormData({
        townshipId: "",
        plotId: "",
        transactionDate: new Date().toISOString().split("T")[0],
        amount: "",
       
        notes: ""
      });

    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to save", "error");
    }
  };

  return (
    <BookingWrapper className="dashboard-container">

      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">TDS Entry</h1>
          <p className="dashboard-subtitle">Create TDS Entry</p>
        </div>
        <div className="dashboard-header-actions">
          <button className="primary-btn" onClick={() => navigate("/accounts/tds-list")}>
            TDS List
          </button>
        </div>
      </div>

      <div className="card">
        <div className="upload-loan-form-grid">

          {/* Township */}
          <div className="booking-form-field">
            <label>Township <span style={{ color: "red" }}>*</span></label>
            <select
              className="form-control"
              value={formData.townshipId}
              onChange={(e) => handleChange("townshipId", e.target.value)}
            >
              <option value="">Select Township</option>
              {townshipList.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Plot */}
          <div className="booking-form-field">
            <label>Plot <span style={{ color: "red" }}>*</span></label>
            <select
              className="form-control"
              value={formData.plotId}
              onChange={(e) => handleChange("plotId", e.target.value)}
              disabled={!formData.townshipId}
            >
              <option value="">Select Plot</option>
              {plotList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.plotNo} ({p.plotSize} SqYds)
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div className="booking-form-field">
            <label>Transaction Date <span style={{ color: "red" }}>*</span></label>
            <input
              type="date"
              className="form-control"
              value={formData.transactionDate}
              onChange={(e) => handleChange("transactionDate", e.target.value)}
            />
          </div>

          {/* Amount */}
          <div className="booking-form-field">
            <label>Amount <span style={{ color: "red" }}>*</span></label>
            <input
              type="text"
              className="form-control"
              value={formData.amount}
              onChange={(e) => {
                const value = e.target.value;

                // Only numbers + optional decimal (max 2 digits after .)
                if (/^\d*\.?\d{0,2}$/.test(value)) {
                    handleChange("amount", value);
                }
                }}
              placeholder="Enter amount"
            />
          </div>

       

          {/* Notes */}
          <div className="booking-form-field">
            <label>Notes</label>
            <textarea
              className="form-control"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
            />
          </div>

        </div>

        <div className="booking-form-actions">
          <button className="primary-btn" onClick={handleSubmit}>
            Save
          </button>
        </div>
      </div>

    </BookingWrapper>
  );
}