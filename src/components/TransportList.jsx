// src/components/TransportList.jsx
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Edit3,
  Trash2,
} from "lucide-react";

export default function TransportList({
  transports,
  loading,
  pagination,
  onPageChange,
  onUpdateStatus,
}) {
  const [openMenuId, setOpenMenuId] = useState(null);

  // Outside click detection for menu
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

  const handleStatusSelect = (transport, newStatus) => {
    const currentStatus = transport.user?.status || "Pending";
    if (!newStatus || currentStatus === newStatus) return;

    onUpdateStatus(transport, newStatus);
  };

  // Handle Edit
  const handleEdit = (transport) => {
    setOpenMenuId(null);
    Swal.fire({
      icon: 'info',
      title: 'Edit Transport',
      text: `Edit functionality for ${transport.user?.name || 'this transport'} will be implemented soon.`,
    });
  };

  // Handle Delete
  const handleDelete = async (transport) => {
    setOpenMenuId(null);
    
    const result = await Swal.fire({
      title: 'Delete transport?',
      text: `This will remove ${transport.user?.name || 'this transport'} from the system. This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
    });

    if (!result.isConfirmed) return;

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Transport deleted successfully',
      showConfirmButton: false,
      timer: 1800,
    });
    
    // TODO: Implement actual delete API call
    // await axiosClient.delete(`/user/destroy/${transport.id}`);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Loader bar */}
      {loading && (
        <div className="w-full h-1 bg-gray-100">
          <div className="h-1 w-1/3 bg-blue-500 animate-pulse" />
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-gray-700">Transport</th>
              <th className="px-6 py-3 text-left text-gray-700">Email</th>
              <th className="px-6 py-3 text-left text-gray-700">Phone</th>
              <th className="px-6 py-3 text-left text-gray-700">Status</th>
              <th className="px-6 py-3 text-left text-gray-700">Created</th>
              <th className="px-6 py-3 text-right text-gray-700">Menu</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {transports.map((item) => {
              const user = item.user || {};
              const status = user.status || "Pending";

              return (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* Transport info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-medium overflow-hidden">
                        {user.image ? (
                          <img
                            src={user.image}
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          (user.name || "?")
                            .charAt(0)
                            .toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="text-gray-900 font-medium">
                          {user.name || "N/A"}
                        </div>
                        <div className="text-xs text-gray-400">
                          ID: {item.id}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-6 py-4 text-gray-600">
                    {user.email || "-"}
                  </td>

                  {/* Phone */}
                  <td className="px-6 py-4 text-gray-600">
                    {user.phone || "-"}
                  </td>

                  {/* Status + select */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusClasses(
                          status
                        )}`}
                      >
                        {status === "Approved" && (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        {status === "Rejected" && (
                          <XCircle className="w-4 h-4" />
                        )}
                        {status === "Pending" && (
                          <Clock className="w-4 h-4" />
                        )}
                        {status}
                      </span>

                      <select
                        defaultValue={status}
                        onChange={(e) =>
                          handleStatusSelect(item, e.target.value)
                        }
                        className="border border-gray-300 rounded-md text-sm px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                  </td>

                  {/* Created date */}
                  <td className="px-6 py-4 text-gray-600">
                    {item.created_at
                      ? new Date(item.created_at).toLocaleDateString()
                      : "-"}
                  </td>

                  {/* Menu */}
                  <td className="px-6 py-4 relative">
                    <div className="flex items-center justify-end">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                        className="menu-trigger p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        type="button"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>

                    {openMenuId === item.id && (
                      <div className="menu-container absolute right-6 top-11 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[160px]">
                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 rounded-t-lg"
                        >
                          <Edit3 className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-b-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Empty state */}
      {!loading && transports.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No transports found.</p>
        </div>
      )}

      {/* Pagination */}
      {pagination.total > 0 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
          <div className="text-sm text-gray-500">
            Page {pagination.current_page} of {pagination.last_page} •{" "}
            {pagination.total} transports
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                onPageChange(pagination.current_page - 1)
              }
              disabled={pagination.current_page <= 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border rounded-md text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white"
            >
              <ChevronLeft className="w-4 h-4" />
              Prev
            </button>

            {Array.from(
              { length: pagination.last_page },
              (_, i) => i + 1
            ).map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`px-3 py-1.5 text-sm rounded-md border ${
                  page === pagination.current_page
                    ? "bg-blue-600 text-white border-blue-600"
                    : "text-gray-600 bg-white hover:bg-gray-100 border-gray-200"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() =>
                onPageChange(pagination.current_page + 1)
              }
              disabled={
                pagination.current_page >= pagination.last_page
              }
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border rounded-md text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
