import React, { useState, useEffect, useContext } from 'react';
import BuildPipelineMonitor from './components/BuildPipelineMonitor';
import { IdeaCard } from './components/IdeaCard';
import { Tabs, Tab } from './components/Tabs';
import { ToastProvider, useToast } from './hooks/useToast';
import { Toaster } from './components/Toast';
import { SparklesIcon, Loader2Icon } from './components/icons';
import { useIdeas } from './hooks/useIdeas';
import { useBuilds } from './hooks/useBuilds';
import { analytics } from './lib/analytics/posthog';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import LandingPage from './components/LandingPage';
import PricingPage from './components/PricingPage';
import { ScoreBreakdownModal } from './components/ScoreBreakdownModal';
import type { Idea } from './types';
import { useCheckLimits, type CheckLimitResponse } from './hooks/useCheckLimits';
import { PaywallModal } from './components/PaywallModal';
import { UsageDashboard } from './components/UsageDashboard';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { AuthModal } from './components/AuthModal';
import { WelcomeModal } from './components/WelcomeModal';
import { api } from './lib/api';
import AdminDashboard from './components/AdminDashboard';
import { useCelebration } from './hooks/useCelebration';
import Confetti from './components/Confetti';
import { TimeSensitiveOffer } from './components/TimeSensitiveOffer';
import { MilestoneTracker } from './components/MilestoneTracker';
import { ShareToUnlock } from './components/ShareToUnlock';
import { ReferralSystem } from './components/ReferralSystem';
import { QuantumBuildWorldMap } from './components/QuantumBuildWorldMap';
import { Leaderboard } from './components/Leaderboard';
import { ValidationHub } from './components/ValidationHub';
import { SkeletonCard } from './components/SkeletonCard';

const Dashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('Ideas Feed');
    const [generating, setGenerating] = useState(false);
    const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
    const [paywallInfo, setPaywallInfo] = useState<{
        open: boolean;
        message: string;
        usage: CheckLimitResponse['usage'] | null;
        limits: CheckLimitResponse['limits'] | null;
    }>({ open: false, message: '', usage: null, limits: null });
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);
    
    const { ideas, loading: ideasLoading } = useIdeas();
    const { builds, loading: buildsLoading } = useBuilds();
    const { user, loading: userLoading, updateUserProfile } = useContext(AuthContext);
    const { checkLimit, checking: isCheckingLimit } = useCheckLimits();
    const { toast } = useToast();
    const { showConfetti, triggerFirstDeployCelebration } = useCelebration();

    useEffect(() => {
        if (user && user.isNewUser) {
            setShowWelcomeModal(true);
        }
    }, [user]);

    useEffect(() => {
        const hasDeployed = ideas.some(idea => idea.status === 'deployed');
        const celebrationTriggered = sessionStorage.getItem('firstDeployCelebrated');

        if (hasDeployed && !celebrationTriggered) {
            triggerFirstDeployCelebration();
            sessionStorage.setItem('firstDeployCelebrated', 'true');
        }
    }, [ideas, triggerFirstDeployCelebration]);
    
    const triggerPaywall = (result: CheckLimitResponse) => {
        setPaywallInfo({
            open: true,
            message: result.reason,
            usage: result.usage,
            limits: result.limits,
        });
    };

    const handleGenerateIdea = async () => {
        if (!user) return;
        const limitResult = await checkLimit('generate_idea', user.id);
        if (limitResult && !limitResult.canProceed) {
            triggerPaywall(limitResult);
            return;
        }

        setGenerating(true);
        try {
            const data = await api.post<{ id: string; idea: Idea }>("/api/ideas/generate", { userId: user.id });
            analytics.ideaGenerated(data.idea);
            toast.success("New idea generation triggered!");
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Error triggering idea generation.");
        } finally {
            setGenerating(false);
        }
    };
    
    const handleWelcomeStarted = async () => {
        if (!user) return;
        setShowWelcomeModal(false);
        await updateUserProfile({ isNewUser: false });
        setTimeout(() => {
            handleGenerateIdea();
        }, 300);
    };

    const handleWelcomeClosed = async () => {
        if (!user) return;
        setShowWelcomeModal(false);
        await updateUserProfile({ isNewUser: false });
    };

    const tabs = ["Ideas Feed", "Build Pipeline", "Deployed Apps", "Analytics", "Team"];

    if (ideasLoading || buildsLoading || userLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-zinc-100 p-4 sm:p-6 lg:p-8">
                {/* Skeleton Header */}
                <header className="text-center mb-12 md:mb-16">
                    <div className="h-12 md:h-14 w-72 bg-slate-800/80 rounded-md mx-auto mb-4 animate-pulse"></div>
                    <div className="h-6 md:h-7 w-56 bg-slate-800/80 rounded-md mx-auto mb-6 animate-pulse"></div>
                    <div className="h-12 w-48 bg-slate-800/80 rounded-md mx-auto animate-pulse"></div>
                </header>

                <main className="max-w-7xl mx-auto">
                    {/* Skeleton for ValidationHub and UsageDashboard */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                        <div className="lg:col-span-2 h-48 bg-slate-900/50 backdrop-blur border border-slate-700/50 rounded-2xl animate-pulse"></div>
                        <div className="h-48 bg-slate-900/50 backdrop-blur border border-slate-700/50 rounded-2xl animate-pulse"></div>
                    </div>

                    {/* Skeleton for Tabs */}
                    <div className="w-full h-12 bg-white/5 backdrop-blur rounded-lg p-1 mb-8 animate-pulse"></div>
                    
                    {/* Skeleton for Idea Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-zinc-100 p-4 sm:p-6 lg:p-8">
            {showConfetti && <Confetti />}
            <header className="text-center mb-12 md:mb-16">
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 flex items-center justify-center gap-4">
                    <SparklesIcon className="w-10 h-10 md:w-12 md:h-12 text-yellow-400 animate-pulse" />
                    InnovaForge™
                </h1>
                <p className="text-lg md:text-xl text-gray-300 mb-6">
                    The AI SaaS Factory
                </p>
                <button
                    onClick={handleGenerateIdea}
                    disabled={generating || isCheckingLimit}
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {generating || isCheckingLimit ? (
                        <>
                            <Loader2Icon className="w-5 h-5 mr-2 animate-spin" />
                            {isCheckingLimit ? 'Checking limits...' : 'Generating...'}
                        </>
                    ) : (
                        <>
                            <SparklesIcon className="w-5 h-5 mr-2" />
                            Generate New Idea
                        </>
                    )}
                </button>
            </header>

            <main className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                    <div className="lg:col-span-2">
                        <ValidationHub />
                    </div>
                    <UsageDashboard user={user} loading={userLoading} />
                </div>
                
                <Tabs>
                    {tabs.map(tab => (
                        <Tab key={tab} label={tab} isActive={activeTab === tab} onClick={() => setActiveTab(tab)} />
                    ))}
                </Tabs>
                <div className="mt-8">
                    {activeTab === 'Ideas Feed' && (
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {ideas.filter(i => i.status !== 'deployed').map(idea => (
                                <IdeaCard key={idea.id} idea={idea} onShowScore={setSelectedIdea} onLimitReached={triggerPaywall} />
                            ))}
                         </div>
                    )}
                    {activeTab === 'Build Pipeline' && <BuildPipelineMonitor builds={builds} />}
                    {activeTab === 'Deployed Apps' && (
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {ideas.filter(i => i.status === 'deployed').map(idea => (
                                <IdeaCard key={idea.id} idea={idea} showMetrics onShowScore={setSelectedIdea} onLimitReached={triggerPaywall} />
                            ))}
                         </div>
                    )}
                    {activeTab === 'Analytics' && <AnalyticsDashboard />}
                    {activeTab === 'Team' && (
                        <div className="p-12 bg-slate-900 rounded-lg border border-slate-800 text-center text-slate-500">
                            <h3 className="text-lg font-semibold mb-2">Team Management</h3>
                            <p>Invite members, manage roles, and collaborate on projects. Coming soon!</p>
                        </div>
                    )}
                </div>

                {user && user.plan !== 'enterprise' && (
                    <>
                    <h2 className="text-3xl font-bold text-white text-center mt-16 mb-8">Growth Center</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                        <div className="space-y-6">
                            <TimeSensitiveOffer user={user} />
                            <MilestoneTracker user={user} />
                            <ShareToUnlock projectUrl={user.latestProjectUrl} />
                        </div>
                        <div className="space-y-6">
                            <ReferralSystem user={user} />
                            <QuantumBuildWorldMap />
                        </div>
                    </div>
                    <div className="mt-8">
                      <Leaderboard />
                    </div>
                    </>
                )}

            </main>
            <Toaster />
            <ScoreBreakdownModal idea={selectedIdea} onClose={() => setSelectedIdea(null)} />
            <PaywallModal 
                {...paywallInfo}
                onClose={() => setPaywallInfo({ ...paywallInfo, open: false })}
            />
            <WelcomeModal 
                open={showWelcomeModal}
                onClose={handleWelcomeClosed}
                onGetStarted={handleWelcomeStarted}
            />
        </div>
    );
};

const AppContent: React.FC = () => {
    const [route, setRoute] = useState(window.location.hash || '#/');
    const { user, loading, setAuthModalOpen } = useContext(AuthContext);

    useEffect(() => {
        const handleHashChange = () => {
            const newRoute = window.location.hash || '#/';
            setRoute(newRoute);
            if (newRoute === '#/dashboard' && !loading && !user) {
                setAuthModalOpen(true);
            }
        };
        window.addEventListener('hashchange', handleHashChange);
        
        // Initial check
        if (route === '#/dashboard' && !loading && !user) {
            setAuthModalOpen(true);
        }

        return () => window.removeEventListener('hashchange', handleHashChange);
    }, [user, loading, setAuthModalOpen, route]);

    const renderContent = () => {
        switch (route) {
            case '#/dashboard':
                if (loading) {
                    return (
                        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                            <Loader2Icon className="w-12 h-12 text-white animate-spin" />
                        </div>
                    );
                }
                return user ? <Dashboard /> : <LandingPage />;
            case '#/pricing':
                return <PricingPage />;
            case '#/admin':
                 if (loading) {
                    return (
                        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                            <Loader2Icon className="w-12 h-12 text-white animate-spin" />
                        </div>
                    );
                }
                if (user?.role === 'admin') {
                    return <AdminDashboard />;
                }
                // Redirect non-admins or logged-out users
                window.location.hash = '#/';
                return <LandingPage />;
            case '#/':
            default:
                return <LandingPage />;
        }
    };
    
    return (
        <>
            {renderContent()}
            <AuthModal />
        </>
    );
};

const App: React.FC = () => (
    <ToastProvider>
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    </ToastProvider>
);

export default App;