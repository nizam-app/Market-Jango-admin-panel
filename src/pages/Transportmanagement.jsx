// src/pages/Transportmanagement.jsx
import React, { useEffect, useState, useRef } from "react";
import Swal from "sweetalert2";
import { Search, X } from "lucide-react";
import TransportList from "../components/TransportList";
import transportApi from "../api/transportApi";
import { TransportModal } from "../components/transports/TransportModal";
import { updateUserInfo } from "../api/userApi";
import axiosClient from "../api/axiosClient";

const Transportmanagement = () => {
  const [transports, setTransports] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTransport, setEditingTransport] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimerRef = useRef(null);

  const fetchTransports = async (page = 1, search = "") => {
    try {
      setLoading(true);
      const res = await transportApi.getTransports(page);

      const payload = res.data?.data;
      if (payload) {
        const transportsData = payload.data || [];
        
        // Apply client-side filtering if search query exists
        let filteredTransports = transportsData;
        if (search.trim()) {
          const searchLower = search.toLowerCase();
          filteredTransports = transportsData.filter((transport) => {
            const user = transport.user || {};
            const name = (user.name || "").toLowerCase();
            const email = (user.email || "").toLowerCase();
            const phone = (user.phone || "").toLowerCase();
            
            return (
              name.includes(searchLower) ||
              email.includes(searchLower) ||
              phone.includes(searchLower)
            );
          });
        }
        
        setTransports(filteredTransports);
        setPagination({
          current_page: payload.current_page,
          last_page: payload.last_page,
          per_page: payload.per_page,
          total: search.trim() ? filteredTransports.length : payload.total,
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Failed to load transports",
        text:
          error.response?.data?.message ||
          "Something went wrong while fetching transports.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransports(1);
  }, []);

  // Auto-search with debounce when user types
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (searchQuery.trim()) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchTransports(1, searchQuery);
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  const handlePageChange = (page) => {
    if (
      page < 1 ||
      page > pagination.last_page ||
      page === pagination.current_page
    ) {
      return;
    }
    fetchTransports(page, searchQuery);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setIsSearching(searchQuery.trim() !== "");
    fetchTransports(1, searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setIsSearching(false);
  };

  const handleUpdateStatus = async (transport, newStatus) => {
    try {
      const result = await Swal.fire({
        title: "Change status?",
        text: `Do you want to change status to "${newStatus}" for transport "${transport.user?.name}"?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, update",
        cancelButtonText: "Cancel",
      });

      if (!result.isConfirmed) return;

      const res = await transportApi.updateTransportStatus(
        transport.id,
        newStatus
      );

      Swal.fire({
        icon: "success",
        title: "Status updated",
        text: res.data?.message || "Transport status updated successfully.",
        timer: 1500,
        showConfirmButton: false,
      });

      const updatedTransport = res.data?.data;

      setTransports((prev) =>
        prev.map((t) => (t.id === updatedTransport.id ? updatedTransport : t))
      );
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Failed to update status",
        text:
          error.response?.data?.message ||
          "Something went wrong while updating transport status.",
      });
    }
  };

  const handleEdit = (transport) => {
    setEditingTransport(transport);
    setIsEditModalOpen(true);
  };

  const handleSaveTransport = async (modalData) => {
    try {
      const isEdit = !!modalData.id;

      Swal.fire({
        title: isEdit ? "Updating transport..." : "Creating transport...",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

      const formData = new FormData();

      // Only append non-empty values
      if (modalData.name.trim()) formData.append("name", modalData.name);
      if (modalData.email.trim()) formData.append("email", modalData.email);
      if (modalData.phone.trim()) formData.append("phone", modalData.phone);
      if (modalData.password.trim()) formData.append("password", modalData.password);
      if (modalData.image) formData.append("image", modalData.image);

      const resp = await updateUserInfo(modalData.id, formData);

      Swal.close();

      // Refresh the list with current search query
      await fetchTransports(pagination.current_page, searchQuery);

      setIsEditModalOpen(false);
      setEditingTransport(null);

      Swal.fire({
        icon: "success",
        title: resp.data?.message || "Transport updated successfully",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("save-transport error", error);
      Swal.close();

      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update transport.";

      Swal.fire({
        icon: "error",
        title: "Update transport failed",
        text: msg,
      });
    }
  };

  const handleDelete = async (transport) => {
    const transportUserId = transport.user_id || transport.user?.id || transport.id;
    const transportName = transport.user?.name || transport.name || 'this transport';

    const result = await Swal.fire({
      title: "Delete transport?",
      text: `This will remove ${transportName} from the system. This action cannot be undone.`,
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
      await axiosClient.delete(`/user/destroy/${transportUserId}`);
      Swal.close();

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Transport deleted successfully",
        showConfirmButton: false,
        timer: 1800,
      });

      fetchTransports(pagination.current_page, searchQuery);
    } catch (err) {
      Swal.close();
      console.error("Delete transport failed", err);
      Swal.fire({
        icon: "error",
        title: "Delete failed",
        text: err?.response?.data?.message || err.message || "Could not delete transport",
      });
    }
  };

  return (
    <div className="px-6 py-4">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">
        Transport Management
      </h1>

      {/* Search Bar */}
      <div className="mb-6 bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <form onSubmit={handleSearch} className="flex gap-3 items-center">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Type to search transports by name, email, or phone..."
              className="w-full px-4 py-2.5 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </form>

        {isSearching && (
          <div className="mt-3 text-sm text-gray-600">
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Searching...
              </span>
            ) : (
              <span>
                Found <strong className="text-gray-900">{pagination.total}</strong> result{pagination.total !== 1 ? 's' : ''} for "<strong className="text-blue-600">{searchQuery}</strong>"
              </span>
            )}
          </div>
        )}
      </div>

      <TransportList
        transports={transports}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onUpdateStatus={handleUpdateStatus}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Edit Modal */}
      {isEditModalOpen && (
        <TransportModal
          transport={editingTransport}
          onSave={handleSaveTransport}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingTransport(null);
          }}
        />
      )}
    </div>
  );
};

export default Transportmanagement;
