import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

interface Deployment {
  id: string;
  longitude: number;
  latitude: number;
  project: string;
  user: string;
}

export const QuantumBuildWorldMap = () => {
  const [deployments, setDeployments] = useState<Deployment[]>([]);

  useEffect(() => {
    const fetchDeployments = async () => {
      try {
        const data = await api.get<Deployment[]>('/api/deployments/global');
        setDeployments(data);
      } catch (error) {
        console.error("Failed to fetch deployments", error);
      }
    };
    
    fetchDeployments();
    const interval = setInterval(fetchDeployments, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 sm:p-6 bg-white/5 rounded-xl border border-white/10">
      <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
        🌍 Live Deployments
        <span className="bg-green-500/80 text-white px-2 py-0.5 rounded text-xs font-semibold">
          {deployments.length} active
        </span>
      </h3>
      
      <div className="relative h-48 sm:h-64 bg-slate-800 rounded-lg overflow-hidden">
        {/* Basic world map placeholder */}
        <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
            <p className="text-slate-600">Global Deployment Map</p>
        </div>
        
        {deployments.map((deployment) => (
          <div
            key={deployment.id}
            className="absolute w-3 h-3 -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${deployment.longitude}%`,
              top: `${deployment.latitude}%`,
            }}
            title={`${deployment.project} by ${deployment.user}`}
          >
            <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75" />
            <div className="relative w-full h-full bg-green-500 rounded-full border-2 border-white/50" />
          </div>
        ))}
      </div>
      
      <p className="text-gray-400 text-xs mt-3 text-center">
        Real-time projects deploying worldwide via QuantumBuild™
      </p>
    </div>
  );
};
