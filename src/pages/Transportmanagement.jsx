// src/pages/Transportmanagement.jsx
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
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

  const fetchTransports = async (page = 1) => {
    try {
      setLoading(true);
      const res = await transportApi.getTransports(page);

      const payload = res.data?.data;
      if (payload) {
        setTransports(payload.data || []);
        setPagination({
          current_page: payload.current_page,
          last_page: payload.last_page,
          per_page: payload.per_page,
          total: payload.total,
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

  const handlePageChange = (page) => {
    if (
      page < 1 ||
      page > pagination.last_page ||
      page === pagination.current_page
    ) {
      return;
    }
    fetchTransports(page);
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

      // Refresh the list
      await fetchTransports(pagination.current_page);

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

      fetchTransports(pagination.current_page);
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
