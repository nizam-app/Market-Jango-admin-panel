// src/pages/CurrencyManagement.jsx — Admin manual exchange rates (UGX base)
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { RefreshCw } from "lucide-react";
import { getAdminCurrencies, updateCurrencyRate } from "../api/currencyApi";
import { fmtMoney } from "../utils/fmtMoney";

const BRAND = "#FF8C00";

const CurrencyManagement = () => {
  const [baseCurrency, setBaseCurrency] = useState("UGX");
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCode, setEditingCode] = useState(null);
  const [rateInput, setRateInput] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getAdminCurrencies();
      const data = res.data?.data;
      setBaseCurrency(data?.base_currency || "UGX");
      setCurrencies(Array.isArray(data?.currencies) ? data.currencies : []);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.response?.data?.message || "Failed to load currencies",
        confirmButtonColor: BRAND,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const startEdit = (row) => {
    if (row.code === baseCurrency) {
      Swal.fire({
        icon: "info",
        title: "UGX is base",
        text: "Base currency rate is locked to 1.",
        confirmButtonColor: BRAND,
      });
      return;
    }
    setEditingCode(row.code);
    setRateInput(row.rate != null ? String(row.rate) : "");
  };

  const saveRate = async () => {
    if (!editingCode) return;
    const rate = Number(rateInput);
    if (!rate || rate <= 0) {
      Swal.fire({ icon: "warning", title: "Invalid rate", text: "Rate must be greater than zero.", confirmButtonColor: BRAND });
      return;
    }
    try {
      setSaving(true);
      await updateCurrencyRate(editingCode, rate);
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: `${editingCode} rate updated`,
        showConfirmButton: false,
        timer: 1500,
      });
      setEditingCode(null);
      setRateInput("");
      load();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.response?.data?.message || "Failed to update rate",
        confirmButtonColor: BRAND,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 px-6 py-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Currency Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            Ledger base is <strong>{baseCurrency}</strong>. Rates are units of foreign currency per 1 {baseCurrency}
            (manual only — no live FX). Example: if 1 UGX = 0.036 KES, store rate <code>0.036</code>.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {editingCode && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Edit rate for {editingCode}</label>
            <input
              type="number"
              step="any"
              min="0"
              className="border rounded-lg px-3 py-2 text-sm w-56"
              value={rateInput}
              onChange={(e) => setRateInput(e.target.value)}
              placeholder="e.g. 0.036"
            />
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={saveRate}
            className="px-4 py-2 text-sm text-white rounded-lg"
            style={{ backgroundColor: BRAND }}
          >
            {saving ? "Saving..." : "Save rate"}
          </button>
          <button type="button" onClick={() => { setEditingCode(null); setRateInput(""); }} className="px-4 py-2 text-sm border rounded-lg">
            Cancel
          </button>
          <p className="text-xs text-gray-500 w-full">
            Sample: 10,000 {baseCurrency} ≈ {fmtMoney(10000 * (Number(rateInput) || 0), editingCode)}
          </p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left">Country</th>
              <th className="px-4 py-3 text-left">Code</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Symbol</th>
              <th className="px-4 py-3 text-left">Rate (per 1 {baseCurrency})</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
            ) : currencies.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No currencies configured.</td></tr>
            ) : currencies.map((c) => (
              <tr key={c.code} className="hover:bg-gray-50">
                <td className="px-4 py-3">{c.country || "—"}</td>
                <td className="px-4 py-3 font-semibold">{c.code}</td>
                <td className="px-4 py-3">{c.name}</td>
                <td className="px-4 py-3">{c.symbol}</td>
                <td className="px-4 py-3 font-mono">{c.rate ?? "—"}</td>
                <td className="px-4 py-3 text-right">
                  {c.code === baseCurrency ? (
                    <span className="text-xs text-gray-400">Locked</span>
                  ) : (
                    <button type="button" onClick={() => startEdit(c)} className="text-sm text-blue-600 hover:underline">
                      Set rate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CurrencyManagement;
