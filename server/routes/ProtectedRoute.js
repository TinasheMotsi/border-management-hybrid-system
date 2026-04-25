import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user.role;

  // 1. If not logged in at all, kick them to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. If their role isn't in the allowed list, kick them to dashboard
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  // 3. If everything is fine, show the page
  return children;
};

export default ProtectedRoute;