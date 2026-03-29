import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Zap, Crown, Shield, TrendingUp, Clock, Users, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const TESTIMONIALS = [
  { name: "John S.", role: "Web Designer", text: "Closed an $8K deal from a lead I found in my first week.", revenue: "$8,000" },
  { name: "Sarah M.", role: "SEO Consultant", text: "Pro pays for itself 10x over. I found 47 clients in a month.", revenue: "$15,200" },
  { name: "Mike R.", role: "Social Media Agency", text: "Upgraded to Agency — our team books 12 calls/week now.", revenue: "$32,000" },
];

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: ["10 searches/month", "20 pipeline clients", "3-stage pipeline", "Last 5 searches in history"],
    cta: "Current Plan",
    disabled: true,
    roi: null,
  },
  {
    name: "Solo",
    price: "$19",
    period: "/month",
    features: ["100 searches/month", "Unlimited pipeline clients", "6-stage pipeline", "Unlimited history", "10 AI emails/month", "CSV export"],
    cta: "Upgrade to Solo",
    popular: false,
    roi: "Average user earns $1,200 extra/month = 63× ROI",
  },
  {
    name: "Pro",
    price: "$49",
    period: "/month",
    features: ["500 searches/month", "Everything in Solo", "Unlimited AI emails", "Analytics dashboard", "Follow-up reminders", "Saved search alerts", "Automated follow-ups"],
    cta: "Upgrade to Pro",
    popular: true,
    roi: "Average user earns $3,200 extra/month = 65× ROI",
  },
  {
    name: "Agency",
    price: "$99",
    period: "/month",
    features: ["Unlimited searches", "Everything in Pro", "5 team seats", "API access", "Custom filters", "Priority support", "White-label reports"],
    cta: "Upgrade to Agency",
    roi: "Teams average $12,000/month in new revenue",
  },
];

function CountdownTimer() {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    // Countdown to midnight
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    setSecs(Math.floor((midnight.getTime() - now.getTime()) / 1000));
    const interval = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(interval);
  }, []);
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return (
    <span className="font-mono font-bold text-warning">
      {String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
    </span>
  );
}

function TestimonialCarousel() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setIdx((i) => (i + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(interval);
  }, []);
  const t = TESTIMONIALS[idx];
  return (
    <div className="glass-card p-4 mb-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="flex items-center gap-4"
        >
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map((s) => (
              <Star key={s} className="h-3 w-3 fill-warning text-warning" />
            ))}
          </div>
          <div className="flex-1">
            <p className="text-sm text-foreground">"{t.text}"</p>
            <p className="text-[11px] text-muted-foreground mt-1">{t.name} · {t.role} · <span className="text-success font-mono font-medium">+{t.revenue}/mo</span></p>
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="flex justify-center gap-1 mt-3">
        {TESTIMONIALS.map((_, i) => (
          <div key={i} className={`h-1 rounded-full transition-all ${i === idx ? "w-6 bg-primary" : "w-1.5 bg-[rgba(255,255,255,0.1)]"}`} />
        ))}
      </div>
    </div>
  );
}

export default function Upgrade() {
  const handleUpgrade = (planName: string) => {
    toast.info(`Stripe integration coming soon! Selected: ${planName}`);
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1200px] mx-auto space-y-6">
      {/* Scarcity banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-warning/5 border border-warning/20"
      >
        <Clock className="h-4 w-4 text-warning shrink-0" />
        <span className="text-xs text-muted-foreground">
          Pro slots filling up: <span className="font-bold text-warning">7/50 left this month</span> • Offer ends in <CountdownTimer />
        </span>
      </motion.div>

      <div className="text-center">
        <h1 className="page-title">Investment Calculator</h1>
        <p className="text-muted-foreground mt-2 text-sm max-w-lg mx-auto">
          Spend <span className="text-primary font-bold">$49/month</span> → Average user earns <span className="text-success font-bold">$3,200 extra/month</span> = <span className="text-warning font-bold">65× ROI</span>
        </p>
      </div>

      {/* Social proof bar */}
      <div className="flex items-center justify-center gap-6 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1"><Users className="h-3 w-3" /> 2,400+ active users</span>
        <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3 text-success" /> Most upgrade within 3 days</span>
        <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> 10× ROI guarantee</span>
      </div>

      {/* Testimonial Carousel */}
      <TestimonialCarousel />

      {/* Competitor pressure */}
      <div className="text-center">
        <p className="text-[11px] text-muted-foreground">
          ⚠️ Your competitors are using Pro — <span className="text-warning font-medium">don't fall behind</span>
        </p>
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
                {plan.roi && (
                  <p className="text-[10px] text-success mt-1 font-medium">{plan.roi}</p>
                )}
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
                  className={`w-full ${plan.popular ? "bg-gradient-to-r from-primary to-glow-violet hover:brightness-110 shadow-glow animate-glow-pulse" : "glass-input hover:border-primary/30"}`}
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

      {/* Guarantee */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center pt-4"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-success/20 bg-success/5 px-4 py-2">
          <Shield className="h-4 w-4 text-success" />
          <span className="text-xs text-success font-medium">10× your investment or money back — guaranteed</span>
        </div>
        <p className="text-[11px] text-muted-foreground/60 mt-3 flex items-center justify-center gap-2">
          <Shield className="h-3 w-3" /> Bank-level encryption • Cancel anytime • No hidden fees
        </p>
      </motion.div>
    </div>
  );
}
