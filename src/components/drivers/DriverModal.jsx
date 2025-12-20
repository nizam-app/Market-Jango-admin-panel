// src/components/driver/DriverModal.jsx
import React, { useState } from "react";
import { X, UploadCloud } from "lucide-react";
import Swal from "sweetalert2";

/**
 * props:
 * - driver: existing driver object or null
 * - routes: [{ id, name, ... }]
 * - onSave: (payload) => void
 * - onClose: () => void
 */
export function DriverModal({ driver, routes = [], onSave, onClose }) {
  const [name, setName] = useState(driver?.name || "");
  const [email, setEmail] = useState(driver?.email || "");
  const [phone, setPhone] = useState(driver?.phone || "");
  const [password, setPassword] = useState(driver?.password || "");
  const [carName, setCarName] = useState(driver?.carName || "");
  const [carModel, setCarModel] = useState(driver?.carModel || "");
  const [location, setLocation] = useState(driver?.location || "");
  const [price, setPrice] = useState(driver?.price?.toString() || "");
  const [routeIds, setRouteIds] = useState(
    driver?.routeIds?.map((id) => String(id)) || []
  );
  const [uploadedFiles, setUploadedFiles] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    // For create mode, validate required fields
    if (!driver) {
      if (
        !name.trim() ||
        !email.trim() ||
        !phone.trim() ||
        !password.trim() ||
        !carName.trim() ||
        !carModel.trim() ||
        !location.trim() ||
        !price.trim() ||
        routeIds.length === 0
      ) {
        Swal.fire({
          icon: "warning",
          title: "Missing fields",
          text: "Please fill all required fields before saving.",
        });
        return;
      }
    }

    const payload = {
      id: driver?.id || "",
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password: password.trim(),
      carName: carName.trim(),
      carModel: carModel.trim(),
      vehicleNumber: driver?.vehicleNumber || "",
      location: location.trim(),
      price: parseFloat(price) || 0,
      routeIds, // string array
      documents: driver?.documents || [],
      numberOfRoutes: routeIds.length,
      status: driver?.status || "pending",
      joinedDate: driver?.joinedDate || "",
      // ⬇️ নতুন: parent যেন ফাইলগুলো পায়
      files: uploadedFiles,
    };

    onSave?.(payload);
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setUploadedFiles(e.target.files);
    }
  };

  const handleRouteChange = (e) => {
    const clickedValue = e.target.value;

    setRouteIds((prev) =>
      prev.includes(clickedValue)
        ? prev.filter((id) => id !== clickedValue)
        : [...prev, clickedValue]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {driver ? "Edit Driver" : "Add New Driver"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="px-6 py-6 space-y-5 overflow-y-auto">
            {/* Name & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="driver-name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Name {!driver && "*"}
                </label>
                <input
                  id="driver-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="pqlam driver"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={!driver}
                />
              </div>

              <div>
                <label
                  htmlFor="driver-email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email {!driver && "*"}
                </label>
                <input
                  id="driver-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="pqlam3@gmail.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={!driver}
                />
              </div>
            </div>

            {/* Phone & Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="driver-phone"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Phone {!driver && "*"}
                </label>
                <input
                  id="driver-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="3211212323"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={!driver}
                />
              </div>

              <div>
                <label
                  htmlFor="driver-password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password {!driver && "*"}
                </label>
                <input
                  id="driver-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={!driver}
                />
              </div>
            </div>

            {/* Car Name & Car Model */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="car-name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Car Name {!driver && "*"}
                </label>
                <input
                  id="car-name"
                  type="text"
                  value={carName}
                  onChange={(e) => setCarName(e.target.value)}
                  placeholder="Lexus"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={!driver}
                />
              </div>

              <div>
                <label
                  htmlFor="car-model"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Car Model {!driver && "*"}
                </label>
                <input
                  id="car-model"
                  type="text"
                  value={carModel}
                  onChange={(e) => setCarModel(e.target.value)}
                  placeholder="12bef"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={!driver}
                />
              </div>
            </div>

            {/* Location & Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Location {!driver && "*"}
                </label>
                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="kushtia"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={!driver}
                />
              </div>

              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Price {!driver && "*"}
                </label>
                <input
                  id="price"
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="120"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={!driver}
                />
              </div>
            </div>

            {/* Route IDs - Multi Select */}
            <div>
              <label
                htmlFor="route-ids"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Route IDs {!driver && "*"}
              </label>
              <select
                id="route-ids"
                multiple
                value={routeIds}
                onChange={handleRouteChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                required={!driver}
              >
                {routes.map((route) => {
                  const priceRange = route.min_price && route.max_price 
                    ? ` | Price Range: $${route.min_price} - $${route.max_price}`
                    : route.min_price 
                    ? ` | Price Range: $${route.min_price}`
                    : '';
                  
                  return (
                    <option key={route.id} value={String(route.id)}>
                      {route.name} (ID: {route.id}){priceRange}
                    </option>
                  );
                })}
              </select>

              {routeIds.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <p className="w-full text-sm text-gray-600">
                    Selected Routes:
                  </p>
                  {routeIds.map((routeId) => {
                    const route = routes.find(
                      (r) => String(r.id) === routeId
                    );
                    
                    const routeName = route?.name || `Route ${routeId}`;
                    const priceRange = route?.min_price && route?.max_price 
                      ? ` ($${route.min_price} - $${route.max_price})`
                      : route?.min_price 
                      ? ` ($${route.min_price})`
                      : '';
                    
                    return (
                      <div
                        key={routeId}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg"
                      >
                        <span className="text-sm">
                          {routeName}
                          {priceRange && (
                            <span className="font-semibold ml-1">{priceRange}</span>
                          )}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setRouteIds((prev) =>
                              prev.filter((id) => id !== routeId)
                            )
                          }
                          className="text-blue-700 hover:text-blue-900"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Upload Documents */}
            <div>
              <label
                htmlFor="documents"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Upload Documents (file[])
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  id="documents"
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="documents"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <UploadCloud className="w-10 h-10 text-gray-400 mb-3" />
                  <p className="text-gray-600 mb-1 text-sm">
                    {uploadedFiles
                      ? `${uploadedFiles.length} file(s) selected`
                      : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-gray-500 text-xs">
                    PNG, JPG, PDF up to 10MB
                  </p>
                </label>
              </div>

              {driver?.documents && driver.documents.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Existing documents:</p>
                  <ul className="list-disc list-inside text-gray-500 text-sm">
                    {driver.documents.map((doc, index) => (
                      <li key={index}>{doc}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Footer buttons */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={
                !driver && (
                  !name.trim() ||
                  !email.trim() ||
                  !phone.trim() ||
                  !password.trim() ||
                  !carName.trim() ||
                  !carModel.trim() ||
                  !location.trim() ||
                  !price.trim() ||
                  routeIds.length === 0
                )
              }
            >
              {driver ? "Save Changes" : "Add Driver"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DriverModal;
