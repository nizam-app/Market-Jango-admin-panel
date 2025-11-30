// src/components/driver/AddRouteLocation.jsx
import React, { useEffect, useState } from "react";
import { getAllRoutes, createRouteLocation } from "../../api/routeApi";
import MapPicker from "./MapPicker";

const AddRouteLocation = () => {
  const [locationName, setLocationName] = useState("");
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [routes, setRoutes] = useState([]);
  const [saving, setSaving] = useState(false);

  // route list load
  useEffect(() => {
    const loadRoutes = async () => {
      try {
        const res = await getAllRoutes(); // GET /route
        setRoutes(res.data?.data || []);
      } catch (err) {
        console.error("Failed to load routes", err);
      }
    };

    loadRoutes();
  }, []);

  const handleMapSelect = ({ lat, lng }) => {
    setLatitude(lat.toString());
    setLongitude(lng.toString());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!locationName.trim() || !selectedRouteId) {
      alert("Route & location name required");
      return;
    }

    try {
      setSaving(true);

      await createRouteLocation({
        name: locationName,
        route_id: selectedRouteId,
        latitude: latitude || null,
        longitude: longitude || null,
      });

      alert("Location added successfully");

      // form reset
      setLocationName("");
      setLatitude("");
      setLongitude("");
    } catch (err) {
      console.error("Failed to create location", err);
      alert("Failed to create location");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mb-10 pb-8">
      <h2 className="text-[26px] font-semibold mb-6">Add Route Location</h2>

      {/* top row: name + route + button */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4 max-w-5xl">
          <input
            type="text"
            placeholder="Type Location"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            className="flex-1 bg-[#FFFFFF] p-3 pl-4 text-sm font-normal 
             focus:outline-none rounded-[100px]"
          />

          <select
            className="flex-1 bg-[#FFFFFF] p-3 text-sm font-normal 
             focus:outline-none rounded-[100px]"
            value={selectedRouteId}
            onChange={(e) => setSelectedRouteId(e.target.value)}
          >
            <option value="">Select Route</option>
            {routes.map((route) => (
              <option key={route.id} value={route.id}>
                {route.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={saving}
            className="ml-5 bg-[#0D3250] text-white font-medium
              py-3 px-7 rounded-[100px] cursor-pointer text-sm disabled:opacity-60"
          >
            {saving ? "Saving..." : "Add Location"}
          </button>
        </div>

        {/* lat / lng display (read-only) */}
        <div className="flex gap-4 max-w-5xl">
          <input
            type="text"
            placeholder="Latitude (from map)"
            value={latitude}
            readOnly
            className="flex-1 bg-[#FFFFFF] p-3 pl-4 text-sm font-normal 
             focus:outline-none rounded-[100px]"
          />
          <input
            type="text"
            placeholder="Longitude (from map)"
            value={longitude}
            readOnly
            className="flex-1 bg-[#FFFFFF] p-3 pl-4 text-sm font-normal 
             focus:outline-none rounded-[100px]"
          />
        </div>
      </form>

      {/* Map picker (just under the form) */}
      <div className="mt-6 max-w-5xl">
        <MapPicker onSelect={handleMapSelect} />
      </div>
    </div>
  );
};

export default AddRouteLocation;
