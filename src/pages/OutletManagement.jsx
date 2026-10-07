// src/pages/OutletManagement.jsx — Admin CRUD for outlets
import React, { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Edit3, Search, KeyRound } from "lucide-react";
import {
  getAdminOutlets,
  createAdminOutlet,
  updateAdminOutlet,
  updateAdminOutletStatus,
  resetAdminOutletPassword,
} from "../api/outletApi";
import visibilityApi from "../api/visibilityApi";

const BRAND = "#FF8C00";

const emptyForm = () => ({
  name: "",
  phone: "",
  password: "",
  default_max_concurrent_orders: 1,
  status: "active",
  zone: "",
  state: "",
  town: "",
  latitude: "",
  longitude: "",
});

const itemsFromResponse = (res) => {
  const data = res?.data?.data;
  const items = data?.items ?? data;
  return Array.isArray(items) ? items.filter(Boolean) : [];
};

const OutletManagement = () => {
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const [zoneOptions, setZoneOptions] = useState([]);
  const [stateOptions, setStateOptions] = useState([]);
  const [townOptions, setTownOptions] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getAdminOutlets({ search: search || undefined, zone: search || undefined, per_page: 50 });
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

  useEffect(() => {
    const loadZones = async () => {
      try {
        const res = await visibilityApi.optionZones();
        setZoneOptions(itemsFromResponse(res));
      } catch (err) {
        console.error("Failed to load visibility zones", err);
        setZoneOptions([]);
      }
    };
    loadZones();
  }, []);

  const loadStates = useCallback(async (zone) => {
    if (!zone) {
      setStateOptions([]);
      return;
    }
    try {
      setLocationLoading(true);
      const res = await visibilityApi.optionStates(zone);
      setStateOptions(itemsFromResponse(res));
    } catch (err) {
      console.error("Failed to load states", err);
      setStateOptions([]);
    } finally {
      setLocationLoading(false);
    }
  }, []);

  const loadTowns = useCallback(async (zone, state) => {
    if (!zone || !state) {
      setTownOptions([]);
      return;
    }
    try {
      setLocationLoading(true);
      const res = await visibilityApi.optionTowns(zone, state);
      setTownOptions(itemsFromResponse(res));
    } catch (err) {
      console.error("Failed to load towns", err);
      setTownOptions([]);
    } finally {
      setLocationLoading(false);
    }
  }, []);

  const resetForm = () => {
    setEditing(null);
    setForm(emptyForm());
    setStateOptions([]);
    setTownOptions([]);
  };

  const handleEdit = async (outlet) => {
    setEditing(outlet);
    const zone = outlet.zone || "";
    const state = outlet.state || "";
    const town = outlet.town || "";
    setForm({
      name: outlet.name || "",
      phone: outlet.phone || "",
      password: "",
      default_max_concurrent_orders: outlet.default_max_concurrent_orders ?? 1,
      status: outlet.status || "active",
      zone,
      state,
      town,
      latitude: outlet.latitude ?? "",
      longitude: outlet.longitude ?? "",
    });
    if (zone) await loadStates(zone);
    if (zone && state) await loadTowns(zone, state);
  };

  const handleZoneChange = async (zone) => {
    setForm((f) => ({ ...f, zone, state: "", town: "" }));
    setTownOptions([]);
    await loadStates(zone);
  };

  const handleStateChange = async (state) => {
    setForm((f) => ({ ...f, state, town: "" }));
    await loadTowns(form.zone, state);
  };

  const handleTownChange = (town) => {
    setForm((f) => ({ ...f, town }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      Swal.fire({ icon: "warning", title: "Validation", text: "Name and phone are required." });
      return;
    }
    if (!form.town.trim()) {
      Swal.fire({ icon: "warning", title: "Validation", text: "Town is required." });
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
        zone: form.zone || null,
        state: form.state || null,
        town: form.town,
        latitude: form.latitude === "" ? null : Number(form.latitude),
        longitude: form.longitude === "" ? null : Number(form.longitude),
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

  const selectClass = "border rounded-lg px-3 py-2 text-sm bg-white";

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
          <select className={selectClass} value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            className={selectClass}
            value={form.zone}
            onChange={(e) => handleZoneChange(e.target.value)}
            disabled={locationLoading && !zoneOptions.length}
          >
            <option value="">Zone (optional)</option>
            {form.zone && !zoneOptions.includes(form.zone) && (
              <option value={form.zone}>{form.zone} (legacy)</option>
            )}
            {zoneOptions.map((z) => (
              <option key={z} value={z}>{z}</option>
            ))}
          </select>

          <select
            className={selectClass}
            value={form.state}
            onChange={(e) => handleStateChange(e.target.value)}
            disabled={!form.zone || locationLoading}
          >
            <option value="">{form.zone ? "State (optional)" : "Select zone first"}</option>
            {form.state && !stateOptions.includes(form.state) && (
              <option value={form.state}>{form.state} (legacy)</option>
            )}
            {stateOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            className={selectClass}
            value={form.town}
            onChange={(e) => handleTownChange(e.target.value)}
            disabled={!form.zone || !form.state || locationLoading}
            required
          >
            <option value="">
              {!form.zone ? "Select zone first" : !form.state ? "Select state first" : "Town *"}
            </option>
            {form.town && !townOptions.includes(form.town) && (
              <option value={form.town}>{form.town} (legacy)</option>
            )}
            {townOptions.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Latitude" value={form.latitude} onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value }))} />
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Longitude" value={form.longitude} onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value }))} />
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm text-white rounded-lg" style={{ backgroundColor: BRAND }}>{saving ? "Saving..." : editing ? "Update" : "Create"}</button>
            {editing && <button type="button" onClick={resetForm} className="px-4 py-2 text-sm border rounded-lg">Cancel</button>}
          </div>
        </form>
        <p className="mt-3 text-xs text-gray-500">
          Zone / State / Town come from Visibility Management (cascaded). Town is required.
        </p>
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
              <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Phone</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Location</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Max orders/driver</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
            ) : outlets.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No outlets found</td></tr>
            ) : (
              outlets.map((o) => (
                <tr key={o.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">{o.name}</td>
                  <td className="px-4 py-3">{o.phone}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {[o.zone, o.state, o.town].filter(Boolean).join(" / ") || "—"}
                  </td>
                  <td className="px-4 py-3">{o.default_max_concurrent_orders}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${o.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => handleEdit(o)} className="p-1.5 text-gray-500 hover:text-orange-600" title="Edit">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => handleResetPassword(o)} className="p-1.5 text-gray-500 hover:text-orange-600" title="Reset password">
                        <KeyRound className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleStatus(o)}
                        className="px-2 py-1 text-xs border rounded-lg hover:bg-gray-50"
                      >
                        {o.status === "active" ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OutletManagement;
