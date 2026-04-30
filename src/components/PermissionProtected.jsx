import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import AuthService from "../utilities/auth";


// Utility to get current user permissions from localStorage
const getCurrentUserPermissions = () => {
  const userStr = localStorage.getItem("spendwise_user");
  const permissionsStr = localStorage.getItem("spendwise_permissions");

  if (!userStr || !permissionsStr) return [];

  try {
    const userPermissions = JSON.parse(permissionsStr)
      .filter(p => p.isAssigned === true || p.isAssigned === "true")
      .map(p => p.name);

    return userPermissions;
  } catch (e) {
    console.error("Invalid permission data", e);
    return [];
  }
};

// Permission-based route guard
const PermissionProtected = ({ allowedPermissions = [] }) => {
  // Redirect to login if not authenticated
  if (!AuthService.isAuthenticated()) return <Navigate to="/login" />;

  // Get user permissions
  const userPermissions = getCurrentUserPermissions();

  // If user lacks any of the required permissions, redirect to "/"
  const hasAccess = allowedPermissions.every(p => userPermissions.includes(p));
  if (!hasAccess) return <Navigate to="/" replace />;

  // Render nested routes
  return <Outlet />;
};

export default PermissionProtected;
