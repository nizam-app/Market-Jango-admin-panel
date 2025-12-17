// src/pages/Vendor.jsx
import React, { useEffect, useMemo, useState } from 'react';
import axiosClient from '../api/axiosClient'; // keep axiosClient untouched

import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { VendorModal } from '../components/vendor/VendorModal';
import { createVendor } from "../api/vendorAPI";
import { updateUserInfo } from "../api/userApi";
import { CheckCircle2, XCircle, Clock, MoreVertical, Edit3, Trash2 } from "lucide-react";

const BRAND = '#FF8C00';

const styles = {
  page: { padding: 24, fontFamily: "'Inter', system-ui, Arial, sans-serif", background: '#f7f8fb', minHeight: '100vh' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  title: { fontSize: 20, fontWeight: 700, color: '#111' },
  card: { background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 6px 18px rgba(16,24,40,0.06)' },
  tabs: { display: 'flex', gap: 10 },
  tabBtn: (active) => ({
    padding: '8px 14px',
    borderRadius: 999,
    border: active ? `2px solid ${BRAND}` : '1px solid #e6e6e9',
    background: active ? `${BRAND}20` : '#fff',
    color: active ? BRAND : '#333',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 13,
  }),
  tableWrap: { overflowX: 'auto', marginTop: 14 },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: 900 },
  th: { textAlign: 'left', padding: '12px 14px', borderBottom: '1px solid #f0f0f3', color: '#666', fontSize: 13 },
  td: { padding: '12px 14px', borderBottom: '1px solid #fbfbfc', verticalAlign: 'middle' },
  vendorName: { fontWeight: 700, fontSize: 14, marginBottom: 4 },
  vendorEmail: { fontSize: 13, color: '#777' },
  vendorNote: { fontSize: 12, color: '#b91c1c', marginTop: 4 },
  statusPill: (status) => ({
    display: 'inline-block',
    padding: '6px 10px',
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 700,
    color: status === 'Approved' ? '#064e3b' : status === 'Pending' ? '#92400e' : '#7f1d1d',
    background: status === 'Approved' ? '#d1fae5' : status === 'Pending' ? '#fff7ed' : '#fee2e2',
    border: '1px solid rgba(0,0,0,0.03)',
  }),
  actions: { display: 'flex', gap: 8, alignItems: 'center' },
  btn: (opts = {}) => ({
    padding: '8px 10px',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: 13,
    display: 'inline-flex',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    ...(opts.ghost
      ? { background: '#fff', color: '#333', border: '1px solid #e6e6e9' }
      : { background: BRAND, color: '#fff', boxShadow: '0 6px 14px rgba(255,140,0,0.14)' }),
  }),
  pager: { display: 'flex', gap: 8, alignItems: 'center', marginTop: 16, justifyContent: 'flex-end' },
  smallMuted: { color: '#666', fontSize: 13 },

  /* Modal styles */
  modalOverlay: { position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, background: 'rgba(3,7,18,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 },
  modalCard: { width: '90%', maxWidth: 1000, background: '#fff', borderRadius: 12, padding: 18, boxShadow: '0 12px 48px rgba(2,6,23,0.4)', maxHeight: '85vh', overflowY: 'auto' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  profileRow: { display: 'flex', gap: 14, alignItems: 'center', marginBottom: 12 },
  avatar: { width: 72, height: 72, borderRadius: 12, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#444', fontSize: 20 },
  metaGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
  productTable: { width: '100%', borderCollapse: 'collapse', marginTop: 10 },
  productTh: { textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid #eee', fontSize: 13, color: '#555' },
  productTd: { padding: '8px 10px', borderBottom: '1px solid #fafafa' },
};

const STATUS_MAP = {
  All: null,
  'Registered Vendors': 'Approved',
  'Pending Vendors': 'Pending',
  'Suspended Vendors': 'Rejected',
};

const PAGE_SIZE = 10;

const Vendor = () => {
  const [filter, setFilter] = useState('All');
  const [vendors, setVendors] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0, per_page: PAGE_SIZE });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);


  // modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalVendorRaw, setModalVendorRaw] = useState(null);
  const [modalVendorDetail, setModalVendorDetail] = useState(null);
  const [modalProducts, setModalProducts] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editingVendor, setEditingVendor] = useState(null);






  useEffect(() => setPage(1), [filter]);

  useEffect(() => {
    fetchVendors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, page]);

  // Outside click detection for menu
  useEffect(() => {
    if (openMenuId === null) return;

    const handleClickOutside = (event) => {
      const target = event.target;
      const isMenu = target.closest(".menu-container");
      const isTrigger = target.closest(".menu-trigger");
      if (!isMenu && !isTrigger) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuId]);

  // -------- Helper: update vendor status (PUT) ----------
  const updateVendorStatus = async (vendorProfileId, status, note) => {
    try {
      const payload = note
        ? { status, note }   // Rejected হলে note সহ যাবে
        : { status };        // অন্যগুলো শুধু status

      const res = await axiosClient.put(
        `/vendor/status-update/${vendorProfileId}`,
        payload
      );
      return res.data;
    } catch (err) {
      throw new err;
    }
  };


  // -------- Fetch vendors ----------
  async function fetchVendors() {
    setLoading(true);
    setError(null);
    try {
      const statusParam = STATUS_MAP[filter];
      const params = { page };
      if (statusParam) params.status = statusParam;

      const { data: resp } = await axiosClient.get('/admin-vendor', { params });

      if (resp?.status === 'success' && resp?.data) {
        const payload = resp.data;
        const vendorsRaw = payload.data || [];
        const mapped = vendorsRaw.map((v) => ({
          // user level id
          id: v.id,
          // status update এর জন্য লাগবে vendor table এর id
          vendorProfileId: v.vendor?.id ?? null,
          name: v.name || v.email || `Vendor #${v.id}`,
          email: v.email || '-',
          created_at: v.created_at,
          status: v.status,
          // তোমার রেসপন্স অনুযায়ী product_count আছে user লেভেলে
          products_count:
            v.product_count ??
            (Array.isArray(v.vendor?.products) ? v.vendor.products.length : '-') ??
            '-',
          note: v.note ?? v.raw?.note ?? null,
          raw: v,
        }));

        setVendors(mapped);
        setMeta({
          current_page: payload.current_page || 1,
          last_page: payload.last_page || 1,
          total: payload.total || mapped.length,
          per_page: payload.per_page || PAGE_SIZE,
        });
      } else {
        setVendors([]);
        setMeta({ current_page: 1, last_page: 1, total: 0, per_page: PAGE_SIZE });
        setError('Unexpected API response structure.');
      }
    } catch (err) {
      console.error('fetchVendors err', err);
      setError(err?.response?.data?.message || err.message || 'Failed to fetch vendors');
      setVendors([]);
    } finally {
      setLoading(false);
    }
  }

  

  // -------- Actions with SweetAlert confirmations ----------
  // -------- Actions with SweetAlert confirmations ----------
  const confirmAndUpdate = async (vendorProfileId, newStatus) => {
    let note = undefined;

    // 🔴 Reject case: note নেয়ার জন্য আলাদা popup
    if (newStatus === 'Rejected') {
      const result = await Swal.fire({
        title: 'Reject Vendor',
        html: 'Please write a short note explaining why you are rejecting this vendor.',
        input: 'textarea',
        inputLabel: 'Rejection note',
        inputPlaceholder: 'e.g. Documents not clear. Please re-upload.',
        inputAttributes: {
          'aria-label': 'Rejection note',
        },
        showCancelButton: true,
        confirmButtonText: 'Reject',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#b91c1c',
        focusConfirm: false,
        inputValidator: (value) => {
          if (!value || !value.trim()) {
            return 'Please add a short note before rejecting.';
          }
          return null;
        },
      });

      if (result.isDismissed) return;         // cancel করলে কিছু করবে না
      note = result.value.trim();             // note set করলাম
    } else {
      // ✅ Approved / Pending এর জন্য আগের confirm popup
      const result = await Swal.fire({
        title: 'Are you sure?',
        html: `You are changing vendor status to <strong>${newStatus}</strong>.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, change it',
        cancelButtonText: 'No, cancel',
        customClass: { popup: 'swal2-popup' },
        confirmButtonColor: BRAND,
      });

      if (!result.isConfirmed) return;
    }

    try {
      Swal.showLoading();
      const resp = await updateVendorStatus(vendorProfileId, newStatus, note);
      Swal.close();

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: resp?.message ?? 'Status updated',
        showConfirmButton: false,
        timer: 1800,
      });

      fetchVendors();
    } catch (err) {
      Swal.close();
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Update failed',
        text:
          err?.response?.data?.message ||
          err.message ||
          'Could not update status',
        confirmButtonColor: BRAND,
      });
    }
  };
  // Handler for dropdown status change
  const handleStatusSelect = (vendor, newStatus) => {
    if (!newStatus || vendor.status === newStatus) return;
    confirmAndUpdate(vendor.vendorProfileId ?? vendor.id, newStatus);
  };

  // Get status classes for pill styling
  const getStatusClasses = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-50 text-green-700 border border-green-200";
      case "Rejected":
        return "bg-red-50 text-red-700 border border-red-200";
      case "Pending":
      default:
        return "bg-yellow-50 text-yellow-700 border border-yellow-200";
    }
  };

  // -------- Modal logic ----------
  const openVendorModal = async (vendorId, vendorRaw) => {
    setIsModalOpen(true);
    setModalVendorRaw(vendorRaw ?? null);
    setModalVendorDetail(null);
    setModalProducts([]);
    setModalLoading(true);
    setModalError(null);

    try {
      // Try to fetch vendor detail (if endpoint exists)
      let detail = null;
      try {
        const { data: dResp } = await axiosClient.get(`/vendor/${vendorId}`);
        if (dResp?.status === 'success' && dResp?.data) detail = dResp.data;
        else if (dResp?.data) detail = dResp.data; // fallback
      } catch (errDet) {
        console.warn('vendor detail fetch failed', errDet);
      }

      // Try to fetch products for vendor (if endpoint exists)
      let products = [];
      try {
        const { data: pResp } = await axiosClient.get(`/vendor/${vendorId}/products`);
        if (pResp?.status === 'success' && Array.isArray(pResp?.data)) products = pResp.data;
        else if (Array.isArray(pResp?.data?.data)) products = pResp.data.data;
        else if (Array.isArray(pResp)) products = pResp;
      } catch (errProd) {
        console.warn('vendor products fetch failed', errProd);
      }

      setModalVendorDetail(detail);
      setModalProducts(products);
    } catch (err) {
      console.error('modal load err', err);
      setModalError('Failed to load vendor details.');
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalVendorRaw(null);
    setModalVendorDetail(null);
    setModalProducts([]);
    setModalError(null);
  };

  const filterNames = useMemo(() => Object.keys(STATUS_MAP), []);

  // Handle Edit
  const handleEdit = (vendor) => {
    setOpenMenuId(null);
    
    // Map vendor data for the modal
    const mappedVendor = {
      id: vendor.id,
      name: vendor.name,
      email: vendor.email,
      phone: vendor.raw?.phone || '',
      businessName: vendor.raw?.vendor?.business_name || '',
      address: vendor.raw?.vendor?.address || '',
      latitude: vendor.raw?.vendor?.latitude || null,
      longitude: vendor.raw?.vendor?.longitude || null,
    };
    
    setEditingVendor(mappedVendor);
    setIsVendorModalOpen(true);
  };

  // Handle Delete
  const handleDelete = async (vendor) => {
    setOpenMenuId(null);
    
    const result = await Swal.fire({
      title: 'Delete vendor?',
      text: `This will remove ${vendor.name} from the system. This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
    });

    if (!result.isConfirmed) return;

    try {
      Swal.showLoading();
      await axiosClient.delete(`/user/destroy/${vendor.id}`);
      Swal.close();

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Vendor deleted successfully',
        showConfirmButton: false,
        timer: 1800,
      });

      fetchVendors();
    } catch (err) {
      Swal.close();
      console.error('Delete vendor failed', err);
      Swal.fire({
        icon: 'error',
        title: 'Delete failed',
        text: err?.response?.data?.message || err.message || 'Could not delete vendor',
        confirmButtonColor: BRAND,
      });
    }
  };

  return (
    <div style={styles.page}>
      <div style={{ ...styles.header }}>
        <div className='flex gap-4'>
          <div>
            <div style={styles.title}>Vendor Management</div>
            <div style={{ marginTop: 6, color: '#555', fontSize: 13 }}>Filter vendors by status and act quickly.</div>
          </div>
          <button
            type="button"
            onClick={() => setIsVendorModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#FF8C00] px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-[#e57c00] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF8C00] transition"
          >
            <span className="text-base leading-none">+</span>
            <span>Add New Vendor</span>
          </button>


        </div>

        <div style={styles.tabs}>
          {filterNames.map((name) => (
            <button
              key={name}
              onClick={() => setFilter(name)}
              style={styles.tabBtn(filter === name)}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ color: '#444', fontWeight: 700 }}>
            {filter} — <span style={{ fontWeight: 600, color: '#777' }}>{meta.total ?? 0} results</span>
          </div>
          <div style={{ color: '#666', fontSize: 13 }}>Page {meta.current_page} of {meta.last_page}</div>
        </div>

        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Name / Email</th>
                <th style={styles.th}># Products</th>
                <th style={styles.th}>Status & Actions</th>
                <th style={styles.th}>View</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Menu</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td style={styles.td} colSpan={6}>Loading...</td></tr>
              ) : error ? (
                <tr><td style={styles.td} colSpan={6}><span style={{ color: 'red' }}>{error}</span></td></tr>
              ) : vendors.length === 0 ? (
                <tr><td style={styles.td} colSpan={6}>No vendors found.</td></tr>
              ) : (
                vendors.map((v) => (
                  <tr key={v.id}>
                    <td style={styles.td}>{v.created_at ? new Date(v.created_at).toLocaleString() : '-'}</td>
                    <td style={styles.td}>
                      <div style={styles.vendorName}>{v.name}</div>
                      <div style={styles.vendorEmail}>{v.email}</div>
                      {v.note && (
                        <div style={styles.vendorNote}>
                          {v.note}
                        </div>
                      )}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>{v.products_count}</td>
                    <td style={styles.td}>
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusClasses(v.status)}`}>
                          {v.status === 'Approved' && <CheckCircle2 className="w-4 h-4" />}
                          {v.status === 'Rejected' && <XCircle className="w-4 h-4" />}
                          {v.status === 'Pending' && <Clock className="w-4 h-4" />}
                          {v.status}
                        </span>

                        <select
                          value={v.status}
                          onChange={(e) => handleStatusSelect(v, e.target.value)}
                          className="border border-gray-300 rounded-md text-sm px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Approved">Approved</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <button
                        style={{ ...styles.btn({}), background: '#fff', color: BRAND, border: `1px solid ${BRAND}33` }}
                        onClick={() => openVendorModal(v.id, v.raw)}
                      >
                        View Details
                      </button>
                    </td>
                    <td style={{ ...styles.td, position: 'relative' }}>
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === v.id ? null : v.id)}
                          className="menu-trigger p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          type="button"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>

                      {openMenuId === v.id && (
                        <div className="menu-container absolute right-6 top-11 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[160px]">
                          <button
                            type="button"
                            onClick={() => handleEdit(v)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 rounded-t-lg"
                          >
                            <Edit3 className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(v)}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-b-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={styles.pager}>
          <button
            onClick={() => setPage(1)}
            disabled={meta.current_page <= 1}
            style={{ ...styles.btn({ ghost: true }), opacity: meta.current_page <= 1 ? 0.5 : 1 }}
          >
            First
          </button>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={meta.current_page <= 1}
            style={{ ...styles.btn({ ghost: true }), opacity: meta.current_page <= 1 ? 0.5 : 1 }}
          >
            Prev
          </button>
          <div style={styles.smallMuted}>
            Page <strong style={{ color: '#111' }}>{meta.current_page}</strong> of <strong>{meta.last_page}</strong>
          </div>
          <button
            onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
            disabled={meta.current_page >= meta.last_page}
            style={{ ...styles.btn({ ghost: true }), opacity: meta.current_page >= meta.last_page ? 0.5 : 1 }}
          >
            Next
          </button>
          <button
            onClick={() => setPage(meta.last_page)}
            disabled={meta.current_page >= meta.last_page}
            style={{ ...styles.btn({ ghost: true }), opacity: meta.current_page >= meta.last_page ? 0.5 : 1 }}
          >
            Last
          </button>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={{ fontSize: 18, fontWeight: 800 }}>Vendor Details</div>
              <div>
                <button onClick={closeModal} style={{ ...styles.btn({ ghost: true }), background: '#fff', color: '#333' }}>Close</button>
              </div>
            </div>

            {modalLoading ? (
              <div style={{ padding: 20 }}>Loading vendor details...</div>
            ) : modalError ? (
              <div style={{ padding: 20, color: 'red' }}>{modalError}</div>
            ) : (
              <>
                <div style={styles.profileRow}>
                  <div style={styles.avatar}>
                    {modalVendorDetail?.name?.charAt(0)?.toUpperCase() ||
                      modalVendorRaw?.name?.charAt(0)?.toUpperCase() ||
                      'V'}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 18 }}>
                      {modalVendorDetail?.name ??
                        modalVendorRaw?.name ??
                        `Vendor #${modalVendorRaw?.id ?? ''}`}
                    </div>
                    <div style={{ color: '#555', marginTop: 6 }}>
                      {modalVendorDetail?.email ?? modalVendorRaw?.email ?? '-'}
                    </div>

                    <div style={{ marginTop: 10, display: 'flex', gap: 12 }}>
                      <div style={{ color: '#666' }}>
                        Status:
                        <strong style={{ marginLeft: 6 }}>
                          {modalVendorDetail?.status ?? modalVendorRaw?.status ?? '-'}
                        </strong>
                      </div>
                      <div style={{ color: '#666' }}>
                        Created:
                        <strong style={{ marginLeft: 6 }}>
                          {(modalVendorDetail?.created_at ?? modalVendorRaw?.created_at)
                            ? new Date(
                              (modalVendorDetail?.created_at ??
                                modalVendorRaw?.created_at)
                            ).toLocaleString()
                            : '-'}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#666', fontSize: 13 }}>Vendor ID</div>
                    <div style={{ fontWeight: 800 }}>
                      {modalVendorDetail?.id ?? modalVendorRaw?.id}
                    </div>
                  </div>
                </div>

                <div style={styles.modalHeader}>
                  <div style={{ fontWeight: 800 }}>Profile</div>
                </div>

                <div style={styles.metaGrid}>
                  <div>
                    <div style={{ color: '#666', fontSize: 13 }}>Phone</div>
                    <div style={{ fontWeight: 700 }}>
                      {modalVendorDetail?.phone ?? modalVendorRaw?.phone ?? '-'}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#666', fontSize: 13 }}>Language</div>
                    <div style={{ fontWeight: 700 }}>
                      {modalVendorDetail?.language ?? modalVendorRaw?.language ?? '-'}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#666', fontSize: 13 }}>Is Online</div>
                    <div style={{ fontWeight: 700 }}>
                      {(modalVendorDetail?.is_online ?? modalVendorRaw?.is_online)
                        ? 'Yes'
                        : 'No'}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#666', fontSize: 13 }}>Expires At</div>
                    <div style={{ fontWeight: 700 }}>
                      {modalVendorDetail?.expires_at ??
                        modalVendorRaw?.expires_at ??
                        '-'}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <div style={{ fontWeight: 800, marginBottom: 8 }}>Products</div>

                  {modalProducts && modalProducts.length > 0 ? (
                    <table style={styles.productTable}>
                      <thead>
                        <tr>
                          <th style={styles.productTh}>#</th>
                          <th style={styles.productTh}>Name</th>
                          <th style={styles.productTh}>Price</th>
                          <th style={styles.productTh}>Stock</th>
                        </tr>
                      </thead>
                      <tbody>
                        {modalProducts.map((p, idx) => (
                          <tr key={p.id ?? idx}>
                            <td style={styles.productTd}>{idx + 1}</td>
                            <td style={styles.productTd}>
                              {p.name ?? p.title ?? 'Untitled'}
                            </td>
                            <td style={styles.productTd}>
                              {p.price != null ? p.price : '-'}
                            </td>
                            <td style={styles.productTd}>
                              {p.stock != null
                                ? p.stock
                                : p.quantity != null
                                  ? p.quantity
                                  : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div style={{ padding: 12, color: '#555' }}>
                      No products found or products endpoint not available.
                    </div>
                  )}
                </div>

                <div
                  style={{
                    marginTop: 18,
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 8,
                  }}
                >
                  <button
                    onClick={closeModal}
                    style={{
                      ...styles.btn({ ghost: true }),
                      background: '#fff',
                      color: '#333',
                    }}
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
 

{isVendorModalOpen && (
  <VendorModal
    vendor={editingVendor}
    onSave={async (formValues) => {
      // 1) Loader swal – এখানে কোনো await থাকবে না
      const isEdit = !!editingVendor;
      Swal.fire({
        title: isEdit ? "Updating vendor..." : "Creating vendor...",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        const formData = new FormData();

        // file থাকলে
        if (formValues.documentFile) {
          formData.append("files[]", formValues.documentFile);
        }

        // ✅ backend field name অনুযায়ী map
        // Only append if value exists (all fields optional for edit)
        if (formValues.country) formData.append("country", formValues.country.toLowerCase());
        if (formValues.businessName) formData.append("business_name", formValues.businessName);
        if (formValues.businessType) formData.append("business_type", formValues.businessType);
        if (formValues.address) formData.append("address", formValues.address);
        if (formValues.longitude) formData.append("longitude", String(formValues.longitude));
        if (formValues.latitude) formData.append("latitude", String(formValues.latitude));
        if (formValues.name) formData.append("name", formValues.name);
        if (formValues.email) formData.append("email", formValues.email);
        if (formValues.password) formData.append("password", formValues.password);
        if (formValues.phone) formData.append("phone", formValues.phone);

        for (const [key, value] of formData.entries()) {
          console.log("create-vendor formData ->", key, value);
        }

        // 2) Check if editing or creating
        const isEdit = !!editingVendor;
        let resp;
        
        if (isEdit) {
          resp = await updateUserInfo(editingVendor.id, formData);
        } else {
          resp = await createVendor(formData);
        }

        Swal.close();

        await Swal.fire({
          icon: "success",
          title: isEdit ? "Vendor updated" : "Vendor created",
          text: resp?.data?.message || resp?.message || (isEdit ? "Vendor updated successfully" : "Admin vendor created"),
          confirmButtonColor: BRAND,
        });

        setIsVendorModalOpen(false);
        setEditingVendor(null);
        fetchVendors(); // list refresh
      } catch (error) {
        console.error("createVendor error raw ===>", error);
  console.log("create-vendor response data ===>", error?.response?.data);

  Swal.close();

  // ডিফল্ট ম্যাসেজ
  let displayMessage =
    error?.response?.data?.message || "Validation exception";

  // 🔴 তোমার backend এ actual errors আসছে data এর ভিতরে
  const apiErrors =
    error?.response?.data?.errors ||   // যদি কখনও errors নামে আসে
    error?.response?.data?.data ||     // এখন যেটা হচ্ছে: data.email[0]
    error?.response?.data?.error;      // extra fallback

  if (apiErrors && typeof apiErrors === "object") {
    displayMessage = Object.entries(apiErrors)
      .map(([field, msgs]) => {
        if (Array.isArray(msgs)) {
          return `${field}: ${msgs.join(", ")}`;
        }
        return `${field}: ${msgs}`;
      })
      .join("\n");
  }

  await Swal.fire({
    icon: "error",
    title: "Create vendor failed",
    text: displayMessage,   // এখানে এখন আসবে: "email: The email has already been taken."
    confirmButtonColor: BRAND,
  });
      }
    }}
    onClose={() => {
      setIsVendorModalOpen(false);
      setEditingVendor(null);
    }}
  />
)}




    </div>
  );
};

export default Vendor;

