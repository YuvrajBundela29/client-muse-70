
-- Lock down SECURITY DEFINER functions: revoke from public/anon/authenticated,
-- then grant only where intentional.
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user_subscription() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.auto_sync_lead_to_pipeline() FROM PUBLIC, anon, authenticated;

-- Public RPCs: allow anon + authenticated to invoke
REVOKE ALL ON FUNCTION public.get_portal_by_token(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_portal_by_token(text) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.get_public_portfolio(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_portfolio(uuid) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.submit_client_response(text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_client_response(text, text, text, text, text) TO anon, authenticated;

-- Replace overly-permissive "true" insert policies with validated ones.
DROP POLICY IF EXISTS "Anyone can insert contact submissions" ON public.contact_submissions;
CREATE POLICY "Anyone can submit valid contact form"
ON public.contact_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(trim(name)) BETWEEN 1 AND 100
  AND length(trim(email)) BETWEEN 3 AND 255
  AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND length(trim(subject)) BETWEEN 1 AND 200
  AND length(trim(message)) BETWEEN 1 AND 5000
);

DROP POLICY IF EXISTS "Anyone can insert ab events" ON public.ab_events;
CREATE POLICY "Anyone can log valid ab event"
ON public.ab_events
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(variant) BETWEEN 1 AND 50
  AND event_type IN ('view','click','conversion','signup')
);
