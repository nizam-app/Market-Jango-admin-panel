// src/components/activity/ActivityFeed.jsx
import { useEffect, useRef, useState } from "react";
import { getActivityFeed } from "../../api/activityApi";

const SEVERITY_STYLES = {
  critical: { dot: "bg-red-500", badge: "bg-red-100 text-red-700", border: "border-red-200" },
  high: { dot: "bg-orange-500", badge: "bg-orange-100 text-orange-700", border: "border-orange-200" },
  medium: { dot: "bg-amber-400", badge: "bg-amber-100 text-amber-700", border: "border-amber-200" },
  low: { dot: "bg-green-500", badge: "bg-green-100 text-green-700", border: "border-green-200" },
};

const STATUS_BADGE = {
  success: "bg-emerald-50 text-emerald-700",
  failed: "bg-red-50 text-red-700",
};

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

const ActivityFeed = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const timerRef = useRef(null);

  const load = async () => {
    try {
      const res = await getActivityFeed({ limit: 50 });
      setLogs(res.data?.data ?? []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Activity feed error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    timerRef.current = setInterval(load, 30_000);
    return () => clearInterval(timerRef.current);
  }, []);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF8C00] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FF8C00]" />
          </span>
          <h2 className="text-base font-semibold text-gray-800">Live Activity Feed</h2>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-gray-400">
              Updated {lastUpdated.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <button
            onClick={load}
            className="text-xs px-3 py-1 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-100 max-h-[420px] overflow-y-auto">
        {loading ? (
          <div className="px-6 py-10 text-center text-sm text-gray-400">Loading feed...</div>
        ) : logs.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-gray-400">No recent activity.</div>
        ) : (
          logs.slice(0, 20).map((log) => {
            const sev = SEVERITY_STYLES[log.severity] ?? SEVERITY_STYLES.low;
            const st = STATUS_BADGE[log.status] ?? STATUS_BADGE.success;
            return (
              <div
                key={log.id}
                className={`flex items-start gap-4 px-6 py-3 hover:bg-gray-50/60 transition-colors border-l-4 ${sev.border}`}
              >
                <span className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${sev.dot}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium text-gray-800 truncate">{log.actor_name || "—"}</span>
                    <span className="text-xs text-gray-400">{log.actor_role}</span>
                    {log.module && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{log.module}</span>
                    )}
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${sev.badge}`}>
                      {log.severity}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${st}`}>
                      {log.status || "success"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{log.description || log.action}</p>
                </div>
                <span className="flex-shrink-0 text-xs text-gray-400 whitespace-nowrap mt-0.5">
                  {formatTime(log.created_at)}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;
