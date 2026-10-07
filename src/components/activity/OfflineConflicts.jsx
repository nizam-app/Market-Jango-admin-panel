import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

const OfflineConflicts = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await axiosClient.get("/admin/offline-conflicts");
        if (!cancelled) setRows(res.data?.data || []);
      } catch (e) {
        if (!cancelled) setRows([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="bg-white rounded-xl border p-4">
      <h2 className="text-base font-semibold text-gray-800 mb-2">Offline last-stock conflicts</h2>
      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-gray-500">No rejected second sales.</p>
      ) : (
        <ul className="text-sm space-y-2">
          {rows.map((row) => (
            <li key={row.id} className="border rounded-lg p-3">
              Key {row.idempotency_key} — {row.response?.reason || "rejected"}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default OfflineConflicts;
