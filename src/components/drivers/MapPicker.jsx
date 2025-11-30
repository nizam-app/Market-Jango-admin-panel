// src/components/common/MapPicker.jsx
import React from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";

const MapPicker = ({ onSelect }) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY", // এখানে তুমি env থেকে নেবে
  });

  const center = { lat: 23.7808875, lng: 90.2792371 }; // Dhaka

  if (!isLoaded) return <div>Loading map...</div>;

  const handleClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    // parent এ পাঠাও
    onSelect?.(lat, lng);
  };

  return (
    <GoogleMap
      zoom={12}
      center={center}
      mapContainerStyle={{ width: "100%", height: "300px" }}
      onClick={handleClick}
    >
      {/* চাইলে Marker দেখাতে পারো */}
    </GoogleMap>
  );
};

export default MapPicker;
