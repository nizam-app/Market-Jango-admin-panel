// src/pages/AffiliateLinks.jsx
// Affiliate Program UI – List (GET /api/affiliates) and Create (POST /api/affiliates).
import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import {
  Plus,
  Search,
  Download,
  Edit3,
  Trash2,
  Link2,
  User,
  DollarSign,
  Settings,
  Shield,
  X,
} from "lucide-react";
import { createAffiliate, getAffiliates, getAffiliate, updateAffiliate, deleteAffiliate, affiliatePasswordReset, getReferralLinks, getReferralLinksExport, updateReferralLink, deleteReferralLink, getConversions, getManualPayouts, getAffiliateSettings, updateAffiliateSettings } from "../api/adminApi";

const BRAND = "#FF8C00";

const initialAffiliateForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  password_confirmation: "",
  social_media: "",
  traffic_details: "",
  marketing_channel: "",
  payment_info: "",
  terms_accepted: false,
  place_of_residence: "",
  status: "pending",
};

const TABS = [
  { id: "affiliates", label: "Affiliates", icon: User },
  { id: "referral-links", label: "Referral Link Lists", icon: Link2 },
  { id: "conversions", label: "Conversion Table", icon: DollarSign },
  { id: "payouts", label: "Manual Payouts", icon: DollarSign },
  { id: "settings", label: "Settings", icon: Settings },
];

