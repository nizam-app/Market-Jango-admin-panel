// src/components/outlet/OutletOrderMap.jsx
import React, { useMemo } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { GOOGLE_MAPS_LOADER_OPTIONS } from "../../config/googleMapsConfig";

const DEFAULT_CENTER = { lat: -1.2921, lng: 36.8219 };

const parseCoord = (val) => {
  const n = parseFloat(val);
  return Number.isFinite(n) ? n : null;
};

const OutletOrderMap = ({ pickup, dropoff }) => {
  const { isLoaded } = useJsApiLoader(GOOGLE_MAPS_LOADER_OPTIONS);

  const pickupPos = useMemo(() => {
    const lat = parseCoord(pickup?.latitude);
    const lng = parseCoord(pickup?.longitude);
    return lat != null && lng != null ? { lat, lng } : null;
  }, [pickup]);

  const dropPos = useMemo(() => {
    const lat = parseCoord(dropoff?.latitude);
    const lng = parseCoord(dropoff?.longitude);
    return lat != null && lng != null ? { lat, lng } : null;
  }, [dropoff]);

  const center = pickupPos || dropPos || DEFAULT_CENTER;

  if (!isLoaded) {
    return <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center text-sm text-gray-500">Loading map...</div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-orange-500" />
          <span><strong>Pickup (vendor):</strong> {pickup?.address || "—"} {pickup?.vendor_name ? `(${pickup.vendor_name})` : ""}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-600" />
          <span><strong>Drop (buyer):</strong> {dropoff?.address || "—"} {dropoff?.buyer_name ? `(${dropoff.buyer_name})` : ""}</span>
        </div>
      </div>
      <GoogleMap mapContainerClassName="w-full h-64 rounded-lg border border-gray-200" center={center} zoom={pickupPos && dropPos ? 12 : 11}>
        {pickupPos && <Marker position={pickupPos} label={{ text: "P", color: "white", fontWeight: "bold" }} />}
        {dropPos && <Marker position={dropPos} label={{ text: "D", color: "white", fontWeight: "bold" }} />}
      </GoogleMap>
    </div>
  );
};

export default OutletOrderMap;
