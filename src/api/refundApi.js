// src/api/refundApi.js — admin refunds
import axiosClient from "./axiosClient";

/**
 * GET /refunds
 * @param {Object} params — status, vendor_id, from_date, to_date, zone_id, location, search, page
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

export const getRefundSettings = () => axiosClient.get("/refund-settings");

export const saveRefundSettings = (payload) => axiosClient.post("/refund-settings", payload);

export const getFailedDeliveries = () => axiosClient.get("/failed-deliveries");

export const setFailedDeliveryResponsibility = (id, responsibility) =>
  axiosClient.post(`/failed-deliveries/${id}/responsibility`, { responsibility });

export const disputeFailedDelivery = (id) =>
  axiosClient.post(`/failed-deliveries/${id}/dispute`);

export const assignFailedRedelivery = (id, driverId) =>
  axiosClient.post(`/failed-deliveries/${id}/assign-redelivery`, { driver_id: driverId });
