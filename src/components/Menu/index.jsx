// Menu/index.jsx (Permission-based filtering)
import { useEffect, useState } from "react";
import {
    FaCheckCircle,
    FaClipboardCheck,
    FaClipboardList,
    FaCog,
    FaCoins,
    FaFileContract,
    FaFileInvoiceDollar,
    FaFileSignature,
    FaFileUpload,
    FaWallet,
    FaHome,
    FaMapMarkedAlt,
    FaMoneyBillWave,
    FaMoneyCheck,
    FaUniversity,
    FaSlidersH ,
    FaUserTie,
    FaTachometerAlt, 
    FaClock,              
    FaPauseCircle,
    FaPlusCircle,
    FaBell,
    FaCity,
    FaUsers,
    FaHandshake,
    FaChartBar,
    FaUndoAlt,
    FaUserCog,
    FaUserShield,         
    FaTasks, 
    FaChevronDown ,
    FaFileAlt ,
    FaPiggyBank ,
    FaFolderOpen ,
    FaBuilding,
    FaProjectDiagram ,
    FaUserFriends ,
    FaTimesCircle ,
    FaMoneyCheckAlt 
} from "react-icons/fa";
import { FaPeopleGroup, FaUserSecret } from "react-icons/fa6";
import logo from "../../assets/img/logo-bg.png";
import { useLocation, useNavigate } from "react-router-dom";

import { getUserPermissions } from "../../utilities/menuPermissions";
import { Wrapper } from "./style";
import hasPermission from "../../utilities/HasPermission";
import { PERMISSIONS } from "../../utilities/HasPermission";
import axiosInstance from '../../utilities/axiosInstance';
import API_ENDPOINTS from '../../utilities/apiConfig';
const STORAGE_KEY = "property_bookings_v1";

const Menu = ({ collapsed, setShowReminderPopup }) => {
    const [dashboardData, setDashboardData] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();
    const pathname = location.pathname.replace(/\/+$/, "");
    const [currentBookingId, setCurrentBookingId] = useState(null);
    const [workflowCode, setWorkflowCode] = useState(null);
    const [userPermissions, setUserPermissions] = useState({});
    const [openNotification, setOpenNotification] = useState(false);
    const [openMaster, setOpenMaster] = useState(false);
      const [openSupport, setOpenSupport] = useState(false);
     const [openAccounts, setOpenAccounts] = useState(false);
        const [openHR, setOpenHR] = useState(false);
    const [openAdministration, setOpenAdministration] = useState(false);
    const [loading, setLoading] = useState(false);
     const [notificationCount, setNotificationCount] = useState(false);
      const [openAssociate, setOpenAssociate] = useState(false);
    useEffect(() => {
        // Load user permissions
        const permissions = getUserPermissions();
        setUserPermissions(permissions);
        
        // Listen for permission updates
        const handlePermissionsUpdate = () => {
            const updatedPermissions = getUserPermissions();
            setUserPermissions(updatedPermissions);
           
        };

        window.addEventListener('permissionsUpdated', handlePermissionsUpdate);

        return () => {
            window.removeEventListener('permissionsUpdated', handlePermissionsUpdate);
        };
    }, []);

    const getUserId = () => {
        const stored = localStorage.getItem("userId") || localStorage.getItem("spendwise_userId");
        const parsed = stored ? Number(stored) : NaN;
        return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
      };
    useEffect(() => {
         const userId = getUserId();
         
            const fetchDashboardData = async () => {
 
                setLoading(true);
            try {
                const response = await axiosInstance.get(API_ENDPOINTS.DASHBOARD_GET + "?userId=" + userId);
                  
                setDashboardData(response.data); 
                setNotificationCount(   ( dashboardData?.notificationCount?.veryLowPriority || 0 )+
                    (  dashboardData?.notificationCount?.lowPriority || 0  ) +
                    (dashboardData?.notificationCount?.mediumPriority || 0) +
                    (dashboardData?.notificationCount?.highPriority || 0) )

            } catch (error) {

                setDashboardData([]);
            } finally {
                setLoading(false);
            }

        }
        // Extract booking ID from URL if present
        const extractBookingId = () => {
            const pathParts = location.pathname.split('/');
            // Check if URL has pattern like /property/something/:id
            if (pathParts.length >= 3 && pathParts[1] === 'property') {
                const lastPart = pathParts[pathParts.length - 1];
                if (lastPart && lastPart !== '') {
                    setCurrentBookingId(lastPart);
                } else {
                    setCurrentBookingId(null);
                }
            }
        };

            fetchDashboardData();
        extractBookingId();

        // Listen for step changes
        const handleStepChange = () => {
            const wf = localStorage.getItem("current_workflow_code");
            setWorkflowCode(wf ? wf.toUpperCase() : null);
        };



        window.addEventListener('stepChanged', handleStepChange);

        return () => {
            window.removeEventListener('stepChanged', handleStepChange);
        };

      

    }, [location.pathname]);

    useEffect(() => {
        if (!currentBookingId) return;
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return;
            const list = JSON.parse(raw);
            if (!Array.isArray(list)) return;
            const match = list.find(b => String(b.id) === String(currentBookingId));
            const wf = (match?.workflowCode || match?.workflowType || "").toString().trim().toUpperCase();
            if (wf) {
                setWorkflowCode(wf);
            }
        } catch { }
    }, [currentBookingId]);

    useEffect(() => {
        const loadWorkflow = () => {
            const wf = localStorage.getItem("current_workflow_code");
            setWorkflowCode(wf ? wf.toUpperCase() : null);
        };

        loadWorkflow();
        window.addEventListener("stepChanged", loadWorkflow);

        return () => window.removeEventListener("stepChanged", loadWorkflow);
    }, []);





    const role =
        typeof window !== "undefined"
            ? localStorage.getItem("spendwise_role")?.trim().toLowerCase()
            : null;

    const username = (localStorage.getItem("userName") || "").toLowerCase();
 
 
 

    const isActive = (path) => location.pathname.startsWith(path);

    const handleNavigation = (path) => { 
        let finalPath = path; 
        navigate(finalPath);
        if (window.innerWidth <= 1024) {
          //  setMenuOpen(false);
        }
    };
 

    // Hide menu on admin dashboard, booking list, new booking, reports, and booking summary
    const isOnAdminDashboard = location.pathname === '/admin';
    
    
    
    return (
        <Wrapper className={`sidebar ${collapsed ? "collapsed" : ""}`}>

           <div className="brand-logo">
                <img
                    src={localStorage.getItem("logo2Url")}
                    alt={localStorage.getItem("companyName")} 
                    className="logo-img"
                />
            </div>



            <div className="nav">
                <div
                    className={`nav-item${isActive("/admin") ? " active" : ""}`}
                    onClick={() => handleNavigation("/admin")}
                >
                    <div className="icon" ><FaTachometerAlt /></div>
                    <span>Dashboard</span>
                </div> 
                    
                    

                    <>
                <div className="nav-item"   onClick={() => navigate("/support/ticket-list")}>
                    <div className="icon">
                        <FaCog />
                    </div>

                    <span>Tickets List</span>

                    
              
               </div>
               <div className="nav-item"   onClick={() => navigate("/support/create-ticket")}>
                    <div className="icon">
                        <FaCog />
                    </div> 
                    <span>Manage Tickets</span> 
              
               </div>
                <div className="nav-item"   onClick={() => navigate("/support/create-ticket")}>
                    <div className="icon">
                        <FaCog />
                    </div> 
                    <span>Clients</span> 
              
               </div>
                </>
                
                
            </div>



        </Wrapper>
    );
};

export default Menu;
