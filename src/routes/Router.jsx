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
import RouteManagement from "../pages/RouteManagement";
import SubscriptionPlans from "../pages/SubscriptionPlans";
import Rankings from "../pages/Rankings";
import DeliveryCharges from "../pages/DeliveryCharges";

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
            path: "buyer-management",
            Component: BuyerManagement,
          },
          {
            path: "transport-management",
            Component: Transportmanagement,
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
            path: "rankings",
            Component: Rankings,
          },
          {
            path: "delivery-charges",
            Component: DeliveryCharges,
          }
        ],
      },
    ],
  },
]);

export default Router;
