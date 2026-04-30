// src/api/notificationApi.js
import axiosClient from "./axiosClient";

/**
 * @typedef {Object} NotificationSender
 * @property {number} id
 * @property {string} [name]
 * @property {string} [email]
 */

/**
 * @typedef {Object} AdminNotification
 * @property {number} id
 * @property {string} [name]
 * @property {string} [message]
 * @property {boolean|number|string} [is_read]
 * @property {number} [sender_id]
 * @property {number} [receiver_id]
 * @property {string} [created_at]
 * @property {NotificationSender} [sender]
 * @property {{ id: number, name?: string }} [zone]
 * @property {{ id: number, name?: string }} [route] driving route (Route Management)
 */

/** Unread unless explicitly read (supports Laravel 0/1 or boolean). */
export function isNotificationUnread(n) {
  if (n == null) return false;
  const r = n.is_read;
  if (r === true || r === 1 || r === "1") return false;
  if (r === false || r === 0 || r === "0") return true;
  return true;
}

function sortNewestFirst(/** @type {AdminNotification[]} */ list) {
  return [...list].sort((a, b) => {
    const ta = new Date(a.created_at || 0).getTime();
    const tb = new Date(b.created_at || 0).getTime();
    return tb - ta;
  });
}

/**
 * GET /notification/ — { status, message, data: array | null }
 * @returns {Promise<AdminNotification[]>}
 */
export async function fetchNotifications() {
  const res = await axiosClient.get("/notification/");
  const raw = res?.data?.data;
  const arr = Array.isArray(raw) ? raw : [];
  return sortNewestFirst(arr);
}

/**
 * Paginated admin notifications with optional route / zone + read filters.
 * GET /notification/?page=&per_page=&route_id=&zone_id=&read=
 * route_id — driving routes from Route Management (`routes` table). Use same names as list there.
 * zone_id — geographic zones (`zones` table); legacy / optional second dimension.
 * @param {{ page?: number, per_page?: number, route_id?: string|number, zone_id?: string|number, read?: string }} params
 * @returns {Promise<{ data: AdminNotification[], current_page: number, last_page: number, per_page: number, total: number }|null>}
 */
export async function fetchNotificationsPaginated(params = {}) {
  const res = await axiosClient.get("/notification/", { params });
  const payload = res?.data?.data;
  if (!payload || typeof payload !== "object") return null;
  if (!Array.isArray(payload.data)) return null;
  return payload;
}

/**
 * Driving routes — same list as Route Management ("Save Driving Route List").
 * GET /route/?per_page=500
 * @returns {Promise<Array<{ id: number, name: string }>>}
 */
export async function fetchDrivingRoutesForFilters() {
  const res = await axiosClient.get("/route/", { params: { per_page: 500 } });
  const payload = res?.data?.data;
  if (payload?.data && Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
}

/**
 * Geographic delivery zones (map radius areas) — different from driving routes.
 * @returns {Promise<Array<{ id: number, name: string }>>}
 */
export async function fetchZonesForFilters() {
  const res = await axiosClient.get("/zones/", { params: { per_page: 500 } });
  const payload = res?.data?.data;
  if (payload?.data && Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
}

/** @deprecated use fetchNotifications */
export const getNotifications = async () => {
  const list = await fetchNotifications();
  return { data: { data: list } };
};

/**
 * PUT /notification/read/{id}
 * @param {number|string} id
 */
export function markNotificationRead(id) {
  return axiosClient.put(`/notification/read/${id}`);
}
