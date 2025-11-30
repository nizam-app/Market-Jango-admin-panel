// src/components/drivers/NotDeliveredOrderModal.jsx
import React from "react";

const NotDeliveredOrderModal = ({ order, onClose }) => {
  if (!order) {
    return null;
  }

  const {
    id,
    cus_name,
    cus_email,
    cus_phone,
    pickup_address,
    current_address,
    ship_address,
    current_latitude,
    current_longitude,
    ship_latitude,
    ship_longitude,
    note,
    tran_id,
    status,
    created_at,
    invoice_id,
    quantity,
    sale_price,
    delivery_charge,
    distance,
  } = order;

  const createdDate = created_at
    ? new Date(created_at).toLocaleString()
    : "-";

  const subtotal = (Number(sale_price || 0) * Number(quantity || 0)) || 0;
  const delivery = Number(delivery_charge || 0) || 0;
  const total = subtotal + delivery;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[85vh] mx-4 overflow-hidden"
      >
        {/* Header */}
        <div className="relative border-b px-8 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-[22px] font-semibold">Order Details</h2>
            <p className="text-xs text-gray-500">
              Order ID: <span className="font-medium">#{id}</span> · Invoice:{" "}
              <span className="font-medium">
                {invoice_id ? `#${invoice_id}` : "-"}
              </span>{" "}
              · Status:{" "}
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                  status === "Not Deliver"
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {status || "N/A"}
              </span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-[36px] h-[36px] bg-[#E2E2E2] bg-opacity-80 rounded-full text-[#000000] text-[22px] cursor-pointer flex items-center justify-center"
          >
            &times;
          </button>
        </div>

        {/* Body (scrollable) */}
        <div className="h-full overflow-y-auto custom-scroll px-8 pb-8 pt-4 space-y-8">
          {/* Meta info */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Customer card */}
            <div className="bg-[#F7F8FA] rounded-[16px] p-5 space-y-2">
              <h3 className="text-sm font-semibold mb-1">Customer details</h3>
              <p className="text-sm">
                <span className="font-medium">Name: </span>
                {cus_name || "N/A"}
              </p>
              <p className="text-sm">
                <span className="font-medium">Phone: </span>
                {cus_phone || "N/A"}
              </p>
              <p className="text-sm">
                <span className="font-medium">Email: </span>
                {cus_email || "N/A"}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Created at: {createdDate}
              </p>
              {tran_id && (
                <p className="text-xs text-gray-500">
                  Transaction ID: <span className="font-mono">{tran_id}</span>
                </p>
              )}
            </div>

            {/* Amount summary */}
            <div className="bg-[#F7F8FA] rounded-[16px] p-5">
              <h3 className="text-sm font-semibold mb-3">Price & quantity</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Quantity</span>
                  <span className="font-medium">{quantity ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Unit price</span>
                  <span className="font-medium">
                    {sale_price != null ? `$${sale_price}` : "$0"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery charge</span>
                  <span className="font-medium">${delivery.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between text-[15px] font-semibold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                {distance && (
                  <p className="text-xs text-gray-500 mt-1">
                    Distance: {distance} km
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Route section */}
          <div>
            <h3 className="text-[16px] font-semibold mb-3">Order route</h3>
            <div className="space-y-3 text-sm bg-white border rounded-[16px] p-5">
              <div className="flex gap-3">
                <span className="w-24 font-medium">From:</span>
                <p className="flex-1">
                  {pickup_address || "Pickup address not available"}
                </p>
              </div>
              <div className="flex gap-3">
                <span className="w-24 font-medium">Current:</span>
                <div className="flex-1 space-y-1">
                  <p>{current_address || "Current address not available"}</p>
                  {(current_latitude || current_longitude) && (
                    <p className="text-xs text-gray-500">
                      Lat/Lng: {current_latitude || "-"},{" "}
                      {current_longitude || "-"}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <span className="w-24 font-medium">Destination:</span>
                <div className="flex-1 space-y-1">
                  <p>{ship_address || "Shipping address not available"}</p>
                  {(ship_latitude || ship_longitude) && (
                    <p className="text-xs text-gray-500">
                      Lat/Lng: {ship_latitude || "-"},{" "}
                      {ship_longitude || "-"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Note */}
          {note && (
            <div>
              <h3 className="text-[16px] font-semibold mb-2">Driver note</h3>
              <div className="bg-[#FFF7E8] border border-[#FFE0A3] rounded-[16px] p-4 text-sm leading-relaxed">
                {note}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotDeliveredOrderModal;
