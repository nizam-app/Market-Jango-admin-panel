// src/api/axiosClient.js
import axios from "axios";

const axiosClient = axios.create({
  baseURL: "https://api-market-jango.r2ait.in/public/api",
  // baseURL: "http://103.208.183.250:8000/api",
});

// ---- Request interceptor: token send ----
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      // backend jei header expect kore (tumi ageo eta use korchile)
      config.headers["token"] = token;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ---- Response interceptor: 401 -> logout + login page ----
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";

    // 🚫 admin reset password request er jonno 401 holeo redirect korbo na
    const isAdminReset = url.includes("/admin-reset-password");

    if (status === 401 && !isAdminReset) {
      // token invalid/expired hole clean kore login e pathai (old behavior)
      localStorage.removeItem("token");
      localStorage.removeItem("auth_user");
      window.location.href = "/login";
    }

    // always reject so catch block e dhorte paro
    return Promise.reject(error);
  }
);

export default axiosClient;
