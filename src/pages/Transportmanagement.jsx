// src/pages/Transportmanagement.jsx
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import TransportList from "../components/TransportList";
import transportApi from "../api/transportApi";

const Transportmanagement = () => {
  const [transports, setTransports] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });
  const [loading, setLoading] = useState(false);

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
      />
    </div>
  );
};

export default Transportmanagement;
