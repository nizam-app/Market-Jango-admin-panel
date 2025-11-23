// src/api/dashboardAPI.js
import axiosClient from "./axiosClient";

// =======================
//      DASHBOARD STATS
// =======================
export async function getDashboardStats() {
  const [
    vendorCountRes,
    vendorReqCountRes,
    driverCountRes,
    driverReqCountRes,
  ] = await Promise.all([
    axiosClient.get("/vendor-count"),
    axiosClient.get("/vendor-request-count"),
    axiosClient.get("/driver-count"),
    axiosClient.get("/driver-request-count"),
  ]);

  return {
    totalVendors: vendorCountRes.data?.data ?? 0,
    vendorRequests: vendorReqCountRes.data?.data ?? 0,
    totalDrivers: driverCountRes.data?.data ?? 0,
    driverRequests: driverReqCountRes.data?.data ?? 0,
  };
}

// =======================
//          BANNER
// =======================
export function getBanners() {
  return axiosClient.get("/banner");
}

export function uploadBanner(formData) {
  return axiosClient.post("/banner/create", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}
export function deleteBanner(bannerId) {
  return axiosClient.delete(`/banner/destroy/${bannerId}`);
}
