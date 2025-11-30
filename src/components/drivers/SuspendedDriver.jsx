// src/components/drivers/SuspendedDriver.jsx
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  fetchSuspendedDrivers,
  deleteUserById,
  restoreSuspendedDriver,
} from "../../api/driverApi";

const SuspendedDriver = () => {
  const [drivers, setDrivers] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadSuspendedDrivers = async (page = 1) => {
    try {
      setLoading(true);
      setError("");
      const res = await fetchSuspendedDrivers(page);

      const paginated = res?.data || {};
      setDrivers(paginated.data || []);
      setPagination({
        current_page: paginated.current_page || 1,
        last_page: paginated.last_page || 1,
        total: paginated.total || 0,
      });
    } catch (err) {
      console.error("Failed to load suspended drivers:", err);
      setError("Failed to load suspended drivers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuspendedDrivers(1);
  }, []);

  const handlePageChange = (newPage) => {
    if (
      newPage < 1 ||
      newPage > pagination.last_page ||
      newPage === pagination.current_page
    ) {
      return;
    }
    loadSuspendedDrivers(newPage);
  };

  const handleDelete = async (driver) => {
    const userId = driver?.user?.id || driver?.user_id;
    if (!userId) return;

    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to permanently delete ${driver.user?.name || "this driver"}.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EA0C0C",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, delete",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteUserById(userId);
      await Swal.fire({
        icon: "success",
        title: "Deleted",
        text: "Driver deleted successfully.",
        timer: 1500,
        showConfirmButton: false,
      });

      // refetch list after delete
      loadSuspendedDrivers(pagination.current_page);
    } catch (err) {
      console.error("Delete failed:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to delete driver.",
      });
    }
  };

  const handleRestore = async (driver) => {
    const driverId = driver?.id;
    if (!driverId) return;

    const result = await Swal.fire({
      title: "Restore this driver?",
      text: "Status will be changed to Pending.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0D3250",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, restore",
    });

    if (!result.isConfirmed) return;

    try {
      await restoreSuspendedDriver(driverId);
      await Swal.fire({
        icon: "success",
        title: "Restored",
        text: "Driver status updated to Pending.",
        timer: 1500,
        showConfirmButton: false,
      });

      loadSuspendedDrivers(pagination.current_page);
    } catch (err) {
      console.error("Restore failed:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to restore driver.",
      });
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return "-";
    const d = new Date(isoString);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  return (
    <>
      <div className="my-5">
        <div className="mb-2">
          <h2 className="text-[26px] font-semibold md:mb-0">
            Suspended Driver
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
                  Name
                </th>
                <th className="px-2 py-3 text-left font-normal uppercase tracking-wider">
                  Location
                </th>
                <th className="px-2 py-3 text-left font-normal uppercase tracking-wider">
                  Number
                </th>
                <th className="px-2 py-3 text-left font-normal uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-6 text-center text-sm text-gray-500"
                  >
                    Loading suspended drivers...
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-6 text-center text-sm text-red-500"
                  >
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && drivers.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-6 text-center text-sm text-gray-500"
                  >
                    No suspended driver found.
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                drivers.map((driver, index) => (
                  <tr
                    key={driver.id || index}
                    className={
                      index % 2 === 0
                        ? "bg-[#E6EEF6]"
                        : "bg-transparent"
                    }
                  >
                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
                      {formatDate(driver.created_at)}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm">
                      {driver.user?.name || "-"}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm">
                      {driver.location || "-"}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm">
                      {driver.user?.phone || "-"}
                    </td>

                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium max-w-[220px]">
                      <div className="flex items-center space-x-2 flex-wrap">
                        {/* Delete icon */}
                        <button
                          type="button"
                          onClick={() => handleDelete(driver)}
                          className="cursor-pointer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="25"
                            height="25"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M18 6L17.1991 18.0129C17.129 19.065 17.0939 19.5911 16.8667 19.99C16.6666 20.3412 16.3648 20.6235 16.0011 20.7998C15.588 21 15.0607 21 14.0062 21H9.99377C8.93927 21 8.41202 21 7.99889 20.7998C7.63517 20.6235 7.33339 20.3412 7.13332 19.99C6.90607 19.5911 6.871 19.065 6.80086 18.0129L6 6M4 6H20M16 6L15.7294 5.18807C15.4671 4.40125 15.3359 4.00784 15.0927 3.71698C14.8779 3.46013 14.6021 3.26132 14.2905 3.13878C13.9376 3 13.523 3 12.6936 3H11.3064C10.477 3 10.0624 3 9.70951 3.13878C9.39792 3.26132 9.12208 3.46013 8.90729 3.71698C8.66405 4.00784 8.53292 4.40125 8.27064 5.18807L8 6M14 10V17M10 10V17"
                              stroke="#EA0C0C"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>

                        {/* Restore button */}
                        <button
                          type="button"
                          onClick={() => handleRestore(driver)}
                          className="px-4 py-2 cursor-pointer font-medium text-xs bg-[#FF8C00] rounded-[10px] text-white"
                        >
                          Restore Request
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <div className="flex justify-end mt-4 space-x-2">
            <button
              type="button"
              onClick={() =>
                handlePageChange(pagination.current_page - 1)
              }
              disabled={pagination.current_page === 1}
              className={`px-3 py-1 rounded-[8px] text-sm border ${
                pagination.current_page === 1
                  ? "text-gray-400 border-gray-200 cursor-not-allowed"
                  : "text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              Previous
            </button>
            <span className="text-sm text-gray-600 px-2 py-1">
              Page {pagination.current_page} of {pagination.last_page}
            </span>
            <button
              type="button"
              onClick={() =>
                handlePageChange(pagination.current_page + 1)
              }
              disabled={
                pagination.current_page === pagination.last_page
              }
              className={`px-3 py-1 rounded-[8px] text-sm border ${
                pagination.current_page === pagination.last_page
                  ? "text-gray-400 border-gray-200 cursor-not-allowed"
                  : "text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default SuspendedDriver;
