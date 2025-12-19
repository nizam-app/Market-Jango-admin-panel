// src/api/routeApi.js
import axiosClient from "./axiosClient";

export const getRoutes = () => axiosClient.get("/route");

export const createRoute = (name) =>
  axiosClient.post("/route/create", { name });

export const updateRoute = (id, name) =>
  axiosClient.post(`/route/update/${id}`, { name });

export const deleteRoute = (id) =>
  axiosClient.post(`/route/destroy/${id}`);

export const createLocation = (payload) =>
  axiosClient.post("/location/create", payload);

export const deleteLocation = (id) =>
  axiosClient.delete(`/location/destroy/${id}`);
