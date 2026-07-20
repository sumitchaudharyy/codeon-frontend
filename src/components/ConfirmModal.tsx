import { AlertTriangle, X } from "lucide-react";
import { useEffect } from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "warning" | "danger" | "info";
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title = "Are you sure?",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const colors = {
    warning: {
      icon: "text-yellow-500",
      iconBg: "bg-yellow-500/10",
      button: "bg-yellow-500 hover:bg-yellow-600",
    },
    danger: {
      icon: "text-red-500",
      iconBg: "bg-red-500/10",
      button: "bg-red-500 hover:bg-red-600",
    },
    info: {
      icon: "text-blue-500",
      iconBg: "bg-blue-500/10",
      button: "bg-blue-500 hover:bg-blue-600",
    },
  };

  const color = colors[type];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 animate-fadeIn"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="relative bg-[#1e293b] border border-[#334155] rounded-2xl shadow-2xl max-w-md w-full pointer-events-auto animate-slideUp"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 text-slate-500 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className={`${color.iconBg} p-3 rounded-full flex-shrink-0`}>
                <AlertTriangle className={`w-6 h-6 ${color.icon}`} />
              </div>

              <div className="flex-1 pt-1">
                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {message}
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={onCancel}
                className="px-5 py-2.5 rounded-lg bg-[#334155] text-slate-300 hover:bg-[#475569] font-medium transition"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={`px-5 py-2.5 rounded-lg text-white font-medium transition ${color.button}`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}