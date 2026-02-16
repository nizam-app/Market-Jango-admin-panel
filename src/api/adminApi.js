// src/api/adminApi.js
import axiosClient from "./axiosClient";

// Admin list (paginated)
export const getAdminUsers = (page = 1) => {
  return axiosClient.get(`/admin?page=${page}`);
};

// Update admin user (name, email, role, status)
export const updateAdminUser = (userId, payload) => {
  // payload: { name, email, role, status }
  return axiosClient.put(`/update-admin/${userId}`, payload);
};

// Delete admin user
export const deleteAdminUser = (userId) => {
  return axiosClient.delete(`/user/destroy/${userId}`); 
};

// 👉 Get all roles with permissions
export const getRoles = () => {
  return axiosClient.get("/roles");
};

// 👉 Create new admin user
export const createAdminUser = (payload) => {
  // payload: { name, email, role }
  return axiosClient.post("/create-admin", payload);
};

export const adminResetPassword = (payload) => {
  // payload: { email, password, old_password }
  return axiosClient.put("/admin-reset-password", payload);
};

// ==================== RANKING MANAGEMENT ====================
// Recalculate rankings (type: 'all' | 'vendor' | 'driver')
export const recalculateRankings = (type = 'all') => {
  return axiosClient.post("/ranking/recalculate", { type });
};

// ==================== SUBSCRIPTION PLAN MANAGEMENT ====================
// Get all subscription plans
export const getAllPlans = (filters = {}) => {
  const params = {};
  if (filters.for_user_type) params.for_user_type = filters.for_user_type;
  if (filters.status) params.status = filters.status;
  return axiosClient.get("/vendor-dashboard/admin/plans", { params });
};

// Create subscription plan
export const createPlan = (planData) => {
  return axiosClient.post("/vendor-dashboard/admin/plans", planData);
};

// Update subscription plan
export const updatePlan = (planId, planData) => {
  return axiosClient.put(`/vendor-dashboard/admin/plans/${planId}`, planData);
};

// Delete subscription plan
export const deletePlan = (planId) => {
  return axiosClient.delete(`/vendor-dashboard/admin/plans/${planId}`);
};

// ==================== DELIVERY CHARGE MANAGEMENT ====================
// Get delivery charge dashboard
export const getDeliveryDashboard = () => {
  return axiosClient.get("/delivery-charge/dashboard");
};

// Zones (for zone route dropdowns). Paginated; use per_page to get all for dropdowns.
export const getZones = (perPage = 100) => {
  return axiosClient.get("/zones", { params: { per_page: perPage } });
};

// Zone Routes
export const getZoneRoutes = () => {
  return axiosClient.get("/delivery-charge/zone-routes");
};

export const createZoneRoute = (routeData) => {
  return axiosClient.post("/delivery-charge/zone-routes", routeData);
};

export const updateZoneRoute = (routeId, routeData) => {
  return axiosClient.put(`/delivery-charge/zone-routes/${routeId}`, routeData);
};

export const deleteZoneRoute = (routeId) => {
  return axiosClient.delete(`/delivery-charge/zone-routes/${routeId}`);
};

// Weight Charges
export const getWeightCharges = () => {
  return axiosClient.get("/weights");
};

export const getWeightCharge = (weightId) => {
  return axiosClient.get(`/weights/${weightId}`);
};

export const createWeightCharge = (chargeData) => {
  return axiosClient.post("/weights", chargeData);
};

export const updateWeightCharge = (weightId, chargeData) => {
  return axiosClient.put(`/weights/${weightId}`, chargeData);
};

export const deleteWeightCharge = (weightId) => {
  return axiosClient.delete(`/weights/${weightId}`);
};