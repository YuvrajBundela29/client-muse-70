-- Admin can read ALL profiles
CREATE POLICY "Admin can read all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can update ALL profiles (change plans, credits)
CREATE POLICY "Admin can update all profiles"
ON public.profiles FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can read ALL transactions
CREATE POLICY "Admin can read all transactions"
ON public.transactions FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can read ALL search history
CREATE POLICY "Admin can read all search history"
ON public.search_history FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can read ALL leads
CREATE POLICY "Admin can read all leads"
ON public.leads FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can read ALL pipeline
CREATE POLICY "Admin can read all pipeline"
ON public.client_pipeline FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can read ALL saved leads
CREATE POLICY "Admin can read all saved leads"
ON public.saved_leads FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can read ALL referrals
CREATE POLICY "Admin can read all referrals"
ON public.referrals FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can read ALL subscriptions
CREATE POLICY "Admin can read all subscriptions"
ON public.user_subscriptions FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can read contact submissions
CREATE POLICY "Admin can read contact submissions"
ON public.contact_submissions FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));