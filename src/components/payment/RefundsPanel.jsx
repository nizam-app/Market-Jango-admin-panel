// src/components/payment/RefundsPanel.jsx
import React, { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Search, RefreshCw } from "lucide-react";
import { getRefunds, approveRefund, rejectRefund } from "../../api/refundApi";

const BRAND = "#FF8C00";

const emptySummary = () => ({
  pending: { count: 0, total: "0" },
  approved: { count: 0, total: "0" },
  rejected: { count: 0, total: "0" },
});

export default function RefundsPanel() {
  const [summary, setSummary] = useState(emptySummary());
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [status, setStatus] = useState("pending");
  const [vendorId, setVendorId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [search, setSearch] = useState("");

  const load = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        setError("");
        const params = { page, status };
        if (vendorId.trim()) params.vendor_id = vendorId.trim();
        if (fromDate) params.from_date = fromDate;

        const res = await getRefunds(params);
        const root = res.data?.data || {};
        setSummary(root.summary || emptySummary());

        const pag = root.refunds || {};
        const list = Array.isArray(pag.data) ? pag.data : [];
        setRows(list);
        setMeta({
          current_page: pag.current_page || 1,
          last_page: pag.last_page || 1,
          total: pag.total ?? list.length,
        });
      } catch (e) {
        console.error(e);
        setError(e?.response?.data?.message || e.message || "Failed to load refunds");
        setRows([]);
        setSummary(emptySummary());
      } finally {
        setLoading(false);
      }
    },
    [status, vendorId, fromDate]
  );

  useEffect(() => {
    load(1);
  }, [load]);

  const filteredRows = search.trim()
    ? rows.filter((r) => {
        const q = search.toLowerCase();
        return (
          String(r.id).includes(q) ||
          (r.invoice?.order_number || "").toLowerCase().includes(q) ||
          (r.user?.name || "").toLowerCase().includes(q) ||
          (r.vendor?.business_name || "").toLowerCase().includes(q)
        );
      })
    : rows;

  const handleApprove = async (refund) => {
    const { value: note } = await Swal.fire({
      title: "Approve refund",
      input: "textarea",
      inputLabel: "Note (optional)",
      inputPlaceholder: "Internal note",
      showCancelButton: true,
      confirmButtonText: "Approve",
      confirmButtonColor: BRAND,
    });
    if (note === undefined) return;
    try {
      Swal.fire({ title: "Processing...", didOpen: () => Swal.showLoading(), allowOutsideClick: false });
      await approveRefund(refund.id, note || "");
      Swal.close();
      await Swal.fire({ icon: "success", title: "Refund approved", confirmButtonColor: BRAND });
      load(meta.current_page);
    } catch (e) {
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: e?.response?.data?.message || e.message,
        confirmButtonColor: BRAND,
      });
    }
  };

  const handleReject = async (refund) => {
    const { value: note } = await Swal.fire({
      title: "Reject refund",
      input: "textarea",
      inputLabel: "Note",
      inputPlaceholder: "Reason for rejection",
      showCancelButton: true,
      confirmButtonText: "Reject",
      confirmButtonColor: "#dc2626",
      inputValidator: (v) => (!v || !String(v).trim() ? "Please add a note" : null),
    });
    if (note === undefined) return;
    try {
      Swal.fire({ title: "Processing...", didOpen: () => Swal.showLoading(), allowOutsideClick: false });
      await rejectRefund(refund.id, note.trim());
      Swal.close();
      await Swal.fire({ icon: "success", title: "Refund rejected", confirmButtonColor: BRAND });
      load(meta.current_page);
    } catch (e) {
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: e?.response?.data?.message || e.message,
        confirmButtonColor: BRAND,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {["pending", "approved", "rejected"].map((key) => (
          <div
            key={key}
            className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
          >
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {key}
            </p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">
              {summary[key]?.count ?? 0}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Total: {summary[key]?.total ?? "0"}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-gray-800">Refund requests</h2>
          <button
            type="button"
            onClick={() => load(meta.current_page)}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="pending">pending</option>
                <option value="approved">approved</option>
                <option value="rejected">rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Vendor ID</label>
              <input
                type="text"
                value={vendorId}
                onChange={(e) => setVendorId(e.target.value)}
                placeholder="optional"
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">From date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <button
              type="button"
              onClick={() => load(1)}
              className="px-4 py-2 text-sm font-medium text-white rounded-lg"
              style={{ backgroundColor: BRAND }}
            >
              Apply filters
            </button>
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order #, customer, vendor…"
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>

        {error && (
          <div className="px-6 pb-2 text-sm text-red-600">{error}</div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Order
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Vendor
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Reason
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-500">
                    Loading…
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-500">
                    No refunds found.
                  </td>
                </tr>
              ) : (
                filteredRows.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-sm text-gray-900">{r.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {r.invoice?.order_number || r.invoice_id}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {r.user?.name || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {r.vendor?.business_name || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate" title={r.reason}>
                      {r.reason || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{r.amount}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100">
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {r.status === "pending" ? (
                        <div className="inline-flex gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => handleApprove(r)}
                            className="px-2 py-1 text-xs font-medium rounded-lg bg-green-100 text-green-800 hover:bg-green-200"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReject(r)}
                            className="px-2 py-1 text-xs font-medium rounded-lg bg-red-100 text-red-800 hover:bg-red-200"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {meta.last_page > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600">
            <span>
              Page {meta.current_page} of {meta.last_page} ({meta.total} total)
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={meta.current_page <= 1 || loading}
                onClick={() => load(meta.current_page - 1)}
                className="px-3 py-1 border rounded-lg disabled:opacity-40"
              >
                Prev
              </button>
              <button
                type="button"
                disabled={meta.current_page >= meta.last_page || loading}
                onClick={() => load(meta.current_page + 1)}
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
}
