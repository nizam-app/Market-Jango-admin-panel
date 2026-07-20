// src/routes/router.jsx
import { createBrowserRouter } from "react-router";
import Home from "../pages/Home";
import App from "../App";
import Products from "../pages/Products";
import Vendor from "../pages/Vendor";
import Drivers from "../pages/Drivers";
import TrackOrder from "../pages/TrackOrder";
import AdminUserSection from "../components/adminUser/AdminUserSection";
import Setting from "../pages/Setting";
import DriverList from "../pages/DriverList";
import AddNewAdmin from "../pages/AddNewAdmin";
import Login from "../pages/Login";

import ProtectedRoute from "./ProtectedRoute";
import AssignOrderPage from "../pages/AssignOrderPage";
import AdminResetPasswordPage from "../pages/AdminResetPasswordPage";
import BuyerManagement from "../pages/BuyerManagement";
import Transportmanagement from "../pages/Transportmanagement";
import ShipmentManagement from "../pages/ShipmentManagement";
import RouteManagement from "../pages/RouteManagement";
import SubscriptionPlans from "../pages/SubscriptionPlans";
import Notifications from "../pages/Notifications";
import Rankings from "../pages/Rankings";
import CategoryManagement from "../pages/CategoryManagement";
import BusinessTypeManagement from "../pages/BusinessTypeManagement";
import VisibilityManagement from "../pages/VisibilityManagement";
import AffiliateLinks from "../pages/AffiliateLinks";
import PaymentManagement from "../pages/PaymentManagement";
import OrderManagement from "../pages/OrderManagement";
import DriverAssignments from "../pages/DriverAssignments";
import ActivityManagement from "../pages/ActivityManagement";
import OutletManagement from "../pages/OutletManagement";
import OutletOrders from "../pages/OutletOrders";
import OutletBin from "../pages/OutletBin";
import OutletDriverBin from "../pages/OutletDriverBin";
import OutletAssignments from "../pages/OutletAssignments";
import CurrencyManagement from "../pages/CurrencyManagement";

const Router = createBrowserRouter([
  // 🔓 Public route
  {
    path: "/login",
    Component: Login,
  },
  {
    path: 'admin-reset-password',
    Component: AdminResetPasswordPage
  },

  // 🔐 Sob private/admin route ekhane
  {
    // ekhane path ditei hobe na, sudhu ekta layout wrapper
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        Component: App, // App er vitore Sidebar + <Outlet /> thakar kotha
        children: [
          {
            index: true,
            Component: Home,
          },
          {
            path: "products",
            Component: Products,
          },
          {
            path: "category-management",
            Component: CategoryManagement,
          },
          {
            path: "business-type-management",
            Component: BusinessTypeManagement,
          },
          {
            path: "buyer-management",
            Component: BuyerManagement,
          },
          {
            path: "transport-management",
            Component: Transportmanagement,
          },
          {
            path: "shipment-management",
            Component: ShipmentManagement,
          },
          {
            path: "vendors",
            Component: Vendor,
          },
          {
            path: "drivers",
            Component: Drivers,
          },
          {
            path: "route-management",
            Component: RouteManagement,
          },
          {
            path: "track-order",
            Component: TrackOrder,
          },
          {
            path: "orders",
            Component: OrderManagement,
          },
          {
            path: "driver-assignments",
            Component: DriverAssignments,
          },
          {
            path: "admin-user",
            Component: AdminUserSection,
          },
          {
            path: "setting",
            Component: Setting,
          },
          {
            path: "drivers-list",
            Component: DriverList,
          },
          {
            path: "create-role",
            Component: AddNewAdmin,
          },
          {
            path: 'drivers/:driverId/assign-order',
            Component: AssignOrderPage
          },
          {
            path: "subscription-plans",
            Component: SubscriptionPlans,
          },
          {
            path: "notifications",
            Component: Notifications,
          },
          {
            path: "rankings",
            Component: Rankings,
          },
          {
            path: "visibility-management",
            Component: VisibilityManagement,
          },
          {
            path: "affiliate-links",
            Component: AffiliateLinks,
          },
          {
            path: "payment-management",
            Component: PaymentManagement,
          },
          {
            path: "currency-management",
            Component: CurrencyManagement,
          },
          {
            path: "activity-management",
            Component: ActivityManagement,
          },
          {
            path: "outlet-management",
            Component: OutletManagement,
          },
          {
            path: "outlet/orders",
            Component: OutletOrders,
          },
          {
            path: "outlet/bin",
            Component: OutletBin,
          },
          {
            path: "outlet/drivers",
            Component: OutletDriverBin,
          },
          {
            path: "outlet/assignments",
            Component: OutletAssignments,
          },
        ],
      },
    ],
  },
]);

export default Router;
