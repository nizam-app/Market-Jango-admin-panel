// src/api/vendorAPI.js
import axiosClient from "./axiosClient";

// Pending vendor list (10 per page by default – backend already করে)
export function getPendingVendors(page = 1) {
  return axiosClient.get(`/pending/vendor?page=${page}`);
}

// Active vendor list (future use – already দেওয়া ছিল)
export function getActiveVendors(page = 1) {
  return axiosClient.get(`/active/vendor?page=${page}`);
}

// Accept / Reject / Cancel vendor
export function updateVendorStatus(vendorId, status) {
  // status: "Approved", "Rejected" / "Cancelled" etc. backend অনুযায়ী string use করবে
  return axiosClient.post(`/accept-reject/vendor/${vendorId}`, { status });
}

// Suspended vendor list (paginated)
export function getSuspendedVendors(page = 1) {
  return axiosClient.get(`/suspended/vendor?page=${page}`);
}

// delete vendor

export function deleteVendor(vendorId){
  return axiosClient.delete(`/user/destroy/${vendorId}`)
}