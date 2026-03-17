import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Crosshair, Search, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StepIndicator } from "@/components/shared/StepIndicator";
import { findLeads } from "@/lib/lead-api";
import { SearchStep } from "@/types/lead";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export default function SearchIntake() {
  const navigate = useNavigate();
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [service, setService] = useState("");
  const [step, setStep] = useState<SearchStep>("idle");

  const isSearching = step !== "idle" && step !== "complete" && step !== "error";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!industry.trim() || !location.trim() || !service.trim()) {
      toast.error("Please fill in all three fields");
      return;
    }

    try {
      setStep("searching");
      const stepTimers = [
        setTimeout(() => setStep("scraping"), 3000),
        setTimeout(() => setStep("analyzing"), 7000),
      ];

      await findLeads({ industry, location, service });

      stepTimers.forEach(clearTimeout);
      setStep("complete");
      toast.success("Leads found! Redirecting to results...");
      setTimeout(() => navigate("/results"), 1200);
    } catch (err: any) {
      setStep("error");
      toast.error(err.message || "Something went wrong");
    }
  }

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold tracking-tight">
            <Crosshair className="h-5 w-5 text-primary" />
            <span>Client Muse</span>
          </Link>
        </div>
      </header>

      <div className="container flex min-h-[calc(100vh-3.5rem)] items-center justify-center py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg"
        >
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 inline-flex rounded-full bg-primary/10 p-3">
              <Search className="h-6 w-6 text-primary" />
            </div>
            <h1 className="mb-2 text-3xl font-bold tracking-tight">
              Find your ideal clients
            </h1>
            <p className="text-muted-foreground">
              Tell us about your niche and we'll find businesses with real problems you can solve.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Industry / Niche</label>
              <Input
                placeholder='e.g. "Gyms", "Restaurants", "Real Estate Agents"'
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                disabled={isSearching}
                className="h-12 bg-card border-border"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Target Country / City</label>
              <Input
                placeholder='e.g. "New York", "London", "Delhi"'
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={isSearching}
                className="h-12 bg-card border-border"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Service You Provide</label>
              <Input
                placeholder='e.g. "Web Design", "SEO", "Social Media Marketing"'
                value={service}
                onChange={(e) => setService(e.target.value)}
                disabled={isSearching}
                className="h-12 bg-card border-border"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isSearching}
              className="h-14 w-full gap-2 text-base shadow-lg shadow-primary/25"
            >
              {isSearching ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  AI is researching...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Find My Clients
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          {/* Progress indicator */}
          <AnimatePresence>
            {isSearching && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-8 flex justify-center"
              >
                <StepIndicator currentStep={step} />
              </motion.div>
            )}
            {step === "complete" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-8 rounded-xl border border-[hsl(var(--success))]/30 bg-[hsl(var(--success))]/10 p-4 text-center"
              >
                <p className="font-semibold text-[hsl(var(--success))]">
                  ✓ Leads found! Redirecting...
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick presets */}
          <div className="mt-10 text-center">
            <p className="mb-3 text-xs text-muted-foreground">Quick start — try a preset:</p>
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
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground disabled:opacity-50"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
