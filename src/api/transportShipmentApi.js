// src/api/transportShipmentApi.js — admin transport shipments
import axiosClient from "./axiosClient";

/** GET /transport-shipments — paginated list */
export const getTransportShipments = (params = {}) => {
  const clean = {};
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== "" && v != null && v !== undefined) clean[k] = v;
  });
  return axiosClient.get("/transport-shipments", { params: clean });
};

/** GET /transport-shipments/{id} — full shipment + packages */
export const getTransportShipment = (id) => {
  return axiosClient.get(`/transport-shipments/${id}`);
};

/** PATCH /transport-shipments/{id} — status, payment_status, driver_id, final_price */
export const patchTransportShipment = (id, body = {}) => {
  return axiosClient.patch(`/transport-shipments/${id}`, body);
};

/** GET /shipments/{id}/download-invoice — transport shipment invoice PDF */
export const downloadShipmentInvoicePdf = (shipmentId) => {
  return axiosClient.get(`/shipments/${shipmentId}/download-invoice`, {
    responseType: "blob",
    headers: { Accept: "application/pdf, application/octet-stream, */*" },
  });
};

/** GET /shipments/{id}/download-delivery-label — transport delivery label PDF */
export const downloadShipmentDeliveryLabelPdf = (shipmentId) => {
  return axiosClient.get(`/shipments/${shipmentId}/download-delivery-label`, {
    responseType: "blob",
    headers: { Accept: "application/pdf, application/octet-stream, */*" },
  });
};

export function parseShipmentsListResponse(res) {
  const d = res?.data?.data;
  const pag = d?.pagination || {};
  return {
    items: Array.isArray(d?.items) ? d.items : [],
    pagination: {
      total: pag.total ?? 0,
      per_page: pag.per_page ?? 20,
      current_page: pag.current_page ?? 1,
      last_page: pag.last_page ?? 1,
    },
  };
}

export function parseShipmentDetailResponse(res) {
  return res?.data?.data?.shipment ?? res?.data?.data ?? null;
}
