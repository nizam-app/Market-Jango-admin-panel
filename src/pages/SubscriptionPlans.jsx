// src/pages/SubscriptionPlans.jsx
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { Plus, Edit3, Trash2, X, CheckCircle2, XCircle } from 'lucide-react';
import { getAllPlans, createPlan, updatePlan, deletePlan, getZones } from '../api/adminApi';

const BRAND = '#FF8C00';

const SubscriptionPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [filter, setFilter] = useState('All'); // All, Active, Inactive
  const [userTypeFilter, setUserTypeFilter] = useState('All'); // All, vendor, driver, both
  const [zoneOptions, setZoneOptions] = useState([]); // zones.name from Zone Management

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    currency: 'USD',
    billing_period: 'monthly',
    category_limit: '',
    business_type_limit: '',
    image_limit: '',
    visibility_limit: '',
    moderator_limit: '',
    vendor_driver_order_limit: '',
    max_routes: 4,
    trial_days: '',
    is_free: false,
    has_affiliate: false,
    has_priority_ranking: false,
    priority_boost: '',
    for_user_type: 'vendor',
    status: 'active',
    sort_order: '',
    region: '',
    has_marketplace: true,
    has_walk_in: true,
    delivery_zone: '',
  });

  useEffect(() => {
    fetchPlans();
  }, [filter, userTypeFilter]);

  useEffect(() => {
    const loadZones = async () => {
      try {
        const res = await getZones({ perPage: 100, page: 1 });
        const pag = res?.data?.data;
        const list = Array.isArray(pag?.data) ? pag.data : Array.isArray(pag) ? pag : [];
        const names = list
          .filter((z) => (z.status || 'Active') === 'Active' && z.name)
          .map((z) => z.name)
          .sort((a, b) => a.localeCompare(b));
        setZoneOptions(names);
      } catch (err) {
        console.error('Failed to load zones for plan dropdowns', err);
        setZoneOptions([]);
      }
    };
    loadZones();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (filter !== 'All') {
        filters.status = filter.toLowerCase();
      }
      if (userTypeFilter !== 'All') {
        filters.for_user_type = userTypeFilter;
      }

      const res = await getAllPlans(filters);
      const plansData = res.data?.data || res.data || [];
      setPlans(Array.isArray(plansData) ? plansData : []);
    } catch (err) {
      console.error('Failed to fetch plans', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err?.response?.data?.message || 'Failed to load subscription plans',
        confirmButtonColor: BRAND,
      });
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (plan = null) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name || '',
        description: plan.description || '',
        price: plan.price ?? '',
        currency: plan.currency || 'USD',
        billing_period: plan.billing_period || 'monthly',
        category_limit: plan.category_limit ?? '',
        business_type_limit: plan.business_type_limit ?? '',
        image_limit: plan.image_limit ?? '',
        visibility_limit: plan.visibility_limit ?? '',
        moderator_limit: plan.moderator_limit ?? '',
        vendor_driver_order_limit: plan.vendor_driver_order_limit ?? '',
        max_routes: plan.max_routes ?? 4,
        trial_days: plan.trial_days ?? '',
        is_free: !!plan.is_free,
        has_affiliate: plan.has_affiliate || false,
        has_priority_ranking: plan.has_priority_ranking || false,
        priority_boost: plan.priority_boost ?? '',
        for_user_type: plan.for_user_type || 'vendor',
        status: plan.status || 'active',
        sort_order: plan.sort_order ?? '',
        region: plan.region || '',
        has_marketplace: plan.has_marketplace !== false,
        has_walk_in: plan.has_walk_in !== false,
        delivery_zone: plan.delivery_zone || '',
      });
    } else {
      setEditingPlan(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        currency: 'USD',
        billing_period: 'monthly',
        category_limit: '',
        business_type_limit: '',
        image_limit: '',
        visibility_limit: '',
        moderator_limit: '',
        vendor_driver_order_limit: '',
        max_routes: 4,
        trial_days: '',
        is_free: false,
        has_affiliate: false,
        has_priority_ranking: false,
        priority_boost: '',
        for_user_type: 'vendor',
        status: 'active',
        sort_order: '',
        region: '',
        has_marketplace: true,
        has_walk_in: true,
        delivery_zone: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPlan(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim() || formData.price === '' || formData.price == null) {
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
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        price: formData.is_free ? 0 : parseFloat(formData.price),
        currency: formData.currency,
        billing_period: formData.billing_period,
        category_limit: formData.category_limit ? parseInt(formData.category_limit) : 0,
        business_type_limit: formData.business_type_limit ? parseInt(formData.business_type_limit) : 1,
        image_limit: formData.image_limit ? parseInt(formData.image_limit) : 0,
        visibility_limit: formData.visibility_limit ? parseInt(formData.visibility_limit) : 0,
        moderator_limit: formData.moderator_limit !== '' ? parseInt(formData.moderator_limit, 10) : 0,
        vendor_driver_order_limit:
          formData.vendor_driver_order_limit !== ''
            ? parseInt(formData.vendor_driver_order_limit, 10)
            : 0,
        max_routes: formData.max_routes !== '' && formData.max_routes != null
          ? parseInt(formData.max_routes, 10)
          : 4,
        trial_days: formData.trial_days !== '' && formData.trial_days != null
          ? parseInt(formData.trial_days, 10)
          : null,
        is_free: !!formData.is_free,
        has_affiliate: formData.has_affiliate,
        has_priority_ranking: formData.has_priority_ranking,
        priority_boost: formData.priority_boost ? parseInt(formData.priority_boost) : 0,
        for_user_type: formData.for_user_type,
        status: formData.status,
        sort_order: formData.sort_order ? parseInt(formData.sort_order) : 0,
        region: formData.region.trim() || null,
        has_marketplace: formData.has_marketplace,
        has_walk_in: formData.has_walk_in,
        delivery_zone: formData.delivery_zone.trim() || null,
      };

      if (editingPlan) {
        await updatePlan(editingPlan.id, payload);
      } else {
        await createPlan(payload);
      }

      Swal.close();
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: editingPlan ? 'Plan updated successfully' : 'Plan created successfully',
        showConfirmButton: false,
        timer: 1800,
      });

      handleCloseModal();
      fetchPlans();
    } catch (err) {
      Swal.close();
      console.error('Save plan error', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err?.response?.data?.message || 'Failed to save plan',
        confirmButtonColor: BRAND,
      });
    }
  };

  const handleDelete = async (plan) => {
    const result = await Swal.fire({
      title: 'Delete Plan?',
      text: `Are you sure you want to delete "${plan.name}"? This action cannot be undone.`,
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
      await deletePlan(plan.id);
      Swal.close();

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Plan deleted successfully',
        showConfirmButton: false,
        timer: 1800,
      });

      fetchPlans();
    } catch (err) {
      Swal.close();
      console.error('Delete plan error', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err?.response?.data?.message || 'Failed to delete plan',
        confirmButtonColor: BRAND,
      });
    }
  };

  const getStatusBadge = (status) => {
    const isActive = status === 'active';
    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
          isActive
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-gray-50 text-gray-700 border border-gray-200'
        }`}
      >
        {isActive ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getUserTypeBadge = (type) => {
    const colors = {
      vendor: 'bg-blue-50 text-blue-700 border border-blue-200',
      driver: 'bg-purple-50 text-purple-700 border border-purple-200',
      both: 'bg-orange-50 text-orange-700 border border-orange-200',
    };
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${colors[type] || colors.vendor}`}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };

  return (
    <div style={{ padding: 24, fontFamily: "'Inter', system-ui, Arial, sans-serif", background: '#f7f8fb', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#111' }}>Subscription Plans</div>
          <div style={{ marginTop: 6, color: '#555', fontSize: 13 }}>Manage subscription plans for vendors and drivers</div>
        </div>
        <button
          type="button"
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 rounded-lg bg-[#FF8C00] px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-[#e57c00] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF8C00] transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Plan</span>
        </button>
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <label style={{ fontSize: 13, color: '#666', marginRight: 8 }}>Status:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-md text-sm px-3 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 13, color: '#666', marginRight: 8 }}>User Type:</label>
            <select
              value={userTypeFilter}
              onChange={(e) => setUserTypeFilter(e.target.value)}
              className="border border-gray-300 rounded-md text-sm px-3 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All</option>
              <option value="vendor">Vendor</option>
              <option value="driver">Driver</option>
              <option value="both">Both</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 6px 18px rgba(16,24,40,0.06)' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>Loading plans...</div>
        ) : plans.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>No subscription plans found</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1200 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '12px 14px', borderBottom: '1px solid #f0f0f3', color: '#666', fontSize: 13 }}>Name</th>
                  <th style={{ textAlign: 'left', padding: '12px 14px', borderBottom: '1px solid #f0f0f3', color: '#666', fontSize: 13 }}>Price</th>
                  <th style={{ textAlign: 'left', padding: '12px 14px', borderBottom: '1px solid #f0f0f3', color: '#666', fontSize: 13 }}>User Type</th>
                  <th style={{ textAlign: 'left', padding: '12px 14px', borderBottom: '1px solid #f0f0f3', color: '#666', fontSize: 13 }}>Limits</th>
                  <th style={{ textAlign: 'left', padding: '12px 14px', borderBottom: '1px solid #f0f0f3', color: '#666', fontSize: 13 }}>Features</th>
                  <th style={{ textAlign: 'left', padding: '12px 14px', borderBottom: '1px solid #f0f0f3', color: '#666', fontSize: 13 }}>Status</th>
                  <th style={{ textAlign: 'right', padding: '12px 14px', borderBottom: '1px solid #f0f0f3', color: '#666', fontSize: 13 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan) => (
                  <tr key={plan.id}>
                    <td style={{ padding: '12px 14px', borderBottom: '1px solid #fbfbfc' }}>
                      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{plan.name}</div>
                      {plan.description && (
                        <div style={{ fontSize: 12, color: '#777' }}>{plan.description}</div>
                      )}
                    </td>
                    <td style={{ padding: '12px 14px', borderBottom: '1px solid #fbfbfc' }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>
                        {plan.currency} {plan.price}
                      </div>
                      <div style={{ fontSize: 12, color: '#777' }}>{plan.billing_period}</div>
                    </td>
                    <td style={{ padding: '12px 14px', borderBottom: '1px solid #fbfbfc' }}>
                      {getUserTypeBadge(plan.for_user_type)}
                    </td>
                    <td style={{ padding: '12px 14px', borderBottom: '1px solid #fbfbfc', fontSize: 13 }}>
                      <div>Categories: {plan.category_limit === 0 ? 'Unlimited' : plan.category_limit}</div>
                      <div>Business types: {plan.business_type_limit === 0 ? 'Unlimited' : plan.business_type_limit}</div>
                      <div>Images: {plan.image_limit === 0 ? 'Unlimited' : plan.image_limit}</div>
                      <div>Visibility: {plan.visibility_limit === 0 ? 'Unlimited' : plan.visibility_limit}</div>
                      <div>
                        Moderators:{' '}
                        {(plan.moderator_limit ?? 0) === 0 ? 'Unlimited' : plan.moderator_limit}
                      </div>
                      <div>
                        Vendor→driver orders:{' '}
                        {(plan.vendor_driver_order_limit ?? 0) === 0
                          ? 'Unlimited'
                          : plan.vendor_driver_order_limit}
                      </div>
                      <div>Routes: {plan.max_routes ?? 4}</div>
                      <div>Trial days: {plan.trial_days != null && plan.trial_days !== '' ? plan.trial_days : '—'}</div>
                      <div>Free: {plan.is_free ? 'Yes' : 'No'}</div>
                    </td>
                    <td style={{ padding: '12px 14px', borderBottom: '1px solid #fbfbfc', fontSize: 13 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {plan.has_affiliate && <span style={{ color: '#059669' }}>✓ Affiliate</span>}
                        {plan.has_priority_ranking && (
                          <span style={{ color: '#059669' }}>✓ Priority Ranking (Boost: {plan.priority_boost})</span>
                        )}
                        {!plan.has_affiliate && !plan.has_priority_ranking && (
                          <span style={{ color: '#999' }}>No special features</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', borderBottom: '1px solid #fbfbfc' }}>
                      {getStatusBadge(plan.status)}
                    </td>
                    <td style={{ padding: '12px 14px', borderBottom: '1px solid #fbfbfc', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleOpenModal(plan)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(plan)}
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

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed top-0 left-0 bg-black/50 w-full h-full flex items-center justify-center p-4 z-50" onClick={handleCloseModal}>
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingPlan ? 'Edit Subscription Plan' : 'Create Subscription Plan'}
              </h2>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              <div className="px-6 py-6 space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plan Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                {/* Price and Currency */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    {formData.is_free && (
                      <p className="mt-1 text-xs text-gray-500">Free plan — price will be saved as 0.</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="USD">USD</option>
                      <option value="BDT">BDT</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                </div>

                {/* Route number, trial days, free plan */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Route number (max_routes)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.max_routes}
                      onChange={(e) => setFormData({ ...formData, max_routes: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Trial days</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.trial_days}
                      onChange={(e) => setFormData({ ...formData, trial_days: e.target.value })}
                      placeholder="Optional"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-end pb-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="is_free"
                        checked={formData.is_free}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setFormData({
                            ...formData,
                            is_free: checked,
                            price: checked ? '0' : formData.price,
                          });
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="is_free" className="text-sm font-medium text-gray-700">
                        Free plan
                      </label>
                    </div>
                  </div>
                </div>

                {/* Billing Period and User Type */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Billing Period</label>
                    <select
                      value={formData.billing_period}
                      onChange={(e) => setFormData({ ...formData, billing_period: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">For User Type</label>
                    <select
                      value={formData.for_user_type}
                      onChange={(e) => setFormData({ ...formData, for_user_type: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="vendor">Vendor</option>
                      <option value="driver">Driver</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                </div>

                {/* Limits */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Type Limit (0 = unlimited)</label>
                    <input
                      type="number"
                      value={formData.business_type_limit}
                      onChange={(e) => setFormData({ ...formData, business_type_limit: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category Limit (legacy)</label>
                    <input
                      type="number"
                      value={formData.category_limit}
                      onChange={(e) => setFormData({ ...formData, category_limit: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Image Limit (0 = unlimited)</label>
                    <input
                      type="number"
                      value={formData.image_limit}
                      onChange={(e) => setFormData({ ...formData, image_limit: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Visibility Limit (0 = unlimited)</label>
                    <input
                      type="number"
                      value={formData.visibility_limit}
                      onChange={(e) => setFormData({ ...formData, visibility_limit: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Moderator accounts (excl. owner, 0 = unlimited)
                    </label>
                    <input
                      type="number"
                      value={formData.moderator_limit}
                      onChange={(e) => setFormData({ ...formData, moderator_limit: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Concurrent vendor→driver assignments (0 = unlimited)
                    </label>
                    <input
                      type="number"
                      value={formData.vendor_driver_order_limit}
                      onChange={(e) =>
                        setFormData({ ...formData, vendor_driver_order_limit: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="has_affiliate"
                      checked={formData.has_affiliate}
                      onChange={(e) => setFormData({ ...formData, has_affiliate: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="has_affiliate" className="text-sm font-medium text-gray-700">
                      Has Affiliate Program
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="has_priority_ranking"
                      checked={formData.has_priority_ranking}
                      onChange={(e) => setFormData({ ...formData, has_priority_ranking: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="has_priority_ranking" className="text-sm font-medium text-gray-700">
                      Has Priority Ranking
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="has_marketplace"
                      checked={formData.has_marketplace}
                      onChange={(e) => setFormData({ ...formData, has_marketplace: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="has_marketplace" className="text-sm font-medium text-gray-700">
                      Marketplace (walk-in-only still accepts marketplace orders)
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="has_walk_in"
                      checked={formData.has_walk_in}
                      onChange={(e) => setFormData({ ...formData, has_walk_in: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="has_walk_in" className="text-sm font-medium text-gray-700">
                      Walk-in POS
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
                    <select
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">All regions (global)</option>
                      {formData.region && !zoneOptions.includes(formData.region) && (
                        <option value={formData.region}>{formData.region} (legacy)</option>
                      )}
                      {zoneOptions.map((name) => (
                        <option key={`region-${name}`} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      Must match a Zone Management name. Flutter sends this as ?region=
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Driver delivery zone</label>
                    <select
                      value={formData.delivery_zone}
                      onChange={(e) => setFormData({ ...formData, delivery_zone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">No zone restriction</option>
                      {formData.delivery_zone && !zoneOptions.includes(formData.delivery_zone) && (
                        <option value={formData.delivery_zone}>{formData.delivery_zone} (legacy)</option>
                      )}
                      {zoneOptions.map((name) => (
                        <option key={`delivery-${name}`} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {formData.has_priority_ranking && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Priority Boost (0-1000)</label>
                      <input
                        type="number"
                        value={formData.priority_boost}
                        onChange={(e) => setFormData({ ...formData, priority_boost: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        max="1000"
                      />
                    </div>
                  )}
                </div>

                {/* Status and Sort Order */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort Order</label>
                    <input
                      type="number"
                      value={formData.sort_order}
                      onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-sm bg-[#FF8C00] text-white rounded-lg hover:bg-[#e57c00] transition-colors"
                >
                  {editingPlan ? 'Update Plan' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPlans;
