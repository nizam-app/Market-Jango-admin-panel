// src/pages/DriverManagement.jsx
import React, { useState, useEffect } from "react";
import {
  Plus,
  MoreVertical,
  Info,
  CarFront,
  Trash2,
  Edit3,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

import DriverModal from "../components/drivers/DriverModal";
import { getRoutes } from "../api/routeApi";
import {
  getDriversByStatus,
  createDriver,
  updateDriverStatus,
} from "../api/driverApiUpdate";
import { updateUserInfo } from "../api/userApi";
import axiosClient from "../api/axiosClient";

const BRAND = "#FF8C00";
const STATUS_TABS = ["All", "Approved", "Pending", "Rejected"];

// ---- API item -> table row map ----
const mapApiDriverToRow = (item) => {
  const d = item.driver || {};

  return {
    id: item.id, // user id (React er key)
    driverId: d.id ?? null, // status-update API er jonno

    name: item.name || "Unnamed driver",
    email: item.email || "",
    vehicleType: d.car_name || "N/A",
    vehicleNumber: d.car_model || "N/A",
    licenseNumber: d.license_number || "—",
    numberOfRoutes: (d.routes && d.routes.length) ?? item.route_count ?? 0,
    status: item.status || "Pending", // "Approved" | "Pending" | "Rejected"
    rejectionReason: item.note || "",
    joinedDate: item.created_at || null,
  };
};

const mapPagedDriversResponse = (res) => {
  const payload = res?.data?.data || {};
  const rows = (payload.data || []).map(mapApiDriverToRow);

  return {
    rows,
    meta: {
      current_page: payload.current_page || 1,
      last_page: payload.last_page || 1,
      total: payload.total ?? rows.length,
      per_page: payload.per_page ?? rows.length,
    },
  };
};

const DriverManagement = () => {
  const [drivers, setDrivers] = useState([]);
  const [pageMeta, setPageMeta] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 10,
  });

  const [tabTotals, setTabTotals] = useState({
    All: 0,
    Approved: 0,
    Pending: 0,
    Rejected: 0,
  });

  const [activeFilter, setActiveFilter] = useState("All");
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [loadingCounts, setLoadingCounts] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);

  const [routes, setRoutes] = useState([]);
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);

  // ------------ ROUTES -------------
  useEffect(() => {
    async function loadRoutes() {
      try {
        const res = await getRoutes();
        setRoutes(res.data?.data || []);
      } catch (err) {
        console.error("Failed to load routes for driver modal", err);
      }
    }
    loadRoutes();
  }, []);

  // ------------ TAB TOTAL COUNTS -------------
  const loadTabCounts = async () => {
    try {
      setLoadingCounts(true);
      const [allRes, approvedRes, pendingRes, rejectedRes] =
        await Promise.all([
          getDriversByStatus("All", 1),
          getDriversByStatus("Approved", 1),
          getDriversByStatus("Pending", 1),
          getDriversByStatus("Rejected", 1),
        ]);

      const safeTotal = (res) => res?.data?.data?.total ?? 0;

      setTabTotals({
        All: safeTotal(allRes),
        Approved: safeTotal(approvedRes),
        Pending: safeTotal(pendingRes),
        Rejected: safeTotal(rejectedRes),
      });
    } catch (err) {
      console.error("Failed to load driver counts", err);
    } finally {
      setLoadingCounts(false);
    }
  };

  // ------------ LIST LOAD -------------
  const loadDriversForStatus = async (status, page = 1) => {
    try {
      setLoadingDrivers(true);
      const res = await getDriversByStatus(status, page);
      const { rows, meta } = mapPagedDriversResponse(res);
      setDrivers(rows);
      setPageMeta(meta);
    } catch (err) {
      console.error("Failed to fetch drivers", err);
      Swal.fire({
        icon: "error",
        title: "Failed to load drivers",
        text: "Please check the API or token.",
        confirmButtonColor: BRAND,
      });
    } finally {
      setLoadingDrivers(false);
    }
  };

  // initial load
  useEffect(() => {
    loadTabCounts();
    loadDriversForStatus("All", 1);
  }, []);

  // tab change -> reset to page 1
  useEffect(() => {
    loadDriversForStatus(activeFilter, 1);
  }, [activeFilter]);

  // outside click -> close menu
  useEffect(() => {
    if (openMenuId === null) return;

    const handleClickOutside = (event) => {
      const target = event.target;
      const isMenu = target.closest(".menu-container");
      const isTrigger = target.closest(".menu-trigger");
      if (!isMenu && !isTrigger) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuId]);

  const getStatusBadge = (statusRaw) => {
    const status = (statusRaw || "").toLowerCase();
    let classes =
      "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border";
    let label = statusRaw || "Unknown";
    let icon = null;

    if (status === "approved") {
      classes += " bg-green-50 text-green-700 border-green-100";
      label = "Approved";
      icon = <CheckCircle2 className="w-4 h-4" />;
    } else if (status === "pending") {
      classes += " bg-yellow-50 text-yellow-700 border-yellow-100";
      label = "Pending";
      icon = <Clock className="w-4 h-4" />;
    } else if (status === "rejected") {
      classes += " bg-red-50 text-red-700 border-red-100";
      label = "Rejected";
      icon = <XCircle className="w-4 h-4" />;
    } else {
      classes += " bg-gray-50 text-gray-700 border-gray-100";
    }

    return (
      <span className={classes}>
        {icon}
        {label}
      </span>
    );
  };

  // Get status classes for the dropdown pill
  const getStatusClasses = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-50 text-green-700 border border-green-200";
      case "Rejected":
        return "bg-red-50 text-red-700 border border-red-200";
      case "Pending":
      default:
        return "bg-yellow-50 text-yellow-700 border border-yellow-200";
    }
  };

  // Handle status selection from dropdown
  const handleStatusSelect = (driver, newStatus) => {
    if (!newStatus || driver.status === newStatus) return;
    
    if (!driver.driverId) {
      Swal.fire({
        icon: "warning",
        title: "Cannot update status",
        text: "This driver has no driver record yet.",
        confirmButtonColor: BRAND,
      });
      return;
    }

    changeStatusWithConfirm(driver, newStatus, newStatus);
  };

  // ------------ ADD DRIVER -------------
  const handleAddDriver = () => {
    setEditingDriver(null);
    setIsDriverModalOpen(true);
  };

  // ------------ STATUS CHANGE + NOTE (for reject) -------------
  const changeStatusWithConfirm = (row, newStatus, label) => {
    if (!row.driverId) {
      Swal.fire({
        icon: "warning",
        title: "Cannot update status",
        text: "This driver has no driver record yet.",
        confirmButtonColor: BRAND,
      });
      return;
    }

    const isReject = newStatus === "Rejected";

    Swal.fire({
      title: `Are you sure you want to ${label.toLowerCase()} this driver?`,
      text: `${row.name} will become "${label}".`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: label,
      cancelButtonText: "Cancel",
      confirmButtonColor: BRAND,
      ...(isReject
        ? {
          input: "textarea",
          inputLabel: "Rejection note",
          inputPlaceholder: "Write reason (optional)",
          inputAttributes: {
            rows: 3,
          },
        }
        : {}),
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      const note = isReject ? result.value || "" : "";

      try {
        await updateDriverStatus(row.driverId, newStatus, note);

        // list + counts refresh
        await Promise.all([
          loadDriversForStatus(activeFilter, pageMeta.current_page),
          loadTabCounts(),
        ]);

        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: `Driver marked as ${label}`,
          showConfirmButton: false,
          timer: 1800,
        });
      } catch (err) {
        console.error("Status update failed", err);
        Swal.fire({
          icon: "error",
          title: "Status update failed",
          text: "Please try again.",
          confirmButtonColor: BRAND,
        });
      }
    });
  };


  // ------------ DELETE -------------
  const handleDelete = async (driverId) => {
    const row = drivers.find((d) => d.id === driverId);
    if (!row) return;

    const result = await Swal.fire({
      title: "Delete driver?",
      text: `This will remove ${row.name} from the system. This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
    });

    if (!result.isConfirmed) return;

    try {
      Swal.showLoading();
      await axiosClient.delete(`/user/destroy/${driverId}`);
      Swal.close();

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Driver deleted successfully",
        showConfirmButton: false,
        timer: 1800,
      });

      // Refresh the list
      await Promise.all([
        loadDriversForStatus(activeFilter, pageMeta.current_page),
        loadTabCounts(),
      ]);
    } catch (err) {
      Swal.close();
      console.error("Delete driver failed", err);
      Swal.fire({
        icon: "error",
        title: "Delete failed",
        text: err?.response?.data?.message || err.message || "Could not delete driver",
        confirmButtonColor: BRAND,
      });
    }
  };

  // ------------ EDIT -------------
  const handleEdit = (row) => {
    setOpenMenuId(null);

    const mappedForModal = {
      ...row,
      carName: row.vehicleType || "",
      carModel: row.vehicleNumber || "",
      location: row.location || "",
      price: row.price || "",
      routeIds: row.routeIds || [],
    };

    setEditingDriver(mappedForModal);
    setIsDriverModalOpen(true);
  };

  // ------------ CREATE/EDIT DRIVER -------------
  const handleSaveDriver = async (modalData) => {
    try {
      const isEdit = !!modalData.id;
      
      Swal.fire({
        title: isEdit ? "Updating driver..." : "Creating driver...",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

      const formData = new FormData();
      
      // Only append non-empty values for edit mode
      if (modalData.name.trim()) formData.append("name", modalData.name);
      if (modalData.email.trim()) formData.append("email", modalData.email);
      if (modalData.phone.trim()) formData.append("phone", modalData.phone);
      if (modalData.password.trim()) formData.append("password", modalData.password);
      if (modalData.carName.trim()) formData.append("car_name", modalData.carName);
      if (modalData.carModel.trim()) formData.append("car_model", modalData.carModel);
      if (modalData.location.trim()) formData.append("location", modalData.location);
      if (modalData.price) formData.append("price", String(modalData.price));

      if (modalData.routeIds && modalData.routeIds.length > 0) {
        modalData.routeIds.forEach((id) => {
          formData.append("route_ids[]", String(id));
        });
      }

      if (modalData.files) {
        Array.from(modalData.files).forEach((file) => {
          formData.append("files[]", file);
        });
      }

      let resp;
      if (isEdit) {
        resp = await updateUserInfo(modalData.id, formData);
      } else {
        resp = await createDriver(formData);
      }

      Swal.close();

      await Promise.all([
        loadTabCounts(),
        loadDriversForStatus(activeFilter, pageMeta.current_page),
      ]);

      setIsDriverModalOpen(false);
      setEditingDriver(null);

      Swal.fire({
        icon: "success",
        title: resp.data?.message || (isEdit ? "Driver updated" : "Driver created"),
        confirmButtonColor: BRAND,
      });
    } catch (err) {
      console.error("save-driver error", err);
      Swal.close();

      const msg =
        err?.response?.data?.message ||
        err?.message ||
        (modalData.id ? "Failed to update driver." : "Failed to create driver.");

      Swal.fire({
        icon: "error",
        title: modalData.id ? "Update driver failed" : "Create driver failed",
        text: msg,
        confirmButtonColor: BRAND,
      });
    }
  };

  // ------------ PAGINATION -------------
  const handlePageChange = (direction) => {
    const { current_page, last_page } = pageMeta;
    let nextPage =
      direction === "next" ? current_page + 1 : current_page - 1;

    if (nextPage < 1 || nextPage > last_page) return;
    loadDriversForStatus(activeFilter, nextPage);
  };

  const fromIndex =
    pageMeta.total === 0
      ? 0
      : (pageMeta.current_page - 1) * pageMeta.per_page + 1;
  const toIndex =
    pageMeta.total === 0
      ? 0
      : Math.min(pageMeta.current_page * pageMeta.per_page, pageMeta.total);

  // ------------ RENDER -------------
  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleAddDriver}
              className="inline-flex items-center gap-2 px-6 py-3 
             bg-[#FF8C00] text-white rounded-lg 
             hover:bg-[#e57c00] transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              <span className="text-sm font-semibold tracking-wide">
                ADD DRIVER
              </span>
            </button>
          </div>
        </div>

        {/* Filter + Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${activeFilter === tab
                      ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  {tab === "All" ? "All Drivers" : tab}
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs">
                    {loadingCounts ? "…" : tabTotals[tab] ?? 0}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          {loadingDrivers ? (
            <p className="py-8 px-6 text-sm text-gray-500">
              Loading drivers...
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        Driver Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        Vehicle Info
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        License Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        Number of Routes
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        Status & Actions
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        Menu
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200">
                    {drivers.map((driver) => (
                      <tr
                        key={driver.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        {/* Date */}
                        <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                          {driver.joinedDate
                            ? new Date(
                              driver.joinedDate
                            ).toLocaleDateString()
                            : "-"}
                        </td>

                        {/* Driver details */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-semibold">
                              {driver.name?.charAt(0)?.toUpperCase() || "D"}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {driver.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {driver.email || "-"}
                              </p>

                              {driver.status === "Rejected" &&
                                driver.rejectionReason && (
                                  <div className="mt-1 flex items-start gap-1">
                                    <Info className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-xs text-red-600">
                                      {driver.rejectionReason}
                                    </p>
                                  </div>
                                )}
                            </div>
                          </div>
                        </td>

                        {/* Vehicle Info */}
                        <td className="px-6 py-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <CarFront className="w-4 h-4 text-gray-500" />
                              <p className="text-sm font-medium text-gray-900">
                                {driver.vehicleType}
                              </p>
                            </div>
                            <p className="text-sm text-gray-500">
                              {driver.vehicleNumber}
                            </p>
                          </div>
                        </td>

                        {/* License Number */}
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {driver.licenseNumber}
                        </td>

                        {/* Number of Routes */}
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {driver.numberOfRoutes}
                        </td>

                        {/* Status & Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusClasses(driver.status)}`}>
                              {driver.status === 'Approved' && <CheckCircle2 className="w-4 h-4" />}
                              {driver.status === 'Rejected' && <XCircle className="w-4 h-4" />}
                              {driver.status === 'Pending' && <Clock className="w-4 h-4" />}
                              {driver.status}
                            </span>

                            <select
                              value={driver.status}
                              onChange={(e) => handleStatusSelect(driver, e.target.value)}
                              className="border border-gray-300 rounded-md text-sm px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Approved">Approved</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                          </div>
                        </td>

                        {/* Menu */}
                        <td className="px-6 py-4 relative">
                          <div className="flex items-center justify-end">
                            <button
                              onClick={() =>
                                setOpenMenuId(
                                  openMenuId === driver.id ? null : driver.id
                                )
                              }
                              className="menu-trigger p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              type="button"
                            >
                              <MoreVertical className="w-5 h-5" />
                            </button>
                          </div>

                          {openMenuId === driver.id && (
                            <div className="menu-container absolute right-6 top-11 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[160px]">
                              <button
                                type="button"
                                onClick={() => handleEdit(driver)}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 rounded-t-lg"
                              >
                                <Edit3 className="w-4 h-4" />
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(driver.id)}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-b-lg"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {drivers.length === 0 && !loadingDrivers && (
                <div className="text-center py-12">
                  <p className="text-sm text-gray-500">No drivers found.</p>
                </div>
              )}

              {/* Pagination footer */}
              <div className="flex items-center justify-between px-6 py-4 border-top border-gray-100 border-t">
                <p className="text-xs text-gray-500">
                  Showing {fromIndex} to {toIndex} of {pageMeta.total} drivers
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">
                    Page {pageMeta.current_page} of {pageMeta.last_page}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handlePageChange("prev")}
                      disabled={
                        loadingDrivers || pageMeta.current_page <= 1
                      }
                      className={`px-3 py-1 text-xs rounded-md border ${loadingDrivers || pageMeta.current_page <= 1
                          ? "text-gray-400 border-gray-200 cursor-not-allowed"
                          : "text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePageChange("next")}
                      disabled={
                        loadingDrivers ||
                        pageMeta.current_page >= pageMeta.last_page
                      }
                      className={`px-3 py-1 text-xs rounded-md border ${loadingDrivers ||
                          pageMeta.current_page >= pageMeta.last_page
                          ? "text-gray-400 border-gray-200 cursor-not-allowed"
                          : "text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* MODAL */}
      {isDriverModalOpen && (
        <DriverModal
          driver={editingDriver}
          routes={routes}
          onSave={handleSaveDriver}
          onClose={() => {
            setIsDriverModalOpen(false);
            setEditingDriver(null);
          }}
        />
      )}
    </>
  );
};

export default DriverManagement;
