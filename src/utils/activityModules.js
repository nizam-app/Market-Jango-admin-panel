// Maps admin panel routes → backend activity_logs.module values.

export const ACTIVITY_MODULES = [
  { value: "", label: "All modules" },
  { value: "products", label: "Products" },
  { value: "categories", label: "Categories" },
  { value: "business_types", label: "Business Types" },
  { value: "buyers", label: "Buyers" },
  { value: "vendors", label: "Vendors" },
  { value: "drivers", label: "Drivers" },
  { value: "transports", label: "Transports" },
  { value: "shipments", label: "Shipments" },
  { value: "routes", label: "Routes" },
  { value: "delivery_charges", label: "Delivery Charges" },
  { value: "orders", label: "Orders" },
  { value: "payments", label: "Payments" },
  { value: "currencies", label: "Currencies" },
  { value: "visibility", label: "Visibility" },
  { value: "affiliates", label: "Affiliates" },
  { value: "subscriptions", label: "Subscriptions" },
  { value: "rankings", label: "Rankings" },
  { value: "notifications", label: "Notifications" },
  { value: "admin_users", label: "Admin Users" },
  { value: "moderators", label: "Vendor Moderators" },
  { value: "outlets", label: "Outlets" },
  { value: "zones", label: "Zones" },
  { value: "activity", label: "Activity / Alerts" },
  { value: "general", label: "General" },
];

/** pathname → module key used by /admin/activity-logs */
export function moduleFromPathname(pathname = "") {
  const path = String(pathname || "/").replace(/\/+$/, "") || "/";

  if (path === "/" || path === "") return "general";
  if (path.startsWith("/activity-management")) return null; // hide panel on Activity page
  if (path.startsWith("/products")) return "products";
  if (path.startsWith("/category-management")) return "categories";
  if (path.startsWith("/business-type-management")) return "business_types";
  if (path.startsWith("/buyer-management")) return "buyers";
  if (path.startsWith("/vendors")) return "vendors";
  if (path.startsWith("/drivers-list") || path.startsWith("/drivers") || path.startsWith("/driver-assignments")) {
    return "drivers";
  }
  if (path.startsWith("/transport-management")) return "transports";
  if (path.startsWith("/shipment-management")) return "shipments";
  if (path.startsWith("/route-management")) return "delivery_charges";
  if (path.startsWith("/orders") || path.startsWith("/track-order") || path.startsWith("/assign-order")) {
    return "orders";
  }
  if (path.startsWith("/payment-management")) return "payments";
  if (path.startsWith("/currency-management")) return "currencies";
  if (path.startsWith("/visibility-management")) return "visibility";
  if (path.startsWith("/affiliate-links")) return "affiliates";
  if (path.startsWith("/subscription-plans")) return "subscriptions";
  if (path.startsWith("/rankings")) return "rankings";
  if (path.startsWith("/notifications")) return "notifications";
  if (path.startsWith("/admin-user") || path.startsWith("/create-role") || path.startsWith("/setting")) {
    return "admin_users";
  }
  if (path.startsWith("/outlet")) return "outlets";

  return "general";
}

export function moduleLabel(module) {
  const found = ACTIVITY_MODULES.find((m) => m.value === module);
  return found?.label || module || "General";
}
