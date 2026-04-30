import { useEffect, useState } from "react";
import axiosInstance from "../../utilities/axiosInstance";
import API_ENDPOINTS from "../../utilities/apiConfig";
import Swal from "sweetalert2";

export default function ClosureReport() {

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [allBookings, setAllBookings] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const [townshipList, setTownshipList] = useState([]);

  const [filters, setFilters] = useState({
    townshipId: "",
    associateName: "",
    fromDate: "",
    toDate: ""
  });

  // ✅ Fetch Bookings
  const fetchBookings = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await axiosInstance.get(API_ENDPOINTS.BOOKING_LIST);

      const list = Array.isArray(res.data)
        ? res.data
        : res.data?.value || [];

      setAllBookings(list);

      // 👉 Only closed bookings
     const closed = list.filter(
  b => Number(b.statusId) === 50
);

      setFilteredData(closed);

    } catch (err) {
      setError("Failed to load closure report");
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch Township
  const fetchTownships = async () => {
    try {
      const res = await axiosInstance.get(API_ENDPOINTS.TOWNSHIP_LIST);
      const list = Array.isArray(res.data)
        ? res.data
        : res.data?.value || [];
      setTownshipList(list);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchTownships();
  }, []);

  // ✅ Apply Filters
  const applyFilters = () => {
    let data = [...allBookings];

    // Only closed
    data = data.filter(b => Number(b.statusId) === 50);

    // Township
    if (filters.townshipId) {
      data = data.filter(b => b.townshipId == filters.townshipId);
    }

    // Associate
    if (filters.associateName) {
      data = data.filter(b => b.associateName === filters.associateName);
    }

    // From Date
    if (filters.fromDate) {
      data = data.filter(
        b =>
          b.lastStatusChangedOn &&
          new Date(b.lastStatusChangedOn) >= new Date(filters.fromDate)
      );
    }

    // To Date
    if (filters.toDate) {
        const toDate = new Date(filters.toDate);
        toDate.setHours(23, 59, 59, 999); // include full day

        data = data.filter(
          b =>
            b.lastStatusChangedOn &&
            new Date(b.lastStatusChangedOn) <= toDate
        );
      }

    setFilteredData(data);
  };

  // ✅ Unique Associate List
  const associateList = [
    ...new Set(allBookings.map(b => b.associateName).filter(Boolean))
  ];

  return (
    <div className="dashboard-container">

      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Closure Report</h1>
          <p className="dashboard-subtitle">
            Closed Bookings Report
          </p>
        </div>

        <div className="dashboard-header-actions">
          <button
            className="primary-btn"
            onClick={() => window.history.back()}
          >
            Back
          </button>
        </div>
      </div>

      {/* ✅ Filters */}
      <div className="card">
        <div className="filter-section">
          <div className="row">

            {/* Township */}
            <div className="col-md-3">
              <select
                className="form-control"
                value={filters.townshipId}
                onChange={(e) =>
                  setFilters(prev => ({
                    ...prev,
                    townshipId: e.target.value
                  }))
                }
              >
                <option value="">All Townships</option>
                {townshipList.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Associate */}
            <div className="col-md-3">
              <select
                className="form-control"
                value={filters.associateName}
                onChange={(e) =>
                  setFilters(prev => ({
                    ...prev,
                    associateName: e.target.value
                  }))
                }
              >
                <option value="">All Associates</option>
                {associateList.map((a, i) => (
                  <option key={i} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            {/* From Date */}
            <div className="col-md-2">
              <input
                type="date"
                className="form-control"
                value={filters.fromDate}
                onChange={(e) =>
                  setFilters(prev => ({
                    ...prev,
                    fromDate: e.target.value
                  }))
                }
              />
            </div>

            {/* To Date */}
            <div className="col-md-2">
              <input
                type="date"
                className="form-control"
                value={filters.toDate}
                onChange={(e) =>
                  setFilters(prev => ({
                    ...prev,
                    toDate: e.target.value
                  }))
                }
              />
            </div>

            {/* Apply */}
            <div className="col-md-2">
              <button className="primary-btn" onClick={applyFilters}>
                Apply Filter
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* ✅ Table */}
      <div className="card">
        <div className="dashboard-table-header">
          <h3 className="dashboard-table-title">
            Closure Report
          </h3>

          <div className="ocr-payment-table-badge">
            {filteredData.length} Records
          </div>
        </div>

        <div className="table-wrapper">
          {loading ? (
            <div className="loading-state">
              <p>Loading...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="no-data">
              <p>No closed bookings found</p>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Booking Id</th>
                  <th>Type</th>
                  <th>Plot / Township</th>
                  <th>Customer</th>
                  <th>Associate</th>
                  <th>Booking Date</th>
                  <th>Closing Date</th>
                </tr>
              </thead>

              <tbody>
                {filteredData.map(item => (
                  <tr key={item.id}>

                    <td>{item.id}</td>

                    <td>{item.workflowTypeId}</td>

                    <td>
                      {item.plotNo} / {item.townshipName}
                    </td>

                    <td>{item.clientName}</td>

                    <td>{item.associateName || "-"}</td>

                    <td>
                      {item.bookingDate
                        ? new Date(item.bookingDate).toLocaleDateString("en-GB")
                        : "-"}
                    </td>

                    <td>
                      {item.lastStatusChangedOn
                        ? new Date(item.lastStatusChangedOn).toLocaleDateString("en-GB")
                        : "-"}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
}