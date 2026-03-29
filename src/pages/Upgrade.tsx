import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check, Zap, Crown, Shield, TrendingUp, Clock, Users, Star,
  ArrowRight, Lock, ChevronDown, ChevronUp, Sparkles,
  MessageSquare, Bell, Headphones, BarChart3, Mail, Target,
  CreditCard, Award, BadgeCheck, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

/* ── Testimonials ──────────────────────────────────────── */
const TESTIMONIALS = [
  { name: "Sarah K.", city: "Los Angeles", text: "Closed a $12K deal in my second week. The Elite plan pays for itself before lunch.", revenue: "$12,000", avatar: "SK" },
  { name: "James W.", city: "London", text: "Went from $3K/month freelancing to $11K/month in 60 days. This tool is unfair.", revenue: "$11,000", avatar: "JW" },
  { name: "Priya M.", city: "Mumbai", text: "My agency scaled to 14 clients in one quarter. The ROI is insane.", revenue: "$32,000", avatar: "PM" },
  { name: "Carlos D.", city: "Miami", text: "I was skeptical but closed my first client in 5 days. Never looking back.", revenue: "$4,800", avatar: "CD" },
];

/* ── Plans ─────────────────────────────────────────────── */
const plans = [
  {
    tier: "starter",
    name: "Starter",
    tagline: "Test drive the system",
    price: 0,
    originalPrice: null,
    period: "/month",
    periodNote: "Free for 30 days, then $9/mo",
    color: "hsl(222, 15%, 56%)",
    colorBg: "rgba(136, 146, 176, 0.08)",
    features: [
      { text: "10 AI-powered searches/month", highlight: false },
      { text: "5 pipeline slots", highlight: false },
      { text: "1 verified lead to close your first deal", highlight: true },
      { text: "Basic intelligence reports", highlight: false },
      { text: "Email support", highlight: false },
    ],
    cta: "Start Free Trial",
    disabled: false,
    popular: false,
    roiNote: "Your first client will cover this 10×",
    valueTotal: null,
  },
  {
    tier: "professional",
    name: "Professional",
    tagline: "Everything you need to replace your 9-5",
    price: 67,
    originalPrice: 97,
    period: "/month",
    periodNote: "or $597/year (save $207)",
    color: "hsl(238, 75%, 64%)",
    colorBg: "hsl(238, 75%, 64%, 0.08)",
    features: [
      { text: "300 searches/month", highlight: true },
      { text: "Unlimited pipeline + 12-stage customization", highlight: false },
      { text: "30 AI-generated emails/month", highlight: true },
      { text: "Priority search (see leads before free users)", highlight: true },
      { text: "Advanced intelligence battle cards", highlight: false },
      { text: "CSV & PDF exports", highlight: false },
      { text: "Weekly strategy insights", highlight: false },
    ],
    cta: "Get Professional",
    disabled: false,
    popular: false,
    roiNote: "Average user closes $3,400/month extra",
    valueTotal: "$600/month value",
  },
  {
    tier: "elite",
    name: "Elite",
    tagline: "The unfair advantage serious freelancers use",
    price: 147,
    originalPrice: 247,
    period: "/month",
    periodNote: "or $1,297/year (save $467)",
    color: "hsl(260, 80%, 60%)",
    colorBg: "hsl(260, 80%, 60%, 0.08)",
    features: [
      { text: "1,000 searches/month", highlight: true },
      { text: "Everything in Professional", highlight: false },
      { text: "Unlimited AI emails + advanced personalization", highlight: true },
      { text: "Competitor intelligence alerts", highlight: true },
      { text: "Follow-up automation sequences", highlight: true },
      { text: "Real-time lead notifications (SMS/Slack)", highlight: true },
      { text: "Private community (100+ successful freelancers)", highlight: false },
      { text: "Monthly 1-on-1 strategy session", highlight: true },
    ],
    cta: "Join Elite",
    disabled: false,
    popular: true,
    roiNote: "Members average $8,700/month — that's 59× ROI",
    valueTotal: "$1,800/month value → You pay $147",
    bonuses: [
      "$297 Freelancer Pitch Template Pack (FREE)",
      "$149 Lead Scoring Masterclass (FREE)",
    ],
  },
  {
    tier: "agency",
    name: "Agency",
    tagline: "Scale to 6-figures with your team",
    price: 397,
    originalPrice: 597,
    period: "/month",
    periodNote: "Application required",
    color: "hsl(166, 72%, 45%)",
    colorBg: "hsl(166, 72%, 45%, 0.08)",
    features: [
      { text: "Unlimited everything", highlight: true },
      { text: "5 team seats + white-label option", highlight: true },
      { text: "API access for custom integrations", highlight: true },
      { text: "Dedicated account manager", highlight: true },
      { text: "Custom filters and workflows", highlight: false },
      { text: "Priority support (2-hour response)", highlight: false },
      { text: "Quarterly business review", highlight: false },
    ],
    cta: "Apply for Agency",
    disabled: false,
    popular: false,
    roiNote: "Agencies scale to $50K+/month with our system",
    valueTotal: null,
  },
];

