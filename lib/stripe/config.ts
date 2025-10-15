// This file is for frontend configuration.
// Sensitive keys and logic would be on the server.

export const PLANS = [
  {
    key: "free",
    name: "Free",
    price: 0,
    priceId: null,
    description: "For individuals exploring ideas.",
    features: [
      "5 ideas/month",
      "2 builds/month",
      "1 active project",
      "Community support",
    ],
    cta: "Start for Free",
    popular: false,
  },
  {
    key: "founder",
    name: "Founder",
    price: 49,
    priceId: 'price_founder_123', // Example Price ID
    description: "For solo founders and freelancers.",
    features: [
      "50 ideas/month",
      "20 builds/month",
      "5 active projects",
      "QuantumBuild™ Speed",
      "Priority community support",
      "Custom domains",
    ],
    cta: "Choose Founder",
    popular: true,
    highlighted: true,
  },
  {
    key: "team",
    name: "Team",
    price: 99,
    priceId: 'price_team_123', // Example Price ID
    description: "For startups and small agencies.",
    features: [
      "Unlimited ideas",
      "100 builds/month",
      "20 active projects",
      "Up to 5 team seats",
      "Shared projects & roles",
      "Priority email support",
    ],
    cta: "Choose Team",
    popular: false,
  },
  {
    key: "enterprise",
    name: "Enterprise",
    price: null, // Custom pricing
    priceId: 'price_enterprise_123', // Example Price ID
    description: "For scaling businesses.",
    features: [
      "Everything in Team",
      "Unlimited builds & projects",
      "Custom team seats",
      "SAML SSO & advanced security",
      "Dedicated support & SLA",
      "On-premise deployment option"
    ],
    cta: "Contact Sales",
    popular: false
  }
];