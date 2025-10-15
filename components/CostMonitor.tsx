import React, { useEffect, useState, useContext } from 'react';
import { api } from '../lib/api';
import { AuthContext } from '../contexts/AuthContext';
import { VercelIcon, DatabaseIcon, SparklesIcon, DollarSignIcon, Loader2Icon } from './icons';
import type { CostMetrics } from '../types';

const CostCard: React.FC<{ title: string, value: string, icon: React.ReactNode, alert?: boolean }> = ({ title, value, icon, alert }) => (
    <div className={`p-6 bg-slate-800/50 backdrop-blur border rounded-2xl shadow-lg ${alert ? 'border-red-500/50' : 'border-slate-700/50'}`}>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                 <div className={`w-8 h-8 ${alert ? 'text-red-400' : 'text-slate-400'}`}>{icon}</div>
                <div>
                    <p className="text-slate-400 text-sm">{title}</p>
                    <p className={`text-2xl font-bold font-mono ${alert ? 'text-red-400' : 'text-white'}`}>{value}</p>
                </div>
            </div>
        </div>
    </div>
);

export const CostMonitor: React.FC = () => {
    const [costs, setCosts] = useState<CostMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchCosts = async () => {
            try {
                // In a real app, we'd get total users from another source or pass it
                const totalUsers = 1000; // Mocking for per-user calculation

                const [vercelRes, kvRes, geminiRes] = await Promise.all([
                    api.get<{ cost: number }>('/api/admin/costs/vercel'),
                    api.get<{ cost: number }>('/api/admin/costs/kv'),
                    api.get<{ cost: number }>('/api/admin/costs/gemini'),
                ]);

                const total = vercelRes.cost + kvRes.cost + geminiRes.cost;
                
                setCosts({
                    vercel: vercelRes.cost,
                    kv: kvRes.cost,
                    gemini: geminiRes.cost,
                    total: total,
                    perUser: total / totalUsers,
                });
            } catch (error) {
                console.error("Failed to fetch cost metrics", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCosts();
        const interval = setInterval(fetchCosts, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);

    }, [user]);

    if (loading || !costs) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="p-6 h-24 bg-slate-800 rounded-2xl"></div>
                ))}
            </div>
        );
    }

    const costPerUserAlert = costs.perUser > 0.01;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <CostCard title="Vercel (Hosting)" value={`$${costs.vercel.toFixed(2)}`} icon={<VercelIcon className="w-6 h-6" />} />
            <CostCard title="Vercel KV (DB)" value={`$${costs.kv.toFixed(2)}`} icon={<DatabaseIcon />} />
            <CostCard title="Gemini API" value={`$${costs.gemini.toFixed(2)}`} icon={<SparklesIcon />} />
            <CostCard 
                title="Cost / User / Mo" 
                value={`$${costs.perUser.toFixed(4)}`} 
                icon={<DollarSignIcon />}
                alert={costPerUserAlert}
            />
        </div>
    );
};
