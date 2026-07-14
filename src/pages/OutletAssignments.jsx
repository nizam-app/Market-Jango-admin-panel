// src/pages/OutletAssignments.jsx
import React, { useEffect, useState } from "react";
import { getOutletAssignments } from "../api/outletApi";
import OutletOrderMap from "../components/outlet/OutletOrderMap";

const BRAND = "#FF8C00";

const firstNonEmpty = (...vals) => {
  for (const v of vals) {
    if (v == null) continue;
    const s = String(v).trim();
    if (s) return s;
  }
  return "";
};

const OutletAssignments = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setLoading(true);
    getOutletAssignments({ status: status || undefined, per_page: 30 })
      .then((res) => {
        const data = res.data?.data;
        setRows(Array.isArray(data?.data) ? data.data : []);
      })
      .finally(() => setLoading(false));
  }, [status]);

  const buildMapPayload = (row) => {
    const item = row?.invoice_item;
    const vendor = row?.vendor;
    return {
      pickup: {
        address: firstNonEmpty(item?.pickup_address, vendor?.address),
        latitude: item?.pickup_latitude ?? vendor?.latitude,
        longitude: item?.pickup_longitude ?? vendor?.longitude,
        vendor_name: vendor?.business_name,
      },
      dropoff: {
        address: firstNonEmpty(item?.ship_address),
        latitude: item?.ship_latitude,
        longitude: item?.ship_longitude,
        buyer_name: item?.cus_name ?? item?.invoice?.cus_name,
        buyer_phone: item?.cus_phone ?? item?.invoice?.cus_phone,
      },
    };
  };

  return (
    <div className="space-y-6 px-6 py-4">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Assignments</h1>
        <p className="text-sm text-gray-600">All driver assignments from your outlet with pickup and buyer destination.</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["", "pending", "accepted", "in_transit", "delivered"].map((s) => (
          <button key={s || "all"} type="button" onClick={() => setStatus(s)} className={`px-3 py-1.5 text-sm rounded-lg border capitalize ${status === s ? "text-white" : "bg-white"}`} style={status === s ? { backgroundColor: BRAND } : {}}>
            {s || "All"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-3 py-2 text-left">Order</th>
                <th className="px-3 py-2 text-left">Driver</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={4} className="px-3 py-8 text-center text-gray-500">Loading...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={4} className="px-3 py-8 text-center text-gray-500">No assignments.</td></tr>
              ) : rows.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelected(r)}>
                  <td className="px-3 py-2">{r.invoice_item?.invoice?.order_number || r.invoice_item_id}</td>
                  <td className="px-3 py-2">{r.driver?.user?.name || `Driver #${r.driver_id}`}</td>
                  <td className="px-3 py-2 capitalize">{r.status}</td>
                  <td className="px-3 py-2 text-xs">{r.assignment_source?.replace(/_/g, " ") || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-white rounded-xl border p-4">
          {selected ? (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Assignment #{selected.id}</h3>
              <OutletOrderMap {...buildMapPayload(selected)} />
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-12">Select an assignment to view map.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OutletAssignments;
