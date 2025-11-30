// src/api/notificationApi.js
import axiosClient from "./axiosClient";

// GET /api/notification
export const getNotifications = () => {
  return axiosClient.get("/notification");
};
export const markNotificationRead = (id) => {
  return axiosClient.put(`notification/read/${id}`);
};
