// src/pages/OutletManagement.jsx — Admin CRUD for outlets
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Plus, Edit3, Search, KeyRound } from "lucide-react";
import {
  getAdminOutlets,
  createAdminOutlet,
  updateAdminOutlet,
  updateAdminOutletStatus,
  resetAdminOutletPassword,
} from "../api/outletApi";

const BRAND = "#FF8C00";

const OutletManagement = () => {
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    password: "",
    default_max_concurrent_orders: 1,
    status: "active",
  });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getAdminOutlets({ search: search || undefined, per_page: 50 });
      const data = res.data?.data;
      setOutlets(Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []);
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err?.response?.data?.message || "Failed to load outlets" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setEditing(null);
    setForm({ name: "", phone: "", password: "", default_max_concurrent_orders: 1, status: "active" });
  };

  const handleEdit = (outlet) => {
    setEditing(outlet);
    setForm({
      name: outlet.name || "",
      phone: outlet.phone || "",
      password: "",
      default_max_concurrent_orders: outlet.default_max_concurrent_orders ?? 1,
      status: outlet.status || "active",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      Swal.fire({ icon: "warning", title: "Validation", text: "Name and phone are required." });
      return;
    }
    if (!editing && !form.password) {
      Swal.fire({ icon: "warning", title: "Validation", text: "Password is required for new outlet." });
      return;
    }
    try {
      setSaving(true);
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        default_max_concurrent_orders: Number(form.default_max_concurrent_orders) || 1,
        status: form.status,
      };
      if (form.password) payload.password = form.password;

      if (editing) {
        await updateAdminOutlet(editing.id, payload);
        Swal.fire({ toast: true, position: "top-end", icon: "success", title: "Outlet updated", showConfirmButton: false, timer: 1500 });
      } else {
        await createAdminOutlet(payload);
        Swal.fire({ toast: true, position: "top-end", icon: "success", title: "Outlet created", showConfirmButton: false, timer: 1500 });
      }
      resetForm();
      load();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err?.response?.data?.message || "Save failed" });
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (outlet) => {
    const next = outlet.status === "active" ? "inactive" : "active";
    try {
      await updateAdminOutletStatus(outlet.id, next);
      load();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err?.response?.data?.message || "Status update failed" });
    }
  };

  const handleResetPassword = async (outlet) => {
    const result = await Swal.fire({
      title: `Reset password`,
      html: `
        <p class="text-sm text-gray-600 mb-3">Set a new password for <strong>${outlet.name}</strong></p>
        <input id="swal-new-password" type="password" class="swal2-input" placeholder="New password (min 8 chars)" />
        <input id="swal-confirm-password" type="password" class="swal2-input" placeholder="Confirm new password" />
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Reset",
      confirmButtonColor: BRAND,
      preConfirm: () => {
        const new_password = document.getElementById("swal-new-password")?.value || "";
        const new_password_confirmation = document.getElementById("swal-confirm-password")?.value || "";
        if (new_password.length < 8) {
          Swal.showValidationMessage("Password must be at least 8 characters.");
          return false;
        }
        if (new_password !== new_password_confirmation) {
          Swal.showValidationMessage("Passwords do not match.");
          return false;
        }
        return { new_password, new_password_confirmation };
      },
    });

    if (!result.isConfirmed || !result.value) return;

    try {
      await resetAdminOutletPassword(outlet.id, result.value);
      Swal.fire({ toast: true, position: "top-end", icon: "success", title: "Password reset", showConfirmButton: false, timer: 1500 });
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.data?.new_password?.[0] || "Password reset failed";
      Swal.fire({ icon: "error", title: "Error", text: msg });
    }
  };

  return (
    <div className="space-y-6 px-6 py-4">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Outlet Management</h1>
        <p className="text-sm text-gray-600">Create outlets with phone + password. Outlets log in to manage orders and driver bins.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold mb-4">{editing ? "Edit Outlet" : "Create Outlet"}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Name *" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Phone *" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} required />
          <input type="password" className="border rounded-lg px-3 py-2 text-sm" placeholder={editing ? "New password (optional)" : "Password *"} value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
          <input type="number" min={1} max={20} className="border rounded-lg px-3 py-2 text-sm" placeholder="Max concurrent orders" value={form.default_max_concurrent_orders} onChange={(e) => setForm((f) => ({ ...f, default_max_concurrent_orders: e.target.value }))} />
          <select className="border rounded-lg px-3 py-2 text-sm" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm text-white rounded-lg" style={{ backgroundColor: BRAND }}>{saving ? "Saving..." : editing ? "Update" : "Create"}</button>
            {editing && <button type="button" onClick={resetForm} className="px-4 py-2 text-sm border rounded-lg">Cancel</button>}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b flex gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm" placeholder="Search outlets..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()} />
          </div>
          <button type="button" onClick={load} className="px-4 py-2 text-sm text-white rounded-lg" style={{ backgroundColor: BRAND }}>Search</button>
        </div>
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Phone</th>
              <th className="px-4 py-3 text-left">Max orders/driver</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
            ) : outlets.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No outlets yet.</td></tr>
            ) : outlets.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{o.name}</td>
                <td className="px-4 py-3">{o.phone}</td>
                <td className="px-4 py-3">{o.default_max_concurrent_orders ?? 1}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs ${o.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>{o.status}</span>
                </td>
                <td className="px-4 py-3 text-right flex justify-end gap-2">
                  <button type="button" onClick={() => handleEdit(o)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Edit"><Edit3 className="w-4 h-4" /></button>
                  <button type="button" onClick={() => handleResetPassword(o)} className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg" title="Reset password"><KeyRound className="w-4 h-4" /></button>
                  <button type="button" onClick={() => toggleStatus(o)} className="px-2 py-1 text-xs border rounded-lg">{o.status === "active" ? "Deactivate" : "Activate"}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OutletManagement;
