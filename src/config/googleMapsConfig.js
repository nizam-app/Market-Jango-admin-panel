// src/config/googleMapsConfig.js
export const GOOGLE_MAPS_LOADER_OPTIONS = {
  id: "google-maps-script",
  version: "weekly",
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
  libraries: ["places"], // দরকার হলে এখানে আরেকটা যোগ করবে, যেমন "maps"
  language: "en",
  region: "US",
};
