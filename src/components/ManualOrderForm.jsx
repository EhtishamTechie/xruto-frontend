import React, { useState } from 'react';
import { Loader, CheckCircle, AlertCircle, X, MapPin } from 'lucide-react';
import { parseLatLngFromGoogleMapsText } from '../utils/googleMapsUrl';

const ManualOrderForm = ({ onOrdersUploaded }) => {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    delivery_address: '',
    city: '',
    google_maps_url: '',
    latitude: '',
    longitude: '',
  });

  const [pendingOrders, setPendingOrders] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'google_maps_url') {
      setFormData((prev) => {
        const next = { ...prev, google_maps_url: value };
        const found = parseLatLngFromGoogleMapsText(value);
        if (found && !found.isShortUrl) {
          next.latitude = String(found.latitude);
          next.longitude = String(found.longitude);
        } else if (found?.isShortUrl || (value && !found)) {
          next.latitude = '';
          next.longitude = '';
        }
        return next;
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddOrderToList = (e) => {
    e.preventDefault();
    if (!formData.customer_name || !formData.delivery_address) {
      setError('Name and Address are required.');
      return;
    }

    setPendingOrders(prev => [...prev, { ...formData }]);
    setFormData({
      customer_name: '',
      customer_phone: '',
      delivery_address: '',
      city: '',
      google_maps_url: '',
      latitude: '',
      longitude: '',
    });
    setError(null);
    setUploadResult(null);
  };

  const handleRemoveOrder = (index) => {
    setPendingOrders(prev => prev.filter((_, i) => i !== index));
  };

  const handleFinalizeOrders = async () => {
    if (pendingOrders.length === 0) return;
    
    setIsProcessing(true);
    setError(null);
    setUploadResult(null);

    try {
      const rawText = pendingOrders.map((order, index) => `Order ${index + 1}:
Name: ${order.customer_name}
Phone: ${order.customer_phone}
Address: ${order.delivery_address}
City: ${order.city}
${order.latitude && order.longitude ? `Coordinates: ${order.latitude}, ${order.longitude}` : ''}
${order.google_maps_url ? `Link: ${order.google_maps_url}` : ''}`).join('\n\n');

      const blob = new Blob([rawText], { type: 'text/plain' });
      const dataForm = new FormData();
      dataForm.append('file', blob, 'manual_orders.txt');

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/orders/upload-document`, {
        method: 'POST',
        body: dataForm,
      });

      const data = await response.json();

      if (data.success) {
        setUploadResult({
          success: true,
          message: `Successfully added ${pendingOrders.length} order${pendingOrders.length > 1 ? 's' : ''}!`,
        });

        if (onOrdersUploaded && data.orders) {
          onOrdersUploaded(data.orders);
        }

        setPendingOrders([]); // Clear pending orders after successful upload
      } else {
        setError(data.message || 'Failed to add orders');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to add orders. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="glass-card min-w-0 overflow-hidden rounded-2xl">
      <div className="border-b border-white/5 px-4 py-3 sm:px-5 sm:py-3.5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#F59E0B]/80">Manual Entry</p>
        <h3 className="text-sm font-semibold text-white sm:text-base">Add Single Order</h3>
        <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
          Enter order details below. We'll automatically fetch the exact coordinates if you provide a Maps link.
        </p>
      </div>

      <form onSubmit={handleAddOrderToList} className="p-4 sm:p-5 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-400">Customer Name *</label>
            <input
              type="text"
              name="customer_name"
              value={formData.customer_name}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-[#F59E0B]/40 focus:outline-none focus:ring-1 focus:ring-[#F59E0B]/40"
              placeholder="e.g. John Doe"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-400">Phone Number</label>
            <input
              type="tel"
              name="customer_phone"
              value={formData.customer_phone}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-[#F59E0B]/40 focus:outline-none focus:ring-1 focus:ring-[#F59E0B]/40"
              placeholder="e.g. 0300-1234567"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-400">Delivery Address *</label>
          <input
            type="text"
            name="delivery_address"
            value={formData.delivery_address}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-[#F59E0B]/40 focus:outline-none focus:ring-1 focus:ring-[#F59E0B]/40"
            placeholder="e.g. F-7 Markaz, Jinnah Super"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-400">City / Area</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-[#F59E0B]/40 focus:outline-none focus:ring-1 focus:ring-[#F59E0B]/40"
            placeholder="e.g. Islamabad"
          />
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-gray-400">
            <MapPin className="h-3.5 w-3.5 text-[#F59E0B]" />
            Google Maps Link (Optional)
          </label>
          <input
            type="url"
            name="google_maps_url"
            value={formData.google_maps_url}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-[#F59E0B]/40 focus:outline-none focus:ring-1 focus:ring-[#F59E0B]/40"
            placeholder="e.g. https://maps.app.goo.gl/..."
          />
          <div className="mt-1 space-y-1">
            {formData.google_maps_url && parseLatLngFromGoogleMapsText(formData.google_maps_url)?.isShortUrl && (
              <p className="text-[10px] text-amber-300">
                ⚠ This is a short link. Open it in your browser, then copy the full URL from the address bar.
              </p>
            )}
            {formData.google_maps_url && !parseLatLngFromGoogleMapsText(formData.google_maps_url) && !formData.google_maps_url.includes('goo.gl') && (
              <p className="text-[10px] text-amber-300">
                ⚠ No coordinates found in this URL. Make sure it contains /@lat,lng.
              </p>
            )}
            {formData.latitude && formData.longitude && (
              <p className="text-[10px] text-emerald-400 font-mono">
                ✓ Coordinates: {formData.latitude}, {formData.longitude}
              </p>
            )}
            <p className="text-[10px] text-gray-500">Paste a Maps link from WhatsApp to instantly locate the exact pin.</p>
          </div>
        </div>

        <button
          type="submit"
          className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 font-medium text-white transition hover:bg-white/10"
        >
          Add to List
        </button>
      </form>

      {pendingOrders.length > 0 && (
        <div className="border-t border-white/5 bg-white/[0.01] p-4 sm:p-5">
          <h4 className="mb-3 text-sm font-semibold text-white">Pending Orders ({pendingOrders.length})</h4>
          <ul className="mb-4 space-y-2 max-h-48 overflow-y-auto">
            {pendingOrders.map((order, i) => (
              <li key={i} className="flex items-start justify-between rounded-lg border border-white/10 bg-white/[0.02] p-3 text-xs">
                <div className="min-w-0 pr-4">
                  <p className="font-medium text-gray-200 truncate">{order.customer_name}</p>
                  <p className="mt-0.5 text-gray-500 truncate">{order.delivery_address}</p>
                </div>
                <button type="button" onClick={() => handleRemoveOrder(i)} className="text-gray-500 hover:text-red-400">
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={handleFinalizeOrders}
            disabled={isProcessing}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#F59E0B] px-4 font-bold text-black shadow-panel transition duration-150 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Finalize & Submit ${pendingOrders.length} Order${pendingOrders.length > 1 ? 's' : ''}`
            )}
          </button>
        </div>
      )}

      {error && (
        <div className="mx-4 mb-4 flex gap-2 rounded-xl border border-red-500/25 bg-red-500/10 p-3 sm:mx-5">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-red-200">Error</p>
            <p className="text-xs text-red-300/90">{error}</p>
          </div>
          <button type="button" onClick={() => setError(null)} className="shrink-0 text-red-400/80 hover:text-red-300">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {uploadResult?.success && (
        <div className="mx-4 mb-4 flex gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3 sm:mx-5">
          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
          <div className="min-w-0 flex-1 text-xs text-emerald-200/90">
            <p className="font-medium text-emerald-100">{uploadResult.message}</p>
          </div>
          <button type="button" onClick={() => setUploadResult(null)} className="shrink-0 text-emerald-400/80 hover:text-emerald-300">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ManualOrderForm;
