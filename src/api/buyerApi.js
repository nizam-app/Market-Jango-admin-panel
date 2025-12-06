// src/api/buyerApi.js
import axiosClient from "./axiosClient";

const buyerApi = {
  // Laravel pagination: /buyers?page=1
  getBuyers: (page = 1) => {
    return axiosClient.get(`/buyers?page=${page}`);
  },

  // Update buyer status: Pending / Approved / Rejected
  updateBuyerStatus: (buyerId, status) => {
    return axiosClient.put(`/buyer/status-update/${buyerId}`, {
      status,
    });
  },
};

export default buyerApi;
