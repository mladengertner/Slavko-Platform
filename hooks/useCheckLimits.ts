import { useState } from "react";
import type { UserProfile, UserUsage, UserLimits } from '../types';
import { api } from "../lib/api";

export interface CheckLimitResponse {
    canProceed: boolean;
    reason: string;
    usage: UserUsage;
    limits: UserLimits;
    plan: UserProfile['plan'];
}

export function useCheckLimits() {
  const [checking, setChecking] = useState(false);

  const checkLimit = async (action: 'generate_idea' | 'start_build' | 'deploy_project', userId: string): Promise<CheckLimitResponse | null> => {
    setChecking(true);
    try {
      const data = await api.post<CheckLimitResponse>("/api/check-limits", {
        userId,
        action,
      });
      return data;
    } catch (error) {
        console.error("Error checking limits:", error);
        // Return a permissive response on frontend error to avoid blocking user unnecessarily
        return null;
    }
    finally {
      setChecking(false);
    }
  };

  return { checkLimit, checking };
}