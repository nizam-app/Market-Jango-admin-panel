// src/api/vendorAPI.js
import axiosClient from "./axiosClient";

// Pending vendor list (10 per page by default – backend already করে)
export function getPendingVendors(page = 1) {
  return axiosClient.get(`/pending/vendor?page=${page}`);
}

// Active vendor list — pass page number or query params e.g. { per_page: 500, page: 1 }
export function getActiveVendors(pageOrParams = 1) {
  if (typeof pageOrParams === "object" && pageOrParams !== null) {
    return axiosClient.get("/active/vendor", { params: pageOrParams });
  }
  const page = typeof pageOrParams === "number" ? pageOrParams : 1;
  return axiosClient.get("/active/vendor", { params: { page } });
}

// Accept / Reject / Cancel vendor
  export function updateVendorStatus(vendorId, status, note) {
  const payload = note ? { status, note } : { status };
  return axiosClient.put(`/vendor/status-update/${vendorId}`, payload);
}

// Suspended vendor list (paginated)
export function getSuspendedVendors(page = 1) {
  return axiosClient.get(`/suspended/vendor?page=${page}`);
}

// delete vendor

export function deleteVendor(vendorId){
  return axiosClient.delete(`/user/destroy/${vendorId}`)
}

export function createVendor(formData) {
  return axiosClient
    .post("/create-vendor", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => res.data); // <-- শুধু data ফেরত দিচ্ছি
}
