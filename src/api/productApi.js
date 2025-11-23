// src/api/productApi.js
import axiosClient from "./axiosClient";

// 👉 requested products list (pending product list)
export const getRequestedProducts = (page = 1) => {
  return axiosClient.get("/request-product", {
    params: { page },
  });
};

// 👉 update product status
// is_active: 0 = pending, 1 = approved, 2 = declined
export const updateProductStatus = (productId, is_active) => {
  return axiosClient.post(`/product-status-update/${productId}`, {
    is_active,
  });
};
