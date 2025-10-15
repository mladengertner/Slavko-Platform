import React, { useEffect, useContext, useState } from 'react';
import { SparklesIcon, CodeIcon, RocketIcon, ShieldIcon, DocumentIcon, TrophyIcon, TrendingUpIcon } from './icons';
import { analytics } from '../lib/analytics/posthog';
import { AuthContext } from '../contexts/AuthContext';

const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="p-8 bg-white/5 backdrop-blur border border-white/10 text-center rounded-2xl">
        <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            {icon}
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
        <p className="text-gray-300">{children}</p>
    </div>
);

const ComparisonRow: React.FC<{ feature: string, gpt: string, innovaforge: string, isHeader?: boolean }> = ({ feature, gpt, innovaforge, isHeader }) => (
    <div className={`grid grid-cols-3 gap-4 text-center items-center ${isHeader ? 'font-bold text-white' : 'text-gray-300'}`}>
        <p className="text-left">{feature}</p>
        <p>{gpt}</p>
        <p className="font-bold text-green-400">{innovaforge}</p>
    </div>
);


const ecosystemNodes = [
  {
    id: 'kernel',
    name: 'SlavkoKernel™',
    description: 'Operativni kernel, orkestracija, CI/CD, AI runtime, pravila igre',
    Icon: SparklesIcon
  },
  {
    id: 'score',
    name: 'SlavkoScore™',
    description: 'Scoring engine, evaluacija, monetizacija, feedback, metrike',
    Icon: SparklesIcon
  },
  {
    id: 'innovaforge',
    name: 'InnovaForge™',
    description: 'Instant SaaS factory (ideja → deploy → monetizacija)',
    Icon: RocketIcon,
    orbitR: 140,
    angle: 20,
    r: 28,
    color: 'green'
  },
  {
    id: 'slavkotrust',
    name: 'SlavkoTrust',
    description: 'Audit, compliance, sigurnosni i pravni sloj',
    Icon: ShieldIcon,
    orbitR: 140,
    angle: 140,
    r: 28,
    color: 'blue'
  },
  {
    id: 'slavkoarena',
    name: 'SlavkoArena',
    description: 'Gamificirani AI hackathoni, natjecanja, leaderboardi',
    Icon: TrophyIcon,
    orbitR: 140,
    angle: 260,
    r: 28,
    color: 'purple'
  },
  {
    id: 'slavko-docs',
    name: 'SlavkoDocs',
    description: 'AI-native dokumentacija, generiranje i održavanje tehničke dokumentacije',
    Icon: DocumentIcon,
    orbitR: 220,
    angle: 80,
    r: 28,
    color: 'cyan'
  },
  {
    id: 'slavko-growth',
    name: 'SlavkoGrowth',
    description: 'Growth hacking engine, AI-driven akvizicija i retention',
    Icon: TrendingUpIcon,
    orbitR: 220,
    angle: 200,
    r: 28,
    color: 'pink'
  },
];

