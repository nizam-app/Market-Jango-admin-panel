// src/pages/BuyerManagement.jsx
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import BuyerLists from "../components/BuyerLists";
import buyerApi from "../api/buyerApi";
import { BuyerModal } from "../components/buyers/BuyerModal";
import { updateUserInfo } from "../api/userApi";
import axiosClient from "../api/axiosClient";

const BuyerManagement = () => {
  const [buyers, setBuyers] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBuyer, setEditingBuyer] = useState(null);

  const fetchBuyers = async (page = 1) => {
    try {
      setLoading(true);
      const res = await buyerApi.getBuyers(page);

      const payload = res.data?.data; // Laravel response এর "data" object
      if (payload) {
        setBuyers(payload.data || []);
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
        title: "Failed to load buyers",
        text:
          error.response?.data?.message ||
          "Something went wrong while fetching buyers.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuyers(1);
  }, []);

  const handlePageChange = (page) => {
    if (
      page < 1 ||
      page > pagination.last_page ||
      page === pagination.current_page
    ) {
      return;
    }
    fetchBuyers(page);
  };

  const handleUpdateStatus = async (buyer, newStatus) => {
    try {
      const result = await Swal.fire({
        title: "Change status?",
        text: `Do you want to change status to "${newStatus}" for buyer "${buyer.user?.name}"?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, update",
        cancelButtonText: "Cancel",
      });

      if (!result.isConfirmed) return;

      const res = await buyerApi.updateBuyerStatus(buyer.id, newStatus);

      Swal.fire({
        icon: "success",
        title: "Status updated",
        text: res.data?.message || "Buyer status updated successfully.",
        timer: 1500,
        showConfirmButton: false,
      });

      const updatedBuyer = res.data?.data;

      setBuyers((prev) =>
        prev.map((b) => (b.id === updatedBuyer.id ? updatedBuyer : b))
      );
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Failed to update status",
        text:
          error.response?.data?.message ||
          "Something went wrong while updating buyer status.",
      });
    }
  };

  const handleEdit = (buyer) => {
    setEditingBuyer(buyer);
    setIsEditModalOpen(true);
  };

  const handleSaveBuyer = async (modalData) => {
    try {
      const isEdit = !!modalData.id;

      Swal.fire({
        title: isEdit ? "Updating buyer..." : "Creating buyer...",
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
      await fetchBuyers(pagination.current_page);

      setIsEditModalOpen(false);
      setEditingBuyer(null);

      Swal.fire({
        icon: "success",
        title: resp.data?.message || "Buyer updated successfully",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("save-buyer error", error);
      Swal.close();

      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update buyer.";

      Swal.fire({
        icon: "error",
        title: "Update buyer failed",
        text: msg,
      });
    }
  };

  const handleDelete = async (buyer) => {
    const buyerUserId = buyer.user_id || buyer.user?.id || buyer.id;
    const buyerName = buyer.user?.name || buyer.name || 'this buyer';

    const result = await Swal.fire({
      title: "Delete buyer?",
      text: `This will remove ${buyerName} from the system. This action cannot be undone.`,
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
      await axiosClient.delete(`/user/destroy/${buyerUserId}`);
      Swal.close();

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Buyer deleted successfully",
        showConfirmButton: false,
        timer: 1800,
      });

      fetchBuyers(pagination.current_page);
    } catch (err) {
      Swal.close();
      console.error("Delete buyer failed", err);
      Swal.fire({
        icon: "error",
        title: "Delete failed",
        text: err?.response?.data?.message || err.message || "Could not delete buyer",
      });
    }
  };

  return (
    <div className="px-6 py-4">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">
        Buyer Management
      </h1>

      <BuyerLists
        buyers={buyers}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onUpdateStatus={handleUpdateStatus}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Edit Modal */}
      {isEditModalOpen && (
        <BuyerModal
          buyer={editingBuyer}
          onSave={handleSaveBuyer}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingBuyer(null);
          }}
        />
      )}
    </div>
  );
};

export default BuyerManagement;
