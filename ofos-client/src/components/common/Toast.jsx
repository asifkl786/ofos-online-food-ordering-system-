import { useEffect, useState } from 'react';
import { 
  FiCheckCircle, 
  FiAlertCircle, 
  FiInfo, 
  FiXCircle, 
  FiX 
} from 'react-icons/fi';

const toastTypes = {
  success: {
    icon: FiCheckCircle,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-500',
    textColor: 'text-green-800',
    iconColor: 'text-green-500',
  },
  error: {
    icon: FiAlertCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-500',
    textColor: 'text-red-800',
    iconColor: 'text-red-500',
  },
  warning: {
    icon: FiAlertCircle,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-500',
    textColor: 'text-yellow-800',
    iconColor: 'text-yellow-500',
  },
  info: {
    icon: FiInfo,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-800',
    iconColor: 'text-blue-500',
  },
};

export const Toast = ({ id, type = 'info', title, message, duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const Icon = toastTypes[type].icon;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(id), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, id, onClose]);

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className={`
        flex items-start space-x-3 p-4 rounded-lg shadow-lg border-l-4
        ${toastTypes[type].bgColor}
        ${toastTypes[type].borderColor}
        min-w-[320px] max-w-md
      `}>
        <Icon className={`w-5 h-5 ${toastTypes[type].iconColor} mt-0.5`} />
        <div className="flex-1">
          {title && (
            <h4 className={`font-semibold ${toastTypes[type].textColor}`}>
              {title}
            </h4>
          )}
          <p className={`text-sm ${toastTypes[type].textColor} opacity-90`}>
            {message}
          </p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onClose(id), 300);
          }}
          className={`${toastTypes[type].textColor} hover:opacity-70 transition-opacity`}
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Toast Container Component
export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col space-y-3">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          duration={toast.duration}
          onClose={removeToast}
        />
      ))}
    </div>
  );
};

// Custom Toast Hook
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = ({ type, title, message, duration = 5000 }) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, title, message, duration }]);
    return id;
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const success = (message, title = 'Success') => {
    return addToast({ type: 'success', title, message });
  };

  const error = (message, title = 'Error') => {
    return addToast({ type: 'error', title, message });
  };

  const warning = (message, title = 'Warning') => {
    return addToast({ type: 'warning', title, message });
  };

  const info = (message, title = 'Info') => {
    return addToast({ type: 'info', title, message });
  };

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
};

// Default export
export default Toast;