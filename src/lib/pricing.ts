export interface Package {
  name: string;
  description: string;
  price: number;
  features: string[];
}

export interface ServiceTrack {
  id: string;
  name: string;
  description: string;
  packages: Package[];
}

export const SERVICE_TRACKS: Record<string, ServiceTrack> = {
  track_web: {
    id: "track_web",
    name: "Web Design & Development",
    description: "Websites, landing pages, e-commerce",
    packages: [
      { name: "Starter", description: "Single-page website with responsive design", price: 500, features: ["1-page site", "Responsive design", "1 revision"] },
      { name: "Pro", description: "Multi-page site with CMS and SEO basics", price: 1500, features: ["Up to 5 pages", "CMS integration", "SEO basics", "3 revisions"] },
      { name: "Bundle", description: "Full site + landing pages + maintenance", price: 3500, features: ["Full website", "3 landing pages", "Monthly maintenance"] },
    ],
  },
  track_seo: {
    id: "track_seo",
    name: "SEO & Search Optimization",
    description: "Organic growth, rankings, traffic",
    packages: [
      { name: "Starter", description: "SEO audit + keyword research", price: 400, features: ["Full site audit", "Keyword research", "Action plan"] },
      { name: "Pro", description: "Monthly SEO management", price: 1200, features: ["On-page optimization", "Link building", "Monthly reports"] },
      { name: "Bundle", description: "Full SEO + content strategy", price: 2500, features: ["Technical SEO", "Content calendar", "Link building", "Quarterly reviews"] },
    ],
  },
  track_social: {
    id: "track_social",
    name: "Social Media & Content",
    description: "Content creation, social management",
    packages: [
      { name: "Starter", description: "Content calendar + 12 posts/month", price: 350, features: ["12 posts/month", "Content calendar", "1 platform"] },
      { name: "Pro", description: "Full social management across platforms", price: 900, features: ["30 posts/month", "3 platforms", "Engagement management"] },
      { name: "Bundle", description: "Content + ads + influencer outreach", price: 2000, features: ["Full content suite", "Ad management", "Influencer outreach"] },
    ],
  },
  track_consulting: {
    id: "track_consulting",
    name: "Business Consulting & Strategy",
    description: "Strategy, growth planning, optimization",
    packages: [
      { name: "Starter", description: "2-hour strategy session", price: 300, features: ["2-hour session", "Action roadmap", "Email follow-up"] },
      { name: "Pro", description: "Monthly advisory retainer", price: 1500, features: ["4 sessions/month", "Slack support", "KPI tracking"] },
      { name: "Bundle", description: "Full growth partner engagement", price: 4000, features: ["Weekly sessions", "Full analytics", "Implementation support"] },
    ],
  },
};

export function getRecommendedPackage(confidence: number): string {
  if (confidence >= 90) return "Pro";
  if (confidence >= 75) return "Starter";
  return "Starter";
}
