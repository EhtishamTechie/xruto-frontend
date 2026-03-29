
import React, { useState, useEffect, useCallback } from 'react';
import MyAdmin from './components/MyAdmin';
import Orders from './components/Orders';
import DriverRoutes from './components/DriverRoutes_IMPROVED';
import PWAInstallPrompt from './components/PWAInstallPrompt';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// â”€â”€â”€ Icon helper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const Icon = ({ d, className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
);
const ICONS = {
  admin:    'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
  orders:   'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  routes:   'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7',
  analytics:'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  settings: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
  logout:   'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
  user:     'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  eye:      'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
  eyeOff:   'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21',
  shield:   'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  truck:    'M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0',
  chart:    'M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
};

// â”€â”€â”€ Login Screen â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const LoginScreen = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please enter your email and password'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Login failed');
      localStorage.setItem('xruto_token', data.token);
      localStorage.setItem('xruto_user', JSON.stringify(data.user));
      onLogin(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D0B1F] via-[#111827] to-[#1a0a2e] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>
      <div className="relative w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-2xl shadow-orange-500/30 mb-4">
            <Icon d={ICONS.truck} className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">xRuto</h1>
          <p className="text-gray-400 mt-1 text-sm">Delivery Route Management</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-1">Welcome back</h2>
          <p className="text-gray-400 text-sm mb-7">Sign in to continue</p>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
                <span>âš </span> {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@xruto.com" autoComplete="email"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" autoComplete="current-password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition" />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition">
                  <Icon d={showPassword ? ICONS.eyeOff : ICONS.eye} className="w-5 h-5" />
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2">
              {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in...</> : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// â”€â”€â”€ Top Header Bar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const TopBar = ({ user, currentView, onLogout }) => {
  const [showMenu, setShowMenu] = useState(false);
  const viewLabels = {
    admin: 'Admin Dashboard', orders: 'Order Management',
    routes: 'Driver Routes', analytics: 'Analytics', settings: 'Settings'
  };
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  const isAdmin = user?.role === 'admin';

  return (
    <header className="bg-[#0D0B1F]/95 backdrop-blur-sm border-b border-white/8 sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Icon d={ICONS.truck} className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-white font-semibold text-sm">xRuto</span>
            <p className="text-gray-400 text-xs">{viewLabels[currentView] || 'Dashboard'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`hidden sm:inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${
            isAdmin ? 'text-orange-400 bg-orange-500/10 border-orange-500/20' : 'text-blue-400 bg-blue-500/10 border-blue-500/20'
          }`}>
            <Icon d={isAdmin ? ICONS.shield : ICONS.truck} className="w-3 h-3" />
            {isAdmin ? 'Admin' : 'Driver'}
          </span>
          <div className="relative">
            <button onClick={() => setShowMenu(v => !v)}
              className="flex items-center gap-2 bg-white/8 hover:bg-white/12 border border-white/10 rounded-xl px-3 py-2 transition">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-xs font-bold">
                {initials}
              </div>
              <span className="hidden sm:block text-sm text-gray-300 max-w-24 truncate">{user?.name}</span>
              <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full mt-2 w-60 bg-[#1a1830] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
                  <div className="px-4 py-4 border-b border-white/8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold">{initials}</div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-3 border-b border-white/8">
                    <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${isAdmin ? 'bg-orange-500/10 text-orange-400' : 'bg-blue-500/10 text-blue-400'}`}>
                      <Icon d={isAdmin ? ICONS.shield : ICONS.truck} className="w-4 h-4" />
                      <span className="font-medium">{isAdmin ? 'Administrator â€” Full access' : 'Driver â€” Routes & deliveries'}</span>
                    </div>
                  </div>
                  <button onClick={() => { setShowMenu(false); onLogout(); }}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-sm text-red-400 hover:bg-red-500/10 transition">
                    <Icon d={ICONS.logout} className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

// â”€â”€â”€ Bottom Navigation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const BottomNav = ({ currentView, onChange, isAdmin }) => {
  const adminTabs = [
    { id: 'admin',     label: 'Admin',    icon: ICONS.admin    },
    { id: 'orders',    label: 'Orders',   icon: ICONS.orders   },
    { id: 'routes',    label: 'Routes',   icon: ICONS.routes   },
    { id: 'analytics', label: 'Analytics',icon: ICONS.analytics },
    { id: 'settings',  label: 'Settings', icon: ICONS.settings  },
  ];
  const driverTabs = [
    { id: 'routes', label: 'My Routes', icon: ICONS.routes },
  ];
  const tabs = isAdmin ? adminTabs : driverTabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0D0B1F]/95 backdrop-blur-sm border-t border-white/8 z-20">
      <div className={`grid gap-1 px-2 py-2 ${isAdmin ? 'grid-cols-5' : 'grid-cols-1 max-w-xs mx-auto'}`}>
        {tabs.map(tab => {
          const active = currentView === tab.id;
          return (
            <button key={tab.id} onClick={() => onChange(tab.id)}
              className={`flex flex-col items-center gap-1 py-1.5 px-1 rounded-xl transition-all duration-200 ${active ? 'bg-orange-500/15' : 'hover:bg-white/5'}`}>
              <Icon d={tab.icon} className={`w-5 h-5 transition-transform duration-200 ${active ? 'text-orange-400 scale-110' : 'text-gray-500'}`} />
              <span className={`text-xs font-medium leading-none ${active ? 'text-orange-400' : 'text-gray-500'}`}>{tab.label}</span>
              {active && <div className="w-1 h-1 rounded-full bg-orange-500" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

// â”€â”€â”€ Analytics Screen â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const AnalyticsScreen = () => (
  <div className="p-4 space-y-4">
    <h2 className="text-xl font-bold text-white">Analytics</h2>
    <div className="grid grid-cols-2 gap-3">
      {[
        { label: 'Total Routes', value: 'â€”', sub: 'All time' },
        { label: 'Delivered', value: 'â€”', sub: 'Today' },
        { label: 'Avg Duration', value: 'â€”', sub: 'Per route' },
        { label: 'Pending', value: 'â€”', sub: 'Orders' },
      ].map(s => (
        <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <p className="text-2xl font-bold text-white">{s.value}</p>
          <p className="text-sm text-gray-300 mt-0.5">{s.label}</p>
          <p className="text-xs text-gray-500">{s.sub}</p>
        </div>
      ))}
    </div>
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
      <Icon d={ICONS.chart} className="w-12 h-12 text-orange-400/40 mx-auto mb-3" />
      <p className="text-gray-400 text-sm">Route analytics will appear after dispatch</p>
      <span className="mt-3 inline-block text-xs text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">Coming soon</span>
    </div>
  </div>
);

// â”€â”€â”€ Settings Screen â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const SettingsScreen = ({ user, onLogout }) => {
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold text-white">Settings</h2>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4">
        <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0">{initials}</div>
        <div className="min-w-0">
          <p className="text-white font-semibold">{user?.name}</p>
          <p className="text-gray-400 text-sm truncate">{user?.email}</p>
          <span className="inline-flex items-center gap-1 mt-1 text-xs text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full">
            <Icon d={ICONS.shield} className="w-3 h-3" />
            {user?.role === 'admin' ? 'Administrator' : 'Driver'}
          </span>
        </div>
      </div>
      {['Change Password', 'Notification Preferences', 'WooCommerce Integration', 'API Configuration'].map(item => (
        <div key={item} className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 flex items-center justify-between">
          <span className="text-gray-300 text-sm">{item}</span>
          <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-full">Soon</span>
        </div>
      ))}
      <button onClick={onLogout}
        className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-medium py-3.5 rounded-2xl transition mt-2">
        <Icon d={ICONS.logout} className="w-4 h-4" />Sign out
      </button>
    </div>
  );
};

// â”€â”€â”€ Main App â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
        // Background token validation
        fetch(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${savedToken}` } })
          .then(r => r.json())
          .then(data => { if (!data.success) doLogout(); })
          .catch(() => {});
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

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#0D0B1F] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <LoginScreen onLogin={handleLogin} />;

  const isAdmin = user.role === 'admin';

  const renderContent = () => {
    if (!isAdmin) return <DriverRoutes />;
    switch (currentView) {
      case 'admin':     return <MyAdmin onNavigateToDashboard={() => setCurrentView('admin')} />;
      case 'orders':    return <Orders onNavigateBack={() => setCurrentView('admin')} onNavigateToRouteDetail={() => setCurrentView('routes')} />;
      case 'routes':    return <DriverRoutes />;
      case 'analytics': return <AnalyticsScreen />;
      case 'settings':  return <SettingsScreen user={user} onLogout={doLogout} />;
      default:          return <MyAdmin onNavigateToDashboard={() => setCurrentView('admin')} />;
    }
  };

  return (
    <div className="bg-[#0D0B1F] min-h-screen flex flex-col text-white">
      <TopBar user={user} currentView={currentView} onLogout={doLogout} />
      <main className="flex-1 overflow-y-auto pb-20">
        {renderContent()}
      </main>
      <BottomNav currentView={currentView} onChange={setCurrentView} isAdmin={isAdmin} />
      <PWAInstallPrompt />
    </div>
  );
};

export default App;
