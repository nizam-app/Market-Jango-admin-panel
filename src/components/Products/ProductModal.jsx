// src/components/product/ProductModal.jsx
import React, { useMemo, useState } from "react";
import { updateProductStatus } from "../../api/productApi";

const STATUS = {
  APPROVED: 1,
  DECLINED: 2,
};

const parseColors = (raw) => {
  if (!raw) return [];
  let str = "";

  if (Array.isArray(raw)) {
    str = raw.join(",");
  } else {
    str = String(raw);
  }

  return str
    .split(/[,\s]+/)
    .map((c) => c.replace(/"/g, "").trim())
    .filter(Boolean);
};

const parseSizes = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) raw = raw.join(",");
  return String(raw)
    .split(/[,\s]+/)
    .map((s) => s.replace(/"/g, "").trim())
    .filter(Boolean);
};

const normalizeColor = (c) => {
  // hex without # -> add #
  if (/^[0-9A-Fa-f]{3,6}$/.test(c)) return `#${c}`;
  return c;
};

const ProductModal = ({ product, closeModal, onStatusChange }) => {
  const [saving, setSaving] = useState(false);

  const colors = useMemo(() => parseColors(product?.color), [product]);
  const sizes = useMemo(() => parseSizes(product?.size), [product]);

  const mainImage =
    product?.image ||
    product?.images?.[0]?.image_path ||
    "https://i.ibb.co.com/xtzRb667/unsplash-3-Q3ts-J01nc.png";

  const price =
    product?.sell_price || product?.regular_price
      ? `$${product.sell_price || product.regular_price}`
      : "$0.00";

  const handleUpdateStatus = async (is_active) => {
    if (!product) return;

    const confirmText =
      is_active === STATUS.APPROVED
        ? "Are you sure you want to approve this product?"
        : "Are you sure you want to cancel/decline this product?";

    if (!window.confirm(confirmText)) return;

    try {
      setSaving(true);
      await updateProductStatus(product.id, is_active);

      alert(
        is_active === STATUS.APPROVED
          ? "Product approved successfully."
          : "Product declined successfully."
      );

      onStatusChange?.(product.id, is_active);
      closeModal();
    } catch (err) {
      console.error("Failed to update product status", err);
      alert("Failed to update product status");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      onClick={closeModal}
      className="fixed inset-0 bg-black/40 flex justify-center z-50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white mt-15 rounded-lg shadow-xl 
        w-full h-[85vh] max-w-4xl mx-4 overflow-hidden"
      >
        {/* Scrollable Content with hidden scrollbar */}
        <div className="h-full overflow-y-auto custom-scroll">
          {/* Header with Close Button */}
          <div className="relative">
            <img
              src={mainImage}
              alt={product.name || "Product"}
              className="w-full h-80 object-cover rounded-t-lg"
            />
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 w-[40px] h-[40px] bg-[#E2E2E2] bg-opacity-80 
                rounded-full text-[#000000] text-[26px] cursor-pointer"
            >
              &times;
            </button>
          </div>

          {/* Content Body */}
          <div className="p-6">
            {/* tags */}
            <div className="flex space-x-2 mb-4">
              {product.category?.name && (
                <span
                  className="bg-[#FF8C00]  
                    font-medium text-sm py-2.5 px-3.5  rounded-[100px]"
                >
                  {product.category.name}
                </span>
              )}
              <span
                className="bg-[#FF8C00]  
                  font-medium text-sm py-2.5 px-3.5  rounded-[100px]"
              >
                ID #{product.id}
              </span>
            </div>

            <h2 className="text-2xl font-medium mb-2">
              {product.name || "Product name"}
            </h2>
            <p className="font-normal mb-4">
              {product.description || "No description provided for this product."}
            </p>

            <p className="text-[26px] font-medium mb-4">{price}</p>

            <div className="flex flex-wrap gap-10 mb-6">
              <div>
                <p className="font-medium text-[22px]">Size</p>
                <div className="flex flex-wrap gap-2 rounded-[24px] px-5 py-3 bg-[#E7EBEE] min-h-[40px] mt-2">
                  {sizes.length === 0 ? (
                    <span className="text-xs text-gray-500">
                      No size info
                    </span>
                  ) : (
                    sizes.map((sz) => (
                      <span
                        key={sz}
                        className="px-3 text-[#0168B8] py-1 rounded-md cursor-pointer bg-white"
                      >
                        {sz}
                      </span>
                    ))
                  )}
                </div>
              </div>
              <div>
                <p className="font-medium text-[22px]">Color</p>
                <div className="flex flex-wrap gap-2 mt-2.5">
                  {colors.length === 0 ? (
                    <span className="text-xs text-gray-500">
                      No color info
                    </span>
                  ) : (
                    colors.map((c) => (
                      <span
                        key={c}
                        className="w-6 h-6 rounded-full border"
                        style={{ backgroundColor: normalizeColor(c) }}
                        title={c}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <p className="font-medium text-2xl mb-2">Specifications</p>
              <p className="mb-2">
                Product ID: <span className="font-medium">{product.id}</span>
              </p>
            </div>

            <div className="flex items-center space-x-4 mb-6">
              <img
                src="https://i.ibb.co.com/kgryPT7h/boy.png"
                alt="Store Avatar"
                className="w-14 h-14 rounded-full"
              />
              <div>
                <p className="font-normal text-sm">
                  {product.vendor?.user?.name || "Vendor"}
                </p>
                <p className="text-[#0D4373] font-normal text-xs">
                  {product.vendor?.address || "Address not available"}
                </p>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                disabled={saving}
                onClick={() => handleUpdateStatus(STATUS.DECLINED)}
                className="py-2 px-8 cursor-pointer bg-[#EA0C0C]
                   text-white font-medium rounded-[100px] disabled:opacity-60"
              >
                {saving ? "Please wait..." : "Canceled"}
              </button>
              <button
                disabled={saving}
                onClick={() => handleUpdateStatus(STATUS.APPROVED)}
                className="py-2 px-8 cursor-pointer bg-[#55A946]
                   text-[#051522] font-medium rounded-[100px] disabled:opacity-60"
              >
                {saving ? "Please wait..." : "Approved"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
