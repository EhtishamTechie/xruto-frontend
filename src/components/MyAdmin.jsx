import React, { useState, useEffect, useRef } from 'react';
import { adminAPI } from '../services/api';

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

const SlideButton = ({ label, onConfirm, loading = false, disabled = false }) => {
  const trackRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [offsetX, setOffsetX] = useState(0);
  const getMaxX = () => (trackRef.current ? trackRef.current.offsetWidth - 48 : 200);
  const handleMove = (clientX) => { if (!dragging || !trackRef.current) return; const rect = trackRef.current.getBoundingClientRect(); setOffsetX(Math.max(0, Math.min(clientX - rect.left - 24, getMaxX()))); };
  const handleEnd = () => { if (!dragging) return; setDragging(false); if (offsetX >= getMaxX() * 0.85) onConfirm(); setOffsetX(0); };
  return (
    <div ref={trackRef} className={`relative h-12 rounded-full overflow-hidden select-none ${disabled || loading ? 'opacity-50' : ''}`}
      style={{ background: 'linear-gradient(135deg, #0f1b2e, #162540)', border: '1px solid rgba(59,130,246,0.25)' }}
      onMouseMove={e => handleMove(e.clientX)} onMouseUp={handleEnd} onMouseLeave={handleEnd}
      onTouchMove={e => handleMove(e.touches[0].clientX)} onTouchEnd={handleEnd}>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-white/70 text-sm font-medium">{loading ? 'Processing...' : label}</span>
      </div>
      <div className="absolute top-1 left-1 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 cursor-grab z-10"
        style={{ transform: `translateX(${offsetX}px)` }}
        onMouseDown={e => { e.preventDefault(); if (!loading && !disabled) setDragging(true); }}
        onTouchStart={() => { if (!loading && !disabled) setDragging(true); }}>
        {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          : <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>}
      </div>
    </div>
  );
};

const Toggle = ({ isOn, onChange, disabled }) => (
  <div onClick={() => !disabled && onChange(!isOn)}
    className={`w-11 h-6 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${isOn ? 'bg-orange-500' : 'bg-gray-700'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${isOn ? 'translate-x-5' : ''}`} />
  </div>
);

