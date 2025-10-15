import React from 'react';

export function UsageProgressBar({ used, limit, label }: {
  used: number;
  limit: number;
  label: string;
}) {
  const percentage = (used / limit) * 100;
  const isNearLimit = percentage >= 80;

  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-400">{label}</span>
        <span className={`font-mono ${isNearLimit ? "text-yellow-400" : "text-slate-300"}`}>
          {used}/{limit}
        </span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full transition-all ${
            isNearLimit ? "bg-yellow-400" : "bg-cyan-500"
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      {isNearLimit && used < limit && (
        <div className="text-xs text-yellow-400 mt-1">
          ⚠️ You're running low. Consider upgrading.
        </div>
      )}
    </div>
  );
}