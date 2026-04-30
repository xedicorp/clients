import { useState, useEffect } from "react";
 import { Link } from 'react-router-dom';
 import BookingWrapper from "../Property/style";
import PropertyNavigation from "../Property/PropertyNavigation";
import ReminderButton from "../../components/ReminderButton";
import ReminderPopup from "../../components/ReminderPopup";
import axiosInstance from "../../utilities/axiosInstance";
import API_ENDPOINTS from "../../utilities/apiConfig";
import { determineWorkflowCode } from "../../utilities/workflowUtils";
 
import { useNavigate, useSearchParams , useParams} from "react-router-dom";
export default function NotificationList() {
    const navigate = useNavigate();
    const [notificationData, setNotificationData] = useState([]);
    const [loading, setLoading] = useState(false);
    const { priority } = useParams(); 
    const [showReminderPopup, setShowReminderPopup] = useState(false);
    const [notifPriority, setNotifPriority] = useState(0);
    
      useEffect(() => {
        //setNotifPriority(priority);
        fetchNotifications();
        }, [priority]);

            const getUserId = () => {
        const stored = localStorage.getItem("userId") || localStorage.getItem("spendwise_userId");
        const parsed = stored ? Number(stored) : NaN;
        return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
      };
   

        const fetchNotifications = async () => { 
             const userId = getUserId();
            setLoading(true);
            try {
              
                setNotificationData([]);
                const response = await axiosInstance.get(API_ENDPOINTS.NOTIFICATION_LIST + "?priority=" + priority + "&userId=" + userId);
                const data = Array.isArray(response.data) ? response.data : (response.data?.value || []);
                setNotificationData(data); 
            } catch (error) {

                setNotificationData([]);
            } finally {
                setLoading(false);
            }
        };
    // useEffect(() => { 
       
        
        
    //     fetchNotifications();
    // }, []);

  
   
       const handleNoActionRequired= async (id)=>{
Swal.fire({
      title: "Are you sure, no action required?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Delete"
    }).then((result) => {
      if (result.isConfirmed) {
         
            setLoading(true);
            try {
                let payload={
                    "NotificationId":id,
                    "ActionType":1
                }
                const response =   axiosInstance.post(API_ENDPOINTS.NOTIFICATION_TAKE_ACTION ,payload);
                 Swal.fire(response);
                fetchNotifications();
            } catch (error) {

               
            } finally {
                setLoading(false);
            }
       
      }
    });
            
         }
    return (
        <BookingWrapper className="dashboard-container">
            <div className="dashboard-header">
                <div className="dashboard-header-content">
                    <div>
                        <h1 className="dashboard-title">Notifications</h1>
                        <p className="dashboard-subtitle">Here is list of notifications</p>
                    </div>
                </div>
                <div className="dashboard-header-actions">
                    <button
            className="primary-btn"
            onClick={() => navigate('/admin-dashboard')}
          >
            Dashboard
          </button>
                   <button className="primary-btn">
                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-15"></path><polyline points="7,10 12,15 17,10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    Download Excel</button>
                </div>
            </div>

            <div className="card">
                <div className="dashboard-table-header">
                   
                     
                </div>

                <div className="table-wrapper">
                    {loading ? (
                        <div className="loading-state">
                            <p>Loading notifications...</p>
                        </div>
                    ) : (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th className="left">Id#</th>
                                    <th className="left">Booking Id#</th>
                                     <th className="left">Notification Text</th>  
                                     <th>Type</th>                                 
                                  {priority==3 && (
                                   <th>Actions</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {notificationData.length > 0 ? (
                                    notificationData.map((data, index) => {
                                        const id = data?.id ?? data?.bookingId ?? data?.BookingId;

                                        return (
                                            <tr key={id ?? `booking-row-${index}`}>
                                                <td className="booking-id-cell">
                                                     {data.id} 
                                                
                                                </td>
                                                  <td> 
                                                    <Link to={`/booking-summery-report/${data.bookingId}`}>{data.bookingId}</Link>

                                                  </td>
                                                <td>{data.notificationText || 'N/A'}</td>
                                                <td>{data.notificationType || 'N/A'}</td>
                                              
                                                
                                                <td> 
                                                    {priority==3 && (
                                                       <div className="d-flex gap-2">
                                                          <button 
                                                          onClick={() => {
                                                            const wfCode = determineWorkflowCode(data);

                                                            if (wfCode) {
                                                                try {
                                                                localStorage.setItem("current_workflow_code", wfCode);
                                                                window.dispatchEvent(new Event("stepChanged"));
                                                                } catch {}
                                                            }

                                                            navigate(`/booking-summery-report/${data.bookingId}`);
                                                            }}
                                                                className="primary-btn"  >
                                                                        Take Action
                                                        </button>
                                                          <button 
                                                          onClick={()=>handleNoActionRequired(`${data.id}`)}
                                                                className="primary-btn"  >
                                                                        No Action Required
                                                        </button>
                                                        </div>

                                                    )}

                                                </td>
                                                
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="no-data">
                                            <p>No notifications found matching your search</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Reminder Popup */}
            <ReminderPopup 
              isOpen={showReminderPopup}
              onClose={() => setShowReminderPopup(false)}
              title="Create Reminder"
            //   bookingId={selectedBookingId}
            />


             
        </BookingWrapper>
    );
}
