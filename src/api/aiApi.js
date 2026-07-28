// src/api/aiApi.js
import axiosClient from "./axiosClient";

/** GET /admin/ai/settings */
export const getAiSettings = () => {
  return axiosClient.get("/admin/ai/settings");
};

/**
 * PUT /admin/ai/settings/{feature_name}
 * Body: { daily_limit?, monthly_limit?, is_enabled? }
 */
export const updateAiSetting = (featureName, payload) => {
  return axiosClient.put(`/admin/ai/settings/${encodeURIComponent(featureName)}`, payload);
};

/**
 * GET /admin/ai/usage-logs
 * Params: feature_type, status, from, to, user_id, per_page, page
 */
export const getAiUsageLogs = (params = {}) => {
  const query = {};
  if (params.feature_type) query.feature_type = params.feature_type;
  if (params.status) query.status = params.status;
  if (params.from) query.from = params.from;
  if (params.to) query.to = params.to;
  if (params.user_id) query.user_id = params.user_id;
  if (params.per_page != null) query.per_page = Number(params.per_page) || 20;
  if (params.page != null) query.page = Number(params.page) || 1;
  return axiosClient.get("/admin/ai/usage-logs", { params: query });
};

/**
 * POST /admin/ai/ask
 * Body: { question, context_type?: 'app_help'|'live_summary', zone_id?: number }
 */
export const askAdminAi = (payload) => {
  const body = {
    question: String(payload.question || "").trim(),
    context_type: payload.context_type || "app_help",
  };
  if (payload.zone_id != null && payload.zone_id !== "") {
    body.zone_id = Number(payload.zone_id);
  }
  return axiosClient.post("/admin/ai/ask", body);
};
