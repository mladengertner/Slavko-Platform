import React from 'react';
import type { UserProfile } from '../types';
import { useToast } from '../hooks/useToast';

export const ReferralSystem = ({ user }: { user: UserProfile }) => {
  const { toast } = useToast();
  if (!user?.referrals) return null;
  
  const referralLink = `https://innovaforge.dev/signup?ref=${user.referrals.referralCode}`;
  const referredCount = user.referrals.referredCount || 0;

  const REFERRAL_TIERS = [
    { count: 1, reward: "+5 builds for both" },
    { count: 3, reward: "1 month Pro free" },
    { count: 5, reward: "Lifetime 50% discount" }
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied!");
  };

  return (
    <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
      <h4 className="text-white font-semibold mb-3">🎁 Invite Friends, Get Rewards</h4>
      
      <div className="grid grid-cols-3 gap-2 mb-3">
        {REFERRAL_TIERS.map((tier, index) => (
          <div 
            key={index}
            className={`text-center p-2 rounded ${
              referredCount >= tier.count 
                ? 'bg-green-500/20 border border-green-500/30' 
                : 'bg-white/5'
            }`}
          >
            <div className="text-white font-bold">{tier.count}+</div>
            <div className="text-gray-300 text-xs">{tier.reward}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input 
          value={referralLink}
          readOnly
          className="flex-1 bg-white/5 border-white/10 text-white rounded-md px-3 py-1 text-sm"
        />
        <button 
          onClick={handleCopy}
          className="bg-white/10 hover:bg-white/20 text-white font-semibold py-1 px-3 rounded-md text-sm"
        >
          Copy
        </button>
      </div>
    </div>
  );
};
