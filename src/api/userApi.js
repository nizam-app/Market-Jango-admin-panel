// src/api/userApi.js
import axiosClient from "./axiosClient";
import { getAuthUser } from "../utils/authUser";

/**
 * Admin updates another user's info (vendor, driver, buyer, transport).
 */
export const updateUserInfo = (userId, formData) => {
  // Let axios set multipart boundary — do not set Content-Type manually.
  return axiosClient.put(`/admin-update-user-info/${userId}`, formData);
};

/**
 * Logged-in user updates their own profile (admin, vendor, etc.).
 * Uses POST /user/update with `id` + `token` headers from axiosClient.
 */
export const updateUserProfile = ({ name, image }) => {
  const authUser = getAuthUser();
  const userId = authUser?.id ?? authUser?.user_id;
  if (!userId) {
    return Promise.reject(
      Object.assign(new Error("Not logged in"), {
        response: { data: { message: "Not logged in" } },
      })
    );
  }

  const trimmedName =
    name != null && String(name).trim() !== "" ? String(name).trim() : null;

  if (image) {
    const formData = new FormData();
    if (trimmedName) formData.append("name", trimmedName);
    formData.append("image", image);
    return axiosClient.post("/user/update", formData);
  }

  return axiosClient.post("/user/update", {
    name: trimmedName,
  });
};
