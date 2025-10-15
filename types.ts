export interface Idea {
  id: string;
  title: string;
  description: string;
  problem: string;
  solution: string;
  targetAudience: string;
  techStack: string[];
  features: string[];
  monetization: string;
  marketSize: string;
  competitors: string[];
  slavkoScore: number;
  status: "pending" | "building" | "staging" | "deployed";
  createdAt: {
    seconds: number;
    nanoseconds: number;
  } | string;
  productionUrl?: string;
  stagingUrl?: string;
  userId?: string; // Added to track ownership
}

export interface Build {
  id: string;
  ideaId: string;
  ideaTitle: string;
  status: "queued" | "running" | "testing" | "deploying" | "success" | "failed";
  startedAt: {
    seconds: number;
    nanoseconds: number;
  } | string;
  completedAt?: {
    seconds: number;
    nanoseconds: number;
  } | string;
  duration?: number;
  logs: string[];
  testResults?: {
    total: number;
    passed: number;
    failed: number;
    coverage: number;
  };
  stagingUrl?: string;
  githubRunId?: string;
  deploymentTarget?: 'Vercel' | 'Firebase Hosting';
  location?: { lat: number; lng: number; city: string }; // For world map
}

export interface AnalyticsMetrics {
  totalUsers: number;
  activeBuilds: number;
  revenue: number;
  conversionRate: number;
}

export type StatusLevel = 'normal' | 'warning' | 'critical';

export interface Metrics {
  latency: number;
  errorRate: number;
  requestRate: number;
  cpuUsage: number;
  memoryUsage: number;
  activeAlerts: number;
}

export interface MetricStatus {
  latency: StatusLevel;
  errorRate: StatusLevel;
  cpuUsage: StatusLevel;
  memoryUsage: StatusLevel;
  activeAlerts: StatusLevel;
}

export interface UserUsage {
  ideasGenerated: number;
  buildsStarted: number;
  activeProjects: number;
  storageUsed: number;
  bandwidthUsed: number;
}

export interface UserLimits {
  ideasPerMonth: number;
  buildsPerMonth: number;
  maxActiveProjects: number;
  storageLimit: number; // in GB
  bandwidthLimit: number; // in GB
  seats: number; // For team plans
}

export interface UserProfile {
  id: string;
  email: string;
  plan: 'free' | 'founder' | 'team' | 'enterprise';
  usage: UserUsage;
  limits: UserLimits;
  lastResetAt?: string;
  stripeCustomerId?: string;
  subscriptionId?: string;
  subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'incomplete';
  isNewUser?: boolean;
  role: 'admin' | 'owner' | 'member'; // Team roles
  // Fix: Completed the createdAt type and added other missing properties.
  createdAt?: {
    seconds: number;
    nanoseconds: number;
  } | string;
  latestProjectUrl?: string;
  status?: 'active' | 'suspended';
  referrals?: {
    referralCode: string;
    referredCount: number;
  };
}

// Fix: Added missing CostMetrics interface.
export interface CostMetrics {
    vercel: number;
    kv: number;
    gemini: number;
    total: number;
    perUser: number;
}
