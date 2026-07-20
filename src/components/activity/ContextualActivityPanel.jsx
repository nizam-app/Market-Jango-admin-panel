// Compact page-level activity list for the current admin management screen.
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { Activity, RefreshCw } from "lucide-react";
import { getActivityFeed } from "../../api/activityApi";
import { moduleFromPathname, moduleLabel } from "../../utils/activityModules";

const formatTime = (str) => {
  if (!str) return "-";
  try {
    return new Date(str).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return str;
  }
};

const ContextualActivityPanel = () => {
  const { pathname } = useLocation();
  const module = moduleFromPathname(pathname);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    if (!module) return;
    setLoading(true);
    setError("");
    try {
      const res = await getActivityFeed({ module, limit: 8 });
      setLogs(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      console.error("Contextual activity error", err);
      setError("Could not load activity.");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [module]);

  if (!module) return null;

  return (
    <aside className="mt-8 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Activity className="w-4 h-4 text-[#FF8C00] flex-shrink-0" />
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-gray-800 truncate">
              Page activity · {moduleLabel(module)}
            </h3>
            <p className="text-[11px] text-gray-400">Recent actions for this screen</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-white disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Link
            to={`/activity-management?module=${encodeURIComponent(module)}`}
            className="text-xs font-medium text-[#FF8C00] hover:underline whitespace-nowrap"
          >
            View all
          </Link>
        </div>
      </div>

      <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
        {loading && logs.length === 0 ? (
          <p className="px-4 py-6 text-center text-xs text-gray-400">Loading…</p>
        ) : error ? (
          <p className="px-4 py-6 text-center text-xs text-red-500">{error}</p>
        ) : logs.length === 0 ? (
          <p className="px-4 py-6 text-center text-xs text-gray-400">No activity recorded for this page yet.</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="px-4 py-2.5 hover:bg-gray-50/80">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">
                    {log.actor_name || "—"}
                    <span className="ml-1 font-normal text-gray-400">({log.actor_role})</span>
                  </p>
                  <p className="text-xs text-gray-600 truncate mt-0.5">{log.description || log.action}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span
                    className={`inline-block text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                      log.status === "failed"
                        ? "bg-red-100 text-red-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {log.status || "success"}
                  </span>
                  <p className="text-[10px] text-gray-400 mt-1 whitespace-nowrap">{formatTime(log.created_at)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
};

export default ContextualActivityPanel;
