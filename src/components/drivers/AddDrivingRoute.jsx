// src/components/driver/AddDrivingRoute.jsx
import React, { useEffect, useState } from "react";
import { useJsApiLoader, Autocomplete } from "@react-google-maps/api";
import {
  getRoutes,
  createRoute,
  createLocation,
} from "../../api/routeApi";

const libraries = ["places"];

const AddDrivingRoute = ({ onRoutesReload }) => {
  const [routeName, setRouteName] = useState("");
  const [routes, setRoutes] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [locationName, setLocationName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [autoInstance, setAutoInstance] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [savingLocation, setSavingLocation] = useState(false);

  // 🔑 Vite env
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
    libraries,
  });

  // ---------------- Fetch routes ----------------
  const loadRoutes = async () => {
    try {
      const res = await getRoutes();
      const data = res.data?.data || [];
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

      // add to list
      setRoutes((prev) => [...prev, newRoute]);
      setSelectedRouteId(String(newRoute.id));

      onRoutesReload?.(); // DrivingRouteList ke reload korte chaile
    } catch (err) {
      console.error("Failed to create route", err);
      alert("Route create korte giye problem hocche.");
    } finally {
      setLoadingRoute(false);
    }
  };

  // ---------------- Google Places handlers ----------------
  const onAutoLoad = (auto) => {
    setAutoInstance(auto);
  };

  const onPlaceChanged = () => {
    if (!autoInstance) return;

    const place = autoInstance.getPlace();
    if (!place) return;

    // Name / address
    const name =
      place.formatted_address || place.name || locationName;
    setLocationName(name);

    // Lat / Lng
    if (place.geometry && place.geometry.location) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      setLatitude(lat);
      setLongitude(lng);
    }
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

      // list refresh
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
      {/* Add Route */}
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

      {/* Add Route Location */}
      <div className="mb-8 pb-4">
        <h2 className="text-[26px] font-semibold mb-4">
          Add Route Location
        </h2>

        <div className="flex gap-4 max-w-5xl mb-4">
          {/* Location input with Google Autocomplete */}
          {isLoaded ? (
            <Autocomplete
              onLoad={onAutoLoad}
              onPlaceChanged={onPlaceChanged}
            >
              <input
                type="text"
                placeholder="Type Location"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="flex-1 bg-white p-3 pl-4 text-sm font-normal
                 focus:outline-none rounded-[100px]"
              />
            </Autocomplete>
          ) : (
            <input
              type="text"
              disabled
              placeholder="Loading map..."
              className="flex-1 bg-gray-100 p-3 pl-4 text-sm font-normal
               focus:outline-none rounded-[100px]"
            />
          )}

          {/* Route dropdown */}
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
            disabled={savingLocation || !locationName.trim()}
            className="bg-[#0D3250] text-white font-medium
            py-3 px-7 rounded-[100px] cursor-pointer text-sm
            disabled:opacity-60"
          >
            {savingLocation ? "Saving..." : "Add Location"}
          </button>
        </div>

        {/* Lat / Lng – read-only, from map */}
        <div className="flex gap-4 max-w-5xl">
          <input
            type="text"
            placeholder="Latitude (optional / from map)"
            value={latitude}
            readOnly
            className="flex-1 bg-white p-3 pl-4 text-sm font-normal 
             focus:outline-none rounded-[100px]"
          />
          <input
            type="text"
            placeholder="Longitude (optional / from map)"
            value={longitude}
            readOnly
            className="flex-1 bg-white p-3 pl-4 text-sm font-normal 
             focus:outline-none rounded-[100px]"
          />
        </div>
      </div>
    </>
  );
};

export default AddDrivingRoute;