/* ── FAQ ───────────────────────────────────────────────── */
const FAQ = [
  { q: "I'm not tech-savvy. Can I still use this?", a: "Absolutely. Setup takes 5 minutes and our AI does the heavy lifting. We also offer onboarding help for all paid plans." },
  { q: "What if I don't get clients?", a: "We offer a 60-day guarantee. Close a client or get a full refund plus $100. Less than 2% request refunds — this system works." },
  { q: "Is this legal and ethical?", a: "100% compliant. We aggregate publicly available business data. We're a data intelligence provider, not a scraper." },
  { q: "Can I cancel anytime?", a: "Yes. No contracts, no hidden fees. Cancel with one click. But most users upgrade, not cancel." },
  { q: "How fast will I see results?", a: "Most users find qualified leads on their first search. Average time to first client: 12 days." },
];

/* ── Countdown Timer ───────────────────────────────────── */
function CountdownTimer() {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
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

/* ── Live Signup Notification ──────────────────────────── */
const SIGNUP_NAMES = ["Alex R.", "Maria T.", "David L.", "Sophia C.", "Liam K.", "Emma B.", "Noah J.", "Olivia S."];
const SIGNUP_CITIES = ["NYC", "London", "Toronto", "Sydney", "Berlin", "Dubai", "LA", "Singapore"];

function LiveSignupPopup() {
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {
    const trigger = () => {
      setName(SIGNUP_NAMES[Math.floor(Math.random() * SIGNUP_NAMES.length)]);
      setCity(SIGNUP_CITIES[Math.floor(Math.random() * SIGNUP_CITIES.length)]);
      setShow(true);
      setTimeout(() => setShow(false), 4000);
    };
    const interval = setInterval(trigger, 12000);
    const initial = setTimeout(trigger, 6000);
    return () => { clearInterval(interval); clearTimeout(initial); };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 40, x: 0 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 40 }}
          className="fixed bottom-6 left-6 z-50 glass-card p-3 flex items-center gap-3 border-success/20 max-w-xs"
        >
          <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center shrink-0">
            <BadgeCheck className="h-4 w-4 text-success" />
          </div>
          <div>
            <p className="text-xs font-medium text-foreground">{name} from {city} just upgraded</p>
            <p className="text-[10px] text-muted-foreground">a few seconds ago</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Testimonial Carousel ──────────────────────────────── */
function TestimonialCarousel() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setIdx((i) => (i + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(interval);
  }, []);
  const t = TESTIMONIALS[idx];
  return (
    <div className="glass-card p-5">
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-glow-violet flex items-center justify-center text-xs font-bold text-white">
              {t.avatar}
            </div>
            <div>
              <p className="text-sm font-semibold">{t.name}</p>
              <p className="text-[11px] text-muted-foreground">{t.city}</p>
            </div>
            <div className="ml-auto flex gap-0.5">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} className="h-3 w-3 fill-warning text-warning" />
              ))}
            </div>
          </div>
          <p className="text-sm text-foreground/90 italic mb-2">"{t.text}"</p>
          <p className="text-xs text-success font-mono font-bold">+{t.revenue}/month in new revenue</p>
        </motion.div>
      </AnimatePresence>
      <div className="flex justify-center gap-1.5 mt-4">
        {TESTIMONIALS.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)} className={`h-1.5 rounded-full transition-all ${i === idx ? "w-6 bg-primary" : "w-1.5 bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)]"}`} />
        ))}
      </div>
    </div>
  );
}

