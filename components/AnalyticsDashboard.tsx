import React, { useEffect, useState } from 'react';
import { AnalyticsMetrics } from '../types';
import { UsersIcon, ZapIcon, DollarSignIcon, TrendingUpIcon, Loader2Icon } from './icons';

const Stat: React.FC<{ title: string, value: string | number, icon: React.ReactNode, colorClass: string }> = ({ title, value, icon, colorClass }) => (
    <div className={`p-6 bg-gradient-to-br from-${colorClass}-500/20 to-${colorClass}-600/20 border-${colorClass}-500/30 rounded-2xl`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">{title}</p>
            <p className="text-3xl font-bold text-white">{value}</p>
          </div>
          <div className={`w-10 h-10 text-${colorClass}-400`}>
            {icon}
          </div>
        </div>
      </div>
);

const AnalyticsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This would fetch from a real backend endpoint, e.g., /api/analytics/metrics
    // For now, we'll simulate a fetch.
    const fetchMetrics = async () => {
        setLoading(true);
        await new Promise(res => setTimeout(res, 1500)); // Simulate network delay
        setMetrics({
            totalUsers: 1247,
            activeBuilds: 16,
            revenue: 2958,
            conversionRate: 4.2
        });
        setLoading(false);
    };
    
    fetchMetrics();
  }, []);

  if (loading) {
      return (
          <div className="flex items-center justify-center p-12 bg-white/5 rounded-2xl">
              <Loader2Icon className="w-8 h-8 text-white animate-spin" />
              <p className="ml-4 text-lg">Loading Analytics Data...</p>
          </div>
      );
  }

  if (!metrics) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Stat title="Total Users" value={metrics.totalUsers} icon={<UsersIcon />} colorClass="blue" />
      <Stat title="Active Builds" value={metrics.activeBuilds} icon={<ZapIcon />} colorClass="purple" />
      <Stat title="Revenue (MRR)" value={`$${metrics.revenue.toLocaleString()}`} icon={<DollarSignIcon />} colorClass="green" />
      <Stat title="Conversion Rate" value={`${metrics.conversionRate}%`} icon={<TrendingUpIcon />} colorClass="yellow" />
    </div>
  );
};

export default AnalyticsDashboard;