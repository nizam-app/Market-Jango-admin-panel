// src/pages/RouteManagement.jsx
import React, { useState } from 'react';
import Swal from 'sweetalert2';
import AddDrivingRoute from '../components/drivers/AddDrivingRoute';
import DrivingRouteList from '../components/drivers/DrivingRouteList';
import DeliveryChargeManager from '../components/drivers/DeliveryChargeManager';
import { updateRoute, deleteRoute } from '../api/routeApi';

const RouteManagement = () => {
  const [routesVersion, setRoutesVersion] = useState(0);

  const handleRoutesReload = () => {
    setRoutesVersion((prev) => prev + 1);
  };

  // Handle Edit Route
  const handleEditRoute = async (route) => {
    const result = await Swal.fire({
      title: 'Edit Route',
      html: `<input id="route-name-input" class="swal2-input" value="${route.name}" placeholder="Route Name">`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Update',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#FF8C00',
      preConfirm: () => {
        const newName = document.getElementById('route-name-input').value;
        if (!newName || !newName.trim()) {
          Swal.showValidationMessage('Please enter a route name');
          return false;
        }
        return newName.trim();
      },
    });

    if (!result.isConfirmed) return;

    try {
      Swal.fire({
        title: 'Updating route...',
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

      const response = await updateRoute(route.id, result.value);

      Swal.close();

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: response.data?.message || 'Route updated successfully',
        showConfirmButton: false,
        timer: 1800,
      });

      handleRoutesReload();
    } catch (err) {
      Swal.close();
      console.error('Update route failed', err);
      Swal.fire({
        icon: 'error',
        title: 'Update failed',
        text: err?.response?.data?.message || err.message || 'Could not update route',
        confirmButtonColor: '#FF8C00',
      });
    }
  };

  // Handle Delete Route
  const handleDeleteRoute = async (route) => {
    const result = await Swal.fire({
      title: 'Delete route?',
      text: `This will remove "${route.name}" and all its locations. This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
    });

    if (!result.isConfirmed) return;

    try {
      Swal.fire({
        title: 'Deleting route...',
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

      const response = await deleteRoute(route.id);

      Swal.close();

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: response.data?.message || 'Route deleted successfully',
        showConfirmButton: false,
        timer: 1800,
      });

      handleRoutesReload();
    } catch (err) {
      Swal.close();
      console.error('Delete route failed', err);
      Swal.fire({
        icon: 'error',
        title: 'Delete failed',
        text: err?.response?.data?.message || err.message || 'Could not delete route',
        confirmButtonColor: '#FF8C00',
      });
    }
  };

  return (
    <div className="space-y-6 px-6 py-4">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          Route Management
        </h1>
        <p className="text-sm text-gray-600">
          Manage driving routes, locations, and delivery charges for your delivery system
        </p>
      </div>

      <AddDrivingRoute onRoutesReload={handleRoutesReload} />
      <DrivingRouteList 
        reloadKey={routesVersion} 
        onEdit={handleEditRoute}
        onDelete={handleDeleteRoute}
      />
      
      {/* Delivery Charge Management */}
      <div className="border-t border-gray-200 pt-6">
        <DeliveryChargeManager />
      </div>
    </div>
  );
};

export default RouteManagement;

