// src/pages/AssignOrderPage.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { getDriverDetails } from "../api/driverApi";
import { getNotDeliveredOrders, assignOrderToDriver } from "../api/orderApi";
import PaymentConfirmModal from "../components/orders/PaymentConfirmModal";

const AssignOrderPage = () => {
  const { driverId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [driver, setDriver] = useState(location.state?.driver || null);
  const [loadingDriver, setLoadingDriver] = useState(false);

  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState("");

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showPayment, setShowPayment] = useState(false);

  // driver load (যদি state থেকে না আসে)
  useEffect(() => {
    if (!driver && driverId) {
      const load = async () => {
        try {
          setLoadingDriver(true);
          const res = await getDriverDetails(driverId);
          setDriver(res.data?.data || null);
        } catch (err) {
          console.error("Failed to load driver", err);
          setError("Failed to load driver details.");
        } finally {
          setLoadingDriver(false);
        }
      };
      load();
    }
  }, [driver, driverId]);

  // orders load
  const loadOrders = async (pageNumber = 1) => {
    try {
      setLoadingOrders(true);
      setError("");
      const res = await getNotDeliveredOrders(pageNumber);

      const pagination = res.data?.data || {};
      const list = pagination.data || [];

      setOrders(list);
      setPage(pagination.current_page || 1);
      setLastPage(pagination.last_page || 1);
    } catch (err) {
      console.error("Failed to load orders", err);
      setError("Failed to load not delivered orders.");
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    loadOrders(1);
  }, []);

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
    setShowPayment(true);
  };

  // ✅ এখন এখানে real payment API use হচ্ছে
 
  const handleConfirmPayment = async () => {
  if (!selectedOrder || !driver) return;

  try {
    // debugging জন্য – console এ দেখবে এখন
    console.log("payment driver object:", driver);
    console.log("payment order object:", selectedOrder);

    // ✅ backend er jonno:
    //  - driverId  → driver table er id (driver.id)
    //  - orderItemId → order.id
    const driverId = driver.id ?? driver.user_id;   // প্রধানত driver.id পাঠাচ্ছি
    const orderItemId = selectedOrder.id;

    const res = await assignOrderToDriver(driverId, orderItemId);

    const paymentData = res?.data?.data?.[0];
    const paymentUrl = paymentData?.paymentMethod?.payment_url;
    const total = paymentData?.total ?? paymentData?.payable;

    if (paymentUrl) {
      // নতুন tab এ flutterwave page open হবে
      window.open(paymentUrl, "_blank", "noopener,noreferrer");
    }

    // সফল হলে order list থেকে remove করি
    setOrders((prev) => prev.filter((o) => o.id !== selectedOrder.id));

    setShowPayment(false);
    setSelectedOrder(null);

    alert(
      `Payment started successfully.${
        total ? ` Payable amount: ${total}` : ""
      }`
    );
  } catch (err) {
    console.error("Failed to create payment / assign order", err);

    const msg =
      err?.response?.data?.message ||
      err?.message ||
      "Failed to create payment. Please try again.";
    alert(msg);
  }
};


  const goBack = () => navigate(-1);

  return (
    <div className="mt-6">
      {/* Top header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goBack}
          className="px-4 py-2 rounded-[8px] border bg-white cursor-pointer text-sm"
        >
          ← Back
        </button>
        <h2 className="text-[26px] font-semibold">Assign order to driver</h2>
        <div />
      </div>

      {/* Driver summary card */}
      <div className="bg-white rounded-[10px] p-4 flex items-center gap-4 shadow-sm">
        {driver ? (
          <>
            <img
              src={
                driver.user?.image ||
                "https://via.placeholder.com/80x80.png?text=Driver"
              }
              alt={driver.user?.name || "Driver"}
              className="w-16 h-16 rounded-[14px] object-cover"
            />
            <div className="flex-1">
              <h3 className="text-lg font-semibold">
                {driver.user?.name || driver.car_name || "Driver"}
              </h3>
              <p className="text-sm text-gray-600">
                {driver.user?.phone || "N/A"} · {driver.location || ""}
              </p>
              <p className="text-xs text-gray-500">
                Car: {driver.car_name || "-"}{" "}
                {driver.car_model && `(${driver.car_model})`} · Price:{" "}
                {driver.price ? `$ ${driver.price}` : "N/A"}
              </p>
            </div>
          </>
        ) : loadingDriver ? (
          <p className="text-sm text-gray-500">Loading driver...</p>
        ) : (
          <p className="text-sm text-red-500">
            {error || "Driver not found."}
          </p>
        )}
      </div>

      {/* Orders table */}
      <div className="mt-6 bg-white rounded-[10px] p-4 shadow-sm">
        <h3 className="text-lg font-semibold mb-3">Not delivered orders</h3>

        {loadingOrders ? (
          <p className="text-sm text-gray-500">Loading orders...</p>
        ) : error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : orders.length === 0 ? (
          <p className="text-sm text-gray-500">
            No not delivered orders available.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-3 text-left font-normal uppercase text-xs tracking-wider">
                    Order ID
                  </th>
                  <th className="px-2 py-3 text-left font-normal uppercase text-xs tracking-wider">
                    Customer
                  </th>
                  <th className="px-2 py-3 text-left font-normal uppercase text-xs tracking-wider">
                    Pickup
                  </th>
                  <th className="px-2 py-3 text-left font-normal uppercase text-xs tracking-wider">
                    Destination
                  </th>
                  <th className="px-2 py-3 text-left font-normal uppercase text-xs tracking-wider">
                    Distance
                  </th>
                  <th className="px-2 py-3 text-left font-normal uppercase text-xs tracking-wider">
                    Charge
                  </th>
                  <th className="px-2 py-3 text-left font-normal uppercase text-xs tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => (
                  <tr
                    key={order.id}
                    className={
                      index % 2 === 0 ? "bg-transparent" : "bg-[#E6EEF6]"
                    }
                  >
                    <td className="px-3 py-3 text-sm whitespace-nowrap">
                      #{order.id}
                    </td>
                    <td className="px-3 py-3 text-sm whitespace-nowrap">
                      <div className="flex flex-col">
                        <span>{order.cus_name}</span>
                        <span className="text-xs text-gray-500">
                          {order.cus_phone}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm whitespace-nowrap">
                      {order.pickup_address}
                    </td>
                    <td className="px-3 py-3 text-sm whitespace-nowrap">
                      {order.ship_address}
                    </td>
                    <td className="px-3 py-3 text-sm whitespace-nowrap">
                      {order.distance} km
                    </td>
                    <td className="px-3 py-3 text-sm whitespace-nowrap">
                      {order.delivery_charge
                        ? `$ ${order.delivery_charge}`
                        : "-"}
                    </td>
                    <td className="px-3 py-3 text-sm whitespace-nowrap">
                      <button
                        onClick={() => handleSelectOrder(order)}
                        className="px-4 py-2 rounded-[10px] bg-[#FF8C00] text-xs font-medium text-[#051522] cursor-pointer"
                      >
                        Pay &amp; assign
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {lastPage > 1 && (
          <div className="flex justify-end gap-3 items-center mt-4 text-xs">
            <button
              onClick={() => loadOrders(page - 1)}
              disabled={page <= 1 || loadingOrders}
              className="px-3 py-1 rounded-[100px] border bg-white disabled:opacity-50 cursor-pointer"
            >
              Previous
            </button>
            <span className="text-gray-600">
              Page {page} of {lastPage}
            </span>
            <button
              onClick={() => loadOrders(page + 1)}
              disabled={page >= lastPage || loadingOrders}
              className="px-3 py-1 rounded-[100px] border bg-white disabled:opacity-50 cursor-pointer"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Payment modal */}
      {showPayment && selectedOrder && driver && (
        <PaymentConfirmModal
          order={selectedOrder}
          driver={driver}
          onClose={() => {
            setShowPayment(false);
            setSelectedOrder(null);
          }}
          onConfirm={handleConfirmPayment}
        />
      )}
    </div>
  );
};

export default AssignOrderPage;
