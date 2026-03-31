import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check, Zap, Crown, Shield, TrendingUp, Clock, Users, Star,
  ArrowRight, Lock, ChevronDown, ChevronUp, Sparkles,
  MessageSquare, Bell, Headphones, BarChart3, Mail, Target,
  CreditCard, Award, BadgeCheck, X, Gift, Flame, Diamond,
  Building2, IndianRupee, Rocket, Heart,
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
    tagline: "Test drive the system — no card needed",
    monthlyPrice: 0,
    annualPrice: 0,
    originalMonthly: null,
    period: "",
    credits: "25 credits",
    creditsNum: 25,
    color: "hsl(222, 15%, 56%)",
    colorBg: "rgba(136, 146, 176, 0.08)",
    features: [
      { text: "25 one-time credits", highlight: true },
      { text: "AI-powered lead search", highlight: false },
      { text: "AI intelligence reports", highlight: false },
      { text: "Pipeline board", highlight: false },
      { text: "Basic analytics", highlight: false },
      { text: "Email support", highlight: false },
    ],
    cta: "Start Free Trial",
    popular: false,
    roiNote: "Most users close ₹15K+ deals in week 1",
    dailyCost: null,
    bonuses: null,
  },
  {
    tier: "micro",
    name: "Starter Lite",
    badge: "🎯 JUST ₹50",
    tagline: "Perfect to get your first paying client",
    monthlyPrice: 50,
    annualPrice: 39,
    originalMonthly: 149,
    period: "/month",
    credits: "50 credits/mo",
    creditsNum: 50,
    color: "hsl(200, 70%, 55%)",
    colorBg: "hsl(200, 70%, 55%, 0.08)",
    features: [
      { text: "50 credits/month", highlight: true },
      { text: "AI-powered lead search", highlight: false },
      { text: "AI intelligence reports", highlight: false },
      { text: "AI cold email generation", highlight: true },
      { text: "Pipeline board", highlight: false },
      { text: "Search history", highlight: false },
      { text: "Email support", highlight: false },
    ],
    cta: "Get Started — ₹50",
    popular: false,
    roiNote: "Close ONE ₹5K gig → 100× ROI",
    dailyCost: "₹1.6/day — literally the price of a candy 🍬",
    bonuses: null,
  },
  {
    tier: "starter",
    name: "Starter",
    badge: "🔥 BEST FOR BEGINNERS",
    tagline: "Everything to land your first clients consistently",
    monthlyPrice: 99,
    annualPrice: 79,
    originalMonthly: 299,
    period: "/month",
    credits: "200 credits/mo",
    creditsNum: 200,
    color: "hsl(238, 75%, 64%)",
    colorBg: "hsl(238, 75%, 64%, 0.08)",
    features: [
      { text: "200 credits/month", highlight: true },
      { text: "AI-powered lead search", highlight: false },
      { text: "AI intelligence reports", highlight: true },
      { text: "AI cold email generation", highlight: true },
      { text: "Pipeline board", highlight: false },
      { text: "Search history", highlight: false },
      { text: "Saved searches & alerts", highlight: false },
      { text: "Email support (24hr response)", highlight: false },
    ],
    cta: "Get Starter — ₹99",
    popular: false,
    roiNote: "Close ONE ₹10K project → paid for 100 months",
    dailyCost: "₹3.3/day — less than a cutting chai ☕",
    bonuses: null,
  },
  {
    tier: "pro",
    name: "Pro",
    badge: "⭐ MOST POPULAR",
    tagline: "The unfair advantage serious freelancers use",
    monthlyPrice: 299,
    annualPrice: 199,
    originalMonthly: 799,
    period: "/month",
    credits: "600 credits/mo",
    creditsNum: 600,
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
      { text: "Saved searches & alerts", highlight: false },
    ],
    cta: "Join Pro — ₹299",
    popular: true,
    roiNote: "Members average ₹1,24,000 extra in 6 months — 414× ROI",
    dailyCost: "₹10/day — cost of a samosa, returns of a salary 💰",
    bonuses: [
      "+300 bonus credits on signup (worth ₹897)",
      "Private Telegram group (500+ freelancers)",
      "Monthly 30-min strategy call (worth ₹2,000)",
    ],
  },
  {
    tier: "elite",
    name: "Elite",
    badge: "💎 UNLIMITED POWER",
    tagline: "Scale to ₹10L+/year with zero limits",
    monthlyPrice: 799,
    annualPrice: 599,
    originalMonthly: 2999,
    period: "/month",
    credits: "UNLIMITED",
    creditsNum: 99999,
    color: "hsl(166, 72%, 45%)",
    colorBg: "hsl(166, 72%, 45%, 0.08)",
    features: [
      { text: "UNLIMITED credits — no limits ever", highlight: true },
      { text: "Everything in Pro", highlight: false },
      { text: "AI voice cold calling (20 calls/mo)", highlight: true },
      { text: "Revenue forecasting & analytics", highlight: true },
      { text: "CRM integrations (Zoho, HubSpot)", highlight: false },
      { text: "WhatsApp API auto-messages", highlight: true },
      { text: "Dedicated account manager", highlight: true },
      { text: "Pitch deck generator", highlight: true },
      { text: "Quarterly business review", highlight: false },
    ],
    cta: "Go Elite — ₹799",
    popular: false,
    roiNote: "Elite members average ₹8.7L additional revenue annually",
    dailyCost: "₹26/day — less than a pizza for an empire 🍕",
    bonuses: [
      "Lifetime access to all future features",
      "1-on-1 onboarding call (90 min, worth ₹5,000)",
      "₹10L Freelancer Roadmap course (worth ₹9,999)",
    ],
  },
];

