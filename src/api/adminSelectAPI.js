

import axiosClient from "./axiosClient";

// ---- CATEGORY API ----
export const fetchCategories = (page = 1) => {
  return axiosClient.get(`/category`, {
    params: { page },
  });
};

export const updateCategoryTop = (categoryId, value) => {
  return axiosClient.put(`/admin-category-update/${categoryId}`, {
    is_top_category: value, // 0 or 1
  });
};

// ---- PRODUCT API ----
export const fetchAdminProducts = (page = 1) => {
  return axiosClient.get(`/admin-product`, {
    params: { page },
  });
};

export const updateProductSelect = (productId, payload) => {
  // payload example: { top_product: 1 } or { new_item: 0 } or { just_for_you: 1 }
  return axiosClient.put(`/admin-select-update/${productId}`, payload);
};
