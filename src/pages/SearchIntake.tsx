import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowRight, Loader2, Sparkles, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StepIndicator } from "@/components/shared/StepIndicator";
import { findLeads } from "@/lib/lead-api";
import { SearchStep } from "@/types/lead";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useSessionStore } from "@/lib/session-store";
import { PaywallModal } from "@/components/results/PaywallModal";

const STATUS_MESSAGES = [
  "Analyzing your niche...",
  "Scanning business directories...",
  "Calculating fit scores...",
  "Ranking by relevance...",
];

export default function SearchIntake() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { lastSearch, setLastSearch, incrementSearch, specialization, setSpecialization, addSearchHistory } = useSessionStore();
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
    if (!incrementSearch()) { setShowPaywall(true); return; }
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

  return (
    <>
      <div className="flex min-h-[calc(100vh-3rem)] p-6 lg:p-8 gap-6 relative">
        {/* Left panel — Search form */}
        <div className="w-full lg:w-[45%] flex items-start justify-center lg:pt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            <div className="glass-card p-7">
              {/* Searching as chip */}
              <div className="mb-5 flex items-center justify-between">
                <p className="section-label">Discover Your Ideal Clients</p>
                <Link to="/settings" className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors font-mono">
                  <Settings className="h-3 w-3" />
                  Searching as: {specialization || "Freelancer"}
                </Link>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="section-label mb-1.5 block">Industry / Niche</label>
                  <Input
                    placeholder='e.g. "Gyms", "Restaurants", "Real Estate Agents"'
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    disabled={isSearching}
                    className="h-12 glass-input focus:border-primary/60 focus:shadow-[0_0_0_3px_hsl(238_75%_64%/0.1)] transition-all"
                  />
                </div>
                <div>
                  <label className="section-label mb-1.5 block">Target Country / City</label>
                  <Input
                    placeholder='e.g. "New York", "London", "Delhi"'
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    disabled={isSearching}
                    className="h-12 glass-input focus:border-primary/60 focus:shadow-[0_0_0_3px_hsl(238_75%_64%/0.1)] transition-all"
                  />
                </div>
                <div>
                  <label className="section-label mb-1.5 block">Service You Provide</label>
                  <Input
                    placeholder='e.g. "Web Design", "SEO", "Social Media Marketing"'
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    disabled={isSearching}
                    className="h-12 glass-input focus:border-primary/60 focus:shadow-[0_0_0_3px_hsl(238_75%_64%/0.1)] transition-all"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isSearching}
                  className="h-[52px] w-full gap-2 text-base rounded-[14px] bg-gradient-to-r from-primary to-glow-violet hover:brightness-110 hover:scale-[1.01] active:scale-[0.98] transition-all duration-150 shadow-glow"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Scanning the web
                      <span className="animate-pulse">●●●</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Find My Clients
                    </>
                  )}
                </Button>
              </form>

              {/* Progress */}
              <AnimatePresence>
                {isSearching && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-6"
                  >
                    {/* Shimmer progress bar */}
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
                    className="mt-6 rounded-xl border border-success/30 bg-success/10 p-4 text-center shadow-glow-cyan"
                  >
                    <p className="font-semibold text-success">
                      ✓ Intelligence report ready! Redirecting...
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Quick presets */}
              <div className="mt-8 text-center">
                <p className="mb-3 section-label">Quick start — try a preset</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {[
                    { label: "🏋️ Gyms in NYC", i: "Gyms", l: "New York", s: "Website Design" },
                    { label: "🍕 Restaurants in London", i: "Restaurants", l: "London", s: "Social Media Marketing" },
                    { label: "🏠 Realtors in Dubai", i: "Real Estate Agents", l: "Dubai", s: "SEO" },
                    { label: "💇 Salons in LA", i: "Hair Salons", l: "Los Angeles", s: "Google Ads" },
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      disabled={isSearching}
                      onClick={() => { setIndustry(p.i); setLocation(p.l); setService(p.s); }}
                      className="rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all duration-200 hover:border-primary/40 hover:text-foreground disabled:opacity-50"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right panel — Preview area */}
        <div className="hidden lg:flex w-[55%] items-center justify-center">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center"
          >
            {/* Network graph illustration */}
            <svg className="w-64 h-64 mx-auto mb-6 text-primary/20" viewBox="0 0 200 200">
              {/* Nodes */}
              {[
                { cx: 100, cy: 60, r: 6 }, { cx: 50, cy: 100, r: 5 }, { cx: 150, cy: 100, r: 5 },
                { cx: 70, cy: 150, r: 4 }, { cx: 130, cy: 150, r: 4 }, { cx: 100, cy: 120, r: 7 },
              ].map((n, i) => (
                <g key={i}>
                  <circle cx={n.cx} cy={n.cy} r={n.r} fill="currentColor" opacity={0.4}>
                    <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2s" begin={`${i * 0.3}s`} repeatCount="indefinite" />
                  </circle>
                </g>
              ))}
              {/* Lines */}
              {[
                [100, 60, 100, 120], [50, 100, 100, 120], [150, 100, 100, 120],
                [70, 150, 100, 120], [130, 150, 100, 120], [50, 100, 70, 150],
                [150, 100, 130, 150], [100, 60, 50, 100], [100, 60, 150, 100],
              ].map((l, i) => (
                <line key={i} x1={l[0]} y1={l[1]} x2={l[2]} y2={l[3]} stroke="currentColor" strokeWidth="0.5" opacity="0.3">
                  <animate attributeName="opacity" values="0.3;0.6;0.3" dur="3s" begin={`${i * 0.2}s`} repeatCount="indefinite" />
                </line>
              ))}
            </svg>
            <p className="text-muted-foreground text-sm mb-6">Enter your niche to discover qualified leads</p>

            {/* Phantom cards */}
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card p-4 opacity-30 max-w-sm mx-auto">
                  <div className="flex justify-between items-center mb-2">
                    <div className="h-3 w-32 rounded bg-[rgba(255,255,255,0.1)]" />
                    <div className="h-8 w-8 rounded-full bg-[rgba(255,255,255,0.06)]" />
                  </div>
                  <div className="h-2 w-48 rounded bg-[rgba(255,255,255,0.06)] mb-1.5" />
                  <div className="h-2 w-36 rounded bg-[rgba(255,255,255,0.04)]" />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} />
    </>
  );
}
