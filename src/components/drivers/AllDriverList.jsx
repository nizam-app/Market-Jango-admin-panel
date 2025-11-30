// src/components/drivers/AllDriverList.jsx
import React, { useEffect, useState, useMemo } from "react";
import DriverDetailsModal from "./DriverDetailsModal";
import { getApprovedDrivers } from "../../api/driverApi";

const AllDriverList = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    from: 0,
    to: 0,
  });

  const [search, setSearch] = useState("");
  const [selectedDriverId, setSelectedDriverId] = useState(null);

  const loadDrivers = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const res = await getApprovedDrivers(pageNumber);

      // response: { status, message, data: { current_page, data: [...] } }
      const paginationData = res.data?.data;
      const list = paginationData?.data ?? [];

      setDrivers(list);
      setPagination({
        current_page: paginationData?.current_page ?? pageNumber,
        last_page: paginationData?.last_page ?? 1,
        total: paginationData?.total ?? list.length,
        from: paginationData?.from ?? 0,
        to: paginationData?.to ?? list.length,
      });
    } catch (err) {
      console.error("Failed to load approved drivers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers(page);
  }, [page]);

  const handlePrevPage = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (page < pagination.last_page) setPage((prev) => prev + 1);
  };

  const openModal = (driverId) => {
    setSelectedDriverId(driverId);
  };

  const closeModal = () => {
    setSelectedDriverId(null);
  };

  // simple client-side search (name, location, car)
  const filteredDrivers = useMemo(() => {
    if (!search.trim()) return drivers;

    const term = search.toLowerCase();
    return drivers.filter((d) => {
      const name = d.user?.name || "";
      const location = d.location || "";
      const carName = d.car_name || "";
      const carModel = d.car_model || "";
      const phone = d.user?.phone || "";

      return (
        name.toLowerCase().includes(term) ||
        location.toLowerCase().includes(term) ||
        carName.toLowerCase().includes(term) ||
        carModel.toLowerCase().includes(term) ||
        phone.toLowerCase().includes(term)
      );
    });
  }, [drivers, search]);

  return (
    <>
      <div className="my-5">
        {/* Header + search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
          <h2 className="text-[26px] font-semibold md:mb-0">All Driver list</h2>

          <div className="relative w-full md:w-auto mt-3 md:mt-0">
            <input
              type="text"
              placeholder="Search for something"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-[100px] w-full md:w-64 bg-white
                shadow-sm focus:outline-none text-sm"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg p-2">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-3 text-left font-normal uppercase tracking-wider text-xs">
                  Date
                </th>
                <th className="px-2 py-3 text-left font-normal uppercase tracking-wider text-xs">
                  Name
                </th>
                <th className="px-2 py-3 text-left font-normal uppercase tracking-wider text-xs">
                  Location
                </th>
                <th className="px-2 py-3 text-left font-normal uppercase tracking-wider text-xs">
                  Car Brand
                </th>
                <th className="px-2 py-3 text-left font-normal uppercase tracking-wider text-xs">
                  Car Model
                </th>
                <th className="px-2 py-3 text-left font-normal uppercase tracking-wider text-xs">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-6 whitespace-nowrap text-sm text-center text-gray-500"
                  >
                    Loading drivers...
                  </td>
                </tr>
              ) : filteredDrivers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-6 whitespace-nowrap text-sm text-center text-gray-500"
                  >
                    {search
                      ? "No drivers match your search."
                      : "No active drivers found."}
                  </td>
                </tr>
              ) : (
                filteredDrivers.map((driver) => {
                  const createdAt = driver.created_at
                    ? new Date(driver.created_at).toLocaleDateString()
                    : "-";
                  const name = driver.user?.name || "-";
                  const location = driver.location || "-";
                  const carName = driver.car_name || "-";
                  const carModel = driver.car_model || "-";
                  const isOnline = !!driver.user?.is_online;

                  return (
                    <tr
                      key={driver.id}
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
                        {carName}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm">
                        {carModel}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                        <span
                          className={`font-normal ${
                            isOnline ? "text-[#55A946]" : "text-[#EA0C0C]"
                          }`}
                        >
                          {isOnline ? "Online" : "Offline"}
                        </span>
                        <button
                          onClick={() => openModal(driver)}
                          className="bg-[#FF8C00] text-white font-medium text-xs py-2 px-4 rounded-[10px] cursor-pointer"
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

        {/* Pagination bar */}
        <div className="flex items-center justify-between mt-4 text-sm">
          <p className="text-gray-600">
            Showing {pagination.from || 0}–{pagination.to || 0} of{" "}
            {pagination.total || 0} drivers
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
      </div>

      {/* Shared details modal – actions off for AllDriverList */}
      {selectedDriverId && (
        <DriverDetailsModal
          driverId={selectedDriverId}
          closeModal={closeModal}
          showStatusActions={false}
        />
      )}
    </>
  );
};

export default AllDriverList;
