// src/pages/ZoneManagement.jsx — Admin CRUD for delivery zones (zones table)
import React, { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Edit3, Plus, Search, Trash2 } from "lucide-react";
import { createZone, deleteZone, getZones, updateZone } from "../api/adminApi";
import { LocationSearchInput } from "../components/vendor/LocationSearchInput";

const BRAND = "#FF8C00";
const CURRENCIES = ["UGX", "KES", "TZS", "RWF", "AED", "USD"];

const emptyForm = () => ({
  name: "",
  center_latitude: "",
  center_longitude: "",
  radius_km: "1",
  price: "0",
  payout_currency: "UGX",
  status: "Active",
});

const getApiErrorMessage = (err, fallback = "Something went wrong.") => {
  if (!err?.response && (err?.message === "Network Error" || err?.code === "ERR_NETWORK")) {
    return "Cannot reach the server. Check that the API is running.";
  }
  const data = err?.response?.data;
  if (data?.data && typeof data.data === "object") {
    const first = Object.values(data.data).flat()?.[0];
    if (first) return String(first);
  }
  return data?.message || err?.message || fallback;
};

const ZoneManagement = () => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [searchApplied, setSearchApplied] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 10,
  });
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [mapKey, setMapKey] = useState("new");

  const load = useCallback(async (pageNum = 1, searchTerm = searchApplied) => {
    try {
      setLoading(true);
      const res = await getZones({ perPage: 10, page: pageNum, search: searchTerm || undefined });
      const pag = res?.data?.data;
      const list = Array.isArray(pag?.data) ? pag.data : Array.isArray(pag) ? pag : [];
      setZones(list);
      setPage(pag?.current_page || pageNum);
      setMeta({
        current_page: pag?.current_page || pageNum,
        last_page: pag?.last_page || 1,
        total: pag?.total ?? list.length,
        per_page: pag?.per_page || 10,
      });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: getApiErrorMessage(err, "Failed to load zones") });
      setZones([]);
      setMeta({ current_page: 1, last_page: 1, total: 0, per_page: 10 });
    } finally {
      setLoading(false);
    }
  }, [searchApplied]);

  useEffect(() => {
    load(page, searchApplied);
  }, [page, searchApplied, load]);

  const applySearch = () => {
    setSearchApplied(search.trim());
    setPage(1);
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm());
    setMapKey(`new-${Date.now()}`);
  };

  const handleLocationSelect = ({ lat, lng }) => {
    setForm((f) => ({
      ...f,
      center_latitude: Number(lat).toFixed(7),
      center_longitude: Number(lng).toFixed(7),
    }));
  };

  const handleEdit = (zone) => {
    setEditingId(zone.id);
    setForm({
      name: zone.name || "",
      center_latitude: zone.center_latitude ?? "",
      center_longitude: zone.center_longitude ?? "",
      radius_km: String(zone.radius_km ?? "1"),
      price: String(zone.price ?? "0"),
      payout_currency: (zone.payout_currency || "UGX").toUpperCase(),
      status: zone.status || "Active",
    });
    setMapKey(`edit-${zone.id}-${Date.now()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      Swal.fire({ icon: "warning", title: "Validation", text: "Zone name is required." });
      return;
    }
    if (form.center_latitude === "" || form.center_longitude === "") {
      Swal.fire({
        icon: "warning",
        title: "Validation",
        text: "Pick a location on the map (or search) to set latitude and longitude.",
      });
      return;
    }

    const payload = {
      name: form.name.trim(),
      center_latitude: Number(form.center_latitude),
      center_longitude: Number(form.center_longitude),
      radius_km: Number(form.radius_km) || 0,
      price: Number(form.price) || 0,
      payout_currency: form.payout_currency || "UGX",
      status: form.status || "Active",
    };

    try {
      setSaving(true);
      if (editingId) {
        await updateZone(editingId, payload);
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Zone updated",
          showConfirmButton: false,
          timer: 1500,
        });
      } else {
        await createZone(payload);
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Zone created",
          showConfirmButton: false,
          timer: 1500,
        });
        setPage(1);
      }
      resetForm();
      await load(editingId ? page : 1, searchApplied);
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: getApiErrorMessage(err, "Save failed") });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (zone) => {
    const result = await Swal.fire({
      title: "Delete zone?",
      text: `Delete "${zone.name}" (#${zone.id})? Banners or payment settings linked to this id may stop matching.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Delete",
    });
    if (!result.isConfirmed) return;

    try {
      await deleteZone(zone.id);
      if (editingId === zone.id) resetForm();
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Zone deleted",
        showConfirmButton: false,
        timer: 1500,
      });
      const nextPage = zones.length <= 1 && page > 1 ? page - 1 : page;
      if (nextPage !== page) setPage(nextPage);
      else await load(page, searchApplied);
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: getApiErrorMessage(err, "Delete failed") });
    }
  };

  return (
    <div className="space-y-6 px-6 py-4">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Zone Management</h1>
        <p className="text-sm text-gray-600 mt-1">
          Delivery zones (`zones` table) used for banners, payment settings, and radius. Use the map to set the center;
          buyer address trees stay on Visibility.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-gray-800">
            {editingId ? `Edit zone #${editingId}` : "Add zone"}
          </h2>
          {editingId && (
            <button type="button" onClick={resetForm} className="text-sm text-gray-600 hover:text-gray-900">
              Cancel edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <LocationSearchInput
            key={mapKey}
            onLocationSelect={handleLocationSelect}
            initialLat={form.center_latitude !== "" ? Number(form.center_latitude) : null}
            initialLng={form.center_longitude !== "" ? Number(form.center_longitude) : null}
            radiusKm={form.radius_km}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
              Name *
              <input
                className="border rounded-lg px-3 py-2 text-sm"
                placeholder="e.g. UGANDA"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
                maxLength={50}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
              Radius (km) *
              <input
                type="number"
                min={0}
                step="0.01"
                className="border rounded-lg px-3 py-2 text-sm"
                value={form.radius_km}
                onChange={(e) => setForm((f) => ({ ...f, radius_km: e.target.value }))}
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
              Price *
              <input
                type="number"
                min={0}
                step="0.01"
                className="border rounded-lg px-3 py-2 text-sm"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
              Latitude
              <input
                type="number"
                step="any"
                className="border rounded-lg px-3 py-2 text-sm bg-gray-50"
                value={form.center_latitude}
                onChange={(e) => setForm((f) => ({ ...f, center_latitude: e.target.value }))}
                placeholder="From map"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
              Longitude
              <input
                type="number"
                step="any"
                className="border rounded-lg px-3 py-2 text-sm bg-gray-50"
                value={form.center_longitude}
                onChange={(e) => setForm((f) => ({ ...f, center_longitude: e.target.value }))}
                placeholder="From map"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
              Payout currency
              <select
                className="border rounded-lg px-3 py-2 text-sm bg-white"
                value={form.payout_currency}
                onChange={(e) => setForm((f) => ({ ...f, payout_currency: e.target.value }))}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
              Status
              <select
                className="border rounded-lg px-3 py-2 text-sm bg-white"
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </label>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-lg disabled:opacity-60"
              style={{ backgroundColor: BRAND }}
            >
              <Plus className="w-4 h-4" />
              {saving ? "Saving…" : editingId ? "Update zone" : "Create zone"}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="px-4 py-2.5 text-sm border rounded-lg">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
              placeholder="Search zones…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applySearch()}
            />
          </div>
          <button
            type="button"
            onClick={applySearch}
            className="px-4 py-2 text-sm text-white rounded-lg"
            style={{ backgroundColor: BRAND }}
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => load(page, searchApplied)}
            className="px-4 py-2 text-sm border rounded-lg"
          >
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Center</th>
                <th className="px-4 py-3 text-left">Radius</th>
                <th className="px-4 py-3 text-left">Price</th>
                <th className="px-4 py-3 text-left">Currency</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-gray-500">
                    Loading…
                  </td>
                </tr>
              ) : zones.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-gray-500">
                    No zones found.
                  </td>
                </tr>
              ) : (
                zones.map((z) => (
                  <tr key={z.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{z.id}</td>
                    <td className="px-4 py-3 font-medium">{z.name}</td>
                    <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                      {z.center_latitude}, {z.center_longitude}
                    </td>
                    <td className="px-4 py-3">{z.radius_km} km</td>
                    <td className="px-4 py-3">{z.price}</td>
                    <td className="px-4 py-3">{z.payout_currency || "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${
                          z.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {z.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-1">
                        <button
                          type="button"
                          onClick={() => handleEdit(z)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(z)}
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

        <div className="px-4 py-3.5 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-600 bg-gray-50/50">
          <span>
            Page <strong className="text-gray-800">{meta.current_page}</strong> of{" "}
            <strong className="text-gray-800">{meta.last_page}</strong>
            <span className="text-gray-400 mx-1">·</span>
            {meta.total} zones
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={loading || meta.current_page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-xl bg-white hover:bg-gray-50 disabled:opacity-40"
            >
              Prev
            </button>
            <button
              type="button"
              disabled={loading || meta.current_page >= meta.last_page}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 text-sm font-medium text-white rounded-xl disabled:opacity-40"
              style={{ backgroundColor: BRAND }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZoneManagement;
