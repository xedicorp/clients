import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../utilities/axiosInstance';
import API_ENDPOINTS , { API_BASE_URL } from '../../utilities/apiConfig';
import { toast } from 'react-toastify';
import Lottie from 'lottie-react';
import Loading from '../../assets/Loading.json';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from "react-icons/fa";
import { FaList } from "react-icons/fa";
import { FaClock, FaEye  } from "react-icons/fa";
import { FaCircleCheck } from "react-icons/fa6";

const TicketList = () => {
  const navigate = useNavigate();

  const [ticketList, setTicketList] = useState([]);
  const [selectedTownshipId, setSelectedTownshipId] = useState('');
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const getFilteredTickets = () => {
  if (statusFilter === 'all') return ticketList;

  return ticketList.filter(item => {
    if (statusFilter === 'pending') return item.statusText.toLowerCase() === 'pending';
    if (statusFilter === 'closed') return item.statusText.toLowerCase() === 'closed';
    return true;
  });
};

   const getScreenshotUrl = (item) => {
       if (!item?.screenshot) return null;
       return `${API_BASE_URL}/Uploads/Support/${item.screenshot}`;
     };
   
    const fetchTickets = async () => {
    setLoading(true);
   // setError(null);

    try {

        let url = `${API_ENDPOINTS.SUPPORT_TICKET_LIST}?`; 
         
        
        const response = await axiosInstance.get(url);
        let transList = []; 
        transList = response.data || [];  
        setTicketList(transList);
        

    } catch (error) {
      
        let errorMsg = 'Failed to load tickets.';
        
      //  setError(errorMsg);
        setTicketList([]);
    } finally {
        setLoading(false);
    }
};


  useEffect(() => {
    fetchTickets();
  }, []);

  const viewDetail=(id)=>{

  }
  return (
    <div className='dashboard-container'>

      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className='dashboard-title'>Ticket List</h1>
          <p className="dashboard-subtitle">View all ticket details</p>
        </div>
        {/* <div className="dashboard-header-actions">
            <button className='primary-btn'>Add Ticket</button>
        </div> */}
         <div className=" d-flex align-items-end gap-2">
          <button className='primary-btn' onClick={() => setStatusFilter('all')}>
            <FaList />
  All Tickets
</button>

<button className='primary-btn' onClick={() => setStatusFilter('pending')}>
  <FaClock />
  Pending Tickets
</button>

<button className='primary-btn' onClick={() => setStatusFilter('closed')}>
  <FaCircleCheck />
  Closed Tickets
</button>
        </div>
      </div>

    
      

      {/* Table */}
      <div className="card">
        <div className="ticket-card">
           <table className="table">
            <thead>
              <tr>
                  <th>Id#</th>
                   <th>Subject</th>
                <th>Message</th>
                   <th>Screenshot</th>
                    <th>Status</th>
                     <th>Created On</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
        {  getFilteredTickets().map((item) => (
                  <tr key={item.id}>
                      <td>{item.id}</td>
                    <td>{item.subject}</td>
                    <td>{item.message}</td>
                    <td><span onClick={() =>
                    window.open(getScreenshotUrl(item), "_blank")
                  } style={{ cursor: "pointer", color: "blue" }}>{item.screenshot}</span></td>
                      <td>{item.statusText}</td>
                      <td>{item.createdAt}</td>
                    <td>
                      <button
                        className="primary-btn"
                        style={{ width: '150px' }}
                        onClick={() => navigate(`/support/view-ticket/${item.id}`)}
                      >
                         <FaEye />
                        View Detail
                      </button>
                    </td>

                  </tr>
                ))}
                </tbody>
                </table>
        </div>
      </div>

    </div>
  );
};

export default TicketList;