// src/api/userApi.js
import axiosClient from "./axiosClient";

/**
 * Update user info (works for vendor, driver, buyer, transport)
 * @param {number} userId - The user ID
 * @param {FormData} formData - The form data to update
 * @returns {Promise} - API response
 */
export const updateUserInfo = (userId, formData) => {
  return axiosClient.put(`/admin-update-user-info/${userId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// Alias for backward compatibility
export const updateUserProfile = updateUserInfo;
