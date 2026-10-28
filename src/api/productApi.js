// src/api/productApi.js
import axiosClient from "./axiosClient";

// 👉 requested products list (pending product list)
function cleanParams(obj) {
  const out = { page: obj.page ?? 1 };
  Object.entries(obj).forEach(([k, v]) => {
    if (k === "page") return;
    if (v !== "" && v != null && v !== undefined) out[k] = v;
  });
  return out;
}

export const getRequestedProducts = (page = 1, filters = {}) => {
  return axiosClient.get("/request-product", {
    params: cleanParams({ page, ...filters }),
  });
};

// is_active: 0 = pending, 1 = approved, 2 = declined
export const updateProductStatus = (productId, is_active, extras = {}) => {
  return axiosClient.post(`/product-status-update/${productId}`, {
    is_active,
    note: extras.note,
    rejection_reason: extras.note,
    notify_in_app: extras.notify_in_app,
    notify_sms: extras.notify_sms,
  });
};
