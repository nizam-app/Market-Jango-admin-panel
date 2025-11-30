// src/api/routeApi.js
import axiosClient from "./axiosClient";

export const getRoutes = () => axiosClient.get("/route");

export const createRoute = (name) =>
  axiosClient.post("/route/create", { name });

export const createLocation = (payload) =>
  axiosClient.post("/location/create", payload);

export const deleteLocation = (id) =>
  axiosClient.delete(`/location/destroy/${id}`);
