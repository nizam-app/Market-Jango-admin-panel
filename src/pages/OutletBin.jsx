// src/pages/OutletBin.jsx
import React, { useEffect, useState } from "react";
import { getOutletBin } from "../api/outletApi";
import OutletOrderMap from "../components/outlet/OutletOrderMap";

const OutletBin = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getOutletBin({ per_page: 50 })
      .then((res) => {
        const data = res.data?.data;
        setOrders(Array.isArray(data?.data) ? data.data : []);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 px-6 py-4">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Order Bin</h1>
        <p className="text-sm text-gray-600">Orders in your bin — approved drivers compete to claim (first wins).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border divide-y">
          {loading ? (
            <p className="p-8 text-center text-gray-500">Loading...</p>
          ) : orders.length === 0 ? (
            <p className="p-8 text-center text-gray-500">Bin is empty.</p>
          ) : orders.map((o) => (
            <button key={o.id} type="button" onClick={() => setSelected(o)} className={`w-full text-left px-4 py-3 hover:bg-gray-50 ${selected?.id === o.id ? "bg-orange-50" : ""}`}>
              <div className="font-medium text-sm">{o.order_number || `Order #${o.id}`}</div>
              <div className="text-xs text-gray-500">{o.pickup?.vendor_name} → {o.dropoff?.buyer_name || "Buyer"}</div>
            </button>
          ))}
        </div>
        <div className="bg-white rounded-xl border p-4">
          {selected ? (
            <OutletOrderMap pickup={selected.pickup} dropoff={selected.dropoff} />
          ) : (
            <p className="text-sm text-gray-500 text-center py-12">Select a bin order to view locations.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OutletBin;
