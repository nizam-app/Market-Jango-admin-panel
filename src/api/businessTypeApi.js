// src/api/businessTypeApi.js
import axiosClient from "./axiosClient";

const businessTypeApi = {
  getBusinessTypes: (params = {}) =>
    axiosClient.get("/admin/business-types", { params }),

  createBusinessType: (formData) =>
    axiosClient.post("/admin/business-types", formData),

  /**
   * PHP does not populate multipart/form-data on real PUT requests.
   * Send as POST with Laravel _method spoofing so FormData is parsed.
   */
  updateBusinessType: (id, formData) => {
    if (formData instanceof FormData && !formData.has("_method")) {
      formData.append("_method", "PUT");
    }
    return axiosClient.post(`/admin/business-types/${id}`, formData);
  },

  deleteBusinessType: (id) =>
    axiosClient.delete(`/admin/business-types/${id}`),

  getPublicBusinessTypes: () => axiosClient.get("/business-types"),
};

export default businessTypeApi;