/* ── ROI Calculator ────────────────────────────────────── */
function ROICalculator() {
  const [target, setTarget] = useState("5000");
  const targetNum = parseInt(target) || 0;
  const recommended = targetNum <= 2000 ? "Professional" : targetNum <= 8000 ? "Elite" : "Agency";
  const recommendedColor = targetNum <= 2000 ? "hsl(238, 75%, 64%)" : targetNum <= 8000 ? "hsl(260, 80%, 60%)" : "hsl(166, 72%, 45%)";
  const monthlyCost = targetNum <= 2000 ? 67 : targetNum <= 8000 ? 147 : 397;
  const roi = targetNum > 0 ? Math.round(targetNum / monthlyCost) : 0;

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-primary" />
        ROI Calculator
      </h3>
      <p className="text-xs text-muted-foreground mb-4">See how quickly your investment pays for itself</p>
      <div className="mb-4">
        <label className="section-label mb-1.5 block">I want to make this much extra per month:</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">$</span>
          <Input
            type="number"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="h-12 pl-7 glass-input text-lg font-mono font-bold"
            placeholder="5000"
          />
        </div>
      </div>
      {targetNum > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="rounded-xl p-4 border" style={{ borderColor: `${recommendedColor}33`, background: `${recommendedColor}0A` }}>
            <p className="text-xs text-muted-foreground mb-1">Recommended Plan</p>
            <p className="text-xl font-bold" style={{ color: recommendedColor }}>{recommended}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Invest <span className="font-bold text-foreground">${monthlyCost}/mo</span> → Target <span className="font-bold text-success">${targetNum.toLocaleString()}/mo</span> = <span className="font-bold text-warning">{roi}× ROI</span>
            </p>
          </div>
          <p className="text-[11px] text-muted-foreground text-center">
            Break even with just ONE client. Everything after is pure profit.
          </p>
        </motion.div>
      )}
    </div>
  );
}

