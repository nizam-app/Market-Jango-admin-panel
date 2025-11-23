// src/components/product/ProductSection.jsx
import React, { useEffect, useState } from "react";
import ProductModal from "./ProductModal";
import { getRequestedProducts } from "../../api/productApi";

const ProductSection = () => {
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

  const [selectedProduct, setSelectedProduct] = useState(null);

  const loadRequests = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const res = await getRequestedProducts(pageNumber);

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
    } catch (err) {
      console.error("Failed to load pending products", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests(page);
  }, [page]);

  const openModal = (product) => {
    setSelectedProduct(product); // full row pathacchi
  };

  const closeModal = () => {
    setSelectedProduct(null);
  };

  // on approve / cancel -> list theke remove kore dibo
  const handleStatusChange = (id) => {
    setRows((prev) => prev.filter((item) => item.id !== id));
  };

  const handlePrevPage = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (page < pagination.last_page) setPage((prev) => prev + 1);
  };

  return (
    <>
      <div className="">
        <h2 className="text-2xl font-semibold mb-4">
          Product Requested vendor
        </h2>

        <div className="overflow-x-auto rounded-[8px] ">
          <table className="min-w-full ">
            <thead className="bg-white">
              <tr>
                <th className="p-2 text-left font-normal tracking-wider">Date</th>
                <th className="p-2 text-left font-normal tracking-wider">
                  Vendor Name
                </th>
                <th className="p-2 text-left font-normal tracking-wider">
                  Product Name
                </th>
                <th className="p-2 text-left font-normal tracking-wider">
                  Location
                </th>
                <th className="p-2 text-left font-normal tracking-wider">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y-[5px] divide-white">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-6 text-center text-sm text-gray-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-6 text-center text-sm text-gray-500"
                  >
                    No pending product requests found.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id}>
                    {/* Date */}
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-normal ">
                      {row.created_at
                        ? new Date(row.created_at).toLocaleString()
                        : "-"}
                    </td>

                    {/* Vendor name */}
                    <td className="px-2 py-4 whitespace-nowrap text-sm font-normal">
                      {row.vendor?.user?.name || "-"}
                    </td>

                    {/* Product name */}
                    <td className="px-2 py-4 whitespace-nowrap text-sm font-normal">
                      {row.name}
                    </td>

                    {/* Vendor address / location */}
                    <td className="px-2 py-4 whitespace-nowrap text-sm font-normal">
                      {row.vendor?.address || "-"}
                    </td>

                    <td className="px-2 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => openModal(row)}
                          className="px-4 py-2 cursor-pointer font-medium text-xs  bg-[#FF8C00] 
                          rounded-[10px] text-white"
                        >
                          See Details
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
      </div>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          closeModal={closeModal}
          onStatusChange={handleStatusChange}
        />
      )}
    </>
  );
};

export default ProductSection;
