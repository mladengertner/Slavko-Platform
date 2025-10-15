import { useState } from 'react';
import { useToast } from './useToast';

export const useCelebration = () => {
  const [showConfetti, setShowConfetti] = useState(false);
  const { toast } = useToast();

  const triggerFirstDeployCelebration = () => {
    setShowConfetti(true);
    toast.success("🎉 Your SaaS is LIVE! Share it with the world!");
    setTimeout(() => setShowConfetti(false), 5000);
  };

  const triggerMilestoneUnlock = (milestone: string) => {
    toast.info(`🏆 Achievement Unlocked! ${milestone}`);
  };

  return { showConfetti, triggerFirstDeployCelebration, triggerMilestoneUnlock };
};
