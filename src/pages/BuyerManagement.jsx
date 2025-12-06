// src/pages/BuyerManagement.jsx
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import BuyerLists from "../components/BuyerLists";
import buyerApi from "../api/buyerApi";

const BuyerManagement = () => {
  const [buyers, setBuyers] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });
  const [loading, setLoading] = useState(false);

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
      />
    </div>
  );
};

export default BuyerManagement;
