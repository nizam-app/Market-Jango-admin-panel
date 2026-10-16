/** Maps sidebar routes to backend `admin_access_*` permission keys. */

export const ROUTE_PERMISSION = {
  "/": "admin_access_dashboard",
  "/products": "admin_access_dashboard",
  "/category-management": "admin_access_dashboard",
  "/business-type-management": "admin_access_dashboard",
  "/buyer-management": "admin_access_dashboard",
  "/transport-management": "admin_access_dashboard",
  "/vendors": "admin_access_dashboard",
  "/drivers": "admin_access_dashboard",
  "/drivers-list": "admin_access_dashboard",
  "/track-order": "admin_access_dashboard",
  "/orders": "admin_access_dashboard",
  "/admin-user": "admin_create_admin",
  "/create-role": "admin_access_roles",
  "/role-management": "admin_access_roles",
  "/setting": "admin_access_dashboard",
  "/outlet-management": "admin_access_outlets",
  "/subscription-plans": "admin_access_subscriptions",
  "/notifications": "admin_access_notifications",
  "/rankings": "admin_access_route_management",
  "/visibility-management": "admin_access_visibility",
  "/zone-management": "admin_access_zones",
  "/affiliate-links": "admin_access_affiliate",
  "/payment-management": "admin_access_payment_settings",
  "/currency-management": "admin_access_currency",
  "/ai-management": "admin_access_ai_management",
  "/ai-assistant": "admin_access_ai_assistant",
  "/health": "admin_access_health",
  "/activity-management": "admin_access_activity",
  "/shipment-management": "admin_access_transport_shipments",
  "/route-management": "admin_access_route_management",
  "/driver-assignments": "admin_access_assignments",
};

export const PERMISSION_GROUPS = [
  {
    label: "Module access",
    keys: [
      "admin_access_dashboard",
      "admin_access_visibility",
      "admin_access_payment_settings",
      "admin_access_payout_wallet",
      "admin_access_refunds",
      "admin_access_route_management",
      "admin_access_affiliate",
      "admin_access_affiliate_payout",
      "admin_access_promotions",
      "admin_access_announcements",
      "admin_access_ai_management",
      "admin_access_ai_assistant",
      "admin_access_health",
      "admin_access_activity",
      "admin_access_notifications",
      "admin_access_subscriptions",
      "admin_access_zones",
      "admin_access_transport_shipments",
      "admin_access_assignments",
      "admin_access_currency",
      "admin_access_outlets",
      "admin_access_roles",
    ],
  },
  {
    label: "Admin users",
    keys: ["admin_create_admin", "admin_update_admin"],
  },
  {
    label: "Legacy granular",
    keys: null,
  },
];

const STORAGE_KEY = "admin_permissions";

export const setStoredPermissions = (list) => {
  if (!list || !Array.isArray(list)) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
};

export const getStoredPermissions = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const clearStoredPermissions = () => {
  localStorage.removeItem(STORAGE_KEY);
};

/** null = not loaded yet (show all for admin to avoid blank sidebar on old sessions) */
export const hasPermission = (permissionName) => {
  const list = getStoredPermissions();
  if (list === null) return true;
  return list.includes(permissionName);
};

export const canAccessPath = (pathname) => {
  const normalized =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;
  const perm = ROUTE_PERMISSION[normalized];
  if (!perm) return true;
  return hasPermission(perm);
};

export const formatPermissionLabel = (name) => {
  if (!name) return "";
  if (name.startsWith("admin_access_")) {
    return name
      .replace("admin_access_", "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};
