import React, { useState } from 'react';
import { FileText, AlertCircle, CheckCircle, X, Loader, Plus, ChevronDown } from 'lucide-react';

const TextBulkUpload = ({ onOrdersUploaded }) => {
  const [textInput, setTextInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const [previewOrders, setPreviewOrders] = useState([]);

  const sampleText = `Order 1:
Customer: John Smith
Email: john.smith0@email.com
Phone: 01925100000
Address: 13 Ash Grove, Latchford, Warrington WA4 1EF, UK
Postcode: WA4 1EF
City: Latchford
Latitude: 53.3807489
Longitude: -2.5751915
Value: £45.99
Weight: 2.5kg

Order 2:
Customer: Sarah Wilson
Email: sarah.wilson1@email.com
Phone: 01925100001
Address: 13 Myrtle Grove, Latchford, Warrington WA4 1EE, UK
Postcode: WA4 1EE
City: Latchford
Latitude: 53.3811877
Longitude: -2.5748538
Value: £67.80
Weight: 3.2kg

Order 3:
Customer: Mike Johnson
Email: mike.johnson2@email.com
Phone: 01925100002
Address: 32 Park Ave, Warrington WA4 1DZ, UK
Postcode: WA4 1DZ
City: Warrington
Latitude: 53.3806511
Longitude: -2.5763532
Value: £52.30
Weight: 2.8kg`;

  const handlePreview = () => {
    if (!textInput.trim()) {
      setError('Please enter order text');
      return;
    }

    // In the new Magic Input system, we let the backend parse the raw text.
    // We just show a preview that the text is ready.
    setPreviewOrders([{ customer_name: 'Raw Text Block', delivery_address: `${textInput.split('\\n').length} lines of text to be processed` }]);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!textInput.trim()) {
      setError('Please enter order text');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setUploadResult(null);

    try {
      // Create a text file blob
      const blob = new Blob([textInput], { type: 'text/plain' });
      const formData = new FormData();
      formData.append('file', blob, 'paste.txt');

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/orders/upload-document`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setUploadResult({
          success: true,
          message: data.message || 'Text processed successfully!',
          extractedCount: data.orders?.length || 0,
          insertedCount: data.insertedCount || data.orders?.length || 0,
          orders: data.orders || [],
        });

        if (onOrdersUploaded && data.orders) {
          onOrdersUploaded(data.orders);
        }

        setTextInput('');
        setPreviewOrders([]);
      } else {
        setError(data.message || 'Failed to upload orders');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload orders. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const clearResults = () => {
    setUploadResult(null);
    setError(null);
    setPreviewOrders([]);
  };

  const insertSample = () => {
    setTextInput(sampleText);
    setError(null);
    setUploadResult(null);
    setPreviewOrders([]);
  };

  const [focusOnce, setFocusOnce] = useState(false);
  const inputBarCls =
    'w-full min-h-[220px] max-h-[min(60vh,680px)] rounded-2xl border border-white/10 bg-xr-surface px-4 py-3 font-mono text-[13px] leading-relaxed text-gray-200 placeholder-gray-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:ring-offset-0 focus:border-[#F59E0B]/40 resize-y';

  return (
    <div className="glass-card min-w-0 overflow-hidden rounded-2xl">
      <div className="border-b border-white/5 px-4 py-3 sm:px-5 sm:py-3.5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#F59E0B]/80">Text import</p>
        <h3 className="text-sm font-semibold text-white sm:text-base">Bulk text upload</h3>
        <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
          Paste from Word, Excel, or any plain text. Faster than reformatting PDFs.
        </p>
      </div>

      <div className="p-4 sm:p-5">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <label className="text-xs font-medium text-gray-400" htmlFor="order-text-bulk">
            Order text
          </label>
          <button
            type="button"
            onClick={insertSample}
            className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-[#1a2a45] bg-[#0a0e1a] px-2.5 py-1.5 text-xs font-medium text-orange-400/90 transition hover:border-orange-500/30 hover:bg-orange-500/10"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
            Insert sample
          </button>
        </div>

        <textarea
          id="order-text-bulk"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          onFocus={() => { setFocusOnce(true); setTimeout(() => setFocusOnce(false), 900); }}
          placeholder="Paste orders here. Each block should start with Order 1: … and use lines like Customer: … Address: …"
          className={`${inputBarCls} ${focusOnce ? 'animate-glow-once' : ''}`}
          disabled={isProcessing}
        />

        <div className="mt-3 flex flex-col gap-3">
          <div className="flex items-center justify-end">
            <span className="text-[11px] text-gray-500 tabular-nums sm:text-xs">{textInput.length} characters</span>
          </div>
          <button
            type="button"
            onClick={handlePreview}
            disabled={isProcessing || !textInput.trim()}
            className="h-12 w-full rounded-xl bg-[#F59E0B] px-4 text-sm font-bold text-black shadow-panel transition duration-150 hover:scale-[1.01] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Preview orders
          </button>
        </div>
      </div>

      {previewOrders.length > 0 && (
        <div className="mx-4 mb-4 space-y-3 rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 sm:mx-5 sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-semibold text-blue-200">Preview: {previewOrders.length} order{previewOrders.length !== 1 ? 's' : ''}</h4>
            <span className="shrink-0 rounded-md bg-blue-500/20 px-2 py-0.5 text-[10px] font-medium text-blue-300">Ready to upload</span>
          </div>
          <div className="max-h-32 overflow-y-auto rounded-lg border border-white/5 bg-[#0a0e1a] p-2 text-xs text-gray-300 scrollbar-thin">
            {previewOrders.slice(0, 8).map((order, index) => (
              <div key={index} className="border-b border-white/5 py-1.5 last:border-0 last:pb-0">
                <span className="font-medium text-white">{order.customer_name}</span>
                <span className="text-gray-500"> — </span>
                <span className="text-gray-400 line-clamp-1">{order.delivery_address}</span>
                {order.postcode && <span className="ml-1 text-gray-500">({order.postcode})</span>}
                {order.order_value != null && (
                  <span className="ml-1 text-orange-400/90">· £{order.order_value}</span>
                )}
              </div>
            ))}
            {previewOrders.length > 8 && (
              <p className="pt-1 text-[11px] text-gray-500">…and {previewOrders.length - 8} more</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isProcessing}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 transition enabled:hover:from-emerald-500 enabled:hover:to-emerald-400 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {isProcessing ? (
              <>
                <Loader className="h-4 w-4 shrink-0 animate-spin" />
                Uploading…
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 shrink-0" />
                Upload {previewOrders.length} order{previewOrders.length !== 1 ? 's' : ''}
              </>
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
          <button type="button" onClick={clearResults} className="shrink-0 text-red-400/80 hover:text-red-300" aria-label="Dismiss">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {uploadResult?.success && (
        <div className="mx-4 mb-4 flex gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3 sm:mx-5">
          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
          <div className="min-w-0 flex-1 text-xs text-emerald-200/90">
            <p className="font-medium text-emerald-100">{uploadResult.message}</p>
            <p className="mt-1 text-emerald-200/80">
              Processed {uploadResult.extractedCount} · Added {uploadResult.insertedCount}
            </p>
          </div>
          <button type="button" onClick={clearResults} className="shrink-0 text-emerald-400/80 hover:text-emerald-300" aria-label="Dismiss">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <details className="group border-t border-white/5 bg-[#0a0e1a]/50">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-xs font-medium text-gray-400 transition hover:text-gray-300 sm:px-5">
          <span className="inline-flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-500" />
            Format guide
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-gray-500 transition group-open:rotate-180" />
        </summary>
        <div className="space-y-2 px-4 pb-4 text-xs text-gray-500 sm:px-5">
          <p>Our Magic Input system automatically extracts names, phone numbers, and addresses from any text. Just paste raw text!</p>
          <p>You can even just paste a list of <span className="text-gray-400">Google Maps links</span> (even short ones like maps.app.goo.gl) and we will extract the exact coordinates automatically.</p>
          <pre className="mt-2 overflow-x-auto rounded-lg border border-[#1a2a45] bg-[#0a0e1a] p-2.5 font-mono text-[11px] leading-relaxed text-gray-400">
            {`Deliver 2 boxes to Usman Ali at F-7 Markaz
Phone: 0300-1234567

https://maps.app.goo.gl/xxx
Name: Sarah Wilson
`}
          </pre>
        </div>
      </details>
    </div>
  );
};

export default TextBulkUpload;
