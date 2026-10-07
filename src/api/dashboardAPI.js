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
/** Public guest list (global or ?zone_id=). Prefer getManageBanners for admin UI. */
export function getBanners(params = {}) {
  return axiosClient.get("/banner", { params });
}

/** Admin: all banners (global + zone-wise). Optional zone_id filter. */
export function getManageBanners(params = {}) {
  return axiosClient.get("/banner/manage", { params: { per_page: 50, ...params } });
}

export function uploadBanner(formData) {
  return axiosClient.post("/banner/create", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export function updateBanner(bannerId, formData) {
  return axiosClient.post(`/banner/update/${bannerId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export function deleteBanner(bannerId) {
  return axiosClient.delete(`/banner/destroy/${bannerId}`);
}
