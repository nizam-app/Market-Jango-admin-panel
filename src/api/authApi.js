// src/api/authApi.js
import axiosClient from "./axiosClient";

export function loginAdmin(payload) {
  // payload: { email, password }
  return axiosClient.post("/login", payload);
}
