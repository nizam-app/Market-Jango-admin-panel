// src/components/Navbar.jsx
import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router";
import { Settings, Bell, LogOut, UserCircle2 } from "lucide-react";
import { getAuthUser, clearAuthUser } from "../utils/authUser";
import { getNotifications, markNotificationRead } from "../api/notificationApi";

const Navbar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // -------- auth user ----------
  const authUser = getAuthUser();

  const displayName =
    authUser?.name || authUser?.email || authUser?.phone || "Admin";

  const displayRole =
    authUser?.admin?.role || authUser?.role || authUser?.user_type || "Admin";

  const avatarSrc = authUser?.image || null;

  // -------- notification state ----------
  const [notifications, setNotifications] = useState([]);
  const [loadingNoti, setLoadingNoti] = useState(false);
  const [showNoti, setShowNoti] = useState(false);

  const unreadCount = notifications.filter((n) => n.is_read === 0).length;

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoadingNoti(true);
        const res = await getNotifications();
        // response: { status, message, data: [ ... ] }
        setNotifications(res?.data?.data || []);
      } catch (err) {
        console.error("Failed to load notifications", err);
      } finally {
        setLoadingNoti(false);
      }
    };

    fetchNotifications();
  }, []);

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
    { navTitle: "Order Overview", path: "/track-order" },
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

  // ekta notification row click korle read kore dibe
  const handleNotificationClick = async (item) => {
    // jodi already read thake, abar call korbo na
    if (item.is_read === 1) return;

    // UI optimistic update
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === item.id
          ? {
              ...n,
              is_read: 1,
            }
          : n
      )
    );

    try {
      await markNotificationRead(item.id);
    } catch (err) {
      console.error("Failed to mark notification as read", err);
      // iccha korle ekhane rollback korte paro
      // setNotifications(prev => prev.map(... is_read: 0 ...))
    }
  };

  return (
    <div className="flex justify-between items-center bg-white border-b border-[#B0CCE2] py-5 px-10">
      {/* left: title */}
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

      {/* right: icons + user */}
      <div className="flex items-center gap-4">
        {/* settings */}
        <NavLink to="/setting">
          <button className="bg-[#E6EEF6] cursor-pointer p-3 rounded-full">
            <Settings className="w-5 h-5 text-[#0059A0]" />
          </button>
        </NavLink>

        {/* notification (dynamic) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNoti((prev) => !prev)}
            className="bg-[#E6EEF6] cursor-pointer p-3 rounded-full relative"
          >
            <Bell className="w-5 h-5 text-[#0059A0]" />

            {/* unread badge */}
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* dropdown */}
          {showNoti && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E6EEF6] rounded-[12px] shadow-lg z-30">
              <div className="px-4 py-3 border-b border-[#E6EEF6] flex justify-between items-center">
                <p className="text-sm font-medium text-[#003158]">
                  Notifications
                </p>
                <button onClick={() => setShowNoti((prev) => !prev)}>x</button>
                {loadingNoti && (
                  <span className="text-[11px] text-gray-400">Loading…</span>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 && !loadingNoti && (
                  <p className="px-4 py-4 text-xs text-gray-500">
                    No notifications found.
                  </p>
                )}

                {notifications.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNotificationClick(item)}
                    className={`w-full text-left px-4 py-3 text-xs border-b border-[#F1F5F9] last:border-b-0 ${
                      item.is_read ? "bg-white" : "bg-[#F5F7FB]"
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

        {/* profile avatar + name/role */}
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

        {/* logout */}
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