const Radio = ({ checked, onChange, disabled, label, sublabel }) => (
  <div className={`flex items-center gap-3 ${disabled ? 'opacity-50' : 'cursor-pointer'}`} onClick={() => !disabled && onChange()}>
    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${checked ? 'border-orange-500' : 'border-gray-600'}`}>
      {checked && <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />}
    </div>
    <div><p className="text-sm font-medium text-white">{label}</p>{sublabel && <p className="text-xs text-gray-500">{sublabel}</p>}</div>
  </div>
);

const Stepper = ({ label, value, onChange, disabled, helpText, min = 1, max = 100 }) => (
  <div className="bg-[#0a0e1a] border border-[#1a2a45] rounded-xl p-4">
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-1.5">
        <span className="text-sm text-gray-300">{label}</span>
        {helpText && <Ico d={ICON.info} className="w-3.5 h-3.5 text-gray-600" />}
      </div>
      <div className="flex items-center gap-2 bg-[#111b2e] rounded-lg p-0.5">
        <button onClick={() => !disabled && onChange(Math.max(min, value - 1))} disabled={disabled || value <= min}
          className="w-8 h-8 rounded-md bg-[#1a2a45] text-white text-lg flex items-center justify-center disabled:opacity-30 hover:bg-[#243550] transition">-</button>
        <span className="text-sm font-bold text-white w-8 text-center">{value}</span>
        <button onClick={() => !disabled && onChange(Math.min(max, value + 1))} disabled={disabled || value >= max}
          className="w-8 h-8 rounded-md bg-[#1a2a45] text-white text-lg flex items-center justify-center disabled:opacity-30 hover:bg-[#243550] transition">+</button>
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
        className="bg-[#0a0e1a] border border-[#1a2a45] rounded-xl px-4 py-3 flex justify-between items-center cursor-pointer">
        <span className="text-sm text-gray-400">{selected?.label || placeholder}</span>
        <Ico d={ICON.chevDown} className={`w-4 h-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </div>
      {open && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#111b2e] border border-[#1a2a45] rounded-xl shadow-xl z-20 max-h-48 overflow-y-auto">
          {options.map(opt => (
            <div key={opt.value} onClick={() => { onChange(opt.value); setOpen(false); }}
              className="px-4 py-2.5 hover:bg-[#1a2a45] cursor-pointer text-sm text-white transition">
              {opt.label}{opt.sub && <span className="text-xs text-gray-500 ml-2">{opt.sub}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const inputCls = 'w-full bg-[#0a0e1a] border border-[#1a2a45] rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition';

const SectionCard = ({ title, subtitle, children, className = '' }) => (
  <section
    className={`rounded-2xl border border-[#1a2a45] bg-gradient-to-b from-[#111b2e] to-[#0d1524] p-5 shadow-lg shadow-black/25 sm:p-6 ${className}`}
  >
    {(title || subtitle) && (
      <header className="mb-4 border-b border-white/5 pb-3 sm:mb-5 sm:pb-4">
        {title && <h2 className="text-sm font-semibold tracking-tight text-white sm:text-base">{title}</h2>}
        {subtitle && <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">{subtitle}</p>}
      </header>
    )}
    {children}
  </section>
);

const StatTile = ({ label, value, hint, tone = 'default' }) => {
  const toneCls =
    tone === 'blue'
      ? 'text-blue-400'
      : tone === 'green'
        ? 'text-emerald-400'
        : tone === 'amber'
          ? 'text-amber-400'
          : tone === 'orange'
            ? 'text-orange-400'
            : 'text-white';
  return (
    <div className="rounded-2xl border border-[#1a2a45] bg-[#0a0e1a]/80 p-4 ring-1 ring-inset ring-white/5 sm:p-5">
      <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500 sm:text-xs">{label}</p>
      <p className={`mt-1.5 text-2xl font-bold tabular-nums sm:text-3xl ${toneCls}`}>{value}</p>
      {hint && <p className="mt-0.5 text-xs text-gray-600">{hint}</p>}
    </div>
  );
};

const MyAdmin = ({ onNavigateToDashboard }) => {
  const [settings, setSettings] = useState({});
  const [depots, setDepots] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
      setSuccess('Settings updated'); setTimeout(() => setSuccess(''), 3000);
    } catch (e) { setError('Failed: ' + e.message); } finally { setSaving(false); }
  };

  const handleAddDepot = async () => {
    if (!newDepot.name || !newDepot.address) { setError('Depot name and address required'); return; }
    try { setSaving(true); await adminAPI.addDepot(newDepot);
      setNewDepot({ name: '', address: '', city: '', postcode: '', capacity: '', contactPhone: '', contactEmail: '' });
      setShowAddDepot(false); await loadAdminData(); setSuccess('Depot added'); setTimeout(() => setSuccess(''), 3000);
    } catch (e) { setError('Failed: ' + e.message); } finally { setSaving(false); }
  };

  const handleEditDepot = (depot) => {
    setEditingDepot(depot.id);
    setEditDepotData({ name: depot.name || '', address: depot.address || '', city: depot.city || '', postcode: depot.postcode || '', capacity: depot.capacity || '', contactPhone: depot.contact_phone || '', contactEmail: depot.contact_email || '' });
  };

  const handleSaveDepotEdit = async () => {
    try { setSaving(true); await adminAPI.updateDepot(editingDepot, editDepotData); setEditingDepot(null); setEditDepotData({}); await loadAdminData();
      setSuccess('Depot updated'); setTimeout(() => setSuccess(''), 3000);
    } catch (e) { setError('Failed: ' + e.message); } finally { setSaving(false); }
  };

  const handleRemoveDepot = async (depotId) => {
    if (!confirm('Remove this depot?')) return;
    try { setSaving(true); await adminAPI.removeDepot(depotId); await loadAdminData(); setSuccess('Depot removed'); setTimeout(() => setSuccess(''), 3000);
    } catch (e) { setError('Failed: ' + e.message); } finally { setSaving(false); }
  };

  const handleAddDriver = async () => {
    if (!newDriver.firstName || !newDriver.lastName || !newDriver.email) { setError('Driver name and email required'); return; }
    try { setSaving(true);
      await adminAPI.addDriver({ firstName: newDriver.firstName, lastName: newDriver.lastName, email: newDriver.email, password: newDriver.password || null, phone: newDriver.phone, depotId: newDriver.depotId || null, mpg: newDriver.mpg ? parseFloat(newDriver.mpg) : null, vehicleType: newDriver.vehicleType, vehicleCapacity: newDriver.vehicleCapacity ? parseInt(newDriver.vehicleCapacity) : null, licensePlate: newDriver.licensePlate, workingHours: newDriver.workingHours, maxRoutesPerDay: newDriver.maxRoutesPerDay ? parseInt(newDriver.maxRoutesPerDay) : null, notes: newDriver.notes });
      setNewDriver({ firstName: '', lastName: '', email: '', password: '', phone: '', depotId: '', mpg: '', vehicleType: 'van', vehicleCapacity: '50', licensePlate: '', workingHours: '{"start": "08:00", "end": "18:00"}', maxRoutesPerDay: '3', notes: '' });
      setShowAddDriver(false); await loadAdminData(); setSuccess('Driver added'); setTimeout(() => setSuccess(''), 3000);
    } catch (e) { setError('Failed: ' + e.message); } finally { setSaving(false); }
  };

  const handleEditDriver = (driver) => {
    setEditingDriver(driver.id);
    setEditDriverData({ firstName: driver.first_name || driver.name?.split(' ')[0] || '', lastName: driver.last_name || driver.name?.split(' ').slice(1).join(' ') || '', email: driver.email || '', phone: driver.phone || '', depotId: driver.depot_id || '', mpg: driver.mpg || '', vehicleType: driver.vehicle_type || 'van', vehicleCapacity: driver.vehicle_capacity || '', licensePlate: driver.license_plate || '', notes: driver.notes || '' });
  };

  const handleSaveDriverEdit = async () => {
    try { setSaving(true); await adminAPI.updateDriver(editingDriver, editDriverData); setEditingDriver(null); setEditDriverData({}); await loadAdminData();
      setSuccess('Driver updated'); setTimeout(() => setSuccess(''), 3000);
    } catch (e) { setError('Failed: ' + e.message); } finally { setSaving(false); }
  };

  const handleRemoveDriver = async (driverId) => {
    if (!confirm('Remove this driver?')) return;
    try { setSaving(true); await adminAPI.removeDriver(driverId); await loadAdminData(); setSuccess('Driver removed'); setTimeout(() => setSuccess(''), 3000);
    } catch (e) { setError('Failed: ' + e.message); } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
    </div>
  );

  const DepotCard = ({ depot }) => editingDepot === depot.id ? (
    <div className="bg-[#0a0e1a] border border-blue-500/30 rounded-xl p-4 space-y-3">
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
    <div className="bg-[#0a0e1a] border border-[#1a2a45] rounded-xl p-4 flex justify-between items-start">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-white">{depot.name}</span>
          {depot.is_primary && <span className="text-[10px] text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full">Primary</span>}
        </div>
        <p className="text-xs text-gray-500">{depot.address}</p>
        <p className="text-xs text-gray-600 mt-1">{depot.driver_count || 0} drivers &middot; Cap: {depot.capacity || 'N/A'}</p>
      </div>
      <div className="flex gap-2">
        <button onClick={() => handleEditDepot(depot)} className="text-blue-400 hover:text-blue-300 p-1"><Ico d={ICON.edit} className="w-4 h-4" /></button>
        <button onClick={() => handleRemoveDepot(depot.id)} className="text-red-400 hover:text-red-300 p-1"><Ico d={ICON.trash} className="w-4 h-4" /></button>
      </div>
    </div>
  );

  const DriverCard = ({ driver }) => editingDriver === driver.id ? (
    <div className="bg-[#0a0e1a] border border-blue-500/30 rounded-xl p-4 space-y-3">
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
    <div className="bg-[#0a0e1a] border border-[#1a2a45] rounded-xl p-4 flex justify-between items-start">
      <div>
        <span className="text-sm font-medium text-white">{driver.name || `${driver.first_name || ''} ${driver.last_name || ''}`}</span>
        <p className="text-xs text-gray-500 mt-0.5">{driver.email}</p>
        <p className="text-xs text-gray-600 mt-0.5">{driver.details || ''} {driver.mpg ? `| ${driver.mpg} MPG` : ''}</p>
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
    <div className="relative min-h-screen pb-[calc(5rem+env(safe-area-inset-bottom,0px))] md:pb-8">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />

      {/* Sticky top: title + tools + tab nav */}
      <header className="sticky top-0 z-20 border-b border-[#1a2a45] bg-[#0a0e1a]/95 shadow-[0_1px_0_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <div className="mx-auto max-w-[1600px] px-4 pt-4 sm:px-5 md:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">xRuto · Administration</p>
              <h1 className="mt-0.5 text-xl font-bold tracking-tight text-white sm:text-2xl">Control center</h1>
              <p className="mt-0.5 max-w-xl text-sm text-gray-500">Configure routing, fleet, and integrations. Colours and accents match your existing theme.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#1a2a45] bg-[#111b2e] px-2.5 py-1.5 text-[11px] text-gray-400 sm:text-xs">
                <span className={`h-1.5 w-1.5 rounded-full ${saving ? 'animate-pulse bg-amber-400' : 'bg-emerald-400'}`} aria-hidden />
                {saving ? 'Saving changes…' : success ? 'All changes applied' : 'In sync with server'}
              </span>
              <button
                type="button"
                onClick={() => setHelpEnabled(!helpEnabled)}
                className={`shrink-0 rounded-xl px-3 py-2 text-xs font-medium transition sm:px-4 ${helpEnabled ? 'bg-blue-500/15 text-blue-300 ring-1 ring-blue-500/30' : 'bg-[#111b2e] text-gray-500 ring-1 ring-[#1a2a45] hover:text-gray-300'}`}
              >
                {helpEnabled ? 'Hide tips' : 'Show tips'}
              </button>
            </div>
          </div>

          <nav className="scrollbar-thin -mx-1 mt-5 flex gap-1 overflow-x-auto pb-1 md:mt-6" role="tablist" aria-label="Admin sections">
            {adminTabs.map(tab => {
              const active = activeSection === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveSection(tab.id)}
                  className={`shrink-0 rounded-t-xl border px-3 py-2.5 text-left text-sm font-medium transition sm:min-w-[7.5rem] sm:px-4 ${
                    active
                      ? 'border-b-transparent border-[#1a2a45] bg-[#111b2e] text-white ring-1 ring-[#1a2a45]'
                      : 'border-transparent text-gray-500 hover:bg-white/[0.04] hover:text-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
        <div className="h-0 border-b border-[#1a2a45]" />
      </header>

      <div className="mx-auto max-w-[1600px] px-4 sm:px-5 md:px-8">
        {showTooltip && (
          <div className="mt-4 flex justify-between gap-2 rounded-xl border border-blue-500/25 bg-blue-500/10 p-3 text-xs text-blue-300 sm:mt-5">
            <span>{showTooltip}</span>
            <button type="button" onClick={() => setShowTooltip(null)} className="shrink-0 text-blue-400/70 hover:text-blue-300" aria-label="Dismiss">
              &times;
            </button>
          </div>
        )}
        {error && (
          <div className="mt-4 flex justify-between gap-2 rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-xs text-red-300 sm:mt-5">
            <span>{error}</span>
            <button type="button" onClick={() => setError('')} className="shrink-0 text-red-400/70 hover:text-red-300" aria-label="Dismiss error">
              &times;
            </button>
          </div>
        )}

        <div className="mt-4 space-y-5 pb-4 sm:mt-5 sm:space-y-6 md:pb-8">
          {activeSection === 'overview' && (
            <>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                <StatTile label="Depots" value={depots.length} hint="Active locations" tone="blue" />
                <StatTile label="Drivers" value={drivers.length} hint="Fleet roster" tone="green" />
                <StatTile label="Nav app" value={navAppLabel} hint="Default for routes" tone="amber" />
                <StatTile
                  label="Drivers today"
                  value={String(settings.drivers_today_count ?? 3)}
                  hint="Planned headcount"
                  tone="orange"
                />
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <SectionCard title="At a glance" subtitle="Key operational switches">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="flex items-center justify-between gap-3 rounded-xl border border-[#1a2a45] bg-[#0a0e1a] p-3 sm:p-4">
                        <div>
                          <p className="text-xs font-medium text-gray-400">Auto-assign routes</p>
                          <p className="text-[11px] text-gray-600">Distribute work automatically when possible</p>
                        </div>
                        <Toggle isOn={settings.auto_assign_routes || false} onChange={v => handleSettingChange('auto_assign_routes', v)} disabled={saving} />
                      </div>
                      <div className="flex items-center justify-between gap-3 rounded-xl border border-[#1a2a45] bg-[#0a0e1a] p-3 sm:p-4">
                        <div>
                          <p className="text-xs font-medium text-gray-400">Stock refill logic</p>
                          <p className="text-[11px] text-gray-600">Enable depot return handling</p>
                        </div>
                        <Toggle isOn={settings.enable_stock_refill || false} onChange={v => handleSettingChange('enable_stock_refill', v)} disabled={saving} />
                      </div>
                      <div className="flex items-center justify-between gap-3 rounded-xl border border-[#1a2a45] bg-[#0a0e1a] p-3 sm:col-span-2 sm:p-4">
                        <div>
                          <p className="text-xs font-medium text-gray-400">Admin in delivery team</p>
                          <p className="text-[11px] text-gray-600">Include the admin user as a driver in planning</p>
                        </div>
                        <Toggle isOn={settings.include_admin_as_driver || false} onChange={v => handleSettingChange('include_admin_as_driver', v)} disabled={saving} />
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
                  <div className="rounded-xl border border-[#1a2a45] bg-[#0a0e1a] p-4">
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
                    <Toggle isOn={settings.auto_assign_routes || false} onChange={v => handleSettingChange('auto_assign_routes', v)} disabled={saving} />
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
                    <SlideButton
                      label={saving ? 'Saving…' : 'Slide to save configuration'}
                      onConfirm={() => setSuccess('Configuration saved!')}
                      loading={saving}
                    />
                  </div>
                </SectionCard>
                <SectionCard title="Inventory behaviour" subtitle="Refill and admin participation">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm text-gray-300">Enable stock refill logic</span>
                    <Toggle isOn={settings.enable_stock_refill || false} onChange={v => handleSettingChange('enable_stock_refill', v)} disabled={saving} />
                  </div>
                  <div className="mt-2 flex items-center justify-between border-t border-white/5 pt-3">
                    <span className="text-sm text-gray-300">Include admin in delivery team</span>
                    <Toggle isOn={settings.include_admin_as_driver || false} onChange={v => handleSettingChange('include_admin_as_driver', v)} disabled={saving} />
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
                <div className="max-h-[min(70vh,520px)] space-y-3 overflow-y-auto pr-1 scrollbar-thin">
                  {depots.map(depot => (
                    <DepotCard key={depot.id} depot={depot} />
                  ))}
                </div>
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
                    <SlideButton label={saving ? 'Adding…' : 'Slide to add depot'} onConfirm={handleAddDepot} loading={saving} disabled={!newDepot.name || !newDepot.address} />
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
                <div className="max-h-[min(70vh,520px)] space-y-3 overflow-y-auto pr-1 scrollbar-thin">
                  {drivers.map(driver => (
                    <DriverCard key={driver.id} driver={driver} />
                  ))}
                </div>
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
                    <SlideButton
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
                      isOn={settings.woocommerce_integration_enabled || false}
                      onChange={v => handleSettingChange('woocommerce_integration_enabled', v)}
                      disabled={saving}
                    />
                  </div>
                  {settings.woocommerce_integration_enabled && (
                    <div className="space-y-3 rounded-xl border border-[#1a2a45] bg-[#0a0e1a] p-4">
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
                    <Toggle isOn={settings.enable_real_time_tracking || false} onChange={v => handleSettingChange('enable_real_time_tracking', v)} disabled={saving} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Customer notifications</span>
                    <Toggle
                      isOn={settings.customer_notifications !== false}
                      onChange={v => handleSettingChange('customer_notifications', v)}
                      disabled={saving}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Driver mobile app</span>
                    <Toggle isOn={settings.driver_app_enabled !== false} onChange={v => handleSettingChange('driver_app_enabled', v)} disabled={saving} />
                  </div>
                </div>
              </SectionCard>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyAdmin;