// src/components/vendor/RequestedVendor.jsx
import { useEffect, useState } from "react";
import RequestedVendorModal from "./RequestedVendorModal";
import { getPendingVendors } from "../../api/vendorAPI";

const RequestedVendor = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [selectedVendor, setSelectedVendor] = useState(null);

  const loadVendors = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const res = await getPendingVendors(pageNumber);

      const pagination = res.data?.data || {};
      const list = pagination.data || [];

      setVendors(list);
      setPage(pagination.current_page || 1);
      setLastPage(pagination.last_page || 1);
    } catch (error) {
      console.error("Failed to load pending vendors", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendors(1);
  }, []);

  const openModal = (vendor) => {
    setSelectedVendor(vendor);
  };

  const closeModal = () => {
  setSelectedVendor(null);
  // modal bondho holেই current page এর data আবার load করব
  loadVendors(page);   // চাইলে সব সময় প্রথম পেজ চাইলে loadVendors(1)
};

  // approve / cancel এর পরে list থেকে ওই vendor remove করব
  const handleStatusChange = (vendorId) => {
    setVendors((prev) => prev.filter((v) => v.id !== vendorId));
  };

  const handlePrev = () => {
    if (page > 1) {
      loadVendors(page - 1);
    }
  };

  const handleNext = () => {
    if (page < lastPage) {
      loadVendors(page + 1);
    }
  };

  return (
    <>
      <div className="mt-7">
        <div className="mb-2">
          <h2 className="text-[26px] font-semibold md:mb-0">Requested Vendor</h2>
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
                    className="py-6 text-center text-sm text-gray-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : vendors.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-6 text-center text-sm text-gray-500"
                  >
                    No pending vendor requests found.
                  </td>
                </tr>
              ) : (
                vendors.map((item) => {
                  const user = item.user || {};

                  const rawDate = user.phone_verified_at || item.created_at;
                  const formattedDate = rawDate
                    ? new Date(rawDate).toLocaleDateString()
                    : "-";

                  return (
                    <tr
                      key={item.id}
                      className="odd:bg-transparent even:bg-white"
                    >
                      <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
                        {formattedDate}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm">
                        {user.name || item.business_name || "-"}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm">
                        {item.address || "-"}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm">
                        {user.phone || "-"}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm font-medium max-w-[220px]">
                        <div className="flex items-center space-x-2 flex-wrap">
                          
                          <button
                            onClick={() => openModal(item)}
                            className="px-4 py-2 cursor-pointer font-medium text-xs bg-[#FF8C00] rounded-[10px] text-white"
                          >
                            See Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-end gap-3 mt-4">
          <button
            onClick={handlePrev}
            disabled={page === 1 || loading}
            className={`px-3 py-1 rounded-[8px] text-sm border ${
              page === 1 || loading
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white hover:bg-gray-50"
            }`}
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {lastPage}
          </span>
          <button
            onClick={handleNext}
            disabled={page === lastPage || loading}
            className={`px-3 py-1 rounded-[8px] text-sm border ${
              page === lastPage || loading
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white hover:bg-gray-50"
            }`}
          >
            Next
          </button>
        </div>
      </div>

      {selectedVendor && (
        <RequestedVendorModal
          vendor={selectedVendor}
          closeModal={closeModal}
          onStatusChange={handleStatusChange}
        />
      )}
    </>
  );
};

export default RequestedVendor;
