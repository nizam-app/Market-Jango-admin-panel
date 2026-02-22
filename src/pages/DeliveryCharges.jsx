// src/pages/DeliveryCharges.jsx
import React, { useEffect, useState, useRef } from 'react';
import Swal from 'sweetalert2';
import { Plus, Edit3, Trash2, X, CheckCircle2, XCircle, Package, Route, Search } from 'lucide-react';
import {
  getDeliveryDashboard,
  getDeliveryChargeRoutes,
  getDeliveryChargeRoute,
  createDeliveryChargeRoute,
  updateDeliveryChargeRoute,
  deleteDeliveryChargeRoute,
} from '../api/adminApi';
import axiosClient from '../api/axiosClient';
import { getRoutesList } from '../api/routeApi';

const BRAND = '#FF8C00';

const DeliveryCharges = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [vendors, setVendors] = useState([]);

  // Delivery Charge Routes (list + add/edit)
  const [chargeRoutesSearch, setChargeRoutesSearch] = useState('');
  const [deliveryChargeRoutes, setDeliveryChargeRoutes] = useState([]);
  const [loadingChargeRoutes, setLoadingChargeRoutes] = useState(false);
  const [isDeliveryChargeModalOpen, setIsDeliveryChargeModalOpen] = useState(false);
  const [editingDeliveryChargeId, setEditingDeliveryChargeId] = useState(null);
  const chargeRoutesSearchDebounce = useRef(null);
  // Routes from GET /api/route for Add delivery charge dropdowns (Route, Start point, End point)
  const [routesList, setRoutesList] = useState([]);
  const [routesLoading, setRoutesLoading] = useState(false);
  const [selectedRouteIdForCharge, setSelectedRouteIdForCharge] = useState(null);

  const defaultWeightRange = () => ({ min_weight: 0, max_weight: 0, per_kg_charge: 0, min_charge: null, max_charge: null, enabled: true });
  const defaultDistanceRange = () => ({ min_distance_km: 0, max_distance_km: 0, per_km_charge: 0, min_charge: null, max_charge: null, enabled: true });
  const defaultCubeRange = () => ({ min_cube: 0, max_cube: 0, per_cube_charge: 0, min_charge: null, max_charge: null, enabled: true });

  const [deliveryChargeForm, setDeliveryChargeForm] = useState({
    zone_name: '',
    from_point: '',
    to_point: '',
    vendor_id: '',
    flat_base_charge: '',
    flat_enabled: true,
    status: 'Active',
    currency: 'USD',
    weight_ranges: [defaultWeightRange()],
    weight_enabled: false,
    distance_ranges: [defaultDistanceRange()],
    distance_enabled: false,
    cube_ranges: [defaultCubeRange()],
    cube_enabled: false,
  });

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboard();
    } else if (activeTab === 'charge-routes') {
      fetchDeliveryChargeRoutes(chargeRoutesSearch);
      fetchRoutesForCharge(); // GET /api/route for Add delivery charge modal (Route, Start point, End point)
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== 'charge-routes') return;
    if (chargeRoutesSearchDebounce.current) clearTimeout(chargeRoutesSearchDebounce.current);
    chargeRoutesSearchDebounce.current = setTimeout(() => {
      fetchDeliveryChargeRoutes(chargeRoutesSearch);
    }, 400);
    return () => {
      if (chargeRoutesSearchDebounce.current) clearTimeout(chargeRoutesSearchDebounce.current);
    };
  }, [chargeRoutesSearch]);

  // When modal is open with zone_name (e.g. edit) and routes have loaded, set selected route so Start/End point dropdowns show
  useEffect(() => {
    if (!isDeliveryChargeModalOpen || !deliveryChargeForm.zone_name || routesList.length === 0) return;
    const match = routesList.find((r) => r.name === deliveryChargeForm.zone_name);
    if (match && selectedRouteIdForCharge !== match.id) setSelectedRouteIdForCharge(match.id);
  }, [isDeliveryChargeModalOpen, deliveryChargeForm.zone_name, routesList]);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await getDeliveryDashboard();
      const data = res.data?.data || res.data || {};
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to fetch dashboard', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err?.response?.data?.message || 'Failed to load dashboard data',
        confirmButtonColor: BRAND,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      // Fetch vendors for dropdown
      const res = await axiosClient.get('/admin-vendor', { params: { page: 1, per_page: 100 } });
      const vendorsData = res.data?.data?.data || res.data?.data || [];
      setVendors(Array.isArray(vendorsData) ? vendorsData : []);
    } catch (err) {
      console.error('Failed to fetch vendors', err);
    }
  };

  const fetchRoutesForCharge = async () => {
    setRoutesLoading(true);
    try {
      const res = await getRoutesList(100);
      const payload = res.data?.data;
      const list = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
      setRoutesList(list);
    } catch (err) {
      console.error('Failed to fetch routes for delivery charge', err);
      setRoutesList([]);
    } finally {
      setRoutesLoading(false);
    }
  };

  const fetchDeliveryChargeRoutes = async (search = '') => {
    setLoadingChargeRoutes(true);
    try {
      const res = await getDeliveryChargeRoutes(search);
      const data = res.data?.data || res.data || {};
      const routes = Array.isArray(data.routes) ? data.routes : [];
      setDeliveryChargeRoutes(routes);
    } catch (err) {
      console.error('Failed to fetch delivery charge routes', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err?.response?.data?.message || 'Failed to load delivery charge routes',
        confirmButtonColor: BRAND,
      });
      setDeliveryChargeRoutes([]);
    } finally {
      setLoadingChargeRoutes(false);
    }
  };

  const mapRouteToForm = (route) => {
    const wr = Array.isArray(route.weight_ranges) && route.weight_ranges.length
      ? route.weight_ranges.map((r) => ({
          min_weight: r.min_weight ?? 0,
          max_weight: r.max_weight ?? 0,
          per_kg_charge: r.per_kg_charge ?? 0,
          min_charge: r.min_charge ?? null,
          max_charge: r.max_charge ?? null,
          enabled: r.enabled !== false,
        }))
      : [defaultWeightRange()];
    const dr = Array.isArray(route.distance_ranges) && route.distance_ranges.length
      ? route.distance_ranges.map((r) => ({
          min_distance_km: r.min_distance_km ?? 0,
          max_distance_km: r.max_distance_km ?? 0,
          per_km_charge: r.per_km_charge ?? 0,
          min_charge: r.min_charge ?? null,
          max_charge: r.max_charge ?? null,
          enabled: r.enabled !== false,
        }))
      : [defaultDistanceRange()];
    const cr = Array.isArray(route.cube_ranges) && route.cube_ranges.length
      ? route.cube_ranges.map((r) => ({
          min_cube: r.min_cube ?? 0,
          max_cube: r.max_cube ?? 0,
          per_cube_charge: r.per_cube_charge ?? 0,
          min_charge: r.min_charge ?? null,
          max_charge: r.max_charge ?? null,
          enabled: r.enabled !== false,
        }))
      : [defaultCubeRange()];
    return {
      zone_name: route.zone_name || '',
      from_point: route.from_point ?? route.start_point ?? '',
      to_point: route.to_point ?? route.end_point ?? '',
      vendor_id: route.vendor_id ?? '',
      flat_base_charge: route.flat_base_charge ?? route.flat_base_price ?? '',
      flat_enabled: route.flat_enabled !== false,
      status: route.status || 'Active',
      currency: route.currency || 'USD',
      weight_ranges: wr,
      weight_enabled: wr.length > 0,
      distance_ranges: dr,
      distance_enabled: dr.length > 0,
      cube_ranges: cr,
      cube_enabled: cr.length > 0,
    };
  };

  const handleOpenDeliveryChargeModal = async (routeId = null) => {
    setEditingDeliveryChargeId(routeId);
    if (routeId) {
      try {
        setLoadingChargeRoutes(true);
        const res = await getDeliveryChargeRoute(routeId);
        const route = res.data?.data || res.data;
        setDeliveryChargeForm(mapRouteToForm(route));
      } catch (err) {
        console.error('Failed to load route', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err?.response?.data?.message || 'Failed to load route',
          confirmButtonColor: BRAND,
        });
        return;
      } finally {
        setLoadingChargeRoutes(false);
      }
    } else {
      setDeliveryChargeForm({
        zone_name: '',
        from_point: '',
        to_point: '',
        vendor_id: '',
        flat_base_charge: '',
        flat_enabled: true,
        status: 'Active',
        currency: 'USD',
        weight_ranges: [defaultWeightRange()],
        weight_enabled: false,
        distance_ranges: [defaultDistanceRange()],
        distance_enabled: false,
        cube_ranges: [defaultCubeRange()],
        cube_enabled: false,
      });
    }
    fetchVendors();
    fetchRoutesForCharge(); // GET /api/route so Route and Start/End point dropdowns are populated
    setSelectedRouteIdForCharge(null);
    setIsDeliveryChargeModalOpen(true);
  };

  const handleCloseDeliveryChargeModal = () => {
    setIsDeliveryChargeModalOpen(false);
    setEditingDeliveryChargeId(null);
    setSelectedRouteIdForCharge(null);
  };

  const buildDeliveryChargePayload = () => {
    const flatBase = parseFloat(deliveryChargeForm.flat_base_charge);
    const payload = {
      zone_name: String(deliveryChargeForm.zone_name).trim(),
      from_point: String(deliveryChargeForm.from_point).trim(),
      to_point: String(deliveryChargeForm.to_point).trim(),
      vendor_id: deliveryChargeForm.vendor_id !== '' && deliveryChargeForm.vendor_id != null ? Number(deliveryChargeForm.vendor_id) : null,
      flat_base_charge: Number.isNaN(flatBase) ? 0 : flatBase,
      flat_enabled: !!deliveryChargeForm.flat_enabled,
      status: deliveryChargeForm.status || 'Active',
      currency: deliveryChargeForm.currency || null,
      weight_ranges: deliveryChargeForm.weight_enabled
        ? deliveryChargeForm.weight_ranges.map((r) => ({
            min_weight: Number(r.min_weight) || 0,
            max_weight: Number(r.max_weight) || 0,
            per_kg_charge: Number(r.per_kg_charge) || 0,
            min_charge: r.min_charge != null && r.min_charge !== '' ? Number(r.min_charge) : null,
            max_charge: r.max_charge != null && r.max_charge !== '' ? Number(r.max_charge) : null,
            enabled: r.enabled !== false,
          }))
        : [],
      distance_ranges: deliveryChargeForm.distance_enabled
        ? deliveryChargeForm.distance_ranges.map((r) => ({
            min_distance_km: Number(r.min_distance_km) || 0,
            max_distance_km: Number(r.max_distance_km) || 0,
            per_km_charge: Number(r.per_km_charge) || 0,
            min_charge: r.min_charge != null && r.min_charge !== '' ? Number(r.min_charge) : null,
            max_charge: r.max_charge != null && r.max_charge !== '' ? Number(r.max_charge) : null,
            enabled: r.enabled !== false,
          }))
        : [],
      cube_ranges: deliveryChargeForm.cube_enabled
        ? deliveryChargeForm.cube_ranges.map((r) => ({
            min_cube: Number(r.min_cube) || 0,
            max_cube: Number(r.max_cube) || 0,
            per_cube_charge: Number(r.per_cube_charge) || 0,
            min_charge: r.min_charge != null && r.min_charge !== '' ? Number(r.min_charge) : null,
            max_charge: r.max_charge != null && r.max_charge !== '' ? Number(r.max_charge) : null,
            enabled: r.enabled !== false,
          }))
        : [],
    };
    return payload;
  };

  const handleSubmitDeliveryCharge = async (e) => {
    e.preventDefault();
    const zone = String(deliveryChargeForm.zone_name).trim();
    const from = String(deliveryChargeForm.from_point).trim();
    const to = String(deliveryChargeForm.to_point).trim();
    const flat = parseFloat(deliveryChargeForm.flat_base_charge);
    if (!zone) {
      Swal.fire({ icon: 'warning', title: 'Validation', text: 'Route zone name is required', confirmButtonColor: BRAND });
      return;
    }
    if (!from) {
      Swal.fire({ icon: 'warning', title: 'Validation', text: 'From point is required', confirmButtonColor: BRAND });
      return;
    }
    if (!to) {
      Swal.fire({ icon: 'warning', title: 'Validation', text: 'To point is required', confirmButtonColor: BRAND });
      return;
    }
    if (deliveryChargeForm.flat_base_charge === '' || deliveryChargeForm.flat_base_charge == null || Number.isNaN(flat) || flat < 0) {
      Swal.fire({ icon: 'warning', title: 'Validation', text: 'Flat base charge is required and must be 0 or greater', confirmButtonColor: BRAND });
      return;
    }
    try {
      Swal.showLoading();
      const payload = buildDeliveryChargePayload();
      if (editingDeliveryChargeId) {
        await updateDeliveryChargeRoute(editingDeliveryChargeId, payload);
      } else {
        await createDeliveryChargeRoute(payload);
      }
      Swal.close();
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: editingDeliveryChargeId ? 'Route updated' : 'Delivery charge route created',
        showConfirmButton: false,
        timer: 1800,
      });
      handleCloseDeliveryChargeModal();
      fetchDeliveryChargeRoutes(chargeRoutesSearch);
    } catch (err) {
      Swal.close();
      const data = err?.response?.data;
      let msg = data?.message || err.message || 'Failed to save route';
      const errors = data?.data?.errors ?? data?.errors;
      if (errors && typeof errors === 'object') {
        const parts = Object.entries(errors).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : v}`);
        if (parts.length) msg = msg + '\n\n' + parts.join('\n');
      }
      Swal.fire({ icon: 'error', title: 'Error', text: msg, confirmButtonColor: BRAND });
    }
  };

  const handleDeleteDeliveryChargeRoute = async (route) => {
    const result = await Swal.fire({
      title: 'Delete this delivery charge route?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
    });
    if (!result.isConfirmed) return;
    try {
      Swal.showLoading();
      await deleteDeliveryChargeRoute(route.id);
      Swal.close();
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Route deleted',
        showConfirmButton: false,
        timer: 1800,
      });
      fetchDeliveryChargeRoutes(chargeRoutesSearch);
    } catch (err) {
      Swal.close();
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err?.response?.data?.message || 'Failed to delete route',
        confirmButtonColor: BRAND,
      });
    }
  };

  const getStatusBadge = (status) => {
    const isActive = status === true || String(status || '').toLowerCase() === 'active';
    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
          isActive
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-gray-50 text-gray-700 border border-gray-200'
        }`}
      >
        {isActive ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  const getVendorName = (vendorId) => {
    if (!vendorId) return 'Global';
    const vendor = vendors.find((v) => v.id === vendorId || v.vendor?.id === vendorId);
    return vendor ? vendor.name || vendor.email : `Vendor ${vendorId}`;
  };

  const selectedRouteForCharge = routesList.find((r) => r.id === selectedRouteIdForCharge);
  const chargeLocations = selectedRouteForCharge?.locations ?? [];

  return (
    <div style={{ padding: 24, fontFamily: "'Inter', system-ui, Arial, sans-serif", background: '#f7f8fb', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#111' }}>Delivery Charge Management</div>
        <div style={{ marginTop: 6, color: '#555', fontSize: 13 }}>Manage zone routes and weight-based delivery charges</div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
        {[
          { id: 'dashboard', label: 'Dashboard', icon: Package },
          { id: 'charge-routes', label: 'Charge Routes', icon: Route },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 18px',
                borderRadius: 999,
                border: isActive ? `2px solid ${BRAND}` : '1px solid #e6e6e9',
                background: isActive ? `${BRAND}20` : '#fff',
                color: isActive ? BRAND : '#333',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 6px 18px rgba(16,24,40,0.06)' }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>Loading dashboard...</div>
          ) : dashboardData ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
              <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, padding: 20 }}>
                <div style={{ fontSize: 14, color: '#0369a1', marginBottom: 8 }}>Product-Based Charges</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#0c4a6e' }}>
                  {dashboardData.total_product_charges || 0}
                </div>
              </div>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: 20 }}>
                <div style={{ fontSize: 14, color: '#166534', marginBottom: 8 }}>Zone Routes</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#14532d' }}>
                  {dashboardData.total_zone_routes || 0}
                </div>
                <div style={{ fontSize: 12, color: '#15803d', marginTop: 4 }}>
                  Global: {dashboardData.global_zone_routes || 0} | Vendor-Specific: {dashboardData.vendor_zone_routes || 0}
                </div>
              </div>
              <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 8, padding: 20 }}>
                <div style={{ fontSize: 14, color: '#92400e', marginBottom: 8 }}>Weight Charges</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#78350f' }}>
                  {dashboardData.total_weight_charges || 0}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>No dashboard data available</div>
          )}
        </div>
      )}

      {/* Charge Routes Tab (delivery-charges API) */}
      {activeTab === 'charge-routes' && (
        <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 6px 18px rgba(16,24,40,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <label style={{ fontSize: 13, color: '#555' }}>Search by route</label>
              <div style={{ position: 'relative' }}>
                <Search style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: '#999' }} />
                <input
                  type="text"
                  value={chargeRoutesSearch}
                  onChange={(e) => setChargeRoutesSearch(e.target.value)}
                  placeholder="Zone name, start point, or end point..."
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-64"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleOpenDeliveryChargeModal()}
              className="inline-flex items-center gap-2 rounded-lg bg-[#FF8C00] px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-[#e57c00] transition"
            >
              <Plus className="w-4 h-4" />
              Add delivery charge
            </button>
          </div>
          {loadingChargeRoutes ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>Loading…</div>
          ) : deliveryChargeRoutes.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>
              No delivery charge routes found. Add your first delivery charge above.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '12px 14px', borderBottom: '1px solid #f0f0f3', color: '#666', fontSize: 13 }}>Zone name</th>
                    <th style={{ textAlign: 'left', padding: '12px 14px', borderBottom: '1px solid #f0f0f3', color: '#666', fontSize: 13 }}>Start point</th>
                    <th style={{ textAlign: 'left', padding: '12px 14px', borderBottom: '1px solid #f0f0f3', color: '#666', fontSize: 13 }}>End point</th>
                    <th style={{ textAlign: 'left', padding: '12px 14px', borderBottom: '1px solid #f0f0f3', color: '#666', fontSize: 13 }}>Flat base price</th>
                    <th style={{ textAlign: 'left', padding: '12px 14px', borderBottom: '1px solid #f0f0f3', color: '#666', fontSize: 13 }}>Weight base range</th>
                    <th style={{ textAlign: 'left', padding: '12px 14px', borderBottom: '1px solid #f0f0f3', color: '#666', fontSize: 13 }}>Distance base range</th>
                    <th style={{ textAlign: 'left', padding: '12px 14px', borderBottom: '1px solid #f0f0f3', color: '#666', fontSize: 13 }}>Cubic base range</th>
                    <th style={{ textAlign: 'right', padding: '12px 14px', borderBottom: '1px solid #f0f0f3', color: '#666', fontSize: 13 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveryChargeRoutes.map((row) => (
                    <tr key={row.id}>
                      <td style={{ padding: '12px 14px', borderBottom: '1px solid #fbfbfc', fontWeight: 600 }}>{row.zone_name || '—'}</td>
                      <td style={{ padding: '12px 14px', borderBottom: '1px solid #fbfbfc' }}>{row.start_point ?? row.from_point ?? '—'}</td>
                      <td style={{ padding: '12px 14px', borderBottom: '1px solid #fbfbfc' }}>{row.end_point ?? row.to_point ?? '—'}</td>
                      <td style={{ padding: '12px 14px', borderBottom: '1px solid #fbfbfc' }}>{row.flat_base_price != null ? `${row.flat_base_price} ${row.currency || 'USD'}` : '—'}</td>
                      <td style={{ padding: '12px 14px', borderBottom: '1px solid #fbfbfc', fontSize: 13 }}>{row.weight_base_range || '—'}</td>
                      <td style={{ padding: '12px 14px', borderBottom: '1px solid #fbfbfc', fontSize: 13 }}>{row.distance_base_range || '—'}</td>
                      <td style={{ padding: '12px 14px', borderBottom: '1px solid #fbfbfc', fontSize: 13 }}>{row.cubic_base_range || '—'}</td>
                      <td style={{ padding: '12px 14px', borderBottom: '1px solid #fbfbfc', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <button type="button" onClick={() => handleOpenDeliveryChargeModal(row.id)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Edit">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button type="button" onClick={() => handleDeleteDeliveryChargeRoute(row)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Delivery Charge Route (Add/Edit) Modal */}
      {isDeliveryChargeModalOpen && (
        <div className="fixed top-0 left-0 bg-black/50 w-full h-full flex items-center justify-center p-4 z-50" onClick={handleCloseDeliveryChargeModal}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingDeliveryChargeId ? 'Edit delivery charge route' : 'Add delivery charge'}
              </h2>
              <button type="button" onClick={handleCloseDeliveryChargeModal} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitDeliveryCharge} className="flex-1 overflow-y-auto">
              <div className="px-6 py-6 space-y-5">
                <p className="text-xs text-gray-500">Route and points are from <strong>GET /api/route</strong>. Select a route, then choose start and end locations.</p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Route <span className="text-red-500">*</span></label>
                  <select
                    value={deliveryChargeForm.zone_name}
                    onChange={(e) => {
                      const route = routesList.find((r) => r.name === e.target.value);
                      setDeliveryChargeForm({
                        ...deliveryChargeForm,
                        zone_name: e.target.value,
                        from_point: '',
                        to_point: '',
                      });
                      setSelectedRouteIdForCharge(route?.id ?? null);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    required
                    disabled={routesLoading}
                  >
                    <option value="">{routesLoading ? 'Loading routes…' : 'Select route'}</option>
                    {routesList.map((r) => (
                      <option key={r.id} value={r.name}>{r.name}</option>
                    ))}
                  </select>
                  {!routesLoading && routesList.length === 0 && (
                    <p className="mt-1 text-xs text-amber-600">No routes found. Routes come from GET /api/route.</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start point <span className="text-red-500">*</span></label>
                    <select
                      value={deliveryChargeForm.from_point}
                      onChange={(e) => setDeliveryChargeForm({ ...deliveryChargeForm, from_point: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      required
                      disabled={!selectedRouteForCharge || routesLoading}
                    >
                      <option value="">{!selectedRouteForCharge ? 'Select route first' : 'Select start point'}</option>
                      {chargeLocations.map((loc) => (
                        <option key={loc.id} value={loc.name}>{loc.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End point <span className="text-red-500">*</span></label>
                    <select
                      value={deliveryChargeForm.to_point}
                      onChange={(e) => setDeliveryChargeForm({ ...deliveryChargeForm, to_point: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      required
                      disabled={!selectedRouteForCharge || routesLoading}
                    >
                      <option value="">{!selectedRouteForCharge ? 'Select route first' : 'Select end point'}</option>
                      {chargeLocations.map((loc) => (
                        <option key={loc.id} value={loc.name}>{loc.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vendor (optional)</label>
                  <select
                    value={deliveryChargeForm.vendor_id}
                    onChange={(e) => setDeliveryChargeForm({ ...deliveryChargeForm, vendor_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">— None (global) —</option>
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>{v.name || v.email}</option>
                    ))}
                  </select>
                </div>
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">1 Flat charge</span>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={deliveryChargeForm.flat_enabled}
                        onChange={(e) => setDeliveryChargeForm({ ...deliveryChargeForm, flat_enabled: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      Add / enabled
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Base charge <span className="text-red-500">*</span> (min 0)</label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={deliveryChargeForm.flat_base_charge}
                      onChange={(e) => setDeliveryChargeForm({ ...deliveryChargeForm, flat_base_charge: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Weight-based charge</span>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={deliveryChargeForm.weight_enabled}
                        onChange={(e) => setDeliveryChargeForm({ ...deliveryChargeForm, weight_enabled: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      Add / enabled
                    </label>
                  </div>
                  {deliveryChargeForm.weight_enabled && (
                    <>
                      {deliveryChargeForm.weight_ranges.map((r, idx) => (
                        <div key={idx} className="grid grid-cols-2 gap-2 mb-3 p-3 bg-gray-50 rounded-lg">
                          <input type="number" min={0} step="any" placeholder="Min weight" value={r.min_weight} onChange={(e) => {
                            const arr = [...deliveryChargeForm.weight_ranges];
                            arr[idx] = { ...arr[idx], min_weight: e.target.value };
                            setDeliveryChargeForm({ ...deliveryChargeForm, weight_ranges: arr });
                          }} className="px-3 py-1.5 border rounded text-sm" />
                          <input type="number" min={0} step="any" placeholder="Max weight" value={r.max_weight} onChange={(e) => {
                            const arr = [...deliveryChargeForm.weight_ranges];
                            arr[idx] = { ...arr[idx], max_weight: e.target.value };
                            setDeliveryChargeForm({ ...deliveryChargeForm, weight_ranges: arr });
                          }} className="px-3 py-1.5 border rounded text-sm" />
                          <input type="number" min={0} step="any" placeholder="Per kg" value={r.per_kg_charge} onChange={(e) => {
                            const arr = [...deliveryChargeForm.weight_ranges];
                            arr[idx] = { ...arr[idx], per_kg_charge: e.target.value };
                            setDeliveryChargeForm({ ...deliveryChargeForm, weight_ranges: arr });
                          }} className="px-3 py-1.5 border rounded text-sm" />
                          <input type="number" step="any" placeholder="Min charge" value={r.min_charge ?? ''} onChange={(e) => {
                            const arr = [...deliveryChargeForm.weight_ranges];
                            arr[idx] = { ...arr[idx], min_charge: e.target.value === '' ? null : e.target.value };
                            setDeliveryChargeForm({ ...deliveryChargeForm, weight_ranges: arr });
                          }} className="px-3 py-1.5 border rounded text-sm" />
                          <input type="number" step="any" placeholder="Max charge" value={r.max_charge ?? ''} onChange={(e) => {
                            const arr = [...deliveryChargeForm.weight_ranges];
                            arr[idx] = { ...arr[idx], max_charge: e.target.value === '' ? null : e.target.value };
                            setDeliveryChargeForm({ ...deliveryChargeForm, weight_ranges: arr });
                          }} className="px-3 py-1.5 border rounded text-sm" />
                          {deliveryChargeForm.weight_ranges.length > 1 && (
                            <button type="button" onClick={() => setDeliveryChargeForm({ ...deliveryChargeForm, weight_ranges: deliveryChargeForm.weight_ranges.filter((_, i) => i !== idx) })} className="text-red-600 text-sm">Remove</button>
                          )}
                        </div>
                      ))}
                      <button type="button" onClick={() => setDeliveryChargeForm({ ...deliveryChargeForm, weight_ranges: [...deliveryChargeForm.weight_ranges, defaultWeightRange()] })} className="text-sm text-blue-600">+ Add another weight range</button>
                    </>
                  )}
                </div>
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">2 Distance-based</span>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={deliveryChargeForm.distance_enabled}
                        onChange={(e) => setDeliveryChargeForm({ ...deliveryChargeForm, distance_enabled: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      Add / enabled
                    </label>
                  </div>
                  {deliveryChargeForm.distance_enabled && (
                    <>
                      {deliveryChargeForm.distance_ranges.map((r, idx) => (
                        <div key={idx} className="grid grid-cols-2 gap-2 mb-3 p-3 bg-gray-50 rounded-lg">
                          <input type="number" min={0} step="any" placeholder="Min km" value={r.min_distance_km} onChange={(e) => {
                            const arr = [...deliveryChargeForm.distance_ranges];
                            arr[idx] = { ...arr[idx], min_distance_km: e.target.value };
                            setDeliveryChargeForm({ ...deliveryChargeForm, distance_ranges: arr });
                          }} className="px-3 py-1.5 border rounded text-sm" />
                          <input type="number" min={0} step="any" placeholder="Max km" value={r.max_distance_km} onChange={(e) => {
                            const arr = [...deliveryChargeForm.distance_ranges];
                            arr[idx] = { ...arr[idx], max_distance_km: e.target.value };
                            setDeliveryChargeForm({ ...deliveryChargeForm, distance_ranges: arr });
                          }} className="px-3 py-1.5 border rounded text-sm" />
                          <input type="number" min={0} step="any" placeholder="Per km" value={r.per_km_charge} onChange={(e) => {
                            const arr = [...deliveryChargeForm.distance_ranges];
                            arr[idx] = { ...arr[idx], per_km_charge: e.target.value };
                            setDeliveryChargeForm({ ...deliveryChargeForm, distance_ranges: arr });
                          }} className="px-3 py-1.5 border rounded text-sm" />
                          <input type="number" step="any" placeholder="Min charge" value={r.min_charge ?? ''} onChange={(e) => {
                            const arr = [...deliveryChargeForm.distance_ranges];
                            arr[idx] = { ...arr[idx], min_charge: e.target.value === '' ? null : e.target.value };
                            setDeliveryChargeForm({ ...deliveryChargeForm, distance_ranges: arr });
                          }} className="px-3 py-1.5 border rounded text-sm" />
                          <input type="number" step="any" placeholder="Max charge" value={r.max_charge ?? ''} onChange={(e) => {
                            const arr = [...deliveryChargeForm.distance_ranges];
                            arr[idx] = { ...arr[idx], max_charge: e.target.value === '' ? null : e.target.value };
                            setDeliveryChargeForm({ ...deliveryChargeForm, distance_ranges: arr });
                          }} className="px-3 py-1.5 border rounded text-sm" />
                          {deliveryChargeForm.distance_ranges.length > 1 && (
                            <button type="button" onClick={() => setDeliveryChargeForm({ ...deliveryChargeForm, distance_ranges: deliveryChargeForm.distance_ranges.filter((_, i) => i !== idx) })} className="text-red-600 text-sm">Remove</button>
                          )}
                        </div>
                      ))}
                      <button type="button" onClick={() => setDeliveryChargeForm({ ...deliveryChargeForm, distance_ranges: [...deliveryChargeForm.distance_ranges, defaultDistanceRange()] })} className="text-sm text-blue-600">+ Add another distance range</button>
                    </>
                  )}
                </div>
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">3 Cube-based</span>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={deliveryChargeForm.cube_enabled}
                        onChange={(e) => setDeliveryChargeForm({ ...deliveryChargeForm, cube_enabled: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      Add / enabled
                    </label>
                  </div>
                  {deliveryChargeForm.cube_enabled && (
                    <>
                      {deliveryChargeForm.cube_ranges.map((r, idx) => (
                        <div key={idx} className="grid grid-cols-2 gap-2 mb-3 p-3 bg-gray-50 rounded-lg">
                          <input type="number" min={0} step="any" placeholder="Min cube" value={r.min_cube} onChange={(e) => {
                            const arr = [...deliveryChargeForm.cube_ranges];
                            arr[idx] = { ...arr[idx], min_cube: e.target.value };
                            setDeliveryChargeForm({ ...deliveryChargeForm, cube_ranges: arr });
                          }} className="px-3 py-1.5 border rounded text-sm" />
                          <input type="number" min={0} step="any" placeholder="Max cube" value={r.max_cube} onChange={(e) => {
                            const arr = [...deliveryChargeForm.cube_ranges];
                            arr[idx] = { ...arr[idx], max_cube: e.target.value };
                            setDeliveryChargeForm({ ...deliveryChargeForm, cube_ranges: arr });
                          }} className="px-3 py-1.5 border rounded text-sm" />
                          <input type="number" min={0} step="any" placeholder="Per cube" value={r.per_cube_charge} onChange={(e) => {
                            const arr = [...deliveryChargeForm.cube_ranges];
                            arr[idx] = { ...arr[idx], per_cube_charge: e.target.value };
                            setDeliveryChargeForm({ ...deliveryChargeForm, cube_ranges: arr });
                          }} className="px-3 py-1.5 border rounded text-sm" />
                          <input type="number" step="any" placeholder="Min charge" value={r.min_charge ?? ''} onChange={(e) => {
                            const arr = [...deliveryChargeForm.cube_ranges];
                            arr[idx] = { ...arr[idx], min_charge: e.target.value === '' ? null : e.target.value };
                            setDeliveryChargeForm({ ...deliveryChargeForm, cube_ranges: arr });
                          }} className="px-3 py-1.5 border rounded text-sm" />
                          <input type="number" step="any" placeholder="Max charge" value={r.max_charge ?? ''} onChange={(e) => {
                            const arr = [...deliveryChargeForm.cube_ranges];
                            arr[idx] = { ...arr[idx], max_charge: e.target.value === '' ? null : e.target.value };
                            setDeliveryChargeForm({ ...deliveryChargeForm, cube_ranges: arr });
                          }} className="px-3 py-1.5 border rounded text-sm" />
                          {deliveryChargeForm.cube_ranges.length > 1 && (
                            <button type="button" onClick={() => setDeliveryChargeForm({ ...deliveryChargeForm, cube_ranges: deliveryChargeForm.cube_ranges.filter((_, i) => i !== idx) })} className="text-red-600 text-sm">Remove</button>
                          )}
                        </div>
                      ))}
                      <button type="button" onClick={() => setDeliveryChargeForm({ ...deliveryChargeForm, cube_ranges: [...deliveryChargeForm.cube_ranges, defaultCubeRange()] })} className="text-sm text-blue-600">+ Add another cube range</button>
                    </>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={deliveryChargeForm.status}
                      onChange={(e) => setDeliveryChargeForm({ ...deliveryChargeForm, status: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    <select
                      value={deliveryChargeForm.currency}
                      onChange={(e) => setDeliveryChargeForm({ ...deliveryChargeForm, currency: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="USD">USD</option>
                      <option value="">None</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
                <button type="button" onClick={handleCloseDeliveryChargeModal} className="px-6 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-6 py-2 text-sm bg-[#FF8C00] text-white rounded-lg hover:bg-[#e57c00]">
                  {editingDeliveryChargeId ? 'Update' : 'Activate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryCharges;
