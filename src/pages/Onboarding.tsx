import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Loader2, Check } from "lucide-react";
import logoWhite from "@/assets/logo-white.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const INDUSTRIES = [
  "Technology", "Design", "Marketing", "Writing", "Video",
  "Development", "Consulting", "Photography", "3D Animation", "Other",
];

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Germany", "France",
  "Australia", "Netherlands", "Sweden", "India", "Brazil",
  "Japan", "South Korea", "Singapore", "UAE", "South Africa",
  "Mexico", "Spain", "Italy", "Nigeria", "Other",
];

const SERVICE_SUGGESTIONS = [
  "Web design", "SEO", "Video editing", "Copywriting", "Logo design",
  "3D animation", "Social media management", "App development",
  "Brand strategy", "UI/UX design",
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [industry, setIndustry] = useState("");
  const [country, setCountry] = useState("");
  const [service, setService] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const steps = [
    { title: "What do you do?", subtitle: "Select your industry" },
    { title: "Where are your clients?", subtitle: "Choose your target country or region" },
    { title: "What service do you offer?", subtitle: "Describe your main offering" },
    { title: "What's your name?", subtitle: "How should we address you?" },
  ];

  const canAdvance = [
    !!industry,
    !!country,
    !!service,
    !!displayName,
  ][step];

  const handleFinish = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        industry,
        country,
        service,
        full_name: displayName,
        onboarding_complete: true,
      } as Record<string, unknown>)
      .eq("id", user.id);

    if (error) {
      toast.error("Failed to save profile");
      setSaving(false);
      return;
    }
    toast.success("Welcome to AutoClient AI!");
    navigate("/dashboard");
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else handleFinish();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <img src={logoWhite} alt="AutoClient AI" className="h-8 w-8" />
            <span className="text-2xl font-bold">AutoClient AI</span>
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex gap-2 justify-center mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i <= step ? "w-8 bg-primary" : "w-2 bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Card */}
        <motion.div
          className="rounded-xl border bg-card p-8 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-xl font-semibold mb-1">{steps[step].title}</h2>
              <p className="text-muted-foreground text-sm mb-6">{steps[step].subtitle}</p>

              {step === 0 && (
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry..." />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((ind) => (
                      <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {step === 1 && (
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country..." />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {step === 2 && (
                <div className="space-y-3">
                  <Input
                    placeholder="e.g. Web design, Video editing..."
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                  />
                  <div className="flex flex-wrap gap-2">
                    {SERVICE_SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setService(s)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                          service === s
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted/50 text-muted-foreground hover:bg-muted border-transparent"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 3 && (
                <Input
                  placeholder="Your display name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              variant="ghost"
              onClick={() => setStep(step - 1)}
              disabled={step === 0}
              className="gap-1"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button onClick={handleNext} disabled={!canAdvance || saving} className="gap-1">
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : step === 3 ? (
                <Check className="h-4 w-4" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
              {step === 3 ? "Finish" : "Next"}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
