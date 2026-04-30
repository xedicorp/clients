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
 

    const adminRoles = new Set([
        "admin",
        "superadmin",
        "loan_admin",
        "loan_manager",
        "loan_operator_t1",
        "loan_operator_t2",
        "accountant"
    ]);

    const isAdminLikeRole = adminRoles.has(role);
    const isJDAFileAdmin = role === "jda_file_admin";

    const isActive = (path) => location.pathname.startsWith(path);

    const handleNavigation = (path) => {
        // If path requires booking ID and we have one, append it
        const pathsRequiringId = [
            '/property/payment',
            '/property/login-status',
            '/property/agreement-draft',
            '/property/loan-document',
            '/property/loan-sanction',
            '/property/ocr-payment',
            '/property/receipt-list',
            '/property/upload-atts',
            '/property/dokit-signing',
            '/property/bank-dd',
            '/property/jda-patta',
            '/property/agreement-registry',
            '/property/dd-update',
        ];

        let finalPath = path;

        // If path requires booking ID but we don't have one, redirect to booking list
        if (pathsRequiringId.includes(path)) {
            if (!currentBookingId) {
                alert('Please select a booking first from the booking list.');
                navigate('/property');
                if (window.innerWidth <= 1024) {
                   // setMenuOpen(false);
                }
                return;
            }
            finalPath = `${path}/${currentBookingId}`;
        }

        navigate(finalPath);
        if (window.innerWidth <= 1024) {
          //  setMenuOpen(false);
        }
    };

    // Pages where menu should be visible when stage > 0
    const allowedPages = [
        '/property',
        '/property/new',
        '/property/reports',
        '/supplier-list'
    ];

    // Show menu always (removed bookingCount condition)
    const shouldShowMenu = true; // Always show menu for admin

    // Define all menu items with their step index (based on WITH_LOAN workflow)
    const adminMenuItems = [
        { path: "/property/payment", icon: FaMoneyBillWave, label: "Update Initial Payment", color: '#22c55e', stepIndex: 0, permission: "Update Initial Payment" },
        { path: "/property/loan-document", icon: FaFileUpload, label: "Upload Document", color: '#3b82f6', stepIndex: 1, permission: "Upload Loan Document" },
        { path: "/property/agreement-draft", icon: FaFileContract, label: "Agreement Draft Status", color: '#f59e0b', stepIndex: 1, permission: "Agreement Draft Status" },
        { path: "/property/login-status", icon: FaCheckCircle, label: "Update Login Status", color: '#a855f7', stepIndex: 0, permission: "Update Login Status" },
      //  { path: "/property/loan-sanction", icon: FaUniversity, label: "Loan Sanction Status", color: '#ef4444', stepIndex: 2, permission: "Loan Sanction Status" },
        { path: "/property/receipt-list", icon: FaCoins, label: "Receipt Payment Update", color: '#10b981', stepIndex: 3, permission: "Receipt Payment Update" },
        { path: "/property/file-check", icon: FaClipboardCheck, label: "Mark File Check", color: '#14b8a6', stepIndex: 12, permission: "Mark File Check" },
        { path: "/property/upload-atts", icon: FaClipboardList, label: "Upload Original ATTs", color: '#06b6d4', stepIndex: 5, permission: "Upload Original ATTs" },
        { path: "/property/dokit-signing", icon: FaFileSignature, label: "Dokit Signing", color: '#8b5cf6', stepIndex: 6, permission: "Dokit Signing" },
        { path: "/property/bank-dd", icon: FaFileInvoiceDollar, label: "Upload Bank DD", color: '#f97316', stepIndex: 7, permission: "Upload Bank DD" },
        { path: "/property/jda-patta", icon: FaMapMarkedAlt, label: "JDA Patta Update", color: '#ec4899', stepIndex: 8, permission: "JDA Patta Update" },
        { path: "/property/dd-update", icon: FaMoneyCheck, label: "Bank DD Update", color: '#f43f5e', stepIndex: 11, permission: "Bank DD Update" },
    ];

    // loan-only steps for non-loan workflows
    const loanOnlyPaths = new Set([
        "/property/login-status",
        "/property/loan-sanction",
        "/property/bank-dd",
        "/property/dd-update"
    ]);

    const nonLoanAllowedPaths = new Set([
        "/property/payment",
        "/property/loan-document",
        "/property/agreement-draft",
        "/property/upload-atts",
        "/property/jda-patta"
    ]);

    const getFilteredMenuItems = () => {

        // 1️⃣ Filter by permissions
        const permissionFilteredItems = adminMenuItems.filter(item => {
            if (!item.permission) return true;

            const hasPermission = userPermissions[item.permission] === true;

            return hasPermission;
        });

       

        const workflowMenuConfig = {
            WITH_LOAN: {
                items: permissionFilteredItems.length > 0 ? permissionFilteredItems : adminMenuItems,
                description: "WITH_LOAN menu"
            },
            WITHOUT_LOAN: {
                items: adminMenuItems.filter(item =>
                    nonLoanAllowedPaths.has(item.path)
                ),
                description: "WITHOUT_LOAN limited menu"
            },
            WITHOUT_7DAY_CLOSED: {
                items: adminMenuItems.filter(item =>
                    nonLoanAllowedPaths.has(item.path)
                ),
                description: "WITHOUT_7DAY_CLOSED limited menu"
            },
            AGREEMENT_REGISTRY_PROCESS: {
                items: permissionFilteredItems.filter(item =>
                    [
                        "/property/agreement-draft",
                        "/property/upload-atts",
                        "/property/dokit-signing",
                        "/property/jda-patta",
                        "/property/file-check"
                    ].includes(item.path)
                ),
                description: "AGREEMENT_REGISTRY_PROCESS menu"
            },
            default: {
                items: permissionFilteredItems,
                description: "Default menu"
            }
        };

        const config = workflowMenuConfig[workflowCode] || workflowMenuConfig.default;

        return config.items;
    };


    // Hide menu on admin dashboard, booking list, new booking, reports, and booking summary
    const isOnAdminDashboard = location.pathname === '/admin';
    const isOnBookingList = location.pathname === '/property'
    const isOnNewBooking = location.pathname === '/property/new';
    const isOnReports = location.pathname === '/property/reports';
    const isOnBookingSummary = location.pathname.includes('/property/summary/');
    const isOnFollowUp = location.pathname.includes('/property/follow-up/');
    const isNotifications = location.pathname === '/property/notifications';
    const isTownshipList = location.pathname === '/property/township-list';
    let displayMenuItems = getFilteredMenuItems();

    // Only apply follow-up hiding for non-WITH_LOAN workflows
    if (workflowCode !== "WITH_LOAN" && isOnFollowUp) {
        const itemsToHideOnFollowUp = [

            "Agreement Draft Status",
            "Update Login Status",
           // "Loan Sanction Status",
            "Receipt Payment Update",
            "Mark File Check",
            "Upload Original ATTs",
            "Dokit Signing",
            "Upload Bank DD"
        ];
        displayMenuItems = displayMenuItems.filter(item => !itemsToHideOnFollowUp.includes(item.label));
    }

    // Menu should only hide on admin dashboard (optional)
    // if (isOnAdminDashboard) {
    //     return null;
    // }


    // Also hide menu on booking dashboard for all workflows to ensure it's completely hidden



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

                

                <div
                    className={`nav-item${pathname === "/property" ? " active" : ""}`}
                    onClick={() => handleNavigation("/property")}
                >
                    <div className="icon" ><FaClipboardList /></div>
                    <span>Booking List</span>
                </div>
                  {hasPermission(PERMISSIONS.CAN_CREATE_BOOKING) && (
                <div
                    className={`nav-item${isActive("/property/new") ? " active" : ""}`}
                    onClick={() => handleNavigation("/property/new")}
                >
                    <div className="icon" ><FaPlusCircle /></div>
                    <span>New Booking</span>
                </div>
                  )}

                 
                <div
                    className={`nav-item${pathname === "/property/hold-report-booking" ? " active" : ""}`}
                    onClick={() => handleNavigation("/property/hold-report-booking")}
                >
                    <div className="icon" ><FaClock /></div>
                    <span>Hold Booking List</span>
                </div>
                 
                  {hasPermission(PERMISSIONS.CAN_HOLD_BOOKING) && (
                <div
                    className={`nav-item${pathname === "/property/hold-booking" ? " active" : ""}`}
                    onClick={() => handleNavigation("/property/hold-booking")}
                >
                    <div className="icon" ><FaPauseCircle /></div>
                    <span>Hold Booking  </span>
                </div>
                  )}
                  <div
                    className={`nav-item${pathname === "/property/client-list" ? " active" : ""}`}
                    onClick={() => handleNavigation("/property/client-list")}
                >
                    <div className="icon" ><FaUsers /></div>
                    <span>Client List</span>
                </div>

                <div
  className="nav-item"
  onClick={() => setOpenAssociate(prev => !prev)}
