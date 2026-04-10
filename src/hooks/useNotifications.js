// src/hooks/useNotifications.js
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router";
import {
  fetchNotifications,
  markNotificationRead as markNotificationReadApi,
  isNotificationUnread,
} from "../api/notificationApi";

const POLL_MS = 90_000;
const DISPLAY_LIMIT = 50;

/**
 * In-app admin notifications: list, unread badge, polling, refetch on route change.
 */
export function useNotifications() {
  const { pathname } = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await fetchNotifications();
      setNotifications(list);
    } catch (e) {
      console.error("Failed to load notifications", e);
      setError(
        e?.response?.data?.message ||
          e?.message ||
          "Failed to load notifications"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [pathname, refresh]);

  useEffect(() => {
    const t = setInterval(() => {
      refresh();
    }, POLL_MS);
    return () => clearInterval(t);
  }, [refresh]);

  const displayNotifications = useMemo(
    () => notifications.slice(0, DISPLAY_LIMIT),
    [notifications]
  );

  const unreadCount = useMemo(
    () => notifications.filter(isNotificationUnread).length,
    [notifications]
  );

  const markRead = useCallback(async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    try {
      await markNotificationReadApi(id);
    } catch (e) {
      console.error("Failed to mark notification as read", e);
    }
  }, []);

  return {
    notifications,
    displayNotifications,
    unreadCount,
    loading,
    error,
    refresh,
    markRead,
    isNotificationUnread,
  };
}
