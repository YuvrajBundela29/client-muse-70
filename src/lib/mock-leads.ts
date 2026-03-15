import { Lead, SearchParams } from "@/types/lead";

const PROBLEMS = [
  "No lead capture form on homepage",
  "Website is not mobile responsive",
  "No online booking system available",
  "Missing social media integration",
  "Outdated website design from 2018",
  "No SEO optimization detected",
  "No Google Business profile linked",
  "Missing call-to-action buttons",
  "No email newsletter signup",
  "Slow page load speed (>5s)",
];

const OPPORTUNITIES = [
  "Add AI-powered chatbot for lead capture",
  "Implement automated booking system",
  "Create Instagram content strategy",
  "Build SEO-optimized landing pages",
  "Set up email marketing automation",
  "Add customer testimonials section",
  "Implement Google Ads campaign",
  "Create referral program system",
  "Build mobile-first responsive design",
  "Add video content to homepage",
];

const SERVICES = [
  "AI Website + Lead Capture System",
  "Social Media Management",
  "SEO Optimization Package",
  "Automated Booking System",
  "Content Marketing Strategy",
];

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateOutreach(name: string, problem: string, service: string): string {
  return `Hi, I noticed ${name}'s website ${problem.toLowerCase()}. I help businesses like yours ${service.toLowerCase()} to convert more visitors into paying customers. Would you like me to share a quick idea for your business?`;
}

export function generateMockLeads(params: SearchParams): Lead[] {
  const prefixes = ["Elite", "Premier", "Golden", "Star", "Royal", "Metro", "Urban", "Peak", "Prime", "Pro"];
  const suffixes = ["Hub", "Zone", "Center", "Studio", "Club", "Point", "Place", "Spot", "Works", "Lab"];
  const domains = [".com", ".in", ".co", ".net", ".org"];
  
  const count = 15 + Math.floor(Math.random() * 10);
  const leads: Lead[] = [];

  for (let i = 0; i < count; i++) {
    const prefix = randomPick(prefixes);
    const suffix = randomPick(suffixes);
    const name = `${prefix} ${params.industry} ${suffix}`;
    const problem = randomPick(PROBLEMS);
    const opportunity = randomPick(OPPORTUNITIES);
    const domain = name.toLowerCase().replace(/\s+/g, "") + randomPick(domains);

    leads.push({
      id: crypto.randomUUID(),
      business_name: name,
      industry: params.industry,
      city: params.location,
      website: `https://${domain}`,
      email: Math.random() > 0.3 ? `info@${domain}` : null,
      phone: Math.random() > 0.2 ? `+91 ${Math.floor(7000000000 + Math.random() * 3000000000)}` : null,
      instagram_url: Math.random() > 0.4 ? `https://instagram.com/${domain.split(".")[0]}` : null,
      google_rating: Math.round((3 + Math.random() * 2) * 10) / 10,
      website_problem: problem,
      growth_opportunity: opportunity,
      recommended_service: randomPick(SERVICES),
      outreach_message: generateOutreach(name, problem, params.service),
      status: "new",
      created_at: new Date().toISOString(),
    });
  }

  return leads;
}
