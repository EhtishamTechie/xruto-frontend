import React, { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from './cn';

export function SlideToConfirm({
  onConfirm,
  disabled = false,
  loading = false,
  label = 'Slide to confirm',
  loadingLabel = 'Processing…',
}) {
  const trackRef = useRef(null);
  const thumbSize = 48;
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const getMaxX = useCallback(() => (trackRef.current ? trackRef.current.offsetWidth - thumbSize - 8 : 200), []);

  const handleStart = useCallback(
    (clientX) => {
      if (!disabled && !loading && !confirmed) setIsDragging(true);
      if (trackRef.current && clientX) {
        const rect = trackRef.current.getBoundingClientRect();
        setDragX(Math.min(Math.max(0, clientX - rect.left - thumbSize / 2 - 4), getMaxX()));
      }
    },
    [disabled, loading, confirmed, getMaxX]
  );

  const handleMove = useCallback(
    (clientX) => {
      if (!isDragging || !trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      setDragX(Math.min(Math.max(0, clientX - rect.left - thumbSize / 2 - 4), getMaxX()));
    },
    [isDragging, getMaxX]
  );

  const handleEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragX / getMaxX() >= 0.85) {
      setConfirmed(true);
      setDragX(getMaxX());
      onConfirm?.();
    } else {
      setDragX(0);
    }
  }, [isDragging, dragX, getMaxX, onConfirm]);

  useEffect(() => {
    if (!loading) {
      setConfirmed(false);
      setDragX(0);
    }
  }, [loading]);

  useEffect(() => {
    if (!isDragging) return;
    const mm = (e) => handleMove(e.clientX);
    const mu = () => handleEnd();
    window.addEventListener('mousemove', mm);
    window.addEventListener('mouseup', mu);
    return () => {
      window.removeEventListener('mousemove', mm);
      window.removeEventListener('mouseup', mu);
    };
  }, [isDragging, handleMove, handleEnd]);

  return (
    <div
      ref={trackRef}
      className={cn(
        'relative h-12 select-none overflow-hidden rounded-full border border-xr-brand/25 bg-xr-surface/80 shadow-inner ring-1 ring-inset ring-white/[0.05]',
        (disabled || loading) && 'opacity-50'
      )}
      onTouchStart={(e) => handleStart(e.touches[0].clientX)}
      onTouchMove={(e) => {
        e.preventDefault();
        handleMove(e.touches[0].clientX);
      }}
      onTouchEnd={handleEnd}
      onMouseDown={(e) => {
        e.preventDefault();
        handleStart(e.clientX);
      }}
    >
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-medium text-xr-secondary">{loading ? loadingLabel : label}</span>
      </div>
      {!loading && (
        <div
          className="absolute left-1 top-1 z-10 flex h-10 w-10 cursor-grab items-center justify-center rounded-full bg-gradient-to-br from-xr-brand to-amber-600 text-black shadow-lg shadow-xr-brand/25 active:cursor-grabbing"
          style={{ transform: `translateX(${dragX}px)`, transition: isDragging ? 'none' : 'transform 0.3s ease' }}
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path d={confirmed ? 'M5 13l4 4L19 7' : 'M8 5v14l11-7z'} />
          </svg>
        </div>
      )}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-xr-brand/30 border-t-xr-brand" />
        </div>
      )}
    </div>
  );
}

