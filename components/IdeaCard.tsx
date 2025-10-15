import React, { useContext } from 'react';
import type { Idea } from '../types';
import { Badge } from './Badge';
import { ExternalLinkIcon, CodeIcon, TrendingUpIcon } from './icons';
import { useToast } from '../hooks/useToast';
import { analytics } from '../lib/analytics/posthog';
import { useCheckLimits, type CheckLimitResponse } from '../hooks/useCheckLimits';
import { AuthContext } from '../contexts/AuthContext';
import { api } from '../lib/api';

interface IdeaCardProps {
    idea: Idea;
    showMetrics?: boolean;
    onShowScore: (idea: Idea) => void;
    onLimitReached: (result: CheckLimitResponse) => void;
}

export const IdeaCard: React.FC<IdeaCardProps> = ({ idea, showMetrics, onShowScore, onLimitReached }) => {
    const [loading, setLoading] = React.useState(false);
    const [deploymentTarget, setDeploymentTarget] = React.useState('Vercel');
    const { toast } = useToast();
    const { checkLimit, checking: isCheckingLimit } = useCheckLimits();
    const { user, setAuthModalOpen } = useContext(AuthContext);

    React.useEffect(() => {
        const savedTarget = localStorage.getItem('deploymentTarget');
        if (savedTarget) {
            setDeploymentTarget(savedTarget);
        }
    }, []);

    const handleTargetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newTarget = e.target.value;
        setDeploymentTarget(newTarget);
        localStorage.setItem('deploymentTarget', newTarget);
    };

    const handleApprove = async () => {
        if (!user) {
            setAuthModalOpen(true);
            return;
        }

        const limitResult = await checkLimit('start_build', user.id);
        if (limitResult && !limitResult.canProceed) {
            onLimitReached(limitResult);
            return;
        }

        setLoading(true);
        try {
            await api.post('/api/builds/start', {
                ideaId: idea.id,
                target: deploymentTarget,
                userId: user.id,
            });

            analytics.ideaApproved(idea.id);
            toast.info(`Build for "${idea.title}" has been queued!`);
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : 'An unknown error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const statusColor = idea.status === 'deployed' ? 'green' : idea.status === 'building' ? 'blue' : 'gray';
    const isActionDisabled = loading || isCheckingLimit;

    return (
        <div className="bg-white/10 backdrop-blur border border-white/20 hover:bg-white/15 transition-all duration-300 rounded-2xl shadow-lg p-6 flex flex-col justify-between">
            <div>
                <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-white pr-2">{idea.title}</h3>
                    <button
                        onClick={() => onShowScore(idea)}
                        className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-yellow-500 rounded-full transition-transform hover:scale-110"
                        aria-label={`View SlavkoScore breakdown for ${idea.title}`}
                    >
                        <Badge color="yellow" className="text-base flex-shrink-0 cursor-pointer">
                            ⭐ {idea.slavkoScore}/10
                        </Badge>
                    </button>
                </div>
                <Badge color={statusColor} className="capitalize">
                    {idea.status}
                </Badge>
                <p className="text-gray-300 my-4 text-sm">{idea.description}</p>
                {showMetrics && (
                    <div className="flex gap-4 mb-4">
                        <div className="flex items-center gap-2 text-gray-300">
                            <TrendingUpIcon className="w-4 h-4" />
                            <span>1.2k users</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                            <CodeIcon className="w-4 h-4" />
                            <span>98% uptime</span>
                        </div>
                    </div>
                )}
            </div>
            <div className="mt-auto pt-4">
                 {idea.status === 'pending' && (
                    <div className="space-y-4">
                        <div>
                            <label htmlFor={`deploy-target-${idea.id}`} className="block text-sm font-medium text-gray-300 mb-2">
                                Deployment Target
                            </label>
                            <select
                                id={`deploy-target-${idea.id}`}
                                value={deploymentTarget}
                                onChange={handleTargetChange}
                                className="w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 px-3 text-white text-sm focus:ring-purple-500 focus:border-purple-500"
                            >
                                <option value="Vercel">Vercel</option>
                                <option value="Firebase Hosting">Firebase Hosting</option>
                            </select>
                        </div>
                         <button
                            onClick={handleApprove}
                            disabled={isActionDisabled}
                            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-green-500 disabled:bg-green-800 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {isCheckingLimit ? 'Checking...' : (loading ? 'Starting...' : 'Approve & Build')}
                        </button>
                    </div>
                )}
                {idea.productionUrl && (
                    <a
                        href={idea.productionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-blue-500"
                    >
                        <ExternalLinkIcon className="w-5 h-5" />
                        <span className="ml-2">View Live App</span>
                    </a>
                )}
            </div>
        </div>
    );
};