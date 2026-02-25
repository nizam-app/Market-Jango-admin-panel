// src/api/visibilityApi.js
// Admin Visibility API: visibility-zones + vendor-visibility. All requests use admin auth.
import axiosClient from "./axiosClient";
import { getAuthUser } from "../utils/authUser";

const adminHeaders = () => {
  const user = getAuthUser();
  const id = user?.id ?? user?.admin?.id ?? "";
  return {
    id: String(id),
    user_type: "admin",
    Accept: "application/json",
  };
};

const visibilityApi = {
  // ——— Visibility zones ———
  getZones: (params = {}) => {
    return axiosClient.get("/visibility-zones", {
      params,
      headers: adminHeaders(),
    });
  },
  getZone: (id) => {
    return axiosClient.get(`/visibility-zones/${id}`, {
      headers: adminHeaders(),
    });
  },
  createZone: (body) => {
    return axiosClient.post("/visibility-zones", body, {
      headers: { ...adminHeaders(), "Content-Type": "application/json" },
    });
  },
  updateZone: (id, body) => {
    return axiosClient.put(`/visibility-zones/${id}`, body, {
      headers: { ...adminHeaders(), "Content-Type": "application/json" },
    });
  },
  deleteZone: (id) => {
    return axiosClient.delete(`/visibility-zones/${id}`, {
      headers: adminHeaders(),
    });
  },

  // ——— Vendor visibility ———
  getVendorVisibility: (params = {}) => {
    return axiosClient.get("/vendor-visibility", {
      params,
      headers: adminHeaders(),
    });
  },
  createVendorVisibility: (body) => {
    return axiosClient.post("/vendor-visibility", body, {
      headers: { ...adminHeaders(), "Content-Type": "application/json" },
    });
  },
  updateVendorVisibility: (id, body) => {
    return axiosClient.put(`/vendor-visibility/${id}`, body, {
      headers: { ...adminHeaders(), "Content-Type": "application/json" },
    });
  },
  deleteVendorVisibility: (id) => {
    return axiosClient.delete(`/vendor-visibility/${id}`, {
      headers: adminHeaders(),
    });
  },
};

export default visibilityApi;
