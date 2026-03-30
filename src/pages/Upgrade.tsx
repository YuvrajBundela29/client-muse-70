import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check, Zap, Crown, Shield, TrendingUp, Clock, Users, Star,
  ArrowRight, Lock, ChevronDown, ChevronUp, Sparkles,
  MessageSquare, Bell, Headphones, BarChart3, Mail, Target,
  CreditCard, Award, BadgeCheck, X, Gift, Flame, Diamond,
  Building2, IndianRupee,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { initiatePayment } from "@/lib/razorpay";
import { useSubscription } from "@/hooks/useSubscription";

/* ── Testimonials ──────────────────────────────────────── */
const TESTIMONIALS = [
  { name: "Priya M.", city: "Mumbai", text: "Closed ₹3.2L deal in my first month. The Pro plan intelligence reports are insane.", revenue: "₹3,20,000", avatar: "PM" },
  { name: "Rahul K.", city: "Pune", text: "Scaled from ₹30K/month to ₹2.1L/month in 4 months. This tool is an unfair advantage.", revenue: "₹2,10,000", avatar: "RK" },
  { name: "Sneha T.", city: "Bangalore", text: "Found 5 clients in week 1. Now I'm booked for 3 months straight.", revenue: "₹1,45,000", avatar: "ST" },
  { name: "Amit V.", city: "Delhi", text: "Was skeptical but closed my first client in 5 days. The ROI is unreal.", revenue: "₹85,000", avatar: "AV" },
];

/* ── Plans (INR + Credits) ─────────────────────────────── */
const plans = [
  {
    tier: "trial",
    name: "Trial",
    badge: null,
    tagline: "Test drive the system",
    price: 0,
    originalPrice: null,
    period: "",
    periodNote: "25 credits • One-time • Expires in 14 days",
    credits: "25 credits",
    color: "hsl(222, 15%, 56%)",
    colorBg: "rgba(136, 146, 176, 0.08)",
    features: [
      { text: "25 credits (search 5 leads + 1 full report)", highlight: true },
      { text: "3-stage pipeline board", highlight: false },
      { text: "Basic analytics", highlight: false },
      { text: "Email support", highlight: false },
    ],
    cta: "Start Free Trial",
    disabled: false,
    popular: false,
    roiNote: "Most users close ₹15,000+ deals in week 1",
    valueTotal: null,
    dailyCost: null,
  },
  {
    tier: "starter",
    name: "Starter",
    badge: "🔥 BEST FOR BEGINNERS",
    tagline: "Everything to land your first clients",
    price: 499,
    originalPrice: 799,
    period: "/month",
    periodNote: "₹5,988/year (save ₹1,000)",
    credits: "200 credits/mo",
    color: "hsl(238, 75%, 64%)",
    colorBg: "hsl(238, 75%, 64%, 0.08)",
    features: [
      { text: "200 credits/month (~40 searches + 10 reports)", highlight: true },
      { text: "Unlimited pipeline (6-stage board)", highlight: false },
      { text: "20 AI cold emails/month", highlight: true },
      { text: "Basic analytics dashboard", highlight: false },
      { text: "Search history (30 days)", highlight: false },
      { text: "Email support (24hr response)", highlight: false },
    ],
    cta: "Get Starter",
    disabled: false,
    popular: false,
    roiNote: "Close ONE ₹20K project → paid for 40 months",
    valueTotal: null,
    dailyCost: "₹17/day — less than a chai at Starbucks",
    bonuses: [
      "+100 bonus credits on signup (worth ₹299)",
      "Freelancer's Pitch Pack — 50 templates (worth ₹499)",
    ],
  },
  {
    tier: "pro",
    name: "Pro",
    badge: "⭐ MOST POPULAR",
    tagline: "The unfair advantage serious freelancers use",
    price: 1299,
    originalPrice: 1999,
    period: "/month",
    periodNote: "₹13,990/year (save ₹2,598)",
    credits: "600 credits/mo",
    color: "hsl(260, 80%, 60%)",
    colorBg: "hsl(260, 80%, 60%, 0.08)",
    features: [
      { text: "600 credits/month (120 searches + 30 reports)", highlight: true },
      { text: "Everything in Starter", highlight: false },
      { text: "UNLIMITED AI cold emails", highlight: true },
      { text: "Priority search (see leads 2hrs before others)", highlight: true },
      { text: "Competitor tracking alerts", highlight: true },
      { text: "Follow-up automation (3-touch sequence)", highlight: true },
      { text: "WhatsApp support (2hr response)", highlight: false },
      { text: "Win probability scores", highlight: true },
      { text: "CSV export", highlight: false },
    ],
    cta: "Join Pro",
    disabled: false,
    popular: true,
    roiNote: "Members average ₹1,24,000 extra in 6 months — 95× ROI",
    valueTotal: "₹8,000/month value → You pay ₹1,299",
    dailyCost: "₹43/day — cost of lunch, returns of a month",
    bonuses: [
      "+300 bonus credits on signup (worth ₹897)",
      "Private Telegram group (500+ freelancers)",
      "Monthly 30-min strategy call (worth ₹2,000)",
    ],
  },
  {
    tier: "elite",
    name: "Elite",
    badge: "💎 FOR SERIOUS OPERATORS",
    tagline: "Scale to ₹10L+/year with unlimited power",
    price: 2999,
    originalPrice: 4999,
    period: "/month",
    periodNote: "₹29,990/year (save ₹6,000)",
    credits: "UNLIMITED",
    color: "hsl(166, 72%, 45%)",
    colorBg: "hsl(166, 72%, 45%, 0.08)",
    features: [
      { text: "UNLIMITED credits — no limits", highlight: true },
      { text: "Everything in Pro", highlight: false },
      { text: "AI voice cold calling (20 calls/mo)", highlight: true },
      { text: "Revenue forecasting & analytics", highlight: true },
      { text: "CRM integrations (Zoho, HubSpot)", highlight: false },
      { text: "WhatsApp API auto-messages", highlight: true },
      { text: "Dedicated account manager", highlight: true },
      { text: "Pitch deck generator", highlight: true },
      { text: "Quarterly business review", highlight: false },
    ],
    cta: "Apply for Elite",
    disabled: false,
    popular: false,
    roiNote: "Elite members average ₹8.7L additional revenue annually",
    valueTotal: null,
    dailyCost: "₹99/day — less than a movie ticket for an empire",
    bonuses: [
      "Lifetime access to all future features",
      "1-on-1 onboarding call (90 min, worth ₹5,000)",
      "₹10L Freelancer Roadmap course (worth ₹9,999)",
    ],
  },
];

