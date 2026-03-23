
-- Client Pipeline CRM table
CREATE TABLE public.client_pipeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
  pipeline_status text NOT NULL DEFAULT 'not_contacted',
  service_track text,
  recommended_package text,
  email_sent_date timestamptz,
  follow_up_day int,
  notes text,
  priority_rank int,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(lead_id)
);

ALTER TABLE public.client_pipeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read pipeline" ON public.client_pipeline FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert pipeline" ON public.client_pipeline FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update pipeline" ON public.client_pipeline FOR UPDATE TO public USING (true);
CREATE POLICY "Anyone can delete pipeline" ON public.client_pipeline FOR DELETE TO public USING (true);

-- Reel Library table
CREATE TABLE public.reel_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reel_code text NOT NULL UNIQUE,
  description text NOT NULL,
  industry_tags text[] NOT NULL DEFAULT '{}',
  keywords text[] NOT NULL DEFAULT '{}',
  drive_link text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.reel_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read reels" ON public.reel_library FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert reels" ON public.reel_library FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update reels" ON public.reel_library FOR UPDATE TO public USING (true);
CREATE POLICY "Anyone can delete reels" ON public.reel_library FOR DELETE TO public USING (true);

-- Insert the initial reel
INSERT INTO public.reel_library (reel_code, description, industry_tags, keywords, drive_link)
VALUES (
  'REEL_001',
  'Medical skincare serum penetration — dermis, collagen repair, fibroblast activation',
  ARRAY['beauty', 'skincare', 'cosmetics'],
  ARRAY['serum', 'collagen', 'dermis', 'fibroblast', 'skin penetration', 'cellular repair'],
  'https://drive.google.com/file/d/1rshqfNp7pWK9CoesqQ0tkNPL0Iuivefs/view?usp=sharing'
);
