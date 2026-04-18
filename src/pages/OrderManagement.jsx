// src/pages/OrderManagement.jsx — admin order list with filters (GET /all/order)
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  CalendarRange,
  ChevronRight,
  Filter,
  Loader2,
  MapPin,
  Pencil,
  Store,
} from "lucide-react";
import { getAllOrders, getOrderItemStatuses, parseAllOrdersResponse } from "../api/orderApi";
import { getActiveVendors } from "../api/vendorAPI";
import { getZones } from "../api/adminApi";
import OrderEditModal from "../components/orders/OrderEditModal";

const BRAND = "#FF8C00";
const BRAND_SOFT = "rgba(255, 140, 0, 0.12)";

function sellingModeLabel(mode) {
  const m = String(mode || "").toLowerCase().replace(/_/g, "-");
  if (m === "marketplace") return "Marketplace";
  if (m === "walkin" || m === "walk-in" || m === "walking") return "Walk-in";
  return mode ? String(mode) : "—";
}

function sellingModeBadgeClass(mode) {
  const m = String(mode || "").toLowerCase();
  if (m === "marketplace") return "bg-sky-50 text-sky-900 ring-sky-200/80";
  if (m === "walkin" || m === "walk-in" || m === "walking" || m === "walk_in") return "bg-violet-50 text-violet-900 ring-violet-200/80";
  return "bg-gray-100 text-gray-700 ring-gray-200";
}

/** Customer display name for a list row (invoice header or line-level fields). */
function orderLineCustomerName(o) {
  const raw =
    o.invoice?.cus_name ||
    o.invoice?.customer_name ||
    o.invoice?.user?.name ||
    o.cus_name ||
    o.customer_name ||
    o.user?.name ||
    "";
  const s = String(raw).trim();
  return s || "—";
}

function groupCustomerLabel(lines) {
  const names = [...new Set(lines.map(orderLineCustomerName).filter((n) => n && n !== "—"))];
  if (names.length === 0) return "—";
  if (names.length === 1) return names[0];
  return names.join(" · ");
}

/** Dedupe key: same order # + same vendor → show order # once in the table. */
function orderVendorGroupKey(o) {
  const orderNo = String(o.invoice?.order_number || "").trim();
  const invPart = orderNo || (o.invoice_id != null ? `invoice:${o.invoice_id}` : "");
  const vid = o.vendor_id ?? o.vendor?.id ?? "";
  return `${invPart}::${vid}`;
}

function sumLineQuantity(lines) {
  return lines.reduce((s, l) => s + (Number(l.quantity) || 0), 0);
}

function sumLineTotalPay(lines) {
  return lines.reduce((s, l) => s + (Number(l.total_pay) || 0), 0);
}

function earliestCreatedAt(lines) {
  const ts = lines
    .map((l) => (l.created_at ? new Date(l.created_at).getTime() : NaN))
    .filter((n) => Number.isFinite(n));
  if (!ts.length) return null;
  return new Date(Math.min(...ts));
}

function uniqueStatuses(lines) {
  return [...new Set(lines.map((l) => l.status).filter((s) => s != null && String(s) !== ""))];
}

function firstDriverLabel(lines) {
  for (const o of lines) {
    const d =
      o.driver?.user?.name || o.driver?.name || (o.driver_id != null ? `#${o.driver_id}` : null);
    if (d && d !== "—") return d;
  }
  return "—";
}

function firstSellingMode(lines) {
  return lines[0]?.selling_mode;
}

