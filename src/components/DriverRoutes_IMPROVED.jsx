import React, { useState, useEffect, useCallback, useRef } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// API service
const driverAPI = {
  getAllRoutes: async (date = new Date().toISOString().split('T')[0]) => {
    try {
      const routesResponse = await fetch(`${API_BASE_URL}/orders/get-routes?date=${date}`);
      if (routesResponse.ok) {
        const routesResult = await routesResponse.json();
        if (routesResult.success && routesResult.routes.length > 0) {
          return { success: true, routes: routesResult.routes };
        }
      }
      const response = await fetch(`${API_BASE_URL}/orders/eligible?date=${date}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      return { success: true, orders: result.orders || [], routes: [] };
    } catch (error) {
      throw new Error(`Failed to fetch routes: ${error.message}`);
    }
  },
  updateDeliveryStatus: async (orderId, status) => {
    const response = await fetch(`${API_BASE_URL}/orders/delivery-status/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, timestamp: new Date().toISOString() })
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }
    return response.json();
  }
};

const fmtDuration = (m) => { if (!m) return '0 min'; if (m < 60) return `${Math.round(m)} min`; return `${Math.floor(m / 60)}h ${Math.round(m % 60)}m`; };
const fmtDist = (km) => { if (!km) return '0 km'; return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)} km`; };

const ZONE_COLORS = ['#F97316', '#3B82F6', '#10B981', '#8B5CF6', '#EF4444'];
const ZONE_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

// Slide button (Figma pattern)
const SlideButton = ({ label, onConfirm, loading = false }) => {
  const trackRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [offsetX, setOffsetX] = useState(0);

  const getMaxX = () => (trackRef.current ? trackRef.current.offsetWidth - 48 : 200);
  const handleStart = () => { if (!loading) setDragging(true); };
  const handleMove = (clientX) => {
    if (!dragging || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    setOffsetX(Math.max(0, Math.min(clientX - rect.left - 24, getMaxX())));
  };
  const handleEnd = () => {
    if (!dragging) return;
    setDragging(false);
    if (offsetX >= getMaxX() * 0.85) onConfirm();
    setOffsetX(0);
  };

  return (
    <div ref={trackRef}
      className={`relative h-12 rounded-full overflow-hidden select-none ${loading ? 'opacity-50' : ''}`}
      style={{ background: 'linear-gradient(135deg, #0f1b2e 0%, #162540 100%)', border: '1px solid rgba(59,130,246,0.25)' }}
      onMouseMove={e => handleMove(e.clientX)} onMouseUp={handleEnd} onMouseLeave={handleEnd}
      onTouchMove={e => handleMove(e.touches[0].clientX)} onTouchEnd={handleEnd}>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-white/70 text-sm font-medium">{loading ? 'Processing...' : label}</span>
      </div>
      <div className="absolute top-1 left-1 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 cursor-grab active:cursor-grabbing z-10"
        style={{ transform: `translateX(${offsetX}px)` }}
        onMouseDown={e => { e.preventDefault(); handleStart(); }} onTouchStart={handleStart}>
        {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          : <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>}
      </div>
    </div>
  );
};

// Zone Card (Figma layout)
const ZoneCard = ({ route, index, onNavigate, onOrderNav, onOrderStatus }) => {
  const [expanded, setExpanded] = useState(false);
  const allOrders = route.route_segments?.flatMap(s => s.orders || []) || [];
  const completed = allOrders.filter(o => o.status === 'delivered').length;
  const failed = allOrders.filter(o => o.status === 'failed').length;
  const total = route.total_orders || allOrders.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const color = ZONE_COLORS[index % ZONE_COLORS.length];
  const zoneLetter = ZONE_LABELS[index % ZONE_LABELS.length];

  const isCompleted = pct === 100 || route.status === 'completed';
  const isInProgress = (route.status === 'in_progress' || route.status === 'in_route' || route.status === 'dispatched') && !isCompleted;
  const isNotStarted = !isCompleted && !isInProgress;

  const statusLabel = isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Not Started';
  const statusColor = isCompleted ? 'text-green-400 bg-green-500/15' : isInProgress ? 'text-orange-400 bg-orange-500/15' : 'text-red-400 bg-red-500/15';

  return (
    <div className="bg-[#111b2e] border border-[#1a2a45] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-white">Zone {zoneLetter}</span>
            <span style={{ color }} className="text-lg font-bold">&rarr;</span>
          </div>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColor}`}>{statusLabel}</span>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-1.5 bg-[#0a0e1a] rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
          </div>
          <span className="text-xs font-bold text-gray-400">{pct}%</span>
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            {fmtDuration(route.estimated_duration_minutes)}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            {total} stops
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7"/></svg>
            {fmtDist(route.total_distance_km)}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 mb-1">
          <button onClick={() => onNavigate(route)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-white transition-all"
            style={{ backgroundColor: `${color}20`, color }}>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            Navigate
          </button>
          <button onClick={() => setExpanded(v => !v)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold 
              bg-[#0a0e1a] border border-[#1a2a45] text-gray-400 hover:text-white transition-all">
            <svg className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M19 9l-7 7-7-7"/></svg>
            {expanded ? 'Hide Orders' : 'Show Orders'}
          </button>
        </div>
      </div>

      {/* Expanded orders */}
      {expanded && (
        <div className="border-t border-[#1a2a45] bg-[#0c1220] p-4 space-y-2">
          {allOrders.map((order, idx) => {
            const isDone = order.status === 'delivered' || order.status === 'failed';
            return (
              <div key={order.id || idx} className={`flex items-center gap-3 p-3 rounded-xl ${isDone ? 'bg-[#111b2e]/60' : 'bg-[#111b2e]'} border border-[#1a2a45]`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${isDone ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/15 text-orange-400'}`}>
                  {isDone ? '\u2713' : idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${isDone ? 'text-gray-500 line-through' : 'text-white'}`}>{order.customer_name}</p>
                  <p className="text-xs text-gray-600 truncate">{order.delivery_address}</p>
                </div>
                <div className="shrink-0 flex items-center gap-1.5">
                  <button onClick={() => onOrderNav(order)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 transition">
                    Go
                  </button>
                  {!isDone && (
                    <>
                      <button onClick={() => onOrderStatus(order.id, 'delivered')}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-green-500/15 text-green-400 hover:bg-green-500/25 transition">
                        Delivered
                      </button>
                      <button onClick={() => onOrderStatus(order.id, 'failed')}
                        className="px-2 py-1.5 rounded-lg text-xs font-medium bg-red-500/15 text-red-400 hover:bg-red-500/25 transition">
                        Fail
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Slide button */}
      <div className="p-4 pt-0">
        {isCompleted ? (
          <div className="flex items-center justify-center gap-2 py-3 text-green-400 text-sm font-medium">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            Route Completed
          </div>
        ) : isInProgress ? (
          <SlideButton label="Slide To Complete Route" onConfirm={() => {}} />
        ) : (
          <SlideButton label="Slide To Start Route" onConfirm={() => onNavigate(route)} />
        )}
      </div>
    </div>
  );
};

// Main Component
const DriverRoutes = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liveUpdate, setLiveUpdate] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const loadRoutes = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await driverAPI.getAllRoutes();
      if (result.success) {
        if (result.routes && result.routes.length > 0) {
          const savedUser = localStorage.getItem('xruto_user');
          const currentUser = savedUser ? JSON.parse(savedUser) : null;
          let filtered = result.routes;
          if (currentUser && currentUser.role === 'driver') {
            filtered = result.routes.filter(r =>
              r.driver_email && currentUser.email &&
              r.driver_email.toLowerCase() === currentUser.email.toLowerCase()
            );
          }
          setRoutes(filtered);
        } else if (result.orders && result.orders.length > 0) {
          const byPC = result.orders.reduce((a, o) => {
            const pc = o.postcode.split(' ')[0];
            (a[pc] = a[pc] || []).push(o);
            return a;
          }, {});
          setRoutes(Object.entries(byPC).map(([pc, orders], i) => {
            const comp = orders.filter(o => o.status === 'delivered').length;
            return {
              id: `route-${i + 1}`, route_name: `Route ${ZONE_LABELS[i]} - ${pc}`,
              status: comp === orders.length ? 'completed' : comp > 0 ? 'in_route' : 'assigned',
              total_orders: orders.length, completed_orders: comp,
              estimated_duration_minutes: orders.length * 10,
              total_distance_km: orders.reduce((s, o) => s + (o.distance_from_depot_km || 5), 0),
              zone_color: ZONE_COLORS[i % ZONE_COLORS.length],
              depot_returns_needed: Math.ceil(orders.length / 10),
              route_segments: [{ orders: orders.map(o => ({ ...o, status: o.status || 'pending' })),
                return_to_depot: true }]
            };
          }));
        } else { setRoutes([]); }
        setLastRefresh(new Date());
      }
    } catch (e) { setError(e.message); setRoutes([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadRoutes(); }, [loadRoutes]);
  useEffect(() => { if (!liveUpdate) return; const id = setInterval(loadRoutes, 30000); return () => clearInterval(id); }, [liveUpdate, loadRoutes]);

  const navRoute = (route) => {
    if (route.navigation_url) {
      const url = typeof route.navigation_url === 'object' ? route.navigation_url.url : route.navigation_url;
      if (url?.startsWith('http')) { window.open(url, '_blank'); return; }
    }
    const orders = route.route_segments?.flatMap(s => s.orders || []) || [];
    const valid = orders.filter(o => o.latitude && o.longitude && !isNaN(o.latitude) && !isNaN(o.longitude));
    if (!valid.length) { alert('No valid coordinates'); return; }
    const wps = valid.map(o => `${o.latitude},${o.longitude}`).join('/');
    window.open(`https://www.google.com/maps/dir/${wps}/?travelmode=driving`, '_blank');
  };

  const navStop = (order) => {
    if (!order.latitude || !order.longitude) { alert('No coordinates'); return; }
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${order.latitude},${order.longitude}&travelmode=driving`, '_blank');
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await driverAPI.updateDeliveryStatus(orderId, newStatus);
      setRoutes(prev => prev.map(route => ({
        ...route,
        route_segments: route.route_segments?.map(seg => ({
          ...seg, orders: seg.orders?.map(o => o.id === orderId ? { ...o, status: newStatus } : o) || []
        }))
      })));
    } catch (e) { alert(`Failed: ${e.message}`); }
  };

  const totalOrders = routes.reduce((s, r) => s + (r.total_orders || 0), 0);
  const completedOrders = routes.reduce((s, r) => {
    return s + (r.route_segments?.flatMap(seg => seg.orders || []) || []).filter(o => o.status === 'delivered').length;
  }, 0);
  const overallPct = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;

  if (loading && routes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">Loading routes...</p>
      </div>
    );
  }

  if (error && routes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 px-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-500/15 flex items-center justify-center">
          <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        </div>
        <p className="text-white font-semibold">Failed to Load Routes</p>
        <p className="text-sm text-gray-500">{error}</p>
        <button onClick={loadRoutes} className="px-5 py-2.5 bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold rounded-xl transition">Try Again</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-4">
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-[#0a0e1a]/90 border-b border-[#1a2a45]">
        <div className="px-4 md:px-6 lg:px-8 py-4 flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-lg md:text-xl font-bold text-white">Route List</h1>
            <p className="text-xs text-gray-500 mt-0.5">{routes.length} route{routes.length !== 1 ? 's' : ''} &middot; {totalOrders} orders</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setLiveUpdate(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition
                ${liveUpdate ? 'bg-green-500/15 text-green-400 border border-green-500/30' : 'bg-[#111b2e] text-gray-500 border border-[#1a2a45]'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${liveUpdate ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`} />
              Live
            </button>
            <button onClick={loadRoutes} disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-500 hover:bg-orange-400 text-white transition disabled:opacity-50">
              <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 lg:px-8 pt-4 max-w-7xl mx-auto">
        {/* Overall Progress */}
        {totalOrders > 0 && (
          <div className="bg-[#111b2e] border border-[#1a2a45] rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300 font-medium">Today's Progress</span>
              <span className="text-sm font-bold text-orange-400">{overallPct}%</span>
            </div>
            <div className="h-2 bg-[#0a0e1a] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-700" style={{ width: `${overallPct}%` }} />
            </div>
            <p className="text-xs text-gray-600 mt-2">{completedOrders} delivered &middot; {totalOrders - completedOrders} remaining</p>
          </div>
        )}

        {/* Empty state */}
        {routes.length === 0 && (
          <div className="text-center py-20 bg-[#111b2e] border border-[#1a2a45] rounded-2xl">
            <div className="w-16 h-16 rounded-2xl bg-[#0a0e1a] flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/></svg>
            </div>
            <p className="text-white font-semibold mb-1">No Routes Assigned</p>
            <p className="text-sm text-gray-500 mb-4">Waiting for dispatch</p>
            <button onClick={loadRoutes} className="px-5 py-2.5 bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold rounded-xl transition">Check for Updates</button>
          </div>
        )}

        {/* Zone Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          {routes.map((route, i) => (
            <ZoneCard key={route.id || route.route_id} route={route} index={i}
              onNavigate={navRoute} onOrderNav={navStop} onOrderStatus={updateStatus} />
          ))}
        </div>

        {liveUpdate && (
          <div className="mt-4 text-center">
            <span className="text-xs text-green-400/70 flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Auto-refreshing &middot; {lastRefresh.toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverRoutes;