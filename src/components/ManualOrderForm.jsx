import React, { useState } from 'react';
import { Loader, CheckCircle, AlertCircle, X, MapPin } from 'lucide-react';

const ManualOrderForm = ({ onOrdersUploaded }) => {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    delivery_address: '',
    city: '',
    google_maps_url: '',
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer_name || !formData.delivery_address) {
      setError('Name and Address are required.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setUploadResult(null);

    try {
      // We can use the upload-document endpoint by generating a text file from the form data
      // Or we can just build the raw text and send it. 
      // The easiest way is to build a string that the Magic Parser understands perfectly.
      const rawText = `Name: ${formData.customer_name}
Phone: ${formData.customer_phone}
Address: ${formData.delivery_address}
City: ${formData.city}
${formData.google_maps_url ? `Link: ${formData.google_maps_url}` : ''}`;

      const blob = new Blob([rawText], { type: 'text/plain' });
      const dataForm = new FormData();
      dataForm.append('file', blob, 'manual_order.txt');

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/orders/upload-document`, {
        method: 'POST',
        body: dataForm,
      });

      const data = await response.json();

      if (data.success) {
        setUploadResult({
          success: true,
          message: 'Order added successfully!',
        });

        if (onOrdersUploaded && data.orders) {
          onOrdersUploaded(data.orders);
        }

        setFormData({
          customer_name: '',
          customer_phone: '',
          delivery_address: '',
          city: '',
          google_maps_url: '',
        });
      } else {
        setError(data.message || 'Failed to add order');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to add order. Please try again.');
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

      <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
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
          <p className="mt-1 text-[10px] text-gray-500">Paste a Maps link from WhatsApp to instantly locate the exact pin.</p>
        </div>

        <button
          type="submit"
          disabled={isProcessing}
          className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#F59E0B] px-4 font-bold text-black shadow-panel transition duration-150 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isProcessing ? (
            <>
              <Loader className="h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            'Add Order'
          )}
        </button>
      </form>

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
