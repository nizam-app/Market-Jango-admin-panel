// src/components/payment/OrderTransactionsPanel.jsx — GET /reports/order-transactions
import React, { useCallback, useEffect, useState } from "react";
import { Search, RefreshCw } from "lucide-react";
import {
  getOrderTransactions,
  parseOrderTransactionsResponse,
} from "../../api/orderTransactionsReportApi";
import { getZones } from "../../api/adminApi";

const BRAND = "#FF8C00";

const inputClass =
  "w-full min-w-0 max-w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/40 box-border";

function formatMoney(amount, currency) {
  if (amount == null || amount === "") return "—";
  const n = Number(amount);
  const cur = currency || "";
  if (Number.isFinite(n)) {
    const formatted = n.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return cur ? `${formatted} ${cur}` : formatted;
  }
  return cur ? `${amount} ${cur}` : String(amount);
}

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return String(iso);
  }
}

function formatStatusCell(status) {
  if (status == null) return "—";
  if (typeof status === "object" && !Array.isArray(status)) {
    const payment = status.payment ?? status.payment_status;
    const fulfillment = status.fulfillment ?? status.fulfillment_status;
    return (
      <div className="flex flex-col gap-0.5 text-xs">
        {payment != null && (
          <span>
            <span className="text-gray-500">Payment:</span> {String(payment)}
          </span>
        )}
        {fulfillment != null && (
          <span>
            <span className="text-gray-500">Fulfillment:</span> {String(fulfillment)}
          </span>
        )}
        {payment == null && fulfillment == null && (
          <span className="text-gray-600">{JSON.stringify(status)}</span>
        )}
      </div>
    );
  }
  return <span className="capitalize">{String(status)}</span>;
}

function NotesBanner({ notes }) {
  if (notes == null || notes === "") return null;
  let text;
  if (Array.isArray(notes)) text = notes.map((n) => (typeof n === "object" ? JSON.stringify(n) : String(n))).join(" ");
  else if (typeof notes === "object") text = JSON.stringify(notes);
  else text = String(notes);
  if (!text.trim()) return null;
  return (
    <div className="text-sm text-sky-900 bg-sky-50 border border-sky-200 rounded-xl px-4 py-3 flex gap-2">
      <span className="font-semibold shrink-0">Note:</span>
      <span className="text-sky-950">{text}</span>
    </div>
  );
}

