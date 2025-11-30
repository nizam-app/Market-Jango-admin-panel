// src/api/userApi.js
import axiosClient from "./axiosClient";

// বর্তমানে backend শুধু name + image নিচ্ছে
export const updateUserProfile = (payload) => {
  const hasFile = payload.image instanceof File;

  if (hasFile) {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    // PUT method ই use রাখছি, শুধু header দিচ্ছি
    return axiosClient.post("/user/update", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  // normal JSON payload (only name, etc.)
  return axiosClient.post("/user/update", payload);
};
