// src/api/orderApi.js
import axiosClient from "./axiosClient";

// Not delivered orders list (paginated)
export const getNotDeliveredOrders = (page = 1) => {
  return axiosClient.get(`/not/delivered/order?page=${page}`);
};

// ✅ Placeholder: order + driver assign + payment info
// TODO: backend ready হলে endpoint টা তোমার real route diye দিও
export const assignOrderToDriver = ( driverId, orderItemId) => {
  return axiosClient.post(
    `/admin/invoice/create/${driverId}/${orderItemId}`,
     {} 
    );
};

export const getAllOrders = (page = 1) => {
  return axiosClient.get(`/all/order?page=${page}`);
};
