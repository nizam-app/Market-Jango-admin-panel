// src/pages/VisibilityManagement.jsx
// Integrated with Admin Visibility API: zones + vendor visibility.
import React, { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";
import { Plus, Search, Edit3, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import visibilityApi from "../api/visibilityApi";
import { getActiveVendors } from "../api/vendorAPI";

const BRAND = "#FF8C00";

const getApiErrorMessage = (err, fallback = "Something went wrong.") => {
  if (!err?.response && (err?.message === "Network Error" || err?.code === "ERR_NETWORK" || err?.code === "ECONNABORTED")) {
    return "Cannot reach the server. Check that the API is running and the proxy/base URL is correct.";
  }
  return err?.response?.data?.message || err?.message || fallback;
};

const VisibilityManagement = () => {
  const [zoneForm, setZoneForm] = useState({
    zone: "",
    state_district: "",
    town_city: "",
    status: "Active",
  });
  const [editingZoneId, setEditingZoneId] = useState(null);
  const [visibilityZones, setVisibilityZones] = useState([]);
  const [zonesPagination, setZonesPagination] = useState({
    total: 0,
    per_page: 15,
    current_page: 1,
    last_page: 1,
  });
  const [zonesPage, setZonesPage] = useState(1);
  const [visibilityZonesSearch, setVisibilityZonesSearch] = useState("");
  const [zonesSearchApplied, setZonesSearchApplied] = useState("");
  const [zonesLoading, setZonesLoading] = useState(true);
  const [zoneSaving, setZoneSaving] = useState(false);

  const [vendorsVisibility, setVendorsVisibility] = useState([]);
  const [vendorVisibilityPagination, setVendorVisibilityPagination] = useState({
    total: 0,
    per_page: 15,
    current_page: 1,
    last_page: 1,
  });
  const [vendorVisibilityPage, setVendorVisibilityPage] = useState(1);
  const [vendorsVisibilitySearch, setVendorsVisibilitySearch] = useState("");
  const [vendorVisibilitySearchApplied, setVendorVisibilitySearchApplied] = useState("");
  const [vendorVisibilityLoading, setVendorVisibilityLoading] = useState(true);
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const [vendorVisibilityForm, setVendorVisibilityForm] = useState({
    vendor_id: "",
    visibility_zone_id: "",
    is_active: true,
  });
  const [vendorVisibilitySaving, setVendorVisibilitySaving] = useState(false);
  const [zoneOptions, setZoneOptions] = useState([]);
  const [vendorOptions, setVendorOptions] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(false);

  const fetchZones = useCallback(
    async (pageNum = 1, search = "") => {
      setZonesLoading(true);
      try {
        const params = { page: pageNum, per_page: 15, search: search || undefined };
        const res = await visibilityApi.getZones(params);
        const data = res?.data?.data;
        const items = data?.items ?? [];
        const pagination = data?.pagination ?? {
          total: 0,
          per_page: 15,
          current_page: 1,
          last_page: 1,
        };
        setVisibilityZones(items);
        setZonesPagination(pagination);
      } catch (err) {
        Swal.fire({ icon: "error", title: "Error", text: getApiErrorMessage(err) });
      } finally {
        setZonesLoading(false);
      }
    },
    []
  );

  const fetchVendorVisibility = useCallback(
    async (pageNum = 1, search = "") => {
      setVendorVisibilityLoading(true);
      try {
        const params = { page: pageNum, per_page: 15, search: search || undefined };
        const res = await visibilityApi.getVendorVisibility(params);
        const data = res?.data?.data;
        const items = data?.items ?? [];
        const pagination = data?.pagination ?? {
          total: 0,
          per_page: 15,
          current_page: 1,
          last_page: 1,
        };
        setVendorsVisibility(items);
        setVendorVisibilityPagination(pagination);
      } catch (err) {
        Swal.fire({ icon: "error", title: "Error", text: getApiErrorMessage(err) });
      } finally {
        setVendorVisibilityLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchZones(zonesPage, zonesSearchApplied);
  }, [zonesPage, zonesSearchApplied, fetchZones]);

  useEffect(() => {
    fetchVendorVisibility(vendorVisibilityPage, vendorVisibilitySearchApplied);
  }, [vendorVisibilityPage, vendorVisibilitySearchApplied, fetchVendorVisibility]);

  const handleZoneSearchSubmit = (e) => {
    e.preventDefault();
    setZonesSearchApplied(visibilityZonesSearch.trim());
    setZonesPage(1);
  };

  const handleVendorVisibilitySearchSubmit = (e) => {
    e.preventDefault();
    setVendorVisibilitySearchApplied(vendorsVisibilitySearch.trim());
    setVendorVisibilityPage(1);
  };

  const resetZoneForm = () => {
    setZoneForm({
      zone: "",
      state_district: "",
      town_city: "",
      status: "Active",
    });
    setEditingZoneId(null);
  };

  const handleZoneSubmit = async (e) => {
    e.preventDefault();
    const { zone, state_district, town_city, status } = zoneForm;
    if (!zone?.trim() || !state_district?.trim() || !town_city?.trim()) {
      Swal.fire({ icon: "warning", title: "Required", text: "Zone, State/district and Town/city are required." });
      return;
    }
    setZoneSaving(true);
    try {
      const body = {
        zone: zone.trim(),
        state: state_district.trim(),
        town: town_city.trim(),
        status: status || "Active",
      };
      if (editingZoneId) {
        await visibilityApi.updateZone(editingZoneId, body);
        Swal.fire({ icon: "success", title: "Updated", text: "Visibility zone updated." });
      } else {
        await visibilityApi.createZone(body);
        Swal.fire({ icon: "success", title: "Created", text: "Visibility zone created." });
      }
      resetZoneForm();
      fetchZones(zonesPage, zonesSearchApplied);
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: getApiErrorMessage(err) });
    } finally {
      setZoneSaving(false);
    }
  };

  const handleEditZone = (row) => {
    setEditingZoneId(row.id);
    setZoneForm({
      zone: row.zone || "",
      state_district: row.state || "",
      town_city: row.town || "",
      status: row.status || "Active",
    });
  };

  const handleCancelEditZone = () => {
    resetZoneForm();
  };

  const handleDeleteZone = async (id) => {
    const { isConfirmed } = await Swal.fire({
      title: "Delete zone?",
      text: "This cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
    });
    if (!isConfirmed) return;
    try {
      await visibilityApi.deleteZone(id);
      Swal.fire({ icon: "success", title: "Deleted", text: "Visibility zone deleted." });
      if (editingZoneId === id) resetZoneForm();
      fetchZones(zonesPage, zonesSearchApplied);
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: getApiErrorMessage(err) });
    }
  };

  const loadZoneOptions = useCallback(async () => {
    try {
      const res = await visibilityApi.getZones({ per_page: 200, page: 1 });
      const items = res?.data?.data?.items ?? [];
      setZoneOptions(items);
    } catch {
      setZoneOptions([]);
    }
  }, []);

  const loadVendorOptions = useCallback(async () => {
    try {
      const res = await getActiveVendors(1);
      const pagination = res?.data?.data;
      const list = pagination?.data ?? [];
      setVendorOptions(list);
    } catch {
      setVendorOptions([]);
    }
  }, []);

  const openAddVendorModal = async () => {
    setVendorVisibilityForm({ vendor_id: "", visibility_zone_id: "", is_active: true });
    setShowAddVendorModal(true);
    setOptionsLoading(true);
    try {
      await Promise.all([loadZoneOptions(), loadVendorOptions()]);
    } finally {
      setOptionsLoading(false);
    }
  };

  const handleAddVendorVisibilitySubmit = async (e) => {
    e.preventDefault();
    const vendor_id = Number(vendorVisibilityForm.vendor_id);
    const visibility_zone_id = Number(vendorVisibilityForm.visibility_zone_id);
    if (!vendor_id || !visibility_zone_id) {
      Swal.fire({ icon: "warning", title: "Required", text: "Please select a vendor and a zone." });
      return;
    }
    setVendorVisibilitySaving(true);
    try {
      await visibilityApi.createVendorVisibility({
        vendor_id,
        visibility_zone_id,
        is_active: !!vendorVisibilityForm.is_active,
      });
      Swal.fire({ icon: "success", title: "Saved", text: "Vendor visibility saved." });
      setShowAddVendorModal(false);
      fetchVendorVisibility(vendorVisibilityPage, vendorVisibilitySearchApplied);
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: getApiErrorMessage(err) });
    } finally {
      setVendorVisibilitySaving(false);
    }
  };

  const handleToggleVendorVisibility = async (row) => {
    const next = !row.is_active;
    try {
      await visibilityApi.updateVendorVisibility(row.id, { is_active: next });
      Swal.fire({
        icon: "success",
        title: next ? "Activated" : "Deactivated",
        text: next ? "Vendor visibility activated." : "Vendor visibility deactivated.",
      });
      fetchVendorVisibility(vendorVisibilityPage, vendorVisibilitySearchApplied);
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: getApiErrorMessage(err) });
    }
  };

  const handleDeleteVendorVisibility = async (id) => {
    const { isConfirmed } = await Swal.fire({
      title: "Remove vendor from zone?",
      text: "This will remove the visibility assignment.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
    });
    if (!isConfirmed) return;
    try {
      await visibilityApi.deleteVendorVisibility(id);
      Swal.fire({ icon: "success", title: "Removed", text: "Vendor visibility removed." });
      fetchVendorVisibility(vendorVisibilityPage, vendorVisibilitySearchApplied);
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: getApiErrorMessage(err) });
    }
  };

  const getVendorDisplayName = (v) => {
    return v?.business_name || v?.user?.name || v?.user?.email || `Vendor #${v?.id ?? ""}`;
  };

  return (
    <div className="space-y-6 px-6 py-4">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-1 uppercase tracking-wide">
          Visibility by Admin Panel
        </h1>
        <p className="text-sm text-gray-600">Manage visibility zones and vendor visibility by zone.</p>
      </div>

      {/* ——— 1. Add zone ——— */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-base font-semibold text-gray-800">
            {editingZoneId ? "Edit zone" : "Add zone"}
          </h2>
        </div>
        <form onSubmit={handleZoneSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Zone</label>
            <input
              type="text"
              value={zoneForm.zone}
              onChange={(e) => setZoneForm((f) => ({ ...f, zone: e.target.value }))}
              placeholder="e.g. Uganda"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State / district</label>
            <input
              type="text"
              value={zoneForm.state_district}
              onChange={(e) => setZoneForm((f) => ({ ...f, state_district: e.target.value }))}
              placeholder="e.g. Kampala"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Town / city</label>
            <input
              type="text"
              value={zoneForm.town_city}
              onChange={(e) => setZoneForm((f) => ({ ...f, town_city: e.target.value }))}
              placeholder="e.g. Kawempe"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Active / delete</label>
            <select
              value={zoneForm.status}
              onChange={(e) => setZoneForm((f) => ({ ...f, status: e.target.value }))}
              className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/50"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={zoneSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white rounded-lg hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: BRAND }}
            >
              {editingZoneId ? "Update zone" : "Add zone"}
            </button>
            {editingZoneId && (
              <button
                type="button"
                onClick={handleCancelEditZone}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ——— 2. Visibility zones table ——— */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border-b border-gray-200">
          <form onSubmit={handleZoneSearchSubmit} className="relative flex-1 max-w-sm flex gap-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={visibilityZonesSearch}
              onChange={(e) => setVisibilityZonesSearch(e.target.value)}
              placeholder="Search by zone, state, town"
              className="flex-1 pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/50"
            />
            <button
              type="submit"
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Search
            </button>
          </form>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Zone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">State</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Town</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Action / Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {zonesLoading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-sm text-gray-500">
                    Loading…
                  </td>
                </tr>
              ) : visibilityZones.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-sm text-gray-500">
                    No visibility zones yet. Add one above.
                  </td>
                </tr>
              ) : (
                visibilityZones.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-sm text-gray-900">{row.zone}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{row.state}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{row.town}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleEditZone(row)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteZone(row.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg ml-1"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {zonesPagination.last_page > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 text-sm text-gray-600">
            <span>
              Page {zonesPagination.current_page} of {zonesPagination.last_page} ({zonesPagination.total} total)
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={zonesPage <= 1}
                onClick={() => setZonesPage((p) => p - 1)}
                className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={zonesPage >= zonesPagination.last_page}
                onClick={() => setZonesPage((p) => p + 1)}
                className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ——— 3. Vendors visibility table ——— */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border-b border-gray-200">
          <form onSubmit={handleVendorVisibilitySearchSubmit} className="relative flex-1 max-w-sm flex gap-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={vendorsVisibilitySearch}
              onChange={(e) => setVendorsVisibilitySearch(e.target.value)}
              placeholder="Search by zone, vendor, state, town"
              className="flex-1 pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/50"
            />
            <button
              type="submit"
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Search
            </button>
          </form>
          <button
            type="button"
            onClick={openAddVendorModal}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            style={{ backgroundColor: BRAND }}
          >
            <Plus className="w-4 h-4" />
            Add vendors visibility
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Vendor name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Zone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">State</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Town</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Action / Activate, deactivate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {vendorVisibilityLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-500">
                    Loading…
                  </td>
                </tr>
              ) : vendorsVisibility.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-500">
                    No vendor visibility yet. Use “Add vendors visibility” to add entries.
                  </td>
                </tr>
              ) : (
                vendorsVisibility.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.vendor_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{row.zone}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{row.state}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{row.town}</td>
                    <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-0">
                      <button
                        type="button"
                        onClick={() => handleToggleVendorVisibility(row)}
                        className="p-2 rounded-lg"
                        title={row.is_active ? "Deactivate" : "Activate"}
                      >
                        {row.is_active ? (
                          <ToggleRight className="w-5 h-5 text-green-600 hover:bg-green-50" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-gray-400 hover:bg-gray-100" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteVendorVisibility(row.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg ml-1"
                        title="Remove from zone"
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
        {vendorVisibilityPagination.last_page > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 text-sm text-gray-600">
            <span>
              Page {vendorVisibilityPagination.current_page} of {vendorVisibilityPagination.last_page} ({vendorVisibilityPagination.total} total)
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={vendorVisibilityPage <= 1}
                onClick={() => setVendorVisibilityPage((p) => p - 1)}
                className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={vendorVisibilityPage >= vendorVisibilityPagination.last_page}
                onClick={() => setVendorVisibilityPage((p) => p + 1)}
                className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Add vendors visibility */}
      {showAddVendorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Add vendors visibility</h3>
            <form onSubmit={handleAddVendorVisibilitySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                <select
                  value={vendorVisibilityForm.vendor_id}
                  onChange={(e) =>
                    setVendorVisibilityForm((f) => ({ ...f, vendor_id: e.target.value }))
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/50"
                >
                  <option value="">Select vendor</option>
                  {vendorOptions.map((v) => (
                    <option key={v.id} value={v.id}>
                      {getVendorDisplayName(v)}
                    </option>
                  ))}
                </select>
                {optionsLoading && <p className="text-xs text-gray-500 mt-1">Loading vendors…</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zone</label>
                <select
                  value={vendorVisibilityForm.visibility_zone_id}
                  onChange={(e) =>
                    setVendorVisibilityForm((f) => ({ ...f, visibility_zone_id: e.target.value }))
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/50"
                >
                  <option value="">Select zone</option>
                  {zoneOptions.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.zone} – {z.state}, {z.town}
                    </option>
                  ))}
                </select>
                {optionsLoading && <p className="text-xs text-gray-500 mt-1">Loading zones…</p>}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="vv_active"
                  checked={vendorVisibilityForm.is_active}
                  onChange={(e) =>
                    setVendorVisibilityForm((f) => ({ ...f, is_active: e.target.checked }))
                  }
                  className="rounded border-gray-300"
                />
                <label htmlFor="vv_active" className="text-sm text-gray-700">Active</label>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={vendorVisibilitySaving || optionsLoading}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50"
                  style={{ backgroundColor: BRAND }}
                >
                  {vendorVisibilitySaving ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddVendorModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisibilityManagement;
