import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Loader2, Sparkles, Settings, Users, Clock, Shield, Zap, Crown,
  Target, TrendingUp, Globe, MapPin, Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StepIndicator } from "@/components/shared/StepIndicator";
import { findLeads } from "@/lib/lead-api";
import { SearchStep } from "@/types/lead";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useSessionStore } from "@/lib/session-store";
import { useCredits } from "@/hooks/useCredits";
import { PaywallModal } from "@/components/results/PaywallModal";

const STATUS_MESSAGES = [
  "Analyzing your niche...",
  "Scanning 47,293 businesses...",
  "Cross-referencing 12,000 data points...",
  "Calculating fit scores...",
  "Ranking by conversion probability...",
];

const PRESETS = [
  { label: "🏋️ Gyms in NYC", i: "Gyms", l: "New York", s: "Website Design", color: "from-orange-500/20 to-red-500/20" },
  { label: "🍕 Restaurants in London", i: "Restaurants", l: "London", s: "Social Media Marketing", color: "from-green-500/20 to-emerald-500/20" },
  { label: "🏠 Realtors in Dubai", i: "Real Estate Agents", l: "Dubai", s: "SEO", color: "from-blue-500/20 to-cyan-500/20" },
  { label: "💇 Salons in LA", i: "Hair Salons", l: "Los Angeles", s: "Google Ads", color: "from-pink-500/20 to-purple-500/20" },
  { label: "🦷 Dentists in Mumbai", i: "Dentists", l: "Mumbai", s: "Website Design", color: "from-teal-500/20 to-cyan-500/20" },
  { label: "🚗 Car Dealers in Delhi", i: "Car Dealerships", l: "Delhi", s: "Google Ads", color: "from-amber-500/20 to-yellow-500/20" },
];

function LiveCounter() {
  const [count, setCount] = useState(47293);
  useEffect(() => {
    const interval = setInterval(() => setCount((c) => c + Math.floor(Math.random() * 3) + 1), 2000);
    return () => clearInterval(interval);
  }, []);
  return <span className="text-success font-mono font-bold">{count.toLocaleString()}</span>;
}

function LiveActivityDot() {
  return (
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
    </span>
  );
}

