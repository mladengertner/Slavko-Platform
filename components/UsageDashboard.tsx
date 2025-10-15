import React, { useContext } from 'react';
import { UsageProgressBar } from "./UsageProgressBar";
import type { UserProfile } from '../types';
import { Loader2Icon } from './icons';
import { AuthContext } from '../contexts/AuthContext';

export function UsageDashboard({ user, loading }: { user: UserProfile | null, loading: boolean }) {
  const { signOutUser } = useContext(AuthContext);

  if (loading) {
      return (
          <div className="p-6 bg-slate-900/50 border border-slate-700 rounded-2xl flex items-center justify-center h-full">
              <Loader2Icon className="w-6 h-6 animate-spin text-white" />
              <span className="ml-3 text-slate-300">Loading user data...</span>
          </div>
      );
  }

  if (!user) {
    return <div className="p-6 bg-slate-900/50 border border-slate-700 rounded-2xl text-slate-400">Could not load user data.</div>;
  }
  
  return (
    <div className="p-6 bg-slate-900/50 backdrop-blur border border-slate-700/50 rounded-2xl shadow-lg h-full flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div>
            <h3 className="text-lg font-bold text-white">Your Usage</h3>
            <p className="text-xs text-slate-400 truncate max-w-[150px]">{user.email}</p>
        </div>
        <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-xs font-bold uppercase flex-shrink-0">
          {user.plan} Plan
        </span>
      </div>

      <div className="flex-grow">
        <UsageProgressBar
          used={user.usage.ideasGenerated}
          limit={user.limits.ideasPerMonth}
          label="Ideas this month"
        />

        <UsageProgressBar
          used={user.usage.buildsStarted}
          limit={user.limits.buildsPerMonth}
          label="Builds this month"
        />

        <UsageProgressBar
          used={user.usage.activeProjects}
          limit={user.limits.maxActiveProjects}
          label="Active projects"
        />
      </div>

      <div className="mt-4 flex gap-2">
         {(user.plan === "free" || user.plan === "founder") && (
            <a
            href="#/pricing"
            className="w-full inline-flex items-center justify-center px-4 py-2 font-semibold rounded-md bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
            Upgrade
            </a>
         )}
         <button onClick={signOutUser} className="w-full bg-white/10 hover:bg-white/20 text-slate-300 font-semibold py-2 px-4 rounded-md">
            Sign Out
         </button>
      </div>

    </div>
  );
}