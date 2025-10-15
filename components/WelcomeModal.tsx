import React from 'react';
import { SparklesIcon, XIcon } from './icons';

interface WelcomeModalProps {
  open: boolean;
  onClose: () => void;
  onGetStarted: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ open, onClose, onGetStarted }) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-gradient-to-br from-slate-900 via-slate-800 to-purple-900/50 p-8 rounded-2xl max-w-lg w-full m-4 border border-purple-700/50 shadow-2xl relative"
        onClick={e => e.stopPropagation()}
      >
        <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            aria-label="Close"
        >
            <XIcon />
        </button>
        <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 text-yellow-400 animate-pulse">
                <SparklesIcon className="w-full h-full" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">
                Welcome to InnovaForge™
            </h2>
            <p className="text-slate-300 mb-8 max-w-md mx-auto">
                You're one step away from turning ideas into reality. Let's start by generating your first AI-powered SaaS concept.
            </p>
            
            <div className="flex flex-col items-center space-y-4">
                <button
                    onClick={onGetStarted}
                    className="w-full max-w-xs inline-flex items-center justify-center px-6 py-3 border border-transparent text-lg font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-purple-500"
                >
                    <SparklesIcon className="w-5 h-5 mr-2" />
                    Generate My First Idea
                </button>
                <button
                    onClick={onClose}
                    className="text-slate-400 hover:text-white text-sm"
                >
                    I'll explore on my own
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};