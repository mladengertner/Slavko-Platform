import React, { useState } from 'react';
import { CheckIcon, Loader2Icon } from './icons';

const MetricDisplay: React.FC<{ label: string; value: string; status?: 'good' | 'warning' | 'bad' }> = ({ label, value, status }) => {
    const statusColors = {
        good: 'text-green-400',
        warning: 'text-yellow-400',
        bad: 'text-red-400',
    };
    const colorClass = status ? statusColors[status] : 'text-white';

    return (
        <div className="p-3 bg-slate-800/50 rounded-lg text-center">
            <p className="text-xs text-slate-400">{label}</p>
            <p className={`text-xl font-bold font-mono ${colorClass}`}>{value}</p>
        </div>
    );
};

const ChecklistItem: React.FC<{ children: React.ReactNode; defaultChecked?: boolean }> = ({ children, defaultChecked = false }) => {
    const [checked, setChecked] = useState(defaultChecked);

    return (
        <li className="flex items-center gap-3">
            <button
                onClick={() => setChecked(!checked)}
                className={`w-5 h-5 flex-shrink-0 rounded-md border-2 flex items-center justify-center transition-colors ${
                    checked ? 'bg-purple-600 border-purple-600' : 'border-slate-500 bg-slate-700/50'
                }`}
                aria-checked={checked}
            >
                {checked && <CheckIcon className="w-4 h-4 text-white" />}
            </button>
            <span className={`text-sm ${checked ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                {children}
            </span>
        </li>
    );
};

export const ValidationHub: React.FC = () => {
    return (
        <div className="p-6 bg-slate-900/50 backdrop-blur border border-slate-700/50 rounded-2xl shadow-lg h-full flex flex-col">
            <h3 className="text-lg font-bold text-white mb-4">🚀 90-Day Validation Mission Control</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left side: Checklist */}
                <div className="bg-slate-800/40 p-4 rounded-lg">
                    <h4 className="font-semibold text-slate-200 mb-3">✅ Week 1 Checklist</h4>
                    <ul className="space-y-2">
                        <ChecklistItem defaultChecked>Setup Vercel account</ChecklistItem>
                        <ChecklistItem defaultChecked>Deploy Next.js app</ChecklistItem>
                        <ChecklistItem>Configure Vercel KV & Gemini API</ChecklistItem>
                        <ChecklistItem>Setup PostHog Analytics</ChecklistItem>
                        <ChecklistItem>Invite 10 beta users</ChecklistItem>
                    </ul>
                </div>

                {/* Right side: Key Metrics */}
                <div className="bg-slate-800/40 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold text-slate-200">📊 Key Validation Metrics</h4>
                        <span className="flex items-center text-xs text-green-400">
                            <span className="relative flex h-2 w-2 mr-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            Live
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <MetricDisplay label="CAC" value="$0.50" status="good" />
                        <MetricDisplay label="LTV/CAC" value="400" status="good" />
                        <MetricDisplay label="Viral Coeff (K)" value="1.8" status="good" />
                        <MetricDisplay label="Churn" value="3%" status="good" />
                        <MetricDisplay label="Conv. Rate" value="5.0%" status="warning" />
                        <MetricDisplay label="Cost/User" value="$0.005" status="good" />
                    </div>
                </div>
            </div>
        </div>
    );
};
