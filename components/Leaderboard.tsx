import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Loader2Icon } from './icons';

interface Leader {
    id: string;
    email: string;
    builds: number;
    deployments: number;
    fastestBuild: number;
}

export const Leaderboard = () => {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaders = async () => {
        try {
            setLoading(true);
            const data = await api.get<Leader[]>('/api/leaderboard');
            setLeaders(data);
        } catch (error) {
            console.error("Failed to fetch leaderboard", error);
        } finally {
            setLoading(false);
        }
    };
    fetchLeaders();
  }, []);

  if (loading) {
      return (
          <div className="p-6 bg-white/5 rounded-xl border border-white/10 h-64 flex items-center justify-center">
              <Loader2Icon className="w-6 h-6 animate-spin" />
              <span className="ml-3">Loading Leaderboard...</span>
          </div>
      );
  }

  return (
    <div className="p-4 sm:p-6 bg-white/5 rounded-xl border border-white/10">
      <h3 className="text-white font-bold text-lg mb-4">🏆 Top Builders</h3>
      
      <div className="space-y-3">
        {leaders.map((user, index) => (
          <div 
            key={user.id}
            className={`flex items-center justify-between p-3 rounded-lg ${
              index === 0 ? 'bg-yellow-500/20 border border-yellow-500/30' :
              index === 1 ? 'bg-gray-400/20 border border-gray-400/30' :
              index === 2 ? 'bg-orange-500/20 border border-orange-500/30' :
              'bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                index === 0 ? 'bg-yellow-500 text-black' : 
                index === 1 ? 'bg-gray-400 text-black' : 
                index === 2 ? 'bg-orange-600 text-white' : 'bg-white/10 text-white'
              }`}>
                {index + 1}
              </div>
              <div>
                <p className="text-white text-sm font-medium">
                  {user.email.split('@')[0]}
                </p>
                <p className="text-gray-400 text-xs">
                  {user.deployments} deployments
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-white text-sm font-bold">{user.builds} builds</p>
              <p className="text-gray-400 text-xs">
                Fastest: {user.fastestBuild}s
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
