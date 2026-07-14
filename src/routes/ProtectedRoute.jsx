// src/routes/ProtectedRoute.jsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { getUserType } from "../utils/authUser";

const ADMIN_ONLY_PREFIXES = [
  "/",
  "/products",
  "/category-management",
  "/business-type-management",
  "/buyer-management",
  "/transport-management",
  "/shipment-management",
  "/vendors",
  "/drivers",
  "/route-management",
  "/track-order",
  "/orders",
  "/driver-assignments",
  "/admin-user",
  "/setting",
  "/drivers-list",
  "/create-role",
  "/subscription-plans",
  "/notifications",
  "/rankings",
  "/visibility-management",
  "/affiliate-links",
  "/payment-management",
  "/activity-management",
  "/outlet-management",
];

const isAdminOnlyPath = (pathname) => {
  if (pathname.startsWith("/outlet/")) return false;
  if (pathname.startsWith("/drivers/") && pathname.includes("/assign-order")) return true;
  return ADMIN_ONLY_PREFIXES.some((p) => (p === "/" ? pathname === "/" : pathname === p || pathname.startsWith(p + "/")));
};

const ProtectedRoute = () => {
  const token = localStorage.getItem("token");
  const location = useLocation();
  const userType = getUserType();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (userType === "outlet") {
    if (location.pathname === "/") {
      return <Navigate to="/outlet/orders" replace />;
    }
    if (isAdminOnlyPath(location.pathname)) {
      return <Navigate to="/outlet/orders" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
