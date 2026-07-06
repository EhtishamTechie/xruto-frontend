import React from 'react';
import { cn } from './cn';

export function Button({
  variant = 'secondary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  ...props
}) {
  const isDisabled = disabled || loading;

  const base =
    'inline-flex items-center justify-center gap-2 rounded-control font-semibold transition duration-200 ease-out active:translate-y-[1px] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50';

  const sizes = {
    sm: 'h-9 px-3 text-xs',
    md: 'h-10 px-4 text-[14px]',
    lg: 'h-11 px-5 text-sm',
  };

  const variants = {
    primary: 'bg-xr-brand text-black hover:brightness-110 shadow-soft shadow-amber-500/10',
    secondary: 'border border-xr-border bg-xr-overlay text-xr-text hover:bg-xr-overlay-hover',
    ghost: 'text-xr-secondary hover:bg-xr-overlay hover:text-xr-text',
    danger: 'border border-xr-danger/25 bg-xr-danger/10 text-red-200 hover:bg-xr-danger/15',
  };

  return (
    <button
      type="button"
      disabled={isDisabled}
      className={cn(base, sizes[size] || sizes.md, variants[variant] || variants.secondary, className)}
      {...props}
    >
      {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-xr-border border-t-white" aria-hidden />}
      {children}
    </button>
  );
}

