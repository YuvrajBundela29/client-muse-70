export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  jobTitle: string;
  companyName: string;
  industry: string;
  companySize: string;
  seniority: string;
  email: string;
  emailVerified: boolean;
  lastVerifiedAt: string | null;
  linkedinUrl: string;
  companyWebsite: string;
  location: string;
  country: string;
  city: string;
  budgetSignal: string;
  aiMatchScore: number;
  intentSignal: IntentSignal;
  aiInsight: string;
  matchExplanation: string;
  dataFreshness: 'fresh' | 'aging' | 'stale';
  saved: boolean;
  emailRevealed: boolean;
}

export type IntentSignal =
  | '🔥 Actively Hiring'
  | '📈 Funding Received'
  | '🛠 Tech Stack Change'
  | '👀 Visited Pricing Page'
  | '✅ Recently Funded';

export interface FinderFilters {
  search: string;
  industries: string[];
  companySize: string;
  seniorities: string[];
  country: string;
  city: string;
  budgetSignal: string;
  sortBy: 'match' | 'recent' | 'size';
}

export const INDUSTRIES = [
  'Tech', 'Fintech', 'Healthcare', 'Cybersecurity',
  'Real Estate', 'Agency', 'E-commerce', 'Other',
] as const;

export const COMPANY_SIZES = [
  '1–10', '11–50', '51–200', '201–1000', '1000+',
] as const;

export const SENIORITIES = [
  'Founder', 'C-Suite', 'VP', 'Director', 'Manager',
] as const;

export const BUDGET_SIGNALS = [
  'Bootstrapped', 'Seed', 'Series A', 'Series B+', 'Enterprise',
] as const;

export const PRESETS: Record<string, Partial<FinderFilters>> = {
  '🤖 AI Startups': { industries: ['Tech'], budgetSignal: 'Seed', search: 'AI' },
  '💰 Fintech': { industries: ['Fintech'], budgetSignal: 'Series A' },
  '🏥 HealthTech': { industries: ['Healthcare'], budgetSignal: 'Series A' },
  '🔐 Cybersecurity': { industries: ['Cybersecurity'], budgetSignal: 'Series B+' },
};
