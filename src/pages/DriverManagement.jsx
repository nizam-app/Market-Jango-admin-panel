// src/pages/DriverManagement.jsx
import React, { useMemo, useState, useEffect } from "react";
import {
  Plus,
  Check,
  X,
  Ban,
  MoreVertical,
  Info,
  CarFront,
  Trash2,
  Edit3,
} from "lucide-react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

import DriverModal from "../components/drivers/DriverModal";
import { getRoutes } from "../api/routeApi";

// Mock driver data (poro API diye replace korbe)
const initialDrivers = [
  {
    id: 1,
    name: "Rahim Uddin",
    email: "rahim.driver@example.com",
    vehicleType: "Mini Truck",
    vehicleNumber: "DHAKA-BA-1234",
    licenseNumber: "LIC-123456",
    numberOfRoutes: 12,
    status: "active", // active | pending | rejected
    rejectionReason: "",
    joinedDate: "2025-12-01T09:00:00Z",
  },
  {
    id: 2,
    name: "Karim Hossain",
    email: "karim.driver@example.com",
    vehicleType: "Bike",
    vehicleNumber: "DHAKA-HA-9876",
    licenseNumber: "LIC-654321",
    numberOfRoutes: 4,
    status: "pending",
    rejectionReason: "",
    joinedDate: "2025-12-05T10:30:00Z",
  },
  {
    id: 3,
    name: "Sumi Akter",
    email: "sumi.driver@example.com",
    vehicleType: "Van",
    vehicleNumber: "CTG-TA-4321",
    licenseNumber: "LIC-111222",
    numberOfRoutes: 8,
    status: "rejected",
    rejectionReason: "Documents not clear. Please re-upload.",
    joinedDate: "2025-11-25T15:15:00Z",
  },
];

const BRAND = "#2563eb"; // blue-600

