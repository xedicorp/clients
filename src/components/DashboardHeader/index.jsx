import React from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardHeader.css';

const DashboardHeader = ({ 
  title = "Dashboard", 
  subtitle = "Welcome back", 
  showBackButton = false,
  onBackClick,
  children,
  actions,
  icon,
  stats,
  userInfo,
  showDateTime = true,
  showStats = true
}) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(-1);
    }
  };

  // Get current date and time
  const getCurrentDateTime = () => {
    const now = new Date();
    const date = now.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const time = now.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    return { date, time };
  };

  const { date, time } = getCurrentDateTime();

  // Get user info from localStorage
  const getUserInfo = () => {
    const username = localStorage.getItem('userName') || localStorage.getItem('userName') || 'User';
    const role = localStorage.getItem('userRole') || 'Admin';
    return { username, role };
  };

  const currentUser = userInfo || getUserInfo();

  // Default stats if not provided
  const defaultStats = [
    { label: 'Total Bookings', value: '1,234', icon: '📋', color: '#3b82f6' },
    { label: 'Today\'s Collection', value: '₹2.5L', icon: '💰', color: '#10b981' },
    { label: 'Active Townships', value: '12', icon: '🏘️', color: '#8b5cf6' },
    { label: 'Pending Tasks', value: '8', icon: '⏳', color: '#f59e0b' }
  ];

  const displayStats = stats || defaultStats;

  return (
    <div className="dashboard-header">
      <div className="dashboard-header-content">
        <div className="">
              <h1 className="dashboard-title">{title}</h1>
              {subtitle && (
                <p className="dashboard-subtitle">{subtitle}</p>
              )}
        </div>
        
        {/* <div className="dashboard-header-center">
          {showStats && (
            <div className="dashboard-stats-grid">
              {displayStats.slice(0, 4).map((stat, index) => (
                <div key={index} className="stat-card" style={{ '--stat-color': stat.color }}>
                  <div className="stat-icon">{stat.icon}</div>
                  <div className="stat-content">
                    <div className="stat-value">{stat.value}</div>
                    <div className="stat-label">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div> */}
        
        <div className="dashboard-header-right">
          {/* <div className="user-info">
            <div className="user-avatar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div className="user-details">
              <div className="user-name">{currentUser.username}</div>
              <div className="user-role">{currentUser.role}</div>
            </div>
          </div> */}
          
          {children}
          {actions && (
            <div className="dashboard-header-actions">
              {actions}
            </div>
          )}
          {showBackButton && (
            <button 
              className="dashboard-back-btn" 
              onClick={handleBackClick}
              type="button"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Back
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;