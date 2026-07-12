// src/api/businessTypeApi.js
import axiosClient from "./axiosClient";

const businessTypeApi = {
  getBusinessTypes: (params = {}) =>
    axiosClient.get("/admin/business-types", { params }),

  createBusinessType: (formData) =>
    axiosClient.post("/admin/business-types", formData),

  updateBusinessType: (id, formData) =>
    axiosClient.put(`/admin/business-types/${id}`, formData),

  deleteBusinessType: (id) =>
    axiosClient.delete(`/admin/business-types/${id}`),

  getPublicBusinessTypes: () => axiosClient.get("/business-types"),
};

export default businessTypeApi;
