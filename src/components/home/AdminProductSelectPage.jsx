// src/pages/AdminProductSelectPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import {
  fetchCategories,
  fetchAdminProducts,
  updateCategoryTop,
  updateProductSelect,
} from "../../api/adminSelectAPI";

/** Common chip/list section for categories & products */
const SelectionBlock = ({
  title,
  placeholder,
  items,
  selectedKey,        // e.g. "is_top_category", "top_product", "new_item", "just_for_you"
  onToggle,
}) => {
  const [search, setSearch] = useState("");

  const filteredItems = useMemo(() => {
    const term = search.toLowerCase();
    return items.filter((item) =>
      (item.name || "").toLowerCase().includes(term)
    );
  }, [items, search]);

  return (
    <section className="mb-10">
      {/* heading + search */}
      <div className="flex flex-col md:flex-row justify-between gap-3 items-start md:items-center mb-4">
        <h2 className="text-[22px] md:text-[24px] font-semibold">
          {title}
        </h2>

        <div className="relative w-full md:w-64">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={placeholder}
            className="pl-10 pr-4 py-2 rounded-[100px] w-full bg-white shadow-sm focus:outline-none text-sm"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
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

      {/* chips */}
      <div className="flex flex-wrap gap-3">
        {filteredItems.length === 0 && (
          <p className="text-sm text-gray-500">No item found.</p>
        )}

        {filteredItems.map((item) => {
          const active = Number(item[selectedKey]) === 1;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onToggle(item)} // click = toggle 0/1
              className={`px-5 py-2 rounded-[100px] text-sm border flex items-center gap-2 transition
                ${
                  active
                    ? "bg-[#FF8C00] border-[#FF8C00] text-white"
                    : "bg-white border-[#FF8C00] text-[#FF8C00] hover:bg-[#FF8C00]/10"
                }
              `}
            >
              <span className="whitespace-nowrap">{item.name}</span>

              {active && (
                <span
                  className="w-4 h-4 rounded-full bg-white/30 flex items-center justify-center text-[11px]"
                  onClick={(e) => {
                    // jodi shudhu cross click kori, taholeo toggle hobe
                    e.stopPropagation();
                    onToggle(item);
                  }}
                >
                  ✕
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
};

/** Simple pagination component */
const Pagination = ({ meta, onChange }) => {
  const current = meta?.current_page || 1;
  const last = meta?.last_page || 1;

  return (
    <div className="mt-4 flex justify-end items-center gap-3 text-sm">
      <button
        type="button"
        disabled={current <= 1}
        onClick={() => onChange(current - 1)}
        className={`px-3 py-1 rounded border ${
          current <= 1
            ? "border-gray-200 text-gray-300 cursor-not-allowed"
            : "border-gray-300 text-gray-700 hover:bg-gray-100"
        }`}
      >
        Previous
      </button>
      <span className="text-gray-600">
        Page {current} of {last}
      </span>
      <button
        type="button"
        disabled={current >= last}
        onClick={() => onChange(current + 1)}
        className={`px-3 py-1 rounded border ${
          current >= last
            ? "border-gray-200 text-gray-300 cursor-not-allowed"
            : "border-gray-300 text-gray-700 hover:bg-gray-100"
        }`}
      >
        Next
      </button>
    </div>
  );
};

const AdminProductSelectPage = () => {
  // CATEGORY state
  const [categories, setCategories] = useState([]);
  const [categoryMeta, setCategoryMeta] = useState(null);
  const [categoryLoading, setCategoryLoading] = useState(false);

  // PRODUCT state
  const [products, setProducts] = useState([]);
  const [productMeta, setProductMeta] = useState(null);
  const [productLoading, setProductLoading] = useState(false);

  // --- load categories ---
  const loadCategories = async (page = 1) => {
    try {
      setCategoryLoading(true);
      const res = await fetchCategories(page);
      const pagination = res.data?.data;

      setCategories(pagination?.data || []);
      setCategoryMeta({
        current_page: pagination?.current_page,
        last_page: pagination?.last_page,
      });
    } catch (error) {
      console.error("Failed to load categories", error);
    } finally {
      setCategoryLoading(false);
    }
  };

  // --- load products ---
  const loadProducts = async (page = 1) => {
    try {
      setProductLoading(true);
      const res = await fetchAdminProducts(page);
      const pagination = res.data?.data;

      setProducts(pagination?.data || []);
      setProductMeta({
        current_page: pagination?.current_page,
        last_page: pagination?.last_page,
      });
    } catch (error) {
      console.error("Failed to load products", error);
    } finally {
      setProductLoading(false);
    }
  };

  useEffect(() => {
    loadCategories(1);
    loadProducts(1);
  }, []);

  // ---- toggle CATEGORY top ----
  const handleToggleCategoryTop = async (category) => {
    const current = Number(category.is_top_category) === 1;
    const newValue = current ? 0 : 1;

    try {
      await updateCategoryTop(category.id, newValue);
      setCategories((prev) =>
        prev.map((c) =>
          c.id === category.id ? { ...c, is_top_category: newValue } : c
        )
      );
    } catch (error) {
      console.error("Failed to update category", error);
    }
  };

  // ---- toggle PRODUCT fields (top / new / just_for_you) ----
  const handleToggleProductFlag = async (product, field) => {
    const current = Number(product[field]) === 1;
    const newValue = current ? 0 : 1;

    try {
      await updateProductSelect(product.id, { [field]: newValue });
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, [field]: newValue } : p
        )
      );
    } catch (error) {
      console.error(`Failed to update product ${field}`, error);
    }
  };

  return (
    <div className="mt-7">
      {/* ---------- TOP CATEGORIES ---------- */}
      <div className="mb-6">
        {categoryLoading ? (
          <p className="text-sm text-gray-500">Loading categories...</p>
        ) : (
          <>
            <SelectionBlock
              title="Select top Categories"
              placeholder="Search your Category"
              items={categories}
              selectedKey="is_top_category"
              onToggle={handleToggleCategoryTop}
            />

            <Pagination meta={categoryMeta} onChange={loadCategories} />
          </>
        )}
      </div>

      {/* ---------- PRODUCTS (3 sections use same products state) ---------- */}

      {productLoading ? (
        <p className="text-sm text-gray-500 mt-10">Loading products...</p>
      ) : (
        <>
          {/* Top Products */}
          <SelectionBlock
            title="Select Top Products"
            placeholder="Search your Product"
            items={products}
            selectedKey="top_product"
            onToggle={(product) =>
              handleToggleProductFlag(product, "top_product")
            }
          />

          {/* New item */}
          <SelectionBlock
            title="Select New item"
            placeholder="Search your item"
            items={products}
            selectedKey="new_item"
            onToggle={(product) =>
              handleToggleProductFlag(product, "new_item")
            }
          />

          {/* Just for you */}
          <SelectionBlock
            title="Select Just for you"
            placeholder="Search your product"
            items={products}
            selectedKey="just_for_you"
            onToggle={(product) =>
              handleToggleProductFlag(product, "just_for_you")
            }
          />

          <Pagination meta={productMeta} onChange={loadProducts} />
        </>
      )}
    </div>
  );
};

export default AdminProductSelectPage;
