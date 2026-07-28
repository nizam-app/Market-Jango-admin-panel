// src/pages/AiManagement.jsx — AI feature limits + usage logs
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { Bot, RefreshCw, Save } from "lucide-react";
import { getAiSettings, updateAiSetting, getAiUsageLogs } from "../api/aiApi";

const BRAND = "#FF8C00";

const FEATURE_LABELS = {
  vendor_product_title: "Vendor Product Title",
  vendor_product_description: "Vendor Product Description",
  vendor_product_image: "Vendor Product Image",
  vendor_product_tags: "Vendor Product Tags",
  vendor_chat_reply: "Vendor Chat Reply",
  admin_ai_assistant: "Admin AI Assistant",
  vendor_product_edit: "Vendor Product Edit (legacy)",
};

const PRIMARY_FEATURES = [
  "vendor_product_title",
  "vendor_product_description",
  "vendor_product_image",
  "vendor_product_tags",
  "vendor_chat_reply",
  "admin_ai_assistant",
  "vendor_product_edit",
];

const inputClass =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200";

const AiManagement = () => {
  const [activeTab, setActiveTab] = useState("settings");
  const [aiEnabled, setAiEnabled] = useState(true);
  const [openaiModel, setOpenaiModel] = useState("");
  const [openaiImageModel, setOpenaiImageModel] = useState("");
  const [features, setFeatures] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [savingFeature, setSavingFeature] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(true);

  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logPage, setLogPage] = useState(1);
  const [logLastPage, setLogLastPage] = useState(1);
  const [logTotal, setLogTotal] = useState(0);
  const [logFilters, setLogFilters] = useState({
    feature_type: "",
    status: "",
    from: "",
    to: "",
    per_page: 20,
  });

  const featureOptions = useMemo(() => {
    const names = new Set([
      ...PRIMARY_FEATURES,
      ...features.map((f) => f.feature_name),
    ]);
    return Array.from(names);
  }, [features]);

  const loadSettings = useCallback(async () => {
    try {
      setLoadingSettings(true);
      const res = await getAiSettings();
      const data = res.data?.data || {};
      setAiEnabled(!!data.ai_features_enabled);
      setOpenaiModel(data.openai_model || "");
      setOpenaiImageModel(data.openai_image_model || "");
      const list = Array.isArray(data.features) ? data.features : [];
      setFeatures(list);
      const nextDrafts = {};
      list.forEach((row) => {
        nextDrafts[row.feature_name] = {
          is_enabled: !!row.is_enabled,
          daily_limit: row.daily_limit ?? 0,
          monthly_limit: row.monthly_limit ?? 0,
        };
      });
      PRIMARY_FEATURES.forEach((name) => {
        if (!nextDrafts[name]) {
          nextDrafts[name] = { is_enabled: true, daily_limit: 20, monthly_limit: 200 };
        }
      });
      setDrafts(nextDrafts);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.response?.data?.message || "Failed to load AI settings",
        confirmButtonColor: BRAND,
      });
    } finally {
      setLoadingSettings(false);
    }
  }, []);

  const loadLogs = useCallback(
    async (page = 1) => {
      try {
        setLoadingLogs(true);
        const res = await getAiUsageLogs({
          feature_type: logFilters.feature_type || undefined,
          status: logFilters.status || undefined,
          from: logFilters.from || undefined,
          to: logFilters.to || undefined,
          per_page: logFilters.per_page,
          page,
        });
        const payload = res.data?.data || {};
        const rows = Array.isArray(payload.data) ? payload.data : [];
        setLogs(rows);
        setLogPage(Number(payload.current_page) || page);
        setLogLastPage(Number(payload.last_page) || 1);
        setLogTotal(Number(payload.total) || rows.length);
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err?.response?.data?.message || "Failed to load AI usage logs",
          confirmButtonColor: BRAND,
        });
        setLogs([]);
      } finally {
        setLoadingLogs(false);
      }
    },
    [logFilters]
  );

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    if (activeTab === "logs") {
      loadLogs(1);
    }
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateDraft = (featureName, patch) => {
    setDrafts((prev) => ({
      ...prev,
      [featureName]: { ...(prev[featureName] || {}), ...patch },
    }));
  };

  const saveFeature = async (featureName) => {
    const draft = drafts[featureName];
    if (!draft) return;

    const daily = Number(draft.daily_limit);
    const monthly = Number(draft.monthly_limit);
    if (!Number.isFinite(daily) || daily < 0 || !Number.isFinite(monthly) || monthly < 0) {
      Swal.fire({
        icon: "warning",
        title: "Invalid limits",
        text: "Daily and monthly limits must be numbers >= 0 (0 = unlimited).",
        confirmButtonColor: BRAND,
      });
      return;
    }
    if (monthly > 0 && daily > monthly) {
      Swal.fire({
        icon: "warning",
        title: "Check limits",
        text: "Daily limit should not exceed monthly limit when monthly is set.",
        confirmButtonColor: BRAND,
      });
      return;
    }

    try {
      setSavingFeature(featureName);
      await updateAiSetting(featureName, {
        is_enabled: !!draft.is_enabled,
        daily_limit: Math.floor(daily),
        monthly_limit: Math.floor(monthly),
      });
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Settings saved",
        showConfirmButton: false,
        timer: 1600,
      });
      loadSettings();
    } catch (err) {
      const errors = err?.response?.data?.data || err?.response?.data?.errors;
      const msg =
        (typeof errors === "object" && errors
          ? Object.values(errors).flat().join(" ")
          : null) ||
        err?.response?.data?.message ||
        "Failed to save setting";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: msg,
        confirmButtonColor: BRAND,
      });
    } finally {
      setSavingFeature(null);
    }
  };

  const displayFeatures = PRIMARY_FEATURES.map((name) => {
    const fromApi = features.find((f) => f.feature_name === name);
    return {
      feature_name: name,
      updated_at: fromApi?.updated_at || null,
      ...(drafts[name] || { is_enabled: true, daily_limit: 20, monthly_limit: 200 }),
    };
  });

  const modelForFeature = (name) => {
    if (name === "vendor_product_image") {
      return openaiImageModel || "gpt-image-1";
    }
    return openaiModel || "gpt-4o-mini";
  };

  const formatDate = (value) => {
    if (!value) return "—";
    try {
      return new Date(value).toLocaleString();
    } catch {
      return String(value);
    }
  };

  const tabs = [
    { id: "settings", label: "Feature Settings" },
    { id: "logs", label: "Usage Logs" },
  ];

  return (
    <div className="space-y-6 px-6 py-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            <Bot className="w-6 h-6" style={{ color: BRAND }} />
            AI Management
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Configure per-feature AI limits and review usage logs. Global kill switch is{" "}
            <strong>{aiEnabled ? "enabled" : "disabled"}</strong> via server{" "}
            <code>AI_FEATURES_ENABLED</code>.
          </p>
        </div>
        <button
          type="button"
          onClick={() => (activeTab === "settings" ? loadSettings() : loadLogs(logPage))}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              activeTab === tab.id
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "settings" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 grid sm:grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-xs text-gray-500">Chat / text model (read-only)</div>
              <div className="font-medium text-gray-800 mt-0.5">{openaiModel || "—"}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Image model (read-only)</div>
              <div className="font-medium text-gray-800 mt-0.5">{openaiImageModel || "—"}</div>
            </div>
          </div>

          {loadingSettings ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
              Loading AI settings…
            </div>
          ) : displayFeatures.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
              No AI features found.
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {displayFeatures.map((row) => {
                const draft = drafts[row.feature_name] || row;
                const saving = savingFeature === row.feature_name;
                return (
                  <div
                    key={row.feature_name}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {FEATURE_LABELS[row.feature_name] || row.feature_name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5 font-mono">{row.feature_name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Model: <span className="font-medium text-gray-700">{modelForFeature(row.feature_name)}</span>
                        </p>
                      </div>
                      <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          checked={!!draft.is_enabled}
                          onChange={(e) =>
                            updateDraft(row.feature_name, { is_enabled: e.target.checked })
                          }
                        />
                        <span className={draft.is_enabled ? "text-green-600" : "text-gray-500"}>
                          {draft.is_enabled ? "Enabled" : "Disabled"}
                        </span>
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Daily limit</label>
                        <input
                          type="number"
                          min="0"
                          className={inputClass}
                          value={draft.daily_limit}
                          onChange={(e) =>
                            updateDraft(row.feature_name, { daily_limit: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Monthly limit</label>
                        <input
                          type="number"
                          min="0"
                          className={inputClass}
                          value={draft.monthly_limit}
                          onChange={(e) =>
                            updateDraft(row.feature_name, { monthly_limit: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">Use 0 for unlimited.</p>

                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => saveFeature(row.feature_name)}
                      className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-white disabled:opacity-60"
                      style={{ backgroundColor: BRAND }}
                    >
                      <Save className="w-4 h-4" />
                      {saving ? "Saving…" : "Save"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === "logs" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Feature type</label>
                <select
                  className={inputClass}
                  value={logFilters.feature_type}
                  onChange={(e) =>
                    setLogFilters((prev) => ({ ...prev, feature_type: e.target.value }))
                  }
                >
                  <option value="">All</option>
                  {featureOptions.map((name) => (
                    <option key={name} value={name}>
                      {FEATURE_LABELS[name] || name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Status</label>
                <select
                  className={inputClass}
                  value={logFilters.status}
                  onChange={(e) => setLogFilters((prev) => ({ ...prev, status: e.target.value }))}
                >
                  <option value="">All</option>
                  <option value="success">success</option>
                  <option value="failed">failed</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">From date</label>
                <input
                  type="date"
                  className={inputClass}
                  value={logFilters.from}
                  onChange={(e) => setLogFilters((prev) => ({ ...prev, from: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">To date</label>
                <input
                  type="date"
                  className={inputClass}
                  value={logFilters.to}
                  onChange={(e) => setLogFilters((prev) => ({ ...prev, to: e.target.value }))}
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => loadLogs(1)}
                  className="w-full px-3 py-2 text-sm rounded-lg text-white"
                  style={{ backgroundColor: BRAND }}
                >
                  Apply filters
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Date/time</th>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Feature</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Error</th>
                    <th className="px-4 py-3">Tokens</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingLogs ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                        Loading usage logs…
                      </td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                        No usage logs found for these filters.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id} className="border-t border-gray-100 align-top">
                        <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                          {formatDate(log.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-800">
                            {log.user?.name || (log.user_id ? `User #${log.user_id}` : "—")}
                          </div>
                          {log.user?.email ? (
                            <div className="text-xs text-gray-500">{log.user.email}</div>
                          ) : null}
                        </td>
                        <td className="px-4 py-3 text-gray-700">{log.role || "—"}</td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs text-gray-700">{log.feature_type}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                              log.status === "success"
                                ? "bg-green-50 text-green-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {log.status || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 max-w-xs">
                          {log.status === "failed" ? log.error_message || "—" : "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {log.tokens_used != null ? log.tokens_used : "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {logLastPage > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm">
                <span className="text-gray-500">
                  Page {logPage} of {logLastPage} · {logTotal} total
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={logPage <= 1 || loadingLogs}
                    onClick={() => loadLogs(logPage - 1)}
                    className="px-3 py-1.5 border rounded-lg disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    disabled={logPage >= logLastPage || loadingLogs}
                    onClick={() => loadLogs(logPage + 1)}
                    className="px-3 py-1.5 border rounded-lg disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AiManagement;
