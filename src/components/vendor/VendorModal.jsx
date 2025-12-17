// src/components/vendor/VendorModal.jsx
import React, { useState, useEffect } from "react";
import { X, UploadCloud, FileText, MapPin } from "lucide-react";
import axiosClient from "../../api/axiosClient";
import { LocationSearchInput } from "./LocationSearchInput";

export function VendorModal({ vendor, onSave, onClose }) {
  const [name, setName] = useState(vendor?.name || "");
  const [email, setEmail] = useState(vendor?.email || "");
  const [phone, setPhone] = useState(vendor?.phone || "");
  const [businessName, setBusinessName] = useState(
    vendor?.businessName || ""
  );
  
  const [businessType, setBusinessType] = useState(
    vendor?.businessType || ""
  );
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("");
  const [address, setAddress] = useState(vendor?.address || "");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);
  const [documentName, setDocumentName] = useState("");

  // 👉 business type list from backend
  const [businessTypes, setBusinessTypes] = useState([]);
  const [btLoading, setBtLoading] = useState(false);
  const [btError, setBtError] = useState(null);

  useEffect(() => {
    async function fetchBusinessTypes() {
      setBtLoading(true);
      setBtError(null);
      try {
        const { data: resp } = await axiosClient.get("/business-type");
        if (resp?.status === "success" && Array.isArray(resp?.data)) {
          setBusinessTypes(resp.data);
        } else {
          setBusinessTypes([]);
        }
      } catch (err) {
        console.error("business-type fetch error", err);
        setBtError("Could not load business types");
      } finally {
        setBtLoading(false);
      }
    }

    fetchBusinessTypes();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocumentFile(file);
      setDocumentName(file.name);
    }
  };

  const handleLocationSelect = (locationData) => {
    setLatitude(locationData.lat);
    setLongitude(locationData.lng);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // For create mode, validate required fields
    if (!vendor) {
      if (!name.trim() || !email.trim() || !password.trim()) {
        return;
      }
    }

    onSave({
      id: vendor?.id || "",
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      businessName: businessName.trim(),
      address: address.trim(),
      status: vendor?.status || "pending",
      productCount: vendor?.productCount || 0,
      joinedDate: vendor?.joinedDate || "",
      documentFile,
      documentName,
      latitude,
      longitude,
      country,
      businessType,
      // backend e currently static "password" pathaccho
      password: password.trim(),
    });
  };

  return (
    <div className="fixed top-16 left-0 bg-black/50 w-full h-full   flex items-center justify-center p-4 z-20">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {vendor ? "Edit Vendor" : "Create Vendor"}
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-6 py-6 space-y-5">
            {/* Document Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document
              </label>
              <div className="flex items-center gap-4">
                {documentName && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-700">
                      {documentName}
                    </span>
                  </div>
                )}
                <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors text-sm">
                  <UploadCloud className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-700">Choose Document</span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Name and Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="vendor-name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Name {!vendor && "*"}
                </label>
                <input
                  id="vendor-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Admin create vendor"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={!vendor}
                />
              </div>

              <div>
                <label
                  htmlFor="vendor-email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email {!vendor && "*"}
                </label>
                <input
                  id="vendor-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vendortest@gmail.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={!vendor}
                />
              </div>
            </div>

            {/* Business Name and Business Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="vendor-business"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Business Name {!vendor && "*"}
                </label>
                <input
                  id="vendor-business"
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="The Jona"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={!vendor}
                />
              </div>

              <div>
                <label
                  htmlFor="business-type"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Business Type {!vendor && "*"}
                </label>
                <select
                  id="business-type"
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={!vendor}
                >
                  <option value="">Select Type</option>
                  {businessTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {btLoading && (
                  <p className="mt-1 text-xs text-gray-400">Loading types...</p>
                )}
                {btError && (
                  <p className="mt-1 text-xs text-red-500">{btError}</p>
                )}
              </div>
            </div>

            {/* Country and Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="country"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Country {!vendor && "*"}
                </label>
                <select
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={!vendor}
                >
                  <option value="">Select Country</option>
                  <option value="Bangladesh">Bangladesh</option>
                  <option value="India">India</option>
                  <option value="Pakistan">Pakistan</option>
                  <option value="Sri Lanka">Sri Lanka</option>
                  <option value="Nepal">Nepal</option>
                  <option value="USA">United States</option>
                  <option value="UK">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="vendor-phone"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Phone Number
                </label>
                <input
                  id="vendor-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+880 1234 567890"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            {/* Password */}
<div>
  <label
    htmlFor="vendor-password"
    className="block text-sm font-medium text-gray-700 mb-2"
  >
    Password {!vendor && "*"}
  </label>
  <input
    id="vendor-password"
    type="password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    placeholder="Set vendor password"
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    required={!vendor}
  />
</div>


            {/* Address */}
            <div>
              <label
                htmlFor="vendor-address"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Address {!vendor && "*"}
              </label>
              <textarea
                id="vendor-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Banasree"
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                required={!vendor}
              />
            </div>

            {/* Location Search with Map */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location Search {!vendor && "*"}
              </label>
              <LocationSearchInput onLocationSelect={handleLocationSelect} />
              {latitude != null && longitude != null && (
                <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Lat:</span>
                    <span>{latitude.toFixed(6)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Lng:</span>
                    <span>{longitude.toFixed(6)}</span>
                  </div>
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
                !vendor && (
                  !name.trim() ||
                  !email.trim() ||
                  !businessName.trim() ||
                  !businessType ||
                  !country ||
                  !address.trim() ||
                  latitude == null ||
                  longitude == null ||
                  !password.trim()
                )
              }
            >
              {vendor ? "Save Changes" : "Create Vendor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
