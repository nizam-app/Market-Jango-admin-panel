// src/components/orders/PaymentConfirmModal.jsx
import React, { useState } from "react";

const PaymentConfirmModal = ({ order, driver, onClose, onConfirm }) => {
  const [processing, setProcessing] = useState(false);

  if (!order || !driver) return null;
  console.log(order, 'order')

  const handleSubmit = async () => {
    if (!onConfirm) return;
    try {
      setProcessing(true);
      await onConfirm(); // আর কিছু পাঠাচ্ছি না, সবটাই parent এ handle হচ্ছে
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Confirm payment &amp; assign</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xl cursor-pointer"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto text-sm">
          <div>
            <h3 className="font-semibold mb-1">Driver</h3>
            <p>
              {driver.user?.name || driver.car_name} ·{" "}
              {driver.user?.phone || ""}
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-1">Order</h3>
            <p>Order ID: #{order.id}</p>
            <p>
              Customer: {order.cus_name} ({order.cus_phone})
            </p>
            <p>Pickup: {order.pickup_address}</p>
            <p>Destination: {order.ship_address}</p>
            <p className="mt-1">
              Delivery charge:{" "}
              <span className="font-semibold">
                {order.delivery_charge ? `$ ${order.delivery_charge}` : "$ 0.00"}
              </span>
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-1">Payment</h3>
            <p>Payment method: Online payment</p>
            <p className="text-xs text-gray-500 mt-1">
              After you continue, a secure payment page (Flutterwave) will open
              in a new tab. Once the payment is completed successfully, the
              order will be assigned to this driver.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-5 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-[8px] border bg-white text-sm cursor-pointer"
            disabled={processing}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={processing}
            className="px-5 py-2 rounded-[8px] bg-[#55A946] text-[#051522] text-sm font-medium cursor-pointer disabled:opacity-60"
          >
            {processing ? "Processing..." : "Continue to payment"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmModal;
