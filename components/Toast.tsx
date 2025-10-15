import React from 'react';
import { useToast } from '../hooks/useToast';
import { CheckCircle2Icon, AlertTriangleIcon, XIcon } from './icons';

const toastStyles = {
  error: {
    icon: <AlertTriangleIcon />,
    iconColor: 'text-red-400',
    iconBg: 'bg-red-500/10',
  },
  success: {
    icon: <CheckCircle2Icon />,
    iconColor: 'text-green-400',
    iconBg: 'bg-green-500/10',
  },
  info: {
    icon: <AlertTriangleIcon />,
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/10',
  },
};

export const Toaster: React.FC = () => {
  const { toasts } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
      {toasts.map((toast) => (
        <Toast key={toast.id} id={toast.id} message={toast.message} type={toast.type} />
      ))}
    </div>
  );
};


interface ToastProps {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info';
}

const Toast: React.FC<ToastProps> = ({ id, message, type }) => {
    const { removeToast } = useToast();
    const styles = toastStyles[type];

    return (
        <div 
        className="animate-fade-in-up flex items-center w-full max-w-sm p-4 text-zinc-200 bg-slate-800 rounded-lg shadow-2xl border border-slate-700" 
        role="alert">
            <div className={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 ${styles.iconColor} ${styles.iconBg} rounded-lg`}>
                {styles.icon}
            </div>
            <div className="ml-3 text-sm font-medium">{message}</div>
            <button 
                type="button" 
                className="ml-auto -mx-1.5 -my-1.5 text-zinc-400 hover:text-white rounded-lg focus:ring-2 focus:ring-slate-600 p-1.5 hover:bg-slate-700 inline-flex h-8 w-8" 
                aria-label="Close"
                onClick={() => removeToast(id)}
            >
                <span className="sr-only">Close</span>
                <XIcon />
            </button>
            <style>{`
                @keyframes fade-in-up {
                    0% {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};