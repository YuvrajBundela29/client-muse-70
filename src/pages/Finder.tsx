import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, MapPin, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppHeader } from "@/components/shared/AppHeader";
import { StepIndicator } from "@/components/shared/StepIndicator";
import { SearchStep, SearchParams } from "@/types/lead";
import { generateMockLeads } from "@/lib/mock-leads";
import { useLeadStore } from "@/lib/lead-store";
import { toast } from "sonner";

export default function Finder() {
  const navigate = useNavigate();
  const addLeads = useLeadStore((s) => s.addLeads);
  const [step, setStep] = useState<SearchStep>("idle");
  const [params, setParams] = useState<SearchParams>({
    industry: "",
    location: "",
    service: "",
  });

  const runSearch = useCallback(async () => {
    if (!params.industry || !params.location || !params.service) {
      toast.error("Please fill in all fields");
      return;
    }

    setStep("searching");
    await delay(1500);
    setStep("scraping");
    await delay(2000);
    setStep("analyzing");
    await delay(2000);

    const leads = generateMockLeads(params);
    addLeads(leads);

    setStep("complete");
    toast.success(`Found ${leads.length} leads!`);

    await delay(800);
    navigate("/dashboard");
  }, [params, addLeads, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="container flex items-center justify-center py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl"
        >
          <div className="mb-8 text-center">
            <h1 className="mb-1 text-2xl font-bold tracking-tight">Find Clients</h1>
            <p className="text-sm text-muted-foreground">
              Enter your niche, location, and service to discover leads.
            </p>
          </div>

          <div className="rounded-xl bg-card p-8 shadow-card">
            <div className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="industry" className="flex items-center gap-1.5 text-xs font-medium">
                  <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                  Industry / Niche
                </Label>
                <Input
                  id="industry"
                  placeholder="e.g. Gym, Restaurant, Dentist"
                  value={params.industry}
                  onChange={(e) => setParams((p) => ({ ...p, industry: e.target.value }))}
                  disabled={step !== "idle"}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="location" className="flex items-center gap-1.5 text-xs font-medium">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  Location
                </Label>
                <Input
                  id="location"
                  placeholder="e.g. Delhi, New York, London"
                  value={params.location}
                  onChange={(e) => setParams((p) => ({ ...p, location: e.target.value }))}
                  disabled={step !== "idle"}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="service" className="flex items-center gap-1.5 text-xs font-medium">
                  <Search className="h-3.5 w-3.5 text-muted-foreground" />
                  Service You Offer
                </Label>
                <Input
                  id="service"
                  placeholder="e.g. AI website + reels system"
                  value={params.service}
                  onChange={(e) => setParams((p) => ({ ...p, service: e.target.value }))}
                  disabled={step !== "idle"}
                />
              </div>

              {step !== "idle" && step !== "error" && (
                <div className="flex justify-center pt-2">
                  <StepIndicator currentStep={step} />
                </div>
              )}

              <Button
                className="w-full"
                size="lg"
                onClick={runSearch}
                disabled={step !== "idle"}
              >
                {step === "idle" ? (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Find Clients
                  </>
                ) : (
                  "Processing…"
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
