// src/api/activityApi.js
import axiosClient from "./axiosClient";

// ==================== ACTIVITY LOGS ====================

export const getActivityFeed = (params = {}) => {
  const { module, limit = 50 } = params;
  const query = { limit };
  if (module) query.module = module;
  return axiosClient.get("/admin/activity-logs/feed", { params: query });
};

export const getActivityLogs = (params = {}) => {
  const {
    severity,
    action,
    target_type,
    module,
    status,
    actor_role,
    actor_name,
    actor_id,
    date_from,
    date_to,
    datetime_from,
    datetime_to,
    page = 1,
    per_page = 20,
  } = params;
  const query = { page, per_page };
  if (severity) query.severity = severity;
  if (action) query.action = action;
  if (target_type) query.target_type = target_type;
  if (module) query.module = module;
  if (status) query.status = status;
  if (actor_role) query.actor_role = actor_role;
  if (actor_name) query.actor_name = actor_name;
  if (actor_id) query.actor_id = actor_id;
  if (datetime_from) query.datetime_from = datetime_from;
  if (datetime_to) query.datetime_to = datetime_to;
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
