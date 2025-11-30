// src/components/driver/DrivingRouteList.jsx
import React, { useEffect, useState } from "react";
import { getRoutes, deleteLocation } from "../../api/routeApi";

const DrivingRouteList = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadRoutes = async () => {
    try {
      setLoading(true);
      const res = await getRoutes();
      setRoutes(res.data?.data || []);
    } catch (err) {
      console.error("Failed to load routes", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoutes();
  }, []);

  const handleRemoveLocation = async (routeId, locationId) => {
    if (!window.confirm("Remove this location from route?")) return;

    try {
      await deleteLocation(locationId);

      // local state update
      setRoutes((prev) =>
        prev.map((route) =>
          route.id === routeId
            ? {
                ...route,
                locations: route.locations.filter(
                  (loc) => loc.id !== locationId
                ),
              }
            : route
        )
      );
    } catch (err) {
      console.error("Failed to delete location", err);
      alert("Location delete korte giye problem hocche.");
    }
  };

  if (loading) {
    return (
      <p className="my-10 text-sm text-gray-500">Loading routes...</p>
    );
  }

  console.log(routes, "lala")

  return (
    <div className="my-10">
      <h2 className="text-[26px] font-semibold mb-3">
        Save Driving Route List
      </h2>

      {routes.length === 0 ? (
        <p className="text-sm text-gray-500">No routes found.</p>
      ) : (
        <div className="space-y-6">
          {routes.map((route) => (
            <div key={route.id} className="">
              <h3 className="text-lg font-medium mb-2">
                {route.name} :
              </h3>
              <div className="flex flex-wrap gap-2">
                {route.locations?.map((loc) => (
                  <div
                    key={loc.id}
                    className="flex items-center flex-wrap bg-white
                      rounded-[100px] px-4 py-2 font-normal"
                  >
                    <span className="text-sm">{loc.name}</span>
                    <button
                      onClick={() =>
                        handleRemoveLocation(route.route_id, loc.id)
                      }
                      className="ml-2 cursor-pointer text-2xl h-4 flex items-center"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DrivingRouteList;
