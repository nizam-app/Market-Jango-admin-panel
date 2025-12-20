// src/components/driver/DrivingRouteList.jsx
import React, { useEffect, useState } from "react";
import { getRoutes, deleteLocation } from "../../api/routeApi";
import { Edit3, Trash2 } from "lucide-react";

const DrivingRouteList = ({ reloadKey = 0, onEdit, onDelete }) => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadRoutes = async () => {
    try {
      setLoading(true);
      const res = await getRoutes();
      // Handle new paginated response structure: data.data.data
      const routesData = res.data?.data?.data || res.data?.data || [];
      setRoutes(routesData);
    } catch (err) {
      console.error("Failed to load routes", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // ✅ প্রথমবার mount + প্রতি বার reloadKey change হলে
    loadRoutes();
  }, [reloadKey]);

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
      // চাইলে এখানে আবার API থেকে fresh আনতেও পারো:
      // await loadRoutes();
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

  console.log(routes, "lala");

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
            <div key={route.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium">
                  {route.name}
                </h3>
                <div className="flex items-center gap-2">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(route)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Route"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(route)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Route"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {route.locations?.length > 0 ? (
                  route.locations.map((loc) => (
                    <div
                      key={loc.id}
                      className="flex items-center flex-wrap bg-white
                        rounded-[100px] px-4 py-2 font-normal"
                    >
                      <span className="text-sm">{loc.name}</span>
                      <button
                        onClick={() =>
                          handleRemoveLocation(route.id, loc.id)
                        }
                        className="ml-2 cursor-pointer text-2xl h-4 flex items-center"
                      >
                        &times;
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No locations added yet.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DrivingRouteList;
