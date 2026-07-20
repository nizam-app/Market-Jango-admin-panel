// src/pages/RouteManagement.jsx
import React from 'react';
import DeliveryChargeManagementSection from '../components/delivery/DeliveryChargeManagementSection';

const RouteManagement = () => {
  return (
    <div className="space-y-6 px-6 py-4">
      {/* <div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          Delivery Charge Management s
        </h1>
        <p className="text-sm text-gray-600">
          Manage zone routes and weight-based delivery charges
        </p>
      </div> */}

      <DeliveryChargeManagementSection defaultTab="charge-routes" standalone={false} showDashboard={false} />
    </div>
  );
};

export default RouteManagement;
