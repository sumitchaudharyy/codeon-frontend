import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, title: string, message?: string, duration = 4000) => {
      const id = Date.now().toString() + Math.random();
      const newToast: Toast = { id, type, title, message, duration };
      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast]
  );

  const success = (title: string, message?: string) => showToast("success", title, message);
  const error = (title: string, message?: string) => showToast("error", title, message);
  const warning = (title: string, message?: string) => showToast("warning", title, message);
  const info = (title: string, message?: string) => showToast("info", title, message);

  const config = {
    success: {
      icon: CheckCircle,
      bg: "bg-gradient-to-r from-green-500/20 to-emerald-500/20",
      border: "border-green-500/50",
      iconColor: "text-green-400",
      progressBar: "bg-green-500",
    },
    error: {
      icon: XCircle,
      bg: "bg-gradient-to-r from-red-500/20 to-pink-500/20",
      border: "border-red-500/50",
      iconColor: "text-red-400",
      progressBar: "bg-red-500",
    },
    warning: {
      icon: AlertTriangle,
      bg: "bg-gradient-to-r from-yellow-500/20 to-orange-500/20",
      border: "border-yellow-500/50",
      iconColor: "text-yellow-400",
      progressBar: "bg-yellow-500",
    },
    info: {
      icon: Info,
      bg: "bg-gradient-to-r from-blue-500/20 to-cyan-500/20",
      border: "border-blue-500/50",
      iconColor: "text-blue-400",
      progressBar: "bg-blue-500",
    },
  };

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-md w-full pointer-events-none">
        {toasts.map((toast) => {
          const { icon: Icon, bg, border, iconColor, progressBar } = config[toast.type];

          return (
            <div
              key={toast.id}
              className={`${bg} ${border} border backdrop-blur-lg rounded-xl shadow-2xl overflow-hidden pointer-events-auto animate-slide-in-right`}
            >
              <div className="p-4 flex items-start gap-3">
                <div className={`${iconColor} flex-shrink-0 mt-0.5`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-white text-sm">{toast.title}</h4>
                  {toast.message && (
                    <p className="text-gray-300 text-xs mt-1">{toast.message}</p>
                  )}
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-gray-400 hover:text-white transition flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Progress Bar */}
              {toast.duration && toast.duration > 0 && (
                <div className="h-1 bg-white/10 relative overflow-hidden">
                  <div
                    className={`${progressBar} h-full animate-progress origin-left`}
                    style={{ animationDuration: `${toast.duration}ms` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};