export interface Lead {
  id: string;
  business_name: string;
  industry: string;
  city: string;
  website: string | null;
  email: string | null;
  phone: string | null;
  instagram_url: string | null;
  google_rating: number | null;
  website_problem: string | null;
  growth_opportunity: string | null;
  recommended_service: string | null;
  outreach_message: string | null;
  status: 'new' | 'contacted' | 'replied';
  created_at: string;
}

export interface SearchParams {
  industry: string;
  location: string;
  service: string;
}

export type SearchStep = 'idle' | 'searching' | 'scraping' | 'analyzing' | 'complete' | 'error';

// Extended lead with computed AI fields (generated client-side from existing data)
export interface EnrichedLead extends Lead {
  confidence_score: number;
  urgency: 'low' | 'medium' | 'high';
  intent_signal: string;
  intent_reason: string;
  why_match: string;
  audit_ux: number;
  audit_seo: number;
  audit_speed: number;
  outreach_professional: string;
  outreach_friendly: string;
  outreach_aggressive: string;
}
