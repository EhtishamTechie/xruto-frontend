import React, { useEffect, useRef } from 'react';
import { cn } from './cn';

export function Modal({ open, title, description, children, onClose, className }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => panelRef.current?.focus?.(), 0);
    return () => clearTimeout(t);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/55"
        aria-label="Close dialog"
        onClick={() => onClose?.()}
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        className={cn('relative w-full max-w-sm rounded-card border border-xr-line bg-xr-surface p-6 shadow-2xl shadow-black/40 focus:outline-none', className)}
      >
        {(title || description) && (
          <div className="mb-4">
            {title && <h3 className="text-xr-text font-semibold">{title}</h3>}
            {description && <p className="mt-1 text-xs text-xr-subtle">{description}</p>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

