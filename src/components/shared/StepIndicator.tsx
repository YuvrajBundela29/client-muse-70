import { SearchStep } from "@/types/lead";
import { Check, Loader2 } from "lucide-react";

const steps: { key: SearchStep; label: string }[] = [
  { key: "searching", label: "Searching Maps" },
  { key: "scraping", label: "Scraping Websites" },
  { key: "analyzing", label: "AI Analyzing" },
  { key: "complete", label: "Complete" },
];

interface StepIndicatorProps {
  currentStep: SearchStep;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  if (currentStep === "idle") return null;

  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex items-center gap-2">
      {steps.map((step, i) => {
        const isDone = i < currentIndex || currentStep === "complete";
        const isActive = step.key === currentStep && currentStep !== "complete";

        return (
          <div key={step.key} className="flex items-center gap-2">
            {i > 0 && (
              <div
                className={`h-px w-6 transition-colors ${
                  isDone ? "bg-primary" : "bg-border"
                }`}
              />
            )}
            <div className="flex items-center gap-1.5">
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-full text-xs transition-colors ${
                  isDone
                    ? "bg-primary text-primary-foreground"
                    : isActive
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {isDone ? (
                  <Check className="h-3 w-3" />
                ) : isActive ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <span>{i + 1}</span>
                )}
              </div>
              <span
                className={`text-xs font-medium ${
                  isDone || isActive ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
