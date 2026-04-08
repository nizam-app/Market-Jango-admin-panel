// src/api/refundApi.js — admin refunds
import axiosClient from "./axiosClient";

/**
 * GET /refunds
 * @param {Object} params — status, vendor_id, from_date, page, etc.
 */
export const getRefunds = (params = {}) => {
  const clean = {};
  Object.entries(params).forEach(([k, v]) => {
    if (v !== "" && v != null && v !== undefined) clean[k] = v;
  });
  return axiosClient.get("/refunds", { params: clean });
};

/** POST /refunds/{id}/approve */
export const approveRefund = (id, note = "") => {
  return axiosClient.post(`/refunds/${id}/approve`, { note });
};

/** POST /refunds/{id}/reject */
export const rejectRefund = (id, note = "") => {
  return axiosClient.post(`/refunds/${id}/reject`, { note });
};
