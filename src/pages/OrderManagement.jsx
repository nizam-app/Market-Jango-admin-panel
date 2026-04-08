// src/pages/OrderManagement.jsx — admin order list with filters (GET /all/order)
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  CalendarRange,
  ChevronRight,
  Filter,
  Loader2,
  MapPin,
  Store,
} from "lucide-react";
import { getAllOrders, getOrderItemStatuses, parseAllOrdersResponse } from "../api/orderApi";
import { getActiveVendors } from "../api/vendorAPI";
import { getZones } from "../api/adminApi";

const BRAND = "#FF8C00";
const BRAND_SOFT = "rgba(255, 140, 0, 0.12)";

function statusBadgeClass(s) {
  const v = (s || "").toLowerCase();
  const map = {
    pending: "bg-amber-50 text-amber-800 ring-amber-200",
    processing: "bg-blue-50 text-blue-800 ring-blue-200",
    completed: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    assigned: "bg-indigo-50 text-indigo-800 ring-indigo-200",
    delivered: "bg-green-50 text-green-800 ring-green-200",
    cancelled: "bg-red-50 text-red-800 ring-red-200",
    returned: "bg-violet-50 text-violet-800 ring-violet-200",
  };
  return map[v] || "bg-gray-100 text-gray-700 ring-gray-200";
}

const inputClass =
  "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white text-gray-900 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/35 focus:border-[#FF8C00]/50 disabled:opacity-50 disabled:cursor-not-allowed";
