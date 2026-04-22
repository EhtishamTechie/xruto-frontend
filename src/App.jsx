import React, { useState, useEffect, useCallback, useRef } from 'react';
import MyAdmin from './components/MyAdmin';
import Orders from './components/Orders';
import DriverRoutes from './components/DriverRoutes_IMPROVED';
import PWAInstallPrompt from './components/PWAInstallPrompt';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Ico = ({ d, className = 'w-5 h-5', fill = false }) => (
  <svg className={className} fill={fill ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke={fill ? 'none' : 'currentColor'} strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
);

const ICONS = {
  user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  lock: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
  eye: 'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
  eyeOff: 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21',
  admin: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
  orders: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  analytics: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  route: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7',
  settings: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
  logout: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
  chevronR: 'M9 5l7 7-7 7',
  edit: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  phone: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
  shield: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  chart: 'M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
  truck: 'M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0',
};

// Slide-to-confirm button
const SlideButton = ({ label, onConfirm, loading = false, disabled = false }) => {
  const trackRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [offsetX, setOffsetX] = useState(0);
  const getMaxX = () => (trackRef.current ? trackRef.current.offsetWidth - 48 : 200);
  const handleStart = () => { if (!loading && !disabled) setDragging(true); };
  const handleMove = (clientX) => { if (!dragging || !trackRef.current) return; const rect = trackRef.current.getBoundingClientRect(); setOffsetX(Math.max(0, Math.min(clientX - rect.left - 24, getMaxX()))); };
  const handleEnd = () => { if (!dragging) return; setDragging(false); if (offsetX >= getMaxX() * 0.85) onConfirm(); setOffsetX(0); };
  return (
    <div ref={trackRef} className={`relative h-12 rounded-full overflow-hidden select-none ${disabled || loading ? 'opacity-50' : ''}`}
      style={{ background: 'linear-gradient(135deg, #0f1b2e 0%, #162540 100%)', border: '1px solid rgba(59,130,246,0.25)' }}
      onMouseMove={e => handleMove(e.clientX)} onMouseUp={handleEnd} onMouseLeave={handleEnd}
      onTouchMove={e => handleMove(e.touches[0].clientX)} onTouchEnd={handleEnd}>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-white/70 text-sm font-medium">{loading ? 'Processing...' : label}</span>
      </div>
      <div className="absolute top-1 left-1 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 cursor-grab active:cursor-grabbing transition-transform z-10"
        style={{ transform: `translateX(${offsetX}px)` }}
        onMouseDown={e => { e.preventDefault(); handleStart(); }} onTouchStart={handleStart}>
        {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          : <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>}
      </div>
    </div>
  );
};

// Standalone input field — must be outside LoginScreen to avoid remount on every keystroke
const LoginInputField = ({ icon, type = 'text', value, onChange, placeholder, showToggle, onToggle, isPassword }) => (
  <div className="relative">
    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"><Ico d={icon} className="w-4.5 h-4.5" /></div>
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      className="w-full bg-[#111b2e] border border-[#1a2a45] rounded-full pl-11 pr-11 py-3.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition" />
    {showToggle && (
      <button type="button" onClick={onToggle} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
        <Ico d={isPassword ? ICONS.eyeOff : ICONS.eye} className="w-4.5 h-4.5" />
      </button>
    )}
  </div>
);

// Login Screen — centered card on desktop, full-screen on mobile
const LoginScreen = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [view, setView] = useState(() => new URLSearchParams(window.location.search).get('reset_token') ? 'reset' : 'login');
  const [resetToken] = useState(() => new URLSearchParams(window.location.search).get('reset_token') || '');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  const doLogin = async () => {
    if (!email || !password) { setError('Please enter your email and password'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email.trim(), password }) });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Login failed');
      localStorage.setItem('xruto_token', data.token);
      localStorage.setItem('xruto_user', JSON.stringify(data.user));
      onLogin(data.user, data.token);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const doForgot = async () => {
    if (!email) { setError('Please enter your email address'); return; }
    setLoading(true); setError(''); setSuccessMsg('');
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email.trim() }) });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Request failed');
      setSuccessMsg(data.message);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const doReset = async () => {
    if (!newPw || !confirmPw) { setError('Please fill in both fields'); return; }
    if (newPw !== confirmPw) { setError('Passwords do not match'); return; }
    if (newPw.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true); setError(''); setSuccessMsg('');
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: resetToken, new_password: newPw }) });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Reset failed');
      setSuccessMsg(data.message);
      window.history.replaceState({}, '', window.location.pathname);
      setTimeout(() => { setView('login'); setSuccessMsg(''); }, 2500);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const switchView = (v) => { setView(v); setError(''); setSuccessMsg(''); };



  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center px-4 py-10 md:px-0">
      {/* Mobile: full screen centered | Desktop: card with glass effect */}
      <div className="w-full max-w-sm md:max-w-md md:bg-[#111b2e]/60 md:backdrop-blur-xl md:border md:border-[#1a2a45] md:rounded-3xl md:p-10 md:shadow-2xl md:shadow-black/40">
        <div className="flex flex-col items-center">
          {/* xRuto brand — logo mark + name + tagline */}
          <div className="mb-8 text-center w-full">
            <div className="inline-flex flex-col items-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#F59E0B]/35 bg-gradient-to-br from-[#F59E0B]/20 to-amber-600/5 shadow-lg shadow-[#F59E0B]/10">
                <span className="text-2xl font-black tracking-tight text-[#F59E0B]">X</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">xRuto</h1>
              <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.28em] text-gray-500">Logistics Intelligence</p>
            </div>
          </div>
          {view === 'login' && (
            <>
              <h2 className="text-lg font-semibold text-white mb-6 text-center">Sign in to your account</h2>
              {error && <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl text-center">{error}</div>}
              <div className="space-y-4">
                <LoginInputField icon={ICONS.user} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your Email Address" />
                <LoginInputField icon={ICONS.lock} type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your Password" showToggle onToggle={() => setShowPw(v => !v)} isPassword={showPw} />
                <SlideButton label="Slide To Sign in" onConfirm={doLogin} loading={loading} />
                <button onClick={() => switchView('forgot')} className="w-full text-center text-sm text-gray-500 hover:text-gray-300 pt-2">Forgot Password?</button>
              </div>
            </>
          )}
          {view === 'forgot' && (
            <>
              <h2 className="text-lg font-semibold text-white mb-2 text-center">Reset Password</h2>
              <p className="text-gray-500 text-sm mb-8 text-center">Enter your email to receive a reset link</p>
              {error && <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl text-center">{error}</div>}
              {successMsg && <div className="mb-4 bg-green-500/10 border border-green-500/20 text-green-400 text-sm px-4 py-3 rounded-xl text-center">{successMsg}</div>}
              <div className="space-y-4">
                <LoginInputField icon={ICONS.user} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your Email Address" />
                <SlideButton label="Slide To Send Link" onConfirm={doForgot} loading={loading} />
                <button onClick={() => switchView('login')} className="w-full text-center text-sm text-gray-500 hover:text-gray-300 pt-2">&larr; Back to Sign in</button>
              </div>
            </>
          )}
          {view === 'reset' && (
            <>
              <h2 className="text-lg font-semibold text-white mb-2 text-center">Set New Password</h2>
              <p className="text-gray-500 text-sm mb-8 text-center">Enter your new password below</p>
              {error && <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl text-center">{error}</div>}
              {successMsg && <div className="mb-4 bg-green-500/10 border border-green-500/20 text-green-400 text-sm px-4 py-3 rounded-xl text-center">{successMsg}</div>}
              <div className="space-y-4">
                <LoginInputField icon={ICONS.lock} type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="New Password (min 6 chars)" />
                <LoginInputField icon={ICONS.lock} type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Confirm Password" />
                <SlideButton label="Slide To Reset Password" onConfirm={doReset} loading={loading} />
                <button onClick={() => switchView('login')} className="w-full text-center text-sm text-gray-500 hover:text-gray-300 pt-2">&larr; Back to Sign in</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Sidebar Navigation — visible on md+ screens
const SideNav = ({ currentView, onChange, isAdmin, user, onLogout }) => {
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  const adminTabs = [
    { id: 'admin',     label: 'My Admin',  icon: ICONS.admin },
    { id: 'orders',    label: 'Orders',    icon: ICONS.orders },
    { id: 'analytics', label: 'Analytics', icon: ICONS.analytics },
    { id: 'routes',    label: 'Route',     icon: ICONS.route },
    { id: 'settings',  label: 'Settings',  icon: ICONS.settings },
  ];
  const driverTabs = [
    { id: 'routes',    label: 'My Routes', icon: ICONS.route },
    { id: 'analytics', label: 'Analytics', icon: ICONS.analytics },
    { id: 'settings',  label: 'Settings',  icon: ICONS.settings },
  ];
  const tabs = isAdmin ? adminTabs : driverTabs;

  return (
    <aside className="hidden md:flex flex-col w-[240px] bg-gradient-to-b from-xr-sidebar to-[#0D1320] border-r border-white/10 h-screen sticky top-0 shrink-0">
      {/* Brand */}
      <div className="px-5 py-6 border-b border-white/10">
        <div className="relative inline-block">
          <h1 className="text-xl font-bold tracking-tight text-white">xRuto</h1>
          <span aria-hidden className="absolute left-0 right-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-[#F59E0B]/70 to-transparent" />
          <span aria-hidden className="absolute left-1/4 right-1/4 -bottom-1.5 h-3 blur-xl bg-[#F59E0B]/25" />
        </div>
        <p className="text-[11px] text-gray-500 mt-1">Logistics Intelligence</p>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {tabs.map(tab => {
          const active = currentView === tab.id;
          return (
            <button key={tab.id} onClick={() => onChange(tab.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200
                ${active
                  ? 'relative bg-[#F59E0B]/10 text-[#F59E0B] border border-white/10'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'}`}>
              {active && <span aria-hidden className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#F59E0B]" />}
              <Ico d={tab.icon} className={`w-5 h-5 ${active ? 'text-[#F59E0B]' : ''}`} />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* User row + compact logout (always visible above fold) */}
      <div className="mt-auto border-t border-white/10 px-2 py-3">
        <div className="flex items-center gap-2 rounded-xl px-2 py-1.5">
          <div className="h-8 w-8 rounded-full bg-[#0A0F1E] ring-1 ring-[#F59E0B]/35 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-white truncate">{user?.name || 'User'}</p>
            <p className="text-[10px] text-gray-500 truncate">{user?.role === 'admin' ? 'Administrator' : 'Driver'}</p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            title="Log out"
            className="shrink-0 flex h-8 items-center justify-center gap-1 rounded-lg border border-red-500/25 bg-red-500/5 px-2.5 text-[11px] font-medium text-red-300/90 transition hover:bg-red-500/15"
          >
            <Ico d={ICONS.logout} className="h-3.5 w-3.5 opacity-90" />
            <span className="hidden min-[200px]:inline sm:inline">Log out</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

// Bottom Navigation — mobile only
const BottomNav = ({ currentView, onChange, isAdmin }) => {
  const adminTabs = [
    { id: 'admin',     label: 'My Admin',  icon: ICONS.admin },
    { id: 'orders',    label: 'Orders',    icon: ICONS.orders },
    { id: 'analytics', label: 'Analytics', icon: ICONS.analytics },
    { id: 'routes',    label: 'Route',     icon: ICONS.route },
    { id: 'settings',  label: 'Settings',  icon: ICONS.settings },
  ];
  const driverTabs = [
    { id: 'routes',    label: 'My Routes', icon: ICONS.route },
    { id: 'analytics', label: 'Analytics', icon: ICONS.analytics },
    { id: 'settings',  label: 'Settings',  icon: ICONS.settings },
  ];
  const tabs = isAdmin ? adminTabs : driverTabs;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0a0e1a]/95 backdrop-blur-md border-t border-[#1a2a45] z-20 safe-area-bottom">
      <div className={`grid ${isAdmin ? 'grid-cols-5' : 'grid-cols-3'} px-1 py-1.5`}>
        {tabs.map(tab => {
          const active = currentView === tab.id;
          return (
            <button key={tab.id} onClick={() => onChange(tab.id)}
              className="flex flex-col items-center gap-0.5 py-1.5 transition-colors">
              <Ico d={tab.icon} className={`w-5 h-5 ${active ? 'text-orange-500' : 'text-gray-600'}`} />
              <span className={`text-[10px] font-medium ${active ? 'text-orange-500' : 'text-gray-600'}`}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

// Analytics Screen — responsive grid
const AnalyticsScreen = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('xruto_token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const [routesRes, ordersRes] = await Promise.all([
          fetch(`${API_BASE}/orders/get-routes`, { headers }).then(r => r.json()).catch(() => ({ success: false })),
          fetch(`${API_BASE}/orders/eligible?date=${new Date().toISOString().split('T')[0]}`, { headers }).then(r => r.json()).catch(() => ({ success: false }))
        ]);
        const routes = routesRes.success ? (routesRes.routes || []) : [];
        const orders = ordersRes.success ? (ordersRes.orders || []) : [];
        const allRouteOrders = routes.flatMap(r => r.route_segments?.flatMap(s => s.orders || []) || []);
        const delivered = allRouteOrders.filter(s => s.status === 'delivered').length;
        const totalStops = allRouteOrders.length;
        const avgDuration = routes.length > 0 ? routes.reduce((sum, r) => sum + (r.estimated_duration || r.total_time || 0), 0) / routes.length : 0;
        const dispatched = routes.filter(r => r.status === 'dispatched' || r.status === 'in_progress').length;
        const completed = routes.filter(r => r.status === 'completed').length;
        const pending = orders.length - delivered;
        setStats({ totalRoutes: routes.length, delivered, totalStops, avgDuration, dispatched, completed, pendingOrders: pending, totalOrders: orders.length });
      } catch { setStats(null); }
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" /></div>;

  const s = stats || { totalRoutes: 0, delivered: 0, totalStops: 0, avgDuration: 0, dispatched: 0, completed: 0, pendingOrders: 0, totalOrders: 0 };
  const deliveryRate = s.totalStops > 0 ? Math.round((s.delivered / s.totalStops) * 100) : 0;

  return (
    <div className="min-h-screen pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:pb-0">
      <header className="sticky top-0 z-10 border-b border-[#1a2a45] bg-[#0a0e1a]/95 backdrop-blur-xl">
        <div className="mx-auto max-w-[1600px] px-4 py-4 sm:px-6 md:px-8 md:py-5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">xRuto · Performance</p>
          <h2 className="mt-0.5 text-xl font-bold tracking-tight text-white md:text-2xl">Analytics</h2>
          <p className="mt-0.5 max-w-2xl text-sm text-gray-500">Route and delivery metrics for today. Same dark palette, clearer hierarchy.</p>
        </div>
      </header>
      <div className="mx-auto max-w-[1600px] space-y-4 px-4 py-4 sm:px-6 md:space-y-6 md:px-8 md:py-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {[
          { label: 'Total Routes', value: s.totalRoutes, sub: 'Generated', color: 'text-blue-400' },
          { label: 'Delivered', value: s.delivered, sub: `of ${s.totalStops} stops`, color: 'text-green-400' },
          { label: 'Avg Duration', value: s.avgDuration > 0 ? `${Math.round(s.avgDuration / 60)}m` : '-', sub: 'Per route', color: 'text-orange-400' },
          { label: 'Pending', value: s.pendingOrders, sub: `of ${s.totalOrders} orders`, color: 'text-amber-400' },
        ].map(item => (
          <div key={item.label} className="bg-[#111b2e] border border-[#1a2a45] rounded-2xl p-4 md:p-5">
            <p className={`text-2xl md:text-3xl font-bold ${item.color}`}>{item.value}</p>
            <p className="text-sm text-gray-300 mt-0.5">{item.label}</p>
            <p className="text-xs text-gray-600">{item.sub}</p>
          </div>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-[#111b2e] border border-[#1a2a45] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-300 font-medium">Delivery Rate</span>
            <span className="text-sm font-bold text-orange-400">{deliveryRate}%</span>
          </div>
          <div className="h-2.5 bg-[#0a0e1a] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-500" style={{ width: `${deliveryRate}%` }} />
          </div>
        </div>
        <div className="bg-[#111b2e] border border-[#1a2a45] rounded-2xl p-5">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Route Status</h3>
          <div className="space-y-2.5">
            {[
              { label: 'Dispatched / In Progress', count: s.dispatched, color: 'bg-blue-500' },
              { label: 'Completed', count: s.completed, color: 'bg-green-500' },
              { label: 'Pending Review', count: Math.max(0, s.totalRoutes - s.dispatched - s.completed), color: 'bg-yellow-500' },
            ].map(row => (
              <div key={row.label} className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${row.color}`} />
                <span className="text-sm text-gray-400 flex-1">{row.label}</span>
                <span className="text-sm font-semibold text-white">{row.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

// Settings — account, security, WooCommerce (admin)
const SettingsScreen = ({ user, onLogout, onUserUpdate }) => {
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  const [panel, setPanel] = useState('home');
  const [displayName, setDisplayName] = useState(user?.name || '');
  useEffect(() => { setDisplayName(user?.name || ''); }, [user?.name]);

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState('');

  const [wooStores, setWooStores] = useState([]);
  const [wooForm, setWooForm] = useState({ name: '', url: '', consumer_key: '', consumer_secret: '' });
  const [wooLoading, setWooLoading] = useState(false);
  const [wooMsg, setWooMsg] = useState('');
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');
  const [profileMsg, setProfileMsg] = useState('');

  const token = localStorage.getItem('xruto_token');
  const authHeaders = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };

  const loadWooStores = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/woo-stores`, { headers: authHeaders });
      const data = await res.json();
      if (data.success) setWooStores(data.stores || []);
    } catch { /* noop */ }
  };
  useEffect(() => { if (panel === 'woocommerce' && user?.role === 'admin') loadWooStores(); }, [panel, user?.role]);

  const saveProfileName = () => {
    const name = displayName.trim();
    if (!name) { setProfileMsg('Please enter a name'); return; }
    onUserUpdate?.({ name });
    setProfileMsg('Display name saved on this device.');
    setTimeout(() => setProfileMsg(''), 3000);
  };

  const submitPasswordChange = async () => {
    setPwMsg('');
    if (!currentPw || !newPw) { setPwMsg('Fill in all password fields'); return; }
    if (newPw !== confirmPw) { setPwMsg('New passwords do not match'); return; }
    if (newPw.length < 6) { setPwMsg('New password must be at least 6 characters'); return; }
    setPwLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Request failed');
      setPwMsg('Password updated successfully.');
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
    } catch (e) {
      setPwMsg(e.message || 'Failed to change password');
    } finally {
      setPwLoading(false);
    }
  };

  const addWooStore = async () => {
    if (!wooForm.name || !wooForm.url || !wooForm.consumer_key || !wooForm.consumer_secret) { setWooMsg('All fields are required'); return; }
    setWooLoading(true); setWooMsg('');
    try {
      const res = await fetch(`${API_BASE}/admin/woo-stores`, { method: 'POST', headers: authHeaders, body: JSON.stringify(wooForm) });
      const data = await res.json();
      if (data.success) {
        setWooForm({ name: '', url: '', consumer_key: '', consumer_secret: '' });
        setWooMsg('Store added successfully');
        loadWooStores();
      } else {
        setWooMsg(data.message || 'Failed');
      }
    } catch (e) { setWooMsg('Error: ' + e.message); }
    setWooLoading(false);
  };

  const removeWooStore = async (storeId) => {
    try {
      await fetch(`${API_BASE}/admin/woo-stores/${storeId}`, { method: 'DELETE', headers: authHeaders });
      loadWooStores();
    } catch { /* noop */ }
  };

  const syncWooOrders = async () => {
    setSyncLoading(true); setSyncMsg('');
    try {
      const res = await fetch(`${API_BASE}/orders/sync-woocommerce`, { method: 'POST', headers: authHeaders });
      const data = await res.json();
      if (data.success) setSyncMsg(`Synced ${data.imported_count || 0} orders from ${data.stores_synced || 0} stores`);
      else setSyncMsg(data.message || 'Sync failed');
    } catch (e) { setSyncMsg('Error: ' + e.message); }
    setSyncLoading(false);
  };

  const inputCls = 'w-full bg-[#0a0e1a] border border-[#1a2a45] rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500/50';

  const BackLink = () => (
    <button
      type="button"
      onClick={() => { setPanel('home'); setPwMsg(''); setProfileMsg(''); setWooMsg(''); setSyncMsg(''); }}
      className="mb-4 flex items-center gap-2 text-xs font-medium text-gray-500 transition hover:text-orange-400"
    >
      <span className="text-lg leading-none">←</span> Back
    </button>
  );

  const MenuRow = ({ icon, label, hint, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3.5 text-left transition hover:border-orange-500/20 hover:bg-white/[0.04]"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0a0e1a] text-gray-300 ring-1 ring-white/10">
          <Ico d={icon} className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-white">{label}</p>
          {hint && <p className="text-xs text-gray-500">{hint}</p>}
        </div>
      </div>
      <Ico d={ICONS.chevronR} className="h-4 w-4 shrink-0 text-gray-600" />
    </button>
  );

  return (
    <div className="min-h-screen pb-24 md:pb-10">
      <header className="sticky top-0 z-10 border-b border-[#1a2a45] bg-[#0a0e1a]/95 backdrop-blur-xl">
        <div className="mx-auto max-w-2xl px-4 py-4 sm:px-6 md:px-8 md:py-5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">xRuto · Account</p>
          <h2 className="mt-0.5 text-xl font-bold tracking-tight text-white md:text-2xl">
            {panel === 'home' ? 'Settings' : panel === 'profile' ? 'Profile' : panel === 'password' ? 'Security' : 'WooCommerce'}
          </h2>
          <p className="mt-0.5 text-sm text-gray-500">
            {panel === 'home' ? 'Profile, password, and integrations' : panel === 'password' ? 'Change your account password' : panel === 'woocommerce' ? 'Connect stores and sync orders' : 'How you appear in the app'}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-2xl space-y-5 px-4 py-6 sm:px-6 md:px-8">
        {panel === 'home' && (
          <>
            <div className="glass-card flex flex-col items-center rounded-2xl border border-white/10 px-6 py-8 text-center">
              <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500">Signed in</div>
              <div className="mt-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-xl font-bold text-white shadow-lg shadow-orange-500/25">
                {initials}
              </div>
              <p className="mt-3 text-base font-semibold text-white">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500">{user?.role === 'admin' ? 'Administrator' : 'Driver'}</p>
              {user?.email && <p className="mt-2 max-w-full truncate text-xs text-gray-600">{user.email}</p>}
            </div>

            <div className="space-y-2">
              <MenuRow icon={ICONS.edit} label="Profile" hint="Display name shown in the app" onClick={() => setPanel('profile')} />
              <MenuRow icon={ICONS.shield} label="Change password" hint="Update your sign-in password" onClick={() => setPanel('password')} />
              <MenuRow icon={ICONS.phone} label="Contact" hint="support@xruto.com · Mon–Fri 9–5" onClick={() => setPanel('contact')} />
              {user?.role === 'admin' && (
                <MenuRow icon={ICONS.orders} label="WooCommerce" hint="Store keys and order sync" onClick={() => setPanel('woocommerce')} />
              )}
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 py-3 text-sm font-medium text-red-300 transition hover:bg-red-500/15"
            >
              <Ico d={ICONS.logout} className="h-4 w-4" />
              Log out
            </button>
          </>
        )}

        {panel === 'profile' && (
          <div>
            <BackLink />
            <div className="glass-card rounded-2xl border border-white/10 p-5 sm:p-6">
              <label className="mb-1.5 block text-xs font-medium text-gray-500">Display name</label>
              <input className={inputCls} value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name" />
              <p className="mt-2 text-xs text-gray-600">Saved in this browser with your session. For full account changes, contact your admin.</p>
              <button
                type="button"
                onClick={saveProfileName}
                className="mt-4 w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 py-2.5 text-sm font-semibold text-black transition hover:brightness-110"
              >
                Save display name
              </button>
              {profileMsg && <p className={`mt-2 text-xs ${profileMsg.includes('saved') ? 'text-emerald-400' : 'text-red-400'}`}>{profileMsg}</p>}
            </div>
          </div>
        )}

        {panel === 'password' && (
          <div>
            <BackLink />
            <div className="glass-card rounded-2xl border border-white/10 p-5 sm:p-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-500">Current password</label>
                <input type="password" className={inputCls} value={currentPw} onChange={e => setCurrentPw(e.target.value)} autoComplete="current-password" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-500">New password</label>
                <input type="password" className={inputCls} value={newPw} onChange={e => setNewPw(e.target.value)} autoComplete="new-password" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-500">Confirm new password</label>
                <input type="password" className={inputCls} value={confirmPw} onChange={e => setConfirmPw(e.target.value)} autoComplete="new-password" />
              </div>
              <button
                type="button"
                disabled={pwLoading}
                onClick={submitPasswordChange}
                className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 py-2.5 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-50"
              >
                {pwLoading ? 'Updating…' : 'Update password'}
              </button>
              {pwMsg && <p className={`text-xs ${pwMsg.includes('success') ? 'text-emerald-400' : 'text-red-400'}`}>{pwMsg}</p>}
            </div>
          </div>
        )}

        {panel === 'contact' && (
          <div>
            <BackLink />
            <div className="glass-card rounded-2xl border border-white/10 p-5 sm:p-6 space-y-3 text-sm text-gray-400">
              <p>For product support, billing, or technical help, email <span className="text-orange-400/90">support@xruto.com</span>.</p>
              <p className="text-xs text-gray-600">Response times are typically one business day.</p>
            </div>
          </div>
        )}

        {panel === 'woocommerce' && user?.role === 'admin' && (
          <div>
            <BackLink />
            <div className="glass-card space-y-4 rounded-2xl border border-white/10 p-5 sm:p-6">
              <div>
                <h3 className="text-sm font-semibold text-white">Connected stores</h3>
                <p className="text-xs text-gray-500">REST API keys from WooCommerce → Settings → Advanced → REST API</p>
              </div>
              {wooStores.length === 0 ? (
                <p className="text-xs text-gray-600">No stores yet. Add credentials below.</p>
              ) : (
                <div className="space-y-2">
                  {wooStores.map(store => (
                    <div key={store.id} className="flex items-center justify-between gap-3 rounded-xl border border-[#1a2a45] bg-[#0a0e1a] px-4 py-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white">{store.name}</p>
                        <p className="truncate text-xs text-gray-500">{store.url}</p>
                      </div>
                      <button type="button" onClick={() => removeWooStore(store.id)} className="shrink-0 rounded-lg px-2 py-1 text-xs text-red-400 hover:bg-red-500/10">
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="border-t border-white/5 pt-4 space-y-3">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Add store</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input className={inputCls} placeholder="Store name" value={wooForm.name} onChange={e => setWooForm(f => ({ ...f, name: e.target.value }))} />
                  <input className={inputCls} placeholder="https://yourstore.com" value={wooForm.url} onChange={e => setWooForm(f => ({ ...f, url: e.target.value }))} />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input className={inputCls} placeholder="Consumer key" value={wooForm.consumer_key} onChange={e => setWooForm(f => ({ ...f, consumer_key: e.target.value }))} />
                  <input className={inputCls} type="password" placeholder="Consumer secret" value={wooForm.consumer_secret} onChange={e => setWooForm(f => ({ ...f, consumer_secret: e.target.value }))} />
                </div>
                <SlideButton label="Slide to add store" onConfirm={addWooStore} loading={wooLoading} />
                {wooMsg && <p className={`text-xs ${wooMsg.includes('success') ? 'text-emerald-400' : 'text-red-400'}`}>{wooMsg}</p>}
              </div>
              {wooStores.length > 0 && (
                <div className="border-t border-white/5 pt-4">
                  <SlideButton label="Slide to sync orders" onConfirm={syncWooOrders} loading={syncLoading} />
                  {syncMsg && <p className={`mt-2 text-xs ${syncMsg.includes('Error') || syncMsg.toLowerCase().includes('fail') ? 'text-red-400' : 'text-emerald-400'}`}>{syncMsg}</p>}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main App — sidebar on desktop, bottom nav on mobile
const App = () => {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('admin');
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('xruto_token');
    const savedUser = localStorage.getItem('xruto_user');
    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        if (parsedUser.role === 'driver') setCurrentView('routes');
        fetch(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${savedToken}` } })
          .then(r => r.json()).then(data => { if (!data.success) doLogout(); }).catch(() => {});
      } catch { doLogout(); }
    }
    setAuthChecked(true);
  }, []);

  const handleLogin = useCallback((userData) => {
    setUser(userData);
    setCurrentView(userData.role === 'driver' ? 'routes' : 'admin');
  }, []);

  const doLogout = useCallback(() => {
    localStorage.removeItem('xruto_token');
    localStorage.removeItem('xruto_user');
    setUser(null);
    setCurrentView('admin');
  }, []);

  const updateLocalUser = useCallback((partial) => {
    setUser((u) => {
      if (!u) return u;
      const next = { ...u, ...partial };
      localStorage.setItem('xruto_user', JSON.stringify(next));
      return next;
    });
  }, []);

  if (!authChecked) return <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center"><div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" /></div>;
  if (!user) return <LoginScreen onLogin={handleLogin} />;

  const isAdmin = user.role === 'admin';

  const renderContent = () => {
    if (!isAdmin && currentView !== 'analytics' && currentView !== 'settings') return <DriverRoutes />;
    switch (currentView) {
      case 'admin':     return <MyAdmin onNavigateToDashboard={() => setCurrentView('admin')} />;
      case 'orders':    return <Orders onNavigateBack={() => setCurrentView('admin')} onNavigateToRouteDetail={() => setCurrentView('routes')} />;
      case 'routes':    return <DriverRoutes />;
      case 'analytics': return <AnalyticsScreen />;
      case 'settings':  return <SettingsScreen user={user} onLogout={doLogout} onUserUpdate={updateLocalUser} />;
      default:          return isAdmin ? <MyAdmin /> : <DriverRoutes />;
    }
  };

  return (
    <div className="bg-[#0a0e1a] min-h-screen flex text-white">
      {/* Desktop sidebar */}
      <SideNav currentView={currentView} onChange={setCurrentView} isAdmin={isAdmin} user={user} onLogout={doLogout} />

      {/* Main content area */}
      <main className="flex-1 overflow-y-auto pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:pb-0 min-h-screen">
        {renderContent()}
      </main>

      {/* Mobile bottom nav */}
      <BottomNav currentView={currentView} onChange={setCurrentView} isAdmin={isAdmin} />
      <PWAInstallPrompt />
    </div>
  );
};

export default App;