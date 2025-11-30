// src/api/driverApi.js
import axiosClient from "./axiosClient";

// Pending driver list (paginated)
export const getRequestedDrivers = (page = 1) => {
  return axiosClient.get(`/request-driver?page=${page}`);
};

// Approved (active) drivers list
export const getApprovedDrivers = (page = 1) => {
  return axiosClient.get(`/approved-driver?page=${page}`);
};

// Single driver details
export const getDriverDetails = (id) => {
  return axiosClient.get("/driver/show", {
    params: { id },
  });
};

// Update driver status: 'Pending' | 'Approved' | 'Rejected'
export const updateDriverStatus = (id, status) => {
  return axiosClient.put(`/driver/status-update/${id}`, { status });
};

export const fetchSuspendedDrivers = async (page = 1) => {
  const res = await axiosClient.get(`/suspended-driver?page=${page}`);
  return res.data;
};

// User delete (used from suspended list)
export const deleteUserById = async (userId) => {
  const res = await axiosClient.delete(`/user/destroy/${userId}`);
  return res.data;
};

// Restore suspended driver -> Pending
export const restoreSuspendedDriver = async (driverId) => {
  const res = await axiosClient.put(`/driver/status-update/${driverId}`, {
    status: "Pending",
  });
  return res.data;
};

export const searchDriversByLocation = (pickup_location, drop_location) => {
  return axiosClient.get('/drivers/search/location', {
    params: {
      pickup_location,
      drop_location,
    },
  });
};