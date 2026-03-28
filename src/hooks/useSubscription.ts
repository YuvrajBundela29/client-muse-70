import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Subscription {
  plan: string;
  status: string;
  searchesUsed: number;
  searchLimit: number;
  canSearch: boolean;
}

const PLAN_LIMITS: Record<string, number> = {
  free: 10,
  solo: 100,
  pro: 500,
  agency: 99999,
};

export function useSubscription(): Subscription & { loading: boolean; refresh: () => void } {
  const { user } = useAuth();
  const [sub, setSub] = useState<Subscription>({
    plan: "free",
    status: "active",
    searchesUsed: 0,
    searchLimit: 10,
    canSearch: true,
  });
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    if (!user) return;
    const { data } = await (supabase as any)
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (data) {
      const d = data as Record<string, unknown>;
      const plan = (d.plan as string) || "free";
      const used = (d.searches_used_this_month as number) || 0;
      const limit = PLAN_LIMITS[plan] || 10;
      setSub({
        plan,
        status: (d.status as string) || "active",
        searchesUsed: used,
        searchLimit: limit,
        canSearch: used < limit,
      });
    }
    setLoading(false);
  };

  useEffect(() => { fetch(); }, [user]);

  return { ...sub, loading, refresh: fetch };
}
