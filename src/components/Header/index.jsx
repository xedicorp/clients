// components/Header.jsx
import {
  Menu as MenuIcon,
  LogOut,
  Mail,
  Phone,
  Shield
} from "lucide-react";
import { Bell } from "lucide-react";
import axiosInstance from '../../utilities/axiosInstance';
import API_ENDPOINTS from '../../utilities/apiConfig';
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import Wrapper from "./style";
import SmallModal from '../../components/NewComponent/Modal/SmallModal';
import Swal from "sweetalert2";

import logo from "../../assets/img/logo-bg.png";
const Header = ({ toggleSidebar , username}) => {
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
const [notificationCount, setNotificationCount] = useState(0);
const [openNotification, setOpenNotification] = useState(false);
const notificationRef = useRef(null);
  const dropdownRef = useRef(null);
  const [currentPassword, setCurrentPassword] = useState("");
const [newPassword, setNewPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const [changePasswordLoading, setChangePasswordLoading] = useState(false);

  const initials = username
    ? username
        .split(/\s+/)
        .map((n) => n.charAt(0))
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "";

  const role = localStorage.getItem("spendwise_role") || "User";
  const email = localStorage.getItem("spendwise_email") || "user@rajbhoomi.com";
  const phone =
    localStorage.getItem("spendwise_phone") || "+91 XXXXXXXXXX";

  const handleProfileClick = () => {
    setShowDropdown((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  const handleLogout = () => {
    if (loggingOut) return;
    setLoggingOut(true);

    setTimeout(() => {
      localStorage.clear();
      
      navigate("/login", { replace: true });
      window.__SESSION_EXPIRED_SHOWN__ = false;
                window.location.href = '/login';
    }, 800);
      
  };
    const showChangePasswordWindow=()=>{
        setShowChangePasswordModal(true);
    }
    const getUserId = () => {
  const stored = localStorage.getItem("userId") ;
  const parsed = stored ? Number(stored) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
};

useEffect(() => {
  username = localStorage.getItem("userName") ;
  
  const fetchDashboardData = async () => {
    try {
      const userId = getUserId();
      const res = await axiosInstance.get(
        API_ENDPOINTS.DASHBOARD_GET + "?userId=" + userId
      );

      const data = res.data;
      setDashboardData(data);

      const total =
        (data?.notificationCount?.veryLowPriority || 0) +
        (data?.notificationCount?.lowPriority || 0) +
        (data?.notificationCount?.mediumPriority || 0) +
        (data?.notificationCount?.highPriority || 0);

      setNotificationCount(total);
    } catch (err) {
      setDashboardData(null);
      setNotificationCount(0);
    }
  };

  fetchDashboardData();
}, []);

useEffect(() => {
  const handleClickOutside = (e) => {
    if (notificationRef.current && !notificationRef.current.contains(e.target)) {
      setOpenNotification(false);
    }
  };

  if (openNotification) {
    document.addEventListener("mousedown", handleClickOutside);
  }

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [openNotification]);

const handleChangePassword = async () => {
  if (changePasswordLoading) return;

  // 🔥 Validation
  if (!currentPassword || !newPassword || !confirmPassword) {
    Swal.fire("Error", "All fields are required", "error");
    return;
  }

  if (newPassword !== confirmPassword) {
    Swal.fire("Error", "Passwords do not match", "error");
    return;
  }

  try {
    setChangePasswordLoading(true);

    const payload = {
      userId: getUserId(),
      currentPassword: currentPassword,
      newPassword: newPassword,
      confirmPassword: confirmPassword,
    };

    const res = await axiosInstance.put(
      API_ENDPOINTS.CHANGE_PASSWORD, // 👈 ensure this exists
      payload
    );

    Swal.fire("Success", "Password changed successfully", "success");

    // reset
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowChangePasswordModal(false);

  } catch (err) {
    console.log(err);

    Swal.fire(
      "Error",
      err?.response?.data?.message || "Something went wrong",
      "error"
    );
  } finally {
    setChangePasswordLoading(false);
  }
};

  return (
    <Wrapper>
      <header className="header-container">
        {/* LEFT */}
        <div className="header-left">
           
        <button className="sidebar-toggle" onClick={toggleSidebar}>
        <MenuIcon size={22} />
      </button>
      
          {/* {showMenuToggle && (
            <button
              className="menu-toggle"
              onClick={toggleMenu}
              aria-label="Toggle Sidebar"
            >
              <MenuIcon size={22} />
            </button>
          )}

          <div className="brand-logo">
            <img
              src="/src/assets/img/logo.jpeg"
              alt="Navsaar Logo"
              className="logo-img"
            />
          </div> */}
        </div>

        {/* RIGHT */}
        <div className="header-right d-flex gap-2">
          <div className="notification-wrapper d-flex gap-3" ref={notificationRef}>
   

</div>

          <div className="profile-info" ref={dropdownRef}>
            {username && (
              <>
                <div
                  className="profile-circle"
                  onClick={handleProfileClick}
                >
                  {initials}
                </div>

                {showDropdown && (
                  <div className="profile-dropdown">
                    <div className="dropdown-header">
                      <div className="dropdown-avatar">{initials}</div>
                      <div className="dropdown-user-info">
                        <h3>{username}</h3>
                        <span className="role-badge">{role}</span>
                      </div>
                    </div>
                    <div className="dropdown-details">
                      <div className="detail-item">
                        <Mail size={16} />
                        <span>{email}</span>
                      </div>
                      <div className="detail-item">
                        <Phone size={16} />
                        <span>{phone}</span>
                      </div>
                      <div className="detail-item">
                        <Shield size={16} />
                        <span>Role: {role}</span>
                      </div>
                       <div className="dropdown-divider" /> 
                    <div className="detail-item"
                      onClick={showChangePasswordWindow}
                    >
                        <Shield size={16} />
                        <span>Change Password</span>
                      </div>
                    <button
                      className={`primary-btn ${
                        loggingOut ? "disabled" : ""
                      }`}
                      onClick={!loggingOut ? handleLogout : undefined}
                      disabled={loggingOut}
                    >
                      <LogOut size={18} />
                      <span>
                        {loggingOut ? "Logging out..." : "Logout"}
                      </span>
                    </button>
                    </div>

                    
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </header>

        {/* Change Password Modal */}
            <SmallModal
              show={showChangePasswordModal}
              onClose={() => {
                   setShowChangePasswordModal(false); 
              }}
              title="Change Password"
            >
              <div className="">
                
               
               <div className="row">
                      <div className="col-12">
                        <div className="form-group">
                        <label htmlFor="current-password" className="required">Current Password</label>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter current password..."
                          className="form-control"
                        />
                      </div>
                       <div className="form-group">
                        <label htmlFor="new-password" className="required">New Password</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="form-control"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="confirm-password" className="required">Confirm Password</label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="form-control"
                        />
                      </div>
                      </div> 
                    </div>
                                  
      
                {/* Buttons */}
                <div
                  className="modal-actions"
                  
                >
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={handleChangePassword}
                    disabled={changePasswordLoading}
                  >
                    {changePasswordLoading ? "Changing..." : "Change Password"}
                  </button>
                   <button
                    type="button"
                    className="primary-btn"
                    onClick={() => {
                      setShowChangePasswordModal(false); }}>
                    Cancel
                  </button>
                </div>
              </div>
            </SmallModal>
    </Wrapper>
  );
};

export default Header;