>
  <div className="icon"><FaUserFriends  /></div>
  <span>Associate Requests</span>
  <div className={`arrow ${openAssociate ? "rotate" : ""}`}>
    <FaChevronDown />
  </div>
</div>

<div className={`sub-menu ${openAssociate ? "open" : ""}`}>

  {/* <div
    className={`nav-item sub-item ${
      pathname === "/associate/associate-booking-requests" ? "active" : ""
    }`}
    onClick={() => handleNavigation("/associate/associate-booking-requests")}
  >
    <span>Booking Requests</span>
  </div> */}

  <div
    className={`nav-item sub-item ${
      pathname === "/associate/associate-document-verify" ? "active" : ""
    }`}
    onClick={() => handleNavigation("/associate/associate-document-verify")}
  >
    <div className="icon"><FaFileAlt /></div>
    <span>Documents Verify Request</span>
  </div>

</div>
                 
                  {/* {hasPermission(PERMISSIONS.CAN_HOLD_BOOKING) && (
                <div
                    className={`nav-item${pathname === "/property/associate-booking" ? " active" : ""}`}
                    onClick={() => handleNavigation("/property/associate-booking")}
                >
                    <div className="icon" ><FaPauseCircle /></div>
                    <span>Associate Booking  </span>
                </div>
                  )} */}


                
                {/* <div className="nav-item" onClick={() => setOpenNotification(prev => !prev)}>
                    <div className="icon">
                        <FaBell />
                        <span className="notification-badge">{notificationCount||0}</span>
                    </div>

                    <span>Notifications</span>

                    <div className={`arrow ${openNotification ? "rotate" : ""}`}>
                        <FaChevronDown />
                    </div>
                </div>

                
                <div className={`sub-menu ${openNotification ? "open" : ""}`}>
                     <div className="nav-item sub-item"
                     onClick={() => navigate('/notification/list/4')} >
                        <span>Very Low Priority</span>
                        
                        <span className="subnotification-badge small">{dashboardData?.notificationCount?.veryLowPriority || 0}</span>
                    </div>
                    <div className="nav-item sub-item"
                     onClick={() => navigate('/notification/list/3')} >
                        <span>Low Priority</span>
                        
                        <span className="subnotification-badge small">{dashboardData?.notificationCount?.lowPriority || 0}</span>
                    </div>

                    <div className="nav-item sub-item"
                     onClick={() => navigate('/notification/list/2')} >
                       <span>Medium Priority</span> 
                        <span className="subnotification-badge small">{dashboardData?.notificationCount?.mediumPriority || 0}</span>
                    </div>

                    <div className="nav-item sub-item"
                    onClick={() => navigate('/notification/list/1')} 
                    >
                       <span>High Priority</span> 
                        <span className="subnotification-badge small">{dashboardData?.notificationCount?.highPriority || 0}</span>
                    </div>
                </div>

                 */}

                {/* {hasPermission(PERMISSIONS.CAN_RECEIVE_PAYMENT) && (
                    <div
                        className={`nav-item${isActive("/property/payment-entry") ? " active" : ""}`}
                        onClick={() => handleNavigation("/property/payment-entry")}
                    >
                        <div className="icon"><FaMoneyBillWave /></div>
                        <span>Payment Entry</span>
                    </div>
                )} */}
                   
                {hasPermission(PERMISSIONS.CAN_MANAGE_MASTERS) && (
                    <>
                <div className="nav-item" onClick={() => setOpenMaster(prev => !prev)}>
                    <div className="icon">
                        <FaSlidersH  />
                    </div>

                    <span>Master</span>

                    <div className={`arrow ${openMaster ? "rotate" : ""}`}>
                        <FaChevronDown />
                    </div>
              
               </div>
                {/* Sub Menu */}
                <div className={`sub-menu ${openMaster ? "open" : ""}`}>
                    <div 
                        className="nav-item sub-item"
                        onClick={() => navigate("/master/reserve-funds")}
                    >
                        <div className="icon"><FaPiggyBank  /></div>
                        <span>Reserve Funds</span>
                    </div>
                </div>  
                 <div className={`sub-menu ${openMaster ? "open" : ""}`}>
                    <div 
                        className="nav-item sub-item"
                        onClick={() => navigate("/master/document-types")}
                    >
                        <div className="icon"><FaFolderOpen /></div>
                        <span>Document Types</span>
                    </div>
                </div>  
                  <div className={`sub-menu ${openMaster ? "open" : ""}`}>
                    <div 
                        className="nav-item sub-item"
                        onClick={() => navigate("/master/banks")}
                    >
                        <div className="icon"><FaBuilding /></div>

                        <span>Banks</span>
                    </div>
                </div>  
                </>
                )}
                 {hasPermission(PERMISSIONS.CAN_MANAGE_ACCOUNTS) && (
                    <>
                <div className="nav-item" onClick={() => setOpenAccounts(prev => !prev)}>
                    <div className="icon">
                        <FaWallet />
                    </div>

                    <span>Accounts</span>

                    <div className={`arrow ${openAccounts ? "rotate" : ""}`}>
                        <FaChevronDown />
                    </div>
              
               </div>
                {/* Sub Menu */}
                
                <div className={`sub-menu ${openAccounts ? "open" : ""}`}>
                   
                    <div
                        className={`nav-item sub-item${isActive("/accounts/heads") ? " active" : ""}`}
                        onClick={() => handleNavigation("/accounts/heads")}
                    >
                        <div className="icon"><FaMoneyBillWave /></div>
                        <span>Heads</span>
                    </div>
                      {hasPermission(PERMISSIONS.CAN_RECEIVE_PAYMENT) && (
                    <div
                        className={`nav-item sub-item${isActive("/property/payment-entry") ? " active" : ""}`}
                        onClick={() => handleNavigation("/property/payment-entry")}
                    >
                        <div className="icon"><FaMoneyBillWave /></div>
                        <span>Receipt Entry</span>
                    </div>
                    )}

                     {hasPermission(PERMISSIONS.CAN_RECEIVE_PAYMENT) && (
                    <div
                        className={`nav-item sub-item${isActive("accounts/tds-entry") ? " active" : ""}`}
                        onClick={() => handleNavigation("accounts/tds-entry")}
                    >
                        <div className="icon"><FaMoneyBillWave /></div>
                        <span>TDS Entry</span>
                    </div>
                    )}
                     <div
                        className={`nav-item sub-item${isActive("accounts/payment-entry") ? " active" : ""}`}
                        onClick={() => handleNavigation("accounts/payment-entry")}
                    >
                        <div className="icon"><FaMoneyBillWave /></div>
                        <span>Misc Transaction Entry</span>
                    </div>
                    <div
                        className={`nav-item sub-item${isActive("accounts/daily-balance-update") ? " active" : ""}`}
                        onClick={() => handleNavigation("accounts/daily-balance-update")}
                    >
                        <div className="icon"><FaMoneyBillWave /></div>
                        <span>Daily Balance Update</span>
                    </div>
                </div>  
                   
                </>
                )}
                  
                

                    <div className="nav-item" onClick={() => setOpenHR(prev => !prev)}>
                    <div className="icon">
                        <FaCog />
                    </div>

                    <span>HR</span>

                    <div className={`arrow ${openHR ? "rotate" : ""}`}>
                        <FaChevronDown />
                    </div>
                </div>

                {/* Sub Menu */}
                <div className={`sub-menu ${openHR ? "open" : ""}`}>
                      {hasPermission(PERMISSIONS.CAN_MANAGE_STAFF) && (
                    <div
                    className={`nav-item sub-item${isActive("/staff-list") ? " active" : ""}`}
                    onClick={() => handleNavigation("/staff-list")}
                >
                   <div className="icon"><FaUserTie /></div>
                    <span>Employees</span>
                    </div>)}

                  
                 
                
                 
                
                 
                </div>

                    <div className="nav-item" onClick={() => setOpenAdministration(prev => !prev)}>
                    <div className="icon">
                        <FaCog />
                    </div>

                    <span>Administration</span>

                    <div className={`arrow ${openAdministration ? "rotate" : ""}`}>
                        <FaChevronDown />
                    </div>
                </div>

                {/* Sub Menu */}
                <div className={`sub-menu ${openAdministration ? "open" : ""}`}>
                      {hasPermission(PERMISSIONS.CAN_MANAGE_TOWNSHIPS) && (
                    <div
                    className={`nav-item sub-item${isActive("/property/township-list") ? " active" : ""}`}
                    onClick={() => handleNavigation("/property/township-list")}
                >
                    <div className="icon"><FaCity /></div>
                    <span>Township Management</span>
                    </div>)}

                  {hasPermission(PERMISSIONS.CAN_MANAGE_USERS) && (
                     <div
                    className={`nav-item sub-item${isActive("/admin-user-list") ? " active" : ""}`}
                    onClick={() => handleNavigation("/admin-user-list")}>

                    <div className="icon" ><FaUserCog /></div>
                    <span>Users</span>
                </div>)}
                {hasPermission(PERMISSIONS.CAN_MANAGE_ROLE_PERMISSIONS) && (
                <div
                    className={`nav-item sub-item${isActive("/role-permissions") ? " active" : ""}`}
                    onClick={() => handleNavigation("/role-permissions")}>

                    <div className="icon" ><FaUserShield /></div>
                    <span>Roles Permissions</span>
                </div>
                )}
                
                <div
                    className={`nav-item sub-item${isActive("/admin/process-stage") ? " active" : ""}`}
                    onClick={() => handleNavigation("/admin/process-stage")}>

                    <div className="icon" ><FaProjectDiagram  /></div>
                    <span>Process Stage Setup</span>
                </div>
                   <div
                    className={`nav-item sub-item${isActive("/administration/template-list") ? " active" : ""}`}
                    onClick={() => handleNavigation("/administration/template-list")}>

                    <div className="icon" ><FaProjectDiagram  /></div>
                    <span>Templates</span>
                </div>
                
                 {hasPermission(PERMISSIONS.CAN_VIEW_SETTINGS) && (

                <div
                    className={`nav-item sub-item${isActive("/settings") ? " active" : ""}`}
                    onClick={() => handleNavigation("/settings")}>

                    <div className="icon" ><FaCog /></div>
                    <span>Settings</span>
                </div>
                 )}

                 <div
                    className={`nav-item sub-item${isActive("/administration/backup-restore") ? " active" : ""}`}
                    onClick={() => handleNavigation("/administration/backup-restore")}>

                    <div className="icon" ><FaCog  /></div>
                    <span>Back & Restore</span>
                </div>
                </div>
                
                

                   
                       {hasPermission(PERMISSIONS.CAN_MANAGE_TEAMS) && (
                <div
                    className={`nav-item${isActive("/team-list") ? " active" : ""}`}
                    onClick={() => handleNavigation("/team-list")}
                >
                    <div className="icon"><FaUsers /></div>
                    <span>Teams</span>
                </div> )}

                  {hasPermission(PERMISSIONS.CAN_MANAGE_ASSOCIATES) && (
                <div
                    className={`nav-item${isActive("/associate-list") ? " active" : ""}`}
                    onClick={() => handleNavigation("/associate-list")}
                >
                    <div className="icon"><FaHandshake /></div>
                    <span>Associates</span>
                </div>
 )}

  {hasPermission(PERMISSIONS.CAN_VIEW_DRAFT_REQUESTS) && (
                <div
                    className={`nav-item${isActive("/property/draft-requests") ? " active" : ""}`}
                    onClick={() => handleNavigation("/property/draft-requests")}
                >
                    <div className="icon" ><FaFileSignature /></div>
                    <span>Draft Requests</span>
                </div>
  )}

            {hasPermission(PERMISSIONS.CAN_VIEW_REPORTS) && (
                <div
                    className={`nav-item${isActive("/property/reports") ? " active" : ""}`}
                    onClick={() => handleNavigation("/property/reports")}>

                    <div className="icon" ><FaChartBar /></div>
                    <span>Reports</span>
                </div>
            )}
            {hasPermission(PERMISSIONS.CAN_MANAGE_REFUNDS) && (
                <div
                    className={`nav-item${isActive("/property/refund-list") ? " active" : ""}`}
                    onClick={() => handleNavigation("/property/refund-list")}>

                    <div className="icon" ><FaUndoAlt /></div>
                    <span>Refund Management</span>
                </div>
            )}
                 {hasPermission(PERMISSIONS.CAN_VIEW_ALLOTMENT_LETTER_REQUESTS) && (
                <div
                    className={`nav-item${isActive("/property/allotment") ? " active" : ""}`}
                    onClick={() => handleNavigation("/property/allotment")}>

                    <div className="icon" ><FaTasks /></div>
                    <span>Allotment Letter Requests</span>
                </div>
                 )}

                    {hasPermission(PERMISSIONS.CAN_VERIFY_RECEIPTS) && (
                <div
                    className={`nav-item${isActive("/property/receipt-verification") ? " active" : ""}`}
                    onClick={() => handleNavigation("/property/receipt-verification")}>

                    <div className="icon" ><FaMoneyCheckAlt/></div>
                    <span>Payment Verify Requests</span>
                </div>
                    )}
                    <div
                    className={`nav-item${isActive("/property/file-check") ? " active" : ""}`}
                    onClick={() => handleNavigation("/property/file-check")}>

                    <div className="icon" ><FaMoneyCheckAlt/></div>
                    <span>File Check Requests</span>
                </div>
                    <div
                    className={`nav-item${isActive("/admin/closure-requests") ? " active" : ""}`}
                     onClick={() => navigate("/admin/closure-requests")}>

                    <div className="icon" ><FaTimesCircle/></div>
                    <span>Closure Requests</span>
                </div>

             
                    <>
                <div className="nav-item" onClick={() => setOpenSupport(prev => !prev)}>
                    <div className="icon">
                        <FaCog />
                    </div>

                    <span>Support</span>

                    <div className={`arrow ${openSupport ? "rotate" : ""}`}>
                        <FaChevronDown />
                    </div>
              
               </div>
                {/* Sub Menu */}
                <div className={`sub-menu ${openSupport ? "open" : ""}`}>
                    <div 
                        className="nav-item sub-item"
                        onClick={() => navigate("/support/ticket-list")}
                    >  <div className="icon"><FaCity /></div>
                        <span>Manage Tickets</span>
                    </div>
                </div>  
               <div className={`sub-menu ${openSupport ? "open" : ""}`}>
                    <div 
                        className="nav-item sub-item"
                        onClick={() => navigate("/support/create-ticket")}
                    >  <div className="icon"><FaCity /></div>
                        <span>Create New Ticket</span>
                    </div>
                </div> 
                </>
                
                
            </div>



        </Wrapper>
    );
};

export default Menu;
