// src/pages/DriverAssignments.jsx — GET /driver-assignments, POST reassign
import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import Swal from "sweetalert2";
import { Download } from "lucide-react";
import {
  getDriverAssignments,
  getAdminDriversList,
  reassignDriverAssignment,
  exportDriverAssignments,
  downloadBlobResponse,
} from "../api/driverAdminApi";
import { getZones } from "../api/adminApi";

const BRAND = "#FF8C00";

/** Exact API values for GET /driver-assignments?status= (assignment lifecycle, not invoice line) */
const ASSIGNMENT_STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "in_transit", label: "In transit" },
  { value: "delivered", label: "Delivered" },
  { value: "rejected", label: "Rejected" },
  { value: "cancelled", label: "Cancelled" },
];

const assignmentStatusLabel = (status) => {
  if (status == null || status === "") return "—";
  const opt = ASSIGNMENT_STATUS_OPTIONS.find((o) => o.value === String(status));
  return opt?.label ?? String(status);
};

function assignmentStatusBadgeClass(status) {
  const s = String(status || "").toLowerCase();
  const map = {
    pending: "bg-amber-50 text-amber-900 ring-amber-200/80",
    accepted: "bg-blue-50 text-blue-900 ring-blue-200/80",
    in_transit: "bg-indigo-50 text-indigo-900 ring-indigo-200/80",
    delivered: "bg-emerald-50 text-emerald-900 ring-emerald-200/80",
    rejected: "bg-red-50 text-red-900 ring-red-200/80",
    cancelled: "bg-gray-100 text-gray-800 ring-gray-200/80",
  };
  return map[s] || "bg-gray-100 text-gray-800 ring-gray-200/80";
}

const formatDt = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return String(iso);
  }
};

const driverDisplayName = (d) =>
  d?.user?.name || d?.name || (d?.id != null ? `Driver #${d.id}` : "—");

const driverVehicle = (d) => {
  if (!d) return "—";
  const parts = [d.car_name, d.car_model].filter(Boolean);
  return parts.length ? parts.join(" · ") : "—";
};

const fmt = (v) => (v != null && String(v).trim() !== "" ? String(v) : "—");

const onlyDigits = (v) => String(v || "").replace(/\D/g, "");

function firstNonEmpty(...vals) {
  for (const v of vals) {
    if (v == null) continue;
    const s = typeof v === "string" ? v.trim() : String(v).trim();
    if (s !== "") return s;
  }
  return "";
}

function resolvePickupAddress(row) {
  const item = row?.invoice_item;
  const inv = item?.invoice;
  const vendor = row?.vendor;
  return firstNonEmpty(
    item?.pickup_address,
    item?.origin_address,
    item?.from_address,
    inv?.pickup_address,
    inv?.vendor_address,
    vendor?.address,
    vendor?.business_address,
    vendor?.pickup_address
  );
}

function resolveDropAddress(row) {
  const item = row?.invoice_item;
  const inv = item?.invoice;
  return firstNonEmpty(
    item?.ship_address,
    item?.delivery_address,
    item?.drop_address,
    item?.destination_address,
    inv?.ship_address,
    inv?.delivery_address,
    inv?.shipping_address,
    item?.current_address
  );
}

/** @param {"pickup"|"drop"} kind */
function AddressCell({ row, kind }) {
  const text = kind === "pickup" ? resolvePickupAddress(row) : resolveDropAddress(row);
  return (
    <div className="text-xs text-gray-800 break-words leading-snug max-w-[min(100%,18rem)]">
      {text ? text : <span className="text-gray-400">Not set</span>}
    </div>
  );
}

function DetailSection({ title, children }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-[#5a6489] mb-3">{title}</h3>
      <dl className="grid gap-2.5 sm:grid-cols-2 text-sm">{children}</dl>
    </div>
  );
}

function DetailItem({ label, children }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="mt-0.5 text-gray-900 break-words">{children}</dd>
    </div>
  );
}

