// src/api/driverAdminApi.js — admin drivers list + assignments
import axiosClient from "./axiosClient";

function cleanParams(obj = {}) {
  const clean = {};
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== "" && v != null && v !== undefined) clean[k] = v;
  });
  return clean;
}

/** GET /drivers — all drivers + live location */
export const getAdminDriversList = () => {
  return axiosClient.get("/drivers");
};

/**
 * GET /driver-assignments
 * @param {Object} params — status, driver_id, vendor_id, invoice_item_id, zone_id, location, search, page
 */
export const getDriverAssignments = (params = {}) => {
  return axiosClient.get("/driver-assignments", { params: cleanParams(params) });
};

/**
 * GET /driver-assignments/export — CSV download (same filters as list)
 */
export const exportDriverAssignments = (params = {}) => {
  const p = { ...params };
  delete p.page;
  return axiosClient.get("/driver-assignments/export", {
    params: cleanParams(p),
    responseType: "blob",
  });
};

/**
 * POST /driver-assignments/{id}/reassign
 * @param {number|string} assignmentId
 * @param {Object} body — e.g. { driver_id: 5 } or {}
 */
export const reassignDriverAssignment = (assignmentId, body = {}) => {
  return axiosClient.post(`/driver-assignments/${assignmentId}/reassign`, body);
};

/** Trigger browser download from an axios blob response */
export function downloadBlobResponse(res, fallbackName = "driver-assignments.csv") {
  const blob = res?.data instanceof Blob ? res.data : new Blob([res?.data || ""], { type: "text/csv" });
  let filename = fallbackName;
  const disposition = res?.headers?.["content-disposition"] || res?.headers?.["Content-Disposition"];
  if (disposition) {
    const match = /filename\*?=(?:UTF-8''|")?([^\";]+)/i.exec(disposition);
    if (match?.[1]) {
      filename = decodeURIComponent(match[1].replace(/"/g, "").trim());
    }
  }
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
