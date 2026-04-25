// src/components/activity/AlertsPanel.jsx
import { useEffect, useState } from "react";
import { getAlerts, resolveAlert, dismissAlert } from "../../api/activityApi";
import Swal from "sweetalert2";

const STATUS_TABS = ["pending", "resolved", "dismissed"];

const SEVERITY_BADGE = {
  critical: "bg-red-100 text-red-700",
  high:     "bg-orange-100 text-orange-700",
  medium:   "bg-amber-100 text-amber-700",
  low:      "bg-green-100 text-green-700",
};

const formatDate = (str) => {
  if (!str) return "-";
  try {
    return new Date(str).toLocaleString("en-US", {
      month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return str; }
};

const AlertsPanel = ({ onPendingCount }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState("pending");
  const [actingId, setActingId] = useState(null);

  const load = async (status = activeStatus) => {
    setLoading(true);
    try {
      const res = await getAlerts({ status });
      const list = res.data?.data?.data ?? res.data?.data ?? [];
      setAlerts(list);
      if (status === "pending" && onPendingCount) {
        onPendingCount(list.length);
      }
    } catch (err) {
      console.error("Alerts error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(activeStatus); }, [activeStatus]);

  const handleResolve = async (alert) => {
    const { value: note } = await Swal.fire({
      title: "Resolve Alert",
      input: "text",
      inputLabel: "Note (optional)",
      inputPlaceholder: "Add a resolution note...",
      confirmButtonText: "Resolve",
      confirmButtonColor: "#22c55e",
      showCancelButton: true,
    });
    if (note === undefined) return;
    try {
      setActingId(alert.id);
      await resolveAlert(alert.id, note ?? "");
      await load(activeStatus);
      Swal.fire({ icon: "success", title: "Resolved", timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Failed", text: err?.response?.data?.message ?? "Something went wrong" });
    } finally {
      setActingId(null);
    }
  };

  const handleDismiss = async (alert) => {
    const result = await Swal.fire({
      title: "Dismiss Alert?",
      text: "This will mark the alert as dismissed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#6b7280",
      confirmButtonText: "Dismiss",
    });
    if (!result.isConfirmed) return;
    try {
      setActingId(alert.id);
      await dismissAlert(alert.id, "");
      await load(activeStatus);
      Swal.fire({ icon: "success", title: "Dismissed", timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Failed", text: err?.response?.data?.message ?? "Something went wrong" });
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-base font-semibold text-gray-800">Alerts Panel</h2>
        <p className="text-xs text-gray-400 mt-0.5">High-risk actions that need attention</p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 px-6 pt-4 border-b border-gray-200">
        {STATUS_TABS.map((s) => (
          <button
            key={s}
            onClick={() => setActiveStatus(s)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 capitalize transition-colors ${
              activeStatus === s
                ? "border-[#FF8C00] text-[#FF8C00] bg-orange-50"
                : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="divide-y divide-gray-100">
        {loading ? (
          <p className="px-6 py-10 text-center text-sm text-gray-400">Loading...</p>
        ) : alerts.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-gray-400">
            No {activeStatus} alerts.
          </p>
        ) : (
          alerts.map((alert) => {
            const log = alert.activity_log;
            const sev = SEVERITY_BADGE[log?.severity] ?? SEVERITY_BADGE.low;
            const isActing = actingId === alert.id;

            return (
              <div key={alert.id} className="px-6 py-4 hover:bg-gray-50/60">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      {log?.severity && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${sev}`}>
                          {log.severity}
                        </span>
                      )}
                      <span className="text-sm font-semibold text-gray-800">
                        {log?.actor_name ?? "—"}
                      </span>
                      <span className="text-xs text-gray-400">{log?.actor_role}</span>
                    </div>
                    <p className="text-sm text-gray-700">{log?.description || log?.action || "—"}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(alert.created_at)}
                      {log?.target_type && (
                        <span className="ml-2 text-gray-400">· {log.target_type} #{log.target_id ?? "-"}</span>
                      )}
                    </p>
                    {alert.note && (
                      <p className="text-xs text-gray-500 mt-1 italic">Note: {alert.note}</p>
                    )}
                  </div>

                  {activeStatus === "pending" && (
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        disabled={isActing}
                        onClick={() => handleResolve(alert)}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50"
                      >
                        {isActing ? "..." : "Resolve"}
                      </button>
                      <button
                        disabled={isActing}
                        onClick={() => handleDismiss(alert)}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
                      >
                        {isActing ? "..." : "Dismiss"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AlertsPanel;
