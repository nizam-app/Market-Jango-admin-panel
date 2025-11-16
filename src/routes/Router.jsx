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



const Router = createBrowserRouter([
   {
      path: "/login",
      Component: Login,
   },
    {
        path : '/',
        Component : App,
        children :[
            { 
               index : true,
               Component : Home ,
            },
            { 
               path : 'products',
               Component : Products ,
            },
            { 
               path : 'vendors',
               Component : Vendor,
            },
            { 
               path : 'drivers',
               Component : Drivers  ,
            },
            { 
               path : 'track-order',
               Component : TrackOrder,
            },
            { 
               path : 'admin-user',
               Component : AdminUserSection,
            },
            { 
               path : 'setting',
               Component : Setting,
            },
            { 
               path : 'drivers-list',
               Component : DriverList,
            },
            { 
               path : 'create-role',
               Component : AddNewAdmin,
            },
        ]
    }
]) 
export default Router;