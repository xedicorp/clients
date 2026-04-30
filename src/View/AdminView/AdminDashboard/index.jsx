import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Bell } from 'lucide-react';
import DashboardHeader from '../../../components/DashboardHeader';
import Notifications from '../../Property/Notifications';
import Wrapper from './style';

import axiosInstance from '../../../utilities/axiosInstance';
import API_ENDPOINTS from '../../../utilities/apiConfig';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faMoneyBillTrendUp,
    faChartLine,
    faBuilding,
    faGaugeHigh,
} from '@fortawesome/free-solid-svg-icons';
    const COLORS = ["#60a5fa", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];
 
const AdminDashboard = () => {
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState(null);
    const currentUsername =
        localStorage.getItem('userName') ||
        localStorage.getItem('userName') ||
        '';
    const [townshipList, setTownshipList] = useState([]);
    const [selectedTownshipId, setSelectedTownshipId] = useState(0);
    const currentRole = localStorage.getItem('spendwise_role') || '';

    const [loading, setLoading] = useState(false);
    const [collectionSummary, setCollectionSummary] = useState([]);
    const [showReminderPopup, setShowReminderPopup] = useState(false);

    const plotPieData = [
        { name: "Available", value: dashboardData?.availablePlotCount },
        { name: "Booked", value: dashboardData?.bookedPlotCount },
        { name: "Closed", value: dashboardData?.closedPlotCount },
        { name: "Rahan", value: dashboardData?.rahanPlotCount },
        { name: "Not Available", value: dashboardData?.notAvailablePlotCount }
  ];
    const plotBarData = [
        { name: "Loan", value: dashboardData?.loanPlotCount },
        { name: "Without Loan", value: dashboardData?.withoutLoanPlotCount },
        
  ];
    const handleTownshipChange = (e) => {
        const value = e.target.value;
 
      //  if (value === '') {
       //     setSelectedTownshipId(0);
      //  } else {
            setSelectedTownshipId(Number(value));
       // }
    };

    const fetchTownships = useCallback(async () => {
        try {
            
            const response = await axiosInstance.get(
                API_ENDPOINTS.TOWNSHIP_LIST
            );

            const raw = response?.data; 
            console.log('Raw township response:', raw);
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
          
        } catch (err) {
            toast.error('Failed to load townships');
        }
    }, []);
      
   
    const getUserId = () => {
        const stored =
            localStorage.getItem('userId') ||
            localStorage.getItem('spendwise_userId');
        const parsed = stored ? Number(stored) : NaN;
        return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
    };

    const fetchDashboardData = async (isInitial = false) => {
        try {
         
            let townshipId = selectedTownshipId;
            if(isInitial){
                      let lastSelectedTownship = localStorage.getItem('selected-township');        
                if (lastSelectedTownship && Number(lastSelectedTownship)>0) { 
                    setSelectedTownshipId( Number(lastSelectedTownship));  
                    townshipId=Number(lastSelectedTownship);                   
                }
            }
          

             if(townshipId>0){ 
            setLoading(true);
            localStorage.setItem('selected-township', townshipId);
            const userId = getUserId();
            const res = await axiosInstance.get(
                API_ENDPOINTS.DASHBOARD_GET_V1 +
                    '?userId=' +
                    getUserId() +
                    '&townshipId=' +
                    townshipId,
            );
            const data = res.data; 
            setDashboardData(data);
                setLoading(false);
         }} catch (err) {
                setLoading(false);
                setDashboardData(null);
        }
   
    };
    useEffect(() => {
        
        fetchTownships();   
        // let lastSelectedTownship = localStorage.getItem('selected-township');        
        // if (lastSelectedTownship && Number(lastSelectedTownship)>0) { 
        //     setSelectedTownshipId( Number(lastSelectedTownship)); 
            fetchDashboardData(true);
     //   }

    }, []);
 

    // useEffect(() => {
    //     const fetchData = async () => {
    //         setLoading(true);

    //         try {
    //             const res = await axiosInstance.get(
    //                 API_ENDPOINTS.TOWNSHIP_COLLECTION_SUMMARY +
    //                     '?userId=' +
    //                     getUserId(),
    //             );
    //             const raw = res.data || [];
    //             const normalized = raw.map((item) => {
    //                 const total = Number(item.totalCollection || 0);
    //                 const today = Number(item.todaysCollection || 0);
    //                 return {
    //                     id: item.id,
    //                     townshipName: item.townshipName || 'Unknown',
    //                     totalCollection: total,
    //                     todaysCollection: today,
    //                 };
    //             });

    //             setCollectionSummary(normalized);
    //         } catch (err) {
    //             toast.error('Unable to load dashboard data');
    //             setCollectionSummary([]);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //   //  fetchData();
    // }, []);

    const handleSearchClick = () => {
        setLoading(true);
        fetchDashboardData(false);
        setLoading(false);
    };

   
    /* ================= UI ================= */
 
    return (
        <Wrapper className="dashboard-container">
            <DashboardHeader
                title="Dashboard"
                subtitle={`Welcome back, ${currentUsername}!`}
                userInfo={{ username: currentUsername, role: currentRole }}
            />

            <div className="card">
                <div className="filters-section d-flex align-items-end gap-3">
                    <div className="dashboard-filter-group">
                        <label className="form-label">Township</label>
                        <select
                            value={selectedTownshipId || 0}
                            onChange={handleTownshipChange}
                            className="form-control"
                        >
                            <option value="0">Select Township</option>
                            {townshipList.map((township) => (
                                <option key={township.id} value={township.id}>
                                    {township.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="filter-group">
                        {/* <label></label> */}
                        <button
                            onClick={handleSearchClick}
                            className="primary-btn"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span>Searching...</span>
                                </>
                            ) : (
                                <>
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        width="20"
                                        height="20"
                                    >
                                        <circle cx="11" cy="11" r="8"></circle>
                                        <path d="m21 21-4.35-4.35"></path>
                                    </svg>
                                    <span className='d-lg-block d-none'>Search</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
            

            {!loading && (
                <>
             
                   <div className='row'>
                   <div className='col-lg-6'>
                     <div className="chart-card">
          <div className="chart-header">
            <h4>Bookings Overview</h4>
            <span className="chart-subtitle">Loan vs Without Loan</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={plotBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Count" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
            <div className="kpi-section">
                <KPI
                    title="Total Plots"
                    value={dashboardData?.totalPlotCount}
                />
                <KPI
                    title="Available"
                    value={dashboardData?.availablePlotCount}
                />
                <KPI title="Booked" value={dashboardData?.bookedPlotCount} />
                <KPI title="Closed" value={dashboardData?.closedPlotCount} />
                <KPI title="Rahan" value={dashboardData?.rahanPlotCount} />
                <KPI
                    title="Not Available"
                    value={dashboardData?.notAvailablePlotCount}
                />
            </div>
       

            </div>
               <div className='col-lg-6'>
               <div className="charts-grid">
                    <div className="chart-card">
                      <div className="chart-header">
                        <h4>Plots Distribution</h4>
                       
                      </div>
                      <div className="chart-container">
                        <ResponsiveContainer width="100%" height={280}>
                          <PieChart>
                            <Tooltip />
                            <Legend />
                            <Pie data={plotPieData} dataKey="value" nameKey="name" outerRadius={100} label>
                              {plotPieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
              <div className="kpi-section">
                <KPI title="Loan Plots" value={dashboardData?.loanPlotCount} />
                <KPI
                    title="Without Loan Plots"
                    value={dashboardData?.withoutLoanPlotCount}
                />
            </div>
            
                  
            </div></div>
            </div> 
           
            <div className="card">
                <div className="row">
                    <div className="col-lg-3 col-md-4">
                        <div className="dashboard-card bg-color2">
                            <div className="d-flex justify-content-between align-items-center mb-2 gap-2">
                                <h4 className="dashboard-card-title">
                                    Booked-Not Login (
                                    {
                                        dashboardData?.bookedSummary_Data
                                            ?.bookedCount
                                    }
                                    )
                                </h4>

                                <div onClick={() => navigate(`/admin/delayed-bookings/${selectedTownshipId}/booked`)}
                                    className="notif-item very-low"
                                    style={{ cursor: 'pointer' }}
                                >
                                    <Bell size={20} />
                                    <span className="notif-badge">{ dashboardData?.booked_DueCount}</span>
                                </div>
                              
                            </div>
                            <div className="info-line">
                                <span className="title"> ATS Amount:</span>
                                <span className="value">
                                    ₹{' '}
                                    {
                                        dashboardData?.bookedSummary_Data
                                            ?.receivable
                                    }
                                </span>
                            </div>
                            <div className="info-line">
                                <span className="title">Received:</span>
                                <span className="value">
                                    ₹{' '}
                                    {
                                        dashboardData?.bookedSummary_Data
                                            ?.received
                                    }
                                </span>
                            </div>
                            <div className="info-line">
                                <span className="title">Balance:</span>
                                <span className="value">
                                    ₹{' '}
                                    {dashboardData?.bookedSummary_Data?.balance}
                                </span>
                            </div>

                              <div style={{borderTop:"1px solid gray",padding:"10px", color:"black"}}>
                                    { dashboardData?.booked_User}                                    
                               </div>
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-4">
                        <div className="dashboard-card">
                            <div className="d-flex justify-content-between align-items-center mb-2 gap-2">
                                <h4 className="dashboard-card-title">
                                    Login (
                                    {
                                        dashboardData?.loginSummary_Data
                                            ?.loginCount
                                    }
                                    )
                                </h4>

                                <div onClick={() => navigate(`/admin/delayed-bookings/${selectedTownshipId}/login`)}
                                    className="notif-item very-low"
                                    style={{ cursor: 'pointer' }}
                                >
                                    <Bell size={20} />

                                    <span className="notif-badge">{dashboardData?.login_DueCount}</span>
                                </div>
                            </div>

                            {/* BODY */}
                            <div className="info-line">
                                <span className="title">ATS Amount:</span>
                                <span className="value">
                                    ₹{' '}
                                    {
                                        dashboardData?.loginSummary_Data
                                            ?.receivable
                                    }
                                </span>
                            </div>

                            <div className="info-line">
                                <span className="title">Received:</span>
                                <span className="value">
                                    ₹{' '}
                                    {dashboardData?.loginSummary_Data?.received}
                                </span>
                            </div>

                            <div className="info-line">
                                <span className="title">Balance:</span>
                                <span className="value">
                                    ₹{' '}
                                    {dashboardData?.loginSummary_Data?.balance}
                                </span>
                            </div>
                             <div style={{borderTop:"1px solid gray",padding:"10px", color:"black"}}>
                                    { dashboardData?.login_User}                                    
                               </div>
                        </div>
                    </div>
                    {/* Sancation */}
                    <div className="col-lg-3 col-md-4">
                        <div className="dashboard-card bg-color3">
                            <div className="d-flex justify-content-between align-items-center mb-2  gap-2">
                                <h4 className="dashboard-card-title">
                                    Sanction (
                                    {
                                        dashboardData?.sanctionSummary_Data
                                            ?.sanctionCount
                                    }
                                    )
                                </h4>

                                <div onClick={() => navigate(`/admin/delayed-bookings/${selectedTownshipId}/sanction`)}
                                    className="notif-item very-low"
                                    style={{ cursor: 'pointer' }}
                                >
                                    <Bell size={20} />

                                    <span className="notif-badge">{dashboardData?.sanction_DueCount}</span>
                                </div>
                            </div>
                            <div className="info-line">
                                <span className="title"> ATS Amount:</span>
                                <span className="value">
                                    ₹{' '}
                                    {
                                        dashboardData?.sanctionSummary_Data
                                            ?.receivable
                                    }
                                </span>
                            </div>
                            <div className="info-line">
                                <span className="title">Received:</span>
                                <span className="value">
                                    ₹{' '}
                                    {
                                        dashboardData?.sanctionSummary_Data
                                            ?.received
                                    }
                                </span>
                            </div>
                            <div className="info-line">
                                <span className="title">Balance:</span>
                                <span className="value">
                                    ₹{' '}
                                    {
                                        dashboardData?.sanctionSummary_Data
                                            ?.balance
                                    }
                                </span>
                            </div>
                             <div style={{borderTop:"1px solid gray",padding:"10px", color:"black"}}>
                                    { dashboardData?.sanction_User}                                    
                               </div>
                        </div>
                    </div>

                    {/* Dokit Signed */}
                     <div className="col-lg-3 col-md-4">
                        <div className="dashboard-card bg-color3">
                            <div className="d-flex justify-content-between align-items-center mb-2 gap-2">
                                <h4 className="dashboard-card-title">
                                    Dokit Signed (
                                    {
                                        dashboardData?.dokitSignedSummary_Data
                                            ?.dokitSignedCount
                                    }
                                    )
                                </h4>

                                <div onClick={() => navigate(`/admin/delayed-bookings/${selectedTownshipId}/dokitsigned`)}
                                    className="notif-item very-low"
                                    style={{ cursor: 'pointer' }}
                                >
                                    <Bell size={20} />

                                    <span className="notif-badge">{dashboardData?.dokitSigned_DueCount}</span>
                                </div>
                            </div>
                            <div className="info-line">
                                <span className="title"> ATS Amount:</span>
                                <span className="value">
                                    ₹{' '}
                                    {
                                        dashboardData?.dokitSignedSummary_Data
                                            ?.receivable
                                    }
                                </span>
                            </div>
                            <div className="info-line">
                                <span className="title">Received:</span>
                                <span className="value">
                                    ₹{' '}
                                    {
                                        dashboardData?.dokitSignedSummary_Data
                                            ?.received
                                    }
                                </span>
                            </div>
                            <div className="info-line">
                                <span className="title">Balance:</span>
                                <span className="value">
                                    ₹{' '}
                                    {
                                        dashboardData?.dokitSignedSummary_Data
                                            ?.balance
                                    }
                                </span>
                            </div>
                             <div style={{borderTop:"1px solid gray",padding:"10px", color:"black"}}>
                                    { dashboardData?.dokitSigned_User}                                    
                               </div>
                        </div>
                    </div> 
                    {/*DD Print */}
                    <div className="col-lg-3 col-md-4">
                        <div className="dashboard-card bg-color2">
                            <div className="d-flex justify-content-between align-items-center mb-2 gap-2">
                                <h4 className="dashboard-card-title">
                                    DD Print (
                                    {
                                        dashboardData?.ddPrintSummary_Data
                                            ?.ddPrintCount
                                    }
                                    )
                                </h4>

                                <div onClick={() => navigate(`/admin/delayed-bookings/${selectedTownshipId}/ddprint`)}
                                    className="notif-item very-low"
                                    style={{ cursor: 'pointer' }}
                                >
                                    <Bell size={20} />

                                    <span className="notif-badge">{dashboardData?.ddPrint_DueCount}</span>
                                </div>
                            </div>
                            <div className="info-line">
                                <span className="title"> ATS Amount:</span>
                                <span className="value">
                                    ₹{' '}
                                    {
                                        dashboardData?.ddPrintSummary_Data
                                            ?.receivable
                                    }
                                </span>
                            </div>
                            <div className="info-line">
                                <span className="title">Received:</span>
                                <span className="value">
                                    ₹{' '}
                                    {
                                        dashboardData?.ddPrintSummary_Data
                                            ?.received
                                    }
                                </span>
                            </div>
                            <div className="info-line">
                                <span className="title">Balance:</span>
                                <span className="value">
                                    ₹{' '}
                                    {
                                        dashboardData?.ddPrintSummary_Data
                                            ?.balance
                                    }
                                </span>
                            </div>
                              <div style={{borderTop:"1px solid gray",padding:"10px", color:"black"}}>
                                    { dashboardData?.ddPrint_User}                                    
                               </div>
                        </div>
                    </div>

 {/* JDA Patta Not Applied  */}
                     <div className="col-lg-3 col-md-4">
                        <div className="dashboard-card bg-color3">
                            <div className="d-flex justify-content-between align-items-center mb-2 gap-2">
                                <h4 className="dashboard-card-title">
                                    JDA Patta Not Applied (
                                    {
                                        dashboardData?.jdaNotAppliedSummary_Data
                                            ?.jdaNotAppliedCount
                                    }
                                    )
                                </h4>

                                <div onClick={() => navigate(`/admin/delayed-bookings/${selectedTownshipId}/jdanotapplied`)}
                                    className="notif-item very-low"
                                    style={{ cursor: 'pointer' }}
                                >
                                    <Bell size={20} />

                                    <span className="notif-badge">{dashboardData?.jdaNotApplied_DueCount}</span>
                                </div>
                            </div>
                            <div className="info-line">
                                <span className="title"> ATS Amount:</span>
                                <span className="value">
                                    ₹{' '}
                                    {
                                        dashboardData?.jdaNotAppliedSummary_Data
                                            ?.receivable
                                    }
                                </span>
                            </div>
                            <div className="info-line">
                                <span className="title">Received:</span>
                                <span className="value">
                                    ₹{' '}
                                    {
                                        dashboardData?.jdaNotAppliedSummary_Data
                                            ?.received
                                    }
                                </span>
                            </div>
                            <div className="info-line">
                                <span className="title">Balance:</span>
                                <span className="value">
                                    ₹{' '}
                                    {
                                        dashboardData?.jdaNotAppliedSummary_Data
                                            ?.balance
                                    }
                                </span>
                            </div>
                             <div style={{borderTop:"1px solid gray",padding:"10px", color:"black"}}>
                                    { dashboardData?.jdaNotApplied_User}                                    
                               </div>
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-4">
                        <div className="dashboard-card bg-color3">
                            <div className="d-flex justify-content-between align-items-center mb-2 gap-2">
                                <h4 className="dashboard-card-title">
                                    JDA Patta Applied (
                                    {
                                        dashboardData?.jdaAppliedSummary_Data
                                            ?.jdaAppliedCount
                                    }
                                    )
                                </h4>

                                <div onClick={() => navigate(`/admin/delayed-bookings/${selectedTownshipId}/jdaapplied`)}
                                    className="notif-item very-low"
                                    style={{ cursor: 'pointer' }}
                                >
                                    <Bell size={20} />

                                    <span className="notif-badge">{dashboardData?.jdaApplied_DueCount}</span>
                                </div>
                            </div>
                            <div className="info-line">
                                <span className="title"> ATS Amount:</span>
                                <span className="value">
                                    ₹{' '}
                                    {
                                        dashboardData?.jdaAppliedSummary_Data
                                            ?.receivable
                                    }
                                </span>
                            </div>
                            <div className="info-line">
                                <span className="title">Received:</span>
                                <span className="value">
                                    ₹{' '}
                                    {
                                        dashboardData?.jdaAppliedSummary_Data
                                            ?.received
                                    }
                                </span>
                            </div>
                            <div className="info-line">
                                <span className="title">Balance:</span>
                                <span className="value">
                                    ₹{' '}
                                    {
                                        dashboardData?.jdaAppliedSummary_Data
                                            ?.balance
                                    }
                                </span>
                            </div>
                             <div style={{borderTop:"1px solid gray",padding:"10px", color:"black"}}>
                                    { dashboardData?.jdaApplied_User}                                    
                               </div>
                        </div>
                    </div>
                 
                    <div className="col-lg-3 col-md-4">
                        <div className="dashboard-card bg-color2">
                            <div className="d-flex justify-content-between align-items-center mb-2 gap-2">
                                <h4 className="dashboard-card-title">
                                    JDA Patta Received (
                                    {
                                        dashboardData?.jdaReceivedSummary_Data
                                            ?.jdaReceivedCount
                                    }
                                    )
                                </h4>

                                <div  onClick={() => navigate(`/admin/delayed-bookings/${selectedTownshipId}/jdareceived`)}
                                    className="notif-item very-low"
                                    style={{ cursor: 'pointer' }}
                                >
                                    <Bell size={20} />

                                    <span className="notif-badge">{dashboardData?.jdaReceived_DueCount}</span>
                                </div>
                            </div>
                            <div className="info-line">
                                <span className="title"> ATS Amount:</span>
                                <span className="value">
                                    ₹{' '}
                                    {
                                        dashboardData?.jdaReceivedSummary_Data
                                            ?.receivable
                                    }
                                </span>
                            </div>
                            <div className="info-line">
                                <span className="title">Received:</span>
                                <span className="value">
                                    ₹{' '}
                                    {
                                        dashboardData?.jdaReceivedSummary_Data
                                            ?.received
                                    }
                                </span>
                            </div>
                            <div className="info-line">
                                <span className="title">Balance:</span>
                                <span className="value">
                                    ₹{' '}
                                    {
                                        dashboardData?.jdaReceivedSummary_Data
                                            ?.balance
                                    }{' '}
                                </span>
                            </div>
                             <div style={{borderTop:"1px solid gray",padding:"10px", color:"black"}}>
                                    { dashboardData?.jdaReceived_User}                                    
                               </div>
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-4">
                        <div className="dashboard-card bg-color4">
                            <div className="d-flex justify-content-between align-items-center mb-2 gap-2">
                                <h4 className="dashboard-card-title">
                                    DD Received (
                                    {
                                        dashboardData?.ddReceivedSummary_Data
                                            ?.ddReceivedCount
                                    }
                                    )
                                </h4>

                                <div   onClick={() => navigate(`/admin/delayed-bookings/${selectedTownshipId}/ddreceived`)}
                                    className="notif-item very-low"
                                    style={{ cursor: 'pointer' }}
                                >
                                    <Bell size={20} />

                                    <span className="notif-badge">{dashboardData?.ddReceived_DueCount}</span>
                                </div>
                            </div>
                            <div className="info-line">
                                <span className="title"> ATS Amount:</span>
                                <span className="value">
                                    ₹{' '}
                                    {
                                        dashboardData?.ddReceivedSummary_Data
                                            ?.receivable
                                    }
                                </span>
                            </div>
                            <div className="info-line">
                                <span className="title">Received:</span>
                                <span className="value">
                                    ₹{' '}
                                    {
                                        dashboardData?.ddReceivedSummary_Data
                                            ?.received
                                    }
                                </span>
                            </div>
                            <div className="info-line">
                                <span className="title">Balance:</span>
                                <span className="value">
                                    ₹{' '}
                                    {
                                        dashboardData?.ddReceivedSummary_Data
                                            ?.balance
                                    }
                                </span>
                            </div>
                             <div style={{borderTop:"1px solid gray",padding:"10px", color:"black"}}>
                                    { dashboardData?.ddReceived_User}                                    
                               </div>
                        </div>
                    </div>
                    <div className="col-lg-6 col-md-12">
                        <div className="dashboard-card collection-card">
                            <h4 className="dashboard-card-title">
                                 Collection Summary </h4>
                            <div className="table-responsive">
                                    <table className="table table-bordered">
                                       <tr>
                                        <td>
                                         A. ATS Amount: </td>
                                        <td>₹{' '}
                                            { dashboardData  ?.collectionReceivedSummary_Data  ?.receivable       }{' '}
                                            </td>
                                            <td></td>
                                        </tr> 
                                        <tr>
                                        <td>
                                        B. TDS Amount: </td>
                                        <td>₹{' '}
                                            { dashboardData  ?.collectionReceivedSummary_Data  ?.tds       }{' '}</td>
                                            <td></td>
                                        </tr> 
                                         <tr>
                                        <td>
                                        C. Net Receivable: </td>
                                        <td ><b className=''>
                                            ₹{' '}
                                            { dashboardData  ?.collectionReceivedSummary_Data  ?.receivable -  dashboardData  ?.collectionReceivedSummary_Data  ?.tds       }{' '}
                                         </b>   </td>
                                         <td>(A-B)</td>
                                        </tr> 
                                        <tr>
                                            <td>
                                            D. Received:</td>
                                            <td>₹{' '}
                                                { dashboardData  ?.collectionReceivedSummary_Data  ?.received       }{' '}</td>
                                        <td></td>
                                        </tr>
                                        <tr>
                                            <td>
                                            E. Excess Refund:</td>
                                            <td>₹{' '}
                                                { dashboardData  ?.collectionReceivedSummary_Data  ?.excessRefund       }{' '}</td>
                                        <td></td>
                                        </tr>
                                        <tr>
                                            <td>
                                            F. Net  Received:</td>
                                            <td><b>
                                                ₹{' '}
                                                { dashboardData  ?.collectionReceivedSummary_Data  ?.received  - dashboardData  ?.collectionReceivedSummary_Data  ?.excessRefund       }{' '}
                                          </b>   </td>
                                          <td>(D-E)</td>
                                        </tr>
                                         <tr>
                                            <td>
                                            G. Net Balance:</td>
                                            <td>
                                                <b>
                                                    ₹{' '}
                                                { dashboardData  ?.collectionReceivedSummary_Data  ?.balance       }{' '}
                                                </b>
                                            </td>
                                            <td>(C-F)</td>
                                        </tr>
                                         <tr>
                                            <td>
                                            H. Unverified Receipts:</td>
                                            <td>
                                            
                                                ₹{' '}
                                                { dashboardData  ?.collectionReceivedSummary_Data  ?.unverified       }{' '}
                                                
                                            </td>
                                            <td></td>
                                        </tr>
                                </table> 
                            </div>
                            
                            
                        </div>
                    </div>
                </div>
            </div>
            </>
            )}

            <div className="card">
                <div className="dashboard-table-header">
                    <h2 className="dashboard-table-title">
                    Most valued Associates
                </h2>
                </div>
                

                <div className="township-grid">
                    {dashboardData?.mostValuedAssociates?.length === 0 &&
                        !loading && <p>No data available</p>}
                        <div className="table-responsive">
                            <table className='table'>
                                <thead>
                                    <tr>
                            <th>Name</th>
                            <th>Contact No</th>
                            <th>Email</th>
                            <th>Plots Sold</th>
                            <th>Value</th>
                        </tr>
                                </thead>
                        
                        {dashboardData?.mostValuedAssociates?.map((t) => (
                            <tr className="township-card" key={t.id}>
                                <td>{t.name}</td>
                                <td>{t.contactNo}</td>
                                <td>{t.email}</td>
                                <td>{t.plotCount}</td>
                                <td>₹{t.totalValue}</td>
                                {/*                              
                            <button
                                onClick={() =>
                                    navigate(`/property/township-health/${t.id}`)
                                }
                            >
                               Detail
                            </button> */}
                            </tr>
                        ))}
                    </table>
                        </div>
                    
                </div>
            </div>

            {/* Reminder popup */}
            {showReminderPopup && (
                <div
                    className="reminder-list-overlay"
                    onClick={(e) =>
                        e.target.classList.contains('reminder-list-overlay') &&
                        setShowReminderPopup(false)
                    }
                >
                    <div className="reminder-list-popup">
                        <Notifications
                            isPopup
                            onClose={() => setShowReminderPopup(false)}
                        />
                    </div>
                </div>
            )}

            <ToastContainer
                position="top-right"
                autoClose={2500}
                theme="dark"
            />
        </Wrapper>
    );
};

/* ================= SMALL KPI COMPONENT ================= */

const KPI = ({ icon, title, value }) => (
    <div className="kpi-card">
        <div className="kpi-icon">
            <FontAwesomeIcon icon={icon} />
        </div>
        <div>
            <div className="kpi-title">{title}</div>
            <div className="kpi-value">{value}</div>
        </div>
    </div>
);

export default AdminDashboard;
