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

// Route Locations (Delivery Charges)
export const getRouteLocations = () =>
  axiosClient.get("/route-locations");

export const getRouteLocationById = (id) =>
  axiosClient.get(`/route-locations/${id}`);

export const createRouteLocation = (payload) =>
  axiosClient.post("/route-locations", payload);

export const updateRouteLocation = (id, payload) =>
  axiosClient.put(`/route-locations/${id}`, payload);

export const deleteRouteLocation = (id) =>
  axiosClient.delete(`/route-locations/${id}`);
