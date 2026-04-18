// src/components/orders/OrderEditModal.jsx — GET edit-context, per-line PATCH/POST/PUT
import React, { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Loader2, Minus, Plus, ChevronDown, FileDown } from "lucide-react";
import {
  getOrderEditContext,
  parseOrderEditContext,
  patchOrderLineQuantity,
  postOrderLineCancel,
  postOrderLineAssignDriver,
  updateAllOrder,
  downloadOrderInvoicePdf,
  downloadOrderDeliveryLabelPdf,
} from "../../api/orderApi";
import { getAdminDriversList } from "../../api/driverAdminApi";

function sellingModeLabel(mode) {
  const m = String(mode || "").toLowerCase().replace(/_/g, "-");
  if (m === "marketplace") return "Marketplace";
  if (m === "walkin" || m === "walk-in" || m === "walking") return "Walk-in";
  return mode ? String(mode) : "—";
}

function sellingModeBadgeClass(mode) {
  const m = String(mode || "").toLowerCase();
  if (m === "marketplace") return "bg-sky-50 text-sky-900 ring-sky-200/80";
  if (m === "walkin" || m === "walk-in" || m === "walking" || m === "walk_in") {
    return "bg-violet-50 text-violet-900 ring-violet-200/80";
  }
  return "bg-gray-100 text-gray-700 ring-gray-200";
}

function statusBadgeClass(s) {
  const v = String(s || "").toLowerCase();
  const map = {
    pending: "bg-amber-50 text-amber-800 ring-amber-200",
    processing: "bg-blue-50 text-blue-800 ring-blue-200",
    completed: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    assigned: "bg-indigo-50 text-indigo-800 ring-indigo-200",
    delivered: "bg-green-50 text-green-800 ring-green-200",
    cancelled: "bg-red-50 text-red-800 ring-red-200",
  };
  return map[v] || "bg-gray-100 text-gray-700 ring-gray-200";
}

function lineIsLocked(line) {
  const s = String(line?.status || "").toLowerCase();
  return s === "delivered" || s === "cancelled";
}

function driverLineLabel(d) {
  const name = d?.user?.name || d?.name || `Driver #${d?.id}`;
  const car = [d?.car_name, d?.car_model].filter(Boolean).join(" · ");
  return car ? `${name} (${car})` : name;
}

const inputClass =
  "w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/35";
const selectClass =
  "w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/35";
const btnGhost =
  "inline-flex items-center justify-center px-3 py-2 text-sm font-medium border border-gray-200 rounded-xl bg-white hover:bg-gray-50 disabled:opacity-40";