export default function SearchIntake() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { lastSearch, setLastSearch, specialization, addSearchHistory } = useSessionStore();
  const { canSearch, plan } = useSubscription();
  const [industry, setIndustry] = useState(searchParams.get("industry") || lastSearch?.industry || "");
  const [location, setLocation] = useState(searchParams.get("location") || lastSearch?.location || "");
  const [service, setService] = useState(searchParams.get("service") || lastSearch?.service || "");
  const [step, setStep] = useState<SearchStep>("idle");
  const [showPaywall, setShowPaywall] = useState(false);
  const [statusIdx, setStatusIdx] = useState(0);

  const isSearching = step !== "idle" && step !== "complete" && step !== "error";

  useEffect(() => {
    if (!isSearching) return;
    const interval = setInterval(() => setStatusIdx((i) => (i + 1) % STATUS_MESSAGES.length), 1500);
    return () => clearInterval(interval);
  }, [isSearching]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!industry.trim() || !location.trim() || !service.trim()) {
      toast.error("Please fill in all three fields");
      return;
    }
    if (!canSearch) { setShowPaywall(true); return; }
    setLastSearch({ industry, location, service });
    addSearchHistory({ industry, location, service });
    try {
      setStep("searching");
      const stepTimers = [
        setTimeout(() => setStep("scraping"), 3000),
        setTimeout(() => setStep("analyzing"), 7000),
      ];
      await findLeads({ industry, location, service });
      stepTimers.forEach(clearTimeout);
      setStep("complete");
      toast.success("Intelligence report ready!");
      setTimeout(() => navigate("/results"), 1200);
    } catch (err: any) {
      setStep("error");
      toast.error(err.message || "Something went wrong");
    }
  }

  function applyPreset(p: typeof PRESETS[0]) {
    setIndustry(p.i);
    setLocation(p.l);
    setService(p.s);
  }

  return (
    <>
      <div className="min-h-[calc(100vh-3rem)] p-4 lg:p-6">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <LiveActivityDot />
            <span className="text-[11px] text-muted-foreground font-mono">
              <LiveCounter /> businesses indexed
            </span>
          </div>
          <Link to="/settings" className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-primary transition-colors font-mono px-3 py-1.5 rounded-full border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">
            <Settings className="h-3 w-3" />
            {specialization || "Freelancer"}
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-[11px] text-primary font-medium">AI-Powered Client Discovery</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
              Find Your Perfect Clients
            </h1>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Tell us your niche and we'll find businesses that need your services — with verified contact details and AI insights.
            </p>
          </motion.div>

          {/* Search Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 lg:p-8 mb-6 max-w-2xl mx-auto"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    <Target className="h-3 w-3" /> Industry
                  </label>
                  <Input
                    placeholder='e.g. "Gyms"'
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    disabled={isSearching}
                    className="h-11 glass-input focus:border-primary/60 transition-all"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    <MapPin className="h-3 w-3" /> Location
                  </label>
                  <Input
                    placeholder='e.g. "New York"'
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    disabled={isSearching}
                    className="h-11 glass-input focus:border-primary/60 transition-all"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    <Briefcase className="h-3 w-3" /> Service
                  </label>
                  <Input
                    placeholder='e.g. "Web Design"'
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    disabled={isSearching}
                    className="h-11 glass-input focus:border-primary/60 transition-all"
                  />
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={isSearching}
                className="h-12 w-full gap-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-primary to-glow-violet hover:brightness-110 hover:scale-[1.005] active:scale-[0.995] transition-all duration-150 shadow-glow"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Scanning the web
                    <span className="animate-pulse">●●●</span>
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Find Clients Now
                  </>
                )}
              </Button>
            </form>

            {/* Competitor indicator */}
            <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-muted-foreground/70">
              <Users className="h-3 w-3" />
              <span>23 freelancers searched this niche today</span>
            </div>

            {/* Progress */}
            <AnimatePresence>
              {isSearching && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-5 overflow-hidden"
                >
                  <div className="h-1 rounded-full bg-[rgba(255,255,255,0.06)] mb-4 overflow-hidden">
                    <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-primary to-glow-cyan animate-shimmer" style={{ backgroundSize: "200% 100%" }} />
                  </div>
                  <div className="flex justify-center mb-3">
                    <StepIndicator currentStep={step} />
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={statusIdx}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="text-center text-xs text-muted-foreground font-mono"
                    >
                      {STATUS_MESSAGES[statusIdx]}
                    </motion.p>
                  </AnimatePresence>
                </motion.div>
              )}
              {step === "complete" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-5 rounded-xl border border-success/30 bg-success/10 p-3 text-center"
                >
                  <p className="font-semibold text-success text-sm">
                    ✓ Intelligence report ready! Redirecting...
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Quick Presets */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto"
          >
            <p className="text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Quick Start — Try a Preset
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  disabled={isSearching}
                  onClick={() => applyPreset(p)}
                  className={`rounded-xl border border-[rgba(255,255,255,0.06)] bg-gradient-to-br ${p.color} px-3 py-3 text-left transition-all duration-200 hover:border-primary/30 hover:scale-[1.02] disabled:opacity-50 group`}
                >
                  <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">{p.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{p.s}</p>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 grid grid-cols-3 gap-3 max-w-2xl mx-auto"
          >
            {[
              { icon: Globe, label: "5 Data Sources", sub: "Search engines & job boards" },
              { icon: TrendingUp, label: "AI Ranked", sub: "By conversion probability" },
              { icon: Zap, label: "Instant Results", sub: "Leads in under 2 minutes" },
            ].map((s) => (
              <div key={s.label} className="text-center p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)]">
                <s.icon className="h-4 w-4 text-primary mx-auto mb-1.5" />
                <p className="text-[11px] font-medium text-foreground">{s.label}</p>
                <p className="text-[9px] text-muted-foreground">{s.sub}</p>
              </div>
            ))}
          </motion.div>

          {/* Trust badges */}
          <div className="mt-6 flex items-center justify-center gap-4 text-[10px] text-muted-foreground/50">
            <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Bank-level encryption</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 99.9% uptime</span>
            <span className="flex items-center gap-1"><Users className="h-3 w-3" /> 2,400+ users</span>
          </div>
        </div>
      </div>

      <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} />
    </>
  );
}
