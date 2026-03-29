import { motion } from "framer-motion";
import { Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: ["10 searches/month", "20 pipeline clients", "3-stage pipeline", "Last 5 searches in history"],
    cta: "Current Plan",
    disabled: true,
  },
  {
    name: "Solo",
    price: "$19",
    period: "/month",
    features: ["100 searches/month", "Unlimited pipeline clients", "6-stage pipeline", "Unlimited history", "10 AI emails/month", "CSV export"],
    cta: "Upgrade to Solo",
    popular: false,
  },
  {
    name: "Pro",
    price: "$49",
    period: "/month",
    features: ["500 searches/month", "Everything in Solo", "Unlimited AI emails", "Analytics dashboard", "Follow-up reminders", "Saved search alerts"],
    cta: "Upgrade to Pro",
    popular: true,
  },
  {
    name: "Agency",
    price: "$99",
    period: "/month",
    features: ["Unlimited searches", "Everything in Pro", "5 team seats", "API access", "Custom filters", "Priority support"],
    cta: "Upgrade to Agency",
  },
];

export default function Upgrade() {
  const handleUpgrade = (planName: string) => {
    toast.info(`Stripe integration coming soon! Selected: ${planName}`);
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1200px] mx-auto space-y-8">
      <div className="text-center">
        <h1 className="page-title">Upgrade Your Plan</h1>
        <p className="text-muted-foreground mt-2 text-sm">Get more searches, AI emails, and pipeline power.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan, i) => (
          <motion.div key={plan.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            whileHover={{ y: -4, transition: { type: "spring", stiffness: 400, damping: 30 } }}>
            <div className={`glass-card rounded-2xl h-full flex flex-col relative ${plan.popular ? "border-primary/40 shadow-glow" : ""}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-primary to-glow-violet text-white text-[10px] font-medium rounded-full flex items-center gap-1">
                  <Zap className="h-3 w-3" /> Most Popular
                </div>
              )}
              <div className="p-6 pb-2">
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-bold font-mono">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>
              </div>
              <div className="p-6 pt-4 flex-1 flex flex-col">
                <ul className="space-y-2.5 flex-1 mb-4">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${plan.popular ? "bg-gradient-to-r from-primary to-glow-violet hover:brightness-110 shadow-glow" : "glass-input hover:border-primary/30"}`}
                  variant={plan.popular ? "default" : "outline"}
                  disabled={plan.disabled}
                  onClick={() => handleUpgrade(plan.name)}
                >
                  {plan.cta}
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
