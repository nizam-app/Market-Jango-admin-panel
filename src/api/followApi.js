// src/api/followApi.js
import axiosClient from "./axiosClient";

/** Full follow graph for one user (admin). */
export const getAdminUserFollows = (userId) => {
  return axiosClient.get(`/admin/users/${userId}/follows`);
};

/** All follow relationships (admin list with optional filters). */
export const getAdminFollows = (params = {}) => {
  return axiosClient.get("/admin/follows", { params });
};
