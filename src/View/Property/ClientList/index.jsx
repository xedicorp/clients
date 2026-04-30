import { useState, useEffect, useCallback } from 'react';
import { Wrapper } from './style';
import axiosInstance from '../../../utilities/axiosInstance';
import API_ENDPOINTS from '../../../utilities/apiConfig';
import { toast } from 'react-toastify';
import Lottie from 'lottie-react';
import Loading from '../../../assets/Loading.json';

const ClientList = () => {

  const [townshipList, setTownshipList] = useState([]);
  const [selectedTownshipId, setSelectedTownshipId] = useState('');
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // ✅ Fetch Townships
  const fetchTownships = useCallback(async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.TOWNSHIP_LIST);

      const raw = response?.data;

      const townshipData = Array.isArray(raw)
        ? raw
        : raw?.value || raw?.data || [];

      setTownshipList(townshipData);

    } catch (err) {
      toast.error("Failed to load townships");
    }
  }, []);

  // ✅ Fetch Clients (Booking List)
  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);

      const response = await axiosInstance.get(API_ENDPOINTS.BOOKING_LIST);

      const raw = response?.data;

      const bookingData = Array.isArray(raw)
        ? raw
        : raw?.value || raw?.data || [];

      setClients(bookingData);
      setFilteredClients(bookingData);
      setHasSearched(true);

    } catch (err) {
      toast.error("Failed to load client list");
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Initial Load
  useEffect(() => {
    fetchTownships();
    fetchClients();
  }, [fetchTownships, fetchClients]);

  // ✅ Township Filter
  useEffect(() => {
    if (!hasSearched) return;

    let data = [...clients];

    if (selectedTownshipId) {
      data = data.filter(c => c.townshipId === Number(selectedTownshipId));
    }

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();

      data = data.filter(c =>
        c.clientName?.toLowerCase().includes(lower) ||
        c.contactNo?.toLowerCase().includes(lower) ||
        c.townshipName?.toLowerCase().includes(lower) ||
        c.plotNo?.toLowerCase().includes(lower)
      );
    }

    setFilteredClients(data);

  }, [selectedTownshipId, searchTerm, clients, hasSearched]);

  // ✅ Format Date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-GB');
  };

  if (loading) {
    return (
      <Wrapper>
        <div className="loading-container">
          <Lottie animationData={Loading} style={{ height: 120 }} />
          <p>Loading client list...</p>
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper className='dashboard-container'>

      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className='dashboard-title'>Client List</h1>
          <p className="dashboard-subtitle">View all client details</p>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">

      

        <div className="filter-group">
          <label>Search</label>
          <input
            type="text"
            placeholder="Search by Client Name, Plot No, Mobile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control"
          />
        </div>
  <div className="filter-group">
          
        </div>
          <div className="filter-group">
          
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Client Name</th>
                <th>Relation Type</th>
                <th>Relative Name</th>
                <th>Email</th>
                <th>Contact No</th>
                <th>Address</th>
              </tr>
            </thead>

            <tbody>
              {filteredClients.length > 0 ? (
                filteredClients.map((c, index) => (
                  <tr key={c.id}>
                    <td>{index + 1}</td>
                    <td>{c.clientName}</td>
                    <td>{c.relationType}</td>
                    <td>{c.relationName}</td>
                    <td>{c.clientEmail}</td>
                    <td>{c.contactNo}</td>
                    <td>{c.clientAddress}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="12" className="no-data">
                    No clients found
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>
      </div>

    </Wrapper>
  );
};

export default ClientList;