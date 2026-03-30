import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children, skipOnboarding }: { children: React.ReactNode; skipOnboarding?: boolean }) {
  const { user, loading } = useAuth();
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user || skipOnboarding) return;
    supabase.from("profiles").select("onboarding_complete").eq("id", user.id).single().then(({ data }) => {
      setOnboardingComplete(data?.onboarding_complete ?? false);
    });
  }, [user, skipOnboarding]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  // Wait for onboarding check
  if (!skipOnboarding && onboardingComplete === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect to onboarding if not complete
  if (!skipOnboarding && onboardingComplete === false) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
