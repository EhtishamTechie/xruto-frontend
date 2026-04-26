import React, { useEffect, useMemo, useState } from 'react';
import { cn } from '../../ui/cn';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { ChevronLeft, ChevronRight, LayoutGrid, Package, BarChart3, Route, Settings, LogOut } from 'lucide-react';

const VIEW_META = {
  admin: { label: 'My Admin', shortLabel: 'Admin', icon: LayoutGrid, breadcrumb: ['Admin', 'Control center'] },
  orders: { label: 'Orders', shortLabel: 'Orders', icon: Package, breadcrumb: ['Admin', 'Orders'] },
  analytics: { label: 'Analytics', shortLabel: 'Stats', icon: BarChart3, breadcrumb: ['Admin', 'Analytics'] },
  routes: { label: 'Route', shortLabel: 'Routes', icon: Route, breadcrumb: ['Driver', 'Routes'] },
  settings: { label: 'Settings', shortLabel: 'Settings', icon: Settings, breadcrumb: ['Account', 'Settings'] },
};

function getInitials(name) {
  return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
}

export function AppShell({ currentView, onChangeView, user, onLogout, children }) {
  const isAdmin = user?.role === 'admin';
  const tabs = useMemo(() => {
    const adminTabs = ['admin', 'orders', 'analytics', 'routes', 'settings'];
    const driverTabs = ['routes', 'analytics', 'settings'];
    return (isAdmin ? adminTabs : driverTabs).map((id) => ({ id, ...VIEW_META[id] }));
  }, [isAdmin]);

  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    const v = localStorage.getItem('xruto_nav_collapsed');
    if (v === '1') setCollapsed(true);
  }, []);
  const toggleCollapsed = () => {
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem('xruto_nav_collapsed', next ? '1' : '0');
      return next;
    });
  };

  const meta = VIEW_META[currentView] || VIEW_META.admin;
  const initials = getInitials(user?.name);

  return (
    <div className="min-h-screen text-xr-text">
      {/* background */}
      <div aria-hidden className="pointer-events-none fixed inset-0 bg-grid opacity-[0.45]" />
      <div aria-hidden className="pointer-events-none fixed inset-0 bg-noise" />

      <div className="relative flex min-h-screen">
        {/* Sidebar */}
        <aside
          className={cn(
            'hidden md:flex h-screen sticky top-0 shrink-0 flex-col border-r border-white/10 bg-xr-surface/60 backdrop-blur-xl',
            collapsed ? 'w-[76px]' : 'w-[232px]'
          )}
        >
          <div className={cn('flex items-center justify-between px-4 py-4', collapsed && 'px-3')}>
            <div className={cn('flex items-center gap-3 min-w-0', collapsed && 'gap-0')}>
              <div className="flex h-9 w-9 items-center justify-center rounded-control border border-white/10 bg-white/[0.03]">
                <span className="text-sm font-bold text-xr-brand">X</span>
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white">xRuto</div>
                  <div className="text-[11px] text-xr-muted">Logistics Intelligence</div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={toggleCollapsed}
              className={cn(
                'ml-2 inline-flex h-9 w-9 items-center justify-center rounded-control border border-white/10 bg-white/[0.03] text-xr-secondary transition hover:bg-white/[0.06]',
                collapsed && 'ml-0'
              )}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>

          <nav className={cn('mt-2 flex-1 px-3 pb-3', collapsed && 'px-2')} aria-label="Primary">
            <div className="space-y-1">
              {tabs.map((t) => {
                const active = currentView === t.id;
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onChangeView(t.id)}
                    className={cn(
                      'group relative flex w-full items-center gap-3 rounded-control px-3 py-2.5 text-sm font-medium transition',
                      collapsed && 'justify-center px-2',
                      active
                        ? 'bg-white/[0.06] text-white ring-1 ring-inset ring-xr-brand/20'
                        : 'text-xr-secondary hover:bg-white/[0.04] hover:text-xr-text'
                    )}
                    title={collapsed ? t.label : undefined}
                  >
                    {active && (
                      <span
                        aria-hidden
                        className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-xr-brand shadow-[0_0_0_4px_rgba(245,158,11,0.10)]"
                      />
                    )}
                    <Icon className={cn('h-4 w-4', active && 'text-xr-brand')} />
                    {!collapsed && <span className="truncate">{t.label}</span>}
                  </button>
                );
              })}
            </div>
          </nav>

          <div className={cn('border-t border-white/10 p-3', collapsed && 'p-2')}>
            <div className={cn('flex items-center gap-3 rounded-control border border-white/10 bg-white/[0.03] p-3', collapsed && 'justify-center p-2')}>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-xr-bg ring-1 ring-xr-brand/25 text-[11px] font-bold text-white">
                {initials}
              </div>
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-white">{user?.name || 'User'}</div>
                  <div className="truncate text-[11px] text-xr-muted">{isAdmin ? 'Administrator' : 'Driver'}</div>
                </div>
              )}
              {!collapsed && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="inline-flex h-9 items-center gap-2 rounded-control border border-xr-danger/25 bg-xr-danger/10 px-3 text-xs font-semibold text-red-200 transition hover:bg-xr-danger/15"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              )}
            </div>
            {collapsed && (
              <button
                type="button"
                onClick={onLogout}
                className="mt-2 inline-flex w-full items-center justify-center rounded-control border border-xr-danger/25 bg-xr-danger/10 py-2 text-xs font-semibold text-red-200 transition hover:bg-xr-danger/15"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </aside>

        {/* Main */}
        <div className="relative flex min-w-0 flex-1 flex-col">
          {/* Topbar */}
          <header className="sticky top-0 z-30 border-b border-white/10 bg-xr-bg/65 backdrop-blur-xl">
            <div className="mx-auto max-w-section px-4 py-3 sm:px-6 sm:py-4">
              <div className="flex min-h-12 items-center justify-between gap-3 sm:min-h-0 sm:gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-caption text-xr-muted">
                    <span>{meta.breadcrumb?.[0] || 'App'}</span>
                    <span className="opacity-40">/</span>
                    <span className="text-xr-secondary">{meta.breadcrumb?.[1] || meta.label}</span>
                  </div>
                  <div className="mt-1 text-h2 text-white">{meta.breadcrumb?.[1] || meta.label}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="neutral" className="hidden sm:inline-flex">
                    {user?.role === 'admin' ? 'Admin' : 'Driver'}
                  </Badge>
                  <Button variant="ghost" size="sm" className="min-h-11 min-w-11 md:min-h-9 md:min-w-0 md:hidden" onClick={onLogout}>
                    <LogOut className="h-5 w-5 md:h-4 md:w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-section px-4 py-5 pb-[calc(5.25rem+env(safe-area-inset-bottom,0px))] sm:px-6 sm:py-6 sm:pb-[calc(5.25rem+env(safe-area-inset-bottom,0px))] md:py-6 md:pb-6">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile bottom navigation — primary nav is sidebar-only on md+ */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-xr-bg/95 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 backdrop-blur-xl"
        aria-label="Primary"
      >
        <div
          className={cn(
            'mx-auto grid max-w-section gap-0 px-1',
            isAdmin ? 'grid-cols-5' : 'grid-cols-3'
          )}
        >
          {tabs.map((t) => {
            const active = currentView === t.id;
            const Icon = t.icon;
            const sub = t.shortLabel || t.label;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onChangeView(t.id)}
                className={cn(
                  'flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-control py-1 transition',
                  active ? 'text-xr-brand' : 'text-xr-muted'
                )}
              >
                <Icon className={cn('h-5 w-5', active && 'text-xr-brand')} strokeWidth={2} />
                <span
                  className={cn(
                    'max-w-full truncate px-0.5 text-center text-[10px] font-semibold leading-tight',
                    active ? 'text-xr-brand' : 'text-xr-muted'
                  )}
                >
                  {sub}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

