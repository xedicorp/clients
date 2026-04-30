import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import hasPermission from "../../utilities/HasPermission";
import ReminderPopup from "../../components/ReminderPopup";
import "./PropertyNavigation.css";

export default function PropertyNavigation({ hideHealthButton = false, showReminderButton = false, onReminderClick, hideNavButtons = false, hideNewBookingButton = false, showHoldBookingList = false, bookingId, hideBookingList = false}) {
    const navigate = useNavigate();
    const location = useLocation();
    const [showReminderPopup, setShowReminderPopup] = useState(false);

    // If hideNavButtons is true (e.g. for itadmin), render nothing or return early
    // But we might want to keep the container structure if needed. 
    // The user said "hidden kar dena", so let's filter the items.
    
    if (hideNavButtons) {
        return null; // Or return <></> if the container needs to be gone.
    }

    const navItems = [
        // {
        //     label: "Dashboard",
        //     icon: (
        //         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        //             <rect x="3" y="3" width="7" height="7"></rect>
        //             <rect x="14" y="3" width="7" height="7"></rect>
        //             <rect x="14" y="14" width="7" height="7"></rect>
        //             <rect x="3" y="14" width="7" height="7"></rect>
        //         </svg>
        //     ),
        //     path: "/admin-dashboard",
        //     color: "#22c55e",
        //     permission: null // Always show dashboard
        // },
        {
            label: showHoldBookingList ? "Hold Booking List" : "Back",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
            ),
            path: showHoldBookingList ? "/property/hold-report-booking" : "/property",
            color: "#22c55e",
            permission: null // Always show booking list
        },
        {
            label: "Reminder",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
            ),
            path: "/property/notifications",
            color: "#22c55e",
            permission: "CanViewReminder"
        },
    ];

    // Filter nav items based on permissions and hideNewBookingButton prop
    const filteredNavItems = navItems.filter(item => {
        // Hide New Booking button if hideNewBookingButton is true
        if (hideNewBookingButton && item.label === "New Booking") {
            return false;
        }
        if (!item.permission) return true; // Always show items without permission requirement
        return hasPermission(item.permission);
    });

    const isActive = (path) => {
        if (path === "/property") {
            return location.pathname === "/property";
        }
        if (path === "/admin") {
            return location.pathname === "/admin";
        }
        if (!hideHealthButton && path === "/property/township-health") {
            return location.pathname === "/property/township-health";
        }
        if (path === "/property/inventory-management") {
            return location.pathname === "/property/inventory-management";
        }
        return location.pathname.startsWith(path);
    };

    const handleButtonClick = (item) => {
        if (item.label === "Reminder") {
            setShowReminderPopup(true);
        } else {
            navigate(item.path);
        }
    };

    return (
        <>
            <div className="dashboard-header-actions">
                {filteredNavItems.map((item, index) => (
                    <button
                        key={index}
                        className={`primary-btn ${isActive(item.path) ? 'active' : ''}`}
                        onClick={() => handleButtonClick(item)}
                    >
                        <div className="nav-btn-icon">{item.icon}</div>
                        <span className="nav-btn-label">{item.label}</span>
                    </button>
                ))}
            </div>

            <ReminderPopup 
                isOpen={showReminderPopup}
                onClose={() => setShowReminderPopup(false)}
                title="Reminder List"
                bookingId={bookingId}

            />
        </>
    );
}
