import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Gift, Copy, Users, TrendingUp, Award, CheckCircle2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Referral {
  id: string;
  referee_id: string;
  reward_credits: number;
  status: string;
  created_at: string;
}

const MILESTONES = [
  { count: 5, reward: "500 bonus credits", icon: "🎯" },
  { count: 10, reward: "Free Pro for 3 months", icon: "⭐" },
  { count: 25, reward: "Free Elite for 6 months", icon: "💎" },
  { count: 50, reward: "Lifetime Elite + 10% rev share", icon: "👑" },
];

export default function Referrals() {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState("");
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [totalCreditsEarned, setTotalCreditsEarned] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function load() {
      // Get referral code
      const { data: profile } = await supabase
        .from("profiles")
        .select("referral_code")
        .eq("id", user!.id)
        .single();
      
      if (profile?.referral_code) {
        setReferralCode(profile.referral_code);
      }

      // Get referrals
      const { data: refs } = await (supabase as any)
        .from("referrals")
        .select("*")
        .eq("referrer_id", user!.id)
        .order("created_at", { ascending: false });

      if (refs) {
        setReferrals(refs);
        setTotalCreditsEarned(refs.reduce((sum: number, r: Referral) => sum + r.reward_credits, 0));
      }
      setLoading(false);
    }
    load();
  }, [user]);

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode.toUpperCase());
    toast.success("Referral code copied!");
  };

  const shareWhatsApp = () => {
    const msg = encodeURIComponent(`I've been using AutoClient AI to find clients and it's amazing! Sign up and use my referral code: ${referralCode.toUpperCase()} to get 50 bonus credits!`);
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  const nextMilestone = MILESTONES.find(m => m.count > referrals.length);

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Gift className="h-5 w-5 text-primary" />
          Referral Program
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Invite friends, earn credits and unlock rewards
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 text-center">
          <Users className="h-5 w-5 text-primary mx-auto mb-1" />
          <p className="text-2xl font-bold font-mono text-foreground">{referrals.length}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Referrals</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card p-4 text-center">
          <TrendingUp className="h-5 w-5 text-success mx-auto mb-1" />
          <p className="text-2xl font-bold font-mono text-success">{totalCreditsEarned}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Credits Earned</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-4 text-center">
          <Award className="h-5 w-5 text-warning mx-auto mb-1" />
          <p className="text-2xl font-bold font-mono text-warning">{nextMilestone ? nextMilestone.count - referrals.length : 0}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Until Next Reward</p>
        </motion.div>
      </div>

      {/* Share Link */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-5 mb-6">
        <h3 className="text-sm font-semibold mb-3">Your Referral Code</h3>
        <div className="flex gap-2 mb-3 items-center">
          <div className="flex-1 h-12 glass-input rounded-lg flex items-center justify-center">
            <span className="text-2xl font-bold font-mono tracking-[0.3em] text-primary">{referralCode.toUpperCase()}</span>
          </div>
          <Button size="sm" onClick={copyCode} className="gap-1.5 bg-primary hover:bg-primary/90 shrink-0 h-12 px-5">
            <Copy className="h-3.5 w-3.5" /> Copy
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mb-3">Share this code with friends — they enter it during signup to get 50 bonus credits!</p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={shareWhatsApp} className="gap-1.5 glass-input text-xs flex-1">
            <Share2 className="h-3 w-3" /> Share on WhatsApp
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const msg = encodeURIComponent(`Check out AutoClient AI - an AI-powered client finder for freelancers. Use my referral code: ${referralCode.toUpperCase()} for 50 bonus credits!`);
              window.open(`https://twitter.com/intent/tweet?text=${msg}`, "_blank");
            }}
            className="gap-1.5 glass-input text-xs flex-1"
          >
            <Share2 className="h-3 w-3" /> Share on X
          </Button>
        </div>
      </motion.div>

      {/* How it works */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5 mb-6">
        <h3 className="text-sm font-semibold mb-3">How It Works</h3>
        <div className="space-y-3">
          {[
            { step: "1", title: "Share your link", desc: "Friend signs up → they get 50 bonus credits" },
            { step: "2", title: "Friend upgrades", desc: "Starter → 200 credits · Pro → 500 credits · Elite → ₹1,000 cash" },
            { step: "3", title: "Hit milestones", desc: "Unlock free plans and lifetime rewards" },
          ].map((s) => (
            <div key={s.step} className="flex gap-3 items-start">
              <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">{s.step}</div>
              <div>
                <p className="text-xs font-medium">{s.title}</p>
                <p className="text-[10px] text-muted-foreground">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Milestones */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card p-5 mb-6">
        <h3 className="text-sm font-semibold mb-3">Milestone Rewards</h3>
        <div className="space-y-2">
          {MILESTONES.map((m) => {
            const achieved = referrals.length >= m.count;
            return (
              <div key={m.count} className={`flex items-center gap-3 p-2.5 rounded-lg ${achieved ? "bg-success/10 border border-success/20" : "bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)]"}`}>
                <span className="text-lg">{m.icon}</span>
                <div className="flex-1">
                  <p className="text-xs font-medium">{m.count} referrals</p>
                  <p className="text-[10px] text-muted-foreground">{m.reward}</p>
                </div>
                {achieved && <CheckCircle2 className="h-4 w-4 text-success" />}
                {!achieved && (
                  <Badge variant="outline" className="text-[9px] border-[rgba(255,255,255,0.08)]">
                    {m.count - referrals.length} to go
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Referral History */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5">
        <h3 className="text-sm font-semibold mb-3">Referral History</h3>
        {referrals.length === 0 ? (
          <div className="text-center py-6">
            <Gift className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">No referrals yet. Share your link to start earning!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {referrals.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-2.5 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)]">
                <div>
                  <p className="text-xs font-medium">Referral #{r.id.slice(0, 8)}</p>
                  <p className="text-[10px] text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</p>
                </div>
                <Badge className={r.status === "completed" ? "bg-success/15 text-success border-success/20" : "bg-warning/15 text-warning border-warning/20"}>
                  +{r.reward_credits} credits
                </Badge>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
