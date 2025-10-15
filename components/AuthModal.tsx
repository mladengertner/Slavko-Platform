import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { SparklesIcon } from './icons';

const GoogleIcon = () => (
    <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.222 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.048 36.336 44 30.561 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  );

export const AuthModal: React.FC = () => {
    const { authModalOpen, setAuthModalOpen, signInWithGoogle, loading } = useContext(AuthContext);

    if (!authModalOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setAuthModalOpen(false)}
            role="dialog"
            aria-modal="true"
        >
            <div 
                className="bg-gradient-to-br from-slate-900 to-purple-900/50 p-8 rounded-2xl max-w-sm w-full m-4 border border-purple-700/50 shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 text-yellow-400">
                        <SparklesIcon className="w-full h-full" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                        Welcome to InnovaForge™
                    </h2>
                    <p className="text-slate-300">
                        Sign in to start building SaaS apps with AI.
                    </p>
                </div>

                <button
                    onClick={signInWithGoogle}
                    disabled={loading}
                    className="w-full flex items-center justify-center bg-white hover:bg-gray-200 text-slate-800 font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                    <GoogleIcon />
                    Continue with Google
                </button>

                <div className="mt-6 text-xs text-slate-400 text-center">
                    By signing in, you agree to our Terms of Service.
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
            `}</style>
        </div>
    );
};
