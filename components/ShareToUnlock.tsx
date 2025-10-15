import React, { useState, useContext } from 'react';
import { useToast } from '../hooks/useToast';
import { AuthContext } from '../contexts/AuthContext';
import { api } from '../lib/api';

export const ShareToUnlock = ({ projectUrl }: { projectUrl?: string | null }) => {
  const { user } = useContext(AuthContext);
  const [shared, setShared] = useState(false);
  const { toast } = useToast();

  const handleShare = async (platform: 'twitter' | 'linkedin') => {
    if (!projectUrl) {
      toast.error("Deploy a project first to share!");
      return;
    }

    const shareText = `Just built and deployed my SaaS in 1.8 seconds with @InnovaForge! Check it out: ${projectUrl}`;
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(projectUrl)}`
    };

    window.open(shareUrls[platform], '_blank');
    
    try {
        await api.post('/api/rewards/social-share', { userId: user?.id });
        setShared(true);
        toast.success("Thanks for sharing! +2 builds added to your account.");
    } catch(error) {
        toast.error("Could not apply reward. Please try again.");
    }
  };

  if (shared) {
    return (
      <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
        <p className="text-green-400 text-center font-semibold">
          ✅ Thanks for sharing! +2 builds added to your account.
        </p>
      </div>
    );
  }
  
  if (!projectUrl) return null;

  return (
    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
      <h4 className="text-white font-semibold mb-2">📣 Share & Get Rewards</h4>
      <p className="text-gray-300 text-sm mb-3">
        Share your latest project and get +2 bonus builds this month!
      </p>
      <div className="flex gap-2">
        <button 
          onClick={() => handleShare('twitter')}
          className="flex-1 bg-sky-500/20 text-sky-400 hover:bg-sky-500/30 font-semibold py-2 px-3 rounded-md text-sm"
        >
          Share on X
        </button>
        <button
          onClick={() => handleShare('linkedin')} 
          className="flex-1 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 font-semibold py-2 px-3 rounded-md text-sm"
        >
          Share on LinkedIn
        </button>
      </div>
    </div>
  );
};