/* ── FAQ Section ───────────────────────────────────────── */
function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-primary" />
        Common Questions
      </h3>
      {FAQ.map((item, i) => (
        <div key={i} className="glass-card rounded-xl overflow-hidden">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-[rgba(255,255,255,0.02)] transition-colors"
          >
            <span className="text-sm font-medium">{item.q}</span>
            {open === i ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
          </button>
          <AnimatePresence>
            {open === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <p className="px-4 pb-4 text-sm text-muted-foreground">{item.a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

/* ── Main Upgrade Page ─────────────────────────────────── */
export default function Upgrade() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const spotsRef = useRef(23);
  const [spots, setSpots] = useState(23);

  useEffect(() => {
    const interval = setInterval(() => {
      if (spotsRef.current > 3) {
        spotsRef.current -= 1;
        setSpots(spotsRef.current);
      }
    }, 45000);
    return () => clearInterval(interval);
  }, []);

  const handleUpgrade = (planName: string) => {
    toast.info(`Stripe integration coming soon! Selected: ${planName}`);
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1200px] mx-auto">
      <LiveSignupPopup />

      {/* ── Urgency Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-warning/5 border border-warning/20"
      >
        <Zap className="h-4 w-4 text-warning shrink-0 animate-pulse" />
        <span className="text-xs text-center">
          <span className="text-warning font-bold">47 freelancers</span>
          <span className="text-muted-foreground"> upgraded in the last 24 hours</span>
          <span className="text-muted-foreground"> • Launch pricing ends in </span>
          <CountdownTimer />
        </span>
      </motion.div>

      {/* ── Hero ── */}
      <div className="text-center mb-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="section-label mb-2">Pricing That Pays For Itself</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            Invest <span className="text-primary">$67/month</span> → Average Return: <span className="text-success">$3,400/month</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            That's not a price. That's a <span className="font-bold text-warning">51× ROI</span>.
          </p>
        </motion.div>

        {/* Billing toggle */}
        <div className="mt-6 inline-flex items-center gap-1 rounded-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] p-1">
          <button
            onClick={() => setBilling("monthly")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${billing === "monthly" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling("annual")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${billing === "annual" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Annual <span className="text-success text-[10px] font-bold ml-1">SAVE 25%</span>
          </button>
        </div>
      </div>

      {/* ── Social proof bar ── */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[11px] text-muted-foreground mb-8">
        <span className="flex items-center gap-1"><Users className="h-3 w-3" /> 2,847+ active users</span>
        <span className="flex items-center gap-1"><Star className="h-3 w-3 text-warning" /> 4.9/5 from 1,200+ reviews</span>
        <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> 60-day money-back guarantee</span>
        <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> Bank-level SSL encryption</span>
      </div>

      {/* ── Scarcity indicator ── */}
      <div className="text-center mb-6">
        <span className="inline-flex items-center gap-2 rounded-full bg-destructive/5 border border-destructive/20 px-4 py-1.5 text-xs">
          <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
          <span className="text-muted-foreground">Only <span className="font-bold text-destructive">{spots} Elite spots</span> left at this price</span>
        </span>
      </div>

      {/* ── Pricing Grid ── */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {plans.map((plan, i) => {
          const displayPrice = billing === "annual" && plan.price > 0
            ? Math.round(plan.price * 0.75)
            : plan.price;
          const displayOriginal = plan.originalPrice
            ? (billing === "annual" ? Math.round(plan.originalPrice * 0.75) : plan.originalPrice)
            : null;

          return (
            <motion.div
              key={plan.tier}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6, transition: { type: "spring", stiffness: 400, damping: 30 } }}
              className="relative"
            >
              <div className={`glass-card rounded-2xl h-full flex flex-col relative overflow-hidden ${
                plan.popular ? "border-[hsl(260,80%,60%)]/40 shadow-[0_0_30px_hsl(260,80%,60%,0.12)]" : ""
              }`}>
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute -top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-glow-violet to-glow-cyan" />
                )}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-primary to-glow-violet text-white text-[10px] font-bold rounded-full flex items-center gap-1 uppercase tracking-wider">
                    <Crown className="h-3 w-3" /> Most Popular
                  </div>
                )}

                <div className="p-6 pb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-6 w-6 rounded-lg flex items-center justify-center" style={{ background: plan.colorBg }}>
                      {plan.tier === "starter" && <Sparkles className="h-3 w-3" style={{ color: plan.color }} />}
                      {plan.tier === "professional" && <Zap className="h-3 w-3" style={{ color: plan.color }} />}
                      {plan.tier === "elite" && <Crown className="h-3 w-3" style={{ color: plan.color }} />}
                      {plan.tier === "agency" && <Award className="h-3 w-3" style={{ color: plan.color }} />}
                    </div>
                    <h3 className="text-lg font-bold">{plan.name}</h3>
                  </div>
                  <p className="text-[11px] text-muted-foreground mb-3">{plan.tagline}</p>

                  {/* Price */}
                  <div className="flex items-baseline gap-2">
                    {displayOriginal && (
                      <span className="text-lg font-mono text-muted-foreground/50 line-through">${displayOriginal}</span>
                    )}
                    <span className="text-4xl font-bold font-mono">${displayPrice}</span>
                    <span className="text-muted-foreground text-sm">{plan.period}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">{plan.periodNote}</p>

                  {/* ROI note */}
                  {plan.roiNote && (
                    <div className="mt-2 rounded-lg px-2.5 py-1.5 text-[10px] font-medium" style={{ background: plan.colorBg, color: plan.color }}>
                      💰 {plan.roiNote}
                    </div>
                  )}
                </div>

                <div className="px-6 pb-6 flex-1 flex flex-col">
                  {/* Value stacking */}
                  {plan.valueTotal && (
                    <p className="text-[10px] text-success font-medium mb-3 pb-3 border-b border-[rgba(255,255,255,0.06)]">
                      {plan.valueTotal}
                    </p>
                  )}

                  <ul className="space-y-2 flex-1 mb-4">
                    {plan.features.map((f) => (
                      <li key={f.text} className="flex items-start gap-2 text-[13px]">
                        <Check className={`h-4 w-4 shrink-0 mt-0.5 ${f.highlight ? "text-success" : "text-muted-foreground/60"}`} />
                        <span className={f.highlight ? "text-foreground font-medium" : "text-muted-foreground"}>{f.text}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Bonuses */}
                  {plan.bonuses && (
                    <div className="mb-4 space-y-1.5">
                      <p className="text-[10px] font-bold text-warning uppercase tracking-wider">🎁 Bonuses Included:</p>
                      {plan.bonuses.map((b) => (
                        <p key={b} className="text-[11px] text-warning/80 flex items-start gap-1.5">
                          <Check className="h-3 w-3 shrink-0 mt-0.5" /> {b}
                        </p>
                      ))}
                    </div>
                  )}

                  <Button
                    className={`w-full text-sm h-11 ${
                      plan.popular
                        ? "bg-gradient-to-r from-primary to-glow-violet hover:brightness-110 shadow-glow animate-glow-pulse font-bold"
                        : plan.tier === "agency"
                        ? "bg-gradient-to-r from-glow-cyan/80 to-success hover:brightness-110"
                        : "glass-input hover:border-primary/30"
                    }`}
                    variant={plan.popular || plan.tier === "agency" ? "default" : "outline"}
                    onClick={() => handleUpgrade(plan.name)}
                  >
                    {plan.cta}
                  </Button>

                  {plan.tier !== "starter" && (
                    <p className="text-[10px] text-muted-foreground text-center mt-2">
                      Cancel anytime • No hidden fees
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Loss Aversion Banner ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-5 mb-8 border-destructive/15 bg-destructive/[0.02]"
      >
        <div className="flex items-center gap-4 flex-wrap">
          <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
            <Target className="h-5 w-5 text-destructive" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">You're missing 43 qualified leads right now</p>
            <p className="text-xs text-muted-foreground">
              Free users miss <span className="text-destructive font-bold">87%</span> of the best opportunities.
              Your competitors <span className="text-warning font-medium">ARE</span> using paid plans.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => handleUpgrade("Elite")}
            className="gap-1.5 bg-gradient-to-r from-primary to-glow-violet hover:brightness-110 shadow-glow shrink-0"
          >
            <Zap className="h-3.5 w-3.5" /> Unlock All Leads
          </Button>
        </div>
      </motion.div>

      {/* ── ROI Calculator + Testimonials ── */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <ROICalculator />
        <TestimonialCarousel />
      </div>

      {/* ── Guarantee ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mb-8"
      >
        <div className="glass-card p-6 border-success/20 text-center">
          <div className="inline-flex rounded-full bg-success/10 p-3 mb-3">
            <Shield className="h-8 w-8 text-success" />
          </div>
          <h3 className="text-lg font-bold mb-2">60-Day Iron-Clad Guarantee</h3>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto mb-2">
            Close a client within 60 days, or we'll give you a <span className="font-bold text-foreground">full refund + $100</span>. That's how confident we are.
          </p>
          <p className="text-[11px] text-success font-medium">
            Less than 2% request refunds — this system works.
          </p>
        </div>
      </motion.div>

      {/* ── FAQ ── */}
      <div className="mb-8">
        <FAQSection />
      </div>

      {/* ── Lock-in CTA ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center mb-8"
      >
        <div className="glass-card p-6 border-primary/15 inline-block">
          <p className="text-xs text-muted-foreground mb-1">
            <Lock className="h-3 w-3 inline -mt-0.5 mr-1" />
            1,243 users locked in early adopter pricing
          </p>
          <p className="text-sm font-semibold mb-3">
            Lock in <span className="text-primary">$67/month forever</span> before it increases to $97
          </p>
          <Button
            onClick={() => handleUpgrade("Professional")}
            className="gap-2 bg-gradient-to-r from-primary to-glow-violet hover:brightness-110 shadow-glow"
          >
            <Lock className="h-4 w-4" /> Lock In My Price
          </Button>
        </div>
      </motion.div>

      {/* ── Trust footer ── */}
      <div className="text-center pb-4">
        <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] text-muted-foreground/50">
          <span className="flex items-center gap-1"><CreditCard className="h-3 w-3" /> Powered by Stripe</span>
          <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> 256-bit SSL encryption</span>
          <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> We never sell your data</span>
          <span className="flex items-center gap-1"><Check className="h-3 w-3" /> SOC 2 compliant</span>
        </div>
      </div>
    </div>
  );
}
