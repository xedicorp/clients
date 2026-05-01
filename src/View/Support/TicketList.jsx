import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../utilities/axiosInstance';
import API_ENDPOINTS from '../../utilities/apiConfig';
import { toast } from 'react-toastify';
import Lottie from 'lottie-react';
import Loading from '../../assets/Loading.json';
import { useNavigate } from 'react-router-dom';

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

   
   
    const fetchTickets = async () => {
    setLoading(true);
   // setError(null);

    try {

        let url = `${API_ENDPOINTS.SUPPORT_TICKET_LIST}?`; 
          //  url += `departmentId=0&`; 
               url += `status=1`; 
        
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
          <p className="dashboard-subtitle">View all client details</p>
        </div>
        {/* <div className="dashboard-header-actions">
            <button className='primary-btn'>Add Ticket</button>
        </div> */}
         <div className=" d-flex align-items-end gap-2">
          <button className='primary-btn' onClick={() => setStatusFilter('all')}>
  All Tickets
</button>

<button className='primary-btn' onClick={() => setStatusFilter('pending')}>
  Pending Tickets
</button>

<button className='primary-btn' onClick={() => setStatusFilter('closed')}>
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
                    <td>{item.screenshot}</td>
                      <td>{item.statusText}</td>
                      <td>{item.createdAt}</td>
                    <td>
                      <button
                        className="primary-btn"
                        onClick={() => navigate(`/support/view-ticket/${item.id}`)}
                      >
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