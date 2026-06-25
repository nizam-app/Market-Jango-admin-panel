// src/api/axiosClient.js
import axios from "axios";
import { getAuthUser } from "../utils/authUser";

const axiosClient = axios.create({
  baseURL: "https://backend.jangomarketvc.ae/api",
  // baseURL: "http://103.208.183.250:9000/api",
  // baseURL: "/api",
});

// ---- Request: admin API expects token, id, user_type, Accept ----
axiosClient.interceptors.request.use(
  (config) => {
    // Do not force JSON Accept on binary downloads — server may return JSON/HTML
    // instead of PDF, which then saves as a corrupt .pdf file.
    if (config.responseType !== "blob") {
      config.headers["Accept"] = config.headers["Accept"] || "application/json";
    }

    const token = localStorage.getItem("token");
    if (token) {
      config.headers["token"] = token;
      const user = getAuthUser();
      const uid = user?.id ?? user?.user_id;
      if (uid != null && uid !== "") {
        config.headers["id"] = String(uid);
      }
      config.headers["user_type"] = "admin";
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---- Response: 401 -> logout + login page ----
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";

    const isAdminReset = url.includes("/admin-reset-password");

    if (status === 401 && !isAdminReset) {
      localStorage.removeItem("token");
      localStorage.removeItem("auth_user");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
