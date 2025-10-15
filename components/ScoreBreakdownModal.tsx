import React, { useState } from 'react';
import type { Idea } from '../types';
import { XIcon, SparklesIcon } from './icons';

interface RadarChartData {
    axis: string;
    value: number;
    description: string;
}

// Simple Radar Chart component
const RadarChart = ({ data }: { data: RadarChartData[] }) => {
    const [tooltip, setTooltip] = useState<{ visible: boolean; content: string; x: number; y: number } | null>(null);
    const size = 200;
    const center = size / 2;
    const maxVal = 10;
    const numAxes = data.length;
    const angleSlice = (Math.PI * 2) / numAxes;

    const points = data.map((d, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const value = (d.value / maxVal) * (center * 0.8);
        const x = center + value * Math.cos(angle);
        const y = center + value * Math.sin(angle);
        return `${x},${y}`;
    }).join(' ');

    const gridLevels = 5;

    return (
        <div className="relative">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <g>
                    {[...Array(gridLevels)].map((_, levelIndex) => (
                        <polygon
                            key={levelIndex}
                            points={[...Array(numAxes)].map((_, i) => {
                                const radius = (center * 0.8 / gridLevels) * (levelIndex + 1);
                                const angle = angleSlice * i - Math.PI / 2;
                                const x = center + radius * Math.cos(angle);
                                const y = center + radius * Math.sin(angle);
                                return `${x},${y}`;
                            }).join(' ')}
                            fill="none"
                            stroke="rgba(255, 255, 255, 0.2)"
                            strokeWidth="1"
                        />
                    ))}
                    {data.map((d, i) => {
                        const angle = angleSlice * i - Math.PI / 2;
                        const x1 = center;
                        const y1 = center;
                        const x2 = center + (center * 0.8) * Math.cos(angle);
                        const y2 = center + (center * 0.8) * Math.sin(angle);
                        
                        const labelX = center + (center * 1) * Math.cos(angle);
                        const labelY = center + (center * 1) * Math.sin(angle);

                        return (
                            <g key={d.axis}>
                                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />
                                <text
                                    x={labelX}
                                    y={labelY}
                                    fill="white"
                                    fontSize="10"
                                    textAnchor={labelX > center + 1 ? 'start' : labelX < center - 1 ? 'end' : 'middle'}
                                    alignmentBaseline="middle"
                                    onMouseEnter={(e) => setTooltip({ visible: true, content: d.description, x: e.clientX, y: e.clientY })}
                                    onMouseLeave={() => setTooltip(null)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {d.axis}
                                </text>
                            </g>
                        );
                    })}
                    <polygon points={points} fill="rgba(251, 191, 36, 0.4)" stroke="#FBBF24" strokeWidth="2" />
                </g>
            </svg>
            {tooltip && tooltip.visible && (
                <div
                    className="fixed z-10 p-2 text-xs text-white bg-slate-900 border border-slate-600 rounded-md shadow-lg max-w-xs animate-tooltip-fade-in"
                    style={{
                        left: `${tooltip.x + 15}px`,
                        top: `${tooltip.y + 15}px`,
                        pointerEvents: 'none',
                    }}
                >
                    {tooltip.content}
                </div>
            )}
        </div>
    );
};


const simpleHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash;
};


interface ScoreBreakdownModalProps {
    idea: Idea | null;
    onClose: () => void;
}

export const ScoreBreakdownModal: React.FC<ScoreBreakdownModalProps> = ({ idea, onClose }) => {
    if (!idea) return null;

    const generateBreakdownData = (idea: Idea): RadarChartData[] => {
        const criteria = [
            { name: "Market Fit", description: "How well the idea addresses a real problem for a defined target audience." },
            { name: "Innovation", description: "The novelty and uniqueness of the solution compared to existing competitors." },
            { name: "Feasibility", description: "The technical and practical viability of building and launching the product." },
            { name: "Monetization", description: "The potential for the idea to generate revenue and be profitable." },
            { name: "Scalability", description: "The ability of the business and technical model to grow and handle increased demand." }
        ];
        const baseScore = idea.slavkoScore;
        
        let scores = criteria.map((_, i) => (Math.abs(simpleHash(idea.id + i)) % 6) + 4); 
        const total = scores.reduce((a, b) => a + b, 0);
        
        const normalizedScores = scores.map(s => Math.min(10, Math.max(1, s * baseScore * criteria.length / (total * 10))));

        return criteria.map((criterion, i) => ({
            axis: criterion.name,
            value: parseFloat(normalizedScores[i].toFixed(1)),
            description: criterion.description
        }));
    };

    const breakdownData = generateBreakdownData(idea);

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="score-breakdown-title"
        >
            <div 
                className="bg-slate-800/80 backdrop-blur-lg border border-slate-700 rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md m-4 text-white relative"
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white"
                    aria-label="Close modal"
                >
                    <XIcon />
                </button>
                <div className="text-center mb-6">
                    <h2 id="score-breakdown-title" className="text-2xl font-bold mb-2">{idea.title}</h2>
                    <p className="text-slate-400">SlavkoScore™ Breakdown</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
                    <div className="flex-shrink-0 text-center">
                         <div className="relative w-32 h-32 flex items-center justify-center">
                            <SparklesIcon className="w-32 h-32 text-yellow-500/10 absolute animate-pulse" />
                            <span className="text-6xl font-bold text-yellow-400">{idea.slavkoScore}</span>
                            <span className="absolute bottom-4 text-slate-400 text-lg">/10</span>
                         </div>
                         <p className="font-semibold mt-2">Overall Score</p>
                    </div>
                    <div className="flex-shrink-0">
                        <RadarChart data={breakdownData} />
                    </div>
                </div>

                <div className="mt-8">
                    <ul className="space-y-2">
                        {breakdownData.map(item => (
                            <li key={item.axis} className="flex justify-between items-center text-sm p-2 bg-slate-700/50 rounded-md">
                                <span className="text-slate-300">{item.axis}</span>
                                <span className="font-bold text-yellow-400">{item.value} / 10</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
             <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out forwards;
                }
                @keyframes tooltip-fade-in {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-tooltip-fade-in {
                    animation: tooltip-fade-in 0.2s ease-out forwards;
                }
            `}</style>
        </div>
    );
};