import React from 'react';
import { cn } from './cn';

export function Card({ as: Comp = 'section', variant = 'glass', className, children, ...props }) {
  const base =
    'rounded-card border shadow-panel ring-1 ring-inset ring-white/[0.04] transition duration-200 will-change-transform';
  const variants = {
    glass: 'glass-card border-xr-border hover:-translate-y-[1px] hover:shadow-soft hover:shadow-black/35',
    solid: 'bg-xr-surface border-xr-line hover:-translate-y-[1px] hover:shadow-soft hover:shadow-black/35',
    soft: 'bg-xr-overlay border-xr-border backdrop-blur-sm hover:bg-xr-overlay',
  };
  return (
    <Comp className={cn(base, variants[variant] || variants.glass, className)} {...props}>
      {children}
    </Comp>
  );
}

export function CardHeader({ className, children, ...props }) {
  return (
    <header
      className={cn('flex flex-wrap items-start justify-between gap-3 border-b border-xr-border px-4 py-3 sm:px-5 sm:py-3.5', className)}
      {...props}
    >
      {children}
    </header>
  );
}

export function CardBody({ className, children, ...props }) {
  return (
    <div className={cn('p-4 sm:p-5', className)} {...props}>
      {children}
    </div>
  );
}