const selectClass =
  "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white text-gray-900 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/35 focus:border-[#FF8C00]/50 disabled:opacity-50 cursor-pointer";

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [meta, setMeta] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
  });

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [status, setStatus] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [zoneId, setZoneId] = useState("");

  const [statuses, setStatuses] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [zones, setZones] = useState([]);
  const [filterOptionsLoading, setFilterOptionsLoading] = useState(true);

  const sortedVendors = useMemo(() => {
    return [...vendors].sort((a, b) =>
      (a.business_name || "").localeCompare(b.business_name || "", undefined, {
        sensitivity: "base",
      })
    );
  }, [vendors]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setFilterOptionsLoading(true);
        const [stRes, vRes, zRes] = await Promise.all([
          getOrderItemStatuses(),
          getActiveVendors({ per_page: 500, page: 1 }),
          getZones(100),
        ]);
        if (cancelled) return;
        setStatuses(stRes?.data?.data?.statuses || []);
        const vPag = vRes?.data?.data;
        setVendors(Array.isArray(vPag?.data) ? vPag.data : []);
        const zPag = zRes?.data?.data;
        setZones(Array.isArray(zPag?.data) ? zPag.data : []);
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setStatuses([]);
          setVendors([]);
          setZones([]);
        }
      } finally {
        if (!cancelled) setFilterOptionsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const fetchOrders = async (page = 1, filterSnapshot = null) => {
    const f = filterSnapshot ?? {
      fromDate,
      toDate,
      status,
      vendorId,
      zoneId,
    };
    try {
      setLoading(true);
      setError("");
      const params = { page };
      if (f.fromDate) params.from_date = f.fromDate;
      if (f.toDate) params.to_date = f.toDate;
      if (String(f.status || "").trim()) params.status = String(f.status).trim();
      if (String(f.vendorId || "").trim()) params.vendor_id = String(f.vendorId).trim();
      if (String(f.zoneId || "").trim()) params.zone_id = String(f.zoneId).trim();

      const res = await getAllOrders(params);
      const { list, meta: m } = parseAllOrdersResponse(res);
      setOrders(list);
      setMeta({
        current_page: m?.current_page || 1,
        last_page: m?.last_page || 1,
        total: m?.total ?? list.length,
      });
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || e.message || "Failed to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const hasActiveFilters =
    Boolean(fromDate || toDate || status || vendorId || zoneId);

  const clearFilters = () => {
    setFromDate("");
    setToDate("");
    setStatus("");
    setVendorId("");
    setZoneId("");
    fetchOrders(1, {
      fromDate: "",
      toDate: "",
      status: "",
      vendorId: "",
      zoneId: "",
    });
  };

  useEffect(() => {
    fetchOrders(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="px-4 sm:px-6 py-5 max-w-[1600px] mx-auto space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex gap-4">
          <div
            className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm"
            style={{ backgroundColor: BRAND_SOFT }}
          >
            <Filter className="w-6 h-6" style={{ color: BRAND }} aria-hidden />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#343C6A]">
              Order management
            </h1>
            <p className="text-sm text-gray-500 mt-1 max-w-xl">
              Filter by date range, order status, vendor, and delivery zone. Results load from{" "}
              <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">
                GET /all/order
              </code>
              .
            </p>
          </div>
        </div>
        <Link
          to="/track-order"
          className="inline-flex items-center justify-center gap-1.5 self-start sm:self-center text-sm font-medium px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-[#343C6A] shadow-sm hover:bg-gray-50 hover:border-gray-300 transition"
        >
          Track order view
          <ChevronRight className="w-4 h-4 opacity-70" aria-hidden />
        </Link>
      </div>

      {/* Filters */}
      <section
        className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden"
        aria-labelledby="order-filters-heading"
      >
        <div
          className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3"
          style={{ background: `linear-gradient(90deg, ${BRAND_SOFT} 0%, transparent 55%)` }}
        >
          <div className="flex items-center gap-2">
            <CalendarRange className="w-5 h-5 text-gray-500" aria-hidden />
            <h2 id="order-filters-heading" className="text-sm font-semibold text-[#343C6A]">
              Filters
            </h2>
            {filterOptionsLoading && (
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" aria-label="Loading options" />
            )}
          </div>
        </div>

        <div className="p-5 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-5 xl:gap-6">
            {/* Date range */}
            <div className="md:col-span-2 xl:col-span-4">
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-2">
                <CalendarRange className="w-3.5 h-3.5" aria-hidden />
                Date range
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="sr-only">From date</span>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <span className="sr-only">To date</span>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="md:col-span-1 xl:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-2">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={filterOptionsLoading}
                className={selectClass}
              >
                <option value="">All statuses</option>
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Zone */}
            <div className="md:col-span-1 xl:col-span-3">
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-2">
                <MapPin className="w-3.5 h-3.5" aria-hidden />
                Zone
              </label>
              <select
                value={zoneId}
                onChange={(e) => setZoneId(e.target.value)}
                disabled={filterOptionsLoading}
                className={selectClass}
              >
                <option value="">All zones</option>
                {zones.map((z) => (
                  <option key={z.id} value={String(z.id)}>
                    {z.name || `Zone #${z.id}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Vendor */}
            <div className="md:col-span-2 xl:col-span-3">
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-2">
                <Store className="w-3.5 h-3.5" style={{ color: BRAND }} aria-hidden />
                Vendor
              </label>
              <select
                value={vendorId}
                onChange={(e) => setVendorId(e.target.value)}
                disabled={filterOptionsLoading}
                className={selectClass}
                aria-label="Filter by vendor"
              >
                <option value="">All vendors</option>
                {sortedVendors.map((v) => (
                  <option key={v.id} value={String(v.id)}>
                    {v.business_name || `Vendor #${v.id}`}
                  </option>
                ))}
              </select>
              {vendors.length === 0 && !filterOptionsLoading && (
                <p className="text-xs text-amber-700 mt-1.5">No vendors loaded.</p>
              )}
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={clearFilters}
              disabled={!hasActiveFilters || loading}
              className="text-sm font-medium text-gray-500 hover:text-gray-800 disabled:opacity-40 disabled:pointer-events-none self-start sm:self-auto"
            >
              Clear all filters
            </button>
            <button
              type="button"
              onClick={() => fetchOrders(1)}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white rounded-xl shadow-md shadow-orange-200/50 hover:brightness-105 active:scale-[0.99] transition disabled:opacity-60 disabled:pointer-events-none w-full sm:w-auto"
              style={{ backgroundColor: BRAND }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                  Loading…
                </>
              ) : (
                <>
                  <Filter className="w-4 h-4 opacity-90" aria-hidden />
                  Apply filters
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {error && (
        <div
          className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-[#F4F7FB] border-b border-[#E6EEF6]">
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[#5a6489]">
                  ID
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[#5a6489]">
                  Order #
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[#5a6489]">
                  Product
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[#5a6489]">
                  Vendor
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[#5a6489]">
                  Qty
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[#5a6489]">
                  Total
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[#5a6489]">
                  Status
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[#5a6489]">
                  Driver
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[#5a6489]">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center">
                    <span className="inline-flex items-center gap-2 text-gray-500">
                      <Loader2 className="w-5 h-5 animate-spin text-[#FF8C00]" aria-hidden />
                      Loading orders…
                    </span>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center text-gray-500">
                    No orders match your filters.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr
                    key={o.id}
                    className="hover:bg-[#FAFCFF] transition-colors border-b border-gray-50 last:border-0"
                  >
                    <td className="px-4 py-3.5 font-medium text-[#343C6A] tabular-nums">{o.id}</td>
                    <td className="px-4 py-3.5 text-gray-800 font-mono text-xs">
                      {o.invoice?.order_number || o.invoice_id || "—"}
                    </td>
                    <td
                      className="px-4 py-3.5 max-w-[200px] truncate text-gray-800"
                      title={o.product?.name}
                    >
                      {o.product?.name || "—"}
                    </td>
                    <td className="px-4 py-3.5 text-gray-800">
                      {o.vendor?.business_name || o.vendor?.user?.name || "—"}
                    </td>
                    <td className="px-4 py-3.5 tabular-nums text-gray-700">{o.quantity ?? "—"}</td>
                    <td className="px-4 py-3.5 tabular-nums text-gray-800 font-medium">
                      {o.total_pay ?? "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ring-1 ring-inset ${statusBadgeClass(o.status)}`}
                      >
                        {o.status || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600">
                      {o.driver?.name || o.driver?.user?.name || (o.driver_id != null ? `#${o.driver_id}` : "—")}
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap text-xs">
                      {o.created_at ? new Date(o.created_at).toLocaleString() : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {meta.last_page > 1 && (
          <div className="px-4 py-3.5 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-600 bg-gray-50/50">
            <span>
              Page <strong className="text-gray-800">{meta.current_page}</strong> of{" "}
              <strong className="text-gray-800">{meta.last_page}</strong>
              <span className="text-gray-400 mx-1">·</span>
              {meta.total} items
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={loading || meta.current_page <= 1}
                onClick={() => fetchOrders(meta.current_page - 1)}
                className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-xl bg-white hover:bg-gray-50 disabled:opacity-40 transition"
              >
                Prev
              </button>
              <button
                type="button"
                disabled={loading || meta.current_page >= meta.last_page}
                onClick={() => fetchOrders(meta.current_page + 1)}
                className="px-4 py-2 text-sm font-medium text-white rounded-xl shadow-sm disabled:opacity-40 transition hover:brightness-105"
                style={{ backgroundColor: BRAND }}
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

export default OrderManagement;
