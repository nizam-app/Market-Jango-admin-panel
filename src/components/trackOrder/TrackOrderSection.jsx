// src/components/trackOrder/TrackOrderSection.jsx
import React, { useEffect, useState } from "react";
import { getAllOrders } from "../../api/orderApi"; // <-- path adjust লাগলে করো

const statusSteps = ["Packed", "On The Way", "Complete"];

// backend status → progress bar index
const mapStatusToIndex = (status) => {
  if (!status) return 0;
  const s = status.toString().toLowerCase();

  if (s.includes("pending")) return 0;
  if (s.includes("ready for delivery")) return 1;
  if (s.includes("on the way")) return 1;
  if (s.includes("complete")) return 2;

  return 0;
};

const TrackOrderSection = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ---- helpers ----
  const filterBySearch = (list, term) => {
    if (!term.trim()) return list;
    const q = term.toLowerCase();
    return list.filter((o) => {
      const id = String(o.id || "");
      const name = (o.cus_name || "").toLowerCase();
      const pickup = (o.pickup_address || "").toLowerCase();
      const dest = (o.ship_address || "").toLowerCase();
      const vendorName = (o.vendor?.user?.name || "").toLowerCase();
      const vendorBusinessName = (o.vendor?.business_name || "").toLowerCase();
      return (
        id.includes(q) ||
        name.includes(q) ||
        pickup.includes(q) ||
        dest.includes(q) ||
        vendorName.includes(q) ||
        vendorBusinessName.includes(q)
      );
    });
  };

  const loadOrders = async (pageNumber = 1) => {
    try {
      setLoading(true);
      setError("");

      // ✅ all order API
      const res = await getAllOrders(pageNumber);

      // pagination object
      const pagination = res.data?.data || {};
      const list = pagination.data || [];

      setOrders(list);
      const filtered = filterBySearch(list, searchTerm);
      setFilteredOrders(filtered);

      if (!selectedOrder && filtered.length > 0) {
        setSelectedOrder(filtered[0]); // প্রথম order default select
      }

      setPage(pagination.current_page || 1);
      setLastPage(pagination.last_page || 1);
    } catch (err) {
      console.error("Failed to load orders", err);
      setError("Failed to load orders.");
      setOrders([]);
      setFilteredOrders([]);
      setSelectedOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // search change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setFilteredOrders(filterBySearch(orders, value));
  };

  const currentStatusIndex = (() => {
    if (!selectedOrder) return 0;
    const idx = mapStatusToIndex(
      selectedOrder.status || selectedOrder.delivery_status
    );
    return idx;
  })();

  const progressPercent =
    statusSteps.length > 1
      ? (currentStatusIndex / (statusSteps.length - 1)) * 100
      : 0;

  const statusLabel =
    (selectedOrder &&
      (selectedOrder.status ||
        selectedOrder.delivery_status ||
        "Packed")) ||
    "Packed";

  return (
    <div className="min-h-screen">
      <h2 className="text-lg font-semibold mb-6 text-[#343C6A]">
        Order Overview
      </h2>

      <div className="flex gap-5 rounded-lg w-full ">
        {/* ===== Left Side: Order List ===== */}
        <div className="w-1/3 flex flex-col">
          {/* search */}
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search by order / customer / vendor / address"
              className="w-full py-4 pl-12 bg-[#FFFFFF] rounded-[40px] 
              focus:outline-none  text-sm placeholder-[#3C3C3C]"
              value={searchTerm}
              onChange={handleSearchChange}
            />

            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 absolute left-4 top-1/2 
              transform -translate-y-1/2 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* order list */}
          <div className="space-y-4 overflow-y-auto max-h-[600px] pr-1">
            {loading && (
              <p className="text-xs text-gray-500">Loading orders...</p>
            )}
            {error && !loading && (
              <p className="text-xs text-red-500">{error}</p>
            )}
            {!loading && !error && filteredOrders.length === 0 && (
              <p className="text-xs text-gray-500">No orders found.</p>
            )}

            {!loading &&
              !error &&
              filteredOrders.map((order) => {
                const isActive = selectedOrder?.id === order.id;
                return (
                  <button
                    key={order.id}
                    type="button"
                    onClick={() => setSelectedOrder(order)}
                    className={`w-full text-left p-4 rounded-[10px] cursor-pointer relative transition 
                    ${
                      isActive
                        ? "bg-[#0168B8] text-white"
                        : "bg-[#FFFFFF] text-[#151515]"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-normal text-xs">
                        Order ID #{order.id}
                      </span>
                      {/* ছোট envelope icon */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill={isActive ? "#fff" : "#151515"}
                        height="20"
                        width="20"
                        viewBox="0 0 458 458"
                      >
                        <path d="M428,41.534H30c-16.569,0-30,13.431-30,30v252c0,16.568,13.432,30,30,30h132.1l43.942,52.243    
                          c5.7,6.777,14.103,10.69,22.959,10.69c8.856,0,17.258-3.912,22.959-10.69l43.942-52.243H428c16.568,0,30-13.432,30-30v-252    
                          C458,54.965,444.568,41.534,428,41.534z" />
                      </svg>
                    </div>

                    <div className="flex items-center space-x-3 mb-2">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center overflow-hidden ${
                          isActive ? "bg-white" : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`text-[10px] font-semibold ${
                            isActive ? "text-[#0168B8]" : "text-[#151515]"
                          }`}
                        >
                          {order.cus_name?.[0] || "C"}
                        </span>
                      </div>
                      <span className="font-normal text-sm">
                        {order.cus_name || "Customer"}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1">
                      <p className="text-[11px]">
                        <span className="font-semibold">From:</span>{" "}
                        {order.pickup_address || "-"}
                      </p>
                      <div
                        className={`h-4 border-l ${
                          isActive ? "border-white" : "border-[#818181]"
                        }`}
                      ></div>
                      <p className="text-[11px]">
                        <span className="font-semibold">Destination:</span>{" "}
                        {order.ship_address || "-"}
                      </p>
                    </div>

                    <div className="mt-2 flex justify-between items-center text-[10px]">
                      <span>
                        Status:{" "}
                        <span className="font-semibold">
                          {order.status || "Pending"}
                        </span>
                      </span>
                      {order.invoice?.payable && (
                        <span>
                          Total: $
                          {Number(order.invoice.payable).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
          </div>

          {/* pagination */}
          {!loading && lastPage > 1 && (
            <div className="flex justify-end gap-3 items-center mt-4 text-xs">
              <button
                onClick={() => loadOrders(page - 1)}
                disabled={page <= 1 || loading}
                className="px-3 py-1 rounded-[100px] border bg-white disabled:opacity-50 cursor-pointer"
              >
                Previous
              </button>
              <span className="text-gray-600">
                Page {page} of {lastPage}
              </span>
              <button
                onClick={() => loadOrders(page + 1)}
                disabled={page >= lastPage || loading}
                className="px-3 py-1 rounded-[100px] border bg-white disabled:opacity-50 cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* ===== Right Side: Order Details / Tracking ===== */}
        <div className="w-2/3 flex rounded-[10px] bg-[#FFFFFF]">
          {!selectedOrder ? (
            <div className="w-full p-8 flex items-center justify-center text-sm text-gray-500">
              Select an order from the left list to view tracking details.
            </div>
          ) : (
            <>
              {/* left: tracking timeline */}
              <div className="w-full p-12">
                {/* Progress Bar */}
                <div className="relative flex items-center justify-between mb-4">
                  {/* Full Bar Background */}
                  <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-300 rounded-full -translate-y-1/2 z-0" />

                  {/* Progress Fill */}
                  <div
                    className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-[#64748b] via-[#004CFF] to-[#003158] rounded-full -translate-y-1/2 z-0"
                    style={{ width: `${Math.max(progressPercent, 5)}%` }}
                  />

                  {statusSteps.map((step, index) => {
                    const active = index <= currentStatusIndex;
                    return (
                      <div
                        key={step}
                        className="relative z-10 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md"
                        style={{
                          borderWidth: 2,
                          borderColor: active ? "#004CFF" : "#64748B",
                        }}
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: active ? "#004CFF" : "#64748B",
                          }}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Tracking Status */}
                <div className="flex-1 overflow-y-auto mt-8">
                  <div className="space-y-6">
                    <h3 className="text-2xl font-medium text-[#0168B8]">
                      {statusLabel}
                    </h3>

                    {/* Tracking Number box */}
                    <div className="bg-[#F9F9F9] rounded-[10px] p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[#202020] font-semibold">
                          Tracking Number
                        </span>
                        <button className="cursor-pointer">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20px"
                            height="20px"
                            viewBox="0 0 32 32"
                            fill="#0B1719"
                          >
                            <path d="M10,6c0,0.552,0.448,1,1,1h10c0.552,0,1-0.448,1-1V3c0-0.552-0.448-1-1-1h-2.184 
                              C18.403,0.837,17.304,0,16,0s-2.403,0.837-2.816,2H11c-0.552,0-1,0.448-1,1V6z M28,6v23c0,1.657-1.343,3-3,3H7
                              c-1.657,0-3-1.343-3-3V6c0-1.657,1.343-3,3-3h2v2H7C6.448,5,6,5.448,6,6v23c0,0.552,0.448,1,1,1h18c0.552,0,1-0.448,1-1V6
                              c0-0.552-0.448-1-1-1h-2V3h2C26.657,3,28,4.343,28,6z"/>
                          </svg>
                        </button>
                      </div>
                      <p className="font-normal text-xs text-[#000000] mt-1">
                        {selectedOrder.tran_id || `#${selectedOrder.id}`}
                      </p>
                    </div>

                    {/* Vendor Information */}
                    {selectedOrder.vendor && (
                      <div className="bg-[#F0F7FF] rounded-[10px] p-4 border border-[#B3D9FF]">
                        <span className="text-sm text-[#202020] font-semibold">
                          Vendor Information
                        </span>
                        <div className="mt-2 space-y-1">
                          <p className="font-normal text-xs text-[#000000]">
                            <span className="font-medium">Business:</span> {selectedOrder.vendor.business_name || "-"}
                          </p>
                          <p className="font-normal text-xs text-[#000000]">
                            <span className="font-medium">Name:</span> {selectedOrder.vendor.user?.name || "-"}
                          </p>
                          <p className="font-normal text-xs text-[#000000]">
                            <span className="font-medium">Type:</span> {selectedOrder.vendor.business_type || "-"}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Delivery Notice */}
                    {selectedOrder.note && (
                      <div className="bg-[#F0FFF4] rounded-[10px] p-4 border border-[#9AE6B4]">
                        <div className="flex items-start gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-[#38A169] flex-shrink-0 mt-0.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <div className="flex-1">
                            <span className="text-sm text-[#22543D] font-semibold block">
                              Delivery Notice
                            </span>
                            <p className="font-normal text-xs text-[#22543D] mt-1">
                              {selectedOrder.note}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Timeline steps */}
                    <div>
                      {statusSteps.map((step, index) => {
                        const active = index <= currentStatusIndex;
                        return (
                          <div key={step} className="mb-6">
                            <div className="flex justify-between items-center">
                              <p
                                className={`font-medium ${
                                  active
                                    ? "text-[#000000]"
                                    : "text-[#8AB3D3]"
                                }`}
                              >
                                {step}
                              </p>
                              <span
                                className={`text-xs rounded-[4px] px-2 py-0.5 ${
                                  active
                                    ? "bg-[#F9F9F9] text-[#000000]"
                                    : "bg-[#E6F0F8] text-[#5490BF]"
                                }`}
                              >
                                {new Date(
                                  selectedOrder.updated_at ||
                                    selectedOrder.created_at ||
                                    Date.now()
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            <p
                              className={`text-xs font-normal mt-0.5 ${
                                active
                                  ? "text-[#000000]"
                                  : "text-[#8AB3D3]"
                              }`}
                            >
                              Current status: {statusLabel}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackOrderSection;
