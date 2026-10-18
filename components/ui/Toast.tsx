'use client';

import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastData {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info';
}

export function showToast(message: string, type: 'success' | 'error' | 'info' = 'success') {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('menma-toast', {
        detail: { id: Math.random().toString(36).substring(2, 9), message, type },
      })
    );
  }
}

export default function Toast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const toastContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent<ToastData>;
      const newToast = customEvent.detail;
      setToasts((prev) => [...prev, newToast]);

      // Auto dismiss after 2.6s
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 2600);
    };

    window.addEventListener('menma-toast', handleToast);
    return () => window.removeEventListener('menma-toast', handleToast);
  }, []);

  useEffect(() => {
    if (toastContainerRef.current) {
      gsap.fromTo(
        '.toast-item:last-child',
        { opacity: 0, y: -20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'back.out(1.5)' }
      );
    }
  }, [toasts]);

  if (toasts.length === 0) return null;

  return (
    <div
      ref={toastContainerRef}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 max-w-sm w-full px-4 pointer-events-none"
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success' || !toast.type;
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`toast-item pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl glass-panel shadow-2xl border transition-all ${
              isSuccess
                ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-200'
                : isError
                ? 'border-red-500/40 bg-red-950/40 text-red-200'
                : 'border-gold/40 bg-gold/10 text-gold-light'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
              {isError && <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
              {!isSuccess && !isError && <Info className="w-4 h-4 text-gold flex-shrink-0" />}
              <span className="text-xs font-medium truncate">{toast.message}</span>
            </div>

            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="p-1 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
              aria-label="Fermer la notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
