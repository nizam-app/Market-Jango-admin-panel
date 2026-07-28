// src/api/orderTransactionsReportApi.js — GET /reports/order-transactions
import axiosClient from "./axiosClient";

function cleanParams(obj) {
  const out = {};
  Object.entries(obj || {}).forEach(([k, v]) => {
    if (v === "" || v == null || v === undefined) return;
    out[k] = v;
  });
  return out;
}

function normalizePerPage(params = {}) {
  const p = { ...params };
  if (p.per_page != null) {
    const n = Number(p.per_page);
    if (Number.isFinite(n)) {
      p.per_page = Math.min(100, Math.max(1, Math.floor(n)));
    } else {
      delete p.per_page;
    }
  }
  return p;
}

/**
 * GET /reports/order-transactions
 * Query: from_date, to_date, country, zone_id, state, town, search, per_page (1–100, default 20)
 */
export function getOrderTransactions(params = {}) {
  return axiosClient.get("/reports/order-transactions", {
    params: cleanParams(normalizePerPage(params)),
  });
}

/**
 * GET /reports/order-transactions/export — CSV download (same filters as the list)
 */
export function exportOrderTransactions(params = {}) {
  const p = { ...params };
  delete p.page;
  delete p.per_page;
  return axiosClient.get("/reports/order-transactions/export", {
    params: cleanParams(p),
    responseType: "blob",
  });
}

/**
 * Response: data.notes, data.transactions = Laravel paginator
 */
export function parseOrderTransactionsResponse(res) {
  const root = res?.data?.data || {};
  const notes = root.notes;
  const pag = root.transactions || {};
  const list = Array.isArray(pag.data) ? pag.data : [];
  const meta = {
    current_page: pag.current_page || 1,
    last_page: pag.last_page || 1,
    total: pag.total ?? list.length,
    per_page: pag.per_page || 20,
  };
  return { notes, list, meta };
}

/** Trigger browser download from an axios blob response */
export function downloadBlobResponse(res, fallbackName = "order-transactions.csv") {
  const blob = res?.data instanceof Blob ? res.data : new Blob([res?.data || ""], { type: "text/csv" });
  let filename = fallbackName;
  const disposition = res?.headers?.["content-disposition"] || res?.headers?.["Content-Disposition"];
  if (disposition) {
    const match = /filename\*?=(?:UTF-8''|")?([^\";]+)/i.exec(disposition);
    if (match?.[1]) {
      filename = decodeURIComponent(match[1].replace(/"/g, "").trim());
    }
  }
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
