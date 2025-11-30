// src/routes/ProtectedRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router";

const ProtectedRoute = () => {
  const token = localStorage.getItem("token");

  // token na thakle login page e pathai
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // token thakle niche thaka child routes render hobe
  return <Outlet />;
};

export default ProtectedRoute;
