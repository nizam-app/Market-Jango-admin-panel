
import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://103.208.183.253:8000/api", 
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    
    config.headers["token"] = token; 
  }

  return config;
});

export default axiosClient;
