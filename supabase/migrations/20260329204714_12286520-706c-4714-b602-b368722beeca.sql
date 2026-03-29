
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code text UNIQUE DEFAULT substr(md5(gen_random_uuid()::text), 1, 8);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referred_by uuid REFERENCES profiles(id);

CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referee_id uuid NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  reward_credits int NOT NULL DEFAULT 50,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own referrals" ON referrals FOR SELECT TO authenticated
  USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

CREATE POLICY "Users can insert referrals" ON referrals FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = referee_id);

CREATE OR REPLACE FUNCTION auto_sync_lead_to_pipeline()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.user_id IS NOT NULL THEN
    INSERT INTO client_pipeline (lead_id, user_id, pipeline_status)
    VALUES (NEW.id, NEW.user_id, 'not_contacted')
    ON CONFLICT (lead_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_sync_lead ON leads;
CREATE TRIGGER trg_auto_sync_lead
  AFTER INSERT ON leads
  FOR EACH ROW
  EXECUTE FUNCTION auto_sync_lead_to_pipeline();
