// src/api/adminApi.js
import axiosClient from "./axiosClient";

// Admin list (paginated)
export const getAdminUsers = (page = 1) => {
  return axiosClient.get(`/admin?page=${page}`);
};

// Update admin user (name, email, role, status)
export const updateAdminUser = (userId, payload) => {
  // payload: { name, email, role, status }
  return axiosClient.put(`/update-admin/${userId}`, payload);
};

// Delete admin user
export const deleteAdminUser = (userId) => {
  return axiosClient.delete(`/user/destroy/${userId}`); 
};

// 👉 Get all roles with permissions
export const getRoles = () => {
  return axiosClient.get("/roles");
};

// 👉 Create new admin user
export const createAdminUser = (payload) => {
  // payload: { name, email, role }
  return axiosClient.post("/create-admin", payload);
};

export const adminResetPassword = (payload) => {
  // payload: { email, password, old_password }
  return axiosClient.put("/admin-reset-password", payload);
};