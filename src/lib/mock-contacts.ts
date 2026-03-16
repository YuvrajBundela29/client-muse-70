import { Contact, IntentSignal } from '@/types/finder';

const FIRST_NAMES = ['Alex', 'Jordan', 'Sam', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Quinn', 'Avery', 'Blake', 'Drew', 'Kai', 'Noor', 'Priya', 'Ravi', 'Sana', 'Liam', 'Emma', 'Noah', 'Olivia', 'Ethan', 'Ava', 'Lucas', 'Mia', 'James', 'Sophie', 'Ben', 'Zara', 'Leo', 'Nina'];
const LAST_NAMES = ['Chen', 'Patel', 'Kim', 'Rodriguez', 'Singh', 'Johnson', 'Williams', 'Brown', 'Garcia', 'Miller', 'Davis', 'Martinez', 'Anderson', 'Thomas', 'Lee', 'White', 'Clark', 'Lewis', 'Hall', 'Young'];
const COMPANIES = ['NexaTech', 'VaultPay', 'MedPulse', 'CyberShield', 'PropFlow', 'AdScale', 'ShopWave', 'CloudNine', 'DataForge', 'PixelCraft', 'FinLeap', 'HealthBridge', 'SecureNet', 'BuildRight', 'GrowthLab', 'CodeVault', 'AISpark', 'TrustLayer', 'FlowState', 'Zenith AI', 'Quantum Pay', 'BioSync', 'EdgeGuard', 'SkyProp', 'BrightAgency'];
const TITLES: Record<string, string[]> = {
  Founder: ['Founder & CEO', 'Co-Founder', 'Founder'],
  'C-Suite': ['CEO', 'CTO', 'CFO', 'COO', 'CMO'],
  VP: ['VP of Sales', 'VP of Engineering', 'VP of Marketing', 'VP of Product'],
  Director: ['Director of Growth', 'Director of Ops', 'Director of Engineering', 'Sales Director'],
  Manager: ['Marketing Manager', 'Product Manager', 'Sales Manager', 'Engineering Manager'],
};
const INDUSTRIES_MAP: Record<string, string> = { Tech: 'Tech', Fintech: 'Fintech', Healthcare: 'Healthcare', Cybersecurity: 'Cybersecurity', 'Real Estate': 'Real Estate', Agency: 'Agency', 'E-commerce': 'E-commerce', Other: 'Other' };
const CITIES = ['San Francisco', 'New York', 'London', 'Berlin', 'Singapore', 'Dubai', 'Mumbai', 'Toronto', 'Austin', 'Tel Aviv', 'Stockholm', 'Sydney', 'Bangalore', 'Amsterdam', 'Paris'];
const COUNTRIES = ['US', 'UK', 'Germany', 'Singapore', 'UAE', 'India', 'Canada', 'US', 'Israel', 'Sweden', 'Australia', 'India', 'Netherlands', 'France'];
const INTENT_SIGNALS: IntentSignal[] = ['🔥 Actively Hiring', '📈 Funding Received', '🛠 Tech Stack Change', '👀 Visited Pricing Page', '✅ Recently Funded'];
const INSIGHTS = [
  'just raised $4M Series A and is hiring 3 sales roles — high buying intent',
  'recently migrated to a new CRM — likely evaluating tools',
  'posted 5 job listings this week — scaling fast',
  'visited your pricing page twice in the last 7 days',
  'just closed a $12M Series B — budget unlocked',
  'switched from HubSpot to Salesforce — in transition',
  'CEO liked 3 posts about automation tools this week',
  'opened a new office in London — expanding operations',
  'launched a new product line — needs marketing support',
  'their website traffic grew 340% this quarter',
];
const EXPLANATIONS = [
  'Strong industry fit, recent funding, and active hiring signals indicate high purchase intent.',
  'Company size matches your ICP, decision-maker is accessible, and tech stack aligns.',
  'Budget signal is strong, seniority level is ideal, and recent activity shows buying behavior.',
  'Location matches, company is in growth phase, and role suggests decision-making authority.',
  'Multiple intent signals detected: hiring, funding, and tech changes all point to active evaluation.',
];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  return `${local[0]}***@${domain}`;
}

export function generateMockContacts(count = 60): Contact[] {
  const contacts: Contact[] = [];
  for (let i = 0; i < count; i++) {
    const firstName = pick(FIRST_NAMES);
    const lastName = pick(LAST_NAMES);
    const company = pick(COMPANIES);
    const seniority = pick(Object.keys(TITLES));
    const title = pick(TITLES[seniority]);
    const industry = pick(Object.keys(INDUSTRIES_MAP));
    const cityIdx = Math.floor(Math.random() * CITIES.length);
    const verified = Math.random() > 0.25;
    const freshness: Contact['dataFreshness'] = Math.random() > 0.6 ? 'fresh' : Math.random() > 0.4 ? 'aging' : 'stale';
    const score = Math.floor(30 + Math.random() * 70);
    const sizes = ['1–10', '11–50', '51–200', '201–1000', '1000+'];
    const budgets = ['Bootstrapped', 'Seed', 'Series A', 'Series B+', 'Enterprise'];
    const domain = company.toLowerCase().replace(/\s+/g, '') + '.com';
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`;

    contacts.push({
      id: crypto.randomUUID(),
      firstName,
      lastName,
      avatarUrl: null,
      jobTitle: title,
      companyName: company,
      industry,
      companySize: pick(sizes),
      seniority,
      email,
      emailVerified: verified,
      lastVerifiedAt: verified ? daysAgo(Math.floor(Math.random() * 14)) : null,
      linkedinUrl: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}-${Math.floor(Math.random() * 9999)}`,
      companyWebsite: `https://${domain}`,
      location: `${CITIES[cityIdx]}, ${COUNTRIES[cityIdx % COUNTRIES.length]}`,
      country: COUNTRIES[cityIdx % COUNTRIES.length],
      city: CITIES[cityIdx],
      budgetSignal: pick(budgets),
      aiMatchScore: score,
      intentSignal: pick(INTENT_SIGNALS),
      aiInsight: `This company ${pick(INSIGHTS)}`,
      matchExplanation: pick(EXPLANATIONS),
      dataFreshness: freshness,
      saved: false,
      emailRevealed: false,
    });
  }
  return contacts.sort((a, b) => b.aiMatchScore - a.aiMatchScore);
}
