import React from 'react';
import { Card } from './Card';
import { cn } from './cn';

export function StatCard({ icon, label, value, hint, trend, tone = 'neutral', className }) {
  const tones = {
    neutral: 'text-xr-text',
    brand: 'text-amber-200',
    success: 'text-emerald-200',
    info: 'text-blue-200',
    danger: 'text-red-200',
  };

  return (
    <Card variant="glass" className={cn('p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex h-9 w-9 items-center justify-center rounded-control border border-xr-border bg-xr-overlay text-xr-secondary">
              {icon}
            </div>
          )}
          <div>
            <p className="text-caption uppercase tracking-wider text-xr-muted">{label}</p>
            {hint && <p className="mt-1 text-xs text-xr-muted">{hint}</p>}
          </div>
        </div>
        {trend && (
          <span className="rounded-full border border-xr-border bg-xr-overlay px-2 py-1 text-[11px] font-semibold text-xr-secondary">
            {trend}
          </span>
        )}
      </div>

      <div className={cn('mt-4 text-3xl font-semibold tracking-tight', tones[tone] || tones.neutral)}>
        {value}
      </div>
    </Card>
  );
}