/* ── Credit Top-Up Packs ───────────────────────────────── */
const CREDIT_PACKS = [
  { credits: 50, price: 49, perCredit: "₹0.98", save: null, badge: null },
  { credits: 100, price: 89, perCredit: "₹0.89", save: "9%", badge: null },
  { credits: 250, price: 199, perCredit: "₹0.80", save: "18%", badge: "🔥 POPULAR" },
  { credits: 500, price: 349, perCredit: "₹0.70", save: "29%", badge: null },
  { credits: 1000, price: 599, perCredit: "₹0.60", save: "39%", badge: "⭐ BEST VALUE" },
];

/* ── FAQ ───────────────────────────────────────────────── */
const FAQ = [
  { q: "I'm not tech-savvy. Is this complicated?", a: "If you can use WhatsApp, you can use this. Average setup: 5 minutes. We have Hindi video tutorials and live support." },
  { q: "What if I don't get any clients?", a: "We offer a 60-day money-back guarantee. Plus, we'll give you ₹500 for your time. Less than 2% ask for refunds." },
  { q: "How is this different from just Googling?", a: "Google: 2 hours for 10 outdated leads. AutoClient AI: 5 minutes for 50 verified leads with contact info and AI intelligence. That's 288× faster." },
  { q: "Is the data accurate and legal?", a: "100% legal. We aggregate publicly available data. Email accuracy: 94%. Phone accuracy: 87%. We verify everything." },
  { q: "Can I cancel anytime?", a: "Yes. No contracts. Cancel with one click. Keep unused credits for 90 days." },
  { q: "Why is this so cheap compared to others?", a: "We're in early-access mode and want Indian freelancers to succeed. These prices will increase 3-5× after launch. Lock in now!" },
  { q: "What payment methods do you accept?", a: "UPI, Credit/Debit cards, Net Banking, Wallets. 100% secure via Razorpay. We never see your card details." },
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

/* ── Live Signup Notification — fixed z-index & positioning ── */
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
    const interval = setInterval(trigger, 15000);
    const initial = setTimeout(trigger, 8000);
    return () => { clearInterval(interval); clearTimeout(initial); };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          className="fixed bottom-20 left-4 z-[100] rounded-xl bg-card/95 backdrop-blur-lg border border-border p-3 flex items-center gap-3 max-w-[260px] shadow-lg"
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
          <button key={i} onClick={() => setIdx(i)} className={`h-1.5 rounded-full transition-all ${i === idx ? "w-6 bg-primary" : "w-1.5 bg-muted"}`} />
        ))}
      </div>
    </div>
  );
}

