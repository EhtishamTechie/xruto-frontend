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

const Orders = ({ onNavigateBack, onNavigateToRouteDetail }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [uploadMethod, setUploadMethod] = useState('text');
  const [excelFile, setExcelFile] = useState(null);
  const [excelUploading, setExcelUploading] = useState(false);
  const [excelResult, setExcelResult] = useState(null);
  const [selectedPostcodes, setSelectedPostcodes] = useState([]);
  const [availablePostcodes, setAvailablePostcodes] = useState([]);
  const [eligibleOrders, setEligibleOrders] = useState([]);
  const [previewZones, setPreviewZones] = useState([]);
  const [generatedRoutes, setGeneratedRoutes] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);
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
      const r = await ordersAPI.generateClusters(selectedPostcodes, 5);
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

  return (
    <div className="min-h-screen pb-4">
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-[#0a0e1a]/90 border-b border-[#1a2a45]">
        <div className="px-4 md:px-6 lg:px-8 py-3 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg md:text-xl font-bold text-white">Orders</h1>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{eligibleOrders.length} orders</span>
              <button onClick={() => setShowResetConfirm(true)} disabled={resetting || loading}
                className="text-xs text-red-400 bg-red-500/10 px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition disabled:opacity-50">
                Reset
              </button>
            </div>
          </div>
          <div className="flex items-center gap-1 md:max-w-lg">
            {tabs.map((tab, i) => (
              <React.Fragment key={tab.id}>
                <button onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-2 text-xs font-medium rounded-lg transition ${activeTab === tab.id ? 'bg-orange-500 text-white' : 'bg-[#111b2e] text-gray-500 border border-[#1a2a45]'}`}>
                  {tab.label}
                </button>
                {i < tabs.length - 1 && (
                  <div className={`w-6 h-0.5 ${activeTab > i ? 'bg-orange-500' : 'bg-[#1a2a45]'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 lg:px-8 pt-3 max-w-7xl mx-auto">
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

      <div className="px-4 md:px-6 lg:px-8 pt-1 pb-3 max-w-7xl mx-auto">
        <div className="grid grid-cols-4 gap-2 md:gap-3">
          {[
            { val: eligibleOrders.length, label: 'Orders', color: 'text-blue-400' },
            { val: previewZones.length, label: 'Zones', color: 'text-green-400' },
            { val: generatedRoutes.length, label: 'Routes', color: 'text-purple-400' },
            { val: generatedRoutes.reduce((s, r) => s + (r.depot_returns_count || 0), 0), label: 'Returns', color: 'text-orange-400' },
          ].map(s => (
            <div key={s.label} className="bg-[#111b2e] border border-[#1a2a45] rounded-xl p-3 md:p-4 text-center">
              <div className={`text-lg md:text-xl font-bold ${s.color}`}>{s.val}</div>
              <div className="text-[10px] md:text-xs text-gray-600 uppercase">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 md:px-6 lg:px-8 space-y-4 max-w-7xl mx-auto">
        {activeTab === 0 && (
          <div className="md:grid md:grid-cols-2 md:gap-6 space-y-4 md:space-y-0">
            <div className="space-y-4">
            <div className="bg-[#111b2e] border border-[#1a2a45] rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3">Upload Method</h3>
              <div className="flex gap-2">
                {[{ id: 'text', label: 'Text', icon: 'Aa' }, { id: 'pdf', label: 'PDF', icon: 'PDF' }, { id: 'excel', label: 'Excel', icon: 'XLS' }].map(m => (
                  <button key={m.id} onClick={() => setUploadMethod(m.id)}
                    className={`flex-1 py-3 rounded-xl text-xs font-medium transition ${uploadMethod === m.id ? 'bg-orange-500 text-white' : 'bg-[#0a0e1a] border border-[#1a2a45] text-gray-500'}`}>
                    <div className="text-base mb-0.5">{m.icon}</div>{m.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-[#111b2e] border border-[#1a2a45] rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-white mb-1">Quick Demo</h3>
              <p className="text-xs text-gray-500 mb-3">Select a demo dataset to explore the app with sample orders.</p>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {[
                  { id:'london', label:'London', flag:'🇬🇧', count:10, desc:'Central London deliveries' },
                  { id:'pakistan', label:'Pakistan', flag:'🇵🇰', count:10, desc:'Lahore, Karachi, Islamabad' },
                  { id:'uae', label:'UAE', flag:'🇦🇪', count:5, desc:'Dubai & Abu Dhabi' },
                  { id:'usa', label:'USA', flag:'🇺🇸', count:5, desc:'New York City metro' },
                ].map(d => (
                  <button key={d.id} onClick={() => setDemoSet(d.id)}
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
            </div>
            </div>
            <div className="space-y-4">
            {uploadMethod === 'text' && <TextBulkUpload onOrdersUploaded={handleOrdersUploaded} />}
            {uploadMethod === 'pdf' && <PDFUpload onOrdersUploaded={handleOrdersUploaded} />}
            {uploadMethod === 'excel' && (
              <div className="bg-[#111b2e] border border-[#1a2a45] rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-white mb-3">Excel Upload</h3>
                <p className="text-xs text-gray-500 mb-3">Accepts .xlsx / .xls files with columns: Order ID, Customer Name, Address, Lat, Lon, Meal Qty</p>
                <label className="block w-full cursor-pointer border-2 border-dashed border-[#1a2a45] rounded-xl p-6 text-center hover:border-orange-500/30 transition">
                  <span className="text-gray-400 text-sm">{excelFile ? excelFile.name : 'Choose Excel file'}</span>
                  <input type="file" accept=".xlsx,.xls" className="hidden" onChange={e => { setExcelFile(e.target.files[0] || null); setExcelResult(null); }} />
                </label>
                {excelFile && (
                  <SlideToConfirm label="Slide To Upload" loadingLabel="Uploading..." loading={excelUploading} onConfirm={async () => {
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
                )}
                {excelResult && <div className={`mt-3 p-3 rounded-xl text-xs ${excelResult.ok ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>{excelResult.msg}</div>}
              </div>
            )}
            </div>
          </div>
        )}

        {activeTab === 1 && (
          <div className="space-y-4">
            <div className="bg-[#111b2e] border border-[#1a2a45] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">Select Delivery Areas</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-orange-400">{selectedPostcodes.length} selected</span>
                  {availablePostcodes.length > 0 && (
                    <button onClick={() => setSelectedPostcodes(selectedPostcodes.length === availablePostcodes.length ? [] : [...availablePostcodes])}
                      className="text-xs px-2.5 py-1 rounded-lg bg-[#0a0e1a] border border-[#1a2a45] text-gray-400 hover:border-orange-500/40 hover:text-orange-400 transition">
                      {selectedPostcodes.length === availablePostcodes.length ? 'Deselect All' : 'Select All'}
                    </button>
                  )}
                </div>
              </div>
              {availablePostcodes.length === 0 ? (
                <p className="text-xs text-gray-600 text-center py-6">No postcode areas found</p>
              ) : (
                <div className="flex flex-wrap gap-2 mb-4">
                  {availablePostcodes.map(pc => {
                    const sel = selectedPostcodes.includes(pc);
                    const cnt = eligibleOrders.filter(o => o.postcode.startsWith(pc)).length;
                    return (
                      <button key={pc} onClick={() => handlePostcodeToggle(pc)}
                        className={`px-3 py-2 rounded-xl text-xs font-medium transition ${sel ? 'bg-orange-500 text-white' : 'bg-[#0a0e1a] border border-[#1a2a45] text-gray-400 hover:border-orange-500/30'}`}>
                        {pc} <span className="opacity-70">({cnt})</span>
                      </button>
                    );
                  })}
                </div>
              )}
              <div className="md:max-w-md">
                <SlideToConfirm onConfirm={previewClustering} disabled={!selectedPostcodes.length} loading={loading} label="Slide To Generate Clusters" loadingLabel="Clustering..." />
              </div>
            </div>
            {previewZones.length > 0 && (
              <div className="bg-[#111b2e] border border-[#1a2a45] rounded-2xl p-5 space-y-3">
                <h3 className="text-sm font-semibold text-white">Cluster Preview</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {previewZones.map((zone, i) => (
                    <div key={zone.zone_id} className="bg-[#0a0e1a] border border-[#1a2a45] rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: zone.color_hex || ZONE_COLORS[i % 5] }} />
                          <span className="text-sm font-medium text-white">{zone.zone_name}</span>
                        </div>
                        <span className="text-xs text-gray-400">{zone.total_orders} orders</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{zone.route_distance_km?.toFixed(1) || '?'} km</span>
                        <span>{fmtDur(zone.estimated_duration)}</span>
                        <span>{zone.depot_returns_needed || 0} returns</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="md:max-w-md">
                  <SlideToConfirm onConfirm={generateRoutesFromZones} loading={loading} label="Slide To Generate Routes" loadingLabel="Optimizing..." />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">{generatedRoutes.length} Routes</h3>
              <div className="flex gap-2">
                <button onClick={autoAssignAllDrivers} disabled={loading || !availableDrivers.length}
                  className="text-xs font-medium text-orange-400 bg-orange-500/10 px-3 py-1.5 rounded-lg disabled:opacity-50">Auto-Assign</button>
                <button onClick={confirmRoutes} disabled={loading || generatedRoutes.some(r => !r.driver_id)}
                  className="text-xs font-medium text-green-400 bg-green-500/10 px-3 py-1.5 rounded-lg disabled:opacity-50">Confirm</button>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {generatedRoutes.map((route, i) => (
                <div key={route.route_id} className="bg-[#111b2e] border border-[#1a2a45] rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: route.zone_color || ZONE_COLORS[i % 5] }} />
                      <span className="text-sm font-medium text-white">{route.route_name}</span>
                    </div>
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${route.status === 'assigned' ? 'bg-blue-500/15 text-blue-400' : route.status === 'dispatched' ? 'bg-green-500/15 text-green-400' : 'bg-gray-500/15 text-gray-400'}`}>
                      {route.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{route.total_orders} orders</span>
                    <span>{route.total_distance_km?.toFixed(1)} km</span>
                    <span>{fmtDur(route.estimated_duration_minutes)}</span>
                    <span>\u00A3{route.estimated_fuel_cost}</span>
                  </div>
                  {route.depot_returns_count > 0 && (
                    <div className="text-xs text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-lg">
                      {route.depot_returns_count} depot return(s)
                    </div>
                  )}
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Driver</label>
                    <select value={route.driver_id || ''} onChange={e => assignDriverToRoute(route.route_id, e.target.value)} disabled={loading}
                      className="w-full bg-[#0a0e1a] border border-[#1a2a45] text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-orange-500/50">
                      <option value="">Select Driver</option>
                      {availableDrivers.map(d => <option key={d.id} value={d.id}>{d.name} ({d.mpg} MPG)</option>)}
                    </select>
                  </div>
                  {route.driver_id && (
                    <div className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M5 13l4 4L19 7"/></svg>
                      Assigned to {route.driver_name}
                    </div>
                  )}
                  {route.navigation_url && (
                    <a href={route.navigation_url} target="_blank" rel="noopener noreferrer"
                      className="block w-full text-center py-2.5 bg-orange-500/15 text-orange-400 text-xs font-medium rounded-xl hover:bg-orange-500/25 transition">
                      View Route Map
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 3 && (
          <div className="space-y-4">
            <div className="bg-[#111b2e] border border-[#1a2a45] rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-white mb-1">Dispatch Control</h3>
              <p className="text-xs text-gray-500 mb-4">{generatedRoutes.length} routes ready</p>
              <div className="grid md:grid-cols-2 gap-3">
                {generatedRoutes.map((route, i) => (
                  <div key={route.route_id} className="bg-[#0a0e1a] border border-[#1a2a45] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: route.zone_color || ZONE_COLORS[i % 5] }} />
                        <span className="text-sm font-medium text-white">{route.route_name}</span>
                      </div>
                      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${route.status === 'dispatched' ? 'bg-green-500/15 text-green-400' : 'bg-blue-500/15 text-blue-400'}`}>
                        {route.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <span>Driver: {route.driver_name || 'N/A'}</span>
                      <span>{route.total_orders} orders</span>
                    </div>
                    <div className="h-1.5 bg-[#111b2e] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all"
                        style={{ width: `${route.progress_percentage || (route.status === 'dispatched' ? 100 : 0)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 md:max-w-md">
                {generatedRoutes.every(r => r.status === 'dispatched') ? (
                  <div className="text-center py-4">
                    <div className="text-green-400 font-medium text-sm mb-1">All Routes Dispatched</div>
                    <p className="text-xs text-gray-500">Drivers have been notified</p>
                  </div>
                ) : (
                  <SlideToConfirm onConfirm={dispatchAllRoutes} loading={loading} label="Slide To Push To Drivers" loadingLabel="Dispatching..." />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
