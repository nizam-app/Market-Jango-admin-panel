// src/pages/OutletDriverBin.jsx
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  getOutletDrivers,
  getOutletPendingDrivers,
  getOutletSuspendedDrivers,
  approveOutletDriver,
  rejectOutletDriver,
  suspendOutletDriver,
  setOutletDriverLimits,
} from "../api/outletApi";

const BRAND = "#FF8C00";

const OutletDriverBin = () => {
  const [tab, setTab] = useState("approved");
  const [approved, setApproved] = useState([]);
  const [pending, setPending] = useState([]);
  const [suspended, setSuspended] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const [a, p, s] = await Promise.all([
        getOutletDrivers(),
        getOutletPendingDrivers(),
        getOutletSuspendedDrivers(),
      ]);
      setApproved(a.data?.data || []);
      setPending(p.data?.data || []);
      setSuspended(s.data?.data || []);
    } catch (err) {
      Swal.fire({ icon: "error", text: err?.response?.data?.message || "Failed to load drivers" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async (driverId, defaultMax = 1) => {
    const { value: max } = await Swal.fire({
      title: "Approve driver",
      input: "number",
      inputLabel: "Max concurrent orders",
      inputValue: defaultMax,
      inputAttributes: { min: 1, max: 20 },
      showCancelButton: true,
    });
    if (!max) return;
    try {
      await approveOutletDriver(driverId, Number(max));
      Swal.fire({ toast: true, position: "top-end", icon: "success", title: "Driver approved", showConfirmButton: false, timer: 1500 });
      load();
    } catch (err) {
      Swal.fire({ icon: "error", text: err?.response?.data?.message || "Approve failed" });
    }
  };

  const handleReject = async (driverId) => {
    const confirm = await Swal.fire({
      title: "Reject driver?",
      text: "This driver will not be able to join your bin until they request again.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
    });
    if (!confirm.isConfirmed) return;
    try {
      await rejectOutletDriver(driverId);
      load();
    } catch (err) {
      Swal.fire({ icon: "error", text: err?.response?.data?.message || "Reject failed" });
    }
  };

  const handleSuspend = async (driverId) => {
    const confirm = await Swal.fire({
      title: "Suspend driver?",
      text: "Suspended drivers cannot claim new orders from your bin. You can re-approve them later.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Suspend",
    });
    if (!confirm.isConfirmed) return;
    try {
      await suspendOutletDriver(driverId);
      Swal.fire({ toast: true, position: "top-end", icon: "success", title: "Driver suspended", showConfirmButton: false, timer: 1500 });
      load();
    } catch (err) {
      Swal.fire({ icon: "error", text: err?.response?.data?.message || "Suspend failed" });
    }
  };

  const handleLimits = async (driverId, current) => {
    const { value: max } = await Swal.fire({
      title: "Set order limit",
      input: "number",
      inputValue: current,
      inputAttributes: { min: 1, max: 20 },
      showCancelButton: true,
    });
    if (!max) return;
    try {
      await setOutletDriverLimits(driverId, Number(max));
      load();
    } catch (err) {
      Swal.fire({ icon: "error", text: err?.response?.data?.message || "Update failed" });
    }
  };

  const tabs = [
    { key: "approved", label: "Approved", count: approved.length },
    { key: "pending", label: "Pending", count: pending.length },
    { key: "suspended", label: "Suspended", count: suspended.length },
  ];

  const list = tab === "approved" ? approved : tab === "pending" ? pending : suspended;

  return (
    <div className="space-y-6 px-6 py-4">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Driver Bin</h1>
        <p className="text-sm text-gray-600">Approve drivers to your bin, suspend access, and set how many orders each can take at once.</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm rounded-lg ${tab === t.key ? "text-white" : "border bg-white"}`}
            style={tab === t.key ? { backgroundColor: BRAND } : {}}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left">Driver</th>
              <th className="px-4 py-3 text-left">Phone</th>
              {tab === "approved" && <th className="px-4 py-3 text-left">Max orders</th>}
              {tab === "approved" && <th className="px-4 py-3 text-left">Active</th>}
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
            ) : list.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No drivers.</td></tr>
            ) : tab === "approved" ? approved.map((d) => (
              <tr key={d.driver_id}>
                <td className="px-4 py-3">{d.driver?.user?.name || `Driver #${d.driver_id}`}</td>
                <td className="px-4 py-3">{d.driver?.user?.phone || "—"}</td>
                <td className="px-4 py-3">{d.max_concurrent_orders}</td>
                <td className="px-4 py-3">{d.active_assignments ?? 0}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => handleLimits(d.driver_id, d.max_concurrent_orders)} className="text-sm text-blue-600 hover:underline">Set limit</button>
                    <button type="button" onClick={() => handleSuspend(d.driver_id)} className="text-sm text-red-600 hover:underline">Suspend</button>
                  </div>
                </td>
              </tr>
            )) : tab === "pending" ? pending.map((m) => (
              <tr key={m.id}>
                <td className="px-4 py-3">{m.driver?.user?.name || `Driver #${m.driver_id}`}</td>
                <td className="px-4 py-3">{m.driver?.user?.phone || "—"}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => handleApprove(m.driver_id)} className="px-3 py-1 text-xs text-white rounded-lg" style={{ backgroundColor: BRAND }}>Approve</button>
                    <button type="button" onClick={() => handleReject(m.driver_id)} className="px-3 py-1 text-xs border rounded-lg text-red-600">Reject</button>
                  </div>
                </td>
              </tr>
            )) : suspended.map((d) => (
              <tr key={d.driver_id}>
                <td className="px-4 py-3">{d.driver?.user?.name || `Driver #${d.driver_id}`}</td>
                <td className="px-4 py-3">{d.driver?.user?.phone || "—"}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => handleApprove(d.driver_id, d.max_concurrent_orders || 1)}
                    className="px-3 py-1 text-xs text-white rounded-lg"
                    style={{ backgroundColor: BRAND }}
                  >
                    Re-approve
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OutletDriverBin;
