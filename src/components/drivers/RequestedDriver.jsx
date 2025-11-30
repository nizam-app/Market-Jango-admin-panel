// src/components/drivers/RequestedDriver.jsx
import React, { useEffect, useState } from "react";
import { getRequestedDrivers } from "../../api/driverApi";
import DriverDetailsModal from "./DriverDetailsModal";

const RequestedDriver = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    from: 0,
    to: 0,
  });

  const [selectedDriverId, setSelectedDriverId] = useState(null);

  const loadDrivers = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const res = await getRequestedDrivers(pageNumber);
      // response: { status, message, data: { current_page, data: [...] } }
      const paginationData = res.data?.data;
      const list = paginationData?.data ?? [];

      setRows(list);
      setPagination({
        current_page: paginationData?.current_page ?? pageNumber,
        last_page: paginationData?.last_page ?? 1,
        total: paginationData?.total ?? list.length,
        from: paginationData?.from ?? 0,
        to: paginationData?.to ?? list.length,
      });
    } catch (error) {
      console.error("Failed to load requested drivers", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers(page);
  }, [page]);

  const openModal = (id) => {
    setSelectedDriverId(id);
  };

  const closeModal = () => {
    setSelectedDriverId(null);
  };

  // Driver approved/rejected হলে লিস্ট থেকে রিমুভ করে দিব
  const handleStatusChange = (driverId, status) => {
    setRows((prev) => prev.filter((item) => item.id !== driverId));
  };

  const handlePrevPage = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (page < pagination.last_page) setPage((prev) => prev + 1);
  };

  return (
    <>
      <div className="mb-4">
        <h2 className="text-[26px] font-semibold">Requested Driver</h2>
      </div>

      <div className="overflow-x-auto rounded-lg">
        <table className="min-w-full w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-3 text-left font-normal uppercase tracking-wider">
                Date
              </th>
              <th className="px-2 py-3 text-left font-normal uppercase tracking-wider">
                Name
              </th>
              <th className="px-2 py-3 text-left font-normal uppercase tracking-wider">
                Location
              </th>
              <th className="px-2 py-3 text-left font-normal uppercase tracking-wider">
                Car Brand
              </th>
              <th className="px-2 py-3 text-left font-normal uppercase tracking-wider">
                Car Number
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
                  colSpan={6}
                  className="py-6 text-center text-sm text-gray-500"
                >
                  Loading...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-6 text-center text-sm text-gray-500"
                >
                  No pending driver found.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const createdAt = row.created_at
                  ? new Date(row.created_at).toLocaleString()
                  : "-";

                const name = row.user?.name || "-";
                const phone = row.user?.phone || "-";
                const location =
                  row.location || row.route?.name || row.user?.address || "-";

                const carBrand = row.car_name || row.car_brand || "-";
                const carNumber =
                  row.car_number || row.car_model || phone || "-";

                return (
                  <tr
                    key={row.id}
                    className="odd:bg-transparent even:bg-white"
                  >
                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
                      {createdAt}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm">
                      {name}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm">
                      {location}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm">
                      {carBrand}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm">
                      {carNumber}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => openModal(row.id)}
                        className="px-4 py-2 cursor-pointer font-medium text-xs bg-[#FF8C00] text-white rounded-[10px]"
                      >
                        See Details
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 text-sm">
        <p className="text-gray-600">
          Showing {pagination.from || 0}–{pagination.to || 0} of{" "}
          {pagination.total || 0} requests
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

      {selectedDriverId && (
        <DriverDetailsModal
          driverId={selectedDriverId}
          closeModal={closeModal}
          onStatusChange={handleStatusChange}
        />
      )}
    </>
  );
};

export default RequestedDriver;
