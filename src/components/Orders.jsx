import React, { useState, useEffect, useRef, useCallback } from 'react';
import PDFUpload from './PDFUpload';
import TextBulkUpload from './TextBulkUpload';

const SlideToConfirm = ({ onConfirm, disabled, loading, label = 'Slide to Confirm', loadingLabel = 'Processing...' }) => {
  const trackRef = useRef(null);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const thumbSize = 48;

  const getMaxX = useCallback(() => (trackRef.current ? trackRef.current.offsetWidth - thumbSize - 8 : 200), []);
  const handleStart = useCallback((clientX) => { if (!disabled && !loading && !confirmed) setIsDragging(true); }, [disabled, loading, confirmed]);
  const handleMove = useCallback((clientX) => {
    if (!isDragging || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    setDragX(Math.min(Math.max(0, clientX - rect.left - thumbSize / 2 - 4), getMaxX()));
  }, [isDragging, getMaxX]);
  const handleEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragX / getMaxX() >= 0.85) { setConfirmed(true); setDragX(getMaxX()); onConfirm(); }
    else setDragX(0);
  }, [isDragging, dragX, getMaxX, onConfirm]);

  useEffect(() => { if (!loading) { setConfirmed(false); setDragX(0); } }, [loading]);
  useEffect(() => {
    if (!isDragging) return;
    const mm = e => handleMove(e.clientX), mu = () => handleEnd();
    window.addEventListener('mousemove', mm); window.addEventListener('mouseup', mu);
    return () => { window.removeEventListener('mousemove', mm); window.removeEventListener('mouseup', mu); };
  }, [isDragging, handleMove, handleEnd]);

  return (
    <div ref={trackRef}
      className={`relative h-12 rounded-full overflow-hidden select-none ${disabled || loading ? 'opacity-50' : ''}`}
      style={{ background: 'linear-gradient(135deg, #0f1b2e, #162540)', border: '1px solid rgba(59,130,246,0.25)' }}
      onTouchStart={e => handleStart(e.touches[0].clientX)} onTouchMove={e => { e.preventDefault(); handleMove(e.touches[0].clientX); }} onTouchEnd={handleEnd}
      onMouseDown={e => { e.preventDefault(); handleStart(e.clientX); }}>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-white/70 text-sm font-medium">{loading ? loadingLabel : label}</span>
      </div>
      {!loading && (
        <div className="absolute top-1 left-1 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 cursor-grab z-10"
          style={{ transform: `translateX(${dragX}px)`, transition: isDragging ? 'none' : 'transform 0.3s ease' }}>
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d={confirmed ? 'M5 13l4 4L19 7' : 'M8 5v14l11-7z'} />
          </svg>
        </div>
      )}
      {loading && <div className="absolute inset-0 flex items-center justify-center"><div className="w-5 h-5 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" /></div>}
    </div>
  );
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ordersAPI = {
  getEligibleOrders: async (date) => {
    const r = await fetch(`${API_BASE_URL}/orders/eligible?date=${date}`);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  },
  generateClusters: async (selectedPostcodes, maxZones = 5) => {
    const r = await fetch(`${API_BASE_URL}/orders/generate-clusters`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selected_postcodes: selectedPostcodes, clustering_algorithm: 'kmeans', max_zones: maxZones, date: new Date().toISOString().split('T')[0] })
    });
    if (!r.ok) { const d = await r.json().catch(() => ({})); throw new Error(d.message || `HTTP ${r.status}`); }
    return r.json();
  },
  generateRoutes: async (zones) => {
    const r = await fetch(`${API_BASE_URL}/orders/generate-routes`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ zones, date: new Date().toISOString().split('T')[0] })
    });
    if (!r.ok) { const d = await r.json().catch(() => ({})); throw new Error(d.message || `HTTP ${r.status}`); }
    return r.json();
  },
  getAvailableDrivers: async () => {
    const r = await fetch(`${API_BASE_URL}/orders/available-drivers`);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  },
  autoAssignDrivers: async (routes) => {
    const r = await fetch(`${API_BASE_URL}/orders/auto-assign-drivers`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ routes, method: 'round_robin' })
    });
    if (!r.ok) { const d = await r.json().catch(() => ({})); throw new Error(d.message || `HTTP ${r.status}`); }
    return r.json();
  },
  assignDriver: async (routeId, driverId) => {
    const r = await fetch(`${API_BASE_URL}/orders/assign-driver`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ route_id: routeId, driver_id: driverId })
    });
    if (!r.ok) { const d = await r.json().catch(() => ({})); throw new Error(d.message || `HTTP ${r.status}`); }
    return r.json();
  },
  dispatchRoutes: async (routeIds) => {
    const r = await fetch(`${API_BASE_URL}/orders/dispatch-routes`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ route_ids: routeIds })
    });
    if (!r.ok) { const d = await r.json().catch(() => ({})); throw new Error(d.message || `HTTP ${r.status}`); }
    return r.json();
  },
  resetOrders: async () => {
    const r = await fetch(`${API_BASE_URL}/orders/reset`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' } });
    if (!r.ok) { const d = await r.json().catch(() => ({})); throw new Error(d.message || `HTTP ${r.status}`); }
    return r.json();
  }
};

const ZONE_COLORS = ['#F97316', '#3B82F6', '#10B981', '#8B5CF6', '#EF4444'];
const fmtDur = m => { if (!m) return '0 min'; if (m < 60) return `${Math.round(m)} min`; return `${Math.floor(m/60)}h ${Math.round(m%60)}m`; };