/* ── Credit Top-Up Packs ───────────────────────────────── */
const CREDIT_PACKS = [
  { credits: 50, price: 299, perCredit: "₹5.98", save: null },
  { credits: 100, price: 499, perCredit: "₹4.99", save: "17%", badge: null },
  { credits: 250, price: 999, perCredit: "₹4.00", save: "33%", badge: "🔥 POPULAR" },
  { credits: 500, price: 1799, perCredit: "₹3.60", save: "40%", badge: null },
  { credits: 1000, price: 2999, perCredit: "₹3.00", save: "50%", badge: "⭐ BEST VALUE" },
];

/* ── FAQ ───────────────────────────────────────────────── */
const FAQ = [
  { q: "I'm not tech-savvy. Is this complicated?", a: "If you can use WhatsApp, you can use this. Average setup: 5 minutes. We have Hindi video tutorials and live support." },
  { q: "What if I don't get any clients?", a: "We offer a 60-day money-back guarantee. Plus, we'll give you ₹500 for your time. Less than 2% ask for refunds." },
  { q: "How is this different from just Googling?", a: "Google: 2 hours for 10 outdated leads. AutoClient AI: 5 minutes for 50 verified leads with contact info and AI intelligence. That's 288× faster." },
  { q: "Is the data accurate and legal?", a: "100% legal. We aggregate publicly available data. Email accuracy: 94%. Phone accuracy: 87%. We verify everything." },
  { q: "Can I cancel anytime?", a: "Yes. No contracts. Cancel with one click. Keep unused credits for 90 days." },
  { q: "What payment methods do you accept?", a: "UPI, Credit/Debit cards, Net Banking, Wallets. 100% secure. We never see your card details." },
];

