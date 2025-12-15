// src/api/driverApiUpdate.js
import apiClient from "./axiosClient";

// GET /admin-driver?status=Pending&page=1 ইত্যাদি
export const getDriversByStatus = (status = "All", page = 1) => {
  const params = { page };

  // backend এ "All" নামে কোনো status নাই, তাই শুধু অন্য status হলে পাঠাবো
  if (status && status !== "All") {
    params.status = status;
  }

  // ❗ baseURL already .../api, তাই এখানে আর /api লিখবে না
  return apiClient.get("/admin-driver", { params });
};

// POST /create-driver  (multipart)
export const createDriver = (formData) =>
  apiClient.post("/create-driver", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

// PUT /driver/status-update/{driverId}
// body: { status: 'Rejected' | 'Approved' | 'Pending', note?: string }
export const updateDriverStatus = (driverId, status, note = "") =>
  apiClient.put(`/driver/status-update/${driverId}`, {
    status,
    note,
  });
