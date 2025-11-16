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

// =======================
//      ADMIN SELECTS
// =======================

// ---- Top Products ----
export async function fetchTopProductsItems() {
  const res = await axiosClient.get("/admin-selects/top-products");
  const paginated = res.data?.data ?? {};
  const rows = paginated.data ?? [];

  const seen = new Map();
  rows.forEach((row) => {
    const pid = row.product_id;
    if (!seen.has(pid)) {
      seen.set(pid, {
        id: row.id, // unique key for React
        value: pid, // backend এ পাঠানোর জন্য
        name: row.product?.name ?? `Product #${pid}`,
      });
    }
  });

  return Array.from(seen.values());
}

// ---- New Items ----
export async function fetchNewItemsItems() {
  const res = await axiosClient.get("/admin-selects/new-items");
  const paginated = res.data?.data ?? {};
  const rows = paginated.data ?? [];

  const seen = new Map();
  rows.forEach((row) => {
    const pid = row.product_id;
    if (!seen.has(pid)) {
      seen.set(pid, {
        id: row.id,
        value: pid,
        name: row.product?.name ?? `Product #${pid}`,
      });
    }
  });

  return Array.from(seen.values());
}

// ---- Just For You ----
export async function fetchJustForYouItems() {
  const res = await axiosClient.get("/admin-selects/just-for-you");
  const paginated = res.data?.data ?? {};
  const rows = paginated.data ?? [];

  const seen = new Map();
  rows.forEach((row) => {
    const pid = row.product_id;
    if (!seen.has(pid)) {
      seen.set(pid, {
        id: row.id,
        value: pid,
        name: row.product?.name ?? `Product #${pid}`,
      });
    }
  });

  return Array.from(seen.values());
}

// ---- Top Categories ----
export async function fetchTopCategoriesItems() {
  const res = await axiosClient.get("/admin-selects/top-categories");
  const paginated = res.data?.data ?? {};
  const rows = paginated.data ?? [];

  const seen = new Map();
  rows.forEach((row) => {
    const cid = row.category_id ?? row.product_id;
    if (!seen.has(cid)) {
      seen.set(cid, {
        id: row.id,
        value: cid,
        name: row.category?.name ?? `Category #${cid}`,
      });
    }
  });

  return Array.from(seen.values());
}

// ---- Save selected ids ----
export function createAdminSelect(key, productId) {
  return axiosClient.post("/admin-selects/create", {
    key,
    product_id: productId,
  });
}

export function saveAdminSelectBulk(key, ids) {
  return Promise.all(ids.map((id) => createAdminSelect(key, id)));
}
