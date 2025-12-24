// src/api/buyerApi.js
import axiosClient from "./axiosClient";

const buyerApi = {
  // Laravel pagination: /buyers?page=1
  getBuyers: (page = 1, search = "") => {
    const params = { page };
    if (search.trim()) {
      params.keyword = search.trim(); // Use 'keyword' parameter for search
    }
    return axiosClient.get("/buyers", { params });
  },

  // Update buyer status: Pending / Approved / Rejected
  updateBuyerStatus: (buyerId, status) => {
    return axiosClient.put(`/buyer/status-update/${buyerId}`, {
      status,
    });
  },
};

export default buyerApi;
