import React, { useState, useEffect } from 'react';
import type { UserProfile } from '../types';

export const TimeSensitiveOffer = ({ user }: { user: UserProfile }) => {
  const [timeLeft, setTimeLeft] = useState(24 * 60 * 60); 

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hasDeployed = user.usage.activeProjects > 0;
  if (user.plan !== 'free' || !hasDeployed) return null;

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg">
      <div className="flex flex-col sm:flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white font-bold">⚡ LIMITED TIME OFFER</span>
            <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-mono">
              {formatTime(timeLeft)}
            </span>
          </div>
          <p className="text-yellow-200 text-sm list-disc list-inside mt-1">
            Upgrade now and get +2 bonus builds and 1 month free storage!
          </p>
        </div>
        <a 
          href="#/pricing"
          className="mt-3 sm:mt-0 w-full sm:w-auto shrink-0 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded font-semibold"
        >
          Upgrade Now
        </a>
      </div>
    </div>
  );
};
