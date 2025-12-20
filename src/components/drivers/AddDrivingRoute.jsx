// src/components/drivers/AddDrivingRoute.jsx
import React, { useEffect, useState } from "react";
import {
  getRoutes,
  createRoute,
  createLocation,
} from "../../api/routeApi";

// ❗ নতুন – vendor এর একই কম্পোনেন্ট use করছি
import LocationSearchInput from "../vendor/LocationSearchInput";

const AddDrivingRoute = ({ onRoutesReload }) => {
  const [routeName, setRouteName] = useState("");
  const [routes, setRoutes] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [locationName, setLocationName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [savingLocation, setSavingLocation] = useState(false);

  // ---------------- Fetch routes ----------------
  const loadRoutes = async () => {
    try {
      const res = await getRoutes();
      // Handle new paginated response structure: data.data.data
      const data = res.data?.data?.data || res.data?.data || [];
      setRoutes(data);

      if (!selectedRouteId && data.length > 0) {
        setSelectedRouteId(String(data[0].id));
      }
    } catch (err) {
      console.error("Failed to load routes", err);
    }
  };

  useEffect(() => {
    loadRoutes();
  }, []);

  // ---------------- Add new route ----------------
  const handleAddRoute = async () => {
    if (!routeName.trim()) return;

    try {
      setLoadingRoute(true);
      const res = await createRoute(routeName.trim());
      const newRoute = res.data?.data;

      setRouteName("");
      setRoutes((prev) => [...prev, newRoute]);
      setSelectedRouteId(String(newRoute.id));
      onRoutesReload?.();
    } catch (err) {
      console.error("Failed to create route", err);
      alert("Route create korte giye problem hocche.");
    } finally {
      setLoadingRoute(false);
    }
  };
  

  // ---------------- Map থেকে location নেওয়া ----------------
  // LocationSearchInput যখন নতুন location select করবে, এই function কল হবে
  const handleLocationFromMap = ({ address, lat, lng }) => {
    setLocationName(address || "");
    setLatitude(lat);
    setLongitude(lng);
  };

  // ---------------- Add location to route ----------------
  const handleAddLocation = async () => {
    if (!locationName.trim() || !selectedRouteId) return;

    const payload = {
      name: locationName.trim(),
      route_id: String(selectedRouteId),
      latitude: latitude ? String(latitude) : null,
      longitude: longitude ? String(longitude) : null,
    };

    try {
      setSavingLocation(true);
      await createLocation(payload);

      setLocationName("");
      setLatitude("");
      setLongitude("");

      await loadRoutes();
      onRoutesReload?.();
    } catch (err) {
      console.error("Failed to create location", err);
      alert("Location add korte giye problem hocche.");
    } finally {
      setSavingLocation(false);
    }
  };

  return (
    <>
      {/* ---------------- Add Route ---------------- */}
      <div className="mb-8 pb-4">
        <h2 className="text-[26px] font-semibold mb-4">Add Route</h2>
        <div className="flex gap-4 max-w-3xl">
          <input
            type="text"
            placeholder="Route Name"
            value={routeName}
            onChange={(e) => setRouteName(e.target.value)}
            className="flex-1 bg-white p-3 pl-4 text-sm font-normal
             focus:outline-none rounded-[100px]"
          />
          <button
            type="button"
            onClick={handleAddRoute}
            disabled={loadingRoute}
            className="bg-[#0D3250] text-white font-medium
            py-3 px-7 rounded-[100px] cursor-pointer text-sm
            disabled:opacity-60"
          >
            {loadingRoute ? "Saving..." : "Add Route"}
          </button>
        </div>
      </div>

      {/* ---------------- Add Route Location ---------------- */}
      <div className="mb-8 pb-4">
        <h2 className="text-[26px] font-semibold mb-4">
          Add Route Location
        </h2>

        {/* 🔍 Map + Search (vendor এর মতো) */}
        <div className="max-w-5xl mb-4 space-y-4">
          <LocationSearchInput onLocationSelect={handleLocationFromMap} />

          {/* উপরের map থেকে পাওয়া location name + route + add button */}
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Type Location"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="flex-1 bg-white p-3 pl-4 text-sm font-normal
               focus:outline-none rounded-[100px]"
            />

            <select
              value={selectedRouteId}
              onChange={(e) => setSelectedRouteId(e.target.value)}
              className="flex-1 bg-white p-3 text-sm font-normal 
               focus:outline-none rounded-[100px]"
            >
              {routes.length === 0 && (
                <option value="">No route found</option>
              )}
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleAddLocation}
              disabled={
                savingLocation ||
                !locationName.trim() ||
                !selectedRouteId
              }
              className="bg-[#0D3250] text-white font-medium
              py-3 px-7 rounded-[100px] cursor-pointer text-sm
              disabled:opacity-60"
            >
              {savingLocation ? "Saving..." : "Add Location"}
            </button>
          </div>

          {/* Lat / Lng – শুধুই দেখানোর জন্য */}
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Latitude (from map)"
              value={latitude}
              readOnly
              className="flex-1 bg-white p-3 pl-4 text-sm font-normal 
               focus:outline-none rounded-[100px]"
            />
            <input
              type="text"
              placeholder="Longitude (from map)"
              value={longitude}
              readOnly
              className="flex-1 bg-white p-3 pl-4 text-sm font-normal 
               focus:outline-none rounded-[100px]"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default AddDrivingRoute;
