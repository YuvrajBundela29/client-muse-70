import { Lead, EnrichedLead } from "@/types/lead";

// Deterministic pseudo-random from string
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

const INTENT_SIGNALS = [
  { tag: "🔥 Actively Hiring", reason: "They are actively hiring for roles your service can fill — high buying intent." },
  { tag: "📈 Funding Received", reason: "Recent funding means budget allocated for growth — they need vendors now." },
  { tag: "🛠 Tech Stack Change", reason: "They're migrating technology — an ideal time to offer your expertise." },
  { tag: "👀 Visited Pricing Page", reason: "Behavioral signals suggest they're evaluating solutions like yours." },
  { tag: "📉 Declining Traffic", reason: "Their web traffic is dropping — they urgently need your help." },
];

export function enrichLead(lead: Lead): EnrichedLead {
  const h = hash(lead.id);
  const hasProblem = !!lead.website_problem;
  const hasOpportunity = !!lead.growth_opportunity;
  const hasWebsite = !!lead.website;
  const hasEmail = !!lead.email;

  // Confidence score weighted by data completeness
  let score = 40 + (h % 25);
  if (hasProblem) score += 15;
  if (hasOpportunity) score += 10;
  if (hasWebsite) score += 5;
  if (hasEmail) score += 5;
  score = clamp(score, 35, 98);

  // Urgency
  const urgency: EnrichedLead["urgency"] = score >= 75 ? "high" : score >= 55 ? "medium" : "low";

  // Intent signal
  const signal = INTENT_SIGNALS[h % INTENT_SIGNALS.length];

  // Why match
  const why = hasProblem
    ? `We detected "${lead.website_problem?.slice(0, 60)}" — your ${lead.recommended_service || "service"} directly addresses this gap.`
    : `${lead.business_name} in ${lead.industry} is a strong fit for ${lead.recommended_service || "your service"} based on their market position.`;

  // Audit scores (deterministic from hash)
  const audit_ux = clamp(20 + (h % 60), 15, 90);
  const audit_seo = clamp(15 + ((h >> 3) % 65), 10, 85);
  const audit_speed = clamp(25 + ((h >> 6) % 55), 20, 92);

  // Message variants
  const biz = lead.business_name;
  const svc = lead.recommended_service || "our services";
  const problem = lead.website_problem || "room for improvement in your online presence";

  const outreach_professional = `Dear ${biz} team,\n\nI noticed ${problem}. Our team specializes in ${svc} and we've helped similar businesses achieve measurable growth. I'd love to schedule a brief call to discuss how we can support your goals.\n\nBest regards`;

  const outreach_friendly = `Hey ${biz}! 👋\n\nI was checking out your business and noticed ${problem}. We help ${lead.industry.toLowerCase()} businesses with ${svc} — and honestly, I think we could make a real difference for you.\n\nWould you be open to a quick chat?`;

  const outreach_aggressive = `${biz} — you're leaving money on the table.\n\nYour ${problem}. Every day this isn't fixed, potential customers are choosing your competitors instead.\n\nWe fix this. Fast. ${svc} is what we do, and we have the results to prove it.\n\nLet's talk this week. Time is revenue.`;

  return {
    ...lead,
    confidence_score: score,
    urgency,
    intent_signal: signal.tag,
    intent_reason: signal.reason,
    why_match: why,
    audit_ux,
    audit_seo,
    audit_speed,
    outreach_professional,
    outreach_friendly,
    outreach_aggressive,
  };
}
