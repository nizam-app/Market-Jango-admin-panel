// src/api/buyerApi.js
import axiosClient from "./axiosClient";

const buyerApi = {
  // Laravel pagination: /buyers?page=1
  getBuyers: (page = 1, search = "", location = {}) => {
    const params = { page };
    if (search.trim()) {
      params.keyword = search.trim();
    }
    if (location?.zone) params.zone = location.zone;
    if (location?.state) params.state = location.state;
    if (location?.town) params.town = location.town;
    return axiosClient.get("/buyers", { params });
  },

  // Update buyer status: Pending / Approved / Rejected
  updateBuyerStatus: (buyerId, status, extras = {}) => {
    return axiosClient.put(`/buyer/status-update/${buyerId}`, {
      status,
      note: extras.note,
      notify_in_app: extras.notify_in_app,
      notify_sms: extras.notify_sms,
    });
  },
};

export default buyerApi;
