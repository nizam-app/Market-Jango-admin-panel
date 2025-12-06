// src/api/transportApi.js
import axiosClient from "./axiosClient";

const transportApi = {
  // GET /transports?page=1
  getTransports: (page = 1) => {
    return axiosClient.get(`/transports?page=${page}`);
  },

  // PUT /transport/status-update/:id
  updateTransportStatus: (transportId, status) => {
    return axiosClient.put(`/transport/status-update/${transportId}`, {
      status,
    });
  },
};

export default transportApi;
