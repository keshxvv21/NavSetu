'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl border shadow-lg transition-all animate-in slide-in-from-bottom-5 bg-white ${
              toast.type === 'success'
                ? 'border-emerald-300 text-slate-900'
                : toast.type === 'error'
                ? 'border-rose-300 text-slate-900'
                : 'border-slate-300 text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5 text-xs font-semibold">
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
              {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-blue-600 shrink-0" />}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      showToast: (msg: string) => console.log('Toast:', msg),
    };
  }
  return context;
}
