import React from 'react';
import type { UserUsage, UserLimits } from '../types';

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
  message: string;
  usage: UserUsage | null;
  limits: UserLimits | null;
}

export function PaywallModal({
  open,
  onClose,
  message,
  usage,
  limits,
}: PaywallModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-gradient-to-br from-slate-900 via-slate-800 to-purple-900/50 p-8 rounded-2xl max-w-md w-full m-4 border border-purple-700/50 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">🚀</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Upgrade to Unleash More Power
          </h2>
          <p className="text-slate-300">{message}</p>
        </div>

        {usage && limits && (
            <div className="bg-black/30 rounded-lg p-4 mb-6 border border-slate-700">
                <div className="text-sm text-slate-400 mb-2">Your Current Usage:</div>
                <div className="space-y-2">
                    <div className="flex justify-between text-white">
                    <span>Ideas:</span>
                    <span className="font-mono">
                        {usage.ideasGenerated}/{limits.ideasPerMonth}
                    </span>
                    </div>
                    <div className="flex justify-between text-white">
                    <span>Builds:</span>
                    <span className="font-mono">
                        {usage.buildsStarted}/{limits.buildsPerMonth}
                    </span>
                    </div>
                    <div className="flex justify-between text-white">
                    <span>Projects:</span>
                    <span className="font-mono">
                        {usage.activeProjects}/{limits.maxActiveProjects}
                    </span>
                    </div>
                </div>
            </div>
        )}

        <div className="space-y-3">
          <a
            href="#/pricing"
            className="w-full block text-center bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-lg"
          >
            Upgrade to Founder ($49/mo)
          </a>
          <button
            className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-lg"
            onClick={onClose}
          >
            Maybe Later
          </button>
        </div>

        <div className="mt-6 text-xs text-slate-400 text-center">
          Founder plan includes: 50 ideas, 20 builds/month, 5 projects, faster builds & more!
        </div>
      </div>
    </div>
  );
}