// This file assumes the PostHog SDK is loaded globally from the CDN in index.html
declare const posthog: any;

if (typeof window !== 'undefined' && typeof posthog !== 'undefined') {
  posthog.init('YOUR_POSTHOG_KEY', {
    api_host: 'https://app.posthog.com',
    loaded: (posthogInstance: any) => {
      if (process.env.NODE_ENV === 'development') posthogInstance.debug();
    },
  });
}

// Track events
export const analytics = {
  ideaGenerated: (idea: any) => {
    posthog?.capture("idea_generated", {
      title: idea.title,
      slavkoScore: idea.slavkoScore,
      techStack: idea.techStack,
    });
  },

  ideaApproved: (ideaId: string) => {
    posthog?.capture("idea_approved", { ideaId });
  },

  buildStarted: (buildId: string, ideaId: string) => {
    posthog?.capture("build_started", { buildId, ideaId });
  },

  buildCompleted: (buildId: string, status: string, duration?: number) => {
    posthog?.capture("build_completed", { buildId, status, duration });
  },

  appDeployed: (ideaId: string, environment: string, url: string) => {
    posthog?.capture("app_deployed", { ideaId, environment, url });
  },

  pageViewed: (page: 'landing' | 'dashboard' | 'pricing') => {
    posthog?.capture('$pageview', { page });
  }
};