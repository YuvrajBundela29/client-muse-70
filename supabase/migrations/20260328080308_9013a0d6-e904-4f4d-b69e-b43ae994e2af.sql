
-- 1. saved_searches table
CREATE TABLE public.saved_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  label text NOT NULL,
  industry text,
  country text,
  service text,
  filters_json jsonb DEFAULT '{}'::jsonb,
  is_alert boolean DEFAULT false,
  alert_frequency text DEFAULT 'weekly',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own saved searches" ON public.saved_searches FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own saved searches" ON public.saved_searches FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own saved searches" ON public.saved_searches FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own saved searches" ON public.saved_searches FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 2. user_subscriptions table
CREATE TABLE public.user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  plan text NOT NULL DEFAULT 'free',
  stripe_customer_id text,
  stripe_subscription_id text,
  status text DEFAULT 'active',
  current_period_end timestamptz,
  searches_used_this_month integer DEFAULT 0,
  searches_reset_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own subscription" ON public.user_subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own subscription" ON public.user_subscriptions FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- 3. client_activity table
CREATE TABLE public.client_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,
  user_id uuid NOT NULL,
  activity_type text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.client_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own activity" ON public.client_activity FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activity" ON public.client_activity FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 4. Update profiles: add onboarding fields
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS onboarding_complete boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS industry text,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS service text;

-- 5. Update search_history: add results_json and filters_json
ALTER TABLE public.search_history
  ADD COLUMN IF NOT EXISTS results_json jsonb,
  ADD COLUMN IF NOT EXISTS filters_json jsonb;

-- 6. Auto-create user_subscriptions on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.user_subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_subscription();
