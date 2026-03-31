import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Loader2, Gift } from "lucide-react";
import logoWhite from "@/assets/logo-white.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Auth() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (mode === "signup") {
      const { error } = await signUp(email, password, fullName);
      if (error) {
        toast.error(error.message);
      } else {
        if (referralCode.trim()) {
          try {
            const { data: referrer } = await supabase
              .from("profiles")
              .select("id")
              .eq("referral_code", referralCode.trim().toLowerCase())
              .single();
            if (referrer) {
              localStorage.setItem("pending_referral_code", referralCode.trim().toLowerCase());
            } else {
              toast.error("Invalid referral code, but your account was created!");
            }
          } catch {}
        }
        toast.success("Check your email to confirm your account!");
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) toast.error(error.message);
      else navigate("/dashboard");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[hsl(228,50%,8%)] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 mesh-gradient" />
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-[#5B5FEF]/6 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-[#A78BFA]/6 rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-3">
            <div className="relative">
              <img src={logoWhite} alt="AutoClient AI" className="h-8 w-8" />
              <div className="absolute inset-0 blur-xl bg-[#5B5FEF]/30" />
            </div>
            <span className="text-2xl font-bold text-gradient">AutoClient AI</span>
          </div>
          <p className="text-[#8892B0] text-sm">
            {mode === "login" ? "Welcome back. Let's find clients." : "Start finding clients in 60 seconds."}
          </p>
        </div>

        <div className="glass-card rounded-2xl p-7">
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-10 h-11 glass-input" required />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 h-11 glass-input" required />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 h-11 glass-input" required minLength={6} />
            </div>
            {mode === "signup" && (
              <div className="relative">
                <Gift className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Referral code (optional)" value={referralCode} onChange={(e) => setReferralCode(e.target.value)} className="pl-10 h-11 glass-input font-mono uppercase" maxLength={8} />
              </div>
            )}
            <Button type="submit" className="w-full gap-2 h-11 bg-gradient-to-r from-[#5B5FEF] to-[#7C3AED] hover:brightness-110 shadow-glow" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              {mode === "login" ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-sm text-[#8892B0] hover:text-[#5B5FEF] transition-colors"
            >
              {mode === "login" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
