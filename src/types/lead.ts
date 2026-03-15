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