const LandingPage: React.FC = () => {
    const { user, setAuthModalOpen } = useContext(AuthContext);
    const [activeNode, setActiveNode] = useState(ecosystemNodes[0]);


    useEffect(() => {
        analytics.pageViewed('landing');
    }, []);

    const handleAuthAction = () => {
        if (user) {
            window.location.hash = '#/dashboard';
        } else {
            setAuthModalOpen(true);
        }
    };
    
    // Helper to convert polar to cartesian
    const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
        const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
        return {
          x: centerX + (radius * Math.cos(angleInRadians)),
          y: centerY + (radius * Math.sin(angleInRadians))
        };
    };

    const VIEWBOX_SIZE = 550;
    const CENTER = VIEWBOX_SIZE / 2;


    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
            <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
                <a href="#/" className="text-2xl font-bold flex items-center gap-2">
                    <SparklesIcon className="w-6 h-6 text-yellow-400"/>
                    InnovaForge™
                </a>
                <div className="flex items-center gap-6">
                     <a href="#/pricing" className="text-gray-300 hover:text-white">Pricing</a>
                     {user?.role === 'admin' && (
                         <a href="#/admin" className="text-yellow-400 hover:text-yellow-300 font-semibold">Admin</a>
                     )}
                     <button onClick={handleAuthAction} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-md font-semibold">
                        {user ? 'Go to App' : 'Sign In'}
                     </button>
                </div>
            </nav>

            <header className="container mx-auto px-4 py-20 text-center">
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in">
                    The Operating System for Your Next Venture.
                </h1>
                <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
                    Go from business idea to live, production-grade SaaS in <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">1.8 seconds</span>. 
                    Built for founders, teams, and agencies.
                </p>
                <div className="flex gap-4 justify-center">
                    <button onClick={handleAuthAction} className="inline-block px-8 py-4 text-lg font-semibold rounded-md bg-purple-600 hover:bg-purple-700">
                        <span className="flex items-center gap-2"><SparklesIcon className="w-5 h-5" /> Start Building for Free</span>
                    </button>
                </div>
            </header>

            <main>
                 <section className="container mx-auto px-4 py-20">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-white">Stop building boilerplate. Start building your business.</h2>
                        <p className="text-lg text-gray-400 mt-4 max-w-3xl mx-auto">Generative AI gives you code. InnovaForge gives you a scalable, market-ready product.</p>
                    </div>
                    <div className="max-w-4xl mx-auto bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 space-y-4">
                        <ComparisonRow feature="Capability" gpt="ChatGPT" innovaforge="InnovaForge™" isHeader />
                        <hr className="border-slate-700" />
                        <ComparisonRow feature="Output" gpt="Text/Code Snippets" innovaforge="Live, Deployed SaaS App" />
                        <ComparisonRow feature="User Action" gpt="Manual Implementation" innovaforge="Zero-Code, One-Click" />
                        <ComparisonRow feature="Time to Revenue" gpt="Weeks / Months" innovaforge="Minutes" />
                        <ComparisonRow feature="Scalability" gpt="Depends on user's skill" innovaforge="Enterprise-grade from Day 1" />
                        <ComparisonRow feature="Result" gpt="A starting point" innovaforge="A complete business" />
                    </div>
                </section>

                <section className="container mx-auto px-4 py-20">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-white">The InnovaForge Ecosystem</h2>
                        <p className="text-lg text-gray-400 mt-4 max-w-3xl mx-auto">
                            InnovaForge™ is the first application built on our powerful core engine, designed for infinite scalability.
                        </p>
                    </div>
                    <div className="relative">
                        <div className="relative flex items-center justify-center aspect-square max-w-xl mx-auto">
                            <svg viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`} className="w-full h-full">
                                <defs>
                                    <filter id="glow">
                                        <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                                        <feMerge>
                                            <feMergeNode in="coloredBlur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>
                                <circle cx={CENTER} cy={CENTER} r={140} fill="none" stroke="rgba(255, 255, 255, 0.1)" strokeDasharray="5 5" />
                                <circle cx={CENTER} cy={CENTER} r={220} fill="none" stroke="rgba(255, 255, 255, 0.1)" strokeDasharray="5 5" />

                                <g onMouseEnter={() => setActiveNode(ecosystemNodes.find(n => n.id === 'kernel')!)} className="cursor-pointer">
                                    <circle cx={CENTER - 28} cy={CENTER} r={40} fill="rgba(250, 204, 21, 0.1)" stroke="#FBBF24" strokeWidth="1" />
                                    <foreignObject x={CENTER - 28 - 16} y={CENTER - 16} width="32" height="32">
                                        <SparklesIcon className="text-yellow-400 w-8 h-8 animate-pulse" style={{filter: 'url(#glow)'}} />
                                    </foreignObject>
                                </g>
                                 <g onMouseEnter={() => setActiveNode(ecosystemNodes.find(n => n.id === 'score')!)} className="cursor-pointer">
                                    <circle cx={CENTER + 28} cy={CENTER} r={40} fill="rgba(250, 204, 21, 0.1)" stroke="#FBBF24" strokeWidth="1" />
                                     <foreignObject x={CENTER + 28 - 16} y={CENTER - 16} width="32" height="32">
                                        <SparklesIcon className="text-yellow-400 w-8 h-8 animate-pulse" style={{filter: 'url(#glow)'}} />
                                    </foreignObject>
                                </g>
                                <text x={CENTER} y={CENTER + 65} textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">SlavkoKernel™ + SlavkoScore™</text>
                                
                                {ecosystemNodes.filter(n => n.orbitR).map(node => {
                                    const { x, y } = polarToCartesian(CENTER, CENTER, node.orbitR!, node.angle!);
                                    const colors: Record<string, any> = {
                                        green: { fill: 'rgba(74, 222, 128, 0.1)', stroke: '#4ADE80', text: 'text-green-400' },
                                        blue: { fill: 'rgba(96, 165, 250, 0.1)', stroke: '#60A5FA', text: 'text-blue-400' },
                                        purple: { fill: 'rgba(192, 132, 252, 0.1)', stroke: '#C084FC', text: 'text-purple-400' },
                                        cyan: { fill: 'rgba(34, 211, 238, 0.1)', stroke: '#22D3EE', text: 'text-cyan-400' },
                                        pink: { fill: 'rgba(244, 114, 182, 0.1)', stroke: '#F472B6', text: 'text-pink-400' },
                                    };
                                    const colorSet = colors[node.color!];

                                    return (
                                        <g key={node.id} onMouseEnter={() => setActiveNode(node)} className="cursor-pointer group">
                                            <circle cx={x} cy={y} r={node.r} fill={colorSet.fill} stroke={colorSet.stroke} strokeWidth="1" className="transition-all duration-300 group-hover:r-[33px]" />
                                            <foreignObject x={x - 14} y={y - 14} width="28" height="28">
                                                <node.Icon className={`${colorSet.text} w-7 h-7 transition-transform duration-300 group-hover:scale-110`} />
                                            </foreignObject>
                                            <text x={x} y={y + node.r! + 18} textAnchor="middle" fill="white" fontSize="12" className="transition-opacity duration-300 group-hover:opacity-100 opacity-80 font-semibold">{node.name}</text>
                                        </g>
                                    );
                                })}

                            </svg>
                        </div>
                        <div className="mt-8 text-center min-h-[80px]">
                            <h4 className="text-xl font-bold text-white transition-all duration-300">{activeNode.name}</h4>
                            <p className="text-gray-400 max-w-md mx-auto transition-all duration-300">{activeNode.description}</p>
                        </div>
                    </div>
                </section>


                <section className="container mx-auto px-4 py-20">
                    <h2 className="text-4xl font-bold text-white text-center mb-12">An Entire Product Team, Encapsulated in AI</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard icon={<SparklesIcon className="w-16 h-16 text-yellow-400"/>} title="1. AI Strategy & Design">
                            Our AI scans market trends to generate viable SaaS ideas, complete with business plans, features, and monetization strategies.
                        </FeatureCard>
                        <FeatureCard icon={<CodeIcon className="w-16 h-16 text-blue-400"/>} title="2. Autonomous Engineering">
                             Approve an idea and our AI agent scaffolds the entire application, writes the code, and configures the deployment pipeline.
                        </FeatureCard>
                        <FeatureCard icon={<RocketIcon className="w-16 h-16 text-green-400"/>} title="3. One-Click Global Deploy">
                            Review, test in a live staging environment, and deploy globally in 1.8 seconds. Zero DevOps required. Your app is live, instantly.
                        </FeatureCard>
                    </div>
                </section>

                <section className="container mx-auto px-4 py-20 text-center">
                     <div className="p-12 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-2xl">
                        <h2 className="text-4xl font-bold text-white mb-4">
                            Ready to ship 100x faster?
                        </h2>
                        <p className="text-xl text-gray-300 mb-8">
                            Join thousands of businesses building their next big thing on InnovaForge™.
                        </p>
                        <button onClick={handleAuthAction} className="inline-block px-12 py-4 text-lg font-semibold rounded-md bg-purple-600 hover:bg-purple-700">
                            Create Your First App Free
                        </button>
                    </div>
                </section>
            </main>

            <footer className="text-center py-8 text-gray-500 text-xs">
                <p>&copy; {new Date().getFullYear()} FORMATDISC, obrt za popravak računala i periferne opreme, vl. Mladen Gertner. All rights reserved.</p>
                <p>Kustošijski venec 97, ZAGREB | OIB:MB:98984187 | <a href="https://www.formatdisc.hr" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300">www.formatdisc.hr</a></p>
            </footer>
        </div>
    );
};

export default LandingPage;