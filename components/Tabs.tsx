import React from 'react';

interface TabsProps {
    children: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({ children }) => {
    const tabCount = React.Children.count(children);
    return (
        <div className="w-full">
            <div className={`grid w-full grid-cols-${tabCount} bg-white/5 backdrop-blur rounded-lg p-1`}>
                {children}
            </div>
        </div>
    );
};

interface TabProps {
    label: string;
    isActive: boolean;
    onClick: () => void;
}

export const Tab: React.FC<TabProps> = ({ label, isActive, onClick }) => {
    const activeClasses = 'bg-slate-700/50 text-white';
    const inactiveClasses = 'text-gray-400 hover:bg-slate-800/60 hover:text-gray-200';

    return (
        <button
            onClick={onClick}
            className={`w-full whitespace-nowrap py-2.5 px-1 font-semibold text-sm rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${isActive ? activeClasses : inactiveClasses}`}
            aria-current={isActive ? 'page' : undefined}
        >
            {label}
        </button>
    );
};