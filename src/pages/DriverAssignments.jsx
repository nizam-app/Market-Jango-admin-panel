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

const DriverAssignments = () => {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [drivers, setDrivers] = useState([]);

  const loadDrivers = async () => {
    try {
      const res = await getAdminDriversList();
      setDrivers(res.data?.data || []);
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
      const res = await getDriverAssignments(params);
      const pag = res.data?.data || {};
      const list = Array.isArray(pag.data) ? pag.data : [];
      setRows(list);
      setMeta({
        current_page: pag.current_page || 1,
        last_page: pag.last_page || 1,
        total: pag.total ?? list.length,
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

  const handleReassign = async (assignment) => {
    const options = drivers
      .map((d) => `<option value="${d.id}">${d.name} (ID ${d.id}) — ${d.car || "car"}</option>`)
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

  const formatRowPreview = (row) => {
    if (!row || typeof row !== "object") return "—";
    const pick = ["invoice_id", "order_id", "driver_id", "user_id", "status", "note"];
    const parts = pick.filter((k) => row[k] != null).map((k) => `${k}: ${row[k]}`);
    if (parts.length) return parts.join(" · ");
    return JSON.stringify(row).slice(0, 160) + (JSON.stringify(row).length > 160 ? "…" : "");
  };

  return (
    <div className="px-6 py-4 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Driver assignments</h1>
          <p className="text-sm text-gray-600 mt-1">
            List from GET /driver-assignments; reassign via POST /driver-assignments/&#123;id&#125;/reassign with body &#123; driver_id &#125;.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/drivers"
            className="text-sm font-medium px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            Driver overview
          </Link>
          <Link
            to="/drivers-list"
            className="text-sm font-medium px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            Driver list
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs text-gray-600 mb-1">Status</label>
          <input
            type="text"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            placeholder="e.g. pending"
            className="w-40 px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
        <button
          type="button"
          onClick={() => fetchAssignments(1)}
          className="px-4 py-2 text-sm font-semibold text-white rounded-lg"
          style={{ backgroundColor: BRAND }}
        >
          Apply
        </button>
      </div>

      {drivers.length > 0 && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 text-sm text-gray-700">
          <strong className="text-gray-900">Drivers (GET /drivers) — {drivers.length}</strong>
          <ul className="mt-2 grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {drivers.map((d) => (
              <li key={d.id} className="truncate">
                <span className="font-medium">{d.name}</span> — {d.car || "—"}{" "}
                <span className="text-gray-500">
                  {d.is_on_delivery ? "on delivery" : "available"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700">ID</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Details</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-gray-500">
                    Loading…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-gray-500">
                    No assignments found.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-gray-900">{row.id}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-0.5 rounded text-xs bg-gray-100">
                        {row.status ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-xl break-words text-xs font-mono">
                      {formatRowPreview(row)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleReassign(row)}
                        className="text-sm font-medium px-3 py-1.5 rounded-lg border border-[#FF8C00] text-[#FF8C00] hover:bg-orange-50"
                      >
                        Reassign
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {meta.last_page > 1 && (
          <div className="px-4 py-3 border-t flex justify-between text-sm text-gray-600">
            <span>
              Page {meta.current_page} of {meta.last_page} ({meta.total} total)
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={loading || meta.current_page <= 1}
                onClick={() => fetchAssignments(meta.current_page - 1)}
                className="px-3 py-1 border rounded-lg disabled:opacity-40"
              >
                Prev
              </button>
              <button
                type="button"
                disabled={loading || meta.current_page >= meta.last_page}
                onClick={() => fetchAssignments(meta.current_page + 1)}
                className="px-3 py-1 border rounded-lg disabled:opacity-40"
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
