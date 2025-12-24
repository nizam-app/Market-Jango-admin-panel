// src/components/drivers/NotDeliveredOrder.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import { Search, X } from "lucide-react";

import { getNotDeliveredOrders } from "../../api/orderApi";
import NotDeliveredOrderModal from "./NotDeliveredOrderModal";

const NotDeliveredOrder = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    from: 0,
    to: 0,
  });

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimerRef = useRef(null);

  const loadOrders = async (pageNumber = 1, search = "") => {
    try {
      setLoading(true);
      const res = await getNotDeliveredOrders(pageNumber);

      // response: { status, message, data: { current_page, data: [...] } }
      const paginationData = res.data?.data;
      const list = paginationData?.data ?? [];

      // Apply client-side filtering if search query exists
      let filteredOrders = list;
      if (search.trim()) {
        const searchLower = search.toLowerCase();
        filteredOrders = list.filter((order) => {
          const customerName = (order.cus_name || "").toLowerCase();
          const pickupLocation = (
            order.pickup_address ||
            order.ship_address ||
            order.current_address ||
            ""
          ).toLowerCase();
          const orderId = String(order.id || "").toLowerCase();
          
          return (
            customerName.includes(searchLower) ||
            pickupLocation.includes(searchLower) ||
            orderId.includes(searchLower)
          );
        });
      }

      setOrders(filteredOrders);
      setPagination({
        current_page: paginationData?.current_page ?? pageNumber,
        last_page: paginationData?.last_page ?? 1,
        total: search.trim() ? filteredOrders.length : (paginationData?.total ?? list.length),
        from: paginationData?.from ?? 0,
        to: search.trim() ? filteredOrders.length : (paginationData?.to ?? list.length),
      });
    } catch (error) {
      console.error("Failed to load not delivered orders", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders(page, searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Auto-search with debounce when user types
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (searchQuery.trim()) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }

    debounceTimerRef.current = setTimeout(() => {
      loadOrders(page, searchQuery);
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const handlePrevPage = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (page < pagination.last_page) setPage((prev) => prev + 1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setIsSearching(searchQuery.trim() !== "");
    loadOrders(page, searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setIsSearching(false);
  };

  const openDetails = (order) => {
    setSelectedOrder(order);
  };

  const closeDetails = () => {
    setSelectedOrder(null);
  };

  const handleAssignOrder = () => {
    navigate("/drivers-list");
  };

  const formatDate = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="my-5">
      <div className="mb-2">
        <h2 className="text-[26px] font-semibold md:mb-0">
          Not delivered order
        </h2>
      </div>

      {/* Search Bar */}
      <div className="mb-4 bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <form onSubmit={handleSearch} className="flex gap-3 items-center">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Type to search by customer name, location, or order ID..."
              className="w-full px-4 py-2.5 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </form>

        {isSearching && (
          <div className="mt-3 text-sm text-gray-600">
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Searching...
              </span>
            ) : (
              <span>
                Found <strong className="text-gray-900">{pagination.total}</strong> result{pagination.total !== 1 ? 's' : ''} for "<strong className="text-blue-600">{searchQuery}</strong>"
              </span>
            )}
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-3 text-left font-normal uppercase tracking-wider">
                Date
              </th>
              <th className="px-2 py-3 text-left font-normal uppercase tracking-wider">
                Customer name
              </th>
              <th className="px-2 py-3 text-left font-normal uppercase tracking-wider">
                Pickup location
              </th>
              <th className="px-2 py-3 text-left font-normal uppercase tracking-wider">
                Order Id
              </th>
              <th className="px-2 py-3 text-left font-normal uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-6 text-center text-sm text-gray-500"
                >
                  Loading not delivered orders...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-6 text-center text-sm text-gray-500"
                >
                  No not delivered order found.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order.id}
                  className="odd:bg-transparent even:bg-white"
                >
                  <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
                    {formatDate(order.created_at)}
                  </td>

                  <td className="px-3 py-4 whitespace-nowrap text-sm">
                    {order.cus_name || "-"}
                  </td>

                  <td className="px-3 py-4 whitespace-nowrap text-sm">
                    {order.pickup_address ||
                      order.ship_address ||
                      order.current_address ||
                      "-"}
                  </td>

                  <td className="px-3 py-4 whitespace-nowrap text-sm">
                    {order.id
                      ? `#${order.id}`
                      : "-"}
                  </td>

                  <td className="px-3 py-4 whitespace-nowrap text-sm font-medium max-w-[260px]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => openDetails(order)}
                        className="px-4 py-2 cursor-pointer font-medium text-xs bg-[#FF8C00] text-white rounded-[10px]"
                      >
                        Order Details
                      </button>

                      <button
                        type="button"
                        onClick={handleAssignOrder}
                        className="px-4 py-2 cursor-pointer font-medium text-xs bg-[#FF8C00] text-white rounded-[10px]"
                      >
                        Assigned Order
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination bar */}
      {!loading && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <p className="text-gray-600">
            Showing {pagination.from || 0}–{pagination.to || 0} of{" "}
            {pagination.total || 0} orders
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrevPage}
              disabled={page <= 1}
              className="px-3 py-1 rounded-[8px] border text-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-gray-700">
              Page {page} of {pagination.last_page}
            </span>
            <button
              type="button"
              onClick={handleNextPage}
              disabled={page >= pagination.last_page}
              className="px-3 py-1 rounded-[8px] border text-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {selectedOrder && (
        <NotDeliveredOrderModal order={selectedOrder} onClose={closeDetails} />
      )}
    </div>
  );
};

export default NotDeliveredOrder;
