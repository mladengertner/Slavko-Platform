
import React from 'react';
import type { StatusLevel } from '../types';

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  status: StatusLevel;
  description: string;
  progress?: number;
  threshold?: string;
}

const statusStyles: Record<StatusLevel, { icon: string; text: string; bg: string; progress: string }> = {
    normal: {
        icon: 'text-green-500',
        text: 'text-green-500',
        bg: 'bg-green-500/10',
        progress: 'bg-green-500'
    },
    warning: {
        icon: 'text-yellow-500',
        text: 'text-yellow-500',
        bg: 'bg-yellow-500/10',
        progress: 'bg-yellow-500'
    },
    critical: {
        icon: 'text-red-500',
        text: 'text-red-500',
        bg: 'bg-red-500/10',
        progress: 'bg-red-500'
    }
};

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, status, description, progress, threshold }) => {
    const styles = statusStyles[status];

    return (
        <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl rounded-2xl shadow-lg border border-zinc-200/50 dark:border-zinc-800/50 p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-zinc-600 dark:text-zinc-400">{title}</p>
                <div className={`h-8 w-8 grid place-items-center rounded-lg ${styles.bg}`}>
                    <div className={`h-5 w-5 ${styles.icon}`}>
                        {icon}
                    </div>
                </div>
            </div>
            <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">{value}</p>
            {progress !== undefined && (
                <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-1.5 my-3">
                    <div className={`${styles.progress} h-1.5 rounded-full transition-all duration-500`} style={{ width: `${progress}%` }}></div>
                </div>
            )}
            <div className="flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400 mt-3">
                <span>{description}</span>
                {threshold && <span className={`font-semibold ${styles.text}`}>{threshold}</span>}
            </div>
        </div>
    );
};
