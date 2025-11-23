// src/components/vendor/VendorModal.jsx
import React from "react";

const VendorModal = ({ vendor, onClose }) => {
  if (!vendor) return null;

  const user = vendor.user || {};
  const images = vendor.images || [];

  const formatPhoneVerified = () => {
    if (!user.phone_verified_at) return "-";
    try {
      return new Date(user.phone_verified_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return user.phone_verified_at;
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        <div className="h-full overflow-y-auto custom-scroll">
          {/* Header: avatar + basic info */}
          <div className="p-6 border-b border-gray-200 flex items-start gap-4">
            <img
              src={
                user.image ||
                "https://via.placeholder.com/120x120.png?text=Vendor"
              }
              alt={user.name || "Vendor"}
              className="w-24 h-24 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="flex justify-between">
                <div>
                  <h2 className="text-2xl font-semibold mb-1">
                    {vendor.business_name || user.name || "Vendor name"}
                  </h2>
                  {user.phone && (
                    <p className="text-sm text-gray-700">{user.phone}</p>
                  )}
                  {user.email && (
                    <p className="text-sm text-gray-700">{user.email}</p>
                  )}
                  {vendor.address && (
                    <p className="text-sm text-gray-600 mt-1">
                      {vendor.address}
                    </p>
                  )}
                </div>

                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-gray-200 text-2xl leading-none flex items-center justify-center cursor-pointer"
                >
                  &times;
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-2">
                Member since: {formatPhoneVerified()}
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* About */}
            <div>
              <h3 className="text-lg font-semibold mb-2">
                About this vendor
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {vendor.business_name || user.name} is a{" "}
                {vendor.business_type || "business"} based in{" "}
                {vendor.country || "their local area"}. They provide products
                and services through the Market Jango platform. All contact and
                verification details are managed securely by the admin panel.
              </p>
            </div>

            {/* Documents */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Trade license &amp; Other Documents
              </h3>

              {images.length === 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="h-40 border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-sm text-gray-400">
                    No document uploaded
                  </div>
                  <div className="h-40 border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-sm text-gray-400">
                    No document uploaded
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {images.map((img) => {
                    const url =
                      img.image_path || img.image || img.url || img.path;
                    if (!url) return null;
                    return (
                      <img
                        key={img.id || url}
                        src={url}
                        alt="Vendor document"
                        className="w-full h-40 md:h-56 object-cover rounded-lg border"
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorModal;
