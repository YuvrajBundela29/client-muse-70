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
  classify_reply: 2,
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

      // Server-side credit deduction
      const { data, error } = await supabase.functions.invoke("deduct-credits", {
        body: { action },
      });

      if (error) {
        toast.error("Failed to deduct credits");
        return false;
      }

      if (!data?.success) {
        if (data?.error === "Insufficient credits") {
          toast.error(`Not enough credits. You need ${cost} credits for this action.`, {
            action: { label: "Buy Credits", onClick: () => window.location.href = "/upgrade" },
          });
          setCredits(data?.credits_remaining ?? 0);
        } else {
          toast.error(data?.error || "Failed to deduct credits");
        }
        return false;
      }

      setCredits(data.credits_remaining);
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
