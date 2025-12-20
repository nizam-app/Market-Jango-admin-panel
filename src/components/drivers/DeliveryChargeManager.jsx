// src/components/drivers/DeliveryChargeManager.jsx
import React, { useState, useEffect } from "react";
import { DollarSign, Plus, Trash2, Edit3, X } from "lucide-react";
import Swal from "sweetalert2";
import { 
  getRoutes, 
  getRouteLocations, 
  createRouteLocation,
  updateRouteLocation,
  deleteRouteLocation
} from "../../api/routeApi";

const DeliveryChargeManager = () => {
  const [routes, setRoutes] = useState([]);
  const [allLocations, setAllLocations] = useState([]);
  const [routeLocations, setRouteLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [startPointId, setStartPointId] = useState("");
  const [endPointId, setEndPointId] = useState("");
  const [price, setPrice] = useState("");
  const [saving, setSaving] = useState(false);
  
  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Load routes and route locations
  useEffect(() => {
    loadRoutesAndLocations();
  }, []);

  // Update available locations when route changes
  useEffect(() => {
    if (selectedRouteId) {
      const selectedRoute = routes.find((r) => r.id === parseInt(selectedRouteId));
      setAllLocations(selectedRoute?.locations || []);
      // Only clear selections if NOT in edit mode
      if (!isEditing) {
        setStartPointId("");
        setEndPointId("");
      }
    } else {
      setAllLocations([]);
    }
  }, [selectedRouteId, routes, isEditing]);

  const loadRoutesAndLocations = async () => {
    try {
      setLoading(true);
      const [routesRes, locationsRes] = await Promise.all([
        getRoutes(),
        getRouteLocations(),
      ]);

      // Handle routes
      const routesData = routesRes.data?.data?.data || routesRes.data?.data || [];
      setRoutes(routesData);

      // Handle route locations (delivery charges)
      // The response has pagination data in "0" key
      const locationsData = locationsRes.data?.["0"]?.data || locationsRes.data?.data || [];
      setRouteLocations(locationsData);

      // Set default route if available
      if (routesData.length > 0 && !selectedRouteId) {
        setSelectedRouteId(String(routesData[0].id));
      }
    } catch (err) {
      console.error("Failed to load data", err);
      Swal.fire({
        icon: "error",
        title: "Failed to load data",
        text: err?.response?.data?.message || "Could not load routes and delivery charges",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStartPointId("");
    setEndPointId("");
    setPrice("");
    setEditingId(null);
    setIsEditing(false);
  };

  const handleEdit = (routeLocation) => {
    // Set editing mode first
    setIsEditing(true);
    setEditingId(routeLocation.id);
    
    // Find and set the route's locations manually
    const selectedRoute = routes.find((r) => r.id === routeLocation.route_id);
    if (selectedRoute) {
      setAllLocations(selectedRoute.locations || []);
    }
    
    // Now set all the form values
    setSelectedRouteId(String(routeLocation.route_id));
    setStartPointId(String(routeLocation.start_point_id));
    setEndPointId(String(routeLocation.end_point_id));
    setPrice(String(routeLocation.price));
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedRouteId || !startPointId || !endPointId || !price) {
      Swal.fire({
        icon: "warning",
        title: "Missing fields",
        text: "Please fill in all fields",
      });
      return;
    }

    if (startPointId === endPointId) {
      Swal.fire({
        icon: "warning",
        title: "Invalid selection",
        text: "Start and end points must be different",
      });
      return;
    }

    const payload = {
      route_id: parseInt(selectedRouteId),
      start_point_id: parseInt(startPointId),
      end_point_id: parseInt(endPointId),
      price: parseFloat(price),
    };

    try {
      setSaving(true);
      
      let res;
      if (isEditing && editingId) {
        // Update existing
        res = await updateRouteLocation(editingId, payload);
      } else {
        // Create new
        res = await createRouteLocation(payload);
      }

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: res.data?.message || `Delivery charge ${isEditing ? 'updated' : 'added'} successfully`,
        showConfirmButton: false,
        timer: 1800,
      });

      // Reset form
      resetForm();

      // Reload data
      await loadRoutesAndLocations();
    } catch (err) {
      console.error(`Failed to ${isEditing ? 'update' : 'create'} delivery charge`, err);
      Swal.fire({
        icon: "error",
        title: `Failed to ${isEditing ? 'update' : 'add'} delivery charge`,
        text: err?.response?.data?.message || `Could not ${isEditing ? 'update' : 'create'} delivery charge`,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (routeLocation) => {
    const result = await Swal.fire({
      title: "Delete delivery charge?",
      html: `This will remove the delivery charge from <strong>${routeLocation.start_point?.name}</strong> to <strong>${routeLocation.end_point?.name}</strong>.<br/>This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
    });

    if (!result.isConfirmed) return;

    try {
      Swal.fire({
        title: 'Deleting...',
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

      const res = await deleteRouteLocation(routeLocation.id);

      Swal.close();

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: res.data?.message || "Delivery charge deleted successfully",
        showConfirmButton: false,
        timer: 1800,
      });

      // If we were editing this item, reset the form
      if (editingId === routeLocation.id) {
        resetForm();
      }

      // Reload data
      await loadRoutesAndLocations();
    } catch (err) {
      Swal.close();
      console.error("Failed to delete delivery charge", err);
      Swal.fire({
        icon: "error",
        title: "Delete failed",
        text: err?.response?.data?.message || "Could not delete delivery charge",
      });
    }
  };

  // Filter route locations by selected route
  const filteredRouteLocations = selectedRouteId
    ? routeLocations.filter((rl) => rl.route_id === parseInt(selectedRouteId))
    : routeLocations;

  if (loading) {
    return (
      <div className="my-10 text-center">
        <p className="text-gray-500">Loading delivery charges...</p>
      </div>
    );
  }

  return (
    <div className="my-10">
      <div className="flex items-center gap-2 mb-6">
        <DollarSign className="w-7 h-7 text-orange-500" />
        <h2 className="text-[26px] font-semibold">Delivery Charge Management</h2>
      </div>

      {/* Add/Edit Delivery Charge Form */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-8 border-2 border-transparent transition-all" style={isEditing ? { borderColor: '#FF8C00' } : {}}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {isEditing ? '✏️ Edit Delivery Charge' : '➕ Add Delivery Charge'}
          </h3>
          {isEditing && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm"
            >
              <X className="w-4 h-4" />
              Cancel Edit
            </button>
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Route Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Route <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedRouteId}
                onChange={(e) => setSelectedRouteId(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              >
                <option value="">Select Route</option>
                {routes.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Point */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Point <span className="text-red-500">*</span>
              </label>
              <select
                value={startPointId}
                onChange={(e) => setStartPointId(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
                disabled={!selectedRouteId || allLocations.length === 0}
              >
                <option value="">Select Start Point</option>
                {allLocations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* End Point */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Point <span className="text-red-500">*</span>
              </label>
              <select
                value={endPointId}
                onChange={(e) => setEndPointId(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
                disabled={!selectedRouteId || allLocations.length === 0}
              >
                <option value="">Select End Point</option>
                {allLocations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            {isEditing && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-6 rounded-lg flex items-center gap-2 transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isEditing ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {saving 
                ? (isEditing ? "Updating..." : "Adding...") 
                : (isEditing ? "Update Delivery Charge" : "Add Delivery Charge")
              }
            </button>
          </div>
        </form>
      </div>

      {/* Delivery Charges List */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Existing Delivery Charges
          </h3>
          <span className="text-sm text-gray-600">
            {filteredRouteLocations.length} charge(s) found
            {selectedRouteId && ` for selected route`}
          </span>
        </div>

        {filteredRouteLocations.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {selectedRouteId
                ? "No delivery charges set for this route yet"
                : "No delivery charges found"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Route
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Start Point
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    End Point
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Price
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Created
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRouteLocations.map((rl) => (
                  <tr
                    key={rl.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      editingId === rl.id ? 'bg-orange-50' : ''
                    }`}
                  >
                    <td className="py-3 px-4 text-sm text-gray-800 font-medium">
                      {rl.route?.name || `Route #${rl.route_id}`}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {rl.start_point?.name || "-"}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {rl.end_point?.name || "-"}
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-green-600">
                      ${parseFloat(rl.price).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {new Date(rl.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(rl)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(rl)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryChargeManager;

