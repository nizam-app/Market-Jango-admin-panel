// src/pages/PaymentManagement.jsx
import React, { useEffect, useState } from "react";
import {
  Settings,
  DollarSign,
  CreditCard,
  RefreshCcw,
  Receipt,
  Search,
} from "lucide-react";
import Swal from "sweetalert2";
import RefundsPanel from "../components/payment/RefundsPanel";
import WalletsPayoutsTab from "../components/payment/WalletsPayoutsTab";
import OrderTransactionsPanel from "../components/payment/OrderTransactionsPanel";
import {
  getZones,
  getPaymentSettings,
  savePaymentSettings,
} from "../api/adminApi";
import { getCurrencies } from "../api/currencyApi";

const BRAND = "#FF8C00";

const FALLBACK_CURRENCIES = ["UGX", "KES", "RWF", "TZS", "SSP", "AED", "CDF"];

const TABS = [
  { id: "settings", label: "Settings", icon: Settings },
  {
    id: "vendor-payouts",
    label: "All user wallets & payouts",
    icon: DollarSign,
  },
  { id: "transactions", label: "Transaction management", icon: CreditCard },
  { id: "refunds", label: "Refunds & payouts (all users)", icon: RefreshCcw },
  { id: "subscriptions", label: "Subscription earnings", icon: Receipt },
];