const DriverManagement = () => {
  const [drivers, setDrivers] = useState(initialDrivers);
  const [activeFilter, setActiveFilter] = useState("all"); // all | active | pending | rejected
  const [openMenuId, setOpenMenuId] = useState(null);

  // 👉 new: route list for modal
  const [routes, setRoutes] = useState([]);

  // 👉 new: driver modal state
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);

  // Filtered list
  const filteredDrivers = useMemo(() => {
    if (activeFilter === "all") return drivers;
    return drivers.filter((d) => d.status === activeFilter);
  }, [drivers, activeFilter]);

  // menu open thakle bahire click korle close korar jonno
  useEffect(() => {
    if (openMenuId === null) return;

    const handleClickOutside = (event) => {
      const target = event.target;

      const isMenu = target.closest(".menu-container");
      const isTrigger = target.closest(".menu-trigger");

      // jodi kono menu / trigger er upor click na hoy
      if (!isMenu && !isTrigger) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuId]);

  // 👉 new: load routes for multi-select
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

  // Status badge UI
  const getStatusBadge = (status) => {
    let classes =
      "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border";
    let label = "";

    switch (status) {
      case "active":
        classes += " bg-green-50 text-green-700 border-green-100";
        label = "Active";
        break;
      case "pending":
        classes += " bg-yellow-50 text-yellow-700 border-yellow-100";
        label = "Pending";
        break;
      case "rejected":
        classes += " bg-red-50 text-red-700 border-red-100";
        label = "Rejected";
        break;
      default:
        classes += " bg-gray-50 text-gray-700 border-gray-100";
        label = status || "Unknown";
    }

    return <span className={classes}>{label}</span>;
  };

  // 👉 updated: Add Driver => modal open
  const handleAddDriver = () => {
    setEditingDriver(null); // create mode
    setIsDriverModalOpen(true);
  };

  // Helper to update status with SweetAlert confirmation
  const changeStatusWithConfirm = (driverId, newStatus, label) => {
    const driver = drivers.find((d) => d.id === driverId);
    if (!driver) return;

    Swal.fire({
      title: `Are you sure you want to ${label.toLowerCase()} this driver?`,
      text: `${driver.name} will become "${label}".`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: label,
      cancelButtonText: "Cancel",
      confirmButtonColor: BRAND,
    }).then((result) => {
      if (result.isConfirmed) {
        setDrivers((prev) =>
          prev.map((d) =>
            d.id === driverId
              ? {
                ...d,
                status: newStatus,
                rejectionReason:
                  newStatus === "rejected"
                    ? d.rejectionReason ||
                    "Rejected by admin. Please contact support."
                    : "",
              }
              : d
          )
        );

        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: `Driver marked as ${label}`,
          showConfirmButton: false,
          timer: 1800,
        });
      }
    });
  };

  const handleApprove = (driverId) =>
    changeStatusWithConfirm(driverId, "active", "Approved");
  const handleActivate = (driverId) =>
    changeStatusWithConfirm(driverId, "active", "Active");
  const handleReject = (driverId) =>
    changeStatusWithConfirm(driverId, "rejected", "Rejected");

  // Delete driver
  const handleDelete = (driverId) => {
    const driver = drivers.find((d) => d.id === driverId);
    if (!driver) return;

    Swal.fire({
      title: "Delete driver?",
      text: `This will remove ${driver.name} from the list.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
    }).then((result) => {
      if (result.isConfirmed) {
        setDrivers((prev) => prev.filter((d) => d.id !== driverId));

        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Driver deleted",
          showConfirmButton: false,
          timer: 1800,
        });
      }
    });
  };

  // 👉 updated: Edit driver => modal open with mapped data
  const handleEdit = (driver) => {
    setOpenMenuId(null);

    // table-er driver object theke modal er expected fields map korলাম
    const mappedForModal = {
      ...driver,
      carName: driver.vehicleType || "",
      carModel: driver.carModel || "",
      location: driver.location || "",
      price: driver.price || "",
      routeIds: driver.routeIds || [],
    };

    setEditingDriver(mappedForModal);
    setIsDriverModalOpen(true);
  };

  // 👉 new: DriverModal theke data save handle
  const handleSaveDriver = async (modalData) => {
    // এখানে পরে API call connect করতে পারো (create / update)
    // ekhoner jonno local state update korchi

    if (modalData.id) {
      // UPDATE
      setDrivers((prev) =>
        prev.map((d) =>
          d.id === modalData.id
            ? {
              ...d,
              name: modalData.name,
              email: modalData.email,
              vehicleType: modalData.carName,
              vehicleNumber: modalData.vehicleNumber || d.vehicleNumber,
              numberOfRoutes: modalData.numberOfRoutes,
              status: modalData.status,
            }
            : d
        )
      );
    } else {
      // CREATE
      const nextId =
        (drivers.length ? drivers[drivers.length - 1].id : 0) + 1;

      const newDriver = {
        id: nextId,
        name: modalData.name,
        email: modalData.email,
        vehicleType: modalData.carName,
        vehicleNumber: modalData.vehicleNumber || "",
        licenseNumber: "LIC-NEW",
        numberOfRoutes: modalData.numberOfRoutes,
        status: "pending",
        rejectionReason: "",
        joinedDate: new Date().toISOString(),
      };

      setDrivers((prev) => [...prev, newDriver]);
    }

    setIsDriverModalOpen(false);
    setEditingDriver(null);

    Swal.fire({
      icon: "success",
      title: modalData.id ? "Driver updated" : "Driver added",
      confirmButtonColor: BRAND,
    });
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header with Add Button */}
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

        {/* Filter Tabs + Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Filter Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveFilter("all")}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${activeFilter === "all"
                    ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                  }`}
              >
                All Drivers
                <span className="ml-2 inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs">
                  {drivers.length}
                </span>
              </button>

              <button
                onClick={() => setActiveFilter("active")}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${activeFilter === "active"
                    ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                  }`}
              >
                Active Drivers
                <span className="ml-2 inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs">
                  {drivers.filter((d) => d.status === "active").length}
                </span>
              </button>

              <button
                onClick={() => setActiveFilter("pending")}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${activeFilter === "pending"
                    ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                  }`}
              >
                Pending
                <span className="ml-2 inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs">
                  {drivers.filter((d) => d.status === "pending").length}
                </span>
              </button>

              <button
                onClick={() => setActiveFilter("rejected")}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${activeFilter === "rejected"
                    ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                  }`}
              >
                Rejected Drivers
                <span className="ml-2 inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs">
                  {drivers.filter((d) => d.status === "rejected").length}
                </span>
              </button>
            </div>
          </div>

          {/* Table */}
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
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Action
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Menu
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {filteredDrivers.map((driver) => (
                  <tr
                    key={driver.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Date */}
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {driver.joinedDate
                        ? new Date(driver.joinedDate).toLocaleDateString()
                        : "-"}
                    </td>

                    {/* Driver details */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-semibold">
                          {driver.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {driver.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {driver.email || "-"}
                          </p>

                          {driver.status === "rejected" &&
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

                    {/* Status */}
                    <td className="px-6 py-4">
                      {getStatusBadge(driver.status)}
                    </td>

                    {/* Action buttons */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {driver.status === "rejected" ? (
                          <button
                            onClick={() => handleActivate(driver.id)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors"
                            type="button"
                          >
                            <Check className="w-4 h-4" />
                            Activate
                          </button>
                        ) : driver.status === "pending" ? (
                          <>
                            <button
                              onClick={() => handleApprove(driver.id)}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors"
                              type="button"
                            >
                              <Check className="w-4 h-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(driver.id)}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors"
                              type="button"
                            >
                              <X className="w-4 h-4" />
                              Reject
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleReject(driver.id)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors"
                            type="button"
                          >
                            <Ban className="w-4 h-4" />
                            Reject
                          </button>
                        )}
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

          {/* Empty state */}
          {filteredDrivers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-sm text-gray-500">No drivers found.</p>
            </div>
          )}
        </div>
      </div>

      {/* 👉 Driver Modal mount ekhane */}
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
