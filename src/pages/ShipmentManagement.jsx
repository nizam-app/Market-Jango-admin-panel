// src/pages/ShipmentManagement.jsx — GET/PATCH /transport-shipments
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { Loader2, Package, RefreshCw, Search, Truck } from "lucide-react";
import {
  getTransportShipments,
  getTransportShipment,
  parseShipmentsListResponse,
  parseShipmentDetailResponse,
  patchTransportShipment,
} from "../api/transportShipmentApi";
import { getAdminDriversList } from "../api/driverAdminApi";

const BRAND = "#FF8C00";

const SHIPMENT_STATUSES = ["draft", "booked", "in_transit", "delivered", "cancelled"];
const PAYMENT_STATUSES = ["pending", "paid", "refunded"];

function shipmentStatusBadgeClass(s) {
  const v = String(s || "").toLowerCase();
  const map = {
    draft: "bg-gray-100 text-gray-800 ring-gray-200",
    booked: "bg-blue-50 text-blue-900 ring-blue-200/80",
    in_transit: "bg-indigo-50 text-indigo-900 ring-indigo-200/80",
    delivered: "bg-emerald-50 text-emerald-900 ring-emerald-200/80",
    cancelled: "bg-red-50 text-red-900 ring-red-200/80",
  };
  return map[v] || "bg-gray-100 text-gray-700 ring-gray-200";
}

function paymentStatusBadgeClass(s) {
  const v = String(s || "").toLowerCase();
  const map = {
    pending: "bg-amber-50 text-amber-900 ring-amber-200/80",
    paid: "bg-emerald-50 text-emerald-900 ring-emerald-200/80",
    refunded: "bg-violet-50 text-violet-900 ring-violet-200/80",
  };
  return map[v] || "bg-gray-100 text-gray-700 ring-gray-200";
}

function fmtMoney(v) {
  if (v == null || v === "") return "—";
  const n = Number(v);
  if (Number.isFinite(n)) return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  return String(v);
}

function fmtDt(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return String(iso);
  }
}

function transportLabel(row) {
  const u = row.transport_user;
  return u?.name || u?.email || (u?.id != null ? `Transport #${u.id}` : "—");
}

function driverLabel(row) {
  const d = row.driver;
  if (!d) return "—";
  return d.user?.name || d.name || (d.id != null ? `Driver #${d.id}` : "—");
}

function shipmentMatchesSearch(row, q) {
  if (!q.trim()) return true;
  const s = q.toLowerCase();
  const tu = row.transport_user || {};
  const dr = row.driver || {};
  const du = dr.user || {};
  return (
    String(row.id).includes(s) ||
    (tu.name || "").toLowerCase().includes(s) ||
    (tu.email || "").toLowerCase().includes(s) ||
    (tu.phone || "").toLowerCase().includes(s) ||
    (row.origin_address || "").toLowerCase().includes(s) ||
    (row.destination_address || "").toLowerCase().includes(s) ||
    (du.name || "").toLowerCase().includes(s) ||
    String(row.status || "")
      .toLowerCase()
      .includes(s)
  );
}