const Card = ({ title, subtitle, right, children, className = '' }) => (
  <section className={`glass-card overflow-hidden rounded-2xl transition duration-150 hover:-translate-y-0.5 ${className}`}>
    {(title || subtitle || right) && (
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-white/5 px-4 py-3 sm:px-5 sm:py-3.5">
        <div className="min-w-0">
          {title && <h3 className="text-sm font-semibold text-white sm:text-base">{title}</h3>}
          {subtitle && <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">{subtitle}</p>}
        </div>
        {right && <div className="shrink-0">{right}</div>}
      </header>
    )}
    <div className="p-4 sm:p-5">{children}</div>
  </section>
);

const SoftButton = ({ tone = 'neutral', className = '', ...props }) => {
  const toneCls =
    tone === 'danger'
      ? 'border-red-500/40 bg-transparent text-red-300 hover:bg-red-500/10'
      : tone === 'primary'
        ? 'border-[#F59E0B]/35 bg-[#F59E0B] text-black hover:brightness-110'
        : tone === 'blue'
          ? 'border-white/10 bg-white/[0.04] text-gray-200 hover:bg-white/[0.07]'
          : 'border-white/10 bg-white/[0.02] text-gray-200 hover:bg-white/[0.05]';
  return (
    <button
      type="button"
      {...props}
      className={`rounded-2xl border px-3.5 py-2.5 text-xs font-semibold transition-all duration-150 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm ${toneCls} ${className}`}
    />
  );
};

// Horizontal workflow strip — compact so Upload / Filter / Review / Confirm stay one row
const WorkflowStepperH = ({ steps, active, onChange }) => {
  const pct = steps.length > 1 ? (active / (steps.length - 1)) * 100 : 0;
  return (
    <div className="glass-card rounded-2xl p-3 sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-500">Workflow</p>
        <p className="text-[10px] text-gray-600">
          Step {active + 1} of {steps.length}
        </p>
      </div>

      <div className="relative mt-3">
        <div aria-hidden className="absolute left-0 right-0 top-[16px] h-px bg-white/10 sm:top-[18px]" />
        <div
          aria-hidden
          className="absolute left-0 top-[16px] h-px bg-[#F59E0B]/70 transition-all duration-300 sm:top-[18px]"
          style={{ width: `${pct}%` }}
        />

        <ol className="relative grid grid-cols-4 gap-0.5 sm:gap-2" role="tablist" aria-label="Order workflow">
          {steps.map((s, idx) => {
            const isActive = s.id === active;
            const isComplete = s.id < active;
            return (
              <li key={s.id} className="min-w-0">
                <button
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => onChange(s.id)}
                  className="group w-full"
                >
                  <div className="mx-auto flex w-full max-w-[140px] flex-col items-center text-center sm:max-w-[200px]">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full border text-[10px] font-bold transition sm:h-9 sm:w-9 sm:text-xs ${
                        isComplete
                          ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-200'
                          : isActive
                            ? 'border-[#F59E0B]/40 bg-[#F59E0B] text-black shadow-panel'
                            : 'border-white/10 bg-white/[0.04] text-gray-500'
                      }`}
                    >
                      {isComplete ? '✓' : idx + 1}
                    </div>
                    <p className={`mt-1.5 truncate text-[10px] font-semibold sm:mt-2 sm:text-xs ${isActive ? 'text-white' : 'text-gray-300'}`}>
                      {s.label}
                    </p>
                    <p className="mt-0.5 hidden text-[9px] text-gray-600 sm:block">
                      {s.id === 0 && 'Import'}
                      {s.id === 1 && 'Cluster'}
                      {s.id === 2 && 'Assign'}
                      {s.id === 3 && 'Dispatch'}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
};

const Metric = ({ label, value, tone = 'default' }) => {
  const toneCls =
    tone === 'blue' ? 'text-blue-400' :
      tone === 'green' ? 'text-emerald-400' :
        tone === 'purple' ? 'text-purple-400' :
          tone === 'orange' ? 'text-orange-400' : 'text-white';
  return (
    <div className="rounded-2xl border border-[#1a2a45] bg-[#0a0e1a]/80 p-4 ring-1 ring-inset ring-white/5">
      <p className="text-[10px] font-medium uppercase tracking-wider text-gray-600">{label}</p>
      <p className={`mt-1.5 text-2xl font-bold tabular-nums ${toneCls}`}>{value}</p>
    </div>
  );
};

const Orders = ({ onNavigateBack, onNavigateToRouteDetail }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [uploadMethod, setUploadMethod] = useState('text');
  const [excelFile, setExcelFile] = useState(null);
  const [excelUploading, setExcelUploading] = useState(false);
  const [excelResult, setExcelResult] = useState(null);
  const [postcodeQuery, setPostcodeQuery] = useState('');
  const [maxZones, setMaxZones] = useState(5);
  const [selectedPostcodes, setSelectedPostcodes] = useState([]);
  const [availablePostcodes, setAvailablePostcodes] = useState([]);
  const [eligibleOrders, setEligibleOrders] = useState([]);
  const [previewZones, setPreviewZones] = useState([]);
  const [generatedRoutes, setGeneratedRoutes] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [demoSet, setDemoSet] = useState(null);

  useEffect(() => { loadInitialData(); }, []);

  const loadInitialData = async () => {
    setLoading(true); setError('');
    try {
      const od = await ordersAPI.getEligibleOrders(new Date().toISOString().split('T')[0]);
      if (od.success) { setEligibleOrders(od.orders); setAvailablePostcodes(od.postcode_options); }
      else throw new Error(od.message || 'Failed');
      const dd = await ordersAPI.getAvailableDrivers();
      if (dd.success) setAvailableDrivers(dd.drivers);
    } catch (e) { setError(`Failed to load: ${e.message}`); }
    finally { setLoading(false); }
  };

  const handleOrdersUploaded = async (newOrders) => {
    setSuccess(`Uploaded ${newOrders.length} orders`);
    await loadInitialData();
    setActiveTab(1);
  };

  useEffect(() => { if (error || success) { const t = setTimeout(() => { setError(''); setSuccess(''); }, 6000); return () => clearTimeout(t); } }, [error, success]);

  const handlePostcodeToggle = (pc) => setSelectedPostcodes(prev => prev.includes(pc) ? prev.filter(p => p !== pc) : [...prev, pc]);

  const previewClustering = async () => {
    if (!selectedPostcodes.length) { setError('Select at least one postcode'); return; }
    setLoading(true); setError('');
    try {
      const r = await ordersAPI.generateClusters(selectedPostcodes, maxZones);
      if (r.success) { setPreviewZones(r.zones); setSuccess(`${r.zones.length} zones from ${r.total_orders} orders`); }
      else throw new Error(r.message);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const generateRoutesFromZones = async () => {
    if (!previewZones.length) { setError('Generate clusters first'); return; }
    setLoading(true); setError('');
    try {
      const r = await ordersAPI.generateRoutes(previewZones);
      if (r.success) { setGeneratedRoutes(r.routes); setSuccess(`${r.routes.length} routes generated`); setActiveTab(2); }
      else throw new Error(r.message);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const assignDriverToRoute = async (routeId, driverId) => {
    if (!driverId) return;
    setLoading(true); setError('');
    try {
      const r = await ordersAPI.assignDriver(routeId, driverId);
      if (r.success) {
        setGeneratedRoutes(prev => prev.map(rt => rt.route_id === routeId ? { ...rt, driver_id: driverId, driver_name: r.driver.name, status: 'assigned' } : rt));
        setSuccess('Driver assigned');
      } else throw new Error(r.message);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const autoAssignAllDrivers = async () => {
    if (!generatedRoutes.length) return;
    setLoading(true); setError('');
    try {
      const r = await ordersAPI.autoAssignDrivers(generatedRoutes);
      if (r.success) { setGeneratedRoutes(r.routes); setSuccess('Drivers auto-assigned'); }
      else throw new Error(r.message);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const confirmRoutes = () => {
    const un = generatedRoutes.filter(r => !r.driver_id);
    if (un.length) { setError(`${un.length} routes need drivers`); return; }
    setActiveTab(3); setSuccess('Routes confirmed');
  };

  const dispatchAllRoutes = async () => {
    const ids = generatedRoutes.map(r => r.route_id);
    if (!ids.length) return;
    setLoading(true); setError('');
    try {
      const r = await ordersAPI.dispatchRoutes(ids);
      if (r.success) {
        setGeneratedRoutes(prev => prev.map(rt => ({ ...rt, status: 'dispatched', dispatched_at: new Date().toISOString() })));
        setSuccess(`${ids.length} routes dispatched!`);
      } else throw new Error(r.message);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handleResetOrders = async () => {
    setResetting(true); setError('');
    try {
      const r = await ordersAPI.resetOrders();
      if (r.success) { setSuccess(`Reset ${r.deletedCount} orders`); await loadInitialData(); setShowResetConfirm(false); }
      else throw new Error(r.message);
    } catch (e) { setError(e.message); }
    finally { setResetting(false); }
  };

  const tabs = [
    { id: 0, label: 'Upload' },
    { id: 1, label: 'Filter' },
    { id: 2, label: 'Review' },
    { id: 3, label: 'Confirm' },
  ];

  const canProceedToFilter = eligibleOrders.length > 0;
  const canProceedToReview = previewZones.length > 0;
  const canProceedToConfirm = generatedRoutes.length > 0 && generatedRoutes.every(r => r.driver_id);
  const dispatchedCount = generatedRoutes.filter(r => r.status === 'dispatched').length;
  const activeTabMeta = tabs.find(t => t.id === activeTab) || tabs[0];

  const filteredPostcodes = availablePostcodes
    .filter(pc => (postcodeQuery ? pc.toLowerCase().includes(postcodeQuery.toLowerCase()) : true))
    .slice(0, 200);

  const selectedRoute = selectedRouteId ? generatedRoutes.find(r => r.route_id === selectedRouteId) : null;

  const goNext = () => {
    if (activeTab === 0 && canProceedToFilter) setActiveTab(1);
    else if (activeTab === 1 && canProceedToReview) setActiveTab(2);
    else if (activeTab === 2 && canProceedToConfirm) setActiveTab(3);
  };
  const goBack = () => setActiveTab(t => Math.max(0, t - 1));
  return (
    <div className="min-h-screen pb-32 sm:pb-36 md:pb-40 [padding-bottom:max(7.5rem,env(safe-area-inset-bottom,0px)+5rem)]">
      <div className="sticky top-0 z-20 border-b border-white/10 bg-xr-bg/95 shadow-[0_1px_0_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <div className="mx-auto max-w-[1600px] px-4 py-3 sm:px-6 md:px-8 md:py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-gray-500">XRUTO · ROUTE BUILDER</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">Orders</h1>
              <p className="mt-1 text-xs text-gray-500 sm:text-sm">Import, cluster, assign, and dispatch — in one guided flow.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#F59E0B]/25 bg-[#F59E0B]/10 px-3 py-1.5 text-[11px] font-medium text-amber-200 shadow-[0_0_0_1px_rgba(245,158,11,0.06)] sm:text-xs">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[#F59E0B] opacity-30 animate-dot-pulse" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#F59E0B]" />
                </span>
                {eligibleOrders.length} eligible order{eligibleOrders.length !== 1 ? 's' : ''} today
              </span>
              <SoftButton tone="danger" onClick={() => setShowResetConfirm(true)} disabled={resetting || loading}>
                Reset data
              </SoftButton>
            </div>
          </div>
          {/* Mobile stepper */}
          <ol className="mt-4 flex w-full list-none items-center gap-0 overflow-hidden rounded-xl border border-[#1a2a45] bg-[#111b2e] p-1 sm:mt-5 md:hidden" role="list">
            {tabs.map((tab, i) => {
              const current = activeTab === tab.id;
              const complete = activeTab > tab.id;
              return (
                <li key={tab.id} className="flex min-w-0 flex-1 items-stretch">
                  <button
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex w-full flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-2 text-center transition sm:px-2 sm:py-2.5 ${
                      current
                        ? 'bg-orange-500 text-white shadow-sm shadow-black/20'
                        : complete
                          ? 'text-gray-300 hover:bg-white/[0.04]'
                          : 'text-gray-500 hover:bg-white/[0.04] hover:text-gray-300'
                    }`}
                    aria-current={current ? 'step' : undefined}
                  >
                    <span className="text-[9px] font-medium uppercase tracking-wide text-white/80 sm:text-[10px]">Step {i + 1}</span>
                    <span className="truncate text-xs font-semibold sm:text-sm">{tab.label}</span>
                  </button>
                  {i < tabs.length - 1 && (
                    <div className="hidden w-px shrink-0 self-stretch bg-[#1a2a45] sm:block" aria-hidden />
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <div className="px-4 md:px-6 lg:px-8 pt-3 max-w-[1600px] mx-auto">
        {error && <div className="mb-3 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-xs">{error}</div>}
        {success && <div className="mb-3 bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-green-400 text-xs">{success}</div>}
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#111b2e] border border-[#1a2a45] p-6 rounded-2xl flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
            <span className="text-sm text-white">Processing...</span>
          </div>
        </div>
      )}

      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6">
          <div className="bg-[#111b2e] border border-[#1a2a45] rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-white font-semibold mb-2">Reset All Orders?</h3>
            <p className="text-xs text-gray-500 mb-4">This will permanently delete all orders. This cannot be undone.</p>
            <div className="flex gap-2">
              <button onClick={() => setShowResetConfirm(false)} className="flex-1 py-2.5 bg-[#0a0e1a] border border-[#1a2a45] rounded-xl text-sm text-gray-400">Cancel</button>
              <button onClick={handleResetOrders} disabled={resetting} className="flex-1 py-2.5 bg-red-500 rounded-xl text-sm text-white disabled:opacity-50">
                {resetting ? 'Resetting...' : 'Reset'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 md:px-6 lg:px-8 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 gap-4 md:gap-5 md:pt-1">
          <main className="space-y-4 lg:col-span-12">
        {activeTab === 0 && (
          <div className="space-y-5">
            <div className="animate-fade-up">
              <WorkflowStepperH steps={tabs} active={activeTab} onChange={setActiveTab} />
            </div>
            <Card title="Progress" subtitle="Today's snapshot" className="animate-fade-up">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Metric label="Orders" value={eligibleOrders.length} tone="blue" />
                <Metric label="Zones" value={previewZones.length} tone="green" />
                <Metric label="Routes" value={generatedRoutes.length} tone="purple" />
                <Metric label="Dispatched" value={dispatchedCount} tone="orange" />
              </div>
            </Card>

            <div className="flex flex-col gap-6">
            <Card
                title="Import source"
                subtitle="Choose text, PDF, or Excel. Drag & drop supported."
                right={<span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-gray-500">UPLOAD</span>}
                className="animate-fade-up"
              >
                {/* Segmented control */}
                <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-1">
                  <div
                    aria-hidden
                    className="absolute top-1 bottom-1 w-1/3 rounded-xl bg-[#F59E0B] transition-all duration-150"
                    style={{
                      left: uploadMethod === 'text' ? '4px' : uploadMethod === 'pdf' ? 'calc(33.333% + 2px)' : 'calc(66.666% + 0px)',
                    }}
                  />
                  <div className="relative grid grid-cols-3 gap-1">
                    {[
                      { id: 'text', label: 'Text', icon: 'Aa' },
                      { id: 'pdf', label: 'PDF', icon: 'PDF' },
                      { id: 'excel', label: 'Excel', icon: 'XLS' },
                    ].map(m => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setUploadMethod(m.id)}
                        className={`h-11 rounded-xl px-3 text-xs font-semibold transition-all duration-150 ${
                          uploadMethod === m.id ? 'text-black' : 'text-gray-300 hover:text-white'
                        }`}
                      >
                        <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-lg bg-black/10 text-[11px] font-bold">
                          {m.icon}
                        </span>
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-xs text-gray-500 transition duration-150 hover:border-[#F59E0B]/25 hover:bg-[#F59E0B]/[0.06]">
                  Drop files here (PDF/Excel), then use the import panel below for your selected format.
                </div>
            </Card>

            <div className="min-w-0 space-y-4 animate-fade-up">
              {uploadMethod === 'text' && <TextBulkUpload onOrdersUploaded={handleOrdersUploaded} />}
              {uploadMethod === 'pdf' && <PDFUpload onOrdersUploaded={handleOrdersUploaded} />}
              {uploadMethod === 'excel' && (
                <Card title="Excel upload" subtitle=".xlsx / .xls — Order ID, Customer Name, Address, Lat, Lon, Meal Qty">
                  <label className="block w-full cursor-pointer rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center transition duration-150 hover:border-[#F59E0B]/30 hover:bg-[#F59E0B]/[0.06]">
                    <span className="text-sm text-gray-300">{excelFile ? excelFile.name : 'Choose Excel file'}</span>
                    <input type="file" accept=".xlsx,.xls" className="hidden" onChange={e => { setExcelFile(e.target.files[0] || null); setExcelResult(null); }} />
                  </label>
                  {excelFile && (
                    <div className="mt-4">
                      <SlideToConfirm label="Slide to upload" loadingLabel="Uploading..." loading={excelUploading} onConfirm={async () => {
                        setExcelUploading(true); setExcelResult(null);
                        try {
                          const form = new FormData(); form.append('excelFile', excelFile);
                          const res = await fetch(`${API_BASE_URL}/orders/upload-excel`, { method: 'POST', body: form });
                          const data = await res.json();
                          if (data.success) { setExcelResult({ ok: true, msg: data.message }); setExcelFile(null); if (handleOrdersUploaded) handleOrdersUploaded(data.orders); }
                          else setExcelResult({ ok: false, msg: data.message });
                        } catch (e) { setExcelResult({ ok: false, msg: e.message }); }
                        setExcelUploading(false);
                      }} />
                    </div>
                  )}
                  {excelResult && <div className={`mt-3 rounded-2xl border p-3 text-xs ${excelResult.ok ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200' : 'border-red-500/20 bg-red-500/10 text-red-200'}`}>{excelResult.msg}</div>}
                </Card>
              )}
            </div>

            <Card
              title="Quick demo"
              subtitle="Load a dataset to explore clustering and routes."
              className="relative animate-fade-up"
            >
              <div className="mb-3 rounded-xl border-l-4 border-[#F59E0B] bg-[#F59E0B]/[0.08] px-3 py-2 text-xs text-amber-200/90">
                ⚡ Great for showcasing the product — no PDF needed.
              </div>
              <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {[
                  { id:'london', label:'London', flag:'🇬🇧', count:10, desc:'Central London deliveries' },
                  { id:'pakistan', label:'Pakistan', flag:'🇵🇰', count:10, desc:'Lahore, Karachi, Islamabad' },
                  { id:'uae', label:'UAE', flag:'🇦🇪', count:5, desc:'Dubai & Abu Dhabi' },
                  { id:'usa', label:'USA', flag:'🇺🇸', count:5, desc:'New York City metro' },
                ].map(d => (
                  <button key={d.id} type="button" onClick={() => setDemoSet(d.id)}
                    className={`p-3 rounded-xl text-center transition border ${demoSet === d.id ? 'bg-orange-500/20 border-orange-500 text-white' : 'bg-[#0a0e1a] border-[#1a2a45] text-gray-400 hover:border-orange-500/30'}`}>
                    <div className="text-xl mb-1">{d.flag}</div>
                    <div className="text-xs font-semibold">{d.label}</div>
                    <div className="text-[10px] text-gray-500">{d.count} orders</div>
                  </button>
                ))}
              </div>
              <button onClick={async () => {
                const today = new Date().toISOString().split('T')[0];
                const DEMO_DATA = {
                  london: [
                    { customer_name:'James Wilson', delivery_address:'12 Baker Street, Marylebone', postcode:'W1U 3BW', city:'London', latitude:51.5237, longitude:-0.1585, order_value:34.50, weight:2.1, delivery_date:today },
                    { customer_name:'Sarah Mitchell', delivery_address:'88 Commercial Road, Whitechapel', postcode:'E1 1NH', city:'London', latitude:51.5145, longitude:-0.0594, order_value:27.80, weight:1.5, delivery_date:today },
                    { customer_name:'Oliver Brown', delivery_address:'5 Greenwich High Road', postcode:'SE10 8JL', city:'London', latitude:51.4769, longitude:-0.0005, order_value:42.00, weight:3.2, delivery_date:today },
                    { customer_name:'Emily Clark', delivery_address:'33 Brixton Road, Lambeth', postcode:'SW9 6DE', city:'London', latitude:51.4613, longitude:-0.1156, order_value:19.90, weight:0.8, delivery_date:today },
                    { customer_name:'Daniel Taylor', delivery_address:'71 Camden High Street', postcode:'NW1 7JL', city:'London', latitude:51.5392, longitude:-0.1426, order_value:55.20, weight:4.0, delivery_date:today },
                    { customer_name:'Charlotte Evans', delivery_address:'14 Kensington Church St', postcode:'W8 4EP', city:'London', latitude:51.5015, longitude:-0.1928, order_value:31.40, weight:1.9, delivery_date:today },
                    { customer_name:'Liam Hughes', delivery_address:'29 Peckham Rye', postcode:'SE15 3NX', city:'London', latitude:51.4683, longitude:-0.0665, order_value:23.60, weight:2.4, delivery_date:today },
                    { customer_name:'Amelia Roberts', delivery_address:'52 Holloway Road, Islington', postcode:'N7 8JL', city:'London', latitude:51.5518, longitude:-0.1162, order_value:38.75, weight:2.8, delivery_date:today },
                    { customer_name:'Harry Walker', delivery_address:'8 Lewisham High Street', postcode:'SE13 5JR', city:'London', latitude:51.4535, longitude:-0.0120, order_value:15.50, weight:0.6, delivery_date:today },
                    { customer_name:'Sophia Green', delivery_address:'45 Stratford Broadway', postcode:'E15 4BQ', city:'London', latitude:51.5414, longitude:0.0031, order_value:47.30, weight:3.5, delivery_date:today },
                  ],
                  pakistan: [
                    { customer_name:'Ahmed Raza', delivery_address:'Block 5, Gulberg III', postcode:'54660', city:'Lahore', latitude:31.5204, longitude:74.3587, order_value:2500, weight:1.8, delivery_date:today },
                    { customer_name:'Fatima Khan', delivery_address:'DHA Phase 6, Bukhari Commercial', postcode:'75500', city:'Karachi', latitude:24.8049, longitude:67.0654, order_value:1800, weight:1.2, delivery_date:today },
                    { customer_name:'Usman Ali', delivery_address:'F-7 Markaz, Jinnah Super', postcode:'44000', city:'Islamabad', latitude:33.7215, longitude:73.0433, order_value:3200, weight:2.5, delivery_date:today },
                    { customer_name:'Ayesha Malik', delivery_address:'Johar Town, Block J2', postcode:'54782', city:'Lahore', latitude:31.4697, longitude:74.2728, order_value:1500, weight:0.9, delivery_date:today },
                    { customer_name:'Hassan Iqbal', delivery_address:'Clifton Block 9', postcode:'75600', city:'Karachi', latitude:24.8138, longitude:67.0300, order_value:4100, weight:3.0, delivery_date:today },
                    { customer_name:'Zainab Noor', delivery_address:'Blue Area, Fazal-ul-Haq Road', postcode:'44000', city:'Islamabad', latitude:33.7104, longitude:73.0558, order_value:2750, weight:2.2, delivery_date:today },
                    { customer_name:'Bilal Tariq', delivery_address:'Model Town Extension', postcode:'54700', city:'Lahore', latitude:31.4836, longitude:74.3193, order_value:1950, weight:1.4, delivery_date:today },
                    { customer_name:'Sana Javed', delivery_address:'North Nazimabad, Block H', postcode:'74700', city:'Karachi', latitude:24.9420, longitude:67.0319, order_value:3600, weight:2.8, delivery_date:today },
                    { customer_name:'Imran Sheikh', delivery_address:'G-9 Markaz', postcode:'44090', city:'Islamabad', latitude:33.6938, longitude:73.0300, order_value:2200, weight:1.6, delivery_date:today },
                    { customer_name:'Maryam Aslam', delivery_address:'Bahria Town Phase 4', postcode:'54810', city:'Lahore', latitude:31.3640, longitude:74.1855, order_value:2900, weight:2.0, delivery_date:today },
                  ],
                  uae: [
                    { customer_name:'Mohammed Al-Rashid', delivery_address:'Sheikh Zayed Road, Tower 1', postcode:'00000', city:'Dubai', latitude:25.2048, longitude:55.2708, order_value:185, weight:1.5, delivery_date:today },
                    { customer_name:'Sara Al-Maktoum', delivery_address:'Marina Walk, JBR', postcode:'00000', city:'Dubai', latitude:25.0800, longitude:55.1400, order_value:220, weight:2.3, delivery_date:today },
                    { customer_name:'Khalid Hassan', delivery_address:'Corniche Road, Al Markaziyah', postcode:'00000', city:'Abu Dhabi', latitude:24.4539, longitude:54.3773, order_value:310, weight:3.1, delivery_date:today },
                    { customer_name:'Layla Ibrahim', delivery_address:'Downtown Dubai, Burj Khalifa Blvd', postcode:'00000', city:'Dubai', latitude:25.1972, longitude:55.2744, order_value:145, weight:0.8, delivery_date:today },
                    { customer_name:'Omar Farooq', delivery_address:'Al Reem Island, Sun Tower', postcode:'00000', city:'Abu Dhabi', latitude:24.4979, longitude:54.4070, order_value:275, weight:2.6, delivery_date:today },
                  ],
                  usa: [
                    { customer_name:'Michael Johnson', delivery_address:'350 5th Avenue, Midtown', postcode:'10118', city:'New York', latitude:40.7484, longitude:-73.9857, order_value:52.00, weight:2.0, delivery_date:today },
                    { customer_name:'Jennifer Smith', delivery_address:'200 Broadway, Financial District', postcode:'10038', city:'New York', latitude:40.7104, longitude:-74.0091, order_value:38.50, weight:1.5, delivery_date:today },
                    { customer_name:'David Williams', delivery_address:'1000 5th Ave, Upper East Side', postcode:'10028', city:'New York', latitude:40.7794, longitude:-73.9632, order_value:67.80, weight:3.2, delivery_date:today },
                    { customer_name:'Jessica Brown', delivery_address:'85-01 Queens Blvd, Elmhurst', postcode:'11373', city:'New York', latitude:40.7360, longitude:-73.8783, order_value:29.90, weight:1.1, delivery_date:today },
                    { customer_name:'Robert Davis', delivery_address:'620 Atlantic Ave, Brooklyn', postcode:'11217', city:'New York', latitude:40.6845, longitude:-73.9780, order_value:44.20, weight:2.4, delivery_date:today },
                  ],
                };
                const orders = DEMO_DATA[demoSet];
                if (!orders) { setError('Select a demo set first'); return; }
                setLoading(true); setError('');
                try {
                  const r = await fetch(`${API_BASE_URL}/orders/upload-text`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ orders }) });
                  const data = await r.json();
                  if (data.success) handleOrdersUploaded(data.orders);
                  else throw new Error(data.message || 'Upload failed');
                } catch (e) { setError(e.message); }
                finally { setLoading(false); }
              }} disabled={loading || !demoSet}
                className="w-full py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 active:scale-[0.98] transition disabled:opacity-50">
                {demoSet ? `Load ${demoSet.charAt(0).toUpperCase() + demoSet.slice(1)} Demo Orders` : 'Select a Demo Set Above'}
              </button>
            </Card>

            </div>
          </div>
        )}

        {activeTab === 1 && (
          <div className="space-y-5">
            <div className="animate-fade-up">
              <WorkflowStepperH steps={tabs} active={activeTab} onChange={setActiveTab} />
            </div>
            <Card title="Progress" subtitle="Today's snapshot" className="animate-fade-up">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Metric label="Orders" value={eligibleOrders.length} tone="blue" />
                <Metric label="Zones" value={previewZones.length} tone="green" />
                <Metric label="Routes" value={generatedRoutes.length} tone="purple" />
                <Metric label="Dispatched" value={dispatchedCount} tone="orange" />
              </div>
            </Card>
            <div className="flex flex-col gap-6">
              <Card
                title="Delivery areas"
                subtitle="Select postcode groups for clustering."
                right={(
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-orange-300">{selectedPostcodes.length} selected</span>
                    {availablePostcodes.length > 0 && (
                      <SoftButton
                        tone="neutral"
                        onClick={() => setSelectedPostcodes(selectedPostcodes.length === availablePostcodes.length ? [] : [...availablePostcodes])}
                      >
                        {selectedPostcodes.length === availablePostcodes.length ? 'Clear' : 'Select all'}
                      </SoftButton>
                    )}
                  </div>
                )}
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-[#1a2a45] bg-[#0a0e1a] px-3 py-2.5">
                    <label className="block text-[10px] font-medium uppercase tracking-wider text-gray-600">Search</label>
                    <input
                      value={postcodeQuery}
                      onChange={(e) => setPostcodeQuery(e.target.value)}
                      placeholder="Type a postcode prefix…"
                      className="mt-1 w-full bg-transparent text-sm text-gray-200 placeholder-gray-600 focus:outline-none"
                    />
                  </div>
                  <div className="rounded-xl border border-[#1a2a45] bg-[#0a0e1a] px-3 py-2.5">
                    <label className="block text-[10px] font-medium uppercase tracking-wider text-gray-600">Max zones</label>
                    <div className="mt-2 flex items-center gap-3">
                      <input
                        type="range"
                        min={2}
                        max={10}
                        value={maxZones}
                        onChange={(e) => setMaxZones(parseInt(e.target.value, 10))}
                        className="h-2 w-full accent-orange-500"
                      />
                      <span className="w-10 text-right text-sm font-semibold tabular-nums text-white">{maxZones}</span>
                    </div>
                  </div>
                </div>

                {availablePostcodes.length === 0 ? (
                  <div className="mt-4 rounded-xl border border-white/5 bg-[#0a0e1a]/60 p-4 text-center text-xs text-gray-500">
                    No postcode areas found. Upload orders first.
                  </div>
                ) : (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {filteredPostcodes.map(pc => {
                      const sel = selectedPostcodes.includes(pc);
                      const cnt = eligibleOrders.filter(o => o.postcode?.startsWith(pc)).length;
                      return (
                        <button
                          key={pc}
                          type="button"
                          onClick={() => handlePostcodeToggle(pc)}
                          className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                            sel
                              ? 'border-orange-500/40 bg-orange-500/15 text-white'
                              : 'border-[#1a2a45] bg-[#0a0e1a] text-gray-400 hover:border-orange-500/25 hover:text-gray-200'
                          }`}
                        >
                          {pc} <span className="ml-1 text-[11px] opacity-70">({cnt})</span>
                        </button>
                      );
                    })}
                    {filteredPostcodes.length === 0 && (
                      <span className="text-xs text-gray-500">No matches.</span>
                    )}
                  </div>
                )}
              </Card>

              {previewZones.length > 0 && (
                <Card title="Cluster preview" subtitle="Review zones before generating routes.">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {previewZones.map((zone, i) => (
                      <div key={zone.zone_id} className="rounded-xl border border-[#1a2a45] bg-[#0a0e1a] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-2">
                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: zone.color_hex || ZONE_COLORS[i % 5] }} />
                            <span className="truncate text-sm font-semibold text-white">{zone.zone_name}</span>
                          </div>
                          <span className="shrink-0 rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-gray-400">
                            {zone.total_orders} orders
                          </span>
                        </div>
                        <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-gray-500">
                          <span>{zone.route_distance_km?.toFixed(1) || '?'} km</span>
                          <span>{fmtDur(zone.estimated_duration)}</span>
                          <span>{zone.depot_returns_needed || 0} returns</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              <Card title="Actions" subtitle="Generate zones and routes">
                <div className="space-y-3">
                  <div className="rounded-xl border border-white/5 bg-[#0a0e1a]/60 p-3 text-xs text-gray-500">
                    Select at least one area, then generate clusters. You can adjust max zones any time.
                  </div>
                  <SlideToConfirm
                    onConfirm={previewClustering}
                    disabled={!selectedPostcodes.length}
                    loading={loading}
                    label="Slide to generate clusters"
                    loadingLabel="Clustering…"
                  />
                  <div className="pt-1">
                    <SlideToConfirm
                      onConfirm={generateRoutesFromZones}
                      disabled={!previewZones.length}
                      loading={loading}
                      label="Slide to generate routes"
                      loadingLabel="Optimizing…"
                    />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 2 && (
          <div className="space-y-5">
            <div className="animate-fade-up">
              <WorkflowStepperH steps={tabs} active={activeTab} onChange={setActiveTab} />
            </div>
            <Card title="Progress" subtitle="Today's snapshot" className="animate-fade-up">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Metric label="Orders" value={eligibleOrders.length} tone="blue" />
                <Metric label="Zones" value={previewZones.length} tone="green" />
                <Metric label="Routes" value={generatedRoutes.length} tone="purple" />
                <Metric label="Dispatched" value={dispatchedCount} tone="orange" />
              </div>
            </Card>
            <div className="flex flex-col gap-6">
              <Card
                title="Route review"
                subtitle="Assign drivers and confirm."
                right={(
                  <div className="flex flex-wrap items-center gap-2">
                    <SoftButton onClick={autoAssignAllDrivers} disabled={loading || !availableDrivers.length} tone="primary">
                      Auto-assign
                    </SoftButton>
                    <SoftButton onClick={confirmRoutes} disabled={loading || generatedRoutes.some(r => !r.driver_id)} tone="blue">
                      Confirm
                    </SoftButton>
                  </div>
                )}
              >
                {generatedRoutes.length === 0 ? (
                  <div className="rounded-xl border border-white/5 bg-[#0a0e1a]/60 p-4 text-center text-sm text-gray-500">
                    No routes yet. Generate routes from the Filter step.
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {generatedRoutes.map((route, i) => {
                      const isSelected = selectedRouteId === route.route_id;
                      return (
                        <button
                          key={route.route_id}
                          type="button"
                          onClick={() => setSelectedRouteId(route.route_id)}
                          className={`text-left rounded-2xl border p-4 transition ${
                            isSelected ? 'border-orange-500/40 bg-orange-500/10' : 'border-[#1a2a45] bg-[#0a0e1a] hover:border-white/10'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: route.zone_color || ZONE_COLORS[i % 5] }} />
                                <p className="truncate text-sm font-semibold text-white">{route.route_name}</p>
                              </div>
                              <p className="mt-1 text-xs text-gray-500">
                                {route.total_orders} stops · {route.total_distance_km?.toFixed(1)} km · {fmtDur(route.estimated_duration_minutes)}
                              </p>
                            </div>
                            <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                              route.status === 'assigned' ? 'bg-blue-500/15 text-blue-300' :
                                route.status === 'dispatched' ? 'bg-emerald-500/15 text-emerald-300' :
                                  'bg-white/5 text-gray-400'
                            }`}>
                              {route.status || 'draft'}
                            </span>
                          </div>

                          {route.depot_returns_count > 0 && (
                            <div className="mt-3 rounded-lg border border-orange-500/20 bg-orange-500/10 px-3 py-2 text-xs font-medium text-orange-300">
                              {route.depot_returns_count} depot return(s)
                            </div>
                          )}

                          <div className="mt-3 text-xs text-gray-500">
                            Driver: <span className="text-gray-300">{route.driver_name || 'Unassigned'}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </Card>

              <Card title="Assignment" subtitle="Select a route to manage driver.">
                {!selectedRoute ? (
                  <div className="rounded-xl border border-white/5 bg-[#0a0e1a]/60 p-4 text-sm text-gray-500">
                    Click a route card to view actions.
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="rounded-xl border border-[#1a2a45] bg-[#0a0e1a] p-3">
                      <p className="text-xs font-semibold text-white">{selectedRoute.route_name}</p>
                      <p className="mt-0.5 text-[11px] text-gray-500">
                        {selectedRoute.total_orders} stops · {selectedRoute.total_distance_km?.toFixed(1)} km · £{selectedRoute.estimated_fuel_cost}
                      </p>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-400">Driver</label>
                      <select
                        value={selectedRoute.driver_id || ''}
                        onChange={e => assignDriverToRoute(selectedRoute.route_id, e.target.value)}
                        disabled={loading}
                        className="w-full rounded-xl border border-[#1a2a45] bg-[#0a0e1a] px-3 py-2.5 text-sm text-white focus:border-orange-500/40 focus:outline-none"
                      >
                        <option value="">Select driver</option>
                        {availableDrivers.map(d => (
                          <option key={d.id} value={d.id}>
                            {d.name} ({d.mpg} MPG)
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedRoute.navigation_url && (
                      <a
                        href={selectedRoute.navigation_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full rounded-xl border border-orange-500/25 bg-orange-500/10 px-4 py-2.5 text-center text-sm font-semibold text-orange-200 transition hover:bg-orange-500/15"
                      >
                        Open route map
                      </a>
                    )}
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}

        {activeTab === 3 && (
          <div className="space-y-5">
            <div className="animate-fade-up">
              <WorkflowStepperH steps={tabs} active={activeTab} onChange={setActiveTab} />
            </div>
            <Card title="Progress" subtitle="Today's snapshot" className="animate-fade-up">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Metric label="Orders" value={eligibleOrders.length} tone="blue" />
                <Metric label="Zones" value={previewZones.length} tone="green" />
                <Metric label="Routes" value={generatedRoutes.length} tone="purple" />
                <Metric label="Dispatched" value={dispatchedCount} tone="orange" />
              </div>
            </Card>
            <div className="flex flex-col gap-6">
              <Card title="Dispatch summary" subtitle="Ready to push routes to drivers">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
                  <Metric label="Ready" value={generatedRoutes.length} tone="blue" />
                  <Metric label="Dispatched" value={dispatchedCount} tone="green" />
                </div>
                <div className="mt-4 rounded-xl border border-white/5 bg-[#0a0e1a]/60 p-3 text-xs text-gray-500">
                  When you dispatch, each driver receives their assigned route.
                </div>
                <div className="mt-4">
                  {generatedRoutes.every(r => r.status === 'dispatched') ? (
                    <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-center">
                      <p className="text-sm font-semibold text-emerald-200">All routes dispatched</p>
                      <p className="mt-0.5 text-xs text-emerald-200/70">Drivers have been notified.</p>
                    </div>
                  ) : (
                    <SlideToConfirm onConfirm={dispatchAllRoutes} loading={loading} label="Slide to dispatch all routes" loadingLabel="Dispatching…" />
                  )}
                </div>
              </Card>

              <Card title="Routes" subtitle="Live status overview">
                {generatedRoutes.length === 0 ? (
                  <div className="rounded-xl border border-white/5 bg-[#0a0e1a]/60 p-4 text-center text-sm text-gray-500">
                    No routes ready. Confirm routes first.
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {generatedRoutes.map((route, i) => {
                      const progress = route.progress_percentage || (route.status === 'dispatched' ? 100 : 0);
                      const statusTone = route.status === 'dispatched' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-blue-500/15 text-blue-300';
                      return (
                        <div key={route.route_id} className="rounded-2xl border border-[#1a2a45] bg-[#0a0e1a] p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: route.zone_color || ZONE_COLORS[i % 5] }} />
                                <p className="truncate text-sm font-semibold text-white">{route.route_name}</p>
                              </div>
                              <p className="mt-1 text-xs text-gray-500">Driver: <span className="text-gray-300">{route.driver_name || 'N/A'}</span> · {route.total_orders} stops</p>
                            </div>
                            <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusTone}`}>
                              {route.status || 'ready'}
                            </span>
                          </div>
                          <div className="mt-3 h-2 rounded-full bg-[#111b2e] overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all" style={{ width: `${progress}%` }} />
                          </div>
                          <div className="mt-1 flex justify-between text-[11px] text-gray-600">
                            <span>{progress}%</span>
                            <span>{fmtDur(route.estimated_duration_minutes)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}
          </main>
        </div>
      </div>

      {/* Sticky bottom action bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-xr-bg/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 md:px-8">
          <div className="flex items-center justify-between gap-3 sm:justify-start">
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-gray-600">CURRENT STEP</p>
              <p className="truncate text-sm font-semibold text-white">{activeTabMeta.label}</p>
            </div>
            <div className="hidden text-xs text-gray-600 sm:block">
              {activeTab === 0 && (canProceedToFilter ? 'Ready to continue to filtering.' : 'Upload orders to continue.')}
              {activeTab === 1 && (canProceedToReview ? 'Clusters ready. Continue to review routes.' : 'Generate clusters to continue.')}
              {activeTab === 2 && (canProceedToConfirm ? 'All routes assigned. Continue to confirm.' : 'Assign drivers to all routes.')}
              {activeTab === 3 && (generatedRoutes.every(r => r.status === 'dispatched') ? 'Dispatch completed.' : 'Dispatch when ready.')}
            </div>
          </div>

          <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
            <SoftButton onClick={goBack} disabled={activeTab === 0} tone="blue">
              Back
            </SoftButton>
            <div className="mx-1 hidden items-center gap-1.5 sm:flex" aria-label="Progress">
              {[0, 1, 2, 3].map(i => (
                <span
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full ${
                    i === activeTab ? 'bg-[#F59E0B]' : i < activeTab ? 'bg-[#F59E0B]/40' : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
            {activeTab < 3 && (
              <SoftButton
                tone="primary"
                onClick={goNext}
                disabled={
                  (activeTab === 0 && !canProceedToFilter) ||
                  (activeTab === 1 && !canProceedToReview) ||
                  (activeTab === 2 && !canProceedToConfirm)
                }
              >
                Next
              </SoftButton>
            )}
            {activeTab === 3 && !generatedRoutes.every(r => r.status === 'dispatched') && (
              <SoftButton tone="blue" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                View summary
              </SoftButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;
