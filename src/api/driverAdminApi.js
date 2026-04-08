// src/api/driverAdminApi.js — admin drivers list + assignments
import axiosClient from "./axiosClient";

/** GET /drivers — all drivers + live location */
export const getAdminDriversList = () => {
  return axiosClient.get("/drivers");
};

/**
 * GET /driver-assignments
 * @param {Object} params — status, page, etc.
 */
export const getDriverAssignments = (params = {}) => {
  const clean = {};
  Object.entries(params).forEach(([k, v]) => {
    if (v !== "" && v != null && v !== undefined) clean[k] = v;
  });
  return axiosClient.get("/driver-assignments", { params: clean });
};

/**
 * POST /driver-assignments/{id}/reassign
 * @param {number|string} assignmentId
 * @param {Object} body — e.g. { driver_id: 5 } or {}
 */
export const reassignDriverAssignment = (assignmentId, body = {}) => {
  return axiosClient.post(`/driver-assignments/${assignmentId}/reassign`, body);
};
