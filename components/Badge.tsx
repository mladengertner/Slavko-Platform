import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    color?: 'gray' | 'red' | 'yellow' | 'green' | 'blue' | 'purple';
}

export const Badge: React.FC<BadgeProps> = ({ children, color = 'gray', className, ...props }) => {
    const colors = {
        gray: 'bg-gray-700 text-gray-200',
        red: 'bg-red-500/30 text-red-300',
        yellow: 'bg-yellow-500/30 text-yellow-300',
        green: 'bg-green-500/30 text-green-300',
        blue: 'bg-blue-500/30 text-blue-300',
        purple: 'bg-purple-500/30 text-purple-300',
    };

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors[color]} ${className}`}
            {...props}
        >
            {children}
        </span>
    );
};