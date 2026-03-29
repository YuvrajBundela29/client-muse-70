import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Process pending referral code after login/signup confirmation
      if (session?.user && _event === 'SIGNED_IN') {
        const pendingCode = localStorage.getItem("pending_referral_code");
        if (pendingCode) {
          localStorage.removeItem("pending_referral_code");
          try {
            const { data: referrer } = await supabase
              .from("profiles")
              .select("id")
              .eq("referral_code", pendingCode)
              .single();
            if (referrer && referrer.id !== session.user.id) {
              // Update referred_by
              await supabase.from("profiles").update({ referred_by: referrer.id }).eq("id", session.user.id);
              // Create referral record
              await supabase.from("referrals").insert({
                referrer_id: referrer.id,
                referee_id: session.user.id,
                reward_credits: 50,
                status: "completed",
              });
              // Give bonus credits to both
              // Give bonus credits to referrer (best effort)
              const { data: referrerProfile } = await supabase.from("profiles").select("credits_remaining").eq("id", referrer.id).single();
              if (referrerProfile) {
                await supabase.from("profiles").update({ credits_remaining: referrerProfile.credits_remaining + 50 }).eq("id", referrer.id);
              }
              await supabase.from("profiles").update({ credits_remaining: 60 }).eq("id", session.user.id);
            }
          } catch {}
        }
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