function AssignmentDetailModal({ row, onClose, onReassign }) {
  if (!row) return null;
  const item = row.invoice_item;
  const inv = item?.invoice;
  const driver = row.driver;
  const pickup = resolvePickupAddress(row);
  const drop = resolveDropAddress(row);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      role="dialog"
      aria-modal="true"
      aria-labelledby="assignment-detail-title"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between gap-3">
          <div>
            <p id="assignment-detail-title" className="text-lg font-semibold text-[#343C6A]">
              Assignment #{row.id}
            </p>
            <p className="text-sm text-gray-500 mt-0.5">{inv?.order_number || "No order number"}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-2xl leading-none px-2"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="flex flex-wrap gap-2 items-center">
            <span
              className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ring-1 ring-inset ${assignmentStatusBadgeClass(row.status)}`}
            >
              {assignmentStatusLabel(row.status)}
            </span>
            {item?.zone?.name && (
              <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700">
                Zone: {item.zone.name}
              </span>
            )}
          </div>
          <DetailSection title="Order">
            <DetailItem label="Order number">{fmt(inv?.order_number)}</DetailItem>
            <DetailItem label="Invoice item ID">{fmt(row.invoice_item_id)}</DetailItem>
            <DetailItem label="Customer">{fmt(inv?.cus_name)}</DetailItem>
            <DetailItem label="Product">{fmt(item?.product?.name)}</DetailItem>
          </DetailSection>
          <DetailSection title="Driver">
            <DetailItem label="Driver ID">{fmt(row.driver_id)}</DetailItem>
            <DetailItem label="Name">{driverDisplayName(driver)}</DetailItem>
            <DetailItem label="Phone">{fmt(driver?.user?.phone || driver?.phone)}</DetailItem>
            <DetailItem label="Vehicle">{driverVehicle(driver)}</DetailItem>
          </DetailSection>
          <DetailSection title="Vendor & assignment">
            <DetailItem label="Vendor ID">{fmt(row.vendor_id)}</DetailItem>
            <DetailItem label="Vendor">{fmt(row.vendor?.business_name)}</DetailItem>
            <DetailItem label="Assigned by">{fmt(row.assigned_by?.name)}</DetailItem>
            <DetailItem label="Created">{formatDt(row.created_at)}</DetailItem>
          </DetailSection>
          <DetailSection title="Addresses">
            <DetailItem label="Pickup">{pickup || "Not set"}</DetailItem>
            <DetailItem label="Drop">{drop || "Not set"}</DetailItem>
          </DetailSection>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50/80">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 bg-white hover:bg-gray-50"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => onReassign(row)}
            className="px-4 py-2 text-sm font-semibold text-white rounded-xl"
            style={{ backgroundColor: BRAND }}
          >
            Reassign
          </button>
        </div>
      </div>
    </div>
  );
}

const DriverAssignments = () => {
  const [rows, setRows] = useState([]);
  const [detailAssignment, setDetailAssignment] = useState(null);
  const [meta, setMeta] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [driverIdFilter, setDriverIdFilter] = useState("");
  const [vendorIdFilter, setVendorIdFilter] = useState("");
  const [invoiceItemIdFilter, setInvoiceItemIdFilter] = useState("");
  const [zoneIdFilter, setZoneIdFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [drivers, setDrivers] = useState([]);
  const [zones, setZones] = useState([]);
  const [zonesLoading, setZonesLoading] = useState(true);

  const buildParams = (page = 1) => {
    const params = { page };
    if (statusFilter.trim()) params.status = statusFilter.trim();
    const driverId = onlyDigits(driverIdFilter);
    const vendorId = onlyDigits(vendorIdFilter);
    const itemId = onlyDigits(invoiceItemIdFilter);
    if (driverId) params.driver_id = driverId;
    if (vendorId) params.vendor_id = vendorId;
    if (itemId) params.invoice_item_id = itemId;
    if (zoneIdFilter) params.zone_id = zoneIdFilter;
    if (locationFilter.trim()) params.location = locationFilter.trim();
    if (searchFilter.trim()) params.search = searchFilter.trim();
    return params;
  };

  const loadDrivers = async () => {
    try {
      const res = await getAdminDriversList();
      const raw = res.data?.data;
      setDrivers(Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : []);
    } catch (e) {
      console.warn("Could not load drivers list", e);
    }
  };

  const fetchAssignments = async (page = 1) => {
    try {
      setLoading(true);
      setError("");
      const res = await getDriverAssignments(buildParams(page));
      const root = res.data?.data;
      const pag =
        root && Array.isArray(root.data) && root.current_page != null
          ? root
          : root?.assignments && Array.isArray(root.assignments.data)
            ? root.assignments
            : root || {};
      const list = Array.isArray(pag.data) ? pag.data : [];
      setRows(list);
      setMeta({
        current_page: pag.current_page || 1,
        last_page: pag.last_page || 1,
        total: pag.total ?? list.length,
        per_page: pag.per_page ?? 20,
      });
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || e.message || "Failed to load assignments");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();
    fetchAssignments(1);
    let cancelled = false;
    (async () => {
      try {
        setZonesLoading(true);
        const res = await getZones(500);
        const payload = res?.data?.data;
        const list = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const driverOptionLabel = (d) => {
    const name = d.name || d.user?.name || `ID ${d.id}`;
    const car = d.car || d.car_name || "";
    return `${name}${car ? ` — ${car}` : ""} (ID ${d.id})`;
  };

  const handleDownload = async () => {
    try {
      setExporting(true);
      const params = buildParams(1);
      delete params.page;
      const res = await exportDriverAssignments(params);
      const contentType = String(res?.headers?.["content-type"] || "");
      if (contentType.includes("application/json")) {
        const text = await res.data.text();
        let message = "Export failed";
        try {
          message = JSON.parse(text)?.message || message;
        } catch {
          /* ignore */
        }
        throw new Error(message);
      }
      downloadBlobResponse(res, `driver-assignments-${new Date().toISOString().slice(0, 10)}.csv`);
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "Download failed",
        text: e?.response?.data?.message || e.message || "Could not export assignments",
        confirmButtonColor: BRAND,
      });
    } finally {
      setExporting(false);
    }
  };

  const handleReassign = async (assignment) => {
    const options = drivers
      .map(
        (d) =>
          `<option value="${d.id}">${driverOptionLabel(d).replace(/"/g, "&quot;")}</option>`
      )
      .join("");
    const { value: driverId } = await Swal.fire({
      title: "Reassign driver",
      html: `
        <p class="text-sm text-gray-600 mb-3 text-left">Assignment #${assignment.id}</p>
        <label class="block text-left text-sm font-medium text-gray-700 mb-1">Select driver</label>
        <select id="swal-driver-id" class="swal2-input" style="width:100%;display:block;padding:8px;border-radius:8px;border:1px solid #ccc;">
          <option value="">-- Choose driver --</option>
          ${options}
        </select>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Reassign",
      confirmButtonColor: BRAND,
      preConfirm: () => {
        const el = document.getElementById("swal-driver-id");
        const v = el?.value;
        if (!v) {
          Swal.showValidationMessage("Select a driver");
          return false;
        }
        return Number(v);
      },
    });
    if (driverId === undefined) return;

    try {
      Swal.fire({ title: "Submitting…", didOpen: () => Swal.showLoading(), allowOutsideClick: false });
      await reassignDriverAssignment(assignment.id, { driver_id: driverId });
      Swal.close();
      await Swal.fire({ icon: "success", title: "Reassign completed", confirmButtonColor: BRAND });
      fetchAssignments(meta.current_page);
    } catch (e) {
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Reassign failed",
        text: e?.response?.data?.message || e.message,
        confirmButtonColor: BRAND,
      });
    }
  };

  const inputSelectClass =
    "min-w-[11rem] px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/35";

  return (
    <div className="px-4 sm:px-6 py-5 max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#343C6A]">Driver assignments</h1>
          <p className="text-sm text-gray-500 mt-1 max-w-2xl">
            Filter by status, driver, vendor, invoice item, or zone — then download the results.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleDownload}
            disabled={exporting || loading}
            className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl text-white shadow-md disabled:opacity-50"
            style={{ backgroundColor: BRAND }}
          >
            <Download className={`w-4 h-4 ${exporting ? "animate-pulse" : ""}`} />
            {exporting ? "Preparing…" : "Download CSV"}
          </button>
          <Link
            to="/drivers"
            className="text-sm font-medium px-4 py-2.5 rounded-xl border border-gray-200 bg-white shadow-sm hover:bg-gray-50"
          >
            Driver overview
          </Link>
          <Link
            to="/drivers-list"
            className="text-sm font-medium px-4 py-2.5 rounded-xl border border-gray-200 bg-white shadow-sm hover:bg-gray-50"
          >
            Driver list
          </Link>
        </div>
      </div>

      <section className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-5 space-y-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={inputSelectClass}
              aria-label="Filter assignments by status"
            >
              {ASSIGNMENT_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value === "" ? "all" : opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Driver ID</label>
            <input
              type="text"
              inputMode="numeric"
              value={driverIdFilter}
              onChange={(e) => setDriverIdFilter(onlyDigits(e.target.value))}
              placeholder="All"
              className="w-28 px-3 py-2.5 border border-gray-200 rounded-xl text-sm min-w-0"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Vendor ID</label>
            <input
              type="text"
              inputMode="numeric"
              value={vendorIdFilter}
              onChange={(e) => setVendorIdFilter(onlyDigits(e.target.value))}
              placeholder="All"
              className="w-28 px-3 py-2.5 border border-gray-200 rounded-xl text-sm min-w-0"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Invoice item ID</label>
            <input
              type="text"
              inputMode="numeric"
              value={invoiceItemIdFilter}
              onChange={(e) => setInvoiceItemIdFilter(onlyDigits(e.target.value))}
              placeholder="All"
              className="w-32 px-3 py-2.5 border border-gray-200 rounded-xl text-sm min-w-0"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Zone</label>
            <select
              value={zoneIdFilter}
              onChange={(e) => setZoneIdFilter(e.target.value)}
              disabled={zonesLoading}
              className={inputSelectClass}
            >
              <option value="">All zones</option>
              {zones.map((z) => (
                <option key={z.id} value={String(z.id)}>
                  {z.name || `Zone #${z.id}`}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Location</label>
            <input
              type="text"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              placeholder="Pickup / drop / zone name"
              className="min-w-[12rem] px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
            />
          </div>
          <button
            type="button"
            onClick={() => fetchAssignments(1)}
            className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl shadow-md shadow-orange-200/40 hover:brightness-105 transition"
            style={{ backgroundColor: BRAND }}
          >
            Apply filters
          </button>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Search</label>
          <input
            type="search"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchAssignments(1)}
            placeholder="Order number, driver, vendor, or zone…"
            className="w-full max-w-xl px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
          />
        </div>
      </section>

      {drivers.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-gradient-to-b from-gray-50/80 to-white p-5 text-sm">
          <p className="font-semibold text-[#343C6A]">Drivers available for reassign</p>
          <ul className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-2 text-gray-700">
            {drivers.map((d) => (
              <li key={d.id} className="truncate border border-gray-100 rounded-lg px-3 py-2 bg-white/80">
                <span className="font-medium text-gray-900">{d.name || d.user?.name || `#${d.id}`}</span>
                <span className="text-gray-500"> — {d.car || d.car_name || "—"}</span>
                <span className="block text-xs text-gray-400 mt-0.5">
                  ID {d.id} · {d.is_on_delivery ? "On delivery" : "Available"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3" role="alert">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-gray-100 bg-[#F4F7FB] flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-[#5a6489]">Assignments</span>
          {!loading && (
            <span className="text-xs text-gray-500">
              {meta.total} total
              {meta.last_page > 1 && ` · Page ${meta.current_page} / ${meta.last_page}`}
            </span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-[#E6EEF6]">
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-[#5a6489] whitespace-nowrap">ID</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-[#5a6489] whitespace-nowrap">Status</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-[#5a6489] whitespace-nowrap">Driver</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-[#5a6489] whitespace-nowrap">Vendor</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-[#5a6489] whitespace-nowrap">Item ID</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-[#5a6489] whitespace-nowrap">Order</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-[#5a6489] whitespace-nowrap">Zone</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-[#5a6489] min-w-[140px] max-w-[14rem]">Pickup</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-[#5a6489] min-w-[140px] max-w-[14rem]">Drop</th>
                <th className="px-4 py-3.5 text-right text-xs font-semibold text-[#5a6489] whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-16 text-center text-gray-500">
                    Loading…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-16 text-center text-gray-500">
                    No assignments match this filter.
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const item = row.invoice_item;
                  const inv = item?.invoice;
                  const orderNo = inv?.order_number || "—";
                  const driverName = driverDisplayName(row.driver);

                  return (
                    <tr key={row.id} className="hover:bg-[#FAFCFF] transition-colors align-top">
                      <td className="px-4 py-3.5 font-mono text-xs text-[#343C6A] whitespace-nowrap">{row.id}</td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ring-1 ring-inset ${assignmentStatusBadgeClass(row.status)}`}
                          title={row.status != null ? String(row.status) : undefined}
                        >
                          {assignmentStatusLabel(row.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs">
                        <div className="font-medium text-gray-900 truncate max-w-[9rem]" title={driverName}>
                          {driverName}
                        </div>
                        <div className="text-gray-400">ID {row.driver_id ?? "—"}</div>
                      </td>
                      <td className="px-4 py-3.5 text-xs">
                        <div className="truncate max-w-[9rem]" title={row.vendor?.business_name || ""}>
                          {row.vendor?.business_name || "—"}
                        </div>
                        <div className="text-gray-400">ID {row.vendor_id ?? "—"}</div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-gray-700 whitespace-nowrap">
                        {row.invoice_item_id ?? "—"}
                      </td>
                      <td
                        className="px-4 py-3.5 font-mono text-xs text-[#343C6A] whitespace-nowrap max-w-[11rem] truncate"
                        title={orderNo}
                      >
                        {orderNo}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-700 whitespace-nowrap">
                        {item?.zone?.name || "—"}
                      </td>
                      <td className="px-4 py-3.5">
                        <AddressCell row={row} kind="pickup" />
                      </td>
                      <td className="px-4 py-3.5">
                        <AddressCell row={row} kind="drop" />
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="inline-flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setDetailAssignment(row)}
                            className="text-sm font-medium px-3 py-2 rounded-xl border border-gray-200 text-[#343C6A] bg-white hover:bg-gray-50 transition"
                          >
                            View details
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReassign(row)}
                            className="text-sm font-medium px-3 py-2 rounded-xl border border-[#FF8C00] text-[#FF8C00] bg-white hover:bg-orange-50 transition"
                          >
                            Reassign
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {meta.last_page > 1 && (
          <div className="px-4 py-3.5 border-t border-gray-100 flex flex-wrap justify-between items-center gap-3 text-sm text-gray-600 bg-gray-50/50">
            <span>
              Page <strong className="text-gray-900">{meta.current_page}</strong> of{" "}
              <strong className="text-gray-900">{meta.last_page}</strong>
              <span className="text-gray-400 mx-1">·</span>
              {meta.total} total
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={loading || meta.current_page <= 1}
                onClick={() => fetchAssignments(meta.current_page - 1)}
                className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-xl bg-white hover:bg-gray-50 disabled:opacity-40"
              >
                Prev
              </button>
              <button
                type="button"
                disabled={loading || meta.current_page >= meta.last_page}
                onClick={() => fetchAssignments(meta.current_page + 1)}
                className="px-4 py-2 text-sm font-medium text-white rounded-xl shadow-sm disabled:opacity-40 hover:brightness-105"
                style={{ backgroundColor: BRAND }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <AssignmentDetailModal
        row={detailAssignment}
        onClose={() => setDetailAssignment(null)}
        onReassign={handleReassign}
      />
    </div>
  );
};

export default DriverAssignments;
