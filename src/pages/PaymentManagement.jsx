// src/pages/PaymentManagement.jsx
// Payment Management UI for admin – UI only, no API calls yet.
import React, { useState } from "react";
import {
  Settings,
  DollarSign,
  CreditCard,
  RefreshCcw,
  Receipt,
  Search,
} from "lucide-react";

const BRAND = "#FF8C00";

const TABS = [
  { id: "settings", label: "Settings", icon: Settings },
  { id: "vendor-payouts", label: "Vendor / Driver payouts", icon: DollarSign },
  { id: "transactions", label: "Transaction management", icon: CreditCard },
  { id: "refunds", label: "Refunds & payouts", icon: RefreshCcw },
  { id: "subscriptions", label: "Subscription earnings", icon: Receipt },
];

const PaymentManagement = () => {
  const [activeTab, setActiveTab] = useState("settings");

  // Settings state (UI only)
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
  const [buyerCurrency, setBuyerCurrency] = useState("USD");
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

  // Common filter UI state
  const [filterCountry, setFilterCountry] = useState("");
  const [filterState, setFilterState] = useState("");
  const [filterTown, setFilterTown] = useState("");
  const [filterFromDate, setFilterFromDate] = useState("");
  const [filterToDate, setFilterToDate] = useState("");

  // Vendor / Driver payout system
  const [vendorPayoutSearch, setVendorPayoutSearch] = useState("");
  const vendorPayouts = [];

  // Transaction management
  const [transactionSearch, setTransactionSearch] = useState("");
  const transactions = [];

  // Refund requests + payouts
  const [refundSearch, setRefundSearch] = useState("");
  const refundRequests = [];
  const buyersRefundPayouts = [];
  const [affiliatePayoutSearch, setAffiliatePayoutSearch] = useState("");
  const affiliatePayouts = [];

  // Subscription earnings
  const [subscriptionSearch, setSubscriptionSearch] = useState("");
  const subscriptionEarnings = [];

  const renderFilters = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Country
        </label>
        <input
          type="text"
          value={filterCountry}
          onChange={(e) => setFilterCountry(e.target.value)}
          placeholder="All"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/40"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          State
        </label>
        <input
          type="text"
          value={filterState}
          onChange={(e) => setFilterState(e.target.value)}
          placeholder="All"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/40"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Town
        </label>
        <input
          type="text"
          value={filterTown}
          onChange={(e) => setFilterTown(e.target.value)}
          placeholder="All"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/40"
        />
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            From
          </label>
          <input
            type="date"
            value={filterFromDate}
            onChange={(e) => setFilterFromDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/40"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            To
          </label>
          <input
            type="date"
            value={filterToDate}
            onChange={(e) => setFilterToDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/40"
          />
        </div>
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
                className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/40"
              >
                <option value="">All zones</option>
                <option value="uganda">Uganda</option>
                <option value="bangladesh">Bangladesh</option>
              </select>
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
                <input
                  type="text"
                  value={buyerApiKey}
                  onChange={(e) => setBuyerApiKey(e.target.value)}
                  placeholder="API key (masked in production)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/40"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency support
                  </label>
                  <select
                    value={buyerCurrency}
                    onChange={(e) => setBuyerCurrency(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/40"
                  >
                    <option value="USD">USD</option>
                    <option value="UGX">UGX</option>
                    <option value="BDT">BDT</option>
                  </select>
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
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90"
                style={{ backgroundColor: BRAND }}
              >
                Save payment settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VENDOR / DRIVER PAYOUT SYSTEM TAB */}
      {activeTab === "vendor-payouts" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-800">
                Vendor / Driver payout system
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
                    value={vendorPayoutSearch}
                    onChange={(e) => setVendorPayoutSearch(e.target.value)}
                    placeholder="Search by vendor name, status"
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
                      Vendor name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Status (paid, pending)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Date of request
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Action (approve / reject / hold)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {vendorPayouts.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-12 text-center text-sm text-gray-500"
                      >
                        No payout requests yet.
                      </td>
                    </tr>
                  ) : (
                    vendorPayouts.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {row.vendor_name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {row.amount}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {row.method}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {row.status}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {row.request_date}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex gap-2">
                            <button className="px-2 py-1 text-xs font-medium rounded-lg bg-green-100 text-green-700">
                              Approve
                            </button>
                            <button className="px-2 py-1 text-xs font-medium rounded-lg bg-red-100 text-red-700">
                              Reject
                            </button>
                            <button className="px-2 py-1 text-xs font-medium rounded-lg bg-gray-100 text-gray-700">
                              Hold
                            </button>
                          </div>
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

      {/* TRANSACTION MANAGEMENT TAB */}
      {activeTab === "transactions" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-800">
                Transaction management
              </h2>
              <span className="text-xs text-gray-500">
                Filter by country, state, town, date range
              </span>
            </div>
            <div className="p-6 space-y-4">
              {renderFilters()}
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="relative flex-1 max-w-sm flex gap-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={transactionSearch}
                    onChange={(e) => setTransactionSearch(e.target.value)}
                    placeholder="Search by vendor, buyer/transport, transaction ID, order ID, status, affiliate"
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
                      Transaction ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Buyer / Transport ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Vendor name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Payment method
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Gross amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Commission
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Taxes
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Affiliate earning
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Vendor / Driver net amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.length === 0 ? (
                    <tr>
                      <td
                        colSpan={12}
                        className="px-4 py-12 text-center text-sm text-gray-500"
                      >
                        No transactions yet.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {row.transaction_id}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {row.order_id}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {row.buyer_transport_id}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {row.vendor_name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {row.payment_method}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {row.gross_amount}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {row.commission}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {row.taxes}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {row.affiliate_earning}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {row.vendor_net_amount}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {row.status}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {row.date}
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

      {/* REFUND + PAYOUTS TAB */}
      {activeTab === "refunds" && (
        <div className="space-y-6">
          {/* Refund requests */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-800">
                Refund requests
              </h2>
              <span className="text-xs text-gray-500">
                Filter by country, state, town, date range
              </span>
            </div>
            <div className="p-6 space-y-4">
              {renderFilters()}
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="relative flex-1 max-w-sm flex gap-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={refundSearch}
                    onChange={(e) => setRefundSearch(e.target.value)}
                    placeholder="Search by vendor order ID"
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
                      Order ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Customer name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Vendor name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Refund reason
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Order edits / partial refund
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {refundRequests.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-12 text-center text-sm text-gray-500"
                      >
                        No refund requests yet. Note: affiliate commission will be
                        reserved.
                      </td>
                    </tr>
                  ) : (
                    refundRequests.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {row.order_id}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {row.customer_name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {row.vendor_name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {row.refund_reason}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {row.amount}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {row.status}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {row.order_edits}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex gap-2">
                            <button className="px-2 py-1 text-xs font-medium rounded-lg bg-green-100 text-green-700">
                              Approve
                            </button>
                            <button className="px-2 py-1 text-xs font-medium rounded-lg bg-red-100 text-red-700">
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Buyers refund payouts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-base font-semibold text-gray-800">
                Buyers refund payouts
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Buyer name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Date of request
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Action (reject, approve)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {buyersRefundPayouts.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-12 text-center text-sm text-gray-500"
                      >
                        No buyer refund payouts yet.
                      </td>
                    </tr>
                  ) : (
                    buyersRefundPayouts.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {row.buyer_name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {row.amount}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {row.status}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {row.request_date}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex gap-2">
                            <button className="px-2 py-1 text-xs font-medium rounded-lg bg-green-100 text-green-700">
                              Approve
                            </button>
                            <button className="px-2 py-1 text-xs font-medium rounded-lg bg-red-100 text-red-700">
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

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

