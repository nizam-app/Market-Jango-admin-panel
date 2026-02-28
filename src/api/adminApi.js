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

// Zones (for zone route dropdowns and Zones tab). Paginated; use per_page to get all.
export const getZones = (perPage = 100) => {
  return axiosClient.get("/zones", { params: { per_page: perPage } });
};

// Get single zone (for edit form).
export const getZone = (zoneId) => {
  return axiosClient.get(`/zones/${zoneId}`);
};

// Create zone (body: name, center_latitude, center_longitude, radius_km, price, status).
export const createZone = (payload) => {
  return axiosClient.post("/zones", payload);
};

// Update zone.
export const updateZone = (zoneId, payload) => {
  return axiosClient.put(`/zones/${zoneId}`, payload);
};

// Delete zone.
export const deleteZone = (zoneId) => {
  return axiosClient.delete(`/zones/${zoneId}`);
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

// ==================== DELIVERY CHARGE ROUTES (zone_name, from_point, to_point, flat/weight/distance/cube) ====================
// List: GET /delivery-charges?search=...
export const getDeliveryChargeRoutes = (search = '') => {
  const params = {};
  if (search && String(search).trim()) params.search = String(search).trim();
  return axiosClient.get('/delivery-charges', { params });
};

// Single route (for edit)
export const getDeliveryChargeRoute = (id) => {
  return axiosClient.get(`/delivery-charges/${id}`);
};

// Create
export const createDeliveryChargeRoute = (payload) => {
  return axiosClient.post('/delivery-charges', payload);
};

// Update
export const updateDeliveryChargeRoute = (id, payload) => {
  return axiosClient.put(`/delivery-charges/${id}`, payload);
};

// Delete
export const deleteDeliveryChargeRoute = (id) => {
  return axiosClient.delete(`/delivery-charges/${id}`);
};

// ==================== AFFILIATES ====================
// List affiliates. Params: search (name, email, affiliate_code, phone), status (pending|active|suspended|banned), per_page (default 15, max 100), page
export const getAffiliates = (params = {}) => {
  const { search, status, per_page = 15, page = 1 } = params;
  const query = {};
  if (search != null && String(search).trim() !== "") query.search = String(search).trim();
  if (status != null && String(status).trim() !== "") query.status = String(status).trim();
  if (per_page != null) query.per_page = Math.min(Number(per_page) || 15, 100);
  if (page != null) query.page = Number(page) || 1;
  return axiosClient.get("/affiliates", { params: query });
};

// Get one affiliate (full profile). GET /affiliates/:id
export const getAffiliate = (id) => {
  return axiosClient.get(`/affiliates/${id}`);
};

// Update affiliate. PUT /affiliates/:id. Body: name?, status?, place_of_residence?
export const updateAffiliate = (id, payload) => {
  return axiosClient.put(`/affiliates/${id}`, payload);
};

// Delete affiliate. DELETE /affiliates/:id
export const deleteAffiliate = (id) => {
  return axiosClient.delete(`/affiliates/${id}`);
};

// Affiliate password reset. POST /affiliates/:id/password-reset. Body: new_password, new_password_confirmation
export const affiliatePasswordReset = (id, payload) => {
  return axiosClient.post(`/affiliates/${id}/password-reset`, payload);
};

// Create affiliate (generates affiliate ID / affiliate_code). Body: name, email, phone, password, password_confirmation, social_media, traffic_details, marketing_channel, payment_info, terms_accepted, place_of_residence?, status?
export const createAffiliate = (payload) => {
  return axiosClient.post("/affiliates", payload);
};

// ==================== REFERRAL LINKS ====================
// List referral links. Params: search, status, per_page (default 20), page
export const getReferralLinks = (params = {}) => {
  const { search, status, per_page = 20, page = 1 } = params;
  const query = {};
  if (search != null && String(search).trim() !== "") query.search = String(search).trim();
  if (status != null && String(status).trim() !== "") query.status = String(status).trim();
  if (per_page != null) query.per_page = Number(per_page) || 20;
  if (page != null) query.page = Number(page) || 1;
  return axiosClient.get("/referral-links", { params: query });
};

// Export referral links as CSV. GET /referral-links/export. Returns blob (CSV).
export const getReferralLinksExport = (params = {}) => {
  const { search, status } = params;
  const query = {};
  if (search != null && String(search).trim() !== "") query.search = String(search).trim();
  if (status != null && String(status).trim() !== "") query.status = String(status).trim();
  return axiosClient.get("/referral-links/export", { params: query, responseType: "blob" });
};

// Manual override: update referral link. PUT /referral-links/:id. Body: status?, revenue?, vendor_approved?, custom_rate?, attribution_model?
export const updateReferralLink = (id, payload) => {
  return axiosClient.put(`/referral-links/${id}`, payload);
};

// Delete referral link. DELETE /referral-links/:id
export const deleteReferralLink = (id) => {
  return axiosClient.delete(`/referral-links/${id}`);
};

// ==================== MANUAL PAYOUTS ====================
// List manual payouts. Params: search (affiliate/vendor name), status (pending|paid), per_page (default 15, max 100), page
export const getManualPayouts = (params = {}) => {
  const { search, status, per_page = 15, page = 1 } = params;
  const query = {};
  if (search != null && String(search).trim() !== "") query.search = String(search).trim();
  if (status != null && String(status).trim() !== "") query.status = String(status).trim();
  if (per_page != null) query.per_page = Math.min(Number(per_page) || 15, 100);
  if (page != null) query.page = Number(page) || 1;
  return axiosClient.get("/manual-payouts", { params: query });
};

// ==================== AFFILIATE SETTINGS ====================
// Get affiliate settings
export const getAffiliateSettings = () => {
  return axiosClient.get("/affiliate-settings");
};

// Update affiliate settings. Body: cookie_duration_days, attribution_model, ip_duplication_detection, self_referral_detection, suspicious_conversion_time_filter, blacklist_domains, vendor_control_enabled
export const updateAffiliateSettings = (payload) => {
  return axiosClient.put("/affiliate-settings", payload);
};

// ==================== CONVERSIONS ====================
// List conversions. Params: search, status, per_page (default 20), page
export const getConversions = (params = {}) => {
  const { search, status, per_page = 20, page = 1 } = params;
  const query = {};
  if (search != null && String(search).trim() !== "") query.search = String(search).trim();
  if (status != null && String(status).trim() !== "") query.status = String(status).trim();
  if (per_page != null) query.per_page = Number(per_page) || 20;
  if (page != null) query.page = Number(page) || 1;
  return axiosClient.get("/conversions", { params: query });
};