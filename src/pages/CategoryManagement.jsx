// src/pages/CategoryManagement.jsx
// Structure: form (top) + table (bottom) with search, export, bulk delete
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Plus, Edit3, Trash2, Search, UploadCloud, Download } from "lucide-react";
import categoryApi from "../api/categoryApi";

const BRAND = "#FF8C00";

const getApiErrorMessage = (err, fallback) => {
  const isNetworkError =
    err?.message === "Network Error" ||
    !err?.response ||
    err?.code === "ERR_NETWORK" ||
    err?.code === "ECONNABORTED";
  if (isNetworkError) {
    return "Cannot reach the server. Check that the API is running and the proxy/base URL is correct (see vite.config.js or axiosClient baseURL).";
  }
  return err?.response?.data?.message || err?.message || fallback;
};

const slugify = (text) => {
  if (!text) return "";
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");
};

const CategoryManagement = () => {
  const PER_PAGE = 10;
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    per_page: PER_PAGE,
    current_page: 1,
    last_page: 1,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [editingCategory, setEditingCategory] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [parentOptions, setParentOptions] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    parent_id: "",
    slug: "",
    meta_title: "",
    status: "Active",
    image: null,
    imagePreview: null,
  });

  const fetchCategories = async (pageNum = 1, search = "") => {
    try {
      setLoading(true);
      const res = await categoryApi.getCategories({
        page: pageNum,
        per_page: PER_PAGE,
        search: search.trim() || undefined,
      });
      const data = res.data?.data;
      const items = Array.isArray(data?.items) ? data.items : [];
      const pag = data?.pagination || {};
      setCategories(items);
      setPagination({
        total: pag.total ?? 0,
        per_page: pag.per_page ?? PER_PAGE,
        current_page: pag.current_page ?? pageNum,
        last_page: pag.last_page ?? 1,
      });
    } catch (err) {
      console.error("Failed to fetch categories", err);
      setCategories([]);
      setPagination({ total: 0, per_page: PER_PAGE, current_page: 1, last_page: 1 });
      const msg = getApiErrorMessage(err, "Failed to load categories.");
      Swal.fire({ icon: "error", title: "Error", text: msg, confirmButtonColor: BRAND });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories(page, searchQuery);
  }, [page, searchQuery]);

  const fetchParentOptions = async () => {
    try {
      const res = await categoryApi.getParentOptions();
      const data = res.data?.data;
      let list = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
      if (list.length === 0) {
        const listRes = await categoryApi.getCategories({ page: 1, per_page: 200 });
        const listData = listRes.data?.data;
        list = Array.isArray(listData?.items) ? listData.items : Array.isArray(listData) ? listData : [];
      }
      setParentOptions(list);
    } catch (err) {
      console.error("Failed to fetch parent options", err);
      try {
        const listRes = await categoryApi.getCategories({ page: 1, per_page: 200 });
        const listData = listRes.data?.data;
        const list = Array.isArray(listData?.items) ? listData.items : Array.isArray(listData) ? listData : [];
        setParentOptions(list);
      } catch (fallbackErr) {
        console.error("Fallback parent options failed", fallbackErr);
        setParentOptions([]);
      }
    }
  };

  useEffect(() => {
    fetchParentOptions();
  }, []);

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    setSearchQuery(searchInput);
    setPage(1);
  };

  const flatList = categories;

  const getSubcategoryCount = (parentId) => {
    if (!parentId) return 0;
    return flatList.filter((c) => Number(c.parent_id) === Number(parentId)).length;
  };

  const getSecondLevelCount = (categoryId) => {
    const childIds = flatList.filter((c) => Number(c.parent_id) === Number(categoryId)).map((c) => c.id);
    return flatList.filter((c) => childIds.includes(Number(c.parent_id))).length;
  };

  const resetForm = () => {
    setEditingCategory(null);
    setForm({
      name: "",
      description: "",
      parent_id: "",
      slug: "",
      meta_title: "",
      status: "Active",
      image: null,
      imagePreview: null,
    });
  };

  const loadCategoryIntoForm = (cat) => {
    setEditingCategory(cat);
    const img = cat.image ?? cat.icon ?? (Array.isArray(cat.images) && cat.images[0]) ?? null;
    setForm({
      name: cat.name || "",
      description: cat.description || "",
      parent_id: cat.parent_id ?? "",
      slug: cat.slug || slugify(cat.name),
      meta_title: cat.meta_title || "",
      status: cat.status === "Inactive" ? "Inactive" : "Active",
      image: null,
      imagePreview: img,
    });
  };

  const handleNameChange = (name) => {
    setForm((f) => ({
      ...f,
      name,
      slug: editingCategory ? f.slug : slugify(name) || f.slug,
    }));
  };

  const buildFormData = () => {
    const name = (form.name || "").trim();
    const description = (form.description || "").trim();
    const slug = (form.slug || "").trim() || slugify(name);
    const meta_title = (form.meta_title || "").trim();
    const parent_id = form.parent_id ? Number(form.parent_id) : null;
    const status = form.status || "Active";

    const fd = new FormData();
    fd.append("name", name);
    fd.append("description", description);
    fd.append("slug", slug);
    fd.append("meta_title", meta_title);
    fd.append("parent_id", parent_id === null ? "" : String(parent_id));
    fd.append("status", status);
    if (form.image) {
      fd.append("images[]", form.image);
    }
    return fd;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = (form.name || "").trim();
    if (!name) {
      Swal.fire({ icon: "warning", title: "Validation", text: "Name of category is required.", confirmButtonColor: BRAND });
      return;
    }
    try {
      setSaving(true);
      const formData = buildFormData();
      if (editingCategory?.id) {
        await categoryApi.updateCategory(editingCategory.id, formData);
        Swal.fire({ toast: true, position: "top-end", icon: "success", title: "Category updated.", showConfirmButton: false, timer: 1800 });
      } else {
        await categoryApi.createCategory(formData);
        Swal.fire({ toast: true, position: "top-end", icon: "success", title: "Category created.", showConfirmButton: false, timer: 1800 });
      }
      resetForm();
      fetchCategories(page, searchQuery);
      fetchParentOptions();
    } catch (err) {
      const msg = getApiErrorMessage(err, "Failed to save category.");
      Swal.fire({ icon: "error", title: "Error", text: msg, confirmButtonColor: BRAND });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat) => {
    const result = await Swal.fire({
      title: "Permanent delete",
      text: `"${cat.name}" will be permanently deleted. This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
    });
    if (!result.isConfirmed) return;
    try {
      await categoryApi.deleteCategory(cat.id);
      Swal.fire({ toast: true, position: "top-end", icon: "success", title: "Category deleted.", showConfirmButton: false, timer: 1800 });
      resetForm();
      fetchCategories(page, searchQuery);
      fetchParentOptions();
    } catch (err) {
      const msg = getApiErrorMessage(err, "Failed to delete category.");
      Swal.fire({ icon: "error", title: "Error", text: msg, confirmButtonColor: BRAND });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      Swal.fire({ icon: "warning", title: "No selection", text: "Select categories to delete.", confirmButtonColor: BRAND });
      return;
    }
    const result = await Swal.fire({
      title: "Delete multiple",
      text: `Permanently delete ${selectedIds.length} category(ies)? This cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
    });
    if (!result.isConfirmed) return;
    try {
      for (const id of selectedIds) {
        await categoryApi.deleteCategory(id);
      }
      setSelectedIds([]);
      Swal.fire({ toast: true, position: "top-end", icon: "success", title: "Categories deleted.", showConfirmButton: false, timer: 1800 });
      fetchCategories(page, searchQuery);
      fetchParentOptions();
    } catch (err) {
      const msg = getApiErrorMessage(err, "Failed to delete.");
      Swal.fire({ icon: "error", title: "Error", text: msg, confirmButtonColor: BRAND });
    }
  };

  const handleExport = () => {
    const headers = ["Name", "Slug", "Parent", "Subcategory count", "2nd level count", "Items", "Status"];
    const rows = flatList.map((c) => {
      const parent = flatList.find((p) => Number(p.id) === Number(c.parent_id));
      return [
        c.name || "",
        c.slug || "",
        parent?.name || "—",
        getSubcategoryCount(c.id),
        getSecondLevelCount(c.id),
        c.products_count ?? c.items_count ?? 0,
        c.status || "Active",
      ];
    });
    const csv = [headers.join(","), ...rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "categories-export.csv";
    a.click();
    URL.revokeObjectURL(url);
    Swal.fire({ toast: true, position: "top-end", icon: "success", title: "List exported.", showConfirmButton: false, timer: 1500 });
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const allDisplayedSelected = flatList.length > 0 && flatList.every((c) => selectedIds.includes(c.id));
  const toggleSelectAll = () => {
    if (allDisplayedSelected) {
      const displayedIds = new Set(flatList.map((c) => c.id));
      setSelectedIds((prev) => prev.filter((id) => !displayedIds.has(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...flatList.map((c) => c.id)])]);
    }
  };

  const getParentName = (cat) => {
    if (cat.parent_name) return cat.parent_name;
    if (!cat.parent_id) return "—";
    const p = flatList.find((c) => Number(c.id) === Number(cat.parent_id));
    return p?.name || "—";
  };

  return (
    <div className="space-y-6 px-6 py-4">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">Category Management</h1>
        <p className="text-sm text-gray-600">
          Create and manage categories and subcategories. Hierarchy: Category → Subcategory → 2nd subcategory.
        </p>
      </div>

      {/* ——— Form (top) ——— */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-base font-semibold text-gray-800">
            {editingCategory ? "Edit Category" : "Add / Edit Category"}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name of category <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Men Shirt"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/50"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug / URL</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder="url-friendly (auto from name)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SEO (Meta title)</label>
              <input
                type="text"
                value={form.meta_title}
                onChange={(e) => setForm((f) => ({ ...f, meta_title: e.target.value }))}
                placeholder="Meta title for search engines"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Category description"
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/50 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parent category</label>
              <div className="flex gap-2">
                <select
                  value={String(form.parent_id ?? "")}
                  onChange={(e) => setForm((f) => ({ ...f, parent_id: e.target.value }))}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/50"
                >
                  <option value="">— None (root) —</option>
                  {parentOptions
                    .filter((c) => !editingCategory || c.id !== editingCategory.id)
                    .map((c) => (
                      <option key={c.id} value={String(c.id)}>{c.name || c.label || `Category ${c.id}`}</option>
                    ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setForm((f) => ({ ...f, name: "", parent_id: "" }));
                  }}
                  className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
                  title="Clear to add new root category"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/50"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image / Icon</label>
            <div className="flex items-center gap-4">
              {form.imagePreview && (
                <div className="w-16 h-16 rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                  <img src={form.imagePreview} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <label className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-sm">
                <UploadCloud className="w-4 h-4 text-gray-500" />
                <span>Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      setForm((f) => ({ ...f, image: file, imagePreview: url }));
                    }
                  }}
                />
              </label>
            </div>
          </div>

          {editingCategory && (
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <div>
                <span className="text-sm text-gray-600">Delete / Archive: </span>
                <button
                  type="button"
                  onClick={() => handleDelete(editingCategory)}
                  className="text-sm text-red-600 hover:underline ml-1"
                >
                  Permanent delete with warning
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            {editingCategory && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white rounded-lg hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: BRAND }}
            >
              {saving ? "Saving..." : editingCategory ? "Update" : "Activate"}
            </button>
          </div>
        </form>
      </div>

      {/* ——— Table (bottom) ——— */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border-b border-gray-200">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-sm flex gap-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search categories..."
              className="flex-1 pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/50"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90"
              style={{ backgroundColor: BRAND }}
            >
              Search
            </button>
          </form>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="w-4 h-4" />
              Export list
            </button>
            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={handleBulkDelete}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4" />
                Delete multiple ({selectedIds.length})
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={allDisplayedSelected}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Category name / Image</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Slug / URL</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Parent category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Subcategory</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">2 sub category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Number of items</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-500">Loading...</td>
                </tr>
              ) : flatList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-500">
                    {searchQuery.trim() ? "No categories match your search." : "No categories yet. Add one in the form above."}
                  </td>
                </tr>
              ) : (
                flatList.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50/50">
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(cat.id)}
                        onChange={() => toggleSelect(cat.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {(cat.image || cat.icon) && (
                          <div className="w-10 h-10 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex-shrink-0">
                            <img src={cat.image || cat.icon} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <span className="text-sm font-medium text-gray-900">{cat.name || "—"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{cat.slug || "—"}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{getParentName(cat)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{getSubcategoryCount(cat.id)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{getSecondLevelCount(cat.id)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{cat.products_count ?? cat.items_count ?? 0}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => loadCategoryIntoForm(cat)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(cat)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {pagination.total > 0 && (
          <div className="px-4 py-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-600">
              Showing {((pagination.current_page - 1) * pagination.per_page) + 1}–{Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total} ({pagination.per_page} per page)
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.current_page <= 1}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600 px-1">
                Page {pagination.current_page} of {pagination.last_page}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(pagination.last_page, p + 1))}
                disabled={pagination.current_page >= pagination.last_page}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
        <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-500">
          Note: Export list, delete multiple (select rows and use "Delete multiple").
        </div>
      </div>
    </div>
  );
};

export default CategoryManagement;
