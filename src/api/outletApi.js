import axiosClient from "./axiosClient";

// ── Admin: outlet CRUD ──────────────────────────────────────────────────────
export const getAdminOutlets = (params = {}) =>
  axiosClient.get("/admin/outlets", { params });

export const createAdminOutlet = (data) =>
  axiosClient.post("/admin/outlets", data);

export const updateAdminOutlet = (id, data) =>
  axiosClient.put(`/admin/outlets/${id}`, data);

export const updateAdminOutletStatus = (id, status) =>
  axiosClient.patch(`/admin/outlets/${id}/status`, { status });

export const resetAdminOutletPassword = (id, data) =>
  axiosClient.post(`/admin/outlets/${id}/password-reset`, data);

// ── Outlet panel ────────────────────────────────────────────────────────────
export const getOutletMe = () => axiosClient.get("/outlet/me");

export const getOutletOrders = (params = {}) =>
  axiosClient.get("/outlet/orders", { params });

export const getOutletOrder = (id) =>
  axiosClient.get(`/outlet/orders/${id}`);

export const moveOrderToBin = (id) =>
  axiosClient.post(`/outlet/orders/${id}/to-bin`);

export const assignOutletDriver = (id, driverId) =>
  axiosClient.post(`/outlet/orders/${id}/assign-driver`, { driver_id: driverId });

export const forwardOutletOrder = (id, targetOutletId) =>
  axiosClient.post(`/outlet/orders/${id}/forward`, { target_outlet_id: targetOutletId });

export const updateOutletOrderStatus = (id, status) =>
  axiosClient.put(`/outlet/orders/${id}/status`, { status });

export const getOutletBin = (params = {}) =>
  axiosClient.get("/outlet/bin", { params });

export const getOutletDrivers = () =>
  axiosClient.get("/outlet/drivers");

export const getOutletPendingDrivers = () =>
  axiosClient.get("/outlet/drivers/pending");

export const approveOutletDriver = (driverId, maxConcurrent) =>
  axiosClient.post(`/outlet/drivers/${driverId}/approve`, {
    max_concurrent_orders: maxConcurrent,
  });

export const rejectOutletDriver = (driverId) =>
  axiosClient.post(`/outlet/drivers/${driverId}/reject`);

export const suspendOutletDriver = (driverId) =>
  axiosClient.post(`/outlet/drivers/${driverId}/suspend`);

export const getOutletSuspendedDrivers = () =>
  axiosClient.get("/outlet/drivers/suspended");

export const setOutletDriverLimits = (driverId, maxConcurrent) =>
  axiosClient.put(`/outlet/drivers/${driverId}/limits`, {
    max_concurrent_orders: maxConcurrent,
  });

export const getOutletAssignments = (params = {}) =>
  axiosClient.get("/outlet/assignments", { params });

export const getActiveOutletsForForward = () =>
  axiosClient.get("/outlet/outlets/active");
