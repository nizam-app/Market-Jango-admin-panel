// src/components/vendor/SuspendedVendor.jsx
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { deleteVendor, getSuspendedVendors, updateVendorStatus } from "../../api/vendorAPI";

const SuspendedVendor = () => {
  const [vendors, setVendors] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const loadSuspended = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const res = await getSuspendedVendors(pageNumber);

      const paginated = res.data?.data;
      const list = paginated?.data ?? [];

      setVendors(list);
      setPagination({
        current_page: paginated?.current_page || 1,
        last_page: paginated?.last_page || 1,
        total: paginated?.total || 0,
      });
      setPage(paginated?.current_page || 1);
    } catch (err) {
      console.error("Failed to load suspended vendors", err);
      Swal.fire("Error", "Failed to load suspended vendors.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuspended(1);
  }, []);

  
  const handleRestore = async (vendor) => {
  const result = await Swal.fire({
    title: "Restore vendor?",
    text: `Do you want to restore ${vendor.user?.name || "this vendor"}?`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Yes, restore",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#55A946",
  });

  if (!result.isConfirmed) return;

  try {
    await updateVendorStatus(vendor.id, "Approved");
    await loadSuspended(page);

    Swal.fire("Restored", "Vendor has been restored successfully.", "success");
  } catch (err) {
    console.error("Failed to restore vendor", err);
    Swal.fire("Error", "Failed to restore vendor.", "error");
  }
};

const handleDelete = async (vendor) => {
  const result = await Swal.fire({
    title: "Delete vendor?",
    text: "This action will delete vendor status. Are you sure?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#EA0C0C",
  });

  if (!result.isConfirmed) return;

  try {
    await deleteVendor(vendor?.user?.id);

    // optional: immediate UI update
    // setVendors((prev) => prev.filter((v) => v.id !== vendor.id));

    // ✅ abar oi page-er data reload
    await loadSuspended(page);
    Swal.fire("Deleted", "Vendor has been deleted successfully.", "success");
  } catch (err) {
    console.error("Failed to delete vendor", err);
    Swal.fire("Error", "Failed to delete vendor.", "error");
  }
};


  const hasPrev = pagination && page > 1;
  const hasNext = pagination && page < pagination.last_page;

  const goPrev = () => {
    if (!hasPrev) return;
    loadSuspended(page - 1);
  };

  const goNext = () => {
    if (!hasNext) return;
    loadSuspended(page + 1);
  };

  return (
    <div className="mt-7">
      <div className="mb-2">
        <h2 className="text-[26px] font-semibold md:mb-0">
          Suspended Vendor
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
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-6 text-center text-sm text-gray-500"
                >
                  Loading...
                </td>
              </tr>
            ) : vendors.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-6 text-center text-sm text-gray-500"
                >
                  No suspended vendors found.
                </td>
              </tr>
            ) : (
              vendors.map((item, index) => (
                <tr
                  key={item.id}
                  className={
                    index % 2 === 0
                      ? "bg-[#E6EEF6]" // even row same as design
                      : "bg-transparent"
                  }
                >
                  {/* Date: ekhane phone_verified_at use korlam, 
                      backend theke jodi alada suspended_at dao, oita use koro */}
                  <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
                    {item.user?.phone_verified_at
                      ? new Date(
                          item.user.phone_verified_at.replace(" ", "T")
                        ).toLocaleDateString()
                      : "-"}
                  </td>

                  <td className="px-3 py-4 whitespace-nowrap text-sm">
                    {item.user?.name || "-"}
                  </td>

                  <td className="px-3 py-4 whitespace-nowrap text-sm">
                    {item.address || "-"}
                  </td>

                  <td className="px-3 py-4 whitespace-nowrap text-sm">
                    {item.user?.phone || "-"}
                  </td>

                  <td className="px-3 py-4 whitespace-nowrap text-sm font-medium max-w-[200px]">
                    <div className="flex items-center space-x-2 flex-wrap">
                      {/* Delete icon */}
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
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
                        onClick={() => handleRestore(item)}
                        className="px-4 py-2 cursor-pointer font-medium text-xs bg-[#FF8C00] rounded-[10px] text-white"
                      >
                        Restore Request
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination bottom right */}
      {pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-end mt-4 space-x-4 text-sm">
          <button
            type="button"
            onClick={goPrev}
            disabled={!hasPrev}
            className={`px-3 py-1 rounded-[6px] border text-xs ${
              hasPrev
                ? "bg-white hover:bg-gray-50 cursor-pointer"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            Previous
          </button>

          <span className="text-gray-500">
            Page {page} of {pagination.last_page}
          </span>

          <button
            type="button"
            onClick={goNext}
            disabled={!hasNext}
            className={`px-3 py-1 rounded-[6px] border text-xs ${
              hasNext
                ? "bg-white hover:bg-gray-50 cursor-pointer"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default SuspendedVendor;
