// src/pages/DriverAssignments.jsx — GET /driver-assignments, POST reassign
import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import Swal from "sweetalert2";
import {
  getDriverAssignments,
  getAdminDriversList,
  reassignDriverAssignment,
} from "../api/driverAdminApi";

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

const DriverAssignments = () => {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [driverIdFilter, setDriverIdFilter] = useState("");
  const [vendorIdFilter, setVendorIdFilter] = useState("");
  const [invoiceItemIdFilter, setInvoiceItemIdFilter] = useState("");
  const [drivers, setDrivers] = useState([]);

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
      const params = { page };
      if (statusFilter.trim()) params.status = statusFilter.trim();
      if (driverIdFilter.trim()) params.driver_id = driverIdFilter.trim();
      if (vendorIdFilter.trim()) params.vendor_id = vendorIdFilter.trim();
      if (invoiceItemIdFilter.trim()) params.invoice_item_id = invoiceItemIdFilter.trim();
      const res = await getDriverAssignments(params);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const driverOptionLabel = (d) => {
    const name = d.name || d.user?.name || `ID ${d.id}`;
    const car = d.car || d.car_name || "";
    return `${name}${car ? ` — ${car}` : ""} (ID ${d.id})`;
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
            Filters: <code className="text-xs bg-gray-100 px-1 rounded">status</code>,{" "}
            <code className="text-xs bg-gray-100 px-1 rounded">driver_id</code>,{" "}
            <code className="text-xs bg-gray-100 px-1 rounded">vendor_id</code>,{" "}
            <code className="text-xs bg-gray-100 px-1 rounded">invoice_item_id</code>. Reassign:{" "}
            <code className="text-xs bg-gray-100 px-1 rounded">POST .../reassign</code> with{" "}
            <code className="text-xs bg-gray-100 px-1 rounded">driver_id</code>.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
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

      <section className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-5 flex flex-wrap gap-4 items-end">
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
            onChange={(e) => setDriverIdFilter(e.target.value)}
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
            onChange={(e) => setVendorIdFilter(e.target.value)}
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
            onChange={(e) => setInvoiceItemIdFilter(e.target.value)}
            placeholder="All"
            className="w-32 px-3 py-2.5 border border-gray-200 rounded-xl text-sm min-w-0"
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
      </section>

      {drivers.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-gradient-to-b from-gray-50/80 to-white p-5 text-sm">
          <p className="font-semibold text-[#343C6A]">
            Drivers available for reassign{" "}
            {/* <span className="font-normal text-gray-500">(GET /drivers · {drivers.length})</span> */}
          </p>
          <ul className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-2 text-gray-700">
            {drivers.map((d) => (
              <li key={d.id} className="truncate border border-gray-100 rounded-lg px-3 py-2 bg-white/80">
                <span className="font-medium text-gray-900">{d.name || d.user?.name || `#${d.id}`}</span>
                <span className="text-gray-500"> — {d.car || d.car_name || "—"}</span>
                <span className="block text-xs text-gray-400 mt-0.5">
                  {d.is_on_delivery ? "On delivery" : "Available"}
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
          <span className="text-xs font-semibold uppercase tracking-wide text-[#5a6489]">
            Assignments
          </span>
          {!loading && (
            <span className="text-xs text-gray-500">
              {meta.total} total
              {meta.last_page > 1 &&
                ` · Page ${meta.current_page} / ${meta.last_page}`}
            </span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-[#E6EEF6]">
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-[#5a6489] whitespace-nowrap">
                  ID
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-[#5a6489] whitespace-nowrap">
                  Status
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-[#5a6489] min-w-[180px]">
                  Order & item
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-[#5a6489]">
                  Customer
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-[#5a6489] min-w-[140px]">
                  Driver
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-[#5a6489]">
                  Vendor
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-[#5a6489]">
                  Assigned by
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-[#5a6489] whitespace-nowrap">
                  Created
                </th>
                <th className="px-4 py-3.5 text-right text-xs font-semibold text-[#5a6489]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center text-gray-500">
                    Loading…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center text-gray-500">
                    No assignments match this filter.
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const item = row.invoice_item;
                  const inv = item?.invoice;
                  const product = item?.product;
                  const orderNo = inv?.order_number || "—";
                  const customer = inv?.cus_name || item?.cus_name || "—";
                  const driver = row.driver;

                  return (
                    <tr key={row.id} className="hover:bg-[#FAFCFF] transition-colors align-top">
                      <td className="px-4 py-3.5 font-mono text-xs text-[#343C6A] whitespace-nowrap">
                        {row.id}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ring-1 ring-inset ${assignmentStatusBadgeClass(row.status)}`}
                            title={row.status != null ? String(row.status) : undefined}
                          >
                            {assignmentStatusLabel(row.status)}
                          </span>
                          {row.rejection_reason ? (
                            <p className="text-[11px] text-red-600 max-w-[14rem] leading-snug">
                              {row.rejection_reason}
                            </p>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-mono text-xs text-[#343C6A]">{orderNo}</div>
                        <div className="text-gray-800 font-medium mt-0.5">{product?.name || "—"}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Qty {item?.quantity ?? "—"} · Total{" "}
                          <span className="tabular-nums">{item?.total_pay ?? "—"}</span>
                          {item?.payment_method ? (
                            <span className="text-gray-400"> · {item.payment_method}</span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-gray-800">{customer}</td>
                      <td className="px-4 py-3.5">
                        <div className="text-gray-900 font-medium">{driverDisplayName(driver)}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {driver?.user?.phone || driver?.phone || "—"}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">{driverVehicle(driver)}</div>
                        {driver?.location ? (
                          <div className="text-[11px] text-gray-400 mt-1">{driver.location}</div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3.5 text-gray-800">
                        {row.vendor?.business_name || "—"}
                      </td>
                      <td className="px-4 py-3.5 text-gray-700 text-xs">
                        {row.assigned_by?.name || "—"}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-600 whitespace-nowrap">
                        {formatDt(row.created_at)}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleReassign(row)}
                          className="text-sm font-medium px-3 py-2 rounded-xl border border-[#FF8C00] text-[#FF8C00] bg-white hover:bg-orange-50 transition"
                        >
                          Reassign
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
    </div>
  );
};

export default DriverAssignments;
