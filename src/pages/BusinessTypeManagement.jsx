// src/pages/BusinessTypeManagement.jsx
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Plus, Edit3, Trash2, Search } from "lucide-react";
import businessTypeApi from "../api/businessTypeApi";

const BRAND = "#FF8C00";

const slugify = (text) =>
  String(text || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");

const BusinessTypeManagement = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    status: "Active",
    image: null,
  });

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await businessTypeApi.getBusinessTypes({
        search: searchQuery || undefined,
        per_page: 100,
      });
      const data = res.data?.data?.data || res.data?.data || [];
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.response?.data?.message || "Failed to load business types",
        confirmButtonColor: BRAND,
      });
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [searchQuery]);

  const resetForm = () => {
    setEditing(null);
    setForm({ name: "", slug: "", description: "", status: "Active", image: null });
  };

  const loadIntoForm = (row) => {
    setEditing(row);
    setForm({
      name: row.name || "",
      slug: row.slug || "",
      description: row.description || "",
      status: row.status || "Active",
      image: null,
    });
  };

  const buildFormData = () => {
    const fd = new FormData();
    fd.append("name", form.name.trim());
    fd.append("slug", (form.slug || slugify(form.name)).trim());
    fd.append("description", form.description || "");
    fd.append("status", form.status);
    if (form.image) fd.append("image", form.image);
    return fd;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      Swal.fire({ icon: "warning", title: "Name is required", confirmButtonColor: BRAND });
      return;
    }
    try {
      setSaving(true);
      const fd = buildFormData();
      if (editing?.id) {
        await businessTypeApi.updateBusinessType(editing.id, fd);
      } else {
        await businessTypeApi.createBusinessType(fd);
      }
      resetForm();
      fetchItems();
      Swal.fire({ toast: true, position: "top-end", icon: "success", title: "Saved", showConfirmButton: false, timer: 1500 });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Save failed",
        text: err?.response?.data?.message || "Could not save business type",
        confirmButtonColor: BRAND,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row) => {
    const confirm = await Swal.fire({
      title: "Delete business type?",
      text: `"${row.name}" will be removed.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
    });
    if (!confirm.isConfirmed) return;
    try {
      await businessTypeApi.deleteBusinessType(row.id);
      fetchItems();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Delete failed",
        text: err?.response?.data?.message || "Could not delete",
        confirmButtonColor: BRAND,
      });
    }
  };

  return (
    <div className="p-6 bg-[#f7f8fb] min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Business Type Management</h1>
        <p className="text-sm text-gray-500 mt-1">
          Vendors select business types at registration. Categories are created under each business type.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-5 mb-6 grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1">Name *</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: editing ? f.slug : slugify(e.target.value) }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Slug</label>
          <input className="w-full border rounded-lg px-3 py-2" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea className="w-full border rounded-lg px-3 py-2" rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select className="w-full border rounded-lg px-3 py-2" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Image</label>
          <input type="file" accept="image/*" onChange={(e) => setForm((f) => ({ ...f, image: e.target.files?.[0] || null }))} />
        </div>
        <div className="md:col-span-2 flex gap-2">
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white font-semibold" style={{ background: BRAND }}>
            <Plus size={16} /> {editing ? "Update" : "Create"} Business Type
          </button>
          {editing && (
            <button type="button" onClick={resetForm} className="px-4 py-2 rounded-lg border">
              Cancel edit
            </button>
          )}
        </div>
      </form>

      <div className="bg-white rounded-xl shadow-sm border p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSearchQuery(searchInput);
          }}
          className="flex gap-2 mb-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input className="w-full border rounded-lg pl-10 pr-3 py-2" placeholder="Search business types..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
          </div>
          <button type="submit" className="px-4 py-2 rounded-lg text-white font-semibold" style={{ background: BRAND }}>
            Search
          </button>
        </form>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-3">Name</th>
                  <th className="py-2 pr-3">Slug</th>
                  <th className="py-2 pr-3">Categories</th>
                  <th className="py-2 pr-3">Vendors</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row) => (
                  <tr key={row.id} className="border-b border-gray-50">
                    <td className="py-3 pr-3 font-medium">{row.name}</td>
                    <td className="py-3 pr-3">{row.slug}</td>
                    <td className="py-3 pr-3">{row.categories_count ?? 0}</td>
                    <td className="py-3 pr-3">{row.vendors_count ?? 0}</td>
                    <td className="py-3 pr-3">{row.status}</td>
                    <td className="py-3 pr-3">
                      <div className="flex gap-2">
                        <button type="button" onClick={() => loadIntoForm(row)} className="p-2 rounded border hover:bg-gray-50">
                          <Edit3 size={16} />
                        </button>
                        <button type="button" onClick={() => handleDelete(row)} className="p-2 rounded border text-red-600 hover:bg-red-50">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!items.length && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-gray-400">
                      No business types found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessTypeManagement;