/* ── ROI Calculator (₹) ───────────────────────────────── */
function ROICalculator() {
  const [target, setTarget] = useState("50000");
  const targetNum = parseInt(target) || 0;
  const recommended = targetNum <= 10000 ? "Starter Lite" : targetNum <= 30000 ? "Starter" : targetNum <= 100000 ? "Pro" : "Elite";
  const recommendedColor = targetNum <= 10000 ? "hsl(200, 70%, 55%)" : targetNum <= 30000 ? "hsl(238, 75%, 64%)" : targetNum <= 100000 ? "hsl(260, 80%, 60%)" : "hsl(166, 72%, 45%)";
  const monthlyCost = targetNum <= 10000 ? 50 : targetNum <= 30000 ? 99 : targetNum <= 100000 ? 299 : 799;
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
              Invest <span className="font-bold text-foreground">₹{monthlyCost}/mo</span> → Target <span className="font-bold text-success">₹{targetNum.toLocaleString("en-IN")}/mo</span> = <span className="font-bold text-warning">{roi}× ROI</span>
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
            <span className="text-sm font-medium pr-4">{item.q}</span>
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

/* ── Feature Comparison Table ──────────────────────────── */
function FeatureComparisonTable() {
  const features = [
    { name: "Monthly Credits", trial: "25 one-time", micro: "50", starter: "200", pro: "600", elite: "Unlimited" },
    { name: "AI Lead Search", trial: "✓", micro: "✓", starter: "✓", pro: "✓", elite: "✓" },
    { name: "AI Intelligence Reports", trial: "✓", micro: "✓", starter: "✓", pro: "✓", elite: "Unlimited" },
    { name: "AI Cold Emails", trial: "✓", micro: "✓", starter: "✓", pro: "Unlimited", elite: "Unlimited" },
    { name: "Pipeline Board", trial: "✓", micro: "✓", starter: "✓", pro: "✓", elite: "✓" },
    { name: "Search History", trial: "✓", micro: "✓", starter: "✓", pro: "✓", elite: "✓" },
    { name: "Saved Searches & Alerts", trial: "—", micro: "—", starter: "✓", pro: "✓", elite: "✓" },
    { name: "Full Analytics", trial: "Basic", micro: "Basic", starter: "Basic", pro: "✓", elite: "✓" },
    { name: "Support", trial: "Email", micro: "Email", starter: "Email 24hr", pro: "Priority", elite: "Priority 2hr" },
  ];

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="p-5 border-b border-border">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Full Feature Comparison
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-3 font-medium text-muted-foreground">Feature</th>
              <th className="p-3 font-medium text-muted-foreground text-center">Trial</th>
              <th className="p-3 font-medium text-center" style={{ color: "hsl(200, 70%, 55%)" }}>Starter Lite</th>
              <th className="p-3 font-medium text-center" style={{ color: "hsl(238, 75%, 64%)" }}>Starter</th>
              <th className="p-3 font-bold text-center" style={{ color: "hsl(260, 80%, 60%)" }}>Pro ⭐</th>
              <th className="p-3 font-medium text-center" style={{ color: "hsl(166, 72%, 45%)" }}>Elite</th>
            </tr>
          </thead>
          <tbody>
            {features.map((f, i) => (
              <tr key={f.name} className={`border-b border-border/50 ${i % 2 === 0 ? "bg-muted/5" : ""}`}>
                <td className="p-3 font-medium">{f.name}</td>
                <td className="p-3 text-center text-muted-foreground">{f.trial}</td>
                <td className="p-3 text-center">{f.micro}</td>
                <td className="p-3 text-center">{f.starter}</td>
                <td className="p-3 text-center font-medium">{f.pro}</td>
                <td className="p-3 text-center">{f.elite}</td>
              </tr>
            ))}
            <tr className="border-t border-border">
              <td className="p-3 font-bold">Price</td>
              <td className="p-3 text-center font-bold">₹0</td>
              <td className="p-3 text-center font-bold" style={{ color: "hsl(200, 70%, 55%)" }}>₹50/mo</td>
              <td className="p-3 text-center font-bold" style={{ color: "hsl(238, 75%, 64%)" }}>₹99/mo</td>
              <td className="p-3 text-center font-bold" style={{ color: "hsl(260, 80%, 60%)" }}>₹299/mo</td>
              <td className="p-3 text-center font-bold" style={{ color: "hsl(166, 72%, 45%)" }}>₹799/mo</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Main Upgrade Page ─────────────────────────────────── */
export default function Upgrade() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const { plan: currentPlan, refresh: refreshSub } = useSubscription();
  const spotsRef = useRef(347);
  const [spots, setSpots] = useState(347);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (spotsRef.current > 3) {
        spotsRef.current -= 1;
        setSpots(spotsRef.current);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const planLevels: Record<string, number> = { trial: 0, free: 0, micro: 1, starter: 2, pro: 3, elite: 4, agency: 5 };
  const userLevel = planLevels[currentPlan] || 0;

  const handleUpgrade = (tier: string, price: number) => {
    const targetLevel = planLevels[tier] || 0;
    if (targetLevel <= userLevel) {
      toast.info("You already have this plan or higher!");
      return;
    }
    if (price === 0) {
      toast.info("Trial is free — you're already on it!");
      return;
    }

    const finalAmount = billing === "annual" ? Math.round(price * 0.75 * 12) : price;
    setProcessing(tier);

    initiatePayment({
      amount: finalAmount,
      planName: tier.charAt(0).toUpperCase() + tier.slice(1),
      onSuccess: () => {
        setProcessing(null);
        refreshSub();
        toast.success(`🎉 Welcome to ${tier}! Your account has been upgraded.`);
      },
      onFailure: (error) => {
        setProcessing(null);
        if (error !== "Payment cancelled") {
          toast.error("Payment failed: " + error);
        }
      },
    });
  };

  const handleCreditPurchase = (credits: number, price: number) => {
    setProcessing(`credits-${credits}`);
    initiatePayment({
      amount: price,
      planName: `${credits} Credits`,
      credits,
      onSuccess: () => {
        setProcessing(null);
        refreshSub();
        toast.success(`🎉 ${credits} credits added to your account!`);
      },
      onFailure: (error) => {
        setProcessing(null);
        if (error !== "Payment cancelled") {
          toast.error("Payment failed: " + error);
        }
      },
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto pb-24">
      <LiveSignupPopup />

      {/* ── Launch Offer Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-warning/5 border border-warning/20"
      >
        <Zap className="h-4 w-4 text-warning shrink-0 animate-pulse" />
        <span className="text-xs text-center">
          <span className="text-warning font-bold">⚡ EARLY-ACCESS PRICING:</span>
          <span className="text-muted-foreground"> Prices will increase 3-5× after launch • </span>
          <span className="text-destructive font-bold">{spots} spots left</span>
          <span className="text-muted-foreground"> • Ends in </span>
          <CountdownTimer />
        </span>
      </motion.div>

      {/* ── Hero ── */}
      <div className="text-center mb-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="section-label mb-2">Not a Cost. An Investment.</p>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-3">
            Start at just <span className="text-primary">₹50/month</span> → Average Return: <span className="text-success">₹1,24,000</span> in 6 months
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            That's up to <span className="font-bold text-warning">2,480× ROI</span>. No hedge fund even comes close.
          </p>
        </motion.div>

        {/* Billing toggle */}
        <div className="mt-6 inline-flex items-center gap-1 rounded-full bg-muted/30 border border-border p-1">
          <button
            onClick={() => setBilling("monthly")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${billing === "monthly" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling("annual")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${billing === "annual" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            Annual <span className="text-[10px] font-bold ml-1 text-success">SAVE 25%</span>
          </button>
        </div>
      </div>

      {/* ── Social proof bar ── */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-[11px] text-muted-foreground mb-6">
        <span className="flex items-center gap-1"><Users className="h-3 w-3" /> 2,847+ Indian freelancers</span>
        <span className="flex items-center gap-1"><Star className="h-3 w-3 text-warning" /> 4.8/5 from 1,847 reviews</span>
        <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> 60-day money-back guarantee</span>
        <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> Bank-grade security</span>
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
          <p className="text-xs font-bold text-success mb-2">✅ NEW WAY (AutoClient AI)</p>
          <p className="text-2xl font-bold font-mono">₹50 – ₹799<span className="text-sm text-muted-foreground">/month</span></p>
          <p className="text-[11px] text-muted-foreground mt-1">= ₹600 – ₹9,588/year — consistent 24/7</p>
          <p className="text-[10px] text-success font-bold mt-1">You SAVE: up to ₹1,70,412/year 🤯</p>
        </div>
      </div>

      {/* ── Pricing Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        {plans.map((plan, i) => {
          const displayPrice = billing === "annual" ? plan.annualPrice : plan.monthlyPrice;
          const displayOriginal = plan.originalMonthly;

          return (
            <motion.div
              key={plan.tier}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -6, transition: { type: "spring", stiffness: 400, damping: 30 } }}
              className="relative"
            >
              <div className={`glass-card rounded-2xl h-full flex flex-col relative overflow-hidden ${
                plan.popular ? "border-primary/40 shadow-[0_0_30px_hsl(260,80%,60%,0.12)]" : ""
              }`}>
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-glow-violet to-glow-cyan" />
                )}
                {plan.badge && (
                  <div className={`text-center pt-3 pb-0`}>
                    <span className={`inline-block px-3 py-1 text-[9px] font-bold rounded-full uppercase tracking-wider ${
                      plan.popular ? "bg-gradient-to-r from-primary to-glow-violet text-white" : "bg-muted/50 text-foreground border border-border"
                    }`}>
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="p-5 pb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-6 w-6 rounded-lg flex items-center justify-center" style={{ background: plan.colorBg }}>
                      {plan.tier === "trial" && <Gift className="h-3 w-3" style={{ color: plan.color }} />}
                      {plan.tier === "micro" && <Heart className="h-3 w-3" style={{ color: plan.color }} />}
                      {plan.tier === "starter" && <Flame className="h-3 w-3" style={{ color: plan.color }} />}
                      {plan.tier === "pro" && <Crown className="h-3 w-3" style={{ color: plan.color }} />}
                      {plan.tier === "elite" && <Diamond className="h-3 w-3" style={{ color: plan.color }} />}
                    </div>
                    <h3 className="text-base font-bold">{plan.name}</h3>
                  </div>
                  <p className="text-[10px] text-muted-foreground mb-3 leading-relaxed">{plan.tagline}</p>

                  {/* Price */}
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    {displayOriginal && displayOriginal > 0 && (
                      <span className="text-sm font-mono text-muted-foreground/50 line-through">₹{displayOriginal}</span>
                    )}
                    <span className="text-3xl font-bold font-mono">
                      {plan.monthlyPrice === 0 ? "₹0" : `₹${displayPrice}`}
                    </span>
                    <span className="text-muted-foreground text-xs">{plan.period}</span>
                  </div>

                  {billing === "annual" && plan.monthlyPrice > 0 && (
                    <p className="text-[10px] text-success mt-0.5">₹{plan.annualPrice * 12}/year (save {Math.round((1 - plan.annualPrice / plan.monthlyPrice) * 100)}%)</p>
                  )}

                  {/* Daily cost */}
                  {plan.dailyCost && (
                    <p className="text-[10px] text-primary/80 mt-1 italic">{plan.dailyCost}</p>
                  )}

                  {/* Credits badge */}
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[9px] font-bold" style={{ background: plan.colorBg, color: plan.color }}>
                    <Zap className="h-2.5 w-2.5" /> {plan.credits}
                  </div>

                  {/* ROI note */}
                  {plan.roiNote && (
                    <div className="mt-2 rounded-lg px-2 py-1 text-[9px] font-medium" style={{ background: plan.colorBg, color: plan.color }}>
                      💰 {plan.roiNote}
                    </div>
                  )}
                </div>

                <div className="px-5 pb-5 flex-1 flex flex-col">
                  <ul className="space-y-1.5 flex-1 mb-3">
                    {plan.features.map((f) => (
                      <li key={f.text} className="flex items-start gap-1.5 text-[11px]">
                        <Check className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${f.highlight ? "text-success" : "text-muted-foreground/60"}`} />
                        <span className={f.highlight ? "text-foreground font-medium" : "text-muted-foreground"}>{f.text}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Bonuses */}
                  {plan.bonuses && (
                    <div className="mb-3 space-y-1">
                      <p className="text-[9px] font-bold text-warning uppercase tracking-wider">🎁 Launch Bonuses:</p>
                      {plan.bonuses.map((b) => (
                        <p key={b} className="text-[10px] text-warning/80 flex items-start gap-1">
                          <Check className="h-3 w-3 shrink-0 mt-0.5" /> {b}
                        </p>
                      ))}
                    </div>
                  )}

                  <Button
                    className={`w-full text-xs h-10 ${
                      planLevels[plan.tier] <= userLevel
                        ? "opacity-50 cursor-not-allowed"
                        : plan.popular
                        ? "bg-gradient-to-r from-primary to-glow-violet hover:brightness-110 shadow-glow font-bold"
                        : plan.tier === "elite"
                        ? "bg-gradient-to-r from-glow-cyan/80 to-success hover:brightness-110"
                        : "glass-input hover:border-primary/30"
                    }`}
                    variant={plan.popular || plan.tier === "elite" ? "default" : "outline"}
                    disabled={planLevels[plan.tier] <= userLevel || processing === plan.tier}
                    onClick={() => handleUpgrade(plan.tier, billing === "annual" ? plan.annualPrice : plan.monthlyPrice)}
                  >
                    {processing === plan.tier
                      ? "Processing..."
                      : planLevels[plan.tier] <= userLevel
                      ? "✓ Current Plan"
                      : plan.cta}
                  </Button>

                  {plan.tier !== "trial" && (
                    <p className="text-[9px] text-muted-foreground text-center mt-1.5">
                      Cancel anytime • No hidden fees
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Feature Comparison ── */}
      <div className="mb-10">
        <FeatureComparisonTable />
      </div>

      {/* ── Credit Top-Up Section ── */}
      <div className="mb-10">
        <h3 className="text-lg font-semibold mb-1 text-center">Pay-As-You-Go Credits</h3>
        <p className="text-xs text-muted-foreground text-center mb-4">Don't want a subscription? Buy credits directly — insanely cheap.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {CREDIT_PACKS.map((pack) => (
            <motion.div
              key={pack.credits}
              whileHover={{ y: -4 }}
              className="glass-card p-4 text-center cursor-pointer hover:border-primary/30 transition-all relative"
              onClick={() => handleCreditPurchase(pack.credits, pack.price)}
            >
              {pack.badge && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-primary/10 border border-primary/20 text-[9px] font-bold text-primary rounded-full whitespace-nowrap">
                  {pack.badge}
                </div>
              )}
              <p className="text-2xl font-bold font-mono">{pack.credits}</p>
              <p className="text-[10px] text-muted-foreground">credits</p>
              <p className="text-lg font-bold mt-1">₹{pack.price}</p>
              <p className="text-[10px] text-muted-foreground">{pack.perCredit}/credit</p>
              {pack.save && (
                <p className="text-[10px] text-success font-bold mt-1">SAVE {pack.save}</p>
              )}
              {processing === `credits-${pack.credits}` && (
                <p className="text-[10px] text-primary font-bold mt-1 animate-pulse">Processing...</p>
              )}
            </motion.div>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-2">Credits valid for 90 days from purchase</p>
      </div>

      {/* ── Loss Aversion Banner — only for non-paid users ── */}
      {userLevel < 3 && (
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
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">You're missing 43 qualified leads right now</p>
              <p className="text-xs text-muted-foreground">
                Free users miss <span className="text-destructive font-bold">87%</span> of the best opportunities.
                Your competitors <span className="text-warning font-medium">ARE</span> using paid plans.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => handleUpgrade("pro", 299)}
              className="gap-1.5 bg-gradient-to-r from-primary to-glow-violet hover:brightness-110 shadow-glow shrink-0"
            >
              <Zap className="h-3.5 w-3.5" /> Unlock All Leads
            </Button>
          </div>
        </motion.div>
      )}

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
      {userLevel < 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-center mb-8">
          <div className="glass-card p-6 border-primary/15 inline-block">
            <p className="text-xs text-muted-foreground mb-1">
              <Lock className="h-3 w-3 inline -mt-0.5 mr-1" />
              1,243 users locked in early adopter pricing
            </p>
            <p className="text-sm font-semibold mb-3">
              Lock in <span className="text-primary">₹299/month forever</span> before it increases to ₹799
            </p>
            <Button
              onClick={() => handleUpgrade("pro", 299)}
              className="gap-2 bg-gradient-to-r from-primary to-glow-violet hover:brightness-110 shadow-glow"
            >
              <Lock className="h-4 w-4" /> Lock In My Price
            </Button>
          </div>
        </motion.div>
      )}

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
