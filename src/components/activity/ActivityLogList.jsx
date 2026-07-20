// src/components/activity/ActivityLogList.jsx
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { getActivityLogs, getActivityLog } from "../../api/activityApi";
import { ACTIVITY_MODULES } from "../../utils/activityModules";

const SEVERITY_BADGE = {
  critical: "bg-red-100 text-red-700",
  high: "bg-orange-100 text-orange-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-green-100 text-green-700",
};

const STATUS_BADGE = {
  success: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-700",
};

const SEVERITIES = ["", "low", "medium", "high", "critical"];
const STATUSES = ["", "success", "failed"];
const ROLES = ["", "admin", "buyer", "vendor", "driver", "transport", "affiliate", "outlet"];

const formatDate = (str) => {
  if (!str) return "-";
  try {
    return new Date(str).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return str;
  }
};

const fromDatetimeLocalValue = (local) => {
  if (!local) return "";
  const d = new Date(local);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString();
};

const DetailModal = ({ logId, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActivityLog(logId)
      .then((res) => setData(res.data?.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [logId]);

  const sev = data ? SEVERITY_BADGE[data.severity] ?? SEVERITY_BADGE.low : "";
  const st = data ? STATUS_BADGE[data.status] ?? STATUS_BADGE.success : "";

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-800">Activity Detail</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">
            &times;
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-6">Loading...</p>
          ) : !data ? (
            <p className="text-sm text-red-500 text-center py-6">Failed to load.</p>
          ) : (
            <dl className="space-y-3 text-sm">
              {[
                ["Actor", `${data.actor_name || "—"} (${data.actor_role || "—"})`],
                ["Module", data.module || "—"],
                ["Action", data.action],
                ["Status", <span key="st" className={`px-2 py-0.5 rounded-full text-xs font-semibold ${st}`}>{data.status || "success"}</span>],
                ["Target", data.target_type ? `${data.target_type} #${data.target_id ?? "-"}` : "-"],
                ["Description", data.description || "-"],
                ["Severity", <span key="sev" className={`px-2 py-0.5 rounded-full text-xs font-semibold ${sev}`}>{data.severity}</span>],
                ["HTTP", data.http_method ? `${data.http_method} ${data.http_path || ""}` : "-"],
                ["Response", data.response_status ?? "-"],
                ["IP Address", data.ip_address || "-"],
                ["Time", formatDate(data.created_at)],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-3">
                  <dt className="w-28 flex-shrink-0 text-gray-500 font-medium">{label}</dt>
                  <dd className="text-gray-800 break-all">{value}</dd>
                </div>
              ))}
              {data.metadata && Object.keys(data.metadata).length > 0 && (
                <div>
                  <dt className="text-gray-500 font-medium mb-1">Metadata (sanitized)</dt>
                  <dd>
                    <pre className="bg-gray-50 rounded-lg p-3 text-xs text-gray-700 overflow-auto max-h-40">
                      {JSON.stringify(data.metadata, null, 2)}
                    </pre>
                  </dd>
                </div>
              )}
            </dl>
          )}
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const ActivityLogList = () => {
  const [searchParams] = useSearchParams();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedId, setSelectedId] = useState(null);

  const [severity, setSeverity] = useState("");
  const [status, setStatus] = useState("");
  const [module, setModule] = useState(searchParams.get("module") || "");
  const [actorRole, setActorRole] = useState("");
  const [actorName, setActorName] = useState("");
  const [action, setAction] = useState("");
  const [datetimeFrom, setDatetimeFrom] = useState("");
  const [datetimeTo, setDatetimeTo] = useState("");

  // Pass overrides explicitly to avoid stale-closure filters (e.g. on Reset).
  const load = async (p = 1, overrides = {}) => {
    const f = {
      severity,
      status,
      module,
      actorRole,
      actorName,
      action,
      datetimeFrom,
      datetimeTo,
      ...overrides,
    };
    setLoading(true);
    try {
      const res = await getActivityLogs({
        severity: f.severity,
        status: f.status,
        module: f.module,
        actor_role: f.actorRole,
        actor_name: f.actorName,
        action: f.action,
        datetime_from: fromDatetimeLocalValue(f.datetimeFrom),
        datetime_to: fromDatetimeLocalValue(f.datetimeTo),
        page: p,
      });
      const d = res.data?.data;
      setLogs(d?.data ?? []);
      setPage(d?.current_page ?? 1);
      setLastPage(d?.last_page ?? 1);
      setTotal(d?.total ?? 0);
    } catch (err) {
      console.error("Activity logs error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const m = searchParams.get("module") || "";
    setModule(m);
    load(1, { module: m });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleSearch = () => {
    load(1);
  };

  const handleReset = () => {
    setSeverity("");
    setStatus("");
    setModule("");
    setActorRole("");
    setActorName("");
    setAction("");
    setDatetimeFrom("");
    setDatetimeTo("");
    load(1, {
      severity: "",
      status: "",
      module: "",
      actorRole: "",
      actorName: "",
      action: "",
      datetimeFrom: "",
      datetimeTo: "",
    });
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-base font-semibold text-gray-800">Activity Logs</h2>
              {!loading && <p className="text-xs text-gray-400 mt-0.5">{total} total records</p>}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 items-end">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Module / page</label>
                <select
                  value={module}
                  onChange={(e) => setModule(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/40"
                >
                  {ACTIVITY_MODULES.map((m) => (
                    <option key={m.value || "all"} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Role</label>
                <select
                  value={actorRole}
                  onChange={(e) => setActorRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/40"
                >
                  {ROLES.map((r) => (
                    <option key={r || "all"} value={r}>
                      {r || "All roles"}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Actor name</label>
                <input
                  type="text"
                  value={actorName}
                  onChange={(e) => setActorName(e.target.value)}
                  placeholder="Search actor"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/40"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Action</label>
                <input
                  type="text"
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  placeholder="e.g. banned, updated"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/40"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/40"
                >
                  {STATUSES.map((s) => (
                    <option key={s || "all"} value={s}>
                      {s || "All"}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Severity</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/40"
                >
                  {SEVERITIES.map((s) => (
                    <option key={s || "all"} value={s}>
                      {s || "All"}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">From (day & time)</label>
                <input
                  type="datetime-local"
                  value={datetimeFrom}
                  onChange={(e) => setDatetimeFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/40"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">To (day & time)</label>
                <input
                  type="datetime-local"
                  value={datetimeTo}
                  onChange={(e) => setDatetimeTo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/40"
                />
              </div>
              <div className="flex gap-2 col-span-2 md:col-span-2">
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-[#FF8C00] hover:opacity-90"
                >
                  Filter
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-sm font-medium text-gray-700 rounded-lg bg-gray-100 hover:bg-gray-200"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Actor", "Role", "Module", "Action", "Status", "Severity", "Time", ""].map((h) => (
                  <th key={h || "actions"} className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-400">
                    No logs found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const sev = SEVERITY_BADGE[log.severity] ?? SEVERITY_BADGE.low;
                  const st = STATUS_BADGE[log.status] ?? STATUS_BADGE.success;
                  return (
                    <tr key={log.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">{log.actor_name || "—"}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{log.actor_role || "—"}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{log.module || "—"}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{log.action}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${st}`}>
                          {log.status || "success"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${sev}`}>
                          {log.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{formatDate(log.created_at)}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedId(log.id)}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[#FF8C00] text-white hover:opacity-90"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-3 items-center px-6 py-4 border-t border-gray-100 text-sm">
          <button
            onClick={() => load(page - 1)}
            disabled={page <= 1 || loading}
            className="px-4 py-2 rounded-[100px] border bg-white disabled:opacity-40 cursor-pointer"
          >
            Previous
          </button>
          <span className="text-gray-600">
            Page {page} of {lastPage}
          </span>
          <button
            onClick={() => load(page + 1)}
            disabled={page >= lastPage || loading}
            className="px-4 py-2 rounded-[100px] border bg-white disabled:opacity-40 cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>

      {selectedId && <DetailModal logId={selectedId} onClose={() => setSelectedId(null)} />}
    </>
  );
};

export default ActivityLogList;
