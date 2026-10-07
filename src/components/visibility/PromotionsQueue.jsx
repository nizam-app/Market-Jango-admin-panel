import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import axiosClient from "../../api/axiosClient";

const BRAND = "#FF8C00";

const PromotionsQueue = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/admin/promotions", { params: { status: "pending" } });
      const data = res.data?.data;
      setRows(data?.data || data || []);
    } catch (e) {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (id) => {
    try {
      await axiosClient.post(`/admin/promotions/${id}/approve`);
      Swal.fire({ toast: true, position: "top-end", icon: "success", title: "Promotion approved", showConfirmButton: false, timer: 1400 });
      load();
    } catch (e) {
      Swal.fire({ icon: "error", title: "Approve failed", text: e?.response?.data?.message || e.message });
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 mt-8">
      <div className="px-6 py-4 border-b bg-gray-50">
        <h2 className="text-base font-semibold text-gray-800">Promotion approve queue</h2>
        <p className="text-xs text-gray-500 mt-1">Vendor submissions stay hidden on the buyer app until approved.</p>
      </div>
      <div className="p-4">
        {loading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-gray-500">No pending promotions.</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-2">Title</th>
                <th>Zone</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t">
                  <td className="py-2">{row.title}</td>
                  <td>{row.zone || "—"}</td>
                  <td>{row.status}</td>
                  <td className="text-right">
                    <button type="button" onClick={() => approve(row.id)} className="px-3 py-1 text-white rounded-lg text-xs" style={{ backgroundColor: BRAND }}>
                      Approve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PromotionsQueue;
