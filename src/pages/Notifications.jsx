// src/pages/Notifications.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import {
  fetchNotificationsPaginated,
  fetchZonesForFilters,
  markNotificationRead,
  isNotificationUnread,
} from "../api/notificationApi";

const BRAND = "#FF8C00";

const Notifications = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [zones, setZones] = useState([]);
  const [zoneFilter, setZoneFilter] = useState("all"); // all | none | id (zones table)
  const [readFilter, setReadFilter] = useState("all"); // all | unread | read
  const [page, setPage] = useState(1);
  const [perPage] = useState(15);
  const [meta, setMeta] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
  });

  const readParam = useMemo(() => {
    if (readFilter === "read") return "1";
    if (readFilter === "unread") return "0";
    return undefined;
  }, [readFilter]);

  const zoneQueryParam = useMemo(() => {
    if (zoneFilter === "all") return undefined;
    if (zoneFilter === "none") return "none";
    return zoneFilter;
  }, [zoneFilter]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        per_page: perPage,
      };
      if (zoneQueryParam !== undefined) params.zone_id = zoneQueryParam;
      if (readParam !== undefined) params.read = readParam;

      const paginated = await fetchNotificationsPaginated(params);
      if (!paginated) {
        setRows([]);
        setMeta({ current_page: 1, last_page: 1, total: 0 });
        return;
      }
      setRows(paginated.data || []);
      setMeta({
        current_page: paginated.current_page ?? 1,
        last_page: paginated.last_page ?? 1,
        total: paginated.total ?? 0,
      });
    } catch (e) {
      console.error(e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [page, perPage, zoneQueryParam, readParam]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetchZonesForFilters();
        if (!cancelled) setZones(r);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const formatDateTime = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString();
  };

  const handleMarkRead = async (item) => {
    if (!isNotificationUnread(item)) return;
    setRows((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, is_read: true } : n))
    );
    try {
      await markNotificationRead(item.id);
    } catch (e) {
      console.error(e);
      load();
    }
  };

  return (
    <div className="space-y-6 px-6 py-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 uppercase tracking-wide">
            Notifications
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            All in-app alerts for your admin account. Filter by{" "}
            <strong className="font-medium text-gray-600">zone</strong> (delivery
            zones). Older rows may have no zone until they are tagged.
          </p>
        </div>
        <button
          type="button"
          onClick={() => load()}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="bg-white border border-[#E6EEF6] rounded-xl p-4 shadow-sm flex flex-wrap gap-4 items-end">
        <div className="min-w-[200px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Zone
          </label>
          <select
            value={zoneFilter}
            onChange={(e) => {
              setPage(1);
              setZoneFilter(e.target.value);
            }}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:ring-2 focus:ring-orange-200 focus:border-[#FF8C00] outline-none"
          >
            <option value="all">All zones</option>
            <option value="none">No zone set</option>
            {zones.map((z) => (
              <option key={z.id} value={String(z.id)}>
                {z.name || `Zone #${z.id}`}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-[180px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Status
          </label>
          <select
            value={readFilter}
            onChange={(e) => {
              setPage(1);
              setReadFilter(e.target.value);
            }}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:ring-2 focus:ring-orange-200 focus:border-[#FF8C00] outline-none"
          >
            <option value="all">All</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-[#E6EEF6] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E6EEF6] text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold">Message</th>
                <th className="px-4 py-3 font-semibold">Zone / region</th>
                <th className="px-4 py-3 font-semibold">From</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No notifications match your filters.
                  </td>
                </tr>
              )}
              {rows.map((item) => (
                <tr
                  key={item.id}
                  className={`border-b border-[#F1F5F9] last:border-0 ${
                    isNotificationUnread(item) ? "bg-[#F5F7FB]" : "bg-white"
                  }`}
                >
                  <td className="px-4 py-3 font-semibold text-[#003158] align-top max-w-[180px]">
                    {item.name || "Notification"}
                  </td>
                  <td className="px-4 py-3 text-[#5D768A] align-top max-w-md">
                    {item.message}
                  </td>
                  <td className="px-4 py-3 text-gray-700 align-top whitespace-nowrap">
                    {item.zone?.name || item.route?.name || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600 align-top whitespace-nowrap">
                    {item.sender?.name || "System"}
                  </td>
                  <td className="px-4 py-3 text-gray-500 align-top whitespace-nowrap text-xs">
                    {formatDateTime(item.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right align-top">
                    {isNotificationUnread(item) ? (
                      <button
                        type="button"
                        onClick={() => handleMarkRead(item)}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg text-white"
                        style={{ backgroundColor: BRAND }}
                      >
                        Mark read
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">Read</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {meta.last_page > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#E6EEF6] bg-[#FAFBFC] text-sm text-gray-600">
            <span>
              Page {meta.current_page} of {meta.last_page} ({meta.total} total)
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={meta.current_page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white disabled:opacity-40 hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={meta.current_page >= meta.last_page || loading}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white disabled:opacity-40 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
