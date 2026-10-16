// src/api/transportApi.js
import axiosClient from "./axiosClient";

const transportApi = {
  // GET /transports?page=1
  getTransports: (page = 1, location = {}) => {
    const params = { page };
    if (location?.zone) params.zone = location.zone;
    if (location?.state) params.state = location.state;
    if (location?.town) params.town = location.town;
    return axiosClient.get("/transports", { params });
  },

  // PUT /transport/status-update/:id
  updateTransportStatus: (transportId, status) => {
    return axiosClient.put(`/transport/status-update/${transportId}`, {
      status,
    });
  },
};

export default transportApi;
