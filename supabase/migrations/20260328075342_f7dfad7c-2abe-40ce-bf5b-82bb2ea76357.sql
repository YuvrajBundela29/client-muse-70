
-- Profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  avatar_url text,
  plan text NOT NULL DEFAULT 'free',
  credits_remaining integer NOT NULL DEFAULT 10,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Saved leads table
CREATE TABLE public.saved_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  notes text,
  pipeline_stage text NOT NULL DEFAULT 'new',
  last_contacted_at timestamptz,
  follow_up_due_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, lead_id)
);

ALTER TABLE public.saved_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own saved leads" ON public.saved_leads
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved leads" ON public.saved_leads
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved leads" ON public.saved_leads
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved leads" ON public.saved_leads
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Search history table
CREATE TABLE public.search_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  industry text NOT NULL,
  location text NOT NULL,
  service text NOT NULL,
  result_count integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own history" ON public.search_history
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own history" ON public.search_history
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own history" ON public.search_history
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Add user_id to leads table
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update leads RLS to be user-scoped
DROP POLICY IF EXISTS "Anyone can insert leads" ON public.leads;
DROP POLICY IF EXISTS "Anyone can read leads" ON public.leads;
DROP POLICY IF EXISTS "Anyone can update leads" ON public.leads;

CREATE POLICY "Auth users can insert leads" ON public.leads
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Auth users can read own leads" ON public.leads
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Auth users can update own leads" ON public.leads
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Auth users can delete own leads" ON public.leads
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Add user_id to client_pipeline
ALTER TABLE public.client_pipeline ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

DROP POLICY IF EXISTS "Anyone can read pipeline" ON public.client_pipeline;
DROP POLICY IF EXISTS "Anyone can insert pipeline" ON public.client_pipeline;
DROP POLICY IF EXISTS "Anyone can update pipeline" ON public.client_pipeline;
DROP POLICY IF EXISTS "Anyone can delete pipeline" ON public.client_pipeline;

CREATE POLICY "Auth users can read own pipeline" ON public.client_pipeline
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Auth users can insert own pipeline" ON public.client_pipeline
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Auth users can update own pipeline" ON public.client_pipeline
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Auth users can delete own pipeline" ON public.client_pipeline
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
