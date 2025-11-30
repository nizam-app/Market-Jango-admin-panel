// src/components/drivers/NotDeliveredOrder.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";

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

  const loadOrders = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const res = await getNotDeliveredOrders(pageNumber);

      // response: { status, message, data: { current_page, data: [...] } }
      const paginationData = res.data?.data;
      const list = paginationData?.data ?? [];

      setOrders(list);
      setPagination({
        current_page: paginationData?.current_page ?? pageNumber,
        last_page: paginationData?.last_page ?? 1,
        total: paginationData?.total ?? list.length,
        from: paginationData?.from ?? 0,
        to: paginationData?.to ?? list.length,
      });
    } catch (error) {
      console.error("Failed to load not delivered orders", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders(page);
  }, [page]);

  const handlePrevPage = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (page < pagination.last_page) setPage((prev) => prev + 1);
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
