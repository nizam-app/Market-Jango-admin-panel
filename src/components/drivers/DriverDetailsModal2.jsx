// src/components/drivers/DriverDetailsModal.jsx
import React from "react";

const DriverDetailsModal2 = ({ driver, onClose, onAssign }) => {
  if (!driver) return null;

  const user = driver.user || {};
  const image =
    user.image || "https://via.placeholder.com/120x120.png?text=Driver";

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-start gap-4">
          <img
            src={image}
            alt={user.name || "Driver"}
            className="w-24 h-24 rounded-full object-cover"
          />
          <div className="flex-1">
            <div className="flex justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-1">
                  {user.name || driver.car_name || "Driver"}
                </h2>
                {user.phone && (
                  <p className="text-sm text-gray-700">{user.phone}</p>
                )}
                {user.email && (
                  <p className="text-sm text-gray-700">{user.email}</p>
                )}
                {driver.location && (
                  <p className="text-sm text-gray-600 mt-1">
                    {driver.location}
                  </p>
                )}
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xl cursor-pointer"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-2">
              Car: {driver.car_name || "-"}{" "}
              {driver.car_model ? `(${driver.car_model})` : ""} · Price:{" "}
              {driver.price ? `$ ${driver.price}` : "N/A"}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto">
          <div>
            <h3 className="text-sm font-semibold mb-1">About this driver</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              This driver operates on route {driver.location || "N/A"} and is
              registered in the Market Jango system.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-[8px] border text-sm cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={onAssign}
              className="px-4 py-2 rounded-[8px] bg-[#FF8C00] text-[#051522] text-sm font-medium cursor-pointer"
            >
              Assign order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDetailsModal2;
