// src/components/vendor/AllVendor.jsx
import React, { useEffect, useMemo, useState } from "react";
import { getActiveVendors } from "../../api/vendorAPI";
import VendorModal from "./VendorModal";

const AllVendor = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedVendor, setSelectedVendor] = useState(null);

  const loadVendors = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const res = await getActiveVendors(pageNumber);

      const pagination = res.data?.data;
      const list = pagination?.data ?? [];

      setVendors(list);
      setPage(pagination?.current_page || 1);
      setLastPage(pagination?.last_page || 1);
    } catch (err) {
      console.error("Failed to load active vendors", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendors(1);
  }, []);

  const filteredVendors = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return vendors;
    return vendors.filter((v) => {
      const user = v.user || {};
      return (
        user.name?.toLowerCase().includes(q) ||
        user.email?.toLowerCase().includes(q) ||
        user.phone?.toLowerCase().includes(q) ||
        v.business_name?.toLowerCase().includes(q)
      );
    });
  }, [vendors, search]);

  const formatDate = (str) => {
    if (!str) return "-";
    try {
      return new Date(str).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return str;
    }
  };

  const handlePrev = () => {
    if (page > 1 && !loading) {
      loadVendors(page - 1);
    }
  };

  const handleNext = () => {
    if (page < lastPage && !loading) {
      loadVendors(page + 1);
    }
  };

  return (
    <>
      <div className="mt-7">
        {/* Header + search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
          <h2 className="text-[26px] font-semibold md:mb-0">
            All vendor list
          </h2>
          <div className="relative w-full md:w-auto">
            <input
              type="text"
              placeholder="Search for something"
              className="pl-10 pr-4 py-2 rounded-[100px] w-full md:w-64 bg-white
                         shadow-sm focus:outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
              ) : filteredVendors.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-6 text-center text-sm text-gray-500"
                  >
                    No vendors found.
                  </td>
                </tr>
              ) : (
                filteredVendors.map((item) => {
                  const user = item.user || {};
                  return (
                    <tr
                      key={item.id}
                      className="odd:bg-transparent even:bg-white"
                    >
                      <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
                        {formatDate(user.phone_verified_at)}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm">
                        {user.name || item.business_name}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm">
                        {item.address || "-"}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm">
                        {user.phone || "-"}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          className="bg-[#FF8C00] text-white font-medium text-sm w-full py-2 px-4 rounded-[10px] cursor-pointer"
                          onClick={() => setSelectedVendor(item)}
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
        <div className="flex justify-end gap-3 items-center mt-4 text-sm">
          <button
            onClick={handlePrev}
            disabled={page <= 1 || loading}
            className="px-4 py-2 rounded-[100px] border bg-white disabled:opacity-50 cursor-pointer"
          >
            Previous
          </button>
          <span className="text-gray-600">
            Page {page} of {lastPage}
          </span>
          <button
            onClick={handleNext}
            disabled={page >= lastPage || loading}
            className="px-4 py-2 rounded-[100px] border bg-white disabled:opacity-50 cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>

      {/* Modal */}
      {selectedVendor && (
        <VendorModal
          vendor={selectedVendor}
          onClose={() => setSelectedVendor(null)}
          onStatusChange={() => {
            // current page er data abar load korbo
            loadVendors(page);
          }}
        />
      )}
    </>
  );
};

export default AllVendor;
