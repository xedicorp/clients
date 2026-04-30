import React from 'react';
import DashboardHeader from './index';

// Example usage of the enhanced DashboardHeader component

// Basic usage
export const BasicHeader = () => (
  <DashboardHeader 
    title="Dashboard" 
    subtitle="Welcome back to your workspace"
  />
);

// Enhanced Dashboard with Stats
export const EnhancedDashboard = () => (
  <DashboardHeader 
    title="Property Management Dashboard" 
    subtitle="Welcome back! Here's your overview for today"
    icon={
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path>
        <polyline points="9,22 9,12 15,12 15,22"></polyline>
      </svg>
    }
    stats={[
      { label: 'Total Bookings', value: '1,234', icon: '📋', color: '#3b82f6' },
      { label: 'Today\'s Collection', value: '₹2.5L', icon: '💰', color: '#10b981' },
      { label: 'Active Townships', value: '12', icon: '🏘️', color: '#8b5cf6' },
      { label: 'Pending Tasks', value: '8', icon: '⏳', color: '#f59e0b' }
    ]}
    userInfo={{
      username: 'John Doe',
      role: 'Admin'
    }}
  />
);

// With custom stats and actions
export const DashboardWithActions = () => (
  <DashboardHeader 
    title="Sales Dashboard" 
    subtitle="Track your performance and manage operations"
    icon={
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 3v18h18"></path>
        <path d="M18 17V9"></path>
        <path d="M13 17V5"></path>
        <path d="M8 17v-3"></path>
      </svg>
    }
    stats={[
      { label: 'Revenue', value: '₹15.2L', icon: '💵', color: '#059669' },
      { label: 'Orders', value: '342', icon: '🛒', color: '#dc2626' },
      { label: 'Customers', value: '1.2K', icon: '👥', color: '#7c3aed' },
      { label: 'Growth', value: '+12%', icon: '📈', color: '#ea580c' }
    ]}
    actions={
      <>
        <button className="dashboard-action-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14"></path>
          </svg>
          Add New
        </button>
        <button className="dashboard-action-btn secondary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"></path>
          </svg>
          Export
        </button>
      </>
    }
  />
);

// Minimal version without stats
export const MinimalHeader = () => (
  <DashboardHeader 
    title="Settings" 
    subtitle="Manage your application preferences"
    showStats={false}
    showBackButton={true}
    icon={
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"></path>
      </svg>
    }
  />
);

// Real-time dashboard with live stats
export const LiveDashboard = () => {
  const [liveStats, setLiveStats] = React.useState([
    { label: 'Active Users', value: '1,234', icon: '👥', color: '#3b82f6' },
    { label: 'Server Load', value: '67%', icon: '⚡', color: '#f59e0b' },
    { label: 'Uptime', value: '99.9%', icon: '✅', color: '#10b981' },
    { label: 'Alerts', value: '3', icon: '🚨', color: '#ef4444' }
  ]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setLiveStats(prev => prev.map(stat => ({
        ...stat,
        value: stat.label === 'Active Users' 
          ? Math.floor(Math.random() * 2000 + 1000).toString()
          : stat.label === 'Server Load'
          ? `${Math.floor(Math.random() * 30 + 50)}%`
          : stat.value
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardHeader 
      title="System Monitor" 
      subtitle="Real-time system performance and health metrics"
      icon={
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
        </svg>
      }
      stats={liveStats}
      userInfo={{
        username: 'System Admin',
        role: 'Administrator'
      }}
    />
  );
};