async function saveBlobResponseAsDownload(response, fallbackFilename) {
  const blob = response.data;
  const ct = (response.headers["content-type"] || "").toLowerCase();
  const blobType = (blob?.type && String(blob.type).toLowerCase()) || "";

  const sniffHead = async (n) => {
    if (typeof Blob === "undefined" || !blob?.slice) return "";
    const buf = await blob.slice(0, n).arrayBuffer();
    return new TextDecoder("utf-8", { fatal: false }).decode(buf);
  };

  const head = await sniffHead(8);
  const headTrim = head.trimStart();
  const looksJson =
    headTrim.startsWith("{") ||
    headTrim.startsWith("[") ||
    ct.includes("application/json") ||
    blobType.includes("json");

  if (looksJson) {
    const text = await blob.text();
    let msg = "Download failed";
    try {
      const j = JSON.parse(text);
      msg = j.message || j.error || j.errors?.message || msg;
    } catch {
      msg = text?.slice(0, 240) || msg;
    }
    throw new Error(msg);
  }

  if (headTrim.startsWith("<!") || headTrim.startsWith("<html")) {
    throw new Error("Server returned a web page instead of a PDF. Check the download URL or permissions.");
  }

  if (!head.startsWith("%PDF")) {
    throw new Error(
      "Downloaded data is not a valid PDF. The API may be misconfigured or the route may not exist."
    );
  }

  const cd = response.headers["content-disposition"] || "";
  let filename = fallbackFilename;
  const m = /filename\*=UTF-8''([^;\s]+)|filename="([^"]+)"|filename=([^;\s]+)/i.exec(cd);
  if (m) {
    filename = decodeURIComponent((m[1] || m[2] || m[3] || "").replace(/['"]/g, ""));
  }
  if (!filename.toLowerCase().endsWith(".pdf")) {
    filename = `${String(fallbackFilename).replace(/\.pdf$/i, "")}.pdf`;
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Axios + blob error responses (4xx/5xx with responseType blob put body in a Blob). */
async function messageFromDownloadError(error) {
  const status = error?.response?.status;
  const data = error?.response?.data;

  if (data instanceof Blob) {
    try {
      const text = await data.text();
      const t = text.trimStart();
      if (t.startsWith("{") || t.startsWith("[")) {
        const j = JSON.parse(text);
        return (
          j.message ||
          j.error ||
          (typeof j.errors === "object" && j.errors && String(Object.values(j.errors).flat?.()[0])) ||
          text.slice(0, 220)
        );
      }
      if (t.startsWith("<")) {
        return status === 500
          ? "Server error (500): the PDF route crashed. Check Laravel storage/logs/laravel.log."
          : `Download failed (HTTP ${status || "?"}). Server returned HTML instead of a PDF.`;
      }
      return text.slice(0, 220) || error?.message;
    } catch {
      return error?.message;
    }
  }

  if (data && typeof data === "object" && data.message) {
    return String(data.message);
  }

  if (status === 500) {
    return "Server error (500): fix the download-invoice / download-delivery-label handler in Laravel (see laravel.log).";
  }

  return error?.message || "Download failed.";
}

export default function OrderEditModal({ invoiceItemId, onClose, brand, onRefreshTable }) {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [header, setHeader] = useState(null);
  const [lines, setLines] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [toast, setToast] = useState(null);

  const [draftQty, setDraftQty] = useState({});
  const [qtyReason, setQtyReason] = useState({});
  const [statusPick, setStatusPick] = useState({});
  const [statusNote, setStatusNote] = useState({});
  const [assignPick, setAssignPick] = useState({});
  const [lineBusy, setLineBusy] = useState({});
  const [downloadBusy, setDownloadBusy] = useState(null);

  const showToast = useCallback((message, isError = false) => {
    setToast({ message, isError });
    window.setTimeout(() => setToast(null), 4200);
  }, []);

  const reloadContext = useCallback(async () => {
    if (invoiceItemId == null) return;
    const res = await getOrderEditContext(invoiceItemId);
    const { header: h, lines: list } = parseOrderEditContext(res);
    setHeader(h);
    setLines(list);
    setDraftQty({});
    setQtyReason({});
    const sp = {};
    const sn = {};
    list.forEach((line) => {
      const allowed = Array.isArray(line.allowed_next_statuses) ? line.allowed_next_statuses : [];
      const cur = String(line.status ?? "");
      sp[line.id] = allowed.includes(cur) ? cur : allowed[0] ?? cur;
      sn[line.id] = "";
    });
    setStatusPick(sp);
    setStatusNote(sn);
    setAssignPick({});
  }, [invoiceItemId]);

  useEffect(() => {
    if (invoiceItemId == null) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [invoiceItemId, onClose]);

  useEffect(() => {
    if (invoiceItemId == null) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError("");
      try {
        const [ctxRes, drvRes] = await Promise.all([
          getOrderEditContext(invoiceItemId),
          getAdminDriversList().catch(() => ({ data: {} })),
        ]);
        if (cancelled) return;
        const { header: h, lines: list } = parseOrderEditContext(ctxRes);
        setHeader(h);
        setLines(list);
        const raw = drvRes?.data?.data;
        const drvList = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
        setDrivers(drvList);
        const sp = {};
        const sn = {};
        list.forEach((line) => {
          const allowed = Array.isArray(line.allowed_next_statuses) ? line.allowed_next_statuses : [];
          const cur = String(line.status ?? "");
          sp[line.id] = allowed.includes(cur) ? cur : allowed[0] ?? cur;
          sn[line.id] = "";
        });
        setStatusPick(sp);
        setStatusNote(sn);
        setDraftQty({});
        setQtyReason({});
        setAssignPick({});
      } catch (e) {
        if (!cancelled) {
          setLoadError(e?.response?.data?.message || e.message || "Failed to load order");
          setHeader(null);
          setLines([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [invoiceItemId]);

  const setBusy = (lineId, v) => {
    setLineBusy((prev) => ({ ...prev, [lineId]: v }));
  };

  const handlePatchQty = async (line) => {
    if (lineIsLocked(line)) return;
    const q = draftQty[line.id] !== undefined ? Number(draftQty[line.id]) : Number(line.quantity);
    const reason = (qtyReason[line.id] || "").trim();
    if (!Number.isFinite(q) || q < 1) {
      showToast("Enter a valid quantity (≥ 1).", true);
      return;
    }
    if (!reason) {
      showToast("Reason is required to change quantity.", true);
      return;
    }
    try {
      setBusy(line.id, true);
      await patchOrderLineQuantity(line.id, { quantity: Math.floor(q), reason });
      showToast("Quantity updated.");
      await reloadContext();
      onRefreshTable?.();
    } catch (e) {
      showToast(e?.response?.data?.message || e.message || "Update failed", true);
    } finally {
      setBusy(line.id, false);
    }
  };

  const handleCancelLine = async (line) => {
    if (lineIsLocked(line)) return;
    const { value: reason } = await Swal.fire({
      title: "Cancel this line?",
      input: "textarea",
      inputLabel: "Reason (required)",
      inputPlaceholder: "Why is this line being cancelled?",
      showCancelButton: true,
      confirmButtonText: "Cancel line",
      confirmButtonColor: brand,
      cancelButtonText: "Back",
      inputValidator: (v) => {
        if (!v || !String(v).trim()) return "Reason is required";
        return undefined;
      },
    });
    if (reason === undefined) return;
    try {
      setBusy(line.id, true);
      await postOrderLineCancel(line.id, { reason: String(reason).trim() });
      showToast("Line cancelled.");
      await reloadContext();
      onRefreshTable?.();
    } catch (e) {
      showToast(e?.response?.data?.message || e.message || "Cancel failed", true);
    } finally {
      setBusy(line.id, false);
    }
  };

  const handleAssignDriver = async (line) => {
    const driverId = assignPick[line.id];
    if (!driverId) {
      showToast("Select a driver.", true);
      return;
    }
    try {
      setBusy(line.id, true);
      await postOrderLineAssignDriver(line.id, { driver_id: Number(driverId) });
      showToast("Driver assigned.");
      await reloadContext();
      onRefreshTable?.();
    } catch (e) {
      showToast(e?.response?.data?.message || e.message || "Assign failed", true);
    } finally {
      setBusy(line.id, false);
    }
  };

  const handleStatusUpdate = async (line) => {
    const allowed = Array.isArray(line.allowed_next_statuses) ? line.allowed_next_statuses : [];
    const st = statusPick[line.id];
    if (allowed.length && !allowed.includes(st)) {
      showToast("Invalid status for this line.", true);
      return;
    }
    const note = (statusNote[line.id] || "").trim();
    try {
      setBusy(line.id, true);
      await updateAllOrder(line.id, {
        status: st,
        ...(note ? { note } : {}),
      });
      showToast("Status updated.");
      await reloadContext();
      onRefreshTable?.();
    } catch (e) {
      showToast(e?.response?.data?.message || e.message || "Status update failed", true);
    } finally {
      setBusy(line.id, false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (invoiceItemId == null) {
      showToast("Line id missing for download.", true);
      return;
    }
    try {
      setDownloadBusy("invoice");
      const res = await downloadOrderInvoicePdf(invoiceItemId);
      const safe = (header?.order_number || `invoice-line-${invoiceItemId}`).replace(/[^\w.-]+/g, "_");
      await saveBlobResponseAsDownload(res, `${safe}.pdf`);
      showToast("Invoice downloaded.");
    } catch (e) {
      showToast((await messageFromDownloadError(e)) || "Invoice download failed", true);
    } finally {
      setDownloadBusy(null);
    }
  };

  const handleDownloadDeliveryLabel = async () => {
    if (invoiceItemId == null) {
      showToast("Line id missing for delivery label.", true);
      return;
    }
    try {
      setDownloadBusy("label");
      const res = await downloadOrderDeliveryLabelPdf(invoiceItemId);
      const safe = (header?.order_number || `label-line-${invoiceItemId}`).replace(/[^\w.-]+/g, "_");
      await saveBlobResponseAsDownload(res, `${safe}-delivery-label.pdf`);
      showToast("Delivery label downloaded.");
    } catch (e) {
      showToast((await messageFromDownloadError(e)) || "Delivery label download failed", true);
    } finally {
      setDownloadBusy(null);
    }
  };

  if (invoiceItemId == null) return null;

  const totals = header?.totals || {};
  const currency = header?.currency ?? totals?.currency ?? "";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-3 sm:p-6 bg-black/45 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-edit-modal-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-3xl max-h-[min(94vh,900px)] flex flex-col rounded-2xl bg-white shadow-xl border border-gray-200/90 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-3 bg-[#F4F7FB] shrink-0">
          <div>
            <h2 id="order-edit-modal-title" className="text-lg font-semibold text-[#343C6A]">
              Edit order
            </h2>
            <p className="text-xs text-gray-500 mt-0.5 font-mono">Line #{invoiceItemId}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-2 text-gray-500 hover:bg-gray-200/80 transition"
            aria-label="Close"
          >
            <span className="text-xl leading-none">&times;</span>
          </button>
        </div>

        {toast && (
          <div
            className={`mx-4 mt-3 px-3 py-2 rounded-xl text-sm ${
              toast.isError ? "bg-red-50 text-red-800 border border-red-100" : "bg-emerald-50 text-emerald-900 border border-emerald-100"
            }`}
            role="status"
          >
            {toast.message}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 text-sm">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-[#FF8C00]" />
              Loading order…
            </div>
          ) : loadError ? (
            <div className="text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{loadError}</div>
          ) : (
            <>
              {/* Header */}
              <section className="rounded-xl border border-gray-200 bg-gray-50/80 p-4 space-y-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-[#5a6489] shrink-0">
                    Order details
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleDownloadInvoice}
                      disabled={downloadBusy != null}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-[#FF8C00] text-[#FF8C00] bg-white hover:bg-orange-50 disabled:opacity-50 transition"
                    >
                      {downloadBusy === "invoice" ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden />
                      ) : (
                        <FileDown className="w-3.5 h-3.5" aria-hidden />
                      )}
                      Invoice (PDF)
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadDeliveryLabel}
                      disabled={downloadBusy != null}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-gray-300 text-[#343C6A] bg-white hover:bg-gray-50 disabled:opacity-50 transition"
                    >
                      {downloadBusy === "label" ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden />
                      ) : (
                        <FileDown className="w-3.5 h-3.5" aria-hidden />
                      )}
                      Delivery label (PDF)
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Customer</span>
                    <p className="text-gray-900 font-medium">
                      {[
                        header?.customer_name ?? header?.cus_name,
                        header?.customer_phone ?? header?.cus_phone,
                        header?.customer_email ?? header?.cus_email,
                      ]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Order #</span>
                    <p className="font-mono text-gray-900">{header?.order_number ?? "—"}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Invoice status</span>
                    <p className="text-gray-900">{header?.invoice_status ?? "—"}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Payment</span>
                    <p className="text-gray-900">{header?.payment_method ?? "—"}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-gray-500">Selling mode</span>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ring-1 ring-inset ${sellingModeBadgeClass(header?.selling_mode)}`}
                      >
                        {sellingModeLabel(header?.selling_mode)}
                      </span>
                      {header?.selling_mode_read_only ? (
                        <span className="text-xs text-gray-500">{header?.selling_mode_note || "Selling mode is fixed for this order."}</span>
                      ) : null}
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-gray-500">Destination</span>
                    <p className="text-gray-900">{header?.destination?.trim() ? header.destination : "—"}</p>
                  </div>
                  <div className="sm:col-span-2 border-t border-gray-200 pt-3 mt-1">
                    <span className="text-gray-500">Totals</span>
                    <p className="text-gray-900 tabular-nums">
                      {currency ? `${currency} ` : ""}
                      Total {totals?.total ?? "—"} · Payable {totals?.payable ?? "—"} · VAT {totals?.vat ?? "—"}
                    </p>
                  </div>
                </div>
              </section>

              {/* Lines */}
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-[#5a6489] mb-3">Products on this invoice</h3>
                <ul className="space-y-4">
                  {lines.map((line, idx) => {
                    const locked = lineIsLocked(line);
                    const busy = lineBusy[line.id];
                    const productName = line.product?.name ?? line.product_name ?? "—";
                    const vendorName = line.vendor?.business_name ?? line.vendor?.user?.name ?? "—";
                    const driverName =
                      line.driver?.user?.name || line.driver?.name || (line.driver_id != null ? `#${line.driver_id}` : "—");
                    const qtyVal =
                      draftQty[line.id] !== undefined ? draftQty[line.id] : line.quantity ?? 1;
                    const allowed = Array.isArray(line.allowed_next_statuses) ? line.allowed_next_statuses : [];

                    return (
                      <li
                        key={line.id ?? idx}
                        className="rounded-xl border border-gray-200 p-4 bg-white shadow-sm space-y-4"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-start gap-4 justify-between">
                          <div className="min-w-0 flex-1 space-y-1">
                            <p className="font-semibold text-[#343C6A]">
                              {idx + 1}. {productName}
                            </p>
                            <p className="text-xs text-gray-500">
                              Vendor: {vendorName} · Line #{line.id}
                            </p>
                            <p className="text-sm text-gray-700">
                              Sale: {line.sale_price ?? "—"} · Total pay: {line.total_pay ?? "—"} · Qty: {line.quantity ?? "—"}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                              <span className="text-xs text-gray-500">Status</span>
                              <span
                                className={`inline-flex px-2 py-0.5 rounded-lg text-xs font-medium ring-1 ring-inset ${statusBadgeClass(line.status)}`}
                              >
                                {line.status ?? "—"}
                              </span>
                              <span className="text-xs text-gray-500">Driver</span>
                              <span className="text-xs text-gray-800">{driverName}</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 lg:justify-end shrink-0">
                            <button
                              type="button"
                              disabled={locked || busy}
                              onClick={() => handleCancelLine(line)}
                              className={`${btnGhost} text-red-700 border-red-100 hover:bg-red-50`}
                            >
                              Cancel line
                            </button>
                          </div>
                        </div>

                        {/* Quantity */}
                        <div className="rounded-lg bg-gray-50/90 border border-gray-100 p-3 space-y-2">
                          <p className="text-xs font-medium text-gray-600">Quantity</p>
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              disabled={locked || busy}
                              className={btnGhost}
                              onClick={() => {
                                const cur = Number(draftQty[line.id] !== undefined ? draftQty[line.id] : line.quantity) || 1;
                                setDraftQty((d) => ({ ...d, [line.id]: Math.max(1, cur - 1) }));
                              }}
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <input
                              type="number"
                              min={1}
                              disabled={locked || busy}
                              className="w-20 px-2 py-2 border border-gray-200 rounded-lg text-center text-sm tabular-nums"
                              value={qtyVal}
                              onChange={(e) => setDraftQty((d) => ({ ...d, [line.id]: e.target.value }))}
                            />
                            <button
                              type="button"
                              disabled={locked || busy}
                              className={btnGhost}
                              onClick={() => {
                                const cur = Number(draftQty[line.id] !== undefined ? draftQty[line.id] : line.quantity) || 1;
                                setDraftQty((d) => ({ ...d, [line.id]: cur + 1 }));
                              }}
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <span className="text-xs text-gray-500 hidden sm:inline">Reason required to apply</span>
                          </div>
                          <textarea
                            rows={2}
                            disabled={locked || busy}
                            className={`${inputClass} resize-y text-xs`}
                            placeholder="Reason for quantity change (required)"
                            value={qtyReason[line.id] ?? ""}
                            onChange={(e) => setQtyReason((r) => ({ ...r, [line.id]: e.target.value }))}
                          />
                          <button
                            type="button"
                            disabled={locked || busy}
                            onClick={() => handlePatchQty(line)}
                            className="text-sm font-medium px-4 py-2 rounded-xl text-white disabled:opacity-50"
                            style={{ backgroundColor: brand }}
                          >
                            {busy ? <Loader2 className="w-4 h-4 animate-spin inline" /> : null} Apply quantity
                          </button>
                        </div>

                        {/* Assign driver */}
                        <div className="rounded-lg border border-dashed border-gray-200 p-3 space-y-2">
                          <p className="text-xs font-medium text-gray-600">Assign driver</p>
                          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                            <select
                              className={selectClass + " sm:max-w-xs"}
                              disabled={busy || locked}
                              value={assignPick[line.id] ?? ""}
                              onChange={(e) => setAssignPick((p) => ({ ...p, [line.id]: e.target.value }))}
                            >
                              <option value="">Select driver…</option>
                              {drivers.map((d) => (
                                <option key={d.id} value={String(d.id)}>
                                  {driverLineLabel(d)}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              disabled={busy || locked}
                              onClick={() => handleAssignDriver(line)}
                              className="text-sm font-medium px-4 py-2 rounded-xl border border-[#FF8C00] text-[#FF8C00] bg-white hover:bg-orange-50 disabled:opacity-50"
                            >
                              Assign
                            </button>
                          </div>
                        </div>

                        {/* Next status */}
                        <div className="rounded-lg bg-[#F4F7FB] border border-[#E6EEF6] p-3 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-semibold text-[#5a6489] flex items-center gap-1">
                              Set next status <ChevronDown className="w-4 h-4 opacity-60" />
                            </p>
                          </div>
                          {allowed.length > 0 ? (
                            <>
                              <select
                                className={selectClass}
                                disabled={busy || locked}
                                value={statusPick[line.id] ?? ""}
                                onChange={(e) => setStatusPick((p) => ({ ...p, [line.id]: e.target.value }))}
                              >
                                {allowed.map((s) => (
                                  <option key={s} value={s}>
                                    {s}
                                  </option>
                                ))}
                              </select>
                              <input
                                type="text"
                                className={inputClass}
                                disabled={busy || locked}
                                placeholder="Optional note with status"
                                value={statusNote[line.id] ?? ""}
                                onChange={(e) => setStatusNote((n) => ({ ...n, [line.id]: e.target.value }))}
                              />
                              <button
                                type="button"
                                disabled={busy || locked}
                                onClick={() => handleStatusUpdate(line)}
                                className="text-sm font-medium px-4 py-2 rounded-xl text-white disabled:opacity-50 w-full sm:w-auto"
                                style={{ backgroundColor: brand }}
                              >
                                {busy ? <Loader2 className="w-4 h-4 animate-spin inline" /> : null} Update status
                              </button>
                            </>
                          ) : (
                            <p className="text-xs text-gray-500">No allowed next statuses for this line.</p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
                {lines.length === 0 && !loading && (
                  <p className="text-gray-500 text-sm py-6 text-center">No lines returned for this invoice.</p>
                )}
              </section>
            </>
          )}
        </div>

        <div className="px-5 py-3 border-t border-gray-100 bg-white shrink-0 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium border border-gray-200 rounded-xl bg-white hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