/* ── Countdown Timer ───────────────────────────────────── */
function CountdownTimer() {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    const now = new Date();
    const end = new Date(now);
    end.setDate(end.getDate() + 4);
    end.setHours(23, 59, 59, 0);
    setSecs(Math.floor((end.getTime() - now.getTime()) / 1000));
    const interval = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(interval);
  }, []);
  const d = Math.floor(secs / 86400);
  const h = Math.floor((secs % 86400) / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return (
    <span className="font-mono font-bold text-warning">
      {d}d {String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
    </span>
  );
}

/* ── Live Signup Notification ──────────────────────────── */
const SIGNUP_NAMES = ["Priya R.", "Amit T.", "Sneha L.", "Vikram C.", "Kavita K.", "Rohan B.", "Neha J.", "Arjun S."];
const SIGNUP_CITIES = ["Mumbai", "Delhi", "Bangalore", "Pune", "Hyderabad", "Chennai", "Kolkata", "Jaipur"];

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
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
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
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <Star className="h-4 w-4 text-warning" /> Success Stories
      </h3>
      <AnimatePresence mode="wait">
        <motion.div key={idx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-glow-violet flex items-center justify-center text-xs font-bold text-white">{t.avatar}</div>
            <div>
              <p className="text-sm font-semibold">{t.name}</p>
              <p className="text-[11px] text-muted-foreground">{t.city}</p>
            </div>
            <div className="ml-auto flex gap-0.5">
              {[1,2,3,4,5].map((s) => <Star key={s} className="h-3 w-3 fill-warning text-warning" />)}
            </div>
          </div>
          <p className="text-sm text-foreground/90 italic mb-2">"{t.text}"</p>
          <p className="text-xs text-success font-mono font-bold">+{t.revenue} in new revenue</p>
        </motion.div>
      </AnimatePresence>
      <div className="flex justify-center gap-1.5 mt-4">
        {TESTIMONIALS.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)} className={`h-1.5 rounded-full transition-all ${i === idx ? "w-6 bg-primary" : "w-1.5 bg-[rgba(255,255,255,0.1)]"}`} />
        ))}
      </div>
    </div>
  );
}

