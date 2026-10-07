import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import axiosClient from "../api/axiosClient";

const BRAND = "#FF8C00";

const CHECK_KEYS = ["backend", "server", "payment", "backup", "database", "ai"];

const Health = () => {
  const [checks, setChecks] = useState({});
  const [tokenSkipped, setTokenSkipped] = useState(true);
  const [lastBackup, setLastBackup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/admin/health");
      const data = res.data?.data || {};
      setChecks(data.checks || {});
      setTokenSkipped(data.token_skipped !== false);
      setLastBackup(data.last_backup_at || null);
    } catch (e) {
      Swal.fire({ icon: "error", title: "Health check failed", text: e?.response?.data?.message || e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const runBackup = async () => {
    setRunning(true);
    try {
      await axiosClient.post("/admin/backup/run");
      await load();
      Swal.fire({ toast: true, position: "top-end", icon: "success", title: "Backup completed", showConfirmButton: false, timer: 1800 });
    } catch (e) {
      Swal.fire({ icon: "error", title: "Backup failed", text: e?.response?.data?.message || e.message });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 uppercase tracking-wide">Health dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Backend, server, payment, backup, database, and AI. Token is skipped.</p>
        </div>
        <button
          type="button"
          onClick={runBackup}
          disabled={running}
          className="px-4 py-2 text-sm text-white rounded-lg disabled:opacity-50"
          style={{ backgroundColor: BRAND }}
        >
          {running ? "Running…" : "Run backup"}
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading statuses…</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CHECK_KEYS.map((key) => {
            const status = String(checks[key] || "down").toLowerCase();
            const ok = status === "ok";
            return (
              <div key={key} className="bg-white border rounded-xl p-5">
                <p className="text-sm text-gray-500 capitalize">{key}</p>
                <p className={`mt-2 text-lg font-semibold ${ok ? "text-emerald-600" : "text-red-600"}`}>
                  {ok ? "OK" : "Down"}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {tokenSkipped && (
        <p className="text-xs text-gray-400">Token dashboard is not included.</p>
      )}
      {lastBackup && <p className="text-xs text-gray-500">Last backup: {lastBackup}</p>}
    </div>
  );
};

export default Health;
