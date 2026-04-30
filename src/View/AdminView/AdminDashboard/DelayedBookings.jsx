import { useEffect, useMemo, useState } from 'react';
import Wrapper from './style';
import axiosInstance from '../../../utilities/axiosInstance';
import API_ENDPOINTS from '../../../utilities/apiConfig';
 
 import { formatDisplayDate, toLocalIsoDate } from '../../../utilities/dateUtils';
import { useNavigate, useParams } from 'react-router-dom'; 
const DelayedBookings = () => {
    const {townshipId, stageName } = useParams();
    
    const [loading, setLoading] = useState(false);    
   
    const[reportData, setReportData]=useState([]);

    const navigate = useNavigate(); 
    const loadReport = async () => {
        try {
            const response = await axiosInstance.get(
                API_ENDPOINTS.DELAYED_BOOKINGS+"?townshipId="+townshipId+"&stageName="+stageName
            ); 
            
            setReportData( response.data); 
         
        } catch (error) {
            console.error('Error fetching status data:', error);
        }
    };

    useEffect(() => {
        loadReport();
    }, []);

    

   
    return (
        <Wrapper className="dashboard-container">
            <div className="dashboard-header">
                <div >
                    <h2 className="dashboard-title">Delayed Bookings</h2>
                    <p className="dashboard-subtitle">
                        List of delayed bookings for {stageName} stage .
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginLeft: "auto" }}>
                    
                    <button className="primary-btn" onClick={() => navigate(-1)}>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    width="20"
                                    height="20"
                                >
                                    <path d="M15 18l-6-6 6-6" />
                                </svg>
                                Back
                            </button>
                   
                </div>
            </div>

          

            <div className="card">
              <table className="table">
            <thead>
              <tr>
                <th className="left">Booking ID</th>
                <th className="left">Township / Plot</th>
                <th className="left">Client Name / Mobile</th>
                <th className="left">Booking Date</th>
                
              </tr>
            </thead>
            <tbody>
               
                 {reportData.length > 0 &&
                     (
                      reportData .map((b) => (
                        
                        <tr key={b.id}>
                          <td className="left"><span onClick={() => navigate(`/booking-summery-report/${b.id}`)}  style={{
                              cursor: "pointer",
                              color: "#2563eb",
                              fontWeight: "600",
                              textDecoration: "underline"
                            }}>{b.id}</span></td>
                          <td className="left">{b.townshipName} / {b.plotNo}</td>
                          <td>
                             {b.clientName && (
                            <div className='property-name'>
                              {b.clientName}
                            </div>
                          )}
                          <div className='property-details'>
                            {b.clientMobile || '-'}
                          </div>
                          </td>
                          <td>
                              {formatDisplayDate(b.bookingDate)}
                            </td>
                        </tr>
                      ))
                    )}
                     </tbody>
                </table>
            </div>

          
            
        </Wrapper> 
    );
};

export default DelayedBookings;
