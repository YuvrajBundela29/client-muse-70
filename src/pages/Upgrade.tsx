import { motion } from "framer-motion";
import { Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Upgrade Your Plan</h1>
        <p className="text-muted-foreground mt-2">Get more searches, AI emails, and pipeline power.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan, i) => (
          <motion.div key={plan.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className={`relative h-full flex flex-col ${plan.popular ? "border-primary shadow-lg ring-2 ring-primary/20" : ""}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full flex items-center gap-1">
                  <Zap className="h-3 w-3" /> Most Popular
                </div>
              )}
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-2 flex-1 mb-4">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  disabled={plan.disabled}
                  onClick={() => handleUpgrade(plan.name)}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
