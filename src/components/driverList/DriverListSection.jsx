// src/components/drivers/DriverListSection.jsx
import React, { useState } from 'react';
import DriverCard from './DriverCard';
import DriverSearchBar from './DriverSearchBar';
import { searchDriversByLocation } from '../../api/driverApi';
import { useNavigate } from "react-router";
import DriverDetailsModal2 from '../drivers/DriverDetailsModal2';


const DriverListSection = () => {
  const [pickup, setPickup] = useState('');
  const [drop, setDrop] = useState('');
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null); 
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!pickup.trim() || !drop.trim()) {
      alert('Please enter both pickup and destination location');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setHasSearched(true);

      const res = await searchDriversByLocation(
        pickup.trim(),
        drop.trim()
      );

      // New response: { status, message, data: [ { ...driver, user: {...} } ] }
      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      setDrivers(list);
    } catch (err) {
      console.error('Failed to search drivers', err);
      setError('Failed to fetch drivers. Please try again.');
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  };
    const goToAssignPage = (driver) => {
      console.log(driver, 'driver')
    if (!driver?.user_id) return;
    navigate(`/drivers/${driver.user_id}/assign-order`, {
      state: { driver }, 
    });
  };


  return (
    <div className="">
      {/* Search bar */}
      <DriverSearchBar
        pickup={pickup}
        drop={drop}
        onPickupChange={setPickup}
        onDropChange={setDrop}
        onSubmit={handleSearch}
        loading={loading}
      />

      {/* State text */}
      <div className="mt-6">
        {loading && (
          <p className="text-center text-sm text-gray-500">
            Searching drivers...
          </p>
        )}

        {!loading && error && (
          <p className="text-center text-sm text-red-500">{error}</p>
        )}

        {!loading && !error && hasSearched && drivers.length === 0 && (
          <p className="text-center text-sm text-gray-500">
            No drivers found for this route.
          </p>
        )}

        {!hasSearched && !loading && (
          <p className="text-center text-sm text-gray-400">
            Search with pickup & destination to see available drivers.
          </p>
        )}
      </div>

      {/* Result grid */}
     

            {!loading && drivers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {drivers.map((driver) => {
            const user = driver.user || {};
            const image =
              user.image ||
              "https://via.placeholder.com/80x80.png?text=Driver";

            return (
              <DriverCard
                key={driver.id}
                name={user.name || driver.car_name || "Driver"}
                phone={user.phone || "N/A"}
                address={driver.location || ""}
                price={driver.price ? `$  ${driver.price}` : ""}
                isOnline={user.is_online ?? false}
                image={image}
                onViewDetails={() => setSelectedDriver(driver)}
                onAssignOrder={() => goToAssignPage(driver)}
              />
            );
          })}
        </div>
      )}

      {/* ✅ driver details modal */}
      {selectedDriver && (
        <DriverDetailsModal2
          driver={selectedDriver}
          onClose={() => setSelectedDriver(null)}
          onAssign={() => {
            const d = selectedDriver;
            setSelectedDriver(null);
            goToAssignPage(d);
          }}
        />
      )}


    </div>
  );
};

export default DriverListSection;
