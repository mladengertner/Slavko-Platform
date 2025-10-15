import React from 'react';
import type { UserProfile } from '../types';
import { MILESTONES } from '../lib/milestones';

export const MilestoneTracker = ({ user }: { user: UserProfile }) => {
  const buildsUsed = user.usage.buildsStarted;
  const nextMilestoneThreshold = Object.keys(MILESTONES)
    .map(Number)
    .find(threshold => buildsUsed < threshold);

  if (!nextMilestoneThreshold) {
      return (
          <div className="p-4 bg-white/5 rounded-lg text-center">
              <h4 className="text-white font-semibold mb-2">🏆 All Milestones Unlocked!</h4>
              <p className="text-gray-400 text-sm">You're a true InnovaForge master!</p>
          </div>
      );
  }

  const nextMilestone = MILESTONES[nextMilestoneThreshold];
  const percentage = (buildsUsed / nextMilestoneThreshold) * 100;
  
  return (
    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
      <h4 className="text-white font-semibold mb-2">🎯 Next Milestone</h4>
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full transition-all"
            style={{ 
              width: `${percentage}%` 
            }}
          />
        </div>
        <span className="text-white text-sm font-mono">
          {buildsUsed}/{nextMilestoneThreshold}
        </span>
      </div>
      <p className="text-gray-400 text-xs mt-2">
        {nextMilestone.message}
      </p>
    </div>
  );
};
