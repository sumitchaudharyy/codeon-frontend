import { createContext, useContext, useState, ReactNode } from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error("useConfirm must be used within ConfirmProvider");
  return context;
};

export const ConfirmProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({
    title: "",
    message: "",
  });
  const [resolvePromise, setResolvePromise] = useState<(value: boolean) => void>(() => () => {});

  const confirm = (opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts);
    setIsOpen(true);
    return new Promise((resolve) => {
      setResolvePromise(() => resolve);
    });
  };

  const handleConfirm = () => {
    resolvePromise(true);
    setIsOpen(false);
  };

  const handleCancel = () => {
    resolvePromise(false);
    setIsOpen(false);
  };

  const typeConfig = {
    danger: {
      iconBg: "bg-red-500/20",
      iconColor: "text-red-500",
      confirmBg: "bg-red-600 hover:bg-red-700",
    },
    warning: {
      iconBg: "bg-yellow-500/20",
      iconColor: "text-yellow-500",
      confirmBg: "bg-yellow-600 hover:bg-yellow-700",
    },
    info: {
      iconBg: "bg-blue-500/20",
      iconColor: "text-blue-500",
      confirmBg: "bg-blue-600 hover:bg-blue-700",
    },
  };

  const config = typeConfig[options.type || "danger"];

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 animate-fade-in">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleCancel}
          />

          {/* Modal */}
          <div className="relative bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
            {/* Close Button */}
            <button
              onClick={handleCancel}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon */}
            <div className={`w-16 h-16 ${config.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <AlertTriangle className={`w-8 h-8 ${config.iconColor}`} />
            </div>

            {/* Content */}
            <h3 className="text-xl font-bold text-white text-center mb-2">
              {options.title}
            </h3>
            <p className="text-gray-400 text-center mb-6">
              {options.message}
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-semibold transition"
              >
                {options.cancelText || "Cancel"}
              </button>
              <button
                onClick={handleConfirm}
                className={`flex-1 px-4 py-2.5 ${config.confirmBg} text-white rounded-lg font-semibold transition`}
              >
                {options.confirmText || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};