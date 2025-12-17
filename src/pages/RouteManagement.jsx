// src/pages/RouteManagement.jsx
import React, { useState } from 'react';
import AddDrivingRoute from '../components/drivers/AddDrivingRoute';
import DrivingRouteList from '../components/drivers/DrivingRouteList';

const RouteManagement = () => {
  const [routesVersion, setRoutesVersion] = useState(0);

  const handleRoutesReload = () => {
    setRoutesVersion((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          Route Management
        </h1>
        <p className="text-sm text-gray-600">
          Manage driving routes and locations for your delivery system
        </p>
      </div>

      <AddDrivingRoute onRoutesReload={handleRoutesReload} />
      <DrivingRouteList reloadKey={routesVersion} />
    </div>
  );
};

export default RouteManagement;

