import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const authToken = localStorage.getItem("authToken");
  const userRole = localStorage.getItem("userRole"); // Get role from storage

  if (!authToken) {
    return <Navigate to="/Login" replace />;
  }

  if (userRole === "admin") {
    return <Navigate to="/AdminDashboard" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/Dashboard" replace />; // Redirect if role is not allowed
  }

  return children;
};

export default ProtectedRoute;