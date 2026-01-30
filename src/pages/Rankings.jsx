// src/pages/Rankings.jsx
import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { recalculateRankings } from '../api/adminApi';

const BRAND = '#FF8C00';

const Rankings = () => {
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const handleRecalculate = async (type) => {
    const typeLabels = {
      all: 'All Rankings',
      vendor: 'Vendor Rankings',
      driver: 'Driver Rankings',
    };

    const result = await Swal.fire({
      title: 'Recalculate Rankings?',
      html: `You are about to recalculate <strong>${typeLabels[type]}</strong>.<br/><br/>This operation may take some time and use server resources. Are you sure you want to continue?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, recalculate',
      cancelButtonText: 'Cancel',
      confirmButtonColor: BRAND,
      cancelButtonColor: '#6b7280',
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      Swal.fire({
        title: 'Recalculating...',
        html: 'Please wait while rankings are being recalculated. This may take a few moments.',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const res = await recalculateRankings(type);
      const data = res.data?.data || res.data || {};

      setLastResult({
        type: typeLabels[type],
        vendors_updated: data.vendors_updated || 0,
        drivers_updated: data.drivers_updated || 0,
        timestamp: new Date().toLocaleString(),
      });

      Swal.close();
      Swal.fire({
        icon: 'success',
        title: 'Rankings Recalculated',
        html: `
          <div style="text-align: left; margin-top: 10px;">
            <p><strong>Type:</strong> ${typeLabels[type]}</p>
            <p><strong>Vendors Updated:</strong> ${data.vendors_updated || 0}</p>
            <p><strong>Drivers Updated:</strong> ${data.drivers_updated || 0}</p>
          </div>
        `,
        confirmButtonColor: BRAND,
      });
    } catch (err) {
      Swal.close();
      console.error('Recalculate rankings error', err);
      Swal.fire({
        icon: 'error',
        title: 'Recalculation Failed',
        text: err?.response?.data?.message || 'Failed to recalculate rankings',
        confirmButtonColor: BRAND,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, fontFamily: "'Inter', system-ui, Arial, sans-serif", background: '#f7f8fb', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 6 }}>Ranking Management</div>
        <div style={{ color: '#555', fontSize: 13 }}>Recalculate vendor and driver priority rankings</div>
      </div>

      {/* Main Card */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 6px 18px rgba(16,24,40,0.06)' }}>
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111', marginBottom: 12 }}>Recalculate Rankings</h3>
          <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6 }}>
            Use this tool to recalculate priority rankings for vendors and drivers. This process updates rankings based on
            current subscription plans, priority boosts, and other factors. The operation may take a few moments to complete.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          <button
            type="button"
            onClick={() => handleRecalculate('all')}
            disabled={loading}
            className="inline-flex items-center justify-center gap-3 rounded-lg bg-[#FF8C00] px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-[#e57c00] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF8C00] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            <span>Recalculate All Rankings</span>
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <button
              type="button"
              onClick={() => handleRecalculate('vendor')}
              disabled={loading}
              className="inline-flex items-center justify-center gap-3 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              <span>Recalculate Vendor Rankings</span>
            </button>

            <button
              type="button"
              onClick={() => handleRecalculate('driver')}
              disabled={loading}
              className="inline-flex items-center justify-center gap-3 rounded-lg bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-purple-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              <span>Recalculate Driver Rankings</span>
            </button>
          </div>
        </div>

        {/* Last Result */}
        {lastResult && (
          <div
            style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: 8,
              padding: 16,
              marginTop: 24,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <h4 style={{ fontSize: 14, fontWeight: 600, color: '#166534' }}>Last Recalculation Result</h4>
            </div>
            <div style={{ fontSize: 13, color: '#166534', lineHeight: 1.8 }}>
              <div>
                <strong>Type:</strong> {lastResult.type}
              </div>
              <div>
                <strong>Vendors Updated:</strong> {lastResult.vendors_updated}
              </div>
              <div>
                <strong>Drivers Updated:</strong> {lastResult.drivers_updated}
              </div>
              <div style={{ marginTop: 8, fontSize: 12, color: '#15803d' }}>
                Completed at: {lastResult.timestamp}
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div
          style={{
            background: '#fef3c7',
            border: '1px solid #fde68a',
            borderRadius: 8,
            padding: 16,
            marginTop: 24,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'start', gap: 8 }}>
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" style={{ marginTop: 2 }} />
            <div style={{ fontSize: 13, color: '#92400e', lineHeight: 1.6 }}>
              <strong>Note:</strong> Recalculating rankings may temporarily impact server performance. It's recommended to
              perform this operation during off-peak hours. The process updates priority rankings based on current
              subscription plans and priority boost values.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rankings;