/* ── ROI Calculator (₹) ───────────────────────────────── */
function ROICalculator() {
  const [target, setTarget] = useState("50000");
  const targetNum = parseInt(target) || 0;
  const recommended = targetNum <= 30000 ? "Starter" : targetNum <= 100000 ? "Pro" : "Elite";
  const recommendedColor = targetNum <= 30000 ? "hsl(238, 75%, 64%)" : targetNum <= 100000 ? "hsl(260, 80%, 60%)" : "hsl(166, 72%, 45%)";
  const monthlyCost = targetNum <= 30000 ? 499 : targetNum <= 100000 ? 1299 : 2999;
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
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">₹</span>
          <Input
            type="number"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="h-12 pl-7 glass-input text-lg font-mono font-bold"
            placeholder="50000"
          />
        </div>
      </div>
      {targetNum > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="rounded-xl p-4 border" style={{ borderColor: `${recommendedColor}33`, background: `${recommendedColor}0A` }}>
            <p className="text-xs text-muted-foreground mb-1">Recommended Plan</p>
            <p className="text-xl font-bold" style={{ color: recommendedColor }}>{recommended}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Invest <span className="font-bold text-foreground">₹{monthlyCost.toLocaleString("en-IN")}/mo</span> → Target <span className="font-bold text-success">₹{targetNum.toLocaleString("en-IN")}/mo</span> = <span className="font-bold text-warning">{roi}× ROI</span>
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
        Questions? We've Got Answers.
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
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <p className="px-4 pb-4 text-sm text-muted-foreground">{item.a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

/* ── Credit Comparison Bar ─────────────────────────────── */
function CreditComparisonBar() {
  return (
    <div className="glass-card p-4 mb-6 border-warning/15">
      <div className="flex items-center gap-3 text-xs">
        <IndianRupee className="h-4 w-4 text-warning shrink-0" />
        <span className="text-muted-foreground">
          Pay-as-you-go: <span className="text-warning font-bold">₹5.98/credit</span>.
          Pro members: <span className="text-success font-bold">₹2.16/credit</span>.
          <span className="text-foreground font-medium"> Save 64% by upgrading.</span>
        </span>
      </div>
    </div>
  );
}

/* ── Main Upgrade Page ─────────────────────────────────── */
export default function Upgrade() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const spotsRef = useRef(47);
  const [spots, setSpots] = useState(47);

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
    toast.info(`Payment integration coming soon! Selected: ${planName}`);
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1200px] mx-auto">
      <LiveSignupPopup />

      {/* ── Launch Offer Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-warning/5 border border-warning/20"
      >
        <Zap className="h-4 w-4 text-warning shrink-0 animate-pulse" />
        <span className="text-xs text-center">
          <span className="text-warning font-bold">⚡ LAUNCH OFFER:</span>
          <span className="text-muted-foreground"> First 500 users get lifetime 40% off • </span>
          <span className="text-destructive font-bold">347 spots left</span>
          <span className="text-muted-foreground"> • Offer ends in </span>
          <CountdownTimer />
        </span>
      </motion.div>

      {/* ── Hero ── */}
      <div className="text-center mb-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="section-label mb-2">Not a Cost. An Investment.</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            Invest <span className="text-primary">₹1,299/month</span> → Average Return: <span className="text-success">₹1,24,000</span> in 6 months
          </h1>
          <p className="text-lg text-muted-foreground">
            That's a <span className="font-bold text-warning">95× ROI</span>. Most hedge funds can't beat that.
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
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[11px] text-muted-foreground mb-6">
        <span className="flex items-center gap-1"><Users className="h-3 w-3" /> 2,847+ Indian freelancers</span>
        <span className="flex items-center gap-1"><Star className="h-3 w-3 text-warning" /> 4.8/5 from 1,847 reviews</span>
        <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> 60-day money-back guarantee</span>
        <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> Bank-grade security</span>
      </div>

      {/* ── Scarcity indicator ── */}
      <div className="text-center mb-6">
        <span className="inline-flex items-center gap-2 rounded-full bg-destructive/5 border border-destructive/20 px-4 py-1.5 text-xs">
          <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
          <span className="text-muted-foreground">Only <span className="font-bold text-destructive">{spots} Pro spots</span> left at launch price</span>
        </span>
      </div>

      {/* ── Value Comparison ── */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8 max-w-2xl mx-auto">
        <div className="glass-card p-4 border-destructive/15 opacity-70">
          <p className="text-xs font-bold text-destructive mb-2">❌ OLD WAY (Hiring VA)</p>
          <p className="text-2xl font-bold font-mono">₹15,000<span className="text-sm text-muted-foreground">/month</span></p>
          <p className="text-[11px] text-muted-foreground mt-1">= ₹1,80,000/year + training time</p>
          <p className="text-[10px] text-destructive mt-1">Inconsistent leads, high turnover</p>
        </div>
        <div className="glass-card p-4 border-success/20">
          <p className="text-xs font-bold text-success mb-2">✅ NEW WAY (AutoClient AI Pro)</p>
          <p className="text-2xl font-bold font-mono">₹1,299<span className="text-sm text-muted-foreground">/month</span></p>
          <p className="text-[11px] text-muted-foreground mt-1">= ₹15,588/year — consistent 24/7</p>
          <p className="text-[10px] text-success font-bold mt-1">You SAVE: ₹1,64,412/year 🤯</p>
        </div>
      </div>

      {/* ── Pricing Grid ── */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
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
                {plan.popular && (
                  <div className="absolute -top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-glow-violet to-glow-cyan" />
                )}
                {plan.badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-white text-[10px] font-bold rounded-full flex items-center gap-1 uppercase tracking-wider whitespace-nowrap ${
                    plan.popular ? "bg-gradient-to-r from-primary to-glow-violet" : "bg-[rgba(255,255,255,0.1)]"
                  }`}>
                    {plan.badge}
                  </div>
                )}

                <div className="p-6 pb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-6 w-6 rounded-lg flex items-center justify-center" style={{ background: plan.colorBg }}>
                      {plan.tier === "trial" && <Gift className="h-3 w-3" style={{ color: plan.color }} />}
                      {plan.tier === "starter" && <Flame className="h-3 w-3" style={{ color: plan.color }} />}
                      {plan.tier === "pro" && <Crown className="h-3 w-3" style={{ color: plan.color }} />}
                      {plan.tier === "elite" && <Diamond className="h-3 w-3" style={{ color: plan.color }} />}
                    </div>
                    <h3 className="text-lg font-bold">{plan.name}</h3>
                  </div>
                  <p className="text-[11px] text-muted-foreground mb-3">{plan.tagline}</p>

                  {/* Price */}
                  <div className="flex items-baseline gap-2">
                    {displayOriginal && (
                      <span className="text-lg font-mono text-muted-foreground/50 line-through">₹{displayOriginal.toLocaleString("en-IN")}</span>
                    )}
                    <span className="text-4xl font-bold font-mono">
                      {plan.price === 0 ? "₹0" : `₹${displayPrice.toLocaleString("en-IN")}`}
                    </span>
                    <span className="text-muted-foreground text-sm">{plan.period}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">{plan.periodNote}</p>

                  {/* Daily cost */}
                  {plan.dailyCost && (
                    <p className="text-[10px] text-primary/80 mt-1 italic">{plan.dailyCost}</p>
                  )}

                  {/* Credits badge */}
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold" style={{ background: plan.colorBg, color: plan.color }}>
                    <Zap className="h-3 w-3" /> {plan.credits}
                  </div>

                  {/* ROI note */}
                  {plan.roiNote && (
                    <div className="mt-2 rounded-lg px-2.5 py-1.5 text-[10px] font-medium" style={{ background: plan.colorBg, color: plan.color }}>
                      💰 {plan.roiNote}
                    </div>
                  )}
                </div>

                <div className="px-6 pb-6 flex-1 flex flex-col">
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
                      <p className="text-[10px] font-bold text-warning uppercase tracking-wider">🎁 Launch Bonuses:</p>
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
                        : plan.tier === "elite"
                        ? "bg-gradient-to-r from-glow-cyan/80 to-success hover:brightness-110"
                        : "glass-input hover:border-primary/30"
                    }`}
                    variant={plan.popular || plan.tier === "elite" ? "default" : "outline"}
                    onClick={() => handleUpgrade(plan.name)}
                  >
                    {plan.cta}
                  </Button>

                  {plan.tier !== "trial" && (
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

      {/* ── Credit Top-Up Section ── */}
      <div className="mb-10">
        <h3 className="text-lg font-semibold mb-1 text-center">Pay-As-You-Go Credits</h3>
        <p className="text-xs text-muted-foreground text-center mb-4">Don't want a subscription? Buy credits directly.</p>
        <CreditComparisonBar />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {CREDIT_PACKS.map((pack) => (
            <motion.div
              key={pack.credits}
              whileHover={{ y: -4 }}
              className="glass-card p-4 text-center cursor-pointer hover:border-primary/30 transition-all relative"
              onClick={() => handleUpgrade(`${pack.credits} credits`)}
            >
              {pack.badge && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-primary/10 border border-primary/20 text-[9px] font-bold text-primary rounded-full whitespace-nowrap">
                  {pack.badge}
                </div>
              )}
              <p className="text-2xl font-bold font-mono">{pack.credits}</p>
              <p className="text-[10px] text-muted-foreground">credits</p>
              <p className="text-lg font-bold mt-1">₹{pack.price.toLocaleString("en-IN")}</p>
              <p className="text-[10px] text-muted-foreground">{pack.perCredit}/credit</p>
              {pack.save && (
                <p className="text-[10px] text-success font-bold mt-1">SAVE {pack.save}</p>
              )}
            </motion.div>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-2">Credits valid for 90 days from purchase</p>
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
            onClick={() => handleUpgrade("Pro")}
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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mb-8">
        <div className="glass-card p-6 border-success/20 text-center">
          <div className="inline-flex rounded-full bg-success/10 p-3 mb-3">
            <Shield className="h-8 w-8 text-success" />
          </div>
          <h3 className="text-lg font-bold mb-2">60-Day Money-Back Guarantee</h3>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto mb-2">
            Close a client within 60 days, or we'll give you a <span className="font-bold text-foreground">full refund + ₹500</span> for wasting your time.
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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-center mb-8">
        <div className="glass-card p-6 border-primary/15 inline-block">
          <p className="text-xs text-muted-foreground mb-1">
            <Lock className="h-3 w-3 inline -mt-0.5 mr-1" />
            1,243 users locked in early adopter pricing
          </p>
          <p className="text-sm font-semibold mb-3">
            Lock in <span className="text-primary">₹1,299/month forever</span> before it increases to ₹1,999
          </p>
          <Button
            onClick={() => handleUpgrade("Pro")}
            className="gap-2 bg-gradient-to-r from-primary to-glow-violet hover:brightness-110 shadow-glow"
          >
            <Lock className="h-4 w-4" /> Lock In My Price
          </Button>
        </div>
      </motion.div>

      {/* ── Trust footer ── */}
      <div className="text-center pb-4">
        <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] text-muted-foreground/50">
          <span className="flex items-center gap-1"><CreditCard className="h-3 w-3" /> UPI • Cards • Net Banking</span>
          <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Bank-level SSL encryption</span>
          <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> We never sell your data</span>
          <span>🇮🇳 Made with ❤️ for Indian Freelancers</span>
        </div>
      </div>
    </div>
  );
}
