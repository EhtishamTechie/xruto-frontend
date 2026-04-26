import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Toggle } from '../ui/Toggle';
import { StatCard } from '../ui/StatCard';
import { SlideToConfirm } from '../ui/SlideToConfirm';
import { EmptyState } from '../ui/EmptyState';
import { useToast } from '../ui/ToastContext.jsx';
import { Settings, Users, MapPinned, Truck, Warehouse, UserCircle2 } from 'lucide-react';

const Ico = ({ d, className = 'w-5 h-5', fill = false }) => (
  <svg className={className} fill={fill ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke={fill ? 'none' : 'currentColor'} strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
);

const ICON = {
  info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  chevDown: 'M19 9l-7 7-7-7',
  trash: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
  edit: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z',
  save: 'M5 13l4 4L19 7',
  cancel: 'M6 18L18 6M6 6l12 12',
  user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  mail: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  building: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  location: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z',
  phone: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
};

// Toggle moved to ui/Toggle

const Radio = ({ checked, onChange, disabled, label, sublabel }) => (
  <div className={`flex items-center gap-3 ${disabled ? 'opacity-50' : 'cursor-pointer'}`} onClick={() => !disabled && onChange()}>
    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${checked ? 'border-xr-brand' : 'border-gray-600'}`}>
      {checked && <div className="w-2.5 h-2.5 bg-xr-brand rounded-full" />}
    </div>
    <div><p className="text-sm font-medium text-white">{label}</p>{sublabel && <p className="text-xs text-gray-500">{sublabel}</p>}</div>
  </div>
);

const Stepper = ({ label, value, onChange, disabled, helpText, min = 1, max = 100 }) => (
  <div className="bg-xr-bg border border-xr-line rounded-xl p-4">
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-1.5">
        <span className="text-sm text-gray-300">{label}</span>
        {helpText && <Ico d={ICON.info} className="w-3.5 h-3.5 text-gray-600" />}
      </div>
      <div className="flex items-center gap-2 bg-xr-panel rounded-lg p-0.5">
        <button onClick={() => !disabled && onChange(Math.max(min, value - 1))} disabled={disabled || value <= min}
          className="flex h-8 w-8 items-center justify-center rounded-md bg-xr-elevated text-lg text-white transition hover:bg-xr-line disabled:opacity-30">-</button>
        <span className="w-8 text-center text-sm font-bold text-white">{value}</span>
        <button onClick={() => !disabled && onChange(Math.min(max, value + 1))} disabled={disabled || value >= max}
          className="flex h-8 w-8 items-center justify-center rounded-md bg-xr-elevated text-lg text-white transition hover:bg-xr-line disabled:opacity-30">+</button>
      </div>
    </div>
  </div>
);

const Dropdown = ({ value, options, onChange, disabled, placeholder }) => {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);
  return (
    <div className="relative">
      <div onClick={() => !disabled && setOpen(!open)}
        className="bg-xr-bg border border-xr-line rounded-xl px-4 py-3 flex justify-between items-center cursor-pointer">
        <span className="text-sm text-gray-400">{selected?.label || placeholder}</span>
        <Ico d={ICON.chevDown} className={`w-4 h-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </div>
      {open && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-xr-panel border border-xr-line rounded-xl shadow-xl z-20 max-h-48 overflow-y-auto">
          {options.map(opt => (
            <div key={opt.value} onClick={() => { onChange(opt.value); setOpen(false); }}
              className="cursor-pointer px-4 py-2.5 text-sm text-white transition hover:bg-xr-elevated">
              {opt.label}{opt.sub && <span className="text-xs text-gray-500 ml-2">{opt.sub}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const inputCls = 'w-full bg-xr-bg border border-xr-line rounded-xl px-4 py-3 text-white text-sm placeholder-xr-subtle focus:outline-none focus:border-xr-brand/50 transition';

const SectionCard = ({ title, subtitle, children, className = '' }) => (
  <Card variant="glass" className={`p-5 sm:p-6 ${className}`}>
    {(title || subtitle) && (
      <header className="mb-4 border-b border-white/5 pb-3 sm:mb-5 sm:pb-4">
        {title && <h2 className="text-sm font-semibold tracking-tight text-white sm:text-base">{title}</h2>}
        {subtitle && <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">{subtitle}</p>}
      </header>
    )}
    {children}
  </Card>
);

// Stat tiles replaced by ui/StatCard

const MyAdmin = ({ onNavigateToOrders }) => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({});
  const [depots, setDepots] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [syncFlash, setSyncFlash] = useState(false);
  const [helpEnabled, setHelpEnabled] = useState(true);
  const [showTooltip, setShowTooltip] = useState(null);
  const [newDepot, setNewDepot] = useState({ name: '', address: '', city: '', postcode: '', capacity: '', contactPhone: '', contactEmail: '' });
  const [newDriver, setNewDriver] = useState({ firstName: '', lastName: '', email: '', password: '', phone: '', depotId: '', mpg: '', vehicleType: 'van', vehicleCapacity: '50', licensePlate: '', workingHours: '{"start": "08:00", "end": "18:00"}', maxRoutesPerDay: '3', notes: '' });
  const [editingDriver, setEditingDriver] = useState(null);
  const [editDriverData, setEditDriverData] = useState({});
  const [editingDepot, setEditingDepot] = useState(null);
  const [editDepotData, setEditDepotData] = useState({});
  const [showAddDepot, setShowAddDepot] = useState(false);
  const [showAddDriver, setShowAddDriver] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => { loadAdminData(); }, []);

  useEffect(() => {
    if (!syncFlash) return;
    const t = window.setTimeout(() => setSyncFlash(false), 2500);
    return () => window.clearTimeout(t);
  }, [syncFlash]);

  useEffect(() => {
    if (!error) return;
    toast.error(error);
    setError('');
  }, [error, toast]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [sd, dd, drd] = await Promise.all([adminAPI.getSettings(), adminAPI.getDepots(), adminAPI.getDrivers()]);
      setSettings(sd.settings); setDepots(dd.depots); setDrivers(drd.drivers);
      setHelpEnabled(sd.settings.enable_help_tooltips !== false);
    } catch (e) { setError('Failed to load admin data: ' + e.message); }
    finally { setLoading(false); }
  };

  const handleSettingChange = async (key, value) => {
    try { setSaving(true); await adminAPI.updateSettings({ [key]: value }); setSettings(prev => ({ ...prev, [key]: value }));
      if (key === 'enable_help_tooltips') setHelpEnabled(value);
      toast.success('Settings updated');
      setSyncFlash(true);
    } catch (e) { setError('Failed: ' + e.message); } finally { setSaving(false); }
  };

  const handleAddDepot = async () => {
    if (!newDepot.name || !newDepot.address) { setError('Depot name and address required'); return; }
    try { setSaving(true); await adminAPI.addDepot(newDepot);
      setNewDepot({ name: '', address: '', city: '', postcode: '', capacity: '', contactPhone: '', contactEmail: '' });
      setShowAddDepot(false); await loadAdminData(); toast.success('Depot added'); setSyncFlash(true);
    } catch (e) { setError('Failed: ' + e.message); } finally { setSaving(false); }
  };

  const handleEditDepot = (depot) => {
    setEditingDepot(depot.id);
    setEditDepotData({ name: depot.name || '', address: depot.address || '', city: depot.city || '', postcode: depot.postcode || '', capacity: depot.capacity || '', contactPhone: depot.contact_phone || '', contactEmail: depot.contact_email || '' });
  };

  const handleSaveDepotEdit = async () => {
    try { setSaving(true); await adminAPI.updateDepot(editingDepot, editDepotData); setEditingDepot(null); setEditDepotData({}); await loadAdminData();
      toast.success('Depot updated'); setSyncFlash(true);
    } catch (e) { setError('Failed: ' + e.message); } finally { setSaving(false); }
  };

  const handleRemoveDepot = async (depotId) => {
    if (!confirm('Remove this depot?')) return;
    try { setSaving(true); await adminAPI.removeDepot(depotId); await loadAdminData(); toast.success('Depot removed'); setSyncFlash(true);
    } catch (e) { setError('Failed: ' + e.message); } finally { setSaving(false); }
  };

  const handleAddDriver = async () => {
    if (!newDriver.firstName || !newDriver.lastName || !newDriver.email) { setError('Driver name and email required'); return; }
    try { setSaving(true);
      await adminAPI.addDriver({ firstName: newDriver.firstName, lastName: newDriver.lastName, email: newDriver.email, password: newDriver.password || null, phone: newDriver.phone, depotId: newDriver.depotId || null, mpg: newDriver.mpg ? parseFloat(newDriver.mpg) : null, vehicleType: newDriver.vehicleType, vehicleCapacity: newDriver.vehicleCapacity ? parseInt(newDriver.vehicleCapacity) : null, licensePlate: newDriver.licensePlate, workingHours: newDriver.workingHours, maxRoutesPerDay: newDriver.maxRoutesPerDay ? parseInt(newDriver.maxRoutesPerDay) : null, notes: newDriver.notes });
      setNewDriver({ firstName: '', lastName: '', email: '', password: '', phone: '', depotId: '', mpg: '', vehicleType: 'van', vehicleCapacity: '50', licensePlate: '', workingHours: '{"start": "08:00", "end": "18:00"}', maxRoutesPerDay: '3', notes: '' });
      setShowAddDriver(false); await loadAdminData(); toast.success('Driver added'); setSyncFlash(true);
    } catch (e) { setError('Failed: ' + e.message); } finally { setSaving(false); }
  };

  const handleEditDriver = (driver) => {
    setEditingDriver(driver.id);
    setEditDriverData({ firstName: driver.first_name || driver.name?.split(' ')[0] || '', lastName: driver.last_name || driver.name?.split(' ').slice(1).join(' ') || '', email: driver.email || '', phone: driver.phone || '', depotId: driver.depot_id || '', mpg: driver.mpg || '', vehicleType: driver.vehicle_type || 'van', vehicleCapacity: driver.vehicle_capacity || '', licensePlate: driver.license_plate || '', notes: driver.notes || '' });
  };

  const handleSaveDriverEdit = async () => {
    try { setSaving(true); await adminAPI.updateDriver(editingDriver, editDriverData); setEditingDriver(null); setEditDriverData({}); await loadAdminData();
      toast.success('Driver updated'); setSyncFlash(true);
    } catch (e) { setError('Failed: ' + e.message); } finally { setSaving(false); }
  };

  const handleRemoveDriver = async (driverId) => {
    if (!confirm('Remove this driver?')) return;
    try { setSaving(true); await adminAPI.removeDriver(driverId); await loadAdminData(); toast.success('Driver removed'); setSyncFlash(true);
    } catch (e) { setError('Failed: ' + e.message); } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-xr-brand/30 border-t-xr-brand" />
    </div>
  );

  const DepotCard = ({ depot }) => editingDepot === depot.id ? (
    <div className="space-y-3 rounded-card border border-xr-info/30 bg-xr-surface/80 p-4">
      <div className="flex justify-between items-center"><span className="text-sm font-medium text-blue-400">Editing Depot</span>
        <div className="flex gap-2">
          <button onClick={handleSaveDepotEdit} className="text-xs text-green-400 bg-green-500/10 px-3 py-1.5 rounded-lg">Save</button>
          <button onClick={() => { setEditingDepot(null); setEditDepotData({}); }} className="text-xs text-gray-400 bg-gray-500/10 px-3 py-1.5 rounded-lg">Cancel</button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input className={inputCls} placeholder="Depot Name" value={editDepotData.name || ''} onChange={e => setEditDepotData(p => ({ ...p, name: e.target.value }))} />
        <input className={inputCls} placeholder="City" value={editDepotData.city || ''} onChange={e => setEditDepotData(p => ({ ...p, city: e.target.value }))} />
      </div>
      <input className={inputCls} placeholder="Address" value={editDepotData.address || ''} onChange={e => setEditDepotData(p => ({ ...p, address: e.target.value }))} />
      <div className="grid grid-cols-3 gap-3">
        <input className={inputCls} placeholder="Postcode" value={editDepotData.postcode || ''} onChange={e => setEditDepotData(p => ({ ...p, postcode: e.target.value }))} />
        <input className={inputCls} type="number" placeholder="Capacity" value={editDepotData.capacity || ''} onChange={e => setEditDepotData(p => ({ ...p, capacity: e.target.value }))} />
        <input className={inputCls} placeholder="Phone" value={editDepotData.contactPhone || ''} onChange={e => setEditDepotData(p => ({ ...p, contactPhone: e.target.value }))} />
      </div>
    </div>
  ) : (
    <div className="flex items-start justify-between rounded-card border border-white/10 bg-xr-bg/70 p-4">
      <div>
        <div className="mb-1 flex items-center gap-2">
          <span className="text-sm font-medium text-white">{depot.name}</span>
          {depot.is_primary && <span className="rounded-full bg-xr-brand/15 px-2 py-0.5 text-[10px] text-amber-200">Primary</span>}
        </div>
        <p className="text-xs text-xr-muted">{depot.address}</p>
        <p className="mt-1 text-xs text-xr-subtle">{depot.driver_count || 0} drivers &middot; Cap: {depot.capacity || 'N/A'}</p>
      </div>
      <div className="flex gap-2">
        <button onClick={() => handleEditDepot(depot)} className="text-blue-400 hover:text-blue-300 p-1"><Ico d={ICON.edit} className="w-4 h-4" /></button>
        <button onClick={() => handleRemoveDepot(depot.id)} className="text-red-400 hover:text-red-300 p-1"><Ico d={ICON.trash} className="w-4 h-4" /></button>
      </div>
    </div>
  );

  const DriverCard = ({ driver }) => editingDriver === driver.id ? (
    <div className="space-y-3 rounded-card border border-xr-info/30 bg-xr-surface/80 p-4">
      <div className="flex justify-between items-center"><span className="text-sm font-medium text-blue-400">Editing Driver</span>
        <div className="flex gap-2">
          <button onClick={handleSaveDriverEdit} className="text-xs text-green-400 bg-green-500/10 px-3 py-1.5 rounded-lg">Save</button>
          <button onClick={() => { setEditingDriver(null); setEditDriverData({}); }} className="text-xs text-gray-400 bg-gray-500/10 px-3 py-1.5 rounded-lg">Cancel</button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input className={inputCls} placeholder="First Name" value={editDriverData.firstName || ''} onChange={e => setEditDriverData(p => ({ ...p, firstName: e.target.value }))} />
        <input className={inputCls} placeholder="Last Name" value={editDriverData.lastName || ''} onChange={e => setEditDriverData(p => ({ ...p, lastName: e.target.value }))} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input className={inputCls} type="email" placeholder="Email" value={editDriverData.email || ''} onChange={e => setEditDriverData(p => ({ ...p, email: e.target.value }))} />
        <input className={inputCls} placeholder="Phone" value={editDriverData.phone || ''} onChange={e => setEditDriverData(p => ({ ...p, phone: e.target.value }))} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Dropdown value={editDriverData.depotId || ''} options={[{ value: '', label: 'No Depot' }, ...depots.map(d => ({ value: d.id, label: d.name }))]} onChange={v => setEditDriverData(p => ({ ...p, depotId: v }))} placeholder="Depot" />
        <input className={inputCls} type="number" placeholder="MPG" value={editDriverData.mpg || ''} onChange={e => setEditDriverData(p => ({ ...p, mpg: e.target.value }))} />
        <input className={inputCls} placeholder="License Plate" value={editDriverData.licensePlate || ''} onChange={e => setEditDriverData(p => ({ ...p, licensePlate: e.target.value }))} />
      </div>
    </div>
  ) : (
    <div className="flex items-start justify-between rounded-card border border-white/10 bg-xr-bg/70 p-4">
      <div>
        <span className="text-sm font-medium text-white">{driver.name || `${driver.first_name || ''} ${driver.last_name || ''}`}</span>
        <p className="mt-0.5 text-xs text-xr-muted">{driver.email}</p>
        <p className="mt-0.5 text-xs text-xr-subtle">{driver.details || ''} {driver.mpg ? `| ${driver.mpg} MPG` : ''}</p>
      </div>
      <div className="flex gap-2">
        <button onClick={() => handleEditDriver(driver)} className="text-blue-400 hover:text-blue-300 p-1"><Ico d={ICON.edit} className="w-4 h-4" /></button>
        <button onClick={() => handleRemoveDriver(driver.id)} className="text-red-400 hover:text-red-300 p-1"><Ico d={ICON.trash} className="w-4 h-4" /></button>
      </div>
    </div>
  );

  const adminTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'operations', label: 'Operations' },
    { id: 'fleet', label: 'Fleet' },
    { id: 'integrations', label: 'Integrations' },
  ];
  const navAppLabel = settings.navigation_app_preference === 'here' ? 'HERE Maps' : 'Google Maps';

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-card border border-xr-brand/25 bg-gradient-to-br from-xr-elevated/90 via-xr-surface/95 to-xr-bg p-6 shadow-panel sm:p-8">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-xr-brand/10 blur-3xl" />
        <div className="relative mx-auto max-w-section">
          <p className="text-caption font-medium uppercase tracking-wider text-xr-brand">Control center</p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-white sm:text-display sm:leading-[1.1]">
            Run operations from one place
          </h1>
          <p className="mt-3 max-w-readable text-sm text-xr-muted sm:text-body">
            Tune depots, drivers, and routing—then move the day through the Orders pipeline when you are ready.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button type="button" variant="primary" className="min-h-11 px-5" onClick={() => onNavigateToOrders?.()}>
              Open order pipeline
            </Button>
            <Button type="button" variant="secondary" className="min-h-11" onClick={() => setActiveSection('fleet')}>
              Manage fleet
            </Button>
          </div>
        </div>
      </div>

      {/* Local page controls (AppShell already provides global title/breadcrumb) */}
      <Card variant="soft" className="p-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Segmented tabs */}
          <div className="inline-flex w-full overflow-x-auto rounded-control border border-white/10 bg-white/[0.03] p-1 md:w-auto">
            {adminTabs.map((tab) => {
              const active = activeSection === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveSection(tab.id)}
                  className={`whitespace-nowrap rounded-control px-4 py-2 text-sm font-medium transition ${
                    active
                      ? 'bg-white/[0.06] text-white ring-1 ring-inset ring-xr-brand/20'
                      : 'text-xr-secondary hover:text-xr-text'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Status + actions */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-control border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-xr-secondary">
              <span className={`h-1.5 w-1.5 rounded-full ${saving ? 'animate-pulse bg-amber-300' : 'bg-emerald-300'}`} aria-hidden />
              {saving ? 'Saving…' : syncFlash ? 'Synced' : 'In sync'}
            </span>
            <button
              type="button"
              onClick={() => setHelpEnabled(!helpEnabled)}
              className={`rounded-control border px-3 py-2 text-xs font-semibold transition ${
                helpEnabled
                  ? 'border-xr-brand/25 bg-xr-brand/10 text-amber-200'
                  : 'border-white/10 bg-white/[0.03] text-xr-secondary hover:bg-white/[0.06]'
              }`}
            >
              {helpEnabled ? 'Hide tips' : 'Show tips'}
            </button>
          </div>
        </div>
      </Card>

        {showTooltip && (
          <div className="mt-4 flex justify-between gap-2 rounded-xl border border-blue-500/25 bg-blue-500/10 p-3 text-xs text-blue-300 sm:mt-5">
            <span>{showTooltip}</span>
            <button type="button" onClick={() => setShowTooltip(null)} className="shrink-0 text-blue-400/70 hover:text-blue-300" aria-label="Dismiss">
              &times;
            </button>
          </div>
        )}
        <div className="space-y-6">
          {activeSection === 'overview' && (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  icon={<MapPinned className="h-4 w-4" />}
                  label="Depots"
                  value={depots.length}
                  hint="Active locations"
                  tone="info"
                />
                <StatCard
                  icon={<Users className="h-4 w-4" />}
                  label="Drivers"
                  value={drivers.length}
                  hint="Fleet roster"
                  tone="success"
                />
                <StatCard
                  icon={<Settings className="h-4 w-4" />}
                  label="Nav app"
                  value={navAppLabel}
                  hint="Default for routes"
                  tone="brand"
                />
                <StatCard
                  icon={<Truck className="h-4 w-4" />}
                  label="Drivers today"
                  value={String(settings.drivers_today_count ?? 3)}
                  hint="Planned headcount"
                  tone="brand"
                />
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <SectionCard title="At a glance" subtitle="Key operational switches">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="flex items-center justify-between gap-3 rounded-card border border-white/10 bg-white/[0.03] p-4">
                        <div>
                          <p className="text-xs font-medium text-gray-400">Auto-assign routes</p>
                          <p className="text-[11px] text-gray-600">Distribute work automatically when possible</p>
                        </div>
                        <Toggle checked={settings.auto_assign_routes || false} onChange={v => handleSettingChange('auto_assign_routes', v)} disabled={saving} />
                      </div>
                      <div className="flex items-center justify-between gap-3 rounded-card border border-white/10 bg-white/[0.03] p-4">
                        <div>
                          <p className="text-xs font-medium text-gray-400">Stock refill logic</p>
                          <p className="text-[11px] text-gray-600">Enable depot return handling</p>
                        </div>
                        <Toggle checked={settings.enable_stock_refill || false} onChange={v => handleSettingChange('enable_stock_refill', v)} disabled={saving} />
                      </div>
                      <div className="flex items-center justify-between gap-3 rounded-card border border-white/10 bg-white/[0.03] p-4 sm:col-span-2">
                        <div>
                          <p className="text-xs font-medium text-gray-400">Admin in delivery team</p>
                          <p className="text-[11px] text-gray-600">Include the admin user as a driver in planning</p>
                        </div>
                        <Toggle checked={settings.include_admin_as_driver || false} onChange={v => handleSettingChange('include_admin_as_driver', v)} disabled={saving} />
                      </div>
                    </div>
                  </SectionCard>
                </div>
                <SectionCard title="Next steps" subtitle="Work faster in this workspace">
                  <ol className="list-inside list-decimal space-y-2.5 text-sm text-gray-400">
                    <li>Fine-tune <button type="button" className="text-orange-400 hover:underline" onClick={() => setActiveSection('operations')}>operations</button> and fuel assumptions.</li>
                    <li>Keep <button type="button" className="text-orange-400 hover:underline" onClick={() => setActiveSection('fleet')}>depots and drivers</button> up to date.</li>
                    <li>Connect channels under <button type="button" className="text-orange-400 hover:underline" onClick={() => setActiveSection('integrations')}>integrations</button>.</li>
                  </ol>
                </SectionCard>
              </div>
            </>
          )}

          {activeSection === 'operations' && (
            <div className="grid gap-5 xl:grid-cols-2">
              <SectionCard title="Routing & capacity" subtitle="How routes are built and limited">
                <div className="space-y-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:py-1">
                    <span className="text-sm text-gray-300">How many drivers today</span>
                    <div className="w-full min-w-0 sm:max-w-[220px]">
                      <Dropdown
                        value={settings.drivers_today_count || 3}
                        options={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20].map(n => ({ value: n, label: `${n} driver${n > 1 ? 's' : ''}` }))}
                        onChange={v => handleSettingChange('drivers_today_count', v)}
                        disabled={saving}
                        placeholder="Select"
                      />
                    </div>
                  </div>
                  <div className="rounded-card border border-white/10 bg-white/[0.03] p-4">
                    <span className="text-sm font-medium text-gray-300">Preferred navigation app</span>
                    {helpEnabled && <p className="mb-2 mt-1 text-xs text-orange-400/80">Google Maps supports 25 stops, HERE Maps supports 50 stops per route</p>}
                    <div className="mt-2 space-y-2">
                      <Radio label="Google Maps" sublabel="25 Stops Per Route" checked={settings.navigation_app_preference === 'google'} onChange={() => handleSettingChange('navigation_app_preference', 'google')} disabled={saving} />
                      <Radio label="HERE Maps" sublabel="50 Stops Per Route" checked={settings.navigation_app_preference === 'here'} onChange={() => handleSettingChange('navigation_app_preference', 'here')} disabled={saving} />
                    </div>
                  </div>
                  <Stepper
                    label="Deliveries in one trip"
                    value={settings.max_deliveries_per_route || 25}
                    onChange={v => handleSettingChange('max_deliveries_per_route', v)}
                    disabled={saving}
                    helpText="Max deliveries per route"
                  />
                  <Stepper
                    label="Trips per day"
                    value={settings.max_routes_per_day || 10}
                    onChange={v => handleSettingChange('max_routes_per_day', v)}
                    disabled={saving}
                    helpText="Max routes daily"
                  />
                  <div className="flex items-center justify-between border-t border-white/5 pt-2">
                    <span className="text-sm text-gray-300">Auto-assign routes</span>
                    <Toggle checked={settings.auto_assign_routes || false} onChange={v => handleSettingChange('auto_assign_routes', v)} disabled={saving} />
                  </div>
                </div>
              </SectionCard>

              <div className="space-y-5">
                <SectionCard title="Fuel & cost" subtitle="Model spend for smarter optimisation">
                  <div>
                    <label className="mb-1.5 block text-xs text-gray-500">Fuel price per litre</label>
                    <div className="flex items-center rounded-xl border border-[#1a2a45] bg-[#0a0e1a] px-4 py-3">
                      <span className="mr-2 font-bold text-gray-500">&pound;</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={settings.default_fuel_price || '1.45'}
                        onChange={e => handleSettingChange('default_fuel_price', e.target.value)}
                        className="w-full bg-transparent text-sm text-white focus:outline-none"
                        disabled={saving}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:py-1">
                    <span className="text-sm text-gray-300">Route optimization</span>
                    <div className="w-full min-w-0 sm:max-w-[220px]">
                      <Dropdown
                        value={settings.route_optimization_method || 'distance'}
                        options={[
                          { value: 'distance', label: 'Distance' },
                          { value: 'time', label: 'Time' },
                          { value: 'fuel_cost', label: 'Fuel cost' },
                        ]}
                        onChange={v => handleSettingChange('route_optimization_method', v)}
                        disabled={saving}
                        placeholder="Method"
                      />
                    </div>
                  </div>
                  <div className="pt-1">
                    <SlideToConfirm
                      label={saving ? 'Saving…' : 'Slide to save configuration'}
                      onConfirm={() => {
                        toast.success('Configuration saved!');
                        setSyncFlash(true);
                      }}
                      loading={saving}
                    />
                  </div>
                </SectionCard>
                <SectionCard title="Inventory behaviour" subtitle="Refill and admin participation">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm text-gray-300">Enable stock refill logic</span>
                    <Toggle checked={settings.enable_stock_refill || false} onChange={v => handleSettingChange('enable_stock_refill', v)} disabled={saving} />
                  </div>
                  <div className="mt-2 flex items-center justify-between border-t border-white/5 pt-3">
                    <span className="text-sm text-gray-300">Include admin in delivery team</span>
                    <Toggle checked={settings.include_admin_as_driver || false} onChange={v => handleSettingChange('include_admin_as_driver', v)} disabled={saving} />
                  </div>
                </SectionCard>
              </div>
            </div>
          )}

          {activeSection === 'fleet' && (
            <div className="grid gap-5 lg:grid-cols-2">
              <SectionCard
                title="Depots"
                subtitle="Where vehicles start and return"
                className="min-h-0"
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-gray-500">{depots.length} location{depots.length !== 1 ? 's' : ''}</p>
                  <button
                    type="button"
                    onClick={() => setShowAddDepot(v => !v)}
                    className="rounded-lg bg-orange-500/15 px-3 py-1.5 text-xs font-semibold text-orange-400 ring-1 ring-orange-500/25 transition hover:bg-orange-500/25"
                  >
                    {showAddDepot ? 'Cancel' : 'Add depot'}
                  </button>
                </div>
                {depots.length === 0 && !showAddDepot ? (
                  <EmptyState
                    className="py-10"
                    icon={<Warehouse className="h-7 w-7" strokeWidth={1.5} />}
                    title="No depots yet"
                    description="Add at least one depot so routes have a start and return point."
                    action={
                      <Button type="button" variant="primary" className="min-h-11" onClick={() => setShowAddDepot(true)}>
                        Add depot
                      </Button>
                    }
                  />
                ) : (
                <div className="max-h-[min(70vh,520px)] space-y-3 overflow-y-auto pr-1 scrollbar-thin">
                  {depots.map(depot => (
                    <DepotCard key={depot.id} depot={depot} />
                  ))}
                </div>
                )}
                {showAddDepot && (
                  <div className="mt-4 space-y-3 rounded-xl border border-blue-500/25 bg-gradient-to-br from-blue-500/5 to-blue-600/5 p-4">
                    <h3 className="text-sm font-medium text-blue-400">New depot</h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <input className={inputCls} placeholder="Depot name" value={newDepot.name} onChange={e => setNewDepot(p => ({ ...p, name: e.target.value }))} disabled={saving} />
                      <input className={inputCls} placeholder="City" value={newDepot.city} onChange={e => setNewDepot(p => ({ ...p, city: e.target.value }))} disabled={saving} />
                    </div>
                    <input className={inputCls} placeholder="Full address" value={newDepot.address} onChange={e => setNewDepot(p => ({ ...p, address: e.target.value }))} disabled={saving} />
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <input className={inputCls} placeholder="Postcode" value={newDepot.postcode} onChange={e => setNewDepot(p => ({ ...p, postcode: e.target.value }))} disabled={saving} />
                      <input className={inputCls} type="number" placeholder="Capacity" value={newDepot.capacity} onChange={e => setNewDepot(p => ({ ...p, capacity: e.target.value }))} disabled={saving} />
                      <input className={inputCls} placeholder="Phone" value={newDepot.contactPhone} onChange={e => setNewDepot(p => ({ ...p, contactPhone: e.target.value }))} disabled={saving} />
                    </div>
                    <input className={inputCls} type="email" placeholder="Contact email" value={newDepot.contactEmail} onChange={e => setNewDepot(p => ({ ...p, contactEmail: e.target.value }))} disabled={saving} />
                    <SlideToConfirm label={saving ? 'Adding…' : 'Slide to add depot'} onConfirm={handleAddDepot} loading={saving} disabled={!newDepot.name || !newDepot.address} />
                  </div>
                )}
              </SectionCard>

              <SectionCard
                title="Drivers"
                subtitle="People and vehicles on the road"
                className="min-h-0"
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-gray-500">{drivers.length} driver{drivers.length !== 1 ? 's' : ''}</p>
                  <button
                    type="button"
                    onClick={() => setShowAddDriver(v => !v)}
                    className="rounded-lg bg-orange-500/15 px-3 py-1.5 text-xs font-semibold text-orange-400 ring-1 ring-orange-500/25 transition hover:bg-orange-500/25"
                  >
                    {showAddDriver ? 'Cancel' : 'Add driver'}
                  </button>
                </div>
                {drivers.length === 0 && !showAddDriver ? (
                  <EmptyState
                    className="py-10"
                    icon={<UserCircle2 className="h-7 w-7" strokeWidth={1.5} />}
                    title="No drivers in the roster"
                    description="Add drivers so you can assign them to generated routes."
                    action={
                      <Button type="button" variant="primary" className="min-h-11" onClick={() => setShowAddDriver(true)}>
                        Add driver
                      </Button>
                    }
                  />
                ) : (
                <div className="max-h-[min(70vh,520px)] space-y-3 overflow-y-auto pr-1 scrollbar-thin">
                  {drivers.map(driver => (
                    <DriverCard key={driver.id} driver={driver} />
                  ))}
                </div>
                )}
                {showAddDriver && (
                  <div className="mt-4 space-y-3 rounded-xl border border-blue-500/25 bg-gradient-to-br from-blue-500/5 to-blue-600/5 p-4">
                    <h3 className="text-sm font-medium text-blue-400">New driver</h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <input className={inputCls} placeholder="First name" value={newDriver.firstName} onChange={e => setNewDriver(p => ({ ...p, firstName: e.target.value }))} disabled={saving} />
                      <input className={inputCls} placeholder="Last name" value={newDriver.lastName} onChange={e => setNewDriver(p => ({ ...p, lastName: e.target.value }))} disabled={saving} />
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <input className={inputCls} type="email" placeholder="Email (login)" value={newDriver.email} onChange={e => setNewDriver(p => ({ ...p, email: e.target.value }))} disabled={saving} />
                      <input className={inputCls} type="password" placeholder="Password" value={newDriver.password} onChange={e => setNewDriver(p => ({ ...p, password: e.target.value }))} disabled={saving} />
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <input className={inputCls} placeholder="Phone" value={newDriver.phone} onChange={e => setNewDriver(p => ({ ...p, phone: e.target.value }))} disabled={saving} />
                      <Dropdown
                        value={newDriver.depotId}
                        options={[{ value: '', label: 'No depot' }, ...depots.map(d => ({ value: d.id, label: d.name }))]}
                        onChange={v => setNewDriver(p => ({ ...p, depotId: v }))}
                        placeholder="Select depot"
                        disabled={saving}
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <input className={inputCls} type="number" placeholder="MPG" value={newDriver.mpg} onChange={e => setNewDriver(p => ({ ...p, mpg: e.target.value }))} disabled={saving} />
                      <input className={inputCls} type="number" placeholder="Vehicle capacity" value={newDriver.vehicleCapacity} onChange={e => setNewDriver(p => ({ ...p, vehicleCapacity: e.target.value }))} disabled={saving} />
                      <input className={inputCls} placeholder="License plate" value={newDriver.licensePlate} onChange={e => setNewDriver(p => ({ ...p, licensePlate: e.target.value }))} disabled={saving} />
                    </div>
                    <SlideToConfirm
                      label={saving ? 'Adding…' : 'Slide to add driver'}
                      onConfirm={handleAddDriver}
                      loading={saving}
                      disabled={!newDriver.firstName || !newDriver.lastName || !newDriver.email}
                    />
                  </div>
                )}
              </SectionCard>
            </div>
          )}

          {activeSection === 'integrations' && (
            <div className="max-w-4xl">
              <SectionCard title="Channels & comms" subtitle="E‑commerce, tracking, and driver surfaces">
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm text-gray-300">WooCommerce</span>
                    <Toggle
                      checked={settings.woocommerce_integration_enabled || false}
                      onChange={v => handleSettingChange('woocommerce_integration_enabled', v)}
                      disabled={saving}
                    />
                  </div>
                  {settings.woocommerce_integration_enabled && (
                    <div className="space-y-3 rounded-card border border-white/10 bg-xr-bg/60 p-4">
                      <input
                        className={inputCls}
                        type="url"
                        placeholder="Webhook URL"
                        value={settings.webhook_url || ''}
                        onChange={e => handleSettingChange('webhook_url', e.target.value)}
                        disabled={saving}
                      />
                      <Stepper
                        label="Sync frequency (min)"
                        value={settings.sync_frequency_minutes || 15}
                        onChange={v => handleSettingChange('sync_frequency_minutes', v)}
                        disabled={saving}
                        min={5}
                        max={120}
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-between border-t border-white/5 pt-2">
                    <span className="text-sm text-gray-300">Real-time tracking</span>
                    <Toggle checked={settings.enable_real_time_tracking || false} onChange={v => handleSettingChange('enable_real_time_tracking', v)} disabled={saving} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Customer notifications</span>
                    <Toggle
                      checked={settings.customer_notifications !== false}
                      onChange={v => handleSettingChange('customer_notifications', v)}
                      disabled={saving}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Driver mobile app</span>
                    <Toggle checked={settings.driver_app_enabled !== false} onChange={v => handleSettingChange('driver_app_enabled', v)} disabled={saving} />
                  </div>
                </div>
              </SectionCard>
            </div>
          )}
        </div>
    </div>
  );
};

export default MyAdmin;