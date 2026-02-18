// src/pages/DeliveryCharges.jsx
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { Plus, Edit3, Trash2, X, CheckCircle2, XCircle, Package, MapPin, Weight, Map } from 'lucide-react';
import {
  getDeliveryDashboard,
  getZones,
  getZone,
  createZone,
  updateZone,
  deleteZone,
  getZoneRoutes,
  createZoneRoute,
  updateZoneRoute,
  deleteZoneRoute,
  getWeightCharges,
  createWeightCharge,
  updateWeightCharge,
  deleteWeightCharge,
} from '../api/adminApi';
import axiosClient from '../api/axiosClient';
import { Link } from 'react-router';

const BRAND = '#FF8C00';

const DeliveryCharges = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [zoneRoutes, setZoneRoutes] = useState([]);
  const [weightCharges, setWeightCharges] = useState([]);
  const [zones, setZones] = useState([]);
  const [zonesLoading, setZonesLoading] = useState(false);
  const [zonesError, setZonesError] = useState(null);
  const [vendors, setVendors] = useState([]);

  // Modal states
  const [isZoneRouteModalOpen, setIsZoneRouteModalOpen] = useState(false);
  const [isWeightChargeModalOpen, setIsWeightChargeModalOpen] = useState(false);
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [editingZoneRoute, setEditingZoneRoute] = useState(null);
  const [editingWeightCharge, setEditingWeightCharge] = useState(null);
  const [editingZone, setEditingZone] = useState(null);

  // Zone (manage zones) form
  const [zoneForm, setZoneForm] = useState({
    name: '',
    center_latitude: '',
    center_longitude: '',
    radius_km: '',
    price: '',
    status: 'Active',
  });

  // Zone Route Form
  const [zoneRouteForm, setZoneRouteForm] = useState({
    from_zone_id: '',
    to_zone_id: '',
    vendor_id: '',
    base_charge: '',
    per_km_charge: '',
    min_charge: '',
    max_charge: '',
    status: 'Active',
  });

  // Weight Charge Form
  const [weightChargeForm, setWeightChargeForm] = useState({
    min_weight: '',
    max_weight: '',
    weight_unit: 'kg',
    delivery_charge: '',
    status: true,
  });

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboard();
    } else if (activeTab === 'zones') {
      fetchZones();
    } else if (activeTab === 'zone-routes') {
      fetchZoneRoutes();
      fetchZones();
      fetchVendors();
    } else if (activeTab === 'weight-charges') {
      fetchWeightCharges();
    }
  }, [activeTab]);

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

  const fetchZoneRoutes = async () => {
    setLoading(true);
    try {
      const res = await getZoneRoutes();
      const data = res.data?.data || res.data || [];
      setZoneRoutes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch zone routes', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err?.response?.data?.message || 'Failed to load zone routes',
        confirmButtonColor: BRAND,
      });
      setZoneRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeightCharges = async () => {
    setLoading(true);
    try {
      const res = await getWeightCharges();
      // Backend now returns an object: { charges: [...], total, current_page, per_page, last_page }
      const payload = res.data || {};
      const list = Array.isArray(payload.charges) ? payload.charges : [];
      setWeightCharges(list);
      // If you later add pagination UI, you can also use:
      // payload.total, payload.current_page, payload.per_page, payload.last_page
    } catch (err) {
      console.error('Failed to fetch weight charges', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err?.response?.data?.message || 'Failed to load weight charges',
        confirmButtonColor: BRAND,
      });
      setWeightCharges([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchZones = async () => {
    setZonesLoading(true);
    setZonesError(null);
    try {
      const res = await getZones(100);
      // Paginated response: zones array is in response.data.data
      const data = res.data?.data;
      const zonesList = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      setZones(zonesList.map((zone) => ({ ...zone, name: zone.name || `Zone ${zone.id}` })));
    } catch (err) {
      console.error('Failed to fetch zones', err);
      setZonesError(err?.response?.data?.message || 'Failed to load zones');
      setZones([]);
      Swal.fire({
        icon: 'error',
        title: 'Zones failed to load',
        text: err?.response?.data?.message || 'Could not load zones for dropdowns.',
        confirmButtonColor: BRAND,
      });
    } finally {
      setZonesLoading(false);
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

  const handleOpenZoneRouteModal = (route = null) => {
    if (route) {
      setEditingZoneRoute(route);
      setZoneRouteForm({
        from_zone_id: route.from_zone_id || '',
        to_zone_id: route.to_zone_id || '',
        vendor_id: route.vendor_id || '',
        base_charge: route.base_charge || '',
        per_km_charge: route.per_km_charge || '',
        min_charge: route.min_charge || '',
        max_charge: route.max_charge || '',
        status: route.status === 'Inactive' ? 'Inactive' : 'Active',
      });
    } else {
      setEditingZoneRoute(null);
      setZoneRouteForm({
        from_zone_id: '',
        to_zone_id: '',
        vendor_id: '',
        base_charge: '',
        per_km_charge: '',
        min_charge: '',
        max_charge: '',
        status: 'Active',
      });
    }
    setIsZoneRouteModalOpen(true);
  };

  const handleCloseZoneRouteModal = () => {
    setIsZoneRouteModalOpen(false);
    setEditingZoneRoute(null);
  };

  const handleOpenZoneModal = (zone = null) => {
    if (zone) {
      setEditingZone(zone);
      setZoneForm({
        name: zone.name || '',
        center_latitude: zone.center_latitude ?? '',
        center_longitude: zone.center_longitude ?? '',
        radius_km: zone.radius_km ?? '',
        price: zone.price ?? '',
        status: zone.status || 'Active',
      });
    } else {
      setEditingZone(null);
      setZoneForm({
        name: '',
        center_latitude: '',
        center_longitude: '',
        radius_km: '',
        price: '',
        status: 'Active',
      });
    }
    setIsZoneModalOpen(true);
  };

  const handleCloseZoneModal = () => {
    setIsZoneModalOpen(false);
    setEditingZone(null);
  };

  const handleSubmitZone = async (e) => {
    e.preventDefault();
    const name = String(zoneForm.name).trim();
    if (!name || zoneForm.center_latitude === '' || zoneForm.center_longitude === '' || zoneForm.radius_km === '' || zoneForm.price === '') {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please fill in all required fields',
        confirmButtonColor: BRAND,
      });
      return;
    }
    if (name.length > 50) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Name must be at most 50 characters',
        confirmButtonColor: BRAND,
      });
      return;
    }
    const payload = {
      name,
      center_latitude: parseFloat(zoneForm.center_latitude),
      center_longitude: parseFloat(zoneForm.center_longitude),
      radius_km: parseFloat(zoneForm.radius_km),
      price: parseFloat(zoneForm.price),
      status: zoneForm.status,
    };
    try {
      Swal.showLoading();
      if (editingZone) {
        await updateZone(editingZone.id, payload);
      } else {
        await createZone(payload);
      }
      Swal.close();
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: editingZone ? 'Zone updated' : 'Zone created',
        showConfirmButton: false,
        timer: 1800,
      });
      handleCloseZoneModal();
      fetchZones();
    } catch (err) {
      Swal.close();
      const msg = err?.response?.data?.message || err.message || 'Failed to save zone';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: msg,
        confirmButtonColor: BRAND,
      });
    }
  };

  const handleDeleteZone = async (zone) => {
    const result = await Swal.fire({
      title: 'Delete this zone?',
      text: 'Zone routes using it may be affected.',
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
      await deleteZone(zone.id);
      Swal.close();
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Zone deleted',
        showConfirmButton: false,
        timer: 1800,
      });
      fetchZones();
    } catch (err) {
      Swal.close();
      const msg = err?.response?.data?.message || err.message || 'Failed to delete zone';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: msg,
        confirmButtonColor: BRAND,
      });
    }
  };

  const handleSubmitZoneRoute = async (e) => {
    e.preventDefault();

    // Client-side validation with specific messages
    if (!zoneRouteForm.from_zone_id || String(zoneRouteForm.from_zone_id).trim() === '') {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please select From Zone',
        confirmButtonColor: BRAND,
      });
      return;
    }
    if (!zoneRouteForm.to_zone_id || String(zoneRouteForm.to_zone_id).trim() === '') {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please select To Zone',
        confirmButtonColor: BRAND,
      });
      return;
    }
    const baseChargeNum = parseFloat(zoneRouteForm.base_charge);
    if (zoneRouteForm.base_charge === '' || zoneRouteForm.base_charge == null || Number.isNaN(baseChargeNum) || baseChargeNum < 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Base Charge is required and must be 0 or greater',
        confirmButtonColor: BRAND,
      });
      return;
    }

    try {
      Swal.showLoading();
      // Send numeric zone IDs and numbers for all numeric fields; vendor_id null for global
      const fromId = Number(zoneRouteForm.from_zone_id);
      const toId = Number(zoneRouteForm.to_zone_id);
      const payload = {
        from_zone_id: fromId,
        to_zone_id: toId,
        base_charge: baseChargeNum,
        per_km_charge:
          zoneRouteForm.per_km_charge !== '' && zoneRouteForm.per_km_charge != null
            ? Number(zoneRouteForm.per_km_charge)
            : null,
        min_charge:
          zoneRouteForm.min_charge !== '' && zoneRouteForm.min_charge != null
            ? Number(zoneRouteForm.min_charge)
            : null,
        max_charge:
          zoneRouteForm.max_charge !== '' && zoneRouteForm.max_charge != null
            ? Number(zoneRouteForm.max_charge)
            : null,
        status: zoneRouteForm.status === 'active' || zoneRouteForm.status === 'Active' ? 'Active' : 'Inactive',
        vendor_id:
          zoneRouteForm.vendor_id !== '' && zoneRouteForm.vendor_id != null
            ? Number(zoneRouteForm.vendor_id)
            : null,
      };

      if (editingZoneRoute) {
        await updateZoneRoute(editingZoneRoute.id, payload);
      } else {
        await createZoneRoute(payload);
      }

      Swal.close();
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: editingZoneRoute ? 'Zone route updated' : 'Zone route created',
        showConfirmButton: false,
        timer: 1800,
      });

      handleCloseZoneRouteModal();
      fetchZoneRoutes();
    } catch (err) {
      Swal.close();
      console.error('Save zone route error', err);
      // Show backend message and optionally validation errors (e.g. 422)
      const data = err?.response?.data;
      let message = data?.message || err.message || 'Failed to save zone route';
      const errors = data?.data?.errors ?? data?.errors;
      if (errors && typeof errors === 'object') {
        const parts = Object.entries(errors).map(([field, msgs]) => {
          const list = Array.isArray(msgs) ? msgs.join(' ') : String(msgs);
          return `${field}: ${list}`;
        });
        if (parts.length) message = message + (message ? '\n\n' : '') + parts.join('\n');
      }
      Swal.fire({
        icon: 'error',
        title: data?.message ? 'Validation failed' : 'Error',
        text: message,
        confirmButtonColor: BRAND,
      });
    }
  };

  const handleDeleteZoneRoute = async (route) => {
    const result = await Swal.fire({
      title: 'Delete Zone Route?',
      text: 'Are you sure you want to delete this zone route?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
    });

    if (!result.isConfirmed) return;

    try {
      Swal.showLoading();
      await deleteZoneRoute(route.id);
      Swal.close();
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Zone route deleted',
        showConfirmButton: false,
        timer: 1800,
      });
      fetchZoneRoutes();
    } catch (err) {
      Swal.close();
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err?.response?.data?.message || 'Failed to delete zone route',
        confirmButtonColor: BRAND,
      });
    }
  };

  const handleOpenWeightChargeModal = (charge = null) => {
    if (charge) {
      setEditingWeightCharge(charge);
      setWeightChargeForm({
        min_weight: charge.min_weight || '',
        max_weight: charge.max_weight || '',
        weight_unit: charge.weight_unit || 'kg',
        delivery_charge: charge.delivery_charge || '',
        status: charge.status !== undefined ? charge.status : true,
      });
    } else {
      setEditingWeightCharge(null);
      setWeightChargeForm({
        min_weight: '',
        max_weight: '',
        weight_unit: 'kg',
        delivery_charge: '',
        status: true,
      });
    }
    setIsWeightChargeModalOpen(true);
  };

  const handleCloseWeightChargeModal = () => {
    setIsWeightChargeModalOpen(false);
    setEditingWeightCharge(null);
  };

  const handleSubmitWeightCharge = async (e) => {
    e.preventDefault();
    if (!weightChargeForm.min_weight || !weightChargeForm.max_weight || !weightChargeForm.delivery_charge) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please fill in all required fields',
        confirmButtonColor: BRAND,
      });
      return;
    }

    try {
      Swal.showLoading();
      const payload = {
        min_weight: parseFloat(weightChargeForm.min_weight),
        max_weight: parseFloat(weightChargeForm.max_weight),
        weight_unit: weightChargeForm.weight_unit,
        delivery_charge: parseFloat(weightChargeForm.delivery_charge),
        status: weightChargeForm.status,
      };

      if (editingWeightCharge) {
        await updateWeightCharge(editingWeightCharge.id, payload);
      } else {
        await createWeightCharge(payload);
      }

      Swal.close();
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: editingWeightCharge ? 'Weight charge updated' : 'Weight charge created',
        showConfirmButton: false,
        timer: 1800,
      });

      handleCloseWeightChargeModal();
      fetchWeightCharges();
    } catch (err) {
      Swal.close();
      console.error('Save weight charge error', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err?.response?.data?.message || 'Failed to save weight charge',
        confirmButtonColor: BRAND,
      });
    }
  };

  const handleDeleteWeightCharge = async (charge) => {
    const result = await Swal.fire({
      title: 'Delete Weight Charge?',
      text: 'Are you sure you want to delete this weight charge?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
    });

    if (!result.isConfirmed) return;

    try {
      Swal.showLoading();
      await deleteWeightCharge(charge.id);
      Swal.close();
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Weight charge deleted',
        showConfirmButton: false,
        timer: 1800,
      });
      fetchWeightCharges();
    } catch (err) {
      Swal.close();
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err?.response?.data?.message || 'Failed to delete weight charge',
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

  const getZoneName = (zoneId) => {
    if (zoneId == null) return '—';
    const zone = zones.find((z) => z.id === zoneId || z.id === Number(zoneId));
    return zone ? zone.name : `Zone ${zoneId}`;
  };

  const getVendorName = (vendorId) => {
    if (!vendorId) return 'Global';
    const vendor = vendors.find((v) => v.id === vendorId || v.vendor?.id === vendorId);
    return vendor ? vendor.name || vendor.email : `Vendor ${vendorId}`;
  };

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
          { id: 'zones', label: 'Zones', icon: Map },
          { id: 'zone-routes', label: 'Zone Routes', icon: MapPin },
          { id: 'weight-charges', label: 'Weight Charges', icon: Weight },
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

      {/* Zones Tab */}
      {activeTab === 'zones' && (
        <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 6px 18px rgba(16,24,40,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111' }}>Manage Zones</h3>
            <button
              type="button"
              onClick={() => handleOpenZoneModal()}
              className="inline-flex items-center gap-2 rounded-lg bg-[#FF8C00] px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-[#e57c00] transition"
            >
              <Plus className="w-4 h-4" />
              Add Zone
            </button>
          </div>
          <p style={{ fontSize: 13, color: '#555', marginBottom: 16 }}>
            After adding zones, go to the <strong>Zone Routes</strong> tab to create From Zone → To Zone delivery routes.
          </p>
          {zonesLoading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>Loading zones…</div>
          ) : zones.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>
              No zones yet. Add a zone below; then you can use them in the Zone Routes tab.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '12px 14px', borderBottom: '1px solid #f0f0f3', color: '#666', fontSize: 13 }}>Name</th>
                    <th style={{ textAlign: 'left', padding: '12px 14px', borderBottom: '1px solid #f0f0f3', color: '#666', fontSize: 13 }}>Center (Lat, Long)</th>
                    <th style={{ textAlign: 'left', padding: '12px 14px', borderBottom: '1px solid #f0f0f3', color: '#666', fontSize: 13 }}>Radius (km)</th>
                    <th style={{ textAlign: 'left', padding: '12px 14px', borderBottom: '1px solid #f0f0f3', color: '#666', fontSize: 13 }}>Price</th>
                    <th style={{ textAlign: 'left', padding: '12px 14px', borderBottom: '1px solid #f0f0f3', color: '#666', fontSize: 13 }}>Status</th>
                    <th style={{ textAlign: 'right', padding: '12px 14px', borderBottom: '1px solid #f0f0f3', color: '#666', fontSize: 13 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {zones.map((zone) => (
                    <tr key={zone.id}>
                      <td style={{ padding: '12px 14px', borderBottom: '1px solid #fbfbfc', fontWeight: 600 }}>{zone.name}</td>
                      <td style={{ padding: '12px 14px', borderBottom: '1px solid #fbfbfc', fontSize: 13 }}>
                        {zone.center_latitude != null && zone.center_longitude != null
                          ? `${Number(zone.center_latitude).toFixed(4)}, ${Number(zone.center_longitude).toFixed(4)}`
                          : '—'}
                      </td>
                      <td style={{ padding: '12px 14px', borderBottom: '1px solid #fbfbfc' }}>{zone.radius_km != null ? zone.radius_km : '—'}</td>
                      <td style={{ padding: '12px 14px', borderBottom: '1px solid #fbfbfc' }}>{zone.price != null ? zone.price : '—'}</td>
                      <td style={{ padding: '12px 14px', borderBottom: '1px solid #fbfbfc' }}>{getStatusBadge(zone.status)}</td>
                      <td style={{ padding: '12px 14px', borderBottom: '1px solid #fbfbfc', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenZoneModal(zone)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteZone(zone)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
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

      {/* Zone Routes Tab */}
      {activeTab === 'zone-routes' && (
        <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 6px 18px rgba(16,24,40,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111' }}>Zone Routes</h3>
            <button
              type="button"
              onClick={() => handleOpenZoneRouteModal()}
              className="inline-flex items-center gap-2 rounded-lg bg-[#FF8C00] px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-[#e57c00] transition"
            >
              <Plus className="w-4 h-4" />
              Add Zone Route
            </button>
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>Loading zone routes...</div>
          ) : zoneRoutes.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>No zone routes found</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1000 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '12px 14px', borderBottom: '1px solid #f0f0f3', color: '#666', fontSize: 13 }}>From Zone</th>
                    <th style={{ textAlign: 'left', padding: '12px 14px', borderBottom: '1px solid #f0f0f3', color: '#666', fontSize: 13 }}>To Zone</th>
                    <th style={{ textAlign: 'left', padding: '12px 14px', borderBottom: '1px solid #f0f0f3', color: '#666', fontSize: 13 }}>Vendor</th>
                    <th style={{ textAlign: 'left', padding: '12px 14px', borderBottom: '1px solid #f0f0f3', color: '#666', fontSize: 13 }}>Base Charge</th>
                    <th style={{ textAlign: 'left', padding: '12px 14px', borderBottom: '1px solid #f0f0f3', color: '#666', fontSize: 13 }}>Per KM</th>
                    <th style={{ textAlign: 'left', padding: '12px 14px', borderBottom: '1px solid #f0f0f3', color: '#666', fontSize: 13 }}>Min/Max</th>
                    <th style={{ textAlign: 'left', padding: '12px 14px', borderBottom: '1px solid #f0f0f3', color: '#666', fontSize: 13 }}>Status</th>
                    <th style={{ textAlign: 'right', padding: '12px 14px', borderBottom: '1px solid #f0f0f3', color: '#666', fontSize: 13 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {zoneRoutes.map((route) => (
                    <tr key={route.id}>
                      <td style={{ padding: '12px 14px', borderBottom: '1px solid #fbfbfc' }}>{getZoneName(route.from_zone_id)}</td>
                      <td style={{ padding: '12px 14px', borderBottom: '1px solid #fbfbfc' }}>{getZoneName(route.to_zone_id)}</td>
                      <td style={{ padding: '12px 14px', borderBottom: '1px solid #fbfbfc' }}>{getVendorName(route.vendor_id)}</td>
                      <td style={{ padding: '12px 14px', borderBottom: '1px solid #fbfbfc' }}>${route.base_charge || 0}</td>
                      <td style={{ padding: '12px 14px', borderBottom: '1px solid #fbfbfc' }}>{route.per_km_charge ? `$${route.per_km_charge}/km` : '-'}</td>
                      <td style={{ padding: '12px 14px', borderBottom: '1px solid #fbfbfc', fontSize: 13 }}>
                        {route.min_charge || route.max_charge
                          ? `$${route.min_charge || '-'} / $${route.max_charge || '-'}`
                          : '-'}
                      </td>
                      <td style={{ padding: '12px 14px', borderBottom: '1px solid #fbfbfc' }}>{getStatusBadge(route.status)}</td>
                      <td style={{ padding: '12px 14px', borderBottom: '1px solid #fbfbfc', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleOpenZoneRouteModal(route)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteZoneRoute(route)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
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

      {/* Weight Charges Tab */}
      {activeTab === 'weight-charges' && (
        <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 6px 18px rgba(16,24,40,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111' }}>Weight Charges</h3>
            <button
              type="button"
              onClick={() => handleOpenWeightChargeModal()}
              className="inline-flex items-center gap-2 rounded-lg bg-[#FF8C00] px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-[#e57c00] transition"
            >
              <Plus className="w-4 h-4" />
              Add Weight Charge
            </button>
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>Loading weight charges...</div>
          ) : weightCharges.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>No weight charges found</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '12px 14px', borderBottom: '1px solid #f0f0f3', color: '#666', fontSize: 13 }}>Min Weight</th>
                    <th style={{ textAlign: 'left', padding: '12px 14px', borderBottom: '1px solid #f0f0f3', color: '#666', fontSize: 13 }}>Max Weight</th>
                    <th style={{ textAlign: 'left', padding: '12px 14px', borderBottom: '1px solid #f0f0f3', color: '#666', fontSize: 13 }}>Unit</th>
                    <th style={{ textAlign: 'left', padding: '12px 14px', borderBottom: '1px solid #f0f0f3', color: '#666', fontSize: 13 }}>Delivery Charge</th>
                    <th style={{ textAlign: 'left', padding: '12px 14px', borderBottom: '1px solid #f0f0f3', color: '#666', fontSize: 13 }}>Status</th>
                    <th style={{ textAlign: 'right', padding: '12px 14px', borderBottom: '1px solid #f0f0f3', color: '#666', fontSize: 13 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {weightCharges.map((charge) => (
                    <tr key={charge.id}>
                      <td style={{ padding: '12px 14px', borderBottom: '1px solid #fbfbfc' }}>{charge.min_weight}</td>
                      <td style={{ padding: '12px 14px', borderBottom: '1px solid #fbfbfc' }}>{charge.max_weight}</td>
                      <td style={{ padding: '12px 14px', borderBottom: '1px solid #fbfbfc' }}>{charge.weight_unit}</td>
                      <td style={{ padding: '12px 14px', borderBottom: '1px solid #fbfbfc' }}>${charge.delivery_charge}</td>
                      <td style={{ padding: '12px 14px', borderBottom: '1px solid #fbfbfc' }}>{getStatusBadge(charge.status)}</td>
                      <td style={{ padding: '12px 14px', borderBottom: '1px solid #fbfbfc', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleOpenWeightChargeModal(charge)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteWeightCharge(charge)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
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

      {/* Zone Route Modal */}
      {isZoneRouteModalOpen && (
        <div className="fixed top-0 left-0 bg-black/50 w-full h-full flex items-center justify-center p-4 z-50" onClick={handleCloseZoneRouteModal}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingZoneRoute ? 'Edit Zone Route' : 'Create Zone Route'}
              </h2>
              <button type="button" onClick={handleCloseZoneRouteModal} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitZoneRoute} className="flex-1 overflow-y-auto">
              <div className="px-6 py-6 space-y-5">
                {/* Zones loading / error / empty message */}
                {zonesLoading && (
                  <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
                    Loading zones…
                  </div>
                )}
                {zonesError && !zonesLoading && (
                  <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
                    {zonesError}
                  </div>
                )}
                {!zonesLoading && !zonesError && zones.length === 0 && (
                  <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
                    No zones found. Please create zones first in{' '}
                    <Link to="/route-management" className="font-semibold text-amber-900 underline hover:text-amber-700">
                      Route Mgmt
                    </Link>{' '}
                    and then add zone routes here.
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      From Zone <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={zoneRouteForm.from_zone_id}
                      onChange={(e) => setZoneRouteForm({ ...zoneRouteForm, from_zone_id: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      required
                      disabled={zonesLoading || !!zonesError}
                    >
                      <option value="">{zonesLoading ? 'Loading…' : 'Select Zone'}</option>
                      {zones.map((zone) => (
                        <option key={zone.id} value={zone.id}>
                          {zone.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      To Zone <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={zoneRouteForm.to_zone_id}
                      onChange={(e) => setZoneRouteForm({ ...zoneRouteForm, to_zone_id: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      required
                      disabled={zonesLoading || !!zonesError}
                    >
                      <option value="">{zonesLoading ? 'Loading…' : 'Select Zone'}</option>
                      {zones.map((zone) => (
                        <option key={zone.id} value={zone.id}>
                          {zone.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vendor (Optional - leave empty for global)</label>
                  <select
                    value={zoneRouteForm.vendor_id}
                    onChange={(e) => setZoneRouteForm({ ...zoneRouteForm, vendor_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Global (All Vendors)</option>
                    {vendors.map((vendor) => (
                      <option key={vendor.id} value={vendor.id}>
                        {vendor.name || vendor.email}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base Charge <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={zoneRouteForm.base_charge}
                    onChange={(e) => setZoneRouteForm({ ...zoneRouteForm, base_charge: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Per KM Charge</label>
                    <input
                      type="number"
                      step="0.01"
                      value={zoneRouteForm.per_km_charge}
                      onChange={(e) => setZoneRouteForm({ ...zoneRouteForm, per_km_charge: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Min Charge</label>
                    <input
                      type="number"
                      step="0.01"
                      value={zoneRouteForm.min_charge}
                      onChange={(e) => setZoneRouteForm({ ...zoneRouteForm, min_charge: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Charge</label>
                    <input
                      type="number"
                      step="0.01"
                      value={zoneRouteForm.max_charge}
                      onChange={(e) => setZoneRouteForm({ ...zoneRouteForm, max_charge: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={zoneRouteForm.status}
                    onChange={(e) => setZoneRouteForm({ ...zoneRouteForm, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
                <button type="button" onClick={handleCloseZoneRouteModal} className="px-6 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 text-sm bg-[#FF8C00] text-white rounded-lg hover:bg-[#e57c00]">
                  {editingZoneRoute ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Weight Charge Modal */}
      {isWeightChargeModalOpen && (
        <div className="fixed top-0 left-0 bg-black/50 w-full h-full flex items-center justify-center p-4 z-50" onClick={handleCloseWeightChargeModal}>
          <div className="bg-white rounded-xl max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingWeightCharge ? 'Edit Weight Charge' : 'Create Weight Charge'}
              </h2>
              <button type="button" onClick={handleCloseWeightChargeModal} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitWeightCharge} className="flex-1 overflow-y-auto">
              <div className="px-6 py-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Min Weight <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={weightChargeForm.min_weight}
                      onChange={(e) => setWeightChargeForm({ ...weightChargeForm, min_weight: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Weight <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={weightChargeForm.max_weight}
                      onChange={(e) => setWeightChargeForm({ ...weightChargeForm, max_weight: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Weight Unit</label>
                    <select
                      value={weightChargeForm.weight_unit}
                      onChange={(e) => setWeightChargeForm({ ...weightChargeForm, weight_unit: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="kg">Kilogram (kg)</option>
                      <option value="gram">Gram</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Charge <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={weightChargeForm.delivery_charge}
                      onChange={(e) => setWeightChargeForm({ ...weightChargeForm, delivery_charge: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="weight_status"
                      checked={weightChargeForm.status}
                      onChange={(e) => setWeightChargeForm({ ...weightChargeForm, status: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="weight_status" className="text-sm font-medium text-gray-700">
                      Active
                    </label>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
                <button type="button" onClick={handleCloseWeightChargeModal} className="px-6 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 text-sm bg-[#FF8C00] text-white rounded-lg hover:bg-[#e57c00]">
                  {editingWeightCharge ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Zone (Manage Zones) Modal */}
      {isZoneModalOpen && (
        <div className="fixed top-0 left-0 bg-black/50 w-full h-full flex items-center justify-center p-4 z-50" onClick={handleCloseZoneModal}>
          <div className="bg-white rounded-xl max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingZone ? 'Edit Zone' : 'Add Zone'}
              </h2>
              <button type="button" onClick={handleCloseZoneModal} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitZone} className="flex-1 overflow-y-auto">
              <div className="px-6 py-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name <span className="text-red-500">*</span> <span className="text-gray-400 font-normal">(max 50 characters)</span>
                  </label>
                  <input
                    type="text"
                    maxLength={50}
                    value={zoneForm.name}
                    onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Center Latitude <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={zoneForm.center_latitude}
                      onChange={(e) => setZoneForm({ ...zoneForm, center_latitude: e.target.value })}
                      placeholder="e.g. 23.8103"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Center Longitude <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={zoneForm.center_longitude}
                      onChange={(e) => setZoneForm({ ...zoneForm, center_longitude: e.target.value })}
                      placeholder="e.g. 90.4125"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Radius (km) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={zoneForm.radius_km}
                      onChange={(e) => setZoneForm({ ...zoneForm, radius_km: e.target.value })}
                      placeholder="e.g. 5"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={zoneForm.price}
                      onChange={(e) => setZoneForm({ ...zoneForm, price: e.target.value })}
                      placeholder="e.g. 50"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={zoneForm.status}
                    onChange={(e) => setZoneForm({ ...zoneForm, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
                <button type="button" onClick={handleCloseZoneModal} className="px-6 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 text-sm bg-[#FF8C00] text-white rounded-lg hover:bg-[#e57c00]">
                  {editingZone ? 'Update Zone' : 'Create Zone'}
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
