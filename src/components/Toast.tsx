import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, type, duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Allow time for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = 
    type === 'success' ? 'bg-green-50 dark:bg-green-900/20' :
    type === 'error' ? 'bg-red-50 dark:bg-red-900/20' :
    'bg-blue-50 dark:bg-blue-900/20';

  const textColor = 
    type === 'success' ? 'text-green-600 dark:text-green-400' :
    type === 'error' ? 'text-red-600 dark:text-red-400' :
    'text-blue-600 dark:text-blue-400';

  const borderColor = 
    type === 'success' ? 'border-green-200 dark:border-green-800' :
    type === 'error' ? 'border-red-200 dark:border-red-800' :
    'border-blue-200 dark:border-blue-800';

  const icon = 
    type === 'success' ? <CheckCircle className="w-5 h-5" /> :
    type === 'error' ? <AlertCircle className="w-5 h-5" /> :
    <AlertCircle className="w-5 h-5" />;

  return (
    <div 
      className={`fixed bottom-4 right-4 flex items-center p-4 rounded-lg border shadow-lg transition-all duration-300 ${bgColor} ${borderColor} ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      <div className={`mr-3 ${textColor}`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className={`text-sm font-medium ${textColor}`}>{message}</p>
      </div>
      <button 
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        className={`ml-4 ${textColor} hover:text-opacity-80`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

interface ToastProviderProps {
  children: React.ReactNode;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType, duration?: number) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: ToastType; duration?: number }>>([]);

  const showToast = (message: string, type: ToastType, duration?: number) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}