function ShipmentDetailModal({ shipmentId, onClose, brand, onSaved }) {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [shipment, setShipment] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [saving, setSaving] = useState(false);

  const [formStatus, setFormStatus] = useState("draft");
  const [formPayment, setFormPayment] = useState("pending");
  const [formDriverId, setFormDriverId] = useState("");
  const [formFinalPrice, setFormFinalPrice] = useState("");

  const load = useCallback(async () => {
    if (shipmentId == null) return;
    setLoading(true);
    setErr("");
    try {
      const [sRes, dRes] = await Promise.all([
        getTransportShipment(shipmentId),
        getAdminDriversList().catch(() => ({ data: {} })),
      ]);
      const s = parseShipmentDetailResponse(sRes);
      setShipment(s);
      if (s) {
        setFormStatus(String(s.status || "draft"));
        setFormPayment(String(s.payment_status || "pending"));
        setFormDriverId(s.driver_id != null ? String(s.driver_id) : "");
        setFormFinalPrice(s.final_price != null ? String(s.final_price) : "");
      }
      const raw = dRes?.data?.data;
      const list = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
      setDrivers(list);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Failed to load shipment");
      setShipment(null);
    } finally {
      setLoading(false);
    }
  }, [shipmentId]);

  useEffect(() => {
    if (shipmentId == null) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    load();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [shipmentId, onClose, load]);

  if (shipmentId == null) return null;

  const inputClass =
    "w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/35";
  const selectClass = inputClass + " bg-white";

  const handleSave = async (e) => {
    e.preventDefault();
    if (!shipment) return;
    const body = {
      status: formStatus,
      payment_status: formPayment,
    };
    if (formDriverId === "") body.driver_id = null;
    else body.driver_id = Number(formDriverId);

    const fpRaw = formFinalPrice.trim();
    const fpNum = fpRaw === "" ? Number(shipment.final_price) : Number(fpRaw);
    if (!Number.isFinite(fpNum)) {
      Swal.fire({ icon: "warning", title: "Invalid final price", confirmButtonColor: brand });
      return;
    }
    body.final_price = fpNum;

    try {
      setSaving(true);
      const res = await patchTransportShipment(shipment.id, body);
      const next = parseShipmentDetailResponse(res);
      if (next) setShipment(next);
      Swal.fire({ icon: "success", title: "Shipment updated", confirmButtonColor: brand, timer: 1600, showConfirmButton: false });
      onSaved?.();
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "Update failed",
        text: e?.response?.data?.message || e.message,
        confirmButtonColor: brand,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-6 bg-black/45 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shipment-detail-title"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-2xl max-h-[min(92vh,820px)] flex flex-col rounded-2xl bg-white shadow-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-3 bg-[#F4F7FB] shrink-0">
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-[#FF8C00]" />
            <div>
              <h2 id="shipment-detail-title" className="text-lg font-semibold text-[#343C6A]">
                Shipment #{shipmentId}
              </h2>
              <p className="text-xs text-gray-500">Details & admin update</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg text-gray-500 hover:bg-gray-200/80" aria-label="Close">
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 text-sm space-y-5">
          {loading ? (
            <div className="flex flex-col items-center py-16 text-gray-500 gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-[#FF8C00]" />
              Loading…
            </div>
          ) : err ? (
            <div className="text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{err}</div>
          ) : shipment ? (
            <>
              <section className="rounded-xl border border-gray-200 bg-gray-50/80 p-4 space-y-2">
                <h3 className="text-xs font-semibold uppercase text-[#5a6489]">Transport</h3>
                <p className="font-medium text-gray-900">{shipment.user?.name || "—"}</p>
                <p className="text-xs text-gray-600">{shipment.user?.email} · {shipment.user?.phone || "—"}</p>
              </section>

              <section className="rounded-xl border border-gray-200 p-4 space-y-2">
                <h3 className="text-xs font-semibold uppercase text-[#5a6489]">Route</h3>
                <p>
                  <span className="text-gray-500">From</span>{" "}
                  <span className="text-gray-900">{shipment.origin_address || "—"}</span>
                </p>
                <p>
                  <span className="text-gray-500">To</span>{" "}
                  <span className="text-gray-900">{shipment.destination_address || "—"}</span>
                </p>
                {shipment.transport_type ? (
                  <p className="text-xs text-gray-600">Type: {shipment.transport_type}</p>
                ) : null}
              </section>

              <section className="rounded-xl border border-gray-200 p-4 space-y-2">
                <h3 className="text-xs font-semibold uppercase text-[#5a6489]">Pickup & notes</h3>
                <p className="text-gray-800">{shipment.pickup_instructions || "—"}</p>
                <p className="text-xs text-gray-600">Contact: {shipment.pickup_contact_phone || "—"}</p>
                <p className="text-xs text-gray-600">To driver: {shipment.message_to_driver || "—"}</p>
                <p className="text-xs text-gray-600">
                  Declared: {fmtMoney(shipment.declared_value)} {shipment.declared_value_currency || ""}
                </p>
              </section>

              <section className="rounded-xl border border-gray-200 p-4 space-y-2">
                <h3 className="text-xs font-semibold uppercase text-[#5a6489]">Driver</h3>
                {shipment.driver ? (
                  <>
                    <p className="font-medium">{shipment.driver.user?.name || "—"}</p>
                    <p className="text-xs text-gray-600">
                      {[shipment.driver.car_name, shipment.driver.car_model].filter(Boolean).join(" · ") || "—"} ·{" "}
                      {shipment.driver.location || "—"}
                    </p>
                  </>
                ) : (
                  <p className="text-gray-500">No driver assigned</p>
                )}
              </section>

              <section className="rounded-xl border border-gray-200 p-4">
                <h3 className="text-xs font-semibold uppercase text-[#5a6489] mb-2">Packages</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-200 text-left text-gray-500">
                        <th className="py-2 pr-2">L×W×H cm</th>
                        <th className="py-2 pr-2">Kg</th>
                        <th className="py-2 pr-2">Qty</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(shipment.packages || []).map((p) => (
                        <tr key={p.id} className="border-b border-gray-100">
                          <td className="py-2 pr-2 tabular-nums">
                            {p.length_cm} × {p.width_cm} × {p.height_cm}
                          </td>
                          <td className="py-2 pr-2">{p.weight_kg}</td>
                          <td className="py-2 pr-2">{p.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Totals: {shipment.total_pieces ?? "—"} pieces · {shipment.total_weight_kg ?? "—"} kg
                </p>
              </section>

              <section className="rounded-xl border border-dashed border-[#FF8C00]/40 p-4 space-y-3 bg-orange-50/30">
                <h3 className="text-xs font-semibold uppercase text-[#5a6489]">Admin update</h3>
                <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Status</label>
                    <select value={formStatus} onChange={(e) => setFormStatus(e.target.value)} className={selectClass}>
                      {SHIPMENT_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Payment status</label>
                    <select value={formPayment} onChange={(e) => setFormPayment(e.target.value)} className={selectClass}>
                      {PAYMENT_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-gray-600 mb-1">Driver</label>
                    <select value={formDriverId} onChange={(e) => setFormDriverId(e.target.value)} className={selectClass}>
                      <option value="">— None —</option>
                      {drivers.map((d) => (
                        <option key={d.id} value={String(d.id)}>
                          {(d.user?.name || d.name || `#${d.id}`) +
                            (d.car_name ? ` · ${d.car_name}` : "")}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-gray-600 mb-1">Final price</label>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      value={formFinalPrice}
                      onChange={(e) => setFormFinalPrice(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                      style={{ backgroundColor: brand }}
                    >
                      {saving ? "Saving…" : "Save changes"}
                    </button>
                  </div>
                </form>
                <p className="text-[11px] text-gray-500">
                  Ref: {shipment.payment_tx_ref || "—"} · Tx: {shipment.transaction_id ?? "—"}
                </p>
              </section>

              <p className="text-xs text-gray-400">Updated {fmtDt(shipment.updated_at)}</p>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

const ShipmentManagement = () => {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [detailId, setDetailId] = useState(null);

  const fetchList = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError("");
      const res = await getTransportShipments({ page, per_page: 20 });
      const { items: list, pagination: pag } = parseShipmentsListResponse(res);
      setItems(list);
      setPagination({
        current_page: pag.current_page || 1,
        last_page: pag.last_page || 1,
        per_page: pag.per_page || 20,
        total: pag.total ?? list.length,
      });
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || e.message || "Failed to load shipments");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList(1);
  }, [fetchList]);

  const filteredItems = useMemo(() => {
    return items.filter((row) => shipmentMatchesSearch(row, searchQuery));
  }, [items, searchQuery]);

  const displayRows = searchQuery.trim() ? filteredItems : items;

  return (
    <div className="px-4 sm:px-6 py-5 max-w-[1400px] mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm"
            style={{ backgroundColor: "rgba(255, 140, 0, 0.12)" }}
          >
            <Truck className="w-6 h-6" style={{ color: BRAND }} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#343C6A]">Shipment management</h1>
            <p className="text-sm text-gray-500 mt-1 max-w-xl">
              Transport bookings: origin/destination, driver, payment and lifecycle status. Search filters the
              rows loaded on the current page (client-side).
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => fetchList(pagination.current_page)}
          disabled={loading}
          className="inline-flex items-center gap-2 self-start px-4 py-2.5 text-sm font-medium border border-gray-200 rounded-xl bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5">
        <label className="relative block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by shipment id, transport name, email, phone, route, status…"
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/35"
          />
        </label>
      </div>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3" role="alert">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-[#F4F7FB] border-b border-[#E6EEF6]">
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[#5a6489]">
                  ID
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[#5a6489]">
                  Transport
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[#5a6489]">
                  Driver
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[#5a6489] min-w-[160px]">
                  Route
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[#5a6489]">
                  Pcs / kg
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[#5a6489]">
                  Price
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[#5a6489]">
                  Payment
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[#5a6489]">
                  Status
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
                  <td colSpan={10} className="px-4 py-16 text-center text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin inline text-[#FF8C00]" /> Loading shipments…
                  </td>
                </tr>
              ) : displayRows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-16 text-center text-gray-500">
                    No shipments match your search.
                  </td>
                </tr>
              ) : (
                displayRows.map((row) => (
                  <tr key={row.id} className="hover:bg-[#FAFCFF] transition-colors">
                    <td className="px-4 py-3.5 font-mono text-xs text-[#343C6A]">{row.id}</td>
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-gray-900">{transportLabel(row)}</div>
                      <div className="text-xs text-gray-500 truncate max-w-[12rem]" title={row.transport_user?.email}>
                        {row.transport_user?.email}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-gray-700 text-xs max-w-[10rem] truncate" title={driverLabel(row)}>
                      {driverLabel(row)}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-700 max-w-[14rem]">
                      <div className="truncate" title={row.origin_address}>
                        {row.origin_address || "—"}
                      </div>
                      <div className="text-gray-400 truncate" title={row.destination_address}>
                        → {row.destination_address || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 tabular-nums text-gray-700 text-xs">
                      {row.total_pieces ?? "—"} / {row.total_weight_kg ?? "—"}
                    </td>
                    <td className="px-4 py-3.5 tabular-nums text-xs">
                      <div className="text-gray-500">Est {fmtMoney(row.estimated_price)}</div>
                      <div className="font-medium text-gray-900">Final {fmtMoney(row.final_price)}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-lg text-xs font-medium ring-1 ring-inset ${paymentStatusBadgeClass(row.payment_status)}`}
                      >
                        {row.payment_status || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-lg text-xs font-medium ring-1 ring-inset ${shipmentStatusBadgeClass(row.status)}`}
                      >
                        {row.status || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-600 whitespace-nowrap">{fmtDt(row.created_at)}</td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => setDetailId(row.id)}
                        className="text-sm font-medium px-3 py-2 rounded-xl border border-[#FF8C00] text-[#FF8C00] bg-white hover:bg-orange-50 transition"
                      >
                        View details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.last_page > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-600 bg-gray-50/50">
            <span>
              Page <strong>{pagination.current_page}</strong> of <strong>{pagination.last_page}</strong>
              <span className="text-gray-400 mx-1">·</span>
              {pagination.total} total
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={loading || pagination.current_page <= 1}
                onClick={() => fetchList(pagination.current_page - 1)}
                className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm disabled:opacity-40"
              >
                Prev
              </button>
              <button
                type="button"
                disabled={loading || pagination.current_page >= pagination.last_page}
                onClick={() => fetchList(pagination.current_page + 1)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-40"
                style={{ backgroundColor: BRAND }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <ShipmentDetailModal
        shipmentId={detailId}
        onClose={() => setDetailId(null)}
        brand={BRAND}
        onSaved={() => fetchList(pagination.current_page)}
      />
    </div>
  );
};

export default ShipmentManagement;
