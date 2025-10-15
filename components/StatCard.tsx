import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  iconColorClass: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, iconColorClass }) => {
    return (
        <div className="p-6 bg-white/10 backdrop-blur border border-white/20 hover:bg-white/15 transition-all rounded-2xl shadow-lg">
            <div className="flex items-center gap-4">
                <div className={`w-8 h-8 ${iconColorClass}`}>
                    {icon}
                </div>
                <div>
                    <p className="text-3xl font-bold text-white">{value}</p>
                    <p className="text-gray-300">{title}</p>
                </div>
            </div>
        </div>
    );
};
