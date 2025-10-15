import React from 'react';

interface ProgressProps {
    value: number;
    color?: 'gray' | 'red' | 'yellow' | 'green' | 'blue' | 'purple';
    inProgress?: boolean;
}

export const Progress: React.FC<ProgressProps> = ({ value, color = 'blue', inProgress }) => {
    const colors = {
        gray: 'bg-gray-400',
        red: 'bg-red-500',
        yellow: 'bg-yellow-500',
        green: 'bg-green-500',
        blue: 'bg-blue-500',
        purple: 'bg-purple-500',
    };

    const inProgressClass = inProgress ? 'animate-pulse' : '';

    return (
        <div className="w-full bg-slate-700/50 rounded-full h-2 my-2 overflow-hidden">
            <div
                className={`${colors[color]} h-2 rounded-full transition-all duration-500 ease-out ${inProgressClass}`}
                style={{ width: `${value}%` }}
            />
        </div>
    );
};