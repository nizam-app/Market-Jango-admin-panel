// src/components/payment/WalletsPayoutsTab.jsx — GET /wallets, /payouts + admin actions
import React, { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { RefreshCw, Wallet, ArrowDownCircle, List } from "lucide-react";
import {
  getWallets,
  parseWalletsResponse,
  topupWallet,
  getWalletTransactions,
  parseWalletTransactionsResponse,
  getPayouts,
  parsePayoutsResponse,
  processPayout,
  completePayout,
  rejectPayout,
} from "../../api/walletApi";

const BRAND = "#FF8C00";

const escHtml = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");

const fmtMoney = (v) => {
  if (v == null || v === "") return "—";
  const n = Number(v);
  if (Number.isFinite(n)) return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return String(v);
};

const fmtDt = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return String(iso);
  }
};

function payoutRecipientLabel(row) {
  return (
    row.user?.name ||
    row.vendor?.business_name ||
    row.driver?.user?.name ||
    row.driver?.name ||
    row.recipient?.name ||
    row.email ||
    (row.user_id != null ? `User #${row.user_id}` : "—")
  );
}

function payoutStatusMeta(status) {
  const st = String(status || "").toLowerCase();
  const terminal = ["paid", "completed", "rejected", "cancelled", "failed"].includes(st);
  const processing = st === "processing" || st === "in_process" || st === "in_progress";
  return { terminal, processing, raw: st };
}

