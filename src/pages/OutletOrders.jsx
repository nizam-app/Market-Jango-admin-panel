// src/pages/OutletOrders.jsx
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  getOutletOrders,
  getOutletOrder,
  moveOrderToBin,
  assignOutletDriver,
  forwardOutletOrder,
  getOutletDrivers,
  getActiveOutletsForForward,
} from "../api/outletApi";
import OutletOrderMap from "../components/outlet/OutletOrderMap";

const BRAND = "#FF8C00";

const statusBadge = (s) => {
  const map = {
    at_outlet: "bg-amber-100 text-amber-800",
    in_bin: "bg-purple-100 text-purple-800",
    assigned_driver: "bg-blue-100 text-blue-800",
    forwarded: "bg-gray-100 text-gray-700",
  };
  return map[s] || "bg-gray-100 text-gray-600";
};

const OutletOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [assignDriverId, setAssignDriverId] = useState("");
  const [forwardOutletId, setForwardOutletId] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const res = await getOutletOrders({ outlet_status: filter || undefined, per_page: 30 });
      const data = res.data?.data;
      setOrders(Array.isArray(data?.data) ? data.data : []);
    } catch (err) {
      Swal.fire({ icon: "error", text: err?.response?.data?.message || "Failed to load orders" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    getOutletDrivers().then((r) => setDrivers(r.data?.data || [])).catch(() => {});
    getActiveOutletsForForward().then((r) => setOutlets(r.data?.data || [])).catch(() => {});
  }, [filter]);

  const openDetail = async (id) => {
    try {
      const res = await getOutletOrder(id);
      setSelected(res.data?.data || null);
    } catch (err) {
      Swal.fire({ icon: "error", text: "Failed to load order detail" });
    }
  };

  const handleToBin = async (id) => {
    try {
      await moveOrderToBin(id);
      Swal.fire({ toast: true, position: "top-end", icon: "success", title: "Moved to bin", showConfirmButton: false, timer: 1500 });
      load();
      if (selected?.id === id) openDetail(id);
    } catch (err) {
      Swal.fire({ icon: "error", text: err?.response?.data?.message || "Failed" });
    }
  };

  const handleAssign = async (id) => {
    if (!assignDriverId) return;
    try {
      await assignOutletDriver(id, Number(assignDriverId));
      Swal.fire({ toast: true, position: "top-end", icon: "success", title: "Driver assigned", showConfirmButton: false, timer: 1500 });
      load();
      setSelected(null);
    } catch (err) {
      Swal.fire({ icon: "error", text: err?.response?.data?.message || "Assign failed" });
    }
  };

  const handleForward = async (id) => {
    if (!forwardOutletId) return;
    try {
      await forwardOutletOrder(id, Number(forwardOutletId));
      Swal.fire({ toast: true, position: "top-end", icon: "success", title: "Forwarded", showConfirmButton: false, timer: 1500 });
      load();
      setSelected(null);
    } catch (err) {
      Swal.fire({ icon: "error", text: err?.response?.data?.message || "Forward failed" });
    }
  };

  return (
    <div className="space-y-6 px-6 py-4">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Outlet Orders</h1>
        <p className="text-sm text-gray-600">Orders assigned to your outlet. Review, drop to bin, assign driver, or forward.</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["", "at_outlet", "in_bin", "assigned_driver"].map((s) => (
          <button key={s || "all"} type="button" onClick={() => setFilter(s)} className={`px-3 py-1.5 text-sm rounded-lg border ${filter === s ? "text-white border-transparent" : "bg-white"}`} style={filter === s ? { backgroundColor: BRAND } : {}}>
            {s ? s.replace(/_/g, " ") : "All"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-3 py-2 text-left">Order</th>
                <th className="px-3 py-2 text-left">Vendor</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={4} className="px-3 py-8 text-center text-gray-500">Loading...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={4} className="px-3 py-8 text-center text-gray-500">No orders assigned yet.</td></tr>
              ) : orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">{o.order_number || `#${o.id}`}</td>
                  <td className="px-3 py-2">{o.vendor?.business_name || o.pickup?.vendor_name || "—"}</td>
                  <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded text-xs ${statusBadge(o.outlet_status)}`}>{o.outlet_status || "—"}</span></td>
                  <td className="px-3 py-2 text-right">
                    <button type="button" onClick={() => openDetail(o.id)} className="text-sm text-blue-600 hover:underline">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-xl border p-4 min-h-[300px]">
          {!selected ? (
            <p className="text-sm text-gray-500 text-center py-12">Select an order to view pickup/drop map and actions.</p>
          ) : (
            <div className="space-y-4">
              <h3 className="font-semibold">Order {selected.order_number || selected.id}</h3>
              <OutletOrderMap pickup={selected.pickup} dropoff={selected.dropoff} />
              <div className="flex flex-wrap gap-2">
                {["at_outlet", "forwarded"].includes(selected.outlet_status) && (
                  <button type="button" onClick={() => handleToBin(selected.id)} className="px-3 py-1.5 text-sm text-white rounded-lg" style={{ backgroundColor: BRAND }}>Drop to Bin</button>
                )}
              </div>
              {["at_outlet", "in_bin", "forwarded"].includes(selected.outlet_status) && (
                <div className="flex gap-2 items-center">
                  <select className="border rounded-lg px-2 py-1.5 text-sm flex-1" value={assignDriverId} onChange={(e) => setAssignDriverId(e.target.value)}>
                    <option value="">Assign driver...</option>
                    {drivers.map((d) => (
                      <option key={d.driver_id} value={d.driver_id}>{d.driver?.user?.name || `Driver #${d.driver_id}`}</option>
                    ))}
                  </select>
                  <button type="button" onClick={() => handleAssign(selected.id)} className="px-3 py-1.5 text-sm border rounded-lg">Assign</button>
                </div>
              )}
              {["at_outlet", "forwarded"].includes(selected.outlet_status) && (
                <div className="flex gap-2 items-center">
                  <select className="border rounded-lg px-2 py-1.5 text-sm flex-1" value={forwardOutletId} onChange={(e) => setForwardOutletId(e.target.value)}>
                    <option value="">Forward to outlet...</option>
                    {outlets.map((o) => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                  <button type="button" onClick={() => handleForward(selected.id)} className="px-3 py-1.5 text-sm border rounded-lg">Forward</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OutletOrders;
