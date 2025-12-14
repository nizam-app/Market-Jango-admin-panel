// src/components/vendor/LocationSearchInput.jsx
import React, { useCallback, useState } from "react";
import { GoogleMap, MarkerF, useJsApiLoader } from "@react-google-maps/api";
import { Search, MapPin, Crosshair } from "lucide-react";
import Swal from "sweetalert2";
import { GOOGLE_MAPS_LOADER_OPTIONS } from "../../config/googleMapsConfig";

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY;

const containerStyle = {
  width: "100%",
  height: "260px",
  borderRadius: "12px",
  overflow: "hidden",
};

const defaultCenter = { lat: 23.8103, lng: 90.4125 }; // Dhaka

export function LocationSearchInput({ onLocationSelect }) {
  const [searchText, setSearchText] = useState("");
  const [center, setCenter] = useState(defaultCenter);
  const [markerPosition, setMarkerPosition] = useState(defaultCenter);
  const [isSearching, setIsSearching] = useState(false);

  // 🔹 সর্বত্র একই loader options ব্যবহার করছি
  const { isLoaded, loadError } = useJsApiLoader(GOOGLE_MAPS_LOADER_OPTIONS);

  const applyLocation = useCallback(
    (address, lat, lng) => {
      const coords = { lat, lng };
      setCenter(coords);
      setMarkerPosition(coords);

      if (onLocationSelect) {
        onLocationSelect({ address, lat, lng });
      }
    },
    [onLocationSelect]
  );

  const geocodeAddress = useCallback(
    async (address) => {
      if (!address.trim()) return;
      if (!MAPS_KEY) {
        Swal.fire({
          icon: "error",
          title: "Missing API key",
          text: "VITE_GOOGLE_MAPS_KEY is not configured.",
        });
        return;
      }

      try {
        setIsSearching(true);
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=${MAPS_KEY}`;

        const res = await fetch(url);
        const data = await res.json();

        if (data.status === "OK" && data.results[0]) {
          const result = data.results[0];
          const { lat, lng } = result.geometry.location;
          const formattedAddress = result.formatted_address;

          applyLocation(formattedAddress, lat, lng);
          setSearchText(formattedAddress);
        } else {
          Swal.fire({
            icon: "warning",
            title: "Location not found",
            text: "Please try a more specific address.",
          });
        }
      } catch (err) {
        console.error("Geocode error", err);
        Swal.fire({
          icon: "error",
          title: "Search failed",
          text: "Something went wrong while searching this address.",
        });
      } finally {
        setIsSearching(false);
      }
    },
    [applyLocation]
  );

  const reverseGeocode = useCallback(async (lat, lng) => {
    if (!MAPS_KEY) return "";

    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${MAPS_KEY}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.status === "OK" && data.results[0]) {
        return data.results[0].formatted_address;
      }
    } catch (err) {
      console.error("Reverse geocode error", err);
    }
    return "";
  }, []);

  const handleSearchClick = (e) => {
    e.preventDefault();
    geocodeAddress(searchText);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      geocodeAddress(searchText);
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      Swal.fire({
        icon: "error",
        title: "Not supported",
        text: "Geolocation is not supported in this browser.",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        const address = await reverseGeocode(lat, lng);
        applyLocation(address || "My current location", lat, lng);
        if (address) setSearchText(address);
      },
      (err) => {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "Location blocked",
          text: "Please allow location permission in your browser.",
        });
      }
    );
  };

  const handleMapClick = async (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    const address = await reverseGeocode(lat, lng);
    applyLocation(address || "", lat, lng);
    if (address) setSearchText(address);
  };

  const handleMarkerDragEnd = async (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();

    const address = await reverseGeocode(lat, lng);
    applyLocation(address || "", lat, lng);
    if (address) {
      setSearchText(address);
    }
  };

  if (loadError) {
    return (
      <div className="text-sm text-red-600">
        Failed to load Google Map. Please check your API key.
      </div>
    );
  }

  if (!isLoaded) {
    return <div className="text-sm text-gray-500">Loading map…</div>;
  }

  return (
    <div className="space-y-3">
      {/* Search row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <MapPin size={18} />
          </span>
          <input
            type="text"
            className="w-full pl-9 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00]"
            placeholder="Search location (e.g. Banani, Dhaka)"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={handleInputKeyDown}
          />
          <button
            type="button"
            onClick={handleSearchClick}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
          >
            <Search size={18} />
          </button>
        </div>

        <button
          type="button"
          onClick={handleUseMyLocation}
          className="inline-flex items-center gap-2 px-3 py-2 text-xs md:text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <Crosshair size={16} />
          Use my location
        </button>
      </div>

      {/* Map */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={16}
          onClick={handleMapClick}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
        >
          {markerPosition && (
            <MarkerF
              position={markerPosition}
              draggable
              onDragEnd={handleMarkerDragEnd}
            />
          )}
        </GoogleMap>
      </div>

      {/* Lat / Lng */}
      {markerPosition && (
        <div className="flex gap-6 text-xs text-gray-600">
          <div>
            <span className="font-medium">Lat:</span>{" "}
            {markerPosition.lat.toFixed(6)}
          </div>
          <div>
            <span className="font-medium">Lng:</span>{" "}
            {markerPosition.lng.toFixed(6)}
          </div>
        </div>
      )}

      {isSearching && (
        <div className="text-xs text-gray-500">Searching location…</div>
      )}
    </div>
  );
}

export default LocationSearchInput;
