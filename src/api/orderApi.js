// src/api/orderApi.js
import axiosClient from "./axiosClient";

/** GET /admin/order-item-statuses — { data: { statuses: string[], transitions: {...} } } */
export const getOrderItemStatuses = () => {
  return axiosClient.get("/admin/order-item-statuses");
};

// Not delivered orders list (paginated)
export const getNotDeliveredOrders = (page = 1) => {
  return axiosClient.get(`/not/delivered/order?page=${page}`);
};

export const assignOrderToDriver = (driverId, orderItemId) => {
  return axiosClient.post(`/admin/invoice/create/${driverId}/${orderItemId}`, {});
};

/**
 * GET /all/order
 * Pass page number (legacy) or params object:
 * { page, from_date, to_date, status, vendor_id, zone_id }
 */
export const getAllOrders = (params = 1) => {
  if (typeof params === "number") {
    return axiosClient.get("/all/order", { params: { page: params } });
  }
  const clean = {};
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== "" && v != null && v !== undefined) clean[k] = v;
  });
  return axiosClient.get("/all/order", { params: clean });
};

/**
 * Normalize Laravel or array-only responses for /all/order
 */
export function parseAllOrdersResponse(res) {
  const payload = res?.data?.data;
  if (Array.isArray(payload)) {
    return {
      list: payload,
      meta: {
        current_page: 1,
        last_page: 1,
        total: payload.length,
        per_page: payload.length || 10,
      },
    };
  }
  if (payload && Array.isArray(payload.data)) {
    return {
      list: payload.data,
      meta: {
        current_page: payload.current_page || 1,
        last_page: payload.last_page || 1,
        total: payload.total ?? payload.data.length,
        per_page: payload.per_page || 10,
      },
    };
  }
  return {
    list: [],
    meta: { current_page: 1, last_page: 1, total: 0, per_page: 10 },
  };
}
