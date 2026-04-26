import React from 'react';
import { cn } from './cn';

/**
 * High-visibility empty / zero-data affordance.
 */
export function EmptyState({ icon, title, description, action, className }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-card border border-dashed border-white/12 bg-xr-surface/35 px-6 py-12 text-center sm:py-14',
        className
      )}
    >
      {icon && <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-card border border-white/10 bg-white/[0.04] text-xr-brand">{icon}</div>}
      <h3 className="font-heading text-h3 text-white">{title}</h3>
      {description && <p className="mt-2 max-w-readable text-sm text-xr-muted">{description}</p>}
      {action && <div className="mt-6 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}
