
-- 1. Remove permissive public policies exposing sensitive data
DROP POLICY IF EXISTS "Public can read leads for portal" ON public.leads;
DROP POLICY IF EXISTS "Public can read profiles for portfolio" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can read active portal links" ON public.client_portal_links;

-- 2. Lock down reel_library (only admins may write)
DROP POLICY IF EXISTS "Anyone can insert reels" ON public.reel_library;
DROP POLICY IF EXISTS "Anyone can update reels" ON public.reel_library;
DROP POLICY IF EXISTS "Anyone can delete reels" ON public.reel_library;
DROP POLICY IF EXISTS "Anyone can read reels" ON public.reel_library;

CREATE POLICY "Reels are readable by anyone"
  ON public.reel_library FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Only admins can insert reels"
  ON public.reel_library FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update reels"
  ON public.reel_library FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete reels"
  ON public.reel_library FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 3. Secure RPC: get client portal by token (returns safe fields only)
CREATE OR REPLACE FUNCTION public.get_portal_by_token(_token text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _link record;
  _profile record;
  _lead record;
BEGIN
  IF _token IS NULL OR length(_token) < 8 THEN
    RETURN NULL;
  END IF;

  SELECT id, user_id, lead_id, message, is_active
    INTO _link
  FROM public.client_portal_links
  WHERE token = _token AND is_active = true
  LIMIT 1;

  IF _link.id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT full_name, service INTO _profile
  FROM public.profiles WHERE id = _link.user_id;

  SELECT business_name, industry, city, recommended_service, website_problem, growth_opportunity
    INTO _lead
  FROM public.leads WHERE id = _link.lead_id;

  RETURN jsonb_build_object(
    'id', _link.id,
    'message', _link.message,
    'is_active', _link.is_active,
    'freelancer_name', COALESCE(_profile.full_name, 'A Freelancer'),
    'freelancer_service', _profile.service,
    'lead_name', COALESCE(_lead.business_name, 'Your Business'),
    'lead_industry', COALESCE(_lead.industry, ''),
    'lead_city', COALESCE(_lead.city, ''),
    'recommended_service', _lead.recommended_service,
    'website_problem', _lead.website_problem,
    'growth_opportunity', _lead.growth_opportunity
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_portal_by_token(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_portal_by_token(text) TO anon, authenticated;

-- 4. Secure RPC: public portfolio (no email exposed)
CREATE OR REPLACE FUNCTION public.get_public_portfolio(_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _p record;
  _leads_count int;
  _closed_count int;
BEGIN
  SELECT full_name, industry, service, country, avatar_url, plan, created_at, onboarding_complete
    INTO _p
  FROM public.profiles WHERE id = _user_id;

  IF _p.full_name IS NULL OR NOT COALESCE(_p.onboarding_complete, false) THEN
    RETURN NULL;
  END IF;

  SELECT COUNT(*) INTO _leads_count FROM public.leads WHERE user_id = _user_id;
  SELECT COUNT(*) INTO _closed_count FROM public.client_pipeline WHERE user_id = _user_id AND pipeline_status = 'closed';

  RETURN jsonb_build_object(
    'full_name', _p.full_name,
    'industry', _p.industry,
    'service', _p.service,
    'country', _p.country,
    'avatar_url', _p.avatar_url,
    'plan', _p.plan,
    'created_at', _p.created_at,
    'leads_count', _leads_count,
    'closed_count', _closed_count
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_public_portfolio(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_portfolio(uuid) TO anon, authenticated;

-- 5. Allow anonymous client_responses insert only via a token-validated RPC
CREATE OR REPLACE FUNCTION public.submit_client_response(
  _token text,
  _respondent_name text,
  _respondent_email text,
  _message text,
  _interest_level text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _link_id uuid;
BEGIN
  IF _token IS NULL OR length(_token) < 8 THEN
    RAISE EXCEPTION 'Invalid token';
  END IF;
  IF _respondent_name IS NULL OR length(trim(_respondent_name)) = 0 OR length(_respondent_name) > 100 THEN
    RAISE EXCEPTION 'Invalid name';
  END IF;
  IF _respondent_email IS NULL OR _respondent_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' OR length(_respondent_email) > 255 THEN
    RAISE EXCEPTION 'Invalid email';
  END IF;
  IF _message IS NULL OR length(trim(_message)) = 0 OR length(_message) > 2000 THEN
    RAISE EXCEPTION 'Invalid message';
  END IF;
  IF _interest_level NOT IN ('interested','maybe','not_interested') THEN
    RAISE EXCEPTION 'Invalid interest level';
  END IF;

  SELECT id INTO _link_id
  FROM public.client_portal_links
  WHERE token = _token AND is_active = true
  LIMIT 1;

  IF _link_id IS NULL THEN
    RAISE EXCEPTION 'Portal not found';
  END IF;

  INSERT INTO public.client_responses (portal_link_id, respondent_name, respondent_email, message, interest_level)
  VALUES (_link_id, _respondent_name, _respondent_email, _message, _interest_level);

  RETURN jsonb_build_object('ok', true);
END;
$$;

REVOKE ALL ON FUNCTION public.submit_client_response(text,text,text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_client_response(text,text,text,text,text) TO anon, authenticated;
