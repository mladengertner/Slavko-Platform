import React, { useState, useContext } from 'react';
import { PLANS } from '../lib/stripe/config';
import { CheckIcon, Loader2Icon, SparklesIcon } from './icons';
import { useToast } from '../hooks/useToast';
import { AuthContext } from '../contexts/AuthContext';
import { api } from '../lib/api';

declare const Stripe: any;

const PricingCard: React.FC<{ plan: typeof PLANS[0], onCheckout: (planKey: string) => void, isLoading: boolean, currentPlan: string | undefined }> = ({ plan, onCheckout, isLoading, currentPlan }) => {
    const isCurrent = plan.key === currentPlan;
    
    let ctaText = plan.cta;
    if (isCurrent) ctaText = "Your Current Plan";

    return (
        <div className={`p-8 bg-white/10 backdrop-blur border border-white/20 rounded-2xl flex flex-col transition-all duration-300 ${plan.highlighted ? "ring-2 ring-purple-500 scale-105" : ""}`}>
            {plan.popular && (
                <div className="bg-purple-500 text-white text-sm font-bold px-3 py-1 rounded-full inline-block mb-4 self-start">
                  RECOMMENDED
                </div>
              )}
            <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
            <p className="text-gray-400 mb-6 h-10">{plan.description}</p>
            <div className="mb-6">
                {plan.price === null ? (
                     <span className="text-5xl font-bold text-white">Custom</span>
                ) : (
                    <>
                        <span className="text-5xl font-bold text-white">${plan.price}</span>
                        <span className="text-gray-400">/month</span>
                    </>
                )}
            </div>
            <ul className="space-y-3 mb-8 flex-grow">
                {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-300">
                        <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
             <button
                onClick={() => onCheckout(plan.key)}
                className={`w-full inline-flex items-center justify-center px-4 py-2.5 font-semibold rounded-md transition-colors duration-200 ${
                  isCurrent ? "bg-slate-600 cursor-default" :
                  plan.highlighted
                    ? "bg-purple-600 hover:bg-purple-700 text-white"
                    : "bg-white/10 hover:bg-white/20 text-white"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                disabled={isCurrent || isLoading}
              >
                {isLoading ? <Loader2Icon className="animate-spin w-5 h-5" /> : ctaText}
              </button>
        </div>
    );
};


const PricingPage: React.FC = () => {
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const { toast } = useToast();
    const { user, setAuthModalOpen } = useContext(AuthContext);

    const handleCheckout = async (planKey: string) => {
        if (!user) {
            toast.info("Please sign in to choose a plan.");
            setAuthModalOpen(true);
            return;
        }

        if (planKey === 'enterprise' || planKey === 'free') {
            toast.info(planKey === 'free' ? "You're all set on the Free plan!" : "Please contact sales for the Enterprise plan.");
            return;
        }
        
        setLoadingPlan(planKey);
        try {
            const { sessionId } = await api.post<{ sessionId: string }>("/api/checkout", {
                plan: planKey,
                userId: user.id,
            });

            const stripePublishableKey = "pk_test_YOUR_PUBLISHABLE_KEY"; 
            const stripe = Stripe(stripePublishableKey);
            
            const { error } = await stripe.redirectToCheckout({ sessionId });
            
            if (error) {
                console.error("Stripe redirection error:", error);
                toast.error(error.message || "Failed to redirect to checkout.");
                setLoadingPlan(null);
            }

        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Could not initiate checkout. Please try again.");
            setLoadingPlan(null);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-20 text-white">
            <div className="container mx-auto px-4">
                <header className="text-center mb-16">
                    <h1 className="text-5xl font-bold text-white mb-4">The right plan for your business.</h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">From solo founders to enterprise teams, InnovaForge scales with you.</p>
                    <a href="#/dashboard" className="text-sm text-purple-400 hover:underline mt-4 inline-block">&larr; Back to Dashboard</a>
                </header>

                <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto items-start">
                    {PLANS.map((plan) => (
                        <PricingCard
                            key={plan.key}
                            plan={plan}
                            onCheckout={handleCheckout}
                            isLoading={loadingPlan === plan.key}
                            currentPlan={user?.plan || 'free'}
                         />
                    ))}
                </main>

                <section className="text-center mt-20 max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold mb-6 text-cyan-300 flex items-center justify-center gap-3">
                        <SparklesIcon className="w-8 h-8"/>
                        Add-Ons & Custom Solutions
                    </h2>
                    <p className="text-slate-400 mb-8">
                        Need more power? We've got you covered. All add-ons can be applied to any plan.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="p-4 bg-slate-800/50 rounded-lg">
                            <p className="font-bold text-white">Extra Builds</p>
                            <p className="text-sm text-slate-300">$5 / 10 builds</p>
                        </div>
                        <div className="p-4 bg-slate-800/50 rounded-lg">
                            <p className="font-bold text-white">Extra Storage</p>
                            <p className="text-sm text-slate-300">$10 / 10 GB</p>
                        </div>
                        <div className="p-4 bg-slate-800/50 rounded-lg">
                            <p className="font-bold text-white">Extra Team Seat</p>
                            <p className="text-sm text-slate-300">$20 / seat</p>
                        </div>
                        <div className="p-4 bg-slate-800/50 rounded-lg">
                            <p className="font-bold text-white">Custom AI Model</p>
                            <p className="text-sm text-slate-300">$99 / month</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default PricingPage;