const PaymentManagement = () => {
  const [activeTab, setActiveTab] = useState("settings");

  // Settings state (loaded from API; zone-scoped)
  const [zone, setZone] = useState("");
  const [vendorPayoutCycle, setVendorPayoutCycle] = useState("weekly");
  const [vendorMinThreshold, setVendorMinThreshold] = useState("");
  const [vendorMethods, setVendorMethods] = useState({
    bank: true,
    mobile_money: true,
    paypal: true,
    stripe: false,
  });

  const [buyerApiKey, setBuyerApiKey] = useState("");
  const [buyerCurrency, setBuyerCurrency] = useState("UGX");
  const [payoutCurrency, setPayoutCurrency] = useState("UGX");
  const [currencyOptions, setCurrencyOptions] = useState(FALLBACK_CURRENCIES);
  const [buyerGatewaysEnabled, setBuyerGatewaysEnabled] = useState(true);
  const [buyerDefaultGateway, setBuyerDefaultGateway] = useState("stripe");

  const [affiliatePayoutCycle, setAffiliatePayoutCycle] = useState("monthly");
  const [affiliateMinThreshold, setAffiliateMinThreshold] = useState("");
  const [affiliateMinCommission, setAffiliateMinCommission] = useState("");
  const [affiliateMethods, setAffiliateMethods] = useState({
    bank: true,
    paypal: true,
    mobile_money: true,
    stripe: false,
  });

  const [platformCommission, setPlatformCommission] = useState("");
  const [taxRules, setTaxRules] = useState("");

  const [zonesList, setZonesList] = useState([]);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [buyerFlutterwaveOptions, setBuyerFlutterwaveOptions] = useState("");
  const [buyerApiKeyConfigured, setBuyerApiKeyConfigured] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getZones(500);
        const payload = res.data?.data;
        const list = payload?.data ?? payload ?? [];
        if (!cancelled) setZonesList(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error(e);
      }
      try {
        const cres = await getCurrencies();
        const list = cres.data?.data ?? [];
        const codes = (Array.isArray(list) ? list : []).map((c) => c.code).filter(Boolean);
        if (!cancelled && codes.length) setCurrencyOptions(codes);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (activeTab !== "settings") return;
    let cancelled = false;
    (async () => {
      setSettingsLoading(true);
      try {
        const res = await getPaymentSettings(zone === "" ? undefined : zone);
        const d = res.data?.data;
        if (cancelled || !d) return;
        const p = d.payload;
        if (!p) return;
        setBuyerApiKeyConfigured(!!d.buyer_api_key_configured);
        setVendorPayoutCycle(p.vendor_payout_cycle ?? "weekly");
        setVendorMinThreshold(
          p.vendor_min_threshold != null && p.vendor_min_threshold !== ""
            ? String(p.vendor_min_threshold)
            : ""
        );
        setVendorMethods({
          bank: !!p.vendor_methods?.bank,
          mobile_money: !!p.vendor_methods?.mobile_money,
          paypal: !!p.vendor_methods?.paypal,
          stripe: !!p.vendor_methods?.stripe,
        });
        setBuyerCurrency(p.buyer_currency ?? "UGX");
        setPayoutCurrency(p.payout_currency ?? "UGX");
        setBuyerGatewaysEnabled(p.buyer_gateways_enabled !== false);
        setBuyerDefaultGateway(p.buyer_default_gateway ?? "stripe");
        setBuyerFlutterwaveOptions(p.buyer_flutterwave_payment_options ?? "");
        setAffiliatePayoutCycle(p.affiliate_payout_cycle ?? "monthly");
        setAffiliateMinThreshold(
          p.affiliate_min_threshold != null && p.affiliate_min_threshold !== ""
            ? String(p.affiliate_min_threshold)
            : ""
        );
        setAffiliateMinCommission(
          p.affiliate_min_commission != null && p.affiliate_min_commission !== ""
            ? String(p.affiliate_min_commission)
            : ""
        );
        setAffiliateMethods({
          bank: !!p.affiliate_methods?.bank,
          paypal: !!p.affiliate_methods?.paypal,
          mobile_money: !!p.affiliate_methods?.mobile_money,
          stripe: !!p.affiliate_methods?.stripe,
        });
        setPlatformCommission(
          p.platform_commission != null && p.platform_commission !== ""
            ? String(p.platform_commission)
            : ""
        );
        setTaxRules(p.tax_rules ?? "");
        setBuyerApiKey("");
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          Swal.fire({
            icon: "error",
            title: "Could not load settings",
            text: e?.response?.data?.message || e.message,
            confirmButtonColor: BRAND,
          });
        }
      } finally {
        if (!cancelled) setSettingsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeTab, zone]);

  const handleSavePaymentSettings = async () => {
    setSavingSettings(true);
    try {
      const payload = {
        vendor_payout_cycle: vendorPayoutCycle,
        vendor_min_threshold:
          vendorMinThreshold === "" ? null : Number(vendorMinThreshold),
        vendor_methods: vendorMethods,
        buyer_currency: buyerCurrency,
        payout_currency: payoutCurrency,
        buyer_gateways_enabled: buyerGatewaysEnabled,
        buyer_default_gateway: buyerDefaultGateway,
        buyer_flutterwave_payment_options: buyerFlutterwaveOptions || null,
        affiliate_payout_cycle: affiliatePayoutCycle,
        affiliate_min_threshold:
          affiliateMinThreshold === "" ? null : Number(affiliateMinThreshold),
        affiliate_min_commission:
          affiliateMinCommission === "" ? null : Number(affiliateMinCommission),
        affiliate_methods: affiliateMethods,
        platform_commission:
          platformCommission === "" ? null : Number(platformCommission),
        tax_rules: taxRules || null,
      };
      const body = {
        zone_id: zone === "" ? null : parseInt(zone, 10),
        payload,
      };
      if (buyerApiKey.trim()) {
        body.buyer_api_key = buyerApiKey.trim();
      }
      await savePaymentSettings(body);
      setBuyerApiKey("");
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Payment settings saved",
        showConfirmButton: false,
        timer: 2000,
      });
      const refresh = await getPaymentSettings(zone === "" ? undefined : zone);
      const d = refresh.data?.data;
      if (d) setBuyerApiKeyConfigured(!!d.buyer_api_key_configured);
    } catch (e) {
      console.error(e);
      Swal.fire({
        icon: "error",
        title: "Save failed",
        text: e?.response?.data?.message || e.message,
        confirmButtonColor: BRAND,
      });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleClearBuyerApiKey = async () => {
    const r = await Swal.fire({
      icon: "warning",
      title: "Remove stored API key?",
      showCancelButton: true,
      confirmButtonColor: BRAND,
    });
    if (!r.isConfirmed) return;
    setSavingSettings(true);
    try {
      const payload = {
        vendor_payout_cycle: vendorPayoutCycle,
        vendor_min_threshold:
          vendorMinThreshold === "" ? null : Number(vendorMinThreshold),
        vendor_methods: vendorMethods,
        buyer_currency: buyerCurrency,
        payout_currency: payoutCurrency,
        buyer_gateways_enabled: buyerGatewaysEnabled,
        buyer_default_gateway: buyerDefaultGateway,
        buyer_flutterwave_payment_options: buyerFlutterwaveOptions || null,
        affiliate_payout_cycle: affiliatePayoutCycle,
        affiliate_min_threshold:
          affiliateMinThreshold === "" ? null : Number(affiliateMinThreshold),
        affiliate_min_commission:
          affiliateMinCommission === "" ? null : Number(affiliateMinCommission),
        affiliate_methods: affiliateMethods,
        platform_commission:
          platformCommission === "" ? null : Number(platformCommission),
        tax_rules: taxRules || null,
      };
      await savePaymentSettings({
        zone_id: zone === "" ? null : parseInt(zone, 10),
        payload,
        clear_buyer_api_key: true,
      });
      setBuyerApiKeyConfigured(false);
      Swal.fire({ toast: true, position: "top-end", icon: "success", title: "API key removed", showConfirmButton: false, timer: 1800 });
    } catch (e) {
      Swal.fire({ icon: "error", title: "Failed", text: e?.response?.data?.message || e.message, confirmButtonColor: BRAND });
    } finally {
      setSavingSettings(false);
    }
  };

  // Common filter UI state
  const [filterCountry, setFilterCountry] = useState("");
  const [filterState, setFilterState] = useState("");
  const [filterTown, setFilterTown] = useState("");
  const [filterFromDate, setFilterFromDate] = useState("");
  const [filterToDate, setFilterToDate] = useState("");

  const [affiliatePayoutSearch, setAffiliatePayoutSearch] = useState("");
  const affiliatePayouts = [];

  // Subscription earnings
  const [subscriptionSearch, setSubscriptionSearch] = useState("");
  const subscriptionEarnings = [];

  const filterInputClass =
    "w-full min-w-0 max-w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/40 box-border";

  const renderFilters = () => (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 min-w-0">
      <div className="min-w-0">
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Country
        </label>
        <input
          type="text"
          value={filterCountry}
          onChange={(e) => setFilterCountry(e.target.value)}
          placeholder="All"
          className={filterInputClass}
        />
      </div>
      <div className="min-w-0">
        <label className="block text-xs font-medium text-gray-600 mb-1">
          State
        </label>
        <input
          type="text"
          value={filterState}
          onChange={(e) => setFilterState(e.target.value)}
          placeholder="All"
          className={filterInputClass}
        />
      </div>
      <div className="min-w-0">
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Town
        </label>
        <input
          type="text"
          value={filterTown}
          onChange={(e) => setFilterTown(e.target.value)}
          placeholder="All"
          className={filterInputClass}
        />
      </div>
      <div className="min-w-0">
        <label className="block text-xs font-medium text-gray-600 mb-1">
          From
        </label>
        <input
          type="date"
          value={filterFromDate}
          onChange={(e) => setFilterFromDate(e.target.value)}
          className={filterInputClass}
        />
      </div>
      <div className="min-w-0">
        <label className="block text-xs font-medium text-gray-600 mb-1">
          To
        </label>
        <input
          type="date"
          value={filterToDate}
          onChange={(e) => setFilterToDate(e.target.value)}
          className={filterInputClass}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 px-6 py-4">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-1 uppercase tracking-wide">
          Payment Management System
        </h1>
        <p className="text-sm text-gray-600">
          Configure payout settings and manage all payment-related workflows.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
              activeTab === id
                ? "border-[#FF8C00] text-[#FF8C00] bg-orange-50"
                : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* SETTINGS TAB */}
      {activeTab === "settings" && (
        <div className="space-y-6">
          {settingsLoading && (
            <div className="text-sm text-gray-500">Loading zone settings…</div>
          )}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-800">
                Zone
              </h2>
            </div>
            <div className="p-6">
              <select
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                disabled={settingsLoading || savingSettings}
                className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/40"
              >
                <option value="">All zones (defaults)</option>
                {zonesList.map((z) => (
                  <option key={z.id} value={String(z.id)}>
                    {z.name || `Zone #${z.id}`}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-2">
                Choose a zone to override buyer checkout and payout options, or edit
                global defaults for all zones.
              </p>
            </div>
          </div>

          {/* Vendor / Driver setting */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-base font-semibold text-gray-800">
                Vendor / Driver setting
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payout cycle (daily, weekly, manual)
                  </label>
                  <select
                    value={vendorPayoutCycle}
                    onChange={(e) => setVendorPayoutCycle(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/40"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum payout threshold
                  </label>
                  <input
                    type="number"
                    value={vendorMinThreshold}
                    onChange={(e) => setVendorMinThreshold(e.target.value)}
                    placeholder="e.g. 50"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/40"
                  />
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-2">
                  Support payout methods
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                  {[
                    ["bank", "Bank"],
                    ["mobile_money", "Mobile money"],
                    ["paypal", "PayPal"],
                    ["stripe", "Stripe"],
                  ].map(([key, label]) => (
                    <label key={key} className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={vendorMethods[key]}
                        onChange={(e) =>
                          setVendorMethods((m) => ({
                            ...m,
                            [key]: e.target.checked,
                          }))
                        }
                        className="rounded border-gray-300"
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Buyer / Transport payment methods */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-base font-semibold text-gray-800">
                Buyer / Transport payment methods
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API key configure keys
                </label>
                {buyerApiKeyConfigured && (
                  <p className="text-xs text-green-700 mb-1">
                    A secret key is stored for this zone. Enter a new value only to replace it.
                  </p>
                )}
                <input
                  type="password"
                  autoComplete="new-password"
                  value={buyerApiKey}
                  onChange={(e) => setBuyerApiKey(e.target.value)}
                  placeholder={
                    buyerApiKeyConfigured
                      ? "Enter new API key to replace stored key"
                      : "API key (stored encrypted)"
                  }
                  disabled={settingsLoading || savingSettings}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/40"
                />
                {buyerApiKeyConfigured && (
                  <button
                    type="button"
                    onClick={handleClearBuyerApiKey}
                    disabled={savingSettings}
                    className="mt-2 text-xs text-red-600 hover:underline"
                  >
                    Remove stored API key
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Buyer display / checkout currency
                  </label>
                  <select
                    value={buyerCurrency}
                    onChange={(e) => setBuyerCurrency(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/40"
                  >
                    {currencyOptions.map((code) => (
                      <option key={code} value={code}>{code}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zone payout currency
                  </label>
                  <select
                    value={payoutCurrency}
                    onChange={(e) => setPayoutCurrency(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/40"
                  >
                    {currencyOptions.map((code) => (
                      <option key={`payout-${code}`} value={code}>{code}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Vendor withdrawals for this zone use this currency (amounts still ledgered in UGX).</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Enable / disable gateways
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setBuyerGatewaysEnabled((enabled) => !enabled)
                    }
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      buyerGatewaysEnabled
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {buyerGatewaysEnabled ? "Gateways enabled" : "Gateways disabled"}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Flutterwave payment options (comma-separated)
                </label>
                <textarea
                  value={buyerFlutterwaveOptions}
                  onChange={(e) => setBuyerFlutterwaveOptions(e.target.value)}
                  rows={2}
                  disabled={settingsLoading || savingSettings}
                  placeholder="e.g. card,mpesa,mobilemoneyuganda"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/40"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Set default gateway
                </label>
                <select
                  value={buyerDefaultGateway}
                  onChange={(e) => setBuyerDefaultGateway(e.target.value)}
                  className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/40"
                >
                  <option value="stripe">Stripe</option>
                  <option value="paypal">PayPal</option>
                  <option value="bank">Bank</option>
                  <option value="mobile_money">Mobile money</option>
                </select>
              </div>
            </div>
          </div>

          {/* Affiliate settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-base font-semibold text-gray-800">
                Affiliate payout settings
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payout cycle (daily, weekly, manual)
                  </label>
                  <select
                    value={affiliatePayoutCycle}
                    onChange={(e) => setAffiliatePayoutCycle(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/40"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum payout threshold
                  </label>
                  <input
                    type="number"
                    value={affiliateMinThreshold}
                    onChange={(e) => setAffiliateMinThreshold(e.target.value)}
                    placeholder="e.g. 50"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum affiliate commission
                  </label>
                  <input
                    type="number"
                    value={affiliateMinCommission}
                    onChange={(e) => setAffiliateMinCommission(e.target.value)}
                    placeholder="e.g. 5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/40"
                  />
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-2">
                  Support payout methods
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                  {[
                    ["bank", "Bank"],
                    ["paypal", "PayPal"],
                    ["mobile_money", "Mobile money"],
                    ["stripe", "Stripe"],
                  ].map(([key, label]) => (
                    <label key={key} className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={affiliateMethods[key]}
                        onChange={(e) =>
                          setAffiliateMethods((m) => ({
                            ...m,
                            [key]: e.target.checked,
                          }))
                        }
                        className="rounded border-gray-300"
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Commission & taxes */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-base font-semibold text-gray-800">
                Commission & taxes
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Platform commission %
                  </label>
                  <input
                    type="number"
                    value={platformCommission}
                    onChange={(e) => setPlatformCommission(e.target.value)}
                    placeholder="e.g. 10"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Taxes (description / rule)
                  </label>
                  <input
                    type="text"
                    value={taxRules}
                    onChange={(e) => setTaxRules(e.target.value)}
                    placeholder="e.g. VAT 18% + local taxes"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/40"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleSavePaymentSettings}
                disabled={savingSettings || settingsLoading}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: BRAND }}
              >
                {savingSettings ? "Saving…" : "Save payment settings"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VENDOR / DRIVER PAYOUT SYSTEM TAB — wallets + payout requests (API-backed) */}
      {activeTab === "vendor-payouts" && (
        <div className="space-y-6">
          <WalletsPayoutsTab />
        </div>
      )}

      {/* TRANSACTION MANAGEMENT TAB — GET /reports/order-transactions */}
      {activeTab === "transactions" && (
        <div className="space-y-6">
          <OrderTransactionsPanel />
        </div>
      )}

      {/* REFUND + PAYOUTS TAB */}
      {activeTab === "refunds" && (
        <div className="space-y-6">
          <RefundsPanel />

          {/* Affiliate payout management */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-800">
                Affiliate payout management
              </h2>
              <span className="text-xs text-gray-500">
                Filter by country, state, town, time range
              </span>
            </div>
            <div className="p-6 space-y-4">
              {renderFilters()}
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="relative flex-1 max-w-sm flex gap-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={affiliatePayoutSearch}
                    onChange={(e) => setAffiliatePayoutSearch(e.target.value)}
                    placeholder="Search by affiliate"
                    className="flex-1 pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/40"
                  />
                  <button
                    type="button"
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Affiliate name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Commission per referral
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Commission types
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Payout method
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Total commissions
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {affiliatePayouts.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-12 text-center text-sm text-gray-500"
                      >
                        No affiliate payouts yet.
                      </td>
                    </tr>
                  ) : (
                    affiliatePayouts.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {row.affiliate_name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {row.commission_per_referral}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {row.commission_type}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {row.payout_method}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {row.total_commissions}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {row.status}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            className="px-3 py-1.5 text-xs font-medium text-white rounded-lg"
                            style={{ backgroundColor: BRAND }}
                          >
                            Pay
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBSCRIPTION EARNINGS TAB */}
      {activeTab === "subscriptions" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-800">
                Subscription earnings for vendor / drivers
              </h2>
              <span className="text-xs text-gray-500">
                Filter by country, state, town, time range
              </span>
            </div>
            <div className="p-6 space-y-4">
              {renderFilters()}
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="relative flex-1 max-w-sm flex gap-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={subscriptionSearch}
                    onChange={(e) => setSubscriptionSearch(e.target.value)}
                    placeholder="Search by payment method, user name, plan, status"
                    className="flex-1 pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/40"
                  />
                  <button
                    type="button"
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      User name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Payment method
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Status (paid, failed, refunded)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Action (refund)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Invoice
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {subscriptionEarnings.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-12 text-center text-sm text-gray-500"
                      >
                        No subscription earnings yet.
                      </td>
                    </tr>
                  ) : (
                    subscriptionEarnings.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {row.user_name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {row.plan}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {row.amount}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {row.payment_method}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {row.status}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <button className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-100 text-red-700">
                            Refund
                          </button>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <button className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 text-gray-700">
                            View invoice
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentManagement;

