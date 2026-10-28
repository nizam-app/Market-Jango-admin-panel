// src/components/product/ProductModal.jsx
import React, { useMemo, useState } from "react";
import { updateProductStatus } from "../../api/productApi";
import { promptProductStatusChange } from "../../utils/adminStatusChangeDialog";
import Swal from "sweetalert2";

const STATUS = {
  APPROVED: 1,
  DECLINED: 2,
};

/** Color / measurement options — API may return JSON array or comma-separated string. */
const parseOptionList = (raw) => {
  if (raw == null || raw === "") return [];
  if (Array.isArray(raw)) {
    return raw
      .map((item) => String(item).replace(/"/g, "").trim())
      .filter(Boolean);
  }
  return String(raw)
    .split(/[,;\s]+/)
    .map((s) => s.replace(/"/g, "").trim())
    .filter(Boolean);
};

const RESERVED_ATTR_KEYS = new Set([
  "color",
  "colour",
  "size",
  "sizes",
  "measurement",
]);

const humanizeAttributeLabel = (key) => {
  const k = String(key ?? "").trim();
  if (!k) return k;
  return k.charAt(0).toUpperCase() + k.slice(1);
};

/** Vendor `attributes` JSON: { "brand": ["apple"], "specification": ["color 50%"] } */
const parseAttributesMap = (raw) => {
  if (raw == null || raw === "") return {};
  let obj = raw;
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return {};
    try {
      obj = JSON.parse(trimmed);
    } catch {
      return {};
    }
  }
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return {};

  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = String(k).trim();
    if (!key) continue;
    let values = [];
    if (Array.isArray(v)) {
      values = v
        .map((item) => String(item).replace(/"/g, "").trim())
        .filter(Boolean);
    } else if (v != null && String(v).trim() !== "") {
      values = [String(v).replace(/"/g, "").trim()];
    }
    if (values.length) out[key] = values;
  }
  return out;
};

const formatScalarSpecValue = (v) => {
  if (v == null) return "";
  if (Array.isArray(v)) {
    return v.map((x) => String(x).trim()).filter(Boolean).join(", ");
  }
  if (typeof v === "object") {
    try {
      return JSON.stringify(v);
    } catch {
      return String(v);
    }
  }
  return String(v).trim();
};

const parseKeyValueMap = (raw) => {
  if (raw == null || raw === "") return [];
  let obj = raw;
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    try {
      obj = JSON.parse(trimmed);
    } catch {
      return [];
    }
  }
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return [];
  return Object.entries(obj)
    .filter(([k, v]) => k && formatScalarSpecValue(v) !== "")
    .map(([k, v]) => [String(k).trim(), formatScalarSpecValue(v)]);
};

/** All variant groups for admin review (color, measurement, + custom attribute pickers). */
const buildAttributeGroups = (product) => {
  const groups = [];
  const measurements = parseOptionList(product?.size ?? product?.measurement);
  if (measurements.length) {
    groups.push({
      id: "measurement",
      label: "Measurement",
      values: measurements,
      kind: "chips",
    });
  }

  const colors = parseOptionList(product?.color);
  if (colors.length) {
    groups.push({
      id: "color",
      label: "Color",
      values: colors,
      kind: "color",
    });
  }

  const extra = parseAttributesMap(product?.attributes);
  for (const [key, values] of Object.entries(extra)) {
    const lower = key.toLowerCase();
    if (RESERVED_ATTR_KEYS.has(lower)) continue;
    groups.push({
      id: `attr-${lower}`,
      label: humanizeAttributeLabel(key),
      values,
      kind: "chips",
    });
  }

  return groups;
};

const normalizeColor = (c) => {
  // hex without # -> add #
  if (/^[0-9A-Fa-f]{3,6}$/.test(c)) return `#${c}`;
  return c;
};

const ProductModal = ({ product, closeModal, onStatusChange }) => {
  const [saving, setSaving] = useState(false);

  const attributeGroups = useMemo(
    () => buildAttributeGroups(product),
    [product]
  );
  const specifications = useMemo(
    () => parseKeyValueMap(product?.specifications),
    [product]
  );

  const dimensionLine = useMemo(() => {
    const l = product?.length;
    const w = product?.width;
    const h = product?.height;
    if (l == null && w == null && h == null) return null;
    const unit = product?.dimension_unit || "cm";
    const parts = [l, w, h].filter((n) => n != null && n !== "");
    if (!parts.length) return null;
    return `${parts.join(" × ")} ${unit}`;
  }, [product]);

  const weightLine = useMemo(() => {
    const wt = product?.weight;
    if (wt == null || wt === "") return null;
    const unit = product?.weight_unit || "kg";
    return `${wt} ${unit}`;
  }, [product]);

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

    const isDecline = is_active === STATUS.DECLINED;
    const dialog = await promptProductStatusChange({
      productName: product.name,
      isDecline,
    });
    if (!dialog) return;

    try {
      setSaving(true);
      await updateProductStatus(product.id, is_active, dialog);

      await Swal.fire({
        icon: "success",
        title: isDecline ? "Product declined" : "Product approved",
        timer: 1500,
        showConfirmButton: false,
      });

      onStatusChange?.(product.id, is_active);
      closeModal();
    } catch (err) {
      console.error("Failed to update product status", err);
      Swal.fire({
        icon: "error",
        title: "Failed to update product status",
        text: err?.response?.data?.message || err.message,
      });
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

            <div className="mb-6">
              <p className="font-medium text-xl mb-3 text-[#343C6A]">
                Product attributes
              </p>
              {attributeGroups.length === 0 ? (
                <p className="text-sm text-gray-500 italic">
                  No attributes provided for this product.
                </p>
              ) : (
                <div className="flex flex-wrap gap-8">
                  {attributeGroups.map((group) => (
                    <div key={group.id} className="min-w-[140px] flex-1">
                      <p className="font-medium text-[22px]">{group.label}</p>
                      {group.kind === "color" ? (
                        <div className="flex flex-wrap gap-2 mt-2.5">
                          {group.values.map((c) => (
                            <span
                              key={c}
                              className="w-6 h-6 rounded-full border"
                              style={{ backgroundColor: normalizeColor(c) }}
                              title={c}
                            />
                          ))}
                        </div>
                      ) : (
                        <div
                          className="flex flex-wrap gap-2 rounded-[24px] px-5 py-3 bg-[#E7EBEE] min-h-[40px] mt-2"
                        >
                          {group.values.map((val) => (
                            <span
                              key={val}
                              className="px-3 text-[#0168B8] py-1 rounded-md bg-white text-sm"
                            >
                              {val}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-6 rounded-xl border border-gray-200 bg-[#F8FAFC] p-5">
              <p className="font-medium text-xl mb-3 text-[#343C6A]">
                Terms &amp; conditions
              </p>
              {product.terms_and_conditions &&
              String(product.terms_and_conditions).trim() ? (
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {String(product.terms_and_conditions).trim()}
                </p>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  No terms and conditions provided for this product.
                </p>
              )}
            </div>

            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
              <p className="font-medium text-xl mb-3 text-[#343C6A]">Specifications</p>
              <p className="text-sm text-gray-500 mb-3">
                Product ID: <span className="font-medium text-gray-800">{product.id}</span>
              </p>
              {(dimensionLine || weightLine) && (
                <ul className="text-sm text-gray-700 space-y-1 mb-3">
                  {dimensionLine && (
                    <li>
                      <span className="font-medium text-gray-800">Dimensions:</span> {dimensionLine}
                    </li>
                  )}
                  {weightLine && (
                    <li>
                      <span className="font-medium text-gray-800">Weight:</span> {weightLine}
                    </li>
                  )}
                </ul>
              )}
              {specifications.length === 0 ? (
                <p className="text-sm text-gray-500 italic">
                  No custom specifications provided for this product.
                </p>
              ) : (
                <dl className="grid gap-2 sm:grid-cols-2">
                  {specifications.map(([key, val]) => (
                    <div
                      key={key}
                      className="rounded-lg bg-[#F8FAFC] border border-gray-100 px-3 py-2"
                    >
                      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        {key}
                      </dt>
                      <dd className="text-sm font-medium text-[#343C6A] mt-0.5 break-words">
                        {val}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
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
