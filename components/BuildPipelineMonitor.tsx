import React, { useState } from 'react';
import type { Build } from '../types';
import {
    CheckCircle2Icon,
    XCircleIcon,
    ClockIcon,
    Loader2Icon,
    ExternalLinkIcon,
    TerminalIcon,
    TestTubeIcon,
    RocketIcon,
    GitHubIcon,
    VercelIcon,
    FirebaseIcon,
} from './icons';
import { Badge } from './Badge';
import { Progress } from './Progress';
import LiveBuildLogs from './LiveBuildLogs';
import { QuantumBuildVisualizer } from './QuantumBuildVisualizer';

interface BuildPipelineMonitorProps {
    builds: Build[];
}

// Fix: Add helper to handle Firestore Timestamps which can be objects or strings
const toDate = (timestamp: string | { seconds: number; nanoseconds: number; }): Date => {
    if (!timestamp) return new Date();
    if (typeof timestamp === 'string') {
        return new Date(timestamp);
    }
    return new Date(timestamp.seconds * 1000);
}

const BuildCard: React.FC<{ build: Build }> = ({ build }) => {
    const [expanded, setExpanded] = useState(false);

    // Fix: Add explicit return type to ensure `color` matches the expected string literal type for child components.
    const getStatusInfo = (status: Build['status']): { icon: React.ReactElement<{ className?: string }>; color: 'gray' | 'blue' | 'yellow' | 'purple' | 'green' | 'red'; progress: number } => {
        switch (status) {
            case 'queued': return { icon: <ClockIcon />, color: 'gray', progress: 5 };
            case 'running': return { icon: <Loader2Icon className="animate-spin" />, color: 'blue', progress: 25 };
            case 'testing': return { icon: <TestTubeIcon />, color: 'yellow', progress: 50 };
            case 'deploying': return { icon: <RocketIcon />, color: 'purple', progress: 75 };
            case 'success': return { icon: <CheckCircle2Icon />, color: 'green', progress: 100 };
            case 'failed': return { icon: <XCircleIcon />, color: 'red', progress: 100 };
        }
    };

    const formatDuration = (start: string | { seconds: number; nanoseconds: number; }, end?: string | { seconds: number; nanoseconds: number; }) => {
        if (!end) return '...';
        const duration = toDate(end).getTime() - toDate(start).getTime();
        const seconds = Math.floor(duration / 1000);
        const minutes = Math.floor(seconds / 60);
        return minutes > 0 ? `${minutes}m ${seconds % 60}s` : `${seconds}s`;
    };

    const { icon, color, progress } = getStatusInfo(build.status);
    const colorClass = `text-${color}-400`;
    const isInProgress = ['running', 'testing', 'deploying'].includes(build.status);

    // Fix: Cast icon.props to a known shape to safely access className.
    const badgeIcon = React.cloneElement(icon, {
        className: icon.props.className || '',
    });

    return (
        <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl shadow-lg p-6 transition-all duration-300">
            <div className="flex flex-col sm:flex-row items-start justify-between mb-4 gap-4">
                <div className="flex items-center gap-3">
                    <div className={`h-6 w-6 ${colorClass}`}>{icon}</div>
                    <div>
                        <h3 className="text-lg font-bold text-white">{build.ideaTitle}</h3>
                        <p className="text-sm text-gray-400">
                            Started {toDate(build.startedAt).toLocaleString()}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge color={color}>
                        <span className="flex items-center gap-1.5 capitalize">
                            <span className="w-3 h-3">{badgeIcon}</span>
                            <span>{build.status}</span>
                        </span>
                    </Badge>
                     {build.deploymentTarget && (
                        <Badge color="gray">
                            <span className="flex items-center gap-1.5">
                                {build.deploymentTarget === 'Vercel' ? <VercelIcon className="w-3.5 h-3.5" /> : <FirebaseIcon className="w-3.5 h-3.5" />}
                                <span>{build.deploymentTarget}</span>
                            </span>
                        </Badge>
                    )}
                    {build.completedAt && (
                         <Badge color="gray">{formatDuration(build.startedAt, build.completedAt)}</Badge>
                    )}
                </div>
            </div>

            <Progress value={progress} color={color} inProgress={isInProgress} />

            {build.testResults && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-4 text-center">
                    <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-sm text-gray-400">Total</p>
                        <p className="text-xl font-bold text-white">{build.testResults.total}</p>
                    </div>
                    <div className="bg-green-500/20 rounded-lg p-3">
                        <p className="text-sm text-green-400">Passed</p>
                        <p className="text-xl font-bold text-green-400">{build.testResults.passed}</p>
                    </div>
                    <div className="bg-red-500/20 rounded-lg p-3">
                        <p className="text-sm text-red-400">Failed</p>
                        <p className="text-xl font-bold text-red-400">{build.testResults.failed}</p>
                    </div>
                    <div className="bg-blue-500/20 rounded-lg p-3">
                        <p className="text-sm text-blue-400">Coverage</p>
                        <p className="text-xl font-bold text-blue-400">{build.testResults.coverage}%</p>
                    </div>
                </div>
            )}
            
            <div className="flex gap-3 mt-4 flex-wrap">
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="inline-flex items-center px-3 py-1.5 border border-slate-600 text-sm font-medium rounded-md text-zinc-200 bg-white/5 hover:bg-white/10"
                >
                    <TerminalIcon className="w-4 h-4" /><span className="ml-2">{expanded ? 'Hide' : 'View'} Live Logs</span>
                </button>
                {build.githubRunId && (
                    <a 
                        href={`https://github.com/innovaforge/innovaforge-app/actions/runs/${build.githubRunId}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center px-3 py-1.5 border border-slate-600 text-sm font-medium rounded-md text-zinc-200 bg-white/5 hover:bg-white/10"
                        aria-label={`View GitHub Actions run for build: ${build.ideaTitle}`}
                    >
                        <GitHubIcon className="w-4 h-4" /><span className="ml-2">View Run</span>
                    </a>
                )}
                {build.stagingUrl && (
                    <a href={build.stagingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-slate-600 hover:bg-slate-700">
                        <ExternalLinkIcon className="w-4 h-4" /><span className="ml-2">Open Staging</span>
                    </a>
                )}
            </div>

            {expanded && <LiveBuildLogs buildId={build.id} />}
        </div>
    );
};


const BuildPipelineMonitor: React.FC<BuildPipelineMonitorProps> = ({ builds }) => {
    const runningBuild = builds.find(b => b.status === 'running' || b.status === 'testing' || b.status === 'deploying');
    
    return (
        <div className="space-y-6">
            {runningBuild && <QuantumBuildVisualizer key={runningBuild.id} />}

            {builds.length === 0 ? (
                <div className="text-center py-12 bg-white/10 backdrop-blur border border-white/20 rounded-2xl">
                    <TerminalIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No builds yet.</p>
                    <p className="text-gray-500">Approve an idea to start building!</p>
                </div>
            ) : (
                builds.filter(b => b.id !== runningBuild?.id).map(build => <BuildCard key={build.id} build={build} />)
            )}
        </div>
    );
};

export default BuildPipelineMonitor;