// src/api/categoryApi.js
// GET /api/category/list, POST /api/category/create, PUT /api/category/update/{id}, POST /api/category/destroy/{id}
import axiosClient from "./axiosClient";

const categoryApi = {
  /**
   * GET /api/category/list?search=...&page=1&per_page=20
   * Response: { data: { items: [...], pagination: { total, per_page, current_page, last_page } } }
   */
  getCategories: (params = {}) => {
    return axiosClient.get("/category/list", { params });
  },

  /**
   * GET /api/category/parent-options
   * Returns categories that can be selected as parent (for dropdown). Root categories and/or all categories per backend.
   */
  getParentOptions: () => {
    return axiosClient.get("/category/parent-options");
  },

  /**
   * POST /api/category/create
   * Body: form-data with name, description, slug (optional), meta_title, parent_id, status (Active/Inactive), images[]
   */
  createCategory: (formData) => {
    return axiosClient.post("/category/create", formData);
  },

  /**
   * PUT /api/category/update/{id}
   * Body: form-data, same fields as create (only fields being updated)
   */
  updateCategory: (id, formData) => {
    return axiosClient.put(`/category/update/${id}`, formData);
  },

  /**
   * POST /api/category/destroy/{id}
   */
  deleteCategory: (id) => {
    return axiosClient.post(`/category/destroy/${id}`);
  },
};

export default categoryApi;
