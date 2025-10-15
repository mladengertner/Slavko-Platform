
import React from 'react';

export const SkeletonCard: React.FC = () => (
  <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl rounded-2xl shadow-lg border border-zinc-200/50 dark:border-zinc-800/50 p-6 animate-pulse">
    <div className="flex items-center justify-between mb-2">
        <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
        <div className="rounded-lg bg-zinc-200 dark:bg-zinc-800 h-8 w-8" />
    </div>
    <div className="h-8 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-md mb-2" />
    <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full my-3" />
    <div className="flex justify-between items-center mt-3">
      <div className="h-3 w-28 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
      <div className="h-3 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
    </div>
  </div>
);
