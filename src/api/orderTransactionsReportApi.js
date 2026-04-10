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

/**
 * GET /reports/order-transactions
 * Query: from_date, to_date, country, zone_id, state, town, search, per_page (1–100, default 20)
 */
export function getOrderTransactions(params = {}) {
  const p = { ...params };
  if (p.per_page != null) {
    const n = Number(p.per_page);
    if (Number.isFinite(n)) {
      p.per_page = Math.min(100, Math.max(1, Math.floor(n)));
    } else {
      delete p.per_page;
    }
  }
  return axiosClient.get("/reports/order-transactions", { params: cleanParams(p) });
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
