// src/api/activityApi.js
import axiosClient from "./axiosClient";

// ==================== ACTIVITY LOGS ====================

export const getActivityFeed = () =>
  axiosClient.get("/admin/activity-logs/feed");

export const getActivityLogs = (params = {}) => {
  const { severity, action, target_type, date_from, date_to, page = 1, per_page = 20 } = params;
  const query = { page, per_page };
  if (severity) query.severity = severity;
  if (action) query.action = action;
  if (target_type) query.target_type = target_type;
  if (date_from) query.date_from = date_from;
  if (date_to) query.date_to = date_to;
  return axiosClient.get("/admin/activity-logs", { params: query });
};

export const getActivityLog = (id) =>
  axiosClient.get(`/admin/activity-logs/${id}`);

// ==================== ALERTS ====================

export const getAlerts = (params = {}) => {
  const { status = "pending", page = 1, per_page = 50 } = params;
  return axiosClient.get("/admin/alerts", { params: { status, page, per_page } });
};

export const resolveAlert = (id, note = "") =>
  axiosClient.post(`/admin/alerts/${id}/resolve`, { note });

export const dismissAlert = (id, note = "") =>
  axiosClient.post(`/admin/alerts/${id}/dismiss`, { note });