const AffiliateLinks = () => {
  const [activeTab, setActiveTab] = useState("affiliates");

  // ——— Affiliates ———
  const [affiliateForm, setAffiliateForm] = useState(initialAffiliateForm);
  const [affiliateSubmitting, setAffiliateSubmitting] = useState(false);
  const [affiliateSearch, setAffiliateSearch] = useState("");
  const [affiliateStatusFilter, setAffiliateStatusFilter] = useState("");
  const [affiliatesList, setAffiliatesList] = useState([]);
  const [affiliatesPagination, setAffiliatesPagination] = useState({ total: 0, per_page: 15, current_page: 1, last_page: 1 });
  const [loadingAffiliates, setLoadingAffiliates] = useState(false);
  const [selectedAffiliate, setSelectedAffiliate] = useState(null);
  const [affiliateProfile, setAffiliateProfile] = useState(null);
  const [loadingAffiliateProfile, setLoadingAffiliateProfile] = useState(false);
  const [isEditAffiliateModalOpen, setIsEditAffiliateModalOpen] = useState(false);
  const [editAffiliateForm, setEditAffiliateForm] = useState({ name: "", status: "pending", place_of_residence: "" });
  const [editAffiliateSubmitting, setEditAffiliateSubmitting] = useState(false);
  const [isPasswordResetModalOpen, setIsPasswordResetModalOpen] = useState(false);
  const [passwordResetForm, setPasswordResetForm] = useState({ new_password: "", new_password_confirmation: "" });
  const [passwordResetSubmitting, setPasswordResetSubmitting] = useState(false);
  const affiliateSearchDebounce = useRef(null);

  // ——— Referral links ———
  const [referralSearch, setReferralSearch] = useState("");
  const [referralLinksStatusFilter, setReferralLinksStatusFilter] = useState("");
  const [referralLinksList, setReferralLinksList] = useState([]);
  const [referralLinksPagination, setReferralLinksPagination] = useState({ total: 0, per_page: 20, current_page: 1, last_page: 1 });
  const [loadingReferralLinks, setLoadingReferralLinks] = useState(false);
  const [exportingReferralLinks, setExportingReferralLinks] = useState(false);
  const [selectedReferralLinkForOverride, setSelectedReferralLinkForOverride] = useState(null);
  const [isManualOverrideModalOpen, setIsManualOverrideModalOpen] = useState(false);
  const [manualOverrideForm, setManualOverrideForm] = useState({
    status: "active",
    revenue: "",
    vendor_approved: false,
    custom_rate: "",
    attribution_model: "last_click",
  });
  const [manualOverrideSubmitting, setManualOverrideSubmitting] = useState(false);
  const referralSearchDebounce = useRef(null);

  // ——— Conversions ———
  const [conversionSearch, setConversionSearch] = useState("");
  const [conversionStatusFilter, setConversionStatusFilter] = useState("");
  const [conversionsList, setConversionsList] = useState([]);
  const [conversionsPagination, setConversionsPagination] = useState({ total: 0, per_page: 20, current_page: 1, last_page: 1 });
  const [loadingConversions, setLoadingConversions] = useState(false);
  const conversionSearchDebounce = useRef(null);

  // ——— Manual payouts ———
  const [payoutSearch, setPayoutSearch] = useState("");
  const [payoutStatusFilter, setPayoutStatusFilter] = useState("");
  const [payoutsList, setPayoutsList] = useState([]);
  const [payoutsPagination, setPayoutsPagination] = useState({ total: 0, per_page: 15, current_page: 1, last_page: 1 });
  const [loadingPayouts, setLoadingPayouts] = useState(false);
  const payoutSearchDebounce = useRef(null);

  // ——— Settings ———
  const [affiliateSettings, setAffiliateSettings] = useState({
    cookie_duration_days: 30,
    attribution_model: "last_click",
    ip_duplication_detection: true,
    self_referral_detection: true,
    suspicious_conversion_time_filter: true,
    blacklist_domains: "", // stored as string (newline-separated) for textarea; API uses array
    vendor_control_enabled: true,
  });
  const [loadingAffiliateSettings, setLoadingAffiliateSettings] = useState(false);
  const [savingAffiliateSettings, setSavingAffiliateSettings] = useState(false);

  const fetchAffiliates = async (page = 1) => {
    if (activeTab !== "affiliates") return;
    setLoadingAffiliates(true);
    try {
      const res = await getAffiliates({
        search: affiliateSearch.trim() || undefined,
        status: affiliateStatusFilter || undefined,
        per_page: 15,
        page,
      });
      const data = res.data?.data || {};
      const items = Array.isArray(data.items) ? data.items : [];
      const pagination = data.pagination || { total: 0, per_page: 15, current_page: 1, last_page: 1 };
      setAffiliatesList(items);
      setAffiliatesPagination(pagination);
    } catch (err) {
      console.error("Failed to fetch affiliates", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.response?.data?.message || "Failed to load affiliates",
        confirmButtonColor: BRAND,
      });
      setAffiliatesList([]);
      setAffiliatesPagination({ total: 0, per_page: 15, current_page: 1, last_page: 1 });
    } finally {
      setLoadingAffiliates(false);
    }
  };

  useEffect(() => {
    if (activeTab !== "affiliates") return;
    fetchAffiliates(1);
  }, [activeTab, affiliateStatusFilter]);

  useEffect(() => {
    if (activeTab !== "affiliates") return;
    if (affiliateSearchDebounce.current) clearTimeout(affiliateSearchDebounce.current);
    affiliateSearchDebounce.current = setTimeout(() => {
      fetchAffiliates(1);
    }, 400);
    return () => {
      if (affiliateSearchDebounce.current) clearTimeout(affiliateSearchDebounce.current);
    };
  }, [affiliateSearch]);

  useEffect(() => {
    if (!selectedAffiliate?.id) {
      setAffiliateProfile(null);
      return;
    }
    setLoadingAffiliateProfile(true);
    setAffiliateProfile(null);
    getAffiliate(selectedAffiliate.id)
      .then((res) => {
        const data = res.data?.data;
        setAffiliateProfile(data || null);
      })
      .catch((err) => {
        console.error("Failed to fetch affiliate profile", err);
        setAffiliateProfile(null);
      })
      .finally(() => setLoadingAffiliateProfile(false));
  }, [selectedAffiliate?.id]);

  const fetchReferralLinks = async (page = 1) => {
    if (activeTab !== "referral-links") return;
    setLoadingReferralLinks(true);
    try {
      const res = await getReferralLinks({
        search: referralSearch.trim() || undefined,
        status: referralLinksStatusFilter || undefined,
        per_page: 20,
        page,
      });
      const data = res.data?.data || {};
      const items = Array.isArray(data.items) ? data.items : [];
      const pagination = data.pagination || { total: 0, per_page: 20, current_page: 1, last_page: 1 };
      setReferralLinksList(items);
      setReferralLinksPagination(pagination);
    } catch (err) {
      console.error("Failed to fetch referral links", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.response?.data?.message || "Failed to load referral links",
        confirmButtonColor: BRAND,
      });
      setReferralLinksList([]);
      setReferralLinksPagination({ total: 0, per_page: 20, current_page: 1, last_page: 1 });
    } finally {
      setLoadingReferralLinks(false);
    }
  };

  useEffect(() => {
    if (activeTab !== "referral-links") return;
    fetchReferralLinks(1);
  }, [activeTab, referralLinksStatusFilter]);

  useEffect(() => {
    if (activeTab !== "referral-links") return;
    if (referralSearchDebounce.current) clearTimeout(referralSearchDebounce.current);
    referralSearchDebounce.current = setTimeout(() => {
      fetchReferralLinks(1);
    }, 400);
    return () => {
      if (referralSearchDebounce.current) clearTimeout(referralSearchDebounce.current);
    };
  }, [referralSearch]);

  const fetchConversions = async (page = 1) => {
    if (activeTab !== "conversions") return;
    setLoadingConversions(true);
    try {
      const res = await getConversions({
        search: conversionSearch.trim() || undefined,
        status: conversionStatusFilter || undefined,
        per_page: 20,
        page,
      });
      const data = res.data?.data || {};
      const items = Array.isArray(data.items) ? data.items : [];
      const pagination = data.pagination || { total: 0, per_page: 20, current_page: 1, last_page: 1 };
      setConversionsList(items);
      setConversionsPagination(pagination);
    } catch (err) {
      console.error("Failed to fetch conversions", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.response?.data?.message || "Failed to load conversions",
        confirmButtonColor: BRAND,
      });
      setConversionsList([]);
      setConversionsPagination({ total: 0, per_page: 20, current_page: 1, last_page: 1 });
    } finally {
      setLoadingConversions(false);
    }
  };

  useEffect(() => {
    if (activeTab !== "conversions") return;
    fetchConversions(1);
  }, [activeTab, conversionStatusFilter]);

  useEffect(() => {
    if (activeTab !== "conversions") return;
    if (conversionSearchDebounce.current) clearTimeout(conversionSearchDebounce.current);
    conversionSearchDebounce.current = setTimeout(() => {
      fetchConversions(1);
    }, 400);
    return () => {
      if (conversionSearchDebounce.current) clearTimeout(conversionSearchDebounce.current);
    };
  }, [conversionSearch]);

  const fetchManualPayouts = async (page = 1) => {
    if (activeTab !== "payouts") return;
    setLoadingPayouts(true);
    try {
      const res = await getManualPayouts({
        search: payoutSearch.trim() || undefined,
        status: payoutStatusFilter || undefined,
        per_page: 15,
        page,
      });
      const data = res.data?.data || {};
      const items = Array.isArray(data.items) ? data.items : [];
      const pagination = data.pagination || { total: 0, per_page: 15, current_page: 1, last_page: 1 };
      setPayoutsList(items);
      setPayoutsPagination(pagination);
    } catch (err) {
      console.error("Failed to fetch manual payouts", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.response?.data?.message || "Failed to load manual payouts",
        confirmButtonColor: BRAND,
      });
      setPayoutsList([]);
      setPayoutsPagination({ total: 0, per_page: 15, current_page: 1, last_page: 1 });
    } finally {
      setLoadingPayouts(false);
    }
  };

  useEffect(() => {
    if (activeTab !== "payouts") return;
    fetchManualPayouts(1);
  }, [activeTab, payoutStatusFilter]);

  useEffect(() => {
    if (activeTab !== "payouts") return;
    if (payoutSearchDebounce.current) clearTimeout(payoutSearchDebounce.current);
    payoutSearchDebounce.current = setTimeout(() => {
      fetchManualPayouts(1);
    }, 400);
    return () => {
      if (payoutSearchDebounce.current) clearTimeout(payoutSearchDebounce.current);
    };
  }, [payoutSearch]);

  const fetchAffiliateSettings = async () => {
    setLoadingAffiliateSettings(true);
    try {
      const res = await getAffiliateSettings();
      const data = res.data?.data || {};
      const domains = Array.isArray(data.blacklist_domains) ? data.blacklist_domains : [];
      setAffiliateSettings({
        cookie_duration_days: data.cookie_duration_days ?? 30,
        attribution_model: data.attribution_model || "last_click",
        ip_duplication_detection: data.ip_duplication_detection ?? true,
        self_referral_detection: data.self_referral_detection ?? true,
        suspicious_conversion_time_filter: data.suspicious_conversion_time_filter ?? true,
        blacklist_domains: domains.join("\n"),
        vendor_control_enabled: data.vendor_control_enabled ?? true,
      });
    } catch (err) {
      console.error("Failed to fetch affiliate settings", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.response?.data?.message || "Failed to load affiliate settings",
        confirmButtonColor: BRAND,
      });
    } finally {
      setLoadingAffiliateSettings(false);
    }
  };

  useEffect(() => {
    if (activeTab === "settings") fetchAffiliateSettings();
  }, [activeTab]);

  const handleSaveAffiliateSettings = async () => {
    const s = affiliateSettings;
    const cookieDays = Math.max(1, Math.min(365, Number(s.cookie_duration_days) || 30));
    const blacklistArr = (s.blacklist_domains || "")
      .split("\n")
      .map((d) => d.trim())
      .filter(Boolean);
    setSavingAffiliateSettings(true);
    try {
      const payload = {
        cookie_duration_days: cookieDays,
        attribution_model: s.attribution_model || "last_click",
        ip_duplication_detection: !!s.ip_duplication_detection,
        self_referral_detection: !!s.self_referral_detection,
        suspicious_conversion_time_filter: !!s.suspicious_conversion_time_filter,
        blacklist_domains: blacklistArr,
        vendor_control_enabled: !!s.vendor_control_enabled,
      };
      await updateAffiliateSettings(payload);
      setAffiliateSettings((prev) => ({ ...prev, cookie_duration_days: cookieDays }));
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Settings saved",
        showConfirmButton: false,
        timer: 1800,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.response?.data?.message || "Failed to save settings",
        confirmButtonColor: BRAND,
      });
    } finally {
      setSavingAffiliateSettings(false);
    }
  };

  const handleExportReferralLinks = async () => {
    setExportingReferralLinks(true);
    try {
      const res = await getReferralLinksExport({
        search: referralSearch.trim() || undefined,
        status: referralLinksStatusFilter || undefined,
      });
      const blob = res.data instanceof Blob ? res.data : new Blob([res.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `referral-links-export-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Export downloaded",
        showConfirmButton: false,
        timer: 1800,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Export failed",
        text: err?.response?.data?.message || "Failed to export referral links",
        confirmButtonColor: BRAND,
      });
    } finally {
      setExportingReferralLinks(false);
    }
  };

  const openManualOverrideModal = (row) => {
    if (!row) return;
    setSelectedReferralLinkForOverride(row);
    setManualOverrideForm({
      status: row.status || "active",
      revenue: row.reward != null ? String(row.reward) : "",
      vendor_approved: !!row.vendor_approved,
      custom_rate: row.custom_rate != null ? String(row.custom_rate) : "",
      attribution_model: row.attribution_model || "last_click",
    });
    setIsManualOverrideModalOpen(true);
  };

  const closeManualOverrideModal = () => {
    setIsManualOverrideModalOpen(false);
    setSelectedReferralLinkForOverride(null);
    setManualOverrideSubmitting(false);
  };

  const handleSubmitManualOverride = async (e) => {
    e.preventDefault();
    if (!selectedReferralLinkForOverride?.id) return;
    setManualOverrideSubmitting(true);
    try {
      const payload = {
        status: manualOverrideForm.status || "active",
        revenue: manualOverrideForm.revenue !== "" && !Number.isNaN(Number(manualOverrideForm.revenue)) ? Number(manualOverrideForm.revenue) : undefined,
        vendor_approved: manualOverrideForm.vendor_approved,
        custom_rate: manualOverrideForm.custom_rate !== "" && !Number.isNaN(Number(manualOverrideForm.custom_rate)) ? Number(manualOverrideForm.custom_rate) : undefined,
        attribution_model: manualOverrideForm.attribution_model || "last_click",
      };
      await updateReferralLink(selectedReferralLinkForOverride.id, payload);
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Referral link updated",
        showConfirmButton: false,
        timer: 1800,
      });
      closeManualOverrideModal();
      fetchReferralLinks(referralLinksPagination.current_page);
    } catch (err) {
      setManualOverrideSubmitting(false);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.response?.data?.message || "Failed to update referral link",
        confirmButtonColor: BRAND,
      });
    }
  };

  const handleDeleteReferralLink = async (row) => {
    const result = await Swal.fire({
      title: "Delete this referral link?",
      text: `${row.referrer || row.link_code || "Link"} → ${row.referred_user || "referred"}. This cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
    });
    if (!result.isConfirmed) return;
    try {
      Swal.showLoading();
      await deleteReferralLink(row.id);
      Swal.close();
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Referral link deleted",
        showConfirmButton: false,
        timer: 1800,
      });
      fetchReferralLinks(referralLinksPagination.current_page);
    } catch (err) {
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.response?.data?.message || "Failed to delete referral link",
        confirmButtonColor: BRAND,
      });
    }
  };

  const openEditAffiliateModal = (affiliate = null) => {
    const source = affiliate || affiliateProfile || selectedAffiliate;
    if (!source) return;
    setEditAffiliateForm({
      name: source.name || "",
      status: source.status || "pending",
      place_of_residence: source.place_of_residence || "",
    });
    setIsEditAffiliateModalOpen(true);
  };

  const closeEditAffiliateModal = () => {
    setIsEditAffiliateModalOpen(false);
    setEditAffiliateSubmitting(false);
  };

  const handleSubmitEditAffiliate = async (e) => {
    e.preventDefault();
    if (!selectedAffiliate?.id) return;
    const name = String(editAffiliateForm.name).trim();
    if (!name) {
      Swal.fire({ icon: "warning", title: "Validation", text: "Name is required", confirmButtonColor: BRAND });
      return;
    }
    setEditAffiliateSubmitting(true);
    try {
      const payload = {
        name,
        status: editAffiliateForm.status || "pending",
        place_of_residence: String(editAffiliateForm.place_of_residence || "").trim() || undefined,
      };
      const res = await updateAffiliate(selectedAffiliate.id, payload);
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Affiliate updated successfully",
        showConfirmButton: false,
        timer: 1800,
      });
      closeEditAffiliateModal();
      const updated = res.data?.data;
      if (updated) setAffiliateProfile(updated);
      fetchAffiliates(affiliatesPagination.current_page);
    } catch (err) {
      setEditAffiliateSubmitting(false);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.response?.data?.message || "Failed to update affiliate",
        confirmButtonColor: BRAND,
      });
    }
  };

  const handleDeleteAffiliate = async (affiliate) => {
    const result = await Swal.fire({
      title: "Delete this affiliate?",
      text: `${affiliate.name || "This affiliate"} will be permanently removed.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
    });
    if (!result.isConfirmed) return;
    try {
      Swal.showLoading();
      await deleteAffiliate(affiliate.id);
      Swal.close();
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Affiliate deleted successfully",
        showConfirmButton: false,
        timer: 1800,
      });
      if (selectedAffiliate?.id === affiliate.id) {
        setSelectedAffiliate(null);
        setAffiliateProfile(null);
      }
      fetchAffiliates(affiliatesPagination.current_page);
    } catch (err) {
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.response?.data?.message || "Failed to delete affiliate",
        confirmButtonColor: BRAND,
      });
    }
  };

  const openPasswordResetModal = () => {
    setPasswordResetForm({ new_password: "", new_password_confirmation: "" });
    setIsPasswordResetModalOpen(true);
  };

  const closePasswordResetModal = () => {
    setIsPasswordResetModalOpen(false);
    setPasswordResetSubmitting(false);
  };

  const handleSubmitPasswordReset = async (e) => {
    e.preventDefault();
    if (!selectedAffiliate?.id) return;
    const { new_password, new_password_confirmation } = passwordResetForm;
    if (!new_password) {
      Swal.fire({ icon: "warning", title: "Validation", text: "New password is required", confirmButtonColor: BRAND });
      return;
    }
    if (new_password !== new_password_confirmation) {
      Swal.fire({ icon: "warning", title: "Validation", text: "Passwords do not match", confirmButtonColor: BRAND });
      return;
    }
    setPasswordResetSubmitting(true);
    try {
      await affiliatePasswordReset(selectedAffiliate.id, {
        new_password,
        new_password_confirmation,
      });
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Password reset successfully",
        showConfirmButton: false,
        timer: 1800,
      });
      closePasswordResetModal();
    } catch (err) {
      setPasswordResetSubmitting(false);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.response?.data?.message || "Failed to reset password",
        confirmButtonColor: BRAND,
      });
    }
  };

  const handleGenerateAffiliateId = async (e) => {
    e.preventDefault();
    const { name, email, phone, password, password_confirmation, terms_accepted } = affiliateForm;
    if (!name?.trim()) {
      Swal.fire({ icon: "warning", title: "Validation", text: "Name is required", confirmButtonColor: BRAND });
      return;
    }
    if (!email?.trim()) {
      Swal.fire({ icon: "warning", title: "Validation", text: "Email is required", confirmButtonColor: BRAND });
      return;
    }
    if (!phone?.trim()) {
      Swal.fire({ icon: "warning", title: "Validation", text: "Phone number is required", confirmButtonColor: BRAND });
      return;
    }
    if (!password) {
      Swal.fire({ icon: "warning", title: "Validation", text: "Password is required", confirmButtonColor: BRAND });
      return;
    }
    if (password !== password_confirmation) {
      Swal.fire({ icon: "warning", title: "Validation", text: "Password and confirmation do not match", confirmButtonColor: BRAND });
      return;
    }
    if (!terms_accepted) {
      Swal.fire({ icon: "warning", title: "Validation", text: "Please agree to the terms and conditions", confirmButtonColor: BRAND });
      return;
    }
    setAffiliateSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        password_confirmation,
        social_media: affiliateForm.social_media?.trim() || "",
        traffic_details: affiliateForm.traffic_details?.trim() || "",
        marketing_channel: affiliateForm.marketing_channel?.trim() || "",
        payment_info: affiliateForm.payment_info?.trim() || "",
        terms_accepted: true,
        place_of_residence: affiliateForm.place_of_residence?.trim() || "",
        status: affiliateForm.status || "pending",
      };
      const res = await createAffiliate(payload);
      setAffiliateSubmitting(false);
      const data = res.data?.data || {};
      const code = data.affiliate_code;
      const msg = data.message || res.data?.message || "Affiliate created successfully.";
      Swal.fire({
        icon: "success",
        title: "Affiliate created",
        html: code
          ? `<p class="text-left mb-2">${msg}</p><p class="text-left font-mono font-semibold text-gray-800">Affiliate ID: ${code}</p>`
          : msg,
        confirmButtonColor: BRAND,
      });
      setAffiliateForm({ ...initialAffiliateForm });
      fetchAffiliates(1);
    } catch (err) {
      setAffiliateSubmitting(false);
      const msg = err?.response?.data?.message || err?.message || "Failed to create affiliate.";
      const errors = err?.response?.data?.data?.errors ?? err?.response?.data?.errors;
      let detail = msg;
      if (errors && typeof errors === "object") {
        const parts = Object.entries(errors).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(" ") : v}`);
        if (parts.length) detail = `${msg}\n\n${parts.join("\n")}`;
      }
      Swal.fire({ icon: "error", title: "Error", text: detail, confirmButtonColor: BRAND });
    }
  };

  return (
    <div className="space-y-6 px-6 py-4">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-1 uppercase tracking-wide">
          Affiliate Program Flow
        </h1>
        <p className="text-sm text-gray-600 border-b border-gray-200 pb-2">
          Admin Panel Management System
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

      {/* ——— Tab: Affiliates ——— */}
      {activeTab === "affiliates" && (
        <>
          {/* Add Affiliate form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-base font-semibold text-gray-800">Add Affiliate</h2>
            </div>
            <form onSubmit={handleGenerateAffiliateId} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={affiliateForm.name}
                    onChange={(e) => setAffiliateForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Full name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                  <input
                    type="email"
                    value={affiliateForm.email}
                    onChange={(e) => setAffiliateForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="email@example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone number</label>
                  <input
                    type="text"
                    value={affiliateForm.phone}
                    onChange={(e) => setAffiliateForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="+1234567890"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
                  <input
                    type="password"
                    value={affiliateForm.password}
                    onChange={(e) => setAffiliateForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder="Login password for affiliate"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password <span className="text-red-500">*</span></label>
                  <input
                    type="password"
                    value={affiliateForm.password_confirmation}
                    onChange={(e) => setAffiliateForm((f) => ({ ...f, password_confirmation: e.target.value }))}
                    placeholder="Re-enter password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Social media account</label>
                  <input
                    type="text"
                    value={affiliateForm.social_media}
                    onChange={(e) => setAffiliateForm((f) => ({ ...f, social_media: e.target.value }))}
                    placeholder="Handle or profile URL"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Traffic details</label>
                  <input
                    type="text"
                    value={affiliateForm.traffic_details}
                    onChange={(e) => setAffiliateForm((f) => ({ ...f, traffic_details: e.target.value }))}
                    placeholder="Traffic source / volume"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marketing channel</label>
                  <input
                    type="text"
                    value={affiliateForm.marketing_channel}
                    onChange={(e) => setAffiliateForm((f) => ({ ...f, marketing_channel: e.target.value }))}
                    placeholder="e.g. Instagram, YouTube"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Place of residence</label>
                  <input
                    type="text"
                    value={affiliateForm.place_of_residence}
                    onChange={(e) => setAffiliateForm((f) => ({ ...f, place_of_residence: e.target.value }))}
                    placeholder="e.g. New York"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/50"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment information</label>
                  <input
                    type="text"
                    value={affiliateForm.payment_info}
                    onChange={(e) => setAffiliateForm((f) => ({ ...f, payment_info: e.target.value }))}
                    placeholder="Bank/PayPal details"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/50"
                  />
                </div>
                <div className="md:col-span-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={affiliateForm.terms_accepted}
                    onChange={(e) => setAffiliateForm((f) => ({ ...f, terms_accepted: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700">
                    I agree to the terms and conditions
                  </label>
                </div>
              </div>
              <button
                type="submit"
                disabled={affiliateSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white rounded-lg hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ backgroundColor: BRAND }}
              >
                {affiliateSubmitting ? "Creating…" : "Generate affiliate ID"}
              </button>
            </form>
          </div>

          {/* Search + table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border-b border-gray-200">
              <div className="flex flex-wrap items-center gap-2 flex-1">
                <div className="relative flex-1 min-w-[200px] max-w-sm flex gap-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={affiliateSearch}
                    onChange={(e) => setAffiliateSearch(e.target.value)}
                    placeholder="Search by name, email, affiliate code, phone"
                    className="flex-1 pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/50"
                  />
                </div>
                <select
                  value={affiliateStatusFilter}
                  onChange={(e) => setAffiliateStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/50"
                >
                  <option value="">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="banned">Banned</option>
                </select>
                <button
                  type="button"
                  onClick={() => fetchAffiliates(1)}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Search
                </button>
              </div>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                style={{ backgroundColor: BRAND }}
              >
                <Plus className="w-4 h-4" />
                Add affiliate
              </button>
            </div>
            <div className="overflow-x-auto">
              {loadingAffiliates ? (
                <div className="px-4 py-12 text-center text-sm text-gray-500">Loading affiliates…</div>
              ) : (
                <table className="min-w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Name / Affiliate ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Phone / Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Links & codes</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Sales / Conversions</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Payout status</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {affiliatesList.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-500">
                          No affiliates found. Add one using the form above or adjust search/filter.
                        </td>
                      </tr>
                    ) : (
                      affiliatesList.map((row) => (
                        <tr
                          key={row.id}
                          onClick={() => setSelectedAffiliate(row)}
                          className={`hover:bg-gray-50/50 cursor-pointer ${selectedAffiliate?.id === row.id ? "bg-orange-50/50" : ""}`}
                        >
                          <td className="px-4 py-3 text-sm">
                            <span className="font-medium text-gray-900">{row.name}</span>
                            {row.affiliate_code && (
                              <span className="block text-xs text-gray-500 font-mono mt-0.5">{row.affiliate_code}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{row.phone || "—"} / {row.email || "—"}</td>
                          <td className="px-4 py-3">
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 capitalize">{row.status || "—"}</span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 font-mono">{row.affiliate_code || "—"}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">—</td>
                          <td className="px-4 py-3 text-sm text-gray-600">—</td>
                          <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                            <button type="button" onClick={() => { setSelectedAffiliate(row); openEditAffiliateModal(row); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Edit"><Edit3 className="w-4 h-4" /></button>
                            <button type="button" onClick={() => handleDeleteAffiliate(row)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg ml-1" title="Delete"><Trash2 className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
            {affiliatesPagination.last_page > 1 && (
              <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
                <span>
                  Page {affiliatesPagination.current_page} of {affiliatesPagination.last_page} ({affiliatesPagination.total} total)
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={affiliatesPagination.current_page <= 1}
                    onClick={() => fetchAffiliates(affiliatesPagination.current_page - 1)}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={affiliatesPagination.current_page >= affiliatesPagination.last_page}
                    onClick={() => fetchAffiliates(affiliatesPagination.current_page + 1)}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile section (when row selected – full profile from GET /api/affiliates/:id) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-base font-semibold text-gray-800">Profile</h2>
            </div>
            <div className="p-6">
              {!selectedAffiliate ? (
                <p className="text-gray-500 text-sm">Select an affiliate from the table to see profile details and actions.</p>
              ) : loadingAffiliateProfile ? (
                <p className="text-gray-500 text-sm">Loading profile…</p>
              ) : affiliateProfile ? (
                <div className="space-y-4">
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    <div><dt className="text-gray-500 font-medium">Name</dt><dd className="text-gray-900 mt-0.5">{affiliateProfile.name || "—"}</dd></div>
                    <div><dt className="text-gray-500 font-medium">Email</dt><dd className="text-gray-900 mt-0.5">{affiliateProfile.email || "—"}</dd></div>
                    <div><dt className="text-gray-500 font-medium">Phone</dt><dd className="text-gray-900 mt-0.5">{affiliateProfile.phone || "—"}</dd></div>
                    <div><dt className="text-gray-500 font-medium">Affiliate ID</dt><dd className="text-gray-900 font-mono mt-0.5">{affiliateProfile.affiliate_code || "—"}</dd></div>
                    <div><dt className="text-gray-500 font-medium">Status</dt><dd className="mt-0.5 capitalize">{affiliateProfile.status || "—"}</dd></div>
                    <div><dt className="text-gray-500 font-medium">Place of residence</dt><dd className="text-gray-900 mt-0.5">{affiliateProfile.place_of_residence || "—"}</dd></div>
                    <div className="sm:col-span-2"><dt className="text-gray-500 font-medium">Social media</dt><dd className="text-gray-900 mt-0.5 break-all">{affiliateProfile.social_media || "—"}</dd></div>
                    <div className="sm:col-span-2"><dt className="text-gray-500 font-medium">Traffic details</dt><dd className="text-gray-900 mt-0.5">{affiliateProfile.traffic_details || "—"}</dd></div>
                    <div><dt className="text-gray-500 font-medium">Marketing channel</dt><dd className="text-gray-900 mt-0.5">{affiliateProfile.marketing_channel || "—"}</dd></div>
                    <div className="sm:col-span-2"><dt className="text-gray-500 font-medium">Payment info</dt><dd className="text-gray-900 mt-0.5">{affiliateProfile.payment_info || "—"}</dd></div>
                    <div><dt className="text-gray-500 font-medium">Terms accepted at</dt><dd className="text-gray-900 mt-0.5">{affiliateProfile.terms_accepted_at ? new Date(affiliateProfile.terms_accepted_at).toLocaleString() : "—"}</dd></div>
                    <div><dt className="text-gray-500 font-medium">Last seen</dt><dd className="text-gray-900 mt-0.5">{affiliateProfile.last_seen_at ? new Date(affiliateProfile.last_seen_at).toLocaleString() : "—"}</dd></div>
                    <div><dt className="text-gray-500 font-medium">Joined</dt><dd className="text-gray-900 mt-0.5">{affiliateProfile.created_at ? new Date(affiliateProfile.created_at).toLocaleDateString() : "—"}</dd></div>
                    <div><dt className="text-gray-500 font-medium">Updated</dt><dd className="text-gray-900 mt-0.5">{affiliateProfile.updated_at ? new Date(affiliateProfile.updated_at).toLocaleString() : "—"}</dd></div>
                  </dl>
                  {affiliateProfile.user && (
                    <div className="pt-3 border-t border-gray-100">
                      <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Linked user</h3>
                      <p className="text-sm text-gray-700">{affiliateProfile.user.name} · {affiliateProfile.user.email}</p>
                    </div>
                  )}
                  <div className="pt-4 flex flex-wrap gap-3">
                    <button type="button" onClick={() => openEditAffiliateModal()} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white rounded-lg hover:opacity-90" style={{ backgroundColor: BRAND }}>
                      <Edit3 className="w-4 h-4" /> Edit
                    </button>
                    <button type="button" onClick={openPasswordResetModal} className="text-blue-600 hover:underline font-medium text-sm">Password reset</button>
                    <button type="button" onClick={() => handleDeleteAffiliate(selectedAffiliate)} className="text-red-600 hover:underline font-medium text-sm">Delete</button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Could not load profile. Try selecting again.</p>
              )}
            </div>
          </div>

          {/* Edit Affiliate modal (PUT /api/affiliates/:id) */}
          {isEditAffiliateModalOpen && selectedAffiliate?.id && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeEditAffiliateModal}>
              <div className="bg-white rounded-xl shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Update affiliate</h2>
                  <button type="button" onClick={closeEditAffiliateModal} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleSubmitEditAffiliate} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={editAffiliateForm.name}
                      onChange={(e) => setEditAffiliateForm((f) => ({ ...f, name: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={editAffiliateForm.status}
                      onChange={(e) => setEditAffiliateForm((f) => ({ ...f, status: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/50"
                    >
                      <option value="pending">Pending</option>
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="banned">Banned</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Place of residence</label>
                    <input
                      type="text"
                      value={editAffiliateForm.place_of_residence}
                      onChange={(e) => setEditAffiliateForm((f) => ({ ...f, place_of_residence: e.target.value }))}
                      placeholder="e.g. Los Angeles"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/50"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={closeEditAffiliateModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                      Cancel
                    </button>
                    <button type="submit" disabled={editAffiliateSubmitting} className="px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 disabled:opacity-60" style={{ backgroundColor: BRAND }}>
                      {editAffiliateSubmitting ? "Updating…" : "Update"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Password reset modal (POST /api/affiliates/:id/password-reset) */}
          {isPasswordResetModalOpen && selectedAffiliate?.id && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closePasswordResetModal}>
              <div className="bg-white rounded-xl shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Password reset</h2>
                  <button type="button" onClick={closePasswordResetModal} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleSubmitPasswordReset} className="p-6 space-y-4">
                  <p className="text-sm text-gray-600">Set a new password for {selectedAffiliate.name || "this affiliate"}.</p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New password <span className="text-red-500">*</span></label>
                    <input
                      type="password"
                      value={passwordResetForm.new_password}
                      onChange={(e) => setPasswordResetForm((f) => ({ ...f, new_password: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm new password <span className="text-red-500">*</span></label>
                    <input
                      type="password"
                      value={passwordResetForm.new_password_confirmation}
                      onChange={(e) => setPasswordResetForm((f) => ({ ...f, new_password_confirmation: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/50"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={closePasswordResetModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                      Cancel
                    </button>
                    <button type="submit" disabled={passwordResetSubmitting} className="px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 disabled:opacity-60" style={{ backgroundColor: BRAND }}>
                      {passwordResetSubmitting ? "Resetting…" : "Reset password"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}

      {/* ——— Tab: Referral Link Lists ——— */}
      {activeTab === "referral-links" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-base font-semibold text-gray-800">Referral link lists</h2>
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative flex-1 min-w-[180px] max-w-sm flex gap-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={referralSearch}
                  onChange={(e) => setReferralSearch(e.target.value)}
                  placeholder="Search by referrer, referred"
                  className="flex-1 pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/50"
                />
              </div>
              <select
                value={referralLinksStatusFilter}
                onChange={(e) => setReferralLinksStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/50"
              >
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
              <button type="button" onClick={() => fetchReferralLinks(1)} className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                Search
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={handleExportReferralLinks} disabled={exportingReferralLinks} className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-60 disabled:cursor-not-allowed"><Download className="w-4 h-4" /> {exportingReferralLinks ? "Exporting…" : "Export"}</button>
              <button type="button" className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100">Delete</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            {loadingReferralLinks ? (
              <div className="px-4 py-12 text-center text-sm text-gray-500">Loading referral links…</div>
            ) : (
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Referrer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Referred user</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Reward</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Manual override</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Commission system type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Link code</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Clicks / Conversions</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {referralLinksList.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-4 py-12 text-center text-sm text-gray-500">No referral links found. Adjust search or filter.</td>
                    </tr>
                  ) : (
                    referralLinksList.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 text-sm text-gray-900">{row.referrer || "—"}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{row.referred_user || "—"}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 capitalize">{row.status || "—"}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{row.reward != null ? row.reward : "—"}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{row.date ? new Date(row.date).toLocaleString() : "—"}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{row.manual_override ? "Yes" : "No"}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{row.commission_system_type ?? "—"}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 font-mono">{row.link_code || "—"}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{row.clicks_count ?? 0} / {row.conversions ?? 0}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex gap-2 justify-end">
                            <button type="button" onClick={() => openManualOverrideModal(row)} className="px-2 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Override</button>
                            <button type="button" onClick={() => handleDeleteReferralLink(row)} className="px-2 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
          {referralLinksPagination.last_page > 1 && (
            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
              <span>
                Page {referralLinksPagination.current_page} of {referralLinksPagination.last_page} ({referralLinksPagination.total} total)
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={referralLinksPagination.current_page <= 1}
                  onClick={() => fetchReferralLinks(referralLinksPagination.current_page - 1)}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={referralLinksPagination.current_page >= referralLinksPagination.last_page}
                  onClick={() => fetchReferralLinks(referralLinksPagination.current_page + 1)}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Manual override modal (PUT /referral-links/:id) */}
          {isManualOverrideModalOpen && selectedReferralLinkForOverride?.id && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeManualOverrideModal}>
              <div className="bg-white rounded-xl shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Manual override</h2>
                  <button type="button" onClick={closeManualOverrideModal} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="px-6 pt-4 text-sm text-gray-600">Link: {selectedReferralLinkForOverride.referrer || selectedReferralLinkForOverride.link_code} → {selectedReferralLinkForOverride.referred_user}</p>
                <form onSubmit={handleSubmitManualOverride} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={manualOverrideForm.status}
                      onChange={(e) => setManualOverrideForm((f) => ({ ...f, status: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/50"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Revenue (total reward)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={manualOverrideForm.revenue}
                      onChange={(e) => setManualOverrideForm((f) => ({ ...f, revenue: e.target.value }))}
                      placeholder="e.g. 200.00"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Custom rate (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={manualOverrideForm.custom_rate}
                      onChange={(e) => setManualOverrideForm((f) => ({ ...f, custom_rate: e.target.value }))}
                      placeholder="0–100"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Attribution model</label>
                    <select
                      value={manualOverrideForm.attribution_model}
                      onChange={(e) => setManualOverrideForm((f) => ({ ...f, attribution_model: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/50"
                    >
                      <option value="first_click">First click</option>
                      <option value="last_click">Last click</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="vendor_approved"
                      checked={manualOverrideForm.vendor_approved}
                      onChange={(e) => setManualOverrideForm((f) => ({ ...f, vendor_approved: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="vendor_approved" className="text-sm font-medium text-gray-700">Vendor approved</label>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={closeManualOverrideModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                      Cancel
                    </button>
                    <button type="submit" disabled={manualOverrideSubmitting} className="px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 disabled:opacity-60" style={{ backgroundColor: BRAND }}>
                      {manualOverrideSubmitting ? "Saving…" : "Save"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ——— Tab: Conversion Table ——— */}
      {activeTab === "conversions" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-base font-semibold text-gray-800">Conversion table</h2>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[180px] max-w-sm flex gap-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={conversionSearch}
                  onChange={(e) => setConversionSearch(e.target.value)}
                  placeholder="Search by affiliate ID, product"
                  className="flex-1 pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/50"
                />
              </div>
              <select
                value={conversionStatusFilter}
                onChange={(e) => setConversionStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/50"
              >
                <option value="">All statuses</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
              <button type="button" onClick={() => fetchConversions(1)} className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                Search
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            {loadingConversions ? (
              <div className="px-4 py-12 text-center text-sm text-gray-500">Loading conversions…</div>
            ) : (
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">User / Order ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Affiliate ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Product / Plan</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Sale amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Commission amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {conversionsList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-500">No conversions found. Adjust search or filter.</td>
                    </tr>
                  ) : (
                    conversionsList.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 text-sm text-gray-900">{row.user_order_id || "—"}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className="text-gray-900">{row.affiliate_id || "—"}</span>
                          {row.affiliate_name && <span className="block text-xs text-gray-500">{row.affiliate_name}</span>}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{row.product_plan || "—"}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">${row.sale_amount != null ? Number(row.sale_amount).toFixed(2) : "—"}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">${row.commission_amount != null ? Number(row.commission_amount).toFixed(2) : "—"}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 capitalize">{row.status || "—"}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
          {conversionsPagination.last_page > 1 && (
            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
              <span>
                Page {conversionsPagination.current_page} of {conversionsPagination.last_page} ({conversionsPagination.total} total)
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={conversionsPagination.current_page <= 1}
                  onClick={() => fetchConversions(conversionsPagination.current_page - 1)}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={conversionsPagination.current_page >= conversionsPagination.last_page}
                  onClick={() => fetchConversions(conversionsPagination.current_page + 1)}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ——— Tab: Manual Payouts ——— */}
      {activeTab === "payouts" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-base font-semibold text-gray-800">Manual payouts</h2>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[180px] max-w-sm flex gap-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={payoutSearch}
                  onChange={(e) => setPayoutSearch(e.target.value)}
                  placeholder="Search by affiliate name or vendor name"
                  className="flex-1 pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/50"
                />
              </div>
              <select
                value={payoutStatusFilter}
                onChange={(e) => setPayoutStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/50"
              >
                <option value="">All statuses</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
              </select>
              <button type="button" onClick={() => fetchManualPayouts(1)} className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                Search
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            {loadingPayouts ? (
              <div className="px-4 py-12 text-center text-sm text-gray-500">Loading manual payouts…</div>
            ) : (
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Vendor name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Product / Service</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Sales</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Vendor commission</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Vendor commission amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Affiliate name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Affiliate commission</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Total payout</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Action pay</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payoutsList.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-12 text-center text-sm text-gray-500">No manual payouts found. Adjust search or filter.</td>
                    </tr>
                  ) : (
                    payoutsList.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 text-sm text-gray-900">{row.vendor_name || "—"}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{row.product_service || "—"}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">${row.sales != null ? Number(row.sales).toFixed(2) : "—"}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{row.vendor_commission_pct != null ? `${row.vendor_commission_pct}%` : "—"}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">${row.vendor_commission_amount != null ? Number(row.vendor_commission_amount).toFixed(2) : "—"}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{row.affiliate_name || "—"}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{row.affiliate_commission_pct != null ? `${row.affiliate_commission_pct}%` : "—"}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">${row.total_payout != null ? Number(row.total_payout).toFixed(2) : "—"}</td>
                        <td className="px-4 py-3 text-right">
                          <button type="button" disabled={row.status === "paid"} className="px-3 py-1.5 text-sm font-medium text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed" style={{ backgroundColor: BRAND }}>Pay</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
          {payoutsPagination.last_page > 1 && (
            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
              <span>
                Page {payoutsPagination.current_page} of {payoutsPagination.last_page} ({payoutsPagination.total} total)
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={payoutsPagination.current_page <= 1}
                  onClick={() => fetchManualPayouts(payoutsPagination.current_page - 1)}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={payoutsPagination.current_page >= payoutsPagination.last_page}
                  onClick={() => fetchManualPayouts(payoutsPagination.current_page + 1)}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ——— Tab: Settings ——— */}
      {activeTab === "settings" && (
        <div className="space-y-6">
          <p className="text-sm text-gray-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
            <strong>Note:</strong> Influencer screen will be on company website.
          </p>

          {loadingAffiliateSettings ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-sm text-gray-500">
              Loading affiliate settings…
            </div>
          ) : (
            <>
              {/* Vendor control */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-gray-600" />
                    <h2 className="text-base font-semibold text-gray-800">Vendor control</h2>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={affiliateSettings.vendor_control_enabled}
                      onChange={(e) => setAffiliateSettings((s) => ({ ...s, vendor_control_enabled: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">Enabled</span>
                  </label>
                </div>
                <ul className="p-6 space-y-3 text-sm text-gray-700">
                  <li className="flex items-center gap-2">• Can approve influencers</li>
                  <li className="flex items-center gap-2">• Set custom rates and commission system</li>
                  <li className="flex items-center gap-2">• Ban certain affiliates</li>
                  <li className="flex items-center gap-2">• Set market asset promotions</li>
                </ul>
              </div>

              {/* Tracking & attribution */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-base font-semibold text-gray-800">1 Tracking & attribution</h2>
                </div>
                <div className="p-6 space-y-4">
                  <p className="text-sm text-gray-600">Unique referral link per affiliate.</p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cookie duration (days)</label>
                    <input
                      type="number"
                      min={1}
                      max={365}
                      value={affiliateSettings.cookie_duration_days}
                      onChange={(e) => setAffiliateSettings((s) => ({ ...s, cookie_duration_days: Number(e.target.value) || 30 }))}
                      className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Attribution model</label>
                    <select
                      value={affiliateSettings.attribution_model}
                      onChange={(e) => setAffiliateSettings((s) => ({ ...s, attribution_model: e.target.value }))}
                      className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/50"
                    >
                      <option value="first_click">First click</option>
                      <option value="last_click">Last click</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Fraud & compliance */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-base font-semibold text-gray-800">2 Fraud & compliance</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="ip_dup"
                      checked={affiliateSettings.ip_duplication_detection}
                      onChange={(e) => setAffiliateSettings((s) => ({ ...s, ip_duplication_detection: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="ip_dup">IP duplication detection</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="self_ref"
                      checked={affiliateSettings.self_referral_detection}
                      onChange={(e) => setAffiliateSettings((s) => ({ ...s, self_referral_detection: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="self_ref">Self-referral detection</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="suspicious"
                      checked={affiliateSettings.suspicious_conversion_time_filter}
                      onChange={(e) => setAffiliateSettings((s) => ({ ...s, suspicious_conversion_time_filter: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="suspicious">Suspicious conversion time filter</label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Blacklist domains (one per line)</label>
                    <textarea
                      value={affiliateSettings.blacklist_domains}
                      onChange={(e) => setAffiliateSettings((s) => ({ ...s, blacklist_domains: e.target.value }))}
                      rows={4}
                      placeholder="example.com&#10;spam.net"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/50"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveAffiliateSettings}
                    disabled={savingAffiliateSettings}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ backgroundColor: BRAND }}
                  >
                    {savingAffiliateSettings ? "Saving…" : "Save settings"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AffiliateLinks;
