import React, { useEffect, useState } from "react";
import Confetti from './Confetti';
import { useToast } from '../hooks/useToast';

const PHASES = [
  { name: "AI Synthesis", icon: "🤖", duration: 0.2 },
  { name: "Edge Deploy", icon: "🌐", duration: 0.8 },
  { name: "Atomic Swap", icon: "🔄", duration: 0.5 },
  { name: "Global Propagation", icon: "🌎", duration: 0.3 },
];

const LOGS = [
  "[0.00s] 🚀 QuantumBuild™ initiated...",
  "[0.20s] 🤖 AI Synthesis complete.",
  "[1.00s] 🌐 Edge Deploy complete.",
  "[1.50s] 🔄 Atomic Swap complete.",
  "[1.80s] 🌎 Global Propagation complete.",
  "[1.80s] ✅ App is LIVE worldwide!",
];

interface QuantumBuildVisualizerProps {
  onDone?: () => void;
}

export const QuantumBuildVisualizer: React.FC<QuantumBuildVisualizerProps> = ({ onDone }) => {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [logs, setLogs] = useState<string[]>([LOGS[0]]);
  const [done, setDone] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (done) return;
    if (currentPhase < PHASES.length) {
      const timeout = setTimeout(() => {
        setCurrentPhase((p) => p + 1);
        setLogs((l) => [...l, LOGS[currentPhase + 1]]);
      }, PHASES[currentPhase].duration * 1000);
      return () => clearTimeout(timeout);
    } else {
      setTimeout(() => {
        setDone(true);
        if (onDone) onDone();
      }, 500);
    }
  }, [currentPhase, done, onDone]);

  const totalTime = PHASES.reduce((acc, p) => acc + p.duration, 0);
  
  const handleShare = () => {
    const shareText = `🚀 I just launched a SaaS in ${totalTime.toFixed(2)}s with QuantumBuild™ by @InnovaForge! #WorldRecord innovaforge.com/quantumbuild`;
    navigator.clipboard.writeText(shareText);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-xl p-6 mb-6 shadow-2xl border border-blue-700/40 relative overflow-hidden">
      {done && <Confetti />}
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚡️</span>
          <span className="text-xl font-bold text-white tracking-wide">
            QuantumBuild™ Live
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-blue-300">Speed:</span>
          <span className="text-2xl font-mono text-cyan-400 animate-pulse">
            {totalTime.toFixed(2)}s
          </span>
          <span className="ml-2 px-2 py-1 bg-yellow-400/20 text-yellow-300 text-xs rounded uppercase font-bold tracking-wider">
            World Record
          </span>
        </div>
      </div>

       {/* Phases */}
       <div className="flex items-start justify-between mb-6">
          {PHASES.map((phase, i) => (
            <React.Fragment key={phase.name}>
              <div className="flex flex-col items-center text-center w-24">
                <div
                  className={`w-12 h-12 flex items-center justify-center rounded-full text-2xl font-bold border-4 transition-all duration-300
                    ${
                      i < currentPhase
                        ? "bg-green-500/80 border-green-400 shadow-lg scale-110"
                        : i === currentPhase
                        ? "bg-cyan-500/80 border-cyan-400 shadow-md animate-pulse scale-105"
                        : "bg-slate-700/60 border-slate-600"
                    }
                  `}
                >
                  {phase.icon}
                </div>
                <span
                  className={`mt-2 text-xs font-semibold ${
                    i <= currentPhase ? "text-white" : "text-slate-400"
                  }`}
                >
                  {phase.name}
                </span>
                <span className="text-[10px] text-slate-500">
                  {phase.duration}s
                </span>
              </div>
               {i < PHASES.length - 1 && (
                <div className="flex-1 h-1 bg-slate-600 mt-5 rounded-full relative overflow-hidden">
                  <div className={`h-full bg-gradient-to-r from-cyan-400 to-green-400 transition-all duration-300 ${i < currentPhase ? 'w-full' : 'w-0'}`} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

      {/* Animated World Map Visualization */}
      <div className="relative h-32 mb-6 flex items-center justify-center bg-black/30 border border-slate-700 rounded-lg overflow-hidden">
        <svg viewBox="0 0 400 120" className="w-96 h-28 opacity-70">
          <ellipse cx="200" cy="60" rx="180" ry="50" fill="#0ea5e9" fillOpacity="0.08" />
          {[...Array(20)].map((_, i) => (
            <circle
              key={i}
              cx={40 + i * 18}
              cy={60 + Math.sin(i / 3) * 30 + (Math.random() - 0.5) * 10}
              r={i <= (currentPhase / PHASES.length) * 20 ? 4 : 2}
              fill={i <= (currentPhase / PHASES.length) * 20 ? "#22d3ee" : "#334155"}
              className={i <= (currentPhase / PHASES.length) * 20 ? "animate-pulse" : ""}
              style={{ transition: 'all 0.5s ease' }}
            />
          ))}
        </svg>
        <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-cyan-200 font-mono text-xs bg-black/50 px-2 py-1 rounded">
            Edge Fusion Grid: {Math.min(20, Math.floor((currentPhase / PHASES.length) * 20) * 10)}+ nodes online...
        </span>
      </div>

      {/* Live Logs */}
      <div className="bg-black/70 rounded-lg p-4 font-mono text-xs text-green-300 h-32 overflow-y-auto shadow-inner border border-green-700/30">
        {logs.map((log, i) => (
          <div key={i} className="animate-fade-in">
            {log}
          </div>
        ))}
        {done && <div className="animate-fade-in text-green-400 font-bold">{LOGS[LOGS.length-1]}</div>}
      </div>

      {/* Badges */}
      {done && (
        <div className="absolute top-4 right-4 flex items-center gap-2 animate-fade-in">
            <span className="bg-yellow-400/80 text-yellow-900 px-2 py-1 rounded text-xs font-bold shadow">
            🥇 Quantum Pioneer
            </span>
            <span className="bg-cyan-400/80 text-cyan-900 px-2 py-1 rounded text-xs font-bold shadow">
            🚀 Sub-2s Club
            </span>
        </div>
      )}

      {/* Success & Leaderboard Overlay */}
      {done && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-30 rounded-xl animate-fade-in p-4">
          <div className="text-4xl mb-2">🏆</div>
          <div className="text-lg text-center font-bold text-yellow-300 mb-2">
            You set a new QuantumBuild™ record!
          </div>
          <div className="mb-3 text-sm text-cyan-200">
            <span>Build time: <b>{totalTime.toFixed(2)}s</b> — #1 this week</span>
          </div>
          <button
            className="mb-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-pink-500 text-white rounded shadow font-semibold transition hover:scale-105"
            onClick={handleShare}
          >
            📤 Share your record
          </button>
          <div className="bg-slate-900/80 rounded-lg p-3 mt-2 w-full max-w-xs sm:max-w-sm">
            <div className="text-xs text-slate-300 mb-1 font-semibold">Leaderboard</div>
            <ol className="text-xs text-yellow-200 font-mono space-y-1">
              <li className="flex justify-between"><span>🥇 You</span> <span>{totalTime.toFixed(2)}s</span></li>
              <li className="flex justify-between text-slate-300"><span>🥈 Alice</span> <span>2.10s</span></li>
              <li className="flex justify-between text-slate-400"><span>🥉 Bob</span> <span>2.25s</span></li>
            </ol>
          </div>
          <a
            href="#"
            onClick={e => e.preventDefault()}
            className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded shadow font-semibold transition"
          >
            Open Your App
          </a>
        </div>
      )}
    </div>
  );
};
