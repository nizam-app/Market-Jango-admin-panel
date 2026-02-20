// src/pages/DeliveryCharges.jsx
import React, { useEffect, useState, useRef } from 'react';
import Swal from 'sweetalert2';
import { Plus, Edit3, Trash2, X, CheckCircle2, XCircle, Package, MapPin, Weight, Map, Route, Search } from 'lucide-react';
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
  getDeliveryChargeRoutes,
  getDeliveryChargeRoute,
  createDeliveryChargeRoute,
  updateDeliveryChargeRoute,
  deleteDeliveryChargeRoute,
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

  // Delivery Charge Routes (list + add/edit)
  const [chargeRoutesSearch, setChargeRoutesSearch] = useState('');
  const [deliveryChargeRoutes, setDeliveryChargeRoutes] = useState([]);
  const [loadingChargeRoutes, setLoadingChargeRoutes] = useState(false);
  const [isDeliveryChargeModalOpen, setIsDeliveryChargeModalOpen] = useState(false);
  const [editingDeliveryChargeId, setEditingDeliveryChargeId] = useState(null);
  const chargeRoutesSearchDebounce = useRef(null);

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
    } else if (activeTab === 'zones') {
      fetchZones();
    } else if (activeTab === 'zone-routes') {
      fetchZoneRoutes();
      fetchZones();
      fetchVendors();
    } else if (activeTab === 'weight-charges') {
      fetchWeightCharges();
    } else if (activeTab === 'charge-routes') {
      fetchDeliveryChargeRoutes(chargeRoutesSearch);
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
    fetchVendors(); // ensure vendor dropdown is populated
    setIsDeliveryChargeModalOpen(true);
  };

  const handleCloseDeliveryChargeModal = () => {
    setIsDeliveryChargeModalOpen(false);
    setEditingDeliveryChargeId(null);
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
          { id: 'charge-routes', label: 'Charge Routes', icon: Route },
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
                <p className="text-xs text-gray-500">Add currency and admin ID as needed (handled by API/headers).</p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Route zone name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={deliveryChargeForm.zone_name}
                    onChange={(e) => setDeliveryChargeForm({ ...deliveryChargeForm, zone_name: e.target.value })}
                    placeholder="e.g. UGANDA"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">From point <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={deliveryChargeForm.from_point}
                      onChange={(e) => setDeliveryChargeForm({ ...deliveryChargeForm, from_point: e.target.value })}
                      placeholder="e.g. JINJA"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">To point <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={deliveryChargeForm.to_point}
                      onChange={(e) => setDeliveryChargeForm({ ...deliveryChargeForm, to_point: e.target.value })}
                      placeholder="e.g. KAMPALA"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
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
