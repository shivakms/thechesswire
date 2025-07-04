//File: /src/components/ui/Toast.tsx
'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';

// Toast store
let toastCounter = 0;
const toastListeners = new Set<(toasts: Toast[]) => void>();
const toasts: Toast[] = [];

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

export function toast(message: string, type: Toast['type'] = 'info', duration = 4000) {
  const id = `toast-${++toastCounter}`;
  const newToast: Toast = { id, type, message, duration };
  
  toasts.push(newToast);
  toastListeners.forEach(listener => listener([...toasts]));
  
  if (duration > 0) {
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }
}

toast.success = (message: string, duration?: number) => toast(message, 'success', duration);
toast.error = (message: string, duration?: number) => toast(message, 'error', duration);
toast.info = (message: string, duration?: number) => toast(message, 'info', duration);
toast.warning = (message: string, duration?: number) => toast(message, 'warning', duration);

function removeToast(id: string) {
  const index = toasts.findIndex(t => t.id === id);
  if (index > -1) {
    toasts.splice(index, 1);
    toastListeners.forEach(listener => listener([...toasts]));
  }
}

export function ToastContainer() {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>([]);

  useEffect(() => {
    toastListeners.add(setCurrentToasts);
    return () => {
      toastListeners.delete(setCurrentToasts);
    };
  }, []);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />
  };

  const colors = {
    success: 'bg-green-900/90 border-green-600',
    error: 'bg-red-900/90 border-red-600',
    info: 'bg-blue-900/90 border-blue-600',
    warning: 'bg-yellow-900/90 border-yellow-600'
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 pointer-events-none">
      {currentToasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm text-white shadow-xl min-w-[300px] max-w-[500px] animate-slide-in ${colors[toast.type]}`}
        >
          {icons[toast.type]}
          <p className="flex-1 text-sm">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}