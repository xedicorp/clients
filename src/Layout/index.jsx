/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Menu from "../components/Menu";
 
import { Wrapper } from "./style";

const STORAGE_KEY = "property_bookings_v1";
const showMenuToggle = true;
const Layout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [username, setUsername] = useState("");
    const [bookingCount, setBookingCount] = useState(0);
    const [showReminderPopup, setShowReminderPopup] = useState(false);
    const pathname = location.pathname.replace(/\/+$/, "");
    const isAdminDashboardPage = pathname === '/admin';
    const isBookingListPage = pathname === '/property';
    const isNewBookingPage = pathname === '/property/new';
    const isReportsPage = pathname === '/property/reports';
    const isAdminUserListPage = pathname === '/admin-user-list';
    const isRolePermissionsPage = pathname === '/role-permissions';
    const isNotificationsPage = pathname === '/property/notifications' || pathname === '/notifications';
    const isReminderSavePage = pathname === '/property/reminder-save';
    const isBookingSummaryPage = location.pathname.includes('/property/summary/');
    const isFollowUpPage = location.pathname.includes('/property/follow-up/');
    const isPaymentEntryPage = pathname.includes('/property/payment-entry');
    const isRefundListPage = pathname === '/property/refund-list';
    const isJDAPattaUpdatePage = location.pathname.includes('/property/jda-patta');
    
    // Check for IT Admin
    let currentUsername = (localStorage.getItem("userName") || "").toLowerCase();
    if (!currentUsername) {
        try {
            const userObj = JSON.parse(localStorage.getItem("spendwise_user") || "{}");
            if (userObj.userName || userObj.username || userObj.name) {
                currentUsername = (userObj.userName || userObj.username || userObj.name || "").toLowerCase();
            }
        } catch (e) {}
    }
    const isITAdmin = currentUsername === 'itadmin';
    const isMarkFileCheckPage = location.pathname.includes('/property/file-check');

    // Full-width pages (hide sidebar/menu)
    const isInventoryPage = location.pathname.includes('/inventory') 
        || location.pathname.includes('/property/township-health')
        || location.pathname.includes('/property/township-collection')
        || location.pathname.includes('/property/township-list');
    
    const shouldHideMenu = isInventoryPage || isPaymentEntryPage || isAdminDashboardPage || isBookingListPage || isNewBookingPage || isReportsPage || isAdminUserListPage || isRolePermissionsPage || isNotificationsPage || isReminderSavePage || isBookingSummaryPage || isFollowUpPage || isRefundListPage || isJDAPattaUpdatePage || (isITAdmin && isMarkFileCheckPage);
    
    // Pages that should have full-width content
    const isFullWidthPage = isInventoryPage || isNotificationsPage || isReminderSavePage || isRolePermissionsPage || isBookingListPage || isRefundListPage || isJDAPattaUpdatePage || (isITAdmin && isMarkFileCheckPage);


    useEffect(() => {
        const fetchUsername = async () => {
           setUsername(localStorage.getItem("userName"));
            
           
        };

        fetchUsername();
    }, [navigate]);

    useEffect(() => {
        const loadBookingCount = () => {
            try {
                const raw = localStorage.getItem(STORAGE_KEY);
                if (raw) {
                    const bookings = JSON.parse(raw);
                    // Check if any booking has steps with completed stages (stage > 0)
                    const hasActiveStages = bookings.some(b => {
                        if (b.steps && Array.isArray(b.steps)) {
                            const completedSteps = b.steps.filter(s => s.status === "completed").length;
                            return completedSteps > 0;
                        }
                        return false;
                    });
                    setBookingCount(hasActiveStages ? bookings.length : 0);
                } else {
                    setBookingCount(0);
                }
            } catch {
                setBookingCount(0);
            }
        };

        loadBookingCount();

        // Listen for storage changes
        const handleStorageChange = () => {
            loadBookingCount(); 
        };

        // Listen for step changes and auto-open menu
        const handleStepChange = () => {
            loadBookingCount();
            setIsMenuOpen(true); // Auto-open menu when step is clicked
        };

        window.addEventListener('storage', handleStorageChange);
        // Custom event for same-tab updates
        window.addEventListener('bookingsUpdated', handleStorageChange);
        // Listen for step changes
        window.addEventListener('stepChanged', handleStepChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('bookingsUpdated', handleStorageChange);
            window.removeEventListener('stepChanged', handleStepChange);
        };
    }, []);

    return (
  <Wrapper collapsed={collapsed}>
    

    <div className="body">
      {/* SIDEBAR */}
      <Menu collapsed={collapsed} setShowReminderPopup={setShowReminderPopup}/>

      {/* MAIN CONTENT */}
      <div className={`content ${isFullWidthPage ? "full-width" : ""}`}>
      <Header
      toggleSidebar={() => setCollapsed(!collapsed)} 
      username={username}
      showMenuToggle={showMenuToggle}
    />
        <Outlet context={{ username, setUsername }} />
        
      </div>
  
    </div>
<Footer />
    
  </Wrapper>
);

};

export default Layout;
