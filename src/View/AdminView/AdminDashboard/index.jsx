import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Bell } from 'lucide-react';
import DashboardHeader from '../../../components/DashboardHeader';
 
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

             
            <ToastContainer
                position="top-right"
                autoClose={2500}
                theme="dark"
            />
        </Wrapper>
    );
};

 
export default AdminDashboard;
