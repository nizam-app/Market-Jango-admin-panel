// src/api/walletApi.js — admin wallets & payouts
import axiosClient from "./axiosClient";

/** @deprecated All wallet/payout endpoints are wired; kept for any legacy imports */
export const walletsPayoutsApiPending = false;

function cleanParams(obj) {
  const out = {};
  Object.entries(obj || {}).forEach(([k, v]) => {
    if (v !== "" && v != null && v !== undefined) out[k] = v;
  });
  return out;
}

/**
 * GET /wallets
 * Response: data.overview, data.wallets (Laravel paginator)
 */
export function getWallets(params = {}) {
  return axiosClient.get("/wallets", { params: cleanParams(params) });
}

/**
 * @returns {{ overview: { total_wallets?: number, total_balance?: number }, list: any[], meta: object }}
 */
export function parseWalletsResponse(res) {
  const root = res?.data?.data || {};
  const overview = root.overview || {};
  const pag = root.wallets || root;
  let list = [];
  let meta = {
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 20,
  };

  if (Array.isArray(pag?.data)) {
    list = pag.data;
    meta = {
      current_page: pag.current_page || 1,
      last_page: pag.last_page || 1,
      total: pag.total ?? list.length,
      per_page: pag.per_page || 20,
    };
  } else if (Array.isArray(pag)) {
    list = pag;
    meta.total = list.length;
  }

  return { overview, list, meta };
}

/**
 * POST /wallets/{user_id}/topup
 * Body commonly { amount, currency?, note? } — confirm with backend
 */
export function topupWallet(userId, body = {}) {
  return axiosClient.post(`/wallets/${userId}/topup`, body);
}

/**
 * GET /wallets/{user_id}/transactions
 */
export function getWalletTransactions(userId, params = {}) {
  return axiosClient.get(`/wallets/${userId}/transactions`, {
    params: cleanParams(params),
  });
}

/** Normalize transactions list + optional pagination from various shapes */
export function parseWalletTransactionsResponse(res) {
  const raw = res?.data?.data;
  if (Array.isArray(raw)) {
    return {
      list: raw,
      meta: { current_page: 1, last_page: 1, total: raw.length },
    };
  }
  if (raw && Array.isArray(raw.data)) {
    return {
      list: raw.data,
      meta: {
        current_page: raw.current_page || 1,
        last_page: raw.last_page || 1,
        total: raw.total ?? raw.data.length,
      },
    };
  }
  if (raw && Array.isArray(raw.transactions)) {
    return {
      list: raw.transactions,
      meta: { current_page: 1, last_page: 1, total: raw.transactions.length },
    };
  }
  return { list: [], meta: { current_page: 1, last_page: 1, total: 0 } };
}

/**
 * GET /payouts
 */
export function getPayouts(params = {}) {
  return axiosClient.get("/payouts", { params: cleanParams(params) });
}

/**
 * Parse GET /payouts — supports data as paginator, data.data array, data.payouts paginator
 */
export function parsePayoutsResponse(res) {
  const root = res?.data?.data;

  const fromPaginator = (pag) => {
    if (!pag || !Array.isArray(pag.data)) {
      return {
        list: [],
        meta: { current_page: 1, last_page: 1, total: 0 },
      };
    }
    return {
      list: pag.data,
      meta: {
        current_page: pag.current_page || 1,
        last_page: pag.last_page || 1,
        total: pag.total ?? pag.data.length,
        per_page: pag.per_page,
      },
    };
  };

  if (!root) {
    return { list: [], meta: { current_page: 1, last_page: 1, total: 0 } };
  }

  if (Array.isArray(root)) {
    return {
      list: root,
      meta: { current_page: 1, last_page: 1, total: root.length },
    };
  }

  if (Array.isArray(root.data) && root.current_page != null) {
    return fromPaginator(root);
  }

  if (root.payouts) {
    return fromPaginator(root.payouts);
  }

  if (Array.isArray(root.data)) {
    return {
      list: root.data,
      meta: {
        current_page: 1,
        last_page: 1,
        total: root.data.length,
      },
    };
  }

  return { list: [], meta: { current_page: 1, last_page: 1, total: 0 } };
}

export function processPayout(id, body = {}) {
  return axiosClient.post(`/payouts/${id}/process`, body);
}

export function completePayout(id, body = {}) {
  return axiosClient.post(`/payouts/${id}/complete`, body);
}

export function rejectPayout(id, body = {}) {
  return axiosClient.post(`/payouts/${id}/reject`, body);
}