function sellingModesConflict(lines) {
  const u = new Set(lines.map((l) => String(l.selling_mode ?? "")));
  return u.size > 1;
}

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
  const [sellingMode, setSellingMode] = useState("");
  const [orderNumber, setOrderNumber] = useState("");

  const [statuses, setStatuses] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [zones, setZones] = useState([]);
  const [filterOptionsLoading, setFilterOptionsLoading] = useState(true);
  const [editOrder, setEditOrder] = useState(null);

  const sortedVendors = useMemo(() => {
    return [...vendors].sort((a, b) =>
      (a.business_name || "").localeCompare(b.business_name || "", undefined, {
        sensitivity: "base",
      })
    );
  }, [vendors]);

  /**
   * Sort then merge lines that share the same order # (or invoice id) + vendor → one table row.
   * Edit still uses the first line’s id (edit-context loads the whole invoice).
   */
  const groupedOrderRows = useMemo(() => {
    if (!orders.length) return [];
    const sorted = [...orders].sort((a, b) => {
      const an = String(a.invoice?.order_number || "").trim();
      const bn = String(b.invoice?.order_number || "").trim();
      if (an !== bn) return an.localeCompare(bn, undefined, { numeric: true });
      const av = Number(a.vendor_id ?? a.vendor?.id ?? 0);
      const bv = Number(b.vendor_id ?? b.vendor?.id ?? 0);
      if (av !== bv) return av - bv;
      return Number(a.id ?? 0) - Number(b.id ?? 0);
    });
    const groups = [];
    for (const o of sorted) {
      const orderNo = String(o.invoice?.order_number || "").trim();
      const invPart = orderNo || (o.invoice_id != null ? `invoice:${o.invoice_id}` : "");
      const key = invPart ? orderVendorGroupKey(o) : null;
      const last = groups[groups.length - 1];
      if (key && last && orderVendorGroupKey(last.lines[0]) === key) {
        last.lines.push(o);
      } else {
        groups.push({ lines: [o] });
      }
    }
    return groups;
  }, [orders]);

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
      sellingMode,
      orderNumber,
    };
    try {
      setLoading(true);
      setError("");
      const params = { page, per_page: 20 };
      if (f.fromDate) params.from_date = f.fromDate;
      if (f.toDate) params.to_date = f.toDate;
      if (String(f.status || "").trim()) params.status = String(f.status).trim();
      if (String(f.vendorId || "").trim()) params.vendor_id = String(f.vendorId).trim();
      if (String(f.zoneId || "").trim()) params.zone_id = String(f.zoneId).trim();
      if (String(f.sellingMode || "").trim()) params.selling_mode = String(f.sellingMode).trim();
      if (String(f.orderNumber || "").trim()) params.order_number = String(f.orderNumber).trim();

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

  const hasActiveFilters = Boolean(
    fromDate || toDate || status || vendorId || zoneId || sellingMode || orderNumber
  );

  const clearFilters = () => {
    setFromDate("");
    setToDate("");
    setStatus("");
    setVendorId("");
    setZoneId("");
    setSellingMode("");
    setOrderNumber("");
    fetchOrders(1, {
      fromDate: "",
      toDate: "",
      status: "",
      vendorId: "",
      zoneId: "",
      sellingMode: "",
      orderNumber: "",
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
              {/* <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">
                GET /all/order
              </code> */}
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

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-5 xl:gap-6">
            <div className="md:col-span-2 xl:col-span-4">
              <label className="block text-xs font-medium text-gray-600 mb-2">Order number</label>
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="e.g. ORD-2026…"
                className={inputClass}
                autoComplete="off"
              />
            </div>
            <div className="md:col-span-1 xl:col-span-3">
              <label className="block text-xs font-medium text-gray-600 mb-2">Selling mode</label>
              <select
                value={sellingMode}
                onChange={(e) => setSellingMode(e.target.value)}
                className={selectClass}
                aria-label="Filter by selling mode"
              >
                <option value="">All modes</option>
                <option value="marketplace">Marketplace</option>
                <option value="walk_in">Walk-in</option>
              </select>
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

      {/* Table — rows grouped by order # + vendor; customer column replaces product list */}
      <div className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm">
        {!loading && orders.length > 0 && groupedOrderRows.length < orders.length && (
          <p className="text-xs text-gray-600 px-4 py-2.5 bg-amber-50/60 border-b border-amber-100/80">
            <strong>{groupedOrderRows.length}</strong> row(s) shown — <strong>{orders.length}</strong> line
            items merged where order # and vendor match.
          </p>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-[#F4F7FB] border-b border-[#E6EEF6]">
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[#5a6489]">
                  Line ID(s)
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[#5a6489]">
                  Order #
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[#5a6489]">
                  Customer name
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
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[#5a6489] whitespace-nowrap">
                  Selling mode
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[#5a6489]">
                  Created
                </th>
                <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-[#5a6489]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={11} className="px-4 py-16 text-center">
                    <span className="inline-flex items-center gap-2 text-gray-500">
                      <Loader2 className="w-5 h-5 animate-spin text-[#FF8C00]" aria-hidden />
                      Loading orders…
                    </span>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-16 text-center text-gray-500">
                    No orders match your filters.
                  </td>
                </tr>
              ) : (
                groupedOrderRows.map((group) => {
                  const lines = group.lines;
                  const o = lines[0];
                  const rowKey = lines.map((l) => l.id).join("-");
                  const orderNoDisplay = o.invoice?.order_number || o.invoice_id || "—";
                  const orderNoTooltip =
                    o.invoice?.order_number ||
                    (o.invoice_id != null ? `Invoice #${o.invoice_id}` : "");
                  const customer = groupCustomerLabel(lines);
                  const productSummary = lines
                    .map((l) => l.product?.name)
                    .filter(Boolean)
                    .join(", ");
                  const qtySum = sumLineQuantity(lines);
                  const totalSum = sumLineTotalPay(lines);
                  const stList = uniqueStatuses(lines);
                  const createdEarliest = earliestCreatedAt(lines);
                  const mode = firstSellingMode(lines);
                  const modeTitle = sellingModesConflict(lines)
                    ? lines.map((l) => `${l.selling_mode || "—"}`).join(" · ")
                    : mode != null
                      ? String(mode)
                      : undefined;
                  const editTarget = o;

                  return (
                    <tr
                      key={rowKey}
                      className="hover:bg-[#FAFCFF] transition-colors border-b border-gray-50 last:border-0"
                    >
                      <td
                        className="px-4 py-3.5 font-medium text-[#343C6A] tabular-nums text-xs max-w-[8rem]"
                        title={lines.length > 1 ? `Merged ${lines.length} lines` : undefined}
                      >
                        {lines.map((l) => l.id).join(", ")}
                      </td>
                      <td
                        className="px-4 py-3.5 text-gray-800 font-mono text-xs max-w-[11rem] truncate"
                        title={orderNoTooltip || undefined}
                      >
                        {orderNoDisplay}
                      </td>
                      <td
                        className="px-4 py-3.5 max-w-[220px] truncate text-gray-800"
                        title={
                          customer !== "—"
                            ? productSummary
                              ? `${customer} — Products: ${productSummary}`
                              : customer
                            : productSummary || undefined
                        }
                      >
                        {customer}
                      </td>
                      <td className="px-4 py-3.5 text-gray-800">
                        {o.vendor?.business_name || o.vendor?.user?.name || "—"}
                      </td>
                      <td className="px-4 py-3.5 tabular-nums text-gray-700">{qtySum || "—"}</td>
                      <td className="px-4 py-3.5 tabular-nums text-gray-800 font-medium">
                        {Number.isFinite(totalSum)
                          ? totalSum.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          : "—"}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {stList.length ? (
                            stList.map((st) => (
                              <span
                                key={st}
                                className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ring-1 ring-inset ${statusBadgeClass(st)}`}
                                title={lines.length > 1 ? `Statuses on merged lines: ${stList.join(", ")}` : undefined}
                              >
                                {st}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-gray-600">{firstDriverLabel(lines)}</td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ring-1 ring-inset ${sellingModeBadgeClass(mode)}`}
                          title={modeTitle}
                        >
                          {sellingModeLabel(mode)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap text-xs">
                        {createdEarliest ? createdEarliest.toLocaleString() : "—"}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => setEditOrder(editTarget)}
                          className="inline-flex items-center justify-center gap-1.5 text-sm font-medium px-3 py-2 rounded-xl border border-gray-200 text-[#343C6A] bg-white hover:bg-gray-50 transition"
                          title={
                            lines.length > 1
                              ? `Edit invoice (opens with line #${editTarget.id}; ${lines.length} items)`
                              : undefined
                          }
                        >
                          <Pencil className="w-3.5 h-3.5 opacity-80" aria-hidden />
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })
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

      <OrderEditModal
        invoiceItemId={editOrder?.id ?? null}
        onClose={() => setEditOrder(null)}
        brand={BRAND}
        onRefreshTable={() => fetchOrders(meta.current_page)}
      />
    </div>
  );
};

export default OrderManagement;
