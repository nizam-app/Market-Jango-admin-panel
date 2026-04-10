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
