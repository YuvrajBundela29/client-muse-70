import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

// Credit costs per action
export const CREDIT_COSTS = {
  search: 1,
  ai_email: 2,
  intelligence_report: 3,
  contact_unlock: 5,
} as const;

export type CreditAction = keyof typeof CREDIT_COSTS;

export function useCredits() {
  const { user } = useAuth();
  const [credits, setCredits] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchCredits = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("credits_remaining")
      .eq("id", user.id)
      .single();
    if (data) setCredits(data.credits_remaining);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  const deductCredits = useCallback(
    async (action: CreditAction): Promise<boolean> => {
      if (!user) {
        toast.error("Please sign in to continue");
        return false;
      }
      const cost = CREDIT_COSTS[action];
      if (credits < cost) {
        toast.error(`Not enough credits. You need ${cost} credits for this action.`, {
          action: { label: "Buy Credits", onClick: () => window.location.href = "/upgrade" },
        });
        return false;
      }

      const newBalance = credits - cost;
      const { error } = await supabase
        .from("profiles")
        .update({ credits_remaining: newBalance })
        .eq("id", user.id);

      if (error) {
        toast.error("Failed to deduct credits");
        return false;
      }

      setCredits(newBalance);

      // Log transaction
      await supabase.from("transactions").insert({
        user_id: user.id,
        type: "credit_usage",
        amount_inr: 0,
        credits: -cost,
        description: `Used ${cost} credit${cost > 1 ? "s" : ""} for ${action.replace(/_/g, " ")}`,
        status: "success",
      });

      return true;
    },
    [user, credits]
  );

  const canAfford = useCallback(
    (action: CreditAction) => credits >= CREDIT_COSTS[action],
    [credits]
  );

  return { credits, loading, deductCredits, canAfford, refresh: fetchCredits };
}