export default function OrderTransactionsPanel() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 20,
  });
  const [notes, setNotes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [country, setCountry] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [state, setState] = useState("");
  const [town, setTown] = useState("");
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState(20);
  const [zones, setZones] = useState([]);
  const [zonesLoading, setZonesLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setZonesLoading(true);
        const res = await getZones(100);
        const zpag = res?.data?.data;
        const list = Array.isArray(zpag?.data) ? zpag.data : [];
        if (!cancelled) setZones(list);
      } catch {
        if (!cancelled) setZones([]);
      } finally {
        if (!cancelled) setZonesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const buildParams = useCallback(
    (page) => {
      const params = { page, per_page: perPage };
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;
      if (country.trim()) params.country = country.trim();
      if (zoneId.trim()) params.zone_id = zoneId.trim();
      if (state.trim()) params.state = state.trim();
      if (town.trim()) params.town = town.trim();
      if (search.trim()) params.search = search.trim();
      return params;
    },
    [fromDate, toDate, country, zoneId, state, town, search, perPage]
  );

  const load = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        setError("");
        const res = await getOrderTransactions(buildParams(page));
        const { notes: n, list, meta: m } = parseOrderTransactionsResponse(res);
        setNotes(n ?? null);
        setRows(list);
        setMeta(m);
      } catch (e) {
        console.error(e);
        setError(e?.response?.data?.message || e.message || "Failed to load transactions");
        setRows([]);
        setNotes(null);
      } finally {
        setLoading(false);
      }
    },
    [buildParams]
  );

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial fetch only; filters use Apply
  }, []);

  const applyFilters = () => load(1);

  const rowKey = (row, i) =>
    row.transaction_id != null ? String(row.transaction_id) : `row-${row.invoice_item_id ?? i}-${i}`;

  return (
    <div className="space-y-6">
      <NotesBanner notes={notes} />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-gray-800">Order transactions</h2>
          <span className="text-xs text-gray-500">GET /reports/order-transactions</span>
        </div>

        <div className="p-6 space-y-4 min-w-0 max-w-full">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 min-w-0">
            <div className="min-w-0">
              <label className="block text-xs font-medium text-gray-600 mb-1">Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="All"
                className={inputClass}
              />
            </div>
            <div className="min-w-0">
              <label className="block text-xs font-medium text-gray-600 mb-1">Zone</label>
              <select
                value={zoneId}
                onChange={(e) => setZoneId(e.target.value)}
                disabled={zonesLoading}
                className={inputClass}
              >
                <option value="">All zones</option>
                {zones.map((z) => (
                  <option key={z.id} value={String(z.id)}>
                    {z.name || `Zone ${z.id}`}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-0">
              <label className="block text-xs font-medium text-gray-600 mb-1">State (zone name LIKE)</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="All"
                className={inputClass}
              />
            </div>
            <div className="min-w-0">
              <label className="block text-xs font-medium text-gray-600 mb-1">Town (zone name LIKE)</label>
              <input
                type="text"
                value={town}
                onChange={(e) => setTown(e.target.value)}
                placeholder="All"
                className={inputClass}
                />
            </div>
            <div className="min-w-0">
              <label className="block text-xs font-medium text-gray-600 mb-1">From date</label>
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className={inputClass} />
            </div>
            <div className="min-w-0">
              <label className="block text-xs font-medium text-gray-600 mb-1">To date</label>
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className={inputClass} />
            </div>
            <div className="min-w-0">
              <label className="block text-xs font-medium text-gray-600 mb-1">Per page</label>
              <select
                value={perPage}
                onChange={(e) => setPerPage(Number(e.target.value))}
                className={inputClass}
              >
                {[20, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end gap-3 flex-wrap">
            <div className="flex-1 min-w-0 max-w-xl">
              <label className="block text-xs font-medium text-gray-600 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search…"
                  className={`${inputClass} pl-9`}
                  onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={applyFilters}
                className="px-5 py-2 text-sm font-semibold text-white rounded-lg shadow-sm hover:brightness-105"
                style={{ backgroundColor: BRAND }}
              >
                Apply filters
              </button>
              <button
                type="button"
                onClick={() => load(meta.current_page)}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mx-6 mb-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <div className="overflow-x-auto border-t border-gray-100">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase whitespace-nowrap">Txn ID</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase whitespace-nowrap">Order</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase whitespace-nowrap">Invoice item</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase whitespace-nowrap">Counterparty</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase whitespace-nowrap">Vendor</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase whitespace-nowrap">Payment</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase whitespace-nowrap">Gross</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase whitespace-nowrap">Comm.</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase whitespace-nowrap">Taxes</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase whitespace-nowrap">Affiliate</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase whitespace-nowrap">Vendor/Driver net</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase whitespace-nowrap">Status</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase whitespace-nowrap">Manual</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase whitespace-nowrap">Zone</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase whitespace-nowrap">V. country</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase whitespace-nowrap">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && rows.length === 0 ? (
                <tr>
                  <td colSpan={16} className="px-4 py-12 text-center text-gray-500">
                    Loading…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={16} className="px-4 py-12 text-center text-gray-500">
                    No transactions match your filters.
                  </td>
                </tr>
              ) : (
                rows.map((row, i) => {
                  const cp = row.counterparty || {};
                  const cpLine = [cp.name, cp.role && `(${cp.role})`].filter(Boolean).join(" ");
                  return (
                    <tr key={rowKey(row, i)} className="hover:bg-gray-50/80">
                      <td className="px-3 py-2 font-mono text-xs whitespace-nowrap">{row.transaction_id ?? "—"}</td>
                      <td className="px-3 py-2 text-xs">
                        <div className="font-mono text-gray-900">{row.order_number || "—"}</div>
                        <div className="text-gray-500">{row.order_id ?? ""}</div>
                      </td>
                      <td className="px-3 py-2 text-xs">{row.invoice_item_id ?? "—"}</td>
                      <td className="px-3 py-2 text-xs max-w-[10rem]">
                        <div className="truncate" title={cpLine}>{cpLine || "—"}</div>
                        {cp.user_id != null && <div className="text-gray-400">#{cp.user_id}</div>}
                      </td>
                      <td className="px-3 py-2 text-xs max-w-[8rem]">
                        <div className="truncate">{row.vendor_name || "—"}</div>
                        {row.vendor_id != null && <div className="text-gray-400">id {row.vendor_id}</div>}
                      </td>
                      <td className="px-3 py-2 text-xs capitalize">{row.payment_method ?? "—"}</td>
                      <td className="px-3 py-2 text-xs tabular-nums whitespace-nowrap">
                        {formatMoney(row.gross_amount, row.currency)}
                      </td>
                      <td className="px-3 py-2 text-xs tabular-nums">{formatMoney(row.commission, row.currency)}</td>
                      <td className="px-3 py-2 text-xs tabular-nums">{formatMoney(row.taxes, row.currency)}</td>
                      <td className="px-3 py-2 text-xs tabular-nums">{formatMoney(row.affiliate_earning, row.currency)}</td>
                      <td className="px-3 py-2 text-xs tabular-nums">{formatMoney(row.vendor_driver_net, row.currency)}</td>
                      <td className="px-3 py-2 text-xs min-w-[7rem]">{formatStatusCell(row.status)}</td>
                      <td className="px-3 py-2 text-xs">{row.is_manual_order ? "Yes" : "No"}</td>
                      <td className="px-3 py-2 text-xs max-w-[8rem] truncate" title={row.zone != null ? String(row.zone) : ""}>
                        {typeof row.zone === "object" ? row.zone?.name ?? JSON.stringify(row.zone) : row.zone ?? "—"}
                      </td>
                      <td className="px-3 py-2 text-xs">{row.vendor_country ?? "—"}</td>
                      <td className="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{formatDate(row.date)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!loading && meta.total > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 flex flex-wrap justify-between items-center gap-2 text-sm text-gray-600 bg-gray-50/50">
            <span>
              Page <strong>{meta.current_page}</strong> of <strong>{meta.last_page}</strong>
              <span className="text-gray-400 mx-1">·</span>
              {meta.total} total
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={loading || meta.current_page <= 1}
                onClick={() => load(meta.current_page - 1)}
                className="px-3 py-1.5 border rounded-lg disabled:opacity-40 bg-white"
              >
                Prev
              </button>
              <button
                type="button"
                disabled={loading || meta.current_page >= meta.last_page}
                onClick={() => load(meta.current_page + 1)}
                className="px-3 py-1.5 border rounded-lg disabled:opacity-40 bg-white"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
