// src/components/Navbar.jsx
import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router";
import { Settings, Bell, LogOut, UserCircle2, RefreshCw } from "lucide-react";
import { getAuthUser, clearAuthUser } from "../utils/authUser";
import { useNotifications } from "../hooks/useNotifications";

const Navbar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const authUser = getAuthUser();

  const displayName =
    authUser?.name || authUser?.email || authUser?.phone || "Admin";

  const displayRole =
    authUser?.admin?.role || authUser?.role || authUser?.user_type || "Admin";

  const avatarSrc = authUser?.image || null;

  const {
    displayNotifications,
    unreadCount,
    loading: loadingNoti,
    error: notiError,
    refresh: refreshNotifications,
    markRead,
    isNotificationUnread,
  } = useNotifications();

  const [showNoti, setShowNoti] = useState(false);
  const notiWrapRef = useRef(null);

  useEffect(() => {
    if (!showNoti) return;
    const onMouseDown = (e) => {
      const el = notiWrapRef.current;
      if (el && !el.contains(e.target)) {
        setShowNoti(false);
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [showNoti]);

  const formatDateTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleString();
  };

  const navDynamicTitle = [
    { navTitle: "Dashboard Overview", path: "/" },
    { navTitle: "Vendor Overview", path: "/vendors" },
    { navTitle: "Driver Overview ", path: "/drivers" },
    { navTitle: "Driver List ", path: "/drivers-list" },
    { navTitle: "Driver Assignments", path: "/driver-assignments" },
    { navTitle: "Route Management", path: "/route-management" },
    { navTitle: "Order Management", path: "/orders" },
    { navTitle: "Order Overview", path: "/track-order" },
    { navTitle: "Payment Management", path: "/payment-management" },
    { navTitle: "Admin Management", path: "/admin-user" },
    { navTitle: "Settings", path: "/setting" },
  ];

  const currentTitle =
    navDynamicTitle.find((item) => item.path === pathname)?.navTitle ||
    "Dashboard Overview";

  const handleLogout = () => {
    localStorage.removeItem("token");
    clearAuthUser();
    navigate("/login", { replace: true });
  };

  const handleNotificationClick = async (item) => {
    if (!isNotificationUnread(item)) return;
    await markRead(item.id);
  };

  return (
    <div className="flex justify-between items-center bg-white border-b border-[#B0CCE2] py-5 px-10">
      <div>
        <h2 className="text-2xl font-semibold text-[#343C6A]">
          {currentTitle}
        </h2>

        {(pathname === "/" || pathname === "/products") && (
          <p className="text-xs font-normal text-[#343C6A]">
            Wednesday, July 23, 2025
          </p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <NavLink to="/setting">
          <button className="bg-[#E6EEF6] cursor-pointer p-3 rounded-full">
            <Settings className="w-5 h-5 text-[#0059A0]" />
          </button>
        </NavLink>

        <div className="relative" ref={notiWrapRef}>
          <button
            type="button"
            onClick={() => setShowNoti((prev) => !prev)}
            className="bg-[#E6EEF6] cursor-pointer p-3 rounded-full relative"
          >
            <Bell className="w-5 h-5 text-[#0059A0]" />

            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {showNoti && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E6EEF6] rounded-[12px] shadow-lg z-30">
              <div className="px-4 py-3 border-b border-[#E6EEF6] flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-[#003158]">
                  Notifications
                </p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    title="Refresh"
                    onClick={() => refreshNotifications()}
                    disabled={loadingNoti}
                    className="p-1.5 rounded-lg hover:bg-[#EAF2FB] text-[#0059A0] disabled:opacity-40"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${loadingNoti ? "animate-spin" : ""}`}
                    />
                  </button>
                  <button
                    type="button"
                    className="p-1.5 rounded-lg hover:bg-[#EAF2FB] text-gray-600"
                    onClick={() => setShowNoti(false)}
                    aria-label="Close"
                  >
                    ×
                  </button>
                </div>
              </div>

              {notiError && (
                <p className="px-4 py-2 text-[11px] text-red-600 bg-red-50 border-b border-red-100">
                  {notiError}
                </p>
              )}

              <div className="max-h-80 overflow-y-auto">
                {displayNotifications.length === 0 && !loadingNoti && (
                  <p className="px-4 py-4 text-xs text-gray-500">
                    No notifications.
                  </p>
                )}

                {loadingNoti && displayNotifications.length === 0 && (
                  <p className="px-4 py-4 text-xs text-gray-400">Loading…</p>
                )}

                {displayNotifications.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNotificationClick(item)}
                    className={`w-full text-left px-4 py-3 text-xs border-b border-[#F1F5F9] last:border-b-0 ${
                      isNotificationUnread(item)
                        ? "bg-[#F5F7FB]"
                        : "bg-white"
                    } hover:bg-[#EAF2FB]`}
                  >
                    <p className="font-semibold text-[#003158]">
                      {item.name || "Notification"}
                    </p>
                    <p className="mt-0.5 text-[#5D768A]">{item.message}</p>
                    <div className="mt-1 flex justify-between text-[11px] text-gray-400">
                      <span>{item.sender?.name || "System"}</span>
                      <span>{formatDateTime(item.created_at)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-5">
          <div className="bg-[#0059A0] p-1 rounded-full flex items-center justify-center">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={displayName}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <UserCircle2 className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium">{displayName}</p>
            <p className="text-xs font-normal">{displayRole}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="cursor-pointer p-3 rounded-full"
        >
          <LogOut className="w-6 h-6 text-[#5490BF]" />
        </button>
      </div>
    </div>
  );
};

export default Navbar;
