import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  assignFailedRedelivery,
  disputeFailedDelivery,
  getFailedDeliveries,
  setFailedDeliveryResponsibility,
} from "../../api/refundApi";

const BRAND = "#FF8C00";

export default function FailedDeliveriesPanel() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getFailedDeliveries();
      const page = res.data?.data || {};
      const list = Array.isArray(page.data) ? page.data : Array.isArray(page) ? page : [];
      setRows(list);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Failed to load cases");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const act = async (title, fn) => {
    try {
      await fn();
      await Swal.fire({ icon: "success", title, confirmButtonColor: BRAND });
      load();
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: e?.response?.data?.message || e.message,
        confirmButtonColor: BRAND,
      });
    }
  };

  const chooseResponsibility = async (row) => {
    const { value } = await Swal.fire({
      title: "Who is responsible?",
      input: "select",
      inputOptions: { buyer: "Buyer", driver: "Driver", vendor: "Vendor" },
      showCancelButton: true,
      confirmButtonColor: BRAND,
    });
    if (!value) return;
    act("Responsibility saved", () => setFailedDeliveryResponsibility(row.id, value));
  };

  const assignDriver = async (row) => {
    const { value } = await Swal.fire({
      title: "Redelivery driver id",
      input: "number",
      showCancelButton: true,
      confirmButtonColor: BRAND,
    });
    if (!value) return;
    act("Redelivery assigned", () => assignFailedRedelivery(row.id, value));
  };

  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-800">Failed deliveries</h2>
        <button type="button" onClick={load} className="text-sm text-gray-600 hover:text-gray-900">
          Refresh
        </button>
      </div>
      {error && <p className="px-4 py-2 text-sm text-red-600">{error}</p>}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {["Case", "Order item", "Status", "Reason", "Fee", "Action"].map((label) => (
                <th key={label} className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-6 text-gray-500">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-6 text-gray-500">No failed delivery cases.</td></tr>
            ) : rows.map((row) => (
              <tr key={row.id} className="border-t border-gray-100">
                <td className="px-4 py-2">{row.id}</td>
                <td className="px-4 py-2">{row.invoice_item_id}</td>
                <td className="px-4 py-2">{row.status}{row.frozen ? " · frozen" : ""}</td>
                <td className="px-4 py-2">{row.failure_reason || "—"}</td>
                <td className="px-4 py-2">{row.redelivery_fee ?? "—"}</td>
                <td className="px-4 py-2">
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="text-xs underline" onClick={() => chooseResponsibility(row)}>Responsibility</button>
                    <button type="button" className="text-xs underline" onClick={() => act("Case disputed", () => disputeFailedDelivery(row.id))}>Dispute</button>
                    <button type="button" className="text-xs underline" onClick={() => assignDriver(row)}>Assign</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
