// src/pages/ActivityManagement.jsx
import { useState } from "react";
import { Activity, Bell, List } from "lucide-react";
import ActivityFeed from "../components/activity/ActivityFeed";
import ActivityLogList from "../components/activity/ActivityLogList";
import AlertsPanel from "../components/activity/AlertsPanel";

const TABS = [
  { id: "feed",   label: "Live Feed",     icon: Activity },
  { id: "logs",   label: "All Logs",      icon: List },
  { id: "alerts", label: "Alerts",        icon: Bell },
];

const ActivityManagement = () => {
  const [activeTab, setActiveTab] = useState("feed");
  const [pendingAlerts, setPendingAlerts] = useState(0);

  return (
    <div className="space-y-6 px-6 py-4">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 uppercase tracking-wide">
          Activity & Alerts
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Monitor admin and moderator actions in real time.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-gray-200">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
              activeTab === id
                ? "border-[#FF8C00] text-[#FF8C00] bg-orange-50"
                : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            {id === "alerts" && pendingAlerts > 0 && (
              <span className="ml-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
                {pendingAlerts > 99 ? "99+" : pendingAlerts}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === "feed" && <ActivityFeed />}
      {activeTab === "logs" && <ActivityLogList />}
      {activeTab === "alerts" && (
        <AlertsPanel onPendingCount={setPendingAlerts} />
      )}
    </div>
  );
};

export default ActivityManagement;
