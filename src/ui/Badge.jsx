import React from 'react';
import { cn } from './cn';

export function Badge({ variant = 'neutral', className, children, ...props }) {
  const base = 'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold';
  const variants = {
    neutral: 'border-xr-border bg-xr-overlay text-xr-muted',
    brand: 'border-xr-brand/25 bg-xr-brand/10 text-xr-brand',
    success: 'border-xr-success/25 bg-xr-success/10 text-xr-success',
    danger: 'border-xr-danger/25 bg-xr-danger/10 text-xr-danger',
    info: 'border-xr-info/25 bg-xr-info/10 text-xr-info',
  };
  return (
    <span className={cn(base, variants[variant] || variants.neutral, className)} {...props}>
      {children}
    </span>
  );
}