export default function WalletsPayoutsTab() {
  const [overview, setOverview] = useState({});
  const [wallets, setWallets] = useState([]);
  const [walletsMeta, setWalletsMeta] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
  });
  const [walletsLoading, setWalletsLoading] = useState(false);
  const [walletsError, setWalletsError] = useState("");

  const [payoutRows, setPayoutRows] = useState([]);
  const [payoutMeta, setPayoutMeta] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
  });
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [payoutError, setPayoutError] = useState("");
  const [payoutSearch, setPayoutSearch] = useState("");

  const loadWallets = useCallback(async (page = 1) => {
    try {
      setWalletsLoading(true);
      setWalletsError("");
      const res = await getWallets({ page });
      const { overview: ov, list, meta } = parseWalletsResponse(res);
      setOverview(ov || {});
      setWallets(list);
      setWalletsMeta(meta);
    } catch (e) {
      console.error(e);
      setWalletsError(e?.response?.data?.message || e.message || "Failed to load wallets");
      setWallets([]);
      setOverview({});
    } finally {
      setWalletsLoading(false);
    }
  }, []);

  const loadPayouts = useCallback(async (page = 1) => {
    try {
      setPayoutLoading(true);
      setPayoutError("");
      const res = await getPayouts({ page });
      const { list, meta } = parsePayoutsResponse(res);
      setPayoutRows(list);
      setPayoutMeta(meta);
    } catch (e) {
      console.error(e);
      setPayoutError(e?.response?.data?.message || e.message || "Failed to load payouts");
      setPayoutRows([]);
    } finally {
      setPayoutLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWallets(1);
    loadPayouts(1);
  }, [loadWallets, loadPayouts]);

  const handleTopup = async (w) => {
    const uid = w.user_id;
    const currency = w.currency || "USD";
    const displayName = escHtml(w.user?.name || "User");
    const displayCurrency = escHtml(currency);

    const { value: formValues } = await Swal.fire({
      title: "Top up wallet",
      width: 460,
      padding: 0,
      showCloseButton: true,
      html: `
        <div class="text-left space-y-4">
          <div class="rounded-xl border border-gray-200 bg-gradient-to-br from-[#FFF8F0] to-white px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
            <p class="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Recipient</p>
            <p class="text-base font-semibold text-[#343C6A] mt-1 leading-snug">${displayName}</p>
            <div class="flex flex-wrap gap-2 mt-3">
              <span class="inline-flex items-center rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-gray-600 border border-gray-200 shadow-sm">User #${uid}</span>
              <span class="inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold text-white shadow-sm" style="background-color:${BRAND}">${displayCurrency}</span>
            </div>
          </div>
          <div class="space-y-1.5">
            <label for="swal-topup-amount" class="block text-sm font-medium text-gray-800">Amount <span class="font-normal text-gray-500">(${displayCurrency})</span></label>
            <input id="swal-topup-amount" type="number" step="0.01" min="0" placeholder="0.00"
              class="!m-0 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-lg font-semibold tabular-nums text-gray-900 shadow-sm placeholder:text-gray-300 focus:border-[#FF8C00]/50 focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/30" />
          </div>
          <div class="space-y-1.5">
            <label for="swal-topup-note" class="block text-sm font-medium text-gray-800">Note <span class="font-normal text-gray-400">(optional)</span></label>
            <textarea id="swal-topup-note" rows="3" placeholder="Reference, receipt ID, or internal note…"
              class="!m-0 w-full min-h-[5rem] rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-[#FF8C00]/50 focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/30 resize-y"></textarea>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Submit top-up",
      cancelButtonText: "Cancel",
      confirmButtonColor: BRAND,
      reverseButtons: true,
      buttonsStyling: false,
      customClass: {
        popup: "!rounded-2xl !overflow-hidden p-0 shadow-2xl shadow-gray-900/15 border border-gray-200/90",
        title:
          "!text-xl !font-semibold !text-[#343C6A] !text-left !pl-6 !pr-10 !pt-6 !pb-0 !mb-0 !mt-0",
        htmlContainer: "!px-6 !pb-1 !mt-5 !mb-0",
        actions:
          "!mx-0 !mt-0 flex w-full !justify-end gap-3 !border-t !border-gray-100 !bg-gray-50/80 !px-6 !py-4",
        confirmButton:
          "!m-0 rounded-xl px-6 py-2.5 text-sm font-semibold shadow-md transition hover:brightness-105",
        cancelButton:
          "!m-0 rounded-xl border-2 border-gray-200 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50",
        closeButton:
          "!text-gray-400 hover:!text-gray-700 focus:!outline-none !text-2xl !leading-none !px-3 !py-2",
      },
      didOpen: () => {
        const el = document.getElementById("swal-topup-amount");
        el?.focus();
        el?.select?.();
      },
      preConfirm: () => {
        const amt = document.getElementById("swal-topup-amount")?.value;
        const note = document.getElementById("swal-topup-note")?.value?.trim();
        const num = parseFloat(String(amt), 10);
        if (!amt || !Number.isFinite(num) || num <= 0) {
          Swal.showValidationMessage("Enter a valid amount greater than zero");
          return false;
        }
        return { amount: num, note: note || undefined, currency };
      },
    });
    if (!formValues) return;

    try {
      Swal.fire({
        title: "Submitting…",
        didOpen: () => Swal.showLoading(),
        allowOutsideClick: false,
      });
      await topupWallet(uid, {
        amount: formValues.amount,
        currency: formValues.currency,
        ...(formValues.note ? { note: formValues.note } : {}),
      });
      Swal.close();
      await Swal.fire({ icon: "success", title: "Top-up successful", confirmButtonColor: BRAND });
      loadWallets(walletsMeta.current_page);
    } catch (e) {
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Top-up failed",
        text: e?.response?.data?.message || e.message,
        confirmButtonColor: BRAND,
      });
    }
  };

  const handleViewTransactions = async (w) => {
    const uid = w.user_id;
    try {
      Swal.fire({
        title: "Loading transactions…",
        didOpen: () => Swal.showLoading(),
        allowOutsideClick: false,
      });
      const res = await getWalletTransactions(uid);
      Swal.close();
      const { list } = parseWalletTransactionsResponse(res);
      if (list.length === 0) {
        await Swal.fire({
          icon: "info",
          title: "No transactions",
          text: `No transactions for user #${uid}`,
          confirmButtonColor: BRAND,
        });
        return;
      }

      const rowsHtml = list
        .slice(0, 80)
        .map((t) => {
          const cells = [
            t.id ?? "—",
            t.type ?? t.transaction_type ?? t.kind ?? "—",
            fmtMoney(t.amount ?? t.credit ?? t.debit),
            t.currency ?? w.currency ?? "—",
            fmtDt(t.created_at ?? t.date),
          ];
          return `<tr>${cells.map((c) => `<td class="px-2 py-1 border-b border-gray-100 text-left text-xs">${String(c)}</td>`).join("")}</tr>`;
        })
        .join("");

      await Swal.fire({
        title: `Transactions · ${w.user?.name || "User"} (#${uid})`,
        width: 720,
        html: `
          <div class="text-left overflow-auto max-h-96 mt-2">
            <table class="w-full text-xs">
              <thead>
                <tr class="text-gray-500 border-b">
                  <th class="text-left py-1">ID</th>
                  <th class="text-left py-1">Type</th>
                  <th class="text-left py-1">Amount</th>
                  <th class="text-left py-1">Currency</th>
                  <th class="text-left py-1">Date</th>
                </tr>
              </thead>
              <tbody>${rowsHtml}</tbody>
            </table>
            ${list.length > 80 ? `<p class="text-gray-500 mt-2">Showing first 80 of ${list.length}</p>` : ""}
          </div>
        `,
        confirmButtonColor: BRAND,
      });
    } catch (e) {
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Failed to load transactions",
        text: e?.response?.data?.message || e.message,
        confirmButtonColor: BRAND,
      });
    }
  };

  const confirmPayoutAction = async (row, kind) => {
    const recipient = escHtml(payoutRecipientLabel(row));
    const amount = fmtMoney(
      row.amount ?? row.requested_amount ?? row.total_amount ?? row.payout_amount
    );
    const currency = escHtml(row.currency || row.currency_code || "");
    const noteRequired = kind === "reject";

    const titles = {
      process: "Mark as processing?",
      complete: "Mark as paid / complete?",
      reject: "Reject and refund to wallet?",
    };

    const noteHint = noteRequired
      ? "Required — reason for rejection (shown in admin records)"
      : "Optional — payment reference or internal note";

    const { value: formValues } = await Swal.fire({
      title: titles[kind],
      width: 480,
      icon: kind === "reject" ? "warning" : "question",
      showCloseButton: true,
      html: `
        <div class="text-left space-y-4">
          <div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
            <p class="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Payout #${row.id}</p>
            <p class="text-base font-semibold text-gray-900 mt-1">${recipient}</p>
            <p class="text-sm text-gray-600 mt-1 tabular-nums">${amount}${currency ? ` ${currency}` : ""}</p>
          </div>
          <div class="space-y-1.5">
            <label for="swal-payout-note" class="block text-sm font-medium text-gray-800">
              Note ${noteRequired ? '<span class="text-red-600">*</span>' : '<span class="font-normal text-gray-400">(optional)</span>'}
            </label>
            <textarea id="swal-payout-note" rows="3" placeholder="${noteRequired ? "Reason for rejection…" : "Reference, receipt ID, or internal note…"}"
              class="!m-0 w-full min-h-[5rem] rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-[#FF8C00]/50 focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/30 resize-y"></textarea>
            <p class="text-xs text-gray-500">${noteHint}</p>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: kind === "reject" ? "Reject & refund" : "Confirm",
      cancelButtonText: "Cancel",
      confirmButtonColor: kind === "reject" ? "#dc2626" : BRAND,
      reverseButtons: true,
      didOpen: () => document.getElementById("swal-payout-note")?.focus(),
      preConfirm: () => {
        const note = document.getElementById("swal-payout-note")?.value?.trim() || "";
        if (noteRequired && !note) {
          Swal.showValidationMessage("Please enter a note");
          return false;
        }
        return { note: note || undefined };
      },
    });

    if (!formValues) return;

    const body = formValues.note ? { note: formValues.note } : {};
    const apiCall =
      kind === "process"
        ? () => processPayout(row.id, body)
        : kind === "complete"
          ? () => completePayout(row.id, body)
          : () => rejectPayout(row.id, { note: formValues.note });

    try {
      Swal.fire({ title: "Working…", didOpen: () => Swal.showLoading(), allowOutsideClick: false });
      await apiCall();
      Swal.close();
      await Swal.fire({ icon: "success", title: "Updated", confirmButtonColor: BRAND });
      loadPayouts(payoutMeta.current_page);
      loadWallets(walletsMeta.current_page);
    } catch (e) {
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Request failed",
        text: e?.response?.data?.message || e.message,
        confirmButtonColor: BRAND,
      });
    }
  };

  const filteredPayouts = payoutSearch.trim()
    ? payoutRows.filter((r) => {
        const q = payoutSearch.toLowerCase();
        return (
          String(r.id).includes(q) ||
          String(r.status || "").toLowerCase().includes(q) ||
          payoutRecipientLabel(r).toLowerCase().includes(q)
        );
      })
    : payoutRows;

  return (
    <div className="space-y-8">
      {/* Wallets */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-[#FF8C00]" />
              <h2 className="text-base font-semibold text-gray-800">All user wallets</h2>
            </div>
            <p className="text-xs text-gray-500 mt-1 sm:pl-7 max-w-xl">
              Buyers, vendors, drivers, and transport — refunds and payouts apply across all wallet types.
            </p>
          </div>
          <button
            type="button"
            onClick={() => loadWallets(walletsMeta.current_page)}
            disabled={walletsLoading}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${walletsLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          <strong>Note:</strong> Overview <code className="text-[10px]">total_balance</code> may combine
          multiple currencies (e.g. USD + UGX); treat as informational until the API exposes per-currency
          totals.
        </p>

        {walletsError && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
            {walletsError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total wallets</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">
              {overview.total_wallets ?? "—"}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total balance (API)</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">
              {fmtMoney(overview.total_balance)}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Wallet ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Balance</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Active</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Updated</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {walletsLoading && wallets.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                      Loading wallets…
                    </td>
                  </tr>
                ) : wallets.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                      No wallets found.
                    </td>
                  </tr>
                ) : (
                  wallets.map((w) => (
                    <tr key={w.id} className="hover:bg-gray-50/80">
                      <td className="px-4 py-3 font-mono text-xs text-gray-800">{w.id}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{w.user?.name || "—"}</div>
                        <div className="text-xs text-gray-500">{w.user?.email || ""}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-700 capitalize">{w.user?.user_type || "—"}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{w.user?.phone || "—"}</td>
                      <td className="px-4 py-3">
                        <span className="tabular-nums font-medium">{fmtMoney(w.balance)}</span>{" "}
                        <span className="text-gray-500 text-xs">{w.currency}</span>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {w.is_active ? (
                          <span className="text-emerald-700">Yes</span>
                        ) : (
                          <span className="text-gray-500">No</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                        {fmtDt(w.updated_at)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex flex-wrap gap-1 justify-end">
                          <button
                            type="button"
                            onClick={() => handleViewTransactions(w)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                          >
                            <List className="w-3.5 h-3.5" />
                            Transactions
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTopup(w)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg border border-[#FF8C00] text-[#FF8C00] hover:bg-orange-50"
                          >
                            <ArrowDownCircle className="w-3.5 h-3.5" />
                            Top-up
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {walletsMeta.last_page > 1 && (
            <div className="px-4 py-3 border-t flex flex-wrap justify-between items-center gap-2 text-sm text-gray-600">
              <span>
                Page {walletsMeta.current_page} of {walletsMeta.last_page} ({walletsMeta.total} total)
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={walletsLoading || walletsMeta.current_page <= 1}
                  onClick={() => loadWallets(walletsMeta.current_page - 1)}
                  className="px-3 py-1.5 border rounded-lg disabled:opacity-40"
                >
                  Prev
                </button>
                <button
                  type="button"
                  disabled={walletsLoading || walletsMeta.current_page >= walletsMeta.last_page}
                  onClick={() => loadWallets(walletsMeta.current_page + 1)}
                  className="px-3 py-1.5 border rounded-lg disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payouts */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-gray-800">Payout requests</h2>
          <button
            type="button"
            onClick={() => loadPayouts(payoutMeta.current_page)}
            disabled={payoutLoading}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${payoutLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {payoutError && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
            {payoutError}
          </div>
        )}

        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="search"
            value={payoutSearch}
            onChange={(e) => setPayoutSearch(e.target.value)}
            placeholder="Filter by id, recipient, status…"
            className="max-w-sm flex-1 min-w-[12rem] pl-3 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/40"
          />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Recipient</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Requested</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payoutLoading && payoutRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                      Loading payouts…
                    </td>
                  </tr>
                ) : filteredPayouts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                      No payout requests found.
                    </td>
                  </tr>
                ) : (
                  filteredPayouts.map((row) => {
                    const { terminal, processing } = payoutStatusMeta(row.status);
                    const amount =
                      row.amount ??
                      row.requested_amount ??
                      row.total_amount ??
                      row.payout_amount;
                    const currency = row.currency || row.currency_code || "";
                    const canProcess = !terminal && !processing;
                    const canComplete = !terminal && processing;
                    const canReject = !terminal;

                    return (
                      <tr key={row.id} className="hover:bg-gray-50/80">
                        <td className="px-4 py-3 font-mono text-xs">{row.id}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{payoutRecipientLabel(row)}</div>
                          {row.user_id != null && (
                            <div className="text-xs text-gray-500">User #{row.user_id}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 tabular-nums">
                          {fmtMoney(amount)} {currency && <span className="text-gray-500 text-xs">{currency}</span>}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex px-2 py-0.5 rounded text-xs bg-gray-100 capitalize">
                            {row.status ?? "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                          {fmtDt(row.created_at || row.requested_at || row.updated_at)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex flex-wrap gap-1 justify-end">
                            <button
                              type="button"
                              disabled={!canProcess}
                              onClick={() => confirmPayoutAction(row, "process")}
                              className="px-2 py-1 text-xs font-medium rounded-lg bg-blue-50 text-blue-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-100"
                            >
                              Processing
                            </button>
                            <button
                              type="button"
                              disabled={!canComplete}
                              onClick={() => confirmPayoutAction(row, "complete")}
                              className="px-2 py-1 text-xs font-medium rounded-lg bg-emerald-50 text-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-100"
                            >
                              Mark paid
                            </button>
                            <button
                              type="button"
                              disabled={!canReject}
                              onClick={() => confirmPayoutAction(row, "reject")}
                              className="px-2 py-1 text-xs font-medium rounded-lg bg-red-50 text-red-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-red-100"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {payoutMeta.last_page > 1 && (
            <div className="px-4 py-3 border-t flex flex-wrap justify-between items-center gap-2 text-sm text-gray-600">
              <span>
                Page {payoutMeta.current_page} of {payoutMeta.last_page} ({payoutMeta.total} total)
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={payoutLoading || payoutMeta.current_page <= 1}
                  onClick={() => loadPayouts(payoutMeta.current_page - 1)}
                  className="px-3 py-1.5 border rounded-lg disabled:opacity-40"
                >
                  Prev
                </button>
                <button
                  type="button"
                  disabled={payoutLoading || payoutMeta.current_page >= payoutMeta.last_page}
                  onClick={() => loadPayouts(payoutMeta.current_page + 1)}
                  className="px-3 py-1.5 border rounded-lg disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
