// RouteGuard.jsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getCurrentUser } from "./auth"; // from previous example
import { getAccessibleRoutes } from "../PermissionController/PermissionController";
// import { Routes } from "../PermissionController/PermissionController";


const RouteGuard = ({ redirectTo = "/unauthorized" }) => {
  const location = useLocation();
  const user = getCurrentUser();

  if (!user) return <Navigate to="/login" replace />;

  const accessibleRoutes = getAccessibleRoutes(user.permissions);

  if (!accessibleRoutes.includes(location.pathname)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};

export default RouteGuard;
