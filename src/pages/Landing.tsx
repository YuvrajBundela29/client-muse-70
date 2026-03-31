import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, Zap, Clock, Mail, TrendingDown,
  Search, Brain, Users, Shield, Star, ChevronRight, Sparkles,
  ChevronDown, ChevronUp, Target, X, Check, IndianRupee,
} from "lucide-react";
import logoWhite from "@/assets/logo-white.png";
import { LiveActivity } from "@/components/landing/LiveActivity";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";

const painPoints = [
  {
    icon: Clock,
    title: "⏰ Time Wasted",
    stat: "40 hours/month",
    description: "Finding & researching leads manually = ₹20,000 in lost billable time",
  },
  {
    icon: Target,
    title: "💔 Opportunities Missed",
    stat: "47 vs 8 leads",
    description: "Your competitors found 47 leads while you found 8 = ₹3.2L in lost revenue",
  },
  {
    icon: TrendingDown,
    title: "📉 Conversion Rate",
    stat: "2% vs 23%",
    description: "Cold outreach: 2% response. AI-powered: 23%. You're working 11.5× harder",
  },
];

const steps = [
  { icon: Search, title: "Tell Us What You Do", description: '"I do website design for gyms in Mumbai"', time: "30 seconds" },
  { icon: Brain, title: "AI Finds Perfect Clients", description: '"Found 47 gyms actively looking for website redesign"', time: "2 minutes" },
  { icon: Users, title: "Reach Out & Close", description: '"AI writes your pitch. You hit send. They reply. You close."', time: "First client in 7 days" },
];

const testimonials = [
  { name: "Priya M.", city: "Web Designer, Mumbai", text: "Closed ₹3.2L deal in my first month. I was skeptical. Then I found 5 clients in week 1. Now I'm booked for 3 months.", stars: 5 },
  { name: "Rahul K.", city: "Digital Marketer, Pune", text: "From ₹30K/month to ₹1.8L/month in 90 days. The intelligence reports are insane. I know exactly what to say to win every pitch.", stars: 5 },
  { name: "Sneha T.", city: "Social Media Manager, Bangalore", text: "The AI emails get me 5× more replies than my manual outreach. This tool paid for itself on day 3.", stars: 5 },
];

const faq = [
  { q: "I'm not tech-savvy. Is this complicated?", a: "If you can use WhatsApp, you can use this. Average setup: 5 minutes. We have Hindi video tutorials and live support." },
  { q: "What if I don't get any clients?", a: "We offer a 60-day money-back guarantee. Plus, we'll give you ₹500 for your time. Less than 2% ask for refunds." },
  { q: "How is this different from just Googling?", a: "Google: 2 hours for 10 outdated leads. AutoClient AI: 5 minutes for 50 verified leads with contact info. That's 288× faster." },
  { q: "Is the data accurate and legal?", a: "100% legal. We aggregate publicly available data. Email accuracy: 94%. Phone accuracy: 87%." },
  { q: "Can I cancel anytime?", a: "Yes. No contracts. Cancel with one click. Keep unused credits for 90 days." },
  { q: "What payment methods do you accept?", a: "UPI, Credit/Debit cards, Net Banking, Wallets. 100% secure. We never see your card details." },
];

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return <>{count.toLocaleString("en-IN")}{suffix}</>;
}

export default function Landing() {
  const [testIdx, setTestIdx] = useState(0);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setTestIdx((i) => (i + 1) % testimonials.length), 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[hsl(228,50%,8%)] text-[#F0F4FF]">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(10,15,30,0.8)] backdrop-blur-[20px]">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2.5 font-semibold tracking-tight">
            <div className="relative">
              <img src={logoWhite} alt="AutoClient AI" className="h-6 w-6" />
              <div className="absolute inset-0 blur-lg bg-[#5B5FEF]/30" />
            </div>
            <span className="text-gradient">AutoClient AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="text-[#8892B0] hover:text-white">Login</Button>
            </Link>
            <Link to="/search">
              <Button size="sm" className="gap-1.5 bg-[#5B5FEF] hover:bg-[#5B5FEF]/90 shadow-glow">
                Start Free — 25 Credits <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 mesh-gradient" />
        <div className="absolute inset-0 grid-pattern" />
        <div className="absolute top-20 left-1/4 w-64 h-64 bg-[#5B5FEF]/8 rounded-full blur-[100px] animate-float" />
        <div className="absolute top-40 right-1/4 w-48 h-48 bg-[#A78BFA]/8 rounded-full blur-[80px] animate-float" style={{ animationDelay: "1.5s" }} />

        <div className="container relative py-28 md:py-40">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mx-auto max-w-3xl text-center">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#5B5FEF]/30 bg-[#5B5FEF]/10 px-4 py-1.5 text-xs font-medium text-[#5B5FEF] backdrop-blur-sm"
            >
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              Get 25 free credits — no card required
            </motion.div>
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight md:text-6xl lg:text-7xl">
              Indian Freelancers Are Making
              <br />
              <span className="text-gradient">₹2.4 Lakhs Extra</span>
              <br />
              This Month
            </h1>
            <p className="mb-10 text-lg text-[#8892B0] md:text-xl max-w-2xl mx-auto">
              While you're cold-calling 50 leads, AI is finding you
              <span className="font-semibold text-[#F0F4FF]"> 500 perfect clients</span>.
              Ready or not, the game changed.
            </p>

            {/* Live counters */}
            <div className="flex flex-wrap items-center justify-center gap-6 mb-10 text-sm">
              <span className="flex items-center gap-1.5"><span className="text-[#F59E0B]">🔥</span> <span className="font-mono font-bold text-[#F0F4FF]"><AnimatedCounter target={12847} /></span> <span className="text-[#8892B0]">leads found today</span></span>
              <span className="flex items-center gap-1.5"><span className="text-[#F59E0B]">💰</span> <span className="font-mono font-bold text-[#F0F4FF]">₹<AnimatedCounter target={142} /> Cr</span> <span className="text-[#8892B0]">revenue unlocked</span></span>
              <span className="flex items-center gap-1.5"><span className="text-[#F59E0B]">⚡</span> <span className="font-mono font-bold text-[#F0F4FF]"><AnimatedCounter target={247} /></span> <span className="text-[#8892B0]">joined today</span></span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/search">
                <Button size="lg" className="h-14 gap-2 px-10 text-base bg-gradient-to-r from-[#5B5FEF] to-[#7C3AED] hover:brightness-110 shadow-glow-lg animate-glow-pulse">
                  Start Free — Get 25 Credits
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/upgrade">
                <Button variant="outline" size="lg" className="h-14 gap-2 px-8 text-base border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)]">
                  See How It Works
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-xs text-[#8892B0] flex items-center justify-center gap-3 flex-wrap">
              <span>⭐ 4.8/5 from 1,847 users</span>
              <span>🔒 Bank-grade security</span>
              <span>✓ No credit card for trial</span>
            </p>
          </motion.div>
        </div>
      </section>

      <LiveActivity />

      {/* ── LOSS AVERSION (Pain Points) ── */}
      <section className="container py-28">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mx-auto mb-16 max-w-lg text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
            The Painful Truth About <span className="text-destructive">Manual Client Hunting</span>
          </h2>
          <p className="text-[#8892B0]">Every day without a system, you're bleeding revenue.</p>
        </motion.div>
        <div className="grid gap-6 md:grid-cols-3">
          {painPoints.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="glass-card p-7 border-destructive/15 hover:border-destructive/30 transition-all duration-300"
            >
              <div className="mb-4 inline-flex rounded-xl bg-destructive/10 p-3">
                <p.icon className="h-5 w-5 text-destructive" />
              </div>
              <h3 className="mb-1 font-bold text-lg">{p.title}</h3>
              <p className="text-2xl font-bold font-mono text-destructive mb-2">{p.stat}</p>
              <p className="text-sm leading-relaxed text-[#8892B0]">{p.description}</p>
            </motion.div>
          ))}
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10 text-lg font-semibold text-[#F0F4FF]"
        >
          "Every day you wait, someone else is closing <span className="text-destructive">YOUR</span> clients"
        </motion.p>
        <div className="text-center mt-6">
          <Link to="/search">
            <Button className="gap-2 bg-destructive hover:bg-destructive/90">
              I'm Ready to Stop Losing <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ── BEFORE/AFTER ── */}
      <section className="border-y border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] py-28">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mx-auto mb-16 max-w-lg text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
              What If You Had An <span className="text-gradient">Unfair Advantage</span>?
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="glass-card p-7 opacity-60 border-destructive/15">
              <h3 className="text-sm font-bold text-destructive mb-4 uppercase tracking-wider">❌ Without AutoClient AI</h3>
              {["Manually search Google for 2 hours", "Find 5-10 outdated leads", "Guess email addresses", "Send generic pitches", "2% reply rate", "Close 1 client every 2 months", "Make ₹30-50K/month"].map((t) => (
                <p key={t} className="text-sm text-[#8892B0] flex items-center gap-2 py-1.5"><X className="h-4 w-4 text-destructive shrink-0" /> {t}</p>
              ))}
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="glass-card p-7 border-success/20">
              <h3 className="text-sm font-bold text-success mb-4 uppercase tracking-wider">✅ With AutoClient AI</h3>
              {["AI finds 50 perfect leads in 5 minutes", "Get verified emails & phone numbers", "AI writes personalized pitches", "Intelligence reports show how to win", "23% reply rate (11.5× better)", "Close 3-5 clients per month", "Scale to ₹1-2L/month"].map((t) => (
                <p key={t} className="text-sm text-[#F0F4FF] flex items-center gap-2 py-1.5"><Check className="h-4 w-4 text-success shrink-0" /> {t}</p>
              ))}
            </motion.div>
          </div>
          <div className="text-center mt-8">
            <Link to="/search">
              <Button size="lg" className="gap-2 bg-gradient-to-r from-[#F59E0B] to-[#F97316] hover:brightness-110 text-black font-bold">
                Get My Unfair Advantage <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="container py-28">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mx-auto mb-16 max-w-lg text-center">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success border border-success/20">
            <Shield className="h-3.5 w-3.5" /> Simple Process
          </div>
          <h2 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
            From Zero to <span className="text-gradient">Client</span> in 3 Simple Steps
          </h2>
        </motion.div>
        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="glass-card p-8 hover:border-[rgba(255,255,255,0.15)] transition-all duration-300 group"
            >
              <div className="mb-1 section-label text-[#5B5FEF] font-mono">Step {i + 1}</div>
              <div className="mb-5 inline-flex rounded-xl bg-[#5B5FEF]/10 p-3 group-hover:bg-[#5B5FEF]/20 group-hover:shadow-glow transition-all duration-300">
                <s.icon className="h-6 w-6 text-[#5B5FEF]" />
              </div>
              <h3 className="mb-2 text-lg font-bold">{s.title}</h3>
              <p className="text-sm leading-relaxed text-[#8892B0] italic mb-3">"{s.description}"</p>
              <p className="text-xs text-[#5B5FEF] font-mono">⏱️ {s.time}</p>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link to="/search">
            <Button size="lg" className="gap-2 bg-gradient-to-r from-[#5B5FEF] to-[#7C3AED] hover:brightness-110 shadow-glow">
              Start Finding Clients Now <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ── SOCIAL PROOF ── */}
      <section className="border-y border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] py-28">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mx-auto mb-12 max-w-lg text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
              Join <span className="text-gradient">12,847</span> Indian Freelancers Winning
            </h2>
          </motion.div>

          {/* Testimonial carousel */}
          <div className="max-w-2xl mx-auto mb-10">
            <AnimatePresence mode="wait">
              <motion.div key={testIdx} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                className="glass-card p-8 text-center">
                <div className="flex items-center justify-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-[#F59E0B] text-[#F59E0B]" />)}
                </div>
                <blockquote className="mb-4 text-lg font-medium italic leading-relaxed">"{testimonials[testIdx].text}"</blockquote>
                <p className="text-sm"><span className="font-semibold text-[#F0F4FF]">{testimonials[testIdx].name}</span> — <span className="text-[#8892B0]">{testimonials[testIdx].city}</span></p>
              </motion.div>
            </AnimatePresence>
            <div className="flex justify-center gap-2 mt-4">
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => setTestIdx(i)} className={`h-2 rounded-full transition-all ${i === testIdx ? "w-8 bg-[#5B5FEF]" : "w-2 bg-[rgba(255,255,255,0.1)]"}`} />
              ))}
            </div>
          </div>

          {/* Stats banner */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            {[
              { label: "Average rating", value: "4.8/5", sub: "1,847 reviews" },
              { label: "Revenue unlocked", value: "₹142 Cr", sub: "total value" },
              { label: "Would recommend", value: "94%", sub: "to a friend" },
            ].map((s) => (
              <div key={s.label} className="glass-card p-4 text-center">
                <p className="text-2xl font-bold font-mono text-gradient">{s.value}</p>
                <p className="text-[11px] text-[#8892B0]">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING PREVIEW ── */}
      <section className="container py-28">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-3">
            Not a Cost. An <span className="text-gradient">Investment</span> With 95× ROI
          </h2>
          <p className="text-[#8892B0]">Plans starting at just ₹50/month — less than ₹2/day</p>
        </motion.div>
        <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
          {[
            { name: "Starter", price: "₹99", credits: "200 credits/mo", highlight: false },
            { name: "Pro", price: "₹299", credits: "600 credits/mo", highlight: true },
            { name: "Elite", price: "₹799", credits: "Unlimited", highlight: false },
          ].map((p) => (
            <div key={p.name} className={`glass-card p-6 text-center ${p.highlight ? "border-[#5B5FEF]/30 shadow-[0_0_30px_hsl(238,75%,64%,0.1)]" : ""}`}>
              {p.highlight && <p className="text-[10px] font-bold text-[#5B5FEF] mb-2">⭐ MOST POPULAR</p>}
              <h3 className="text-lg font-bold">{p.name}</h3>
              <p className="text-3xl font-bold font-mono mt-2">{p.price}<span className="text-sm text-[#8892B0]">/mo</span></p>
              <p className="text-xs text-[#8892B0] mt-1">{p.credits}</p>
            </div>
          ))}
        </div>
        <div className="text-center">
          <Link to="/upgrade">
            <Button size="lg" className="gap-2 bg-gradient-to-r from-[#5B5FEF] to-[#7C3AED] hover:brightness-110 shadow-glow">
              See Full Pricing <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <p className="text-xs text-[#8892B0] mt-3">🛡️ 60-day money-back guarantee • Cancel anytime</p>
        </div>
      </section>

      {/* ── FOMO AMPLIFIER ── */}
      <section className="border-y border-[rgba(255,255,255,0.06)] bg-gradient-to-br from-destructive/5 to-[#F59E0B]/5 py-20">
        <div className="container text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
            Your Competition <span className="text-destructive">Isn't Waiting</span>. Why Are You?
          </h2>
          <div className="flex flex-wrap justify-center gap-4 mb-6 text-sm text-[#8892B0]">
            <span>Mumbai: <span className="text-[#F0F4FF] font-bold">47</span> freelancers active</span>
            <span>Delhi: <span className="text-[#F0F4FF] font-bold">38</span> active</span>
            <span>Bangalore: <span className="text-[#F0F4FF] font-bold">52</span> active</span>
          </div>
          <p className="text-lg text-[#F0F4FF] font-medium mb-2">
            They found <span className="text-success font-bold">3,891 leads</span> today. You found: <span className="text-destructive font-bold">0</span>
          </p>
          <p className="text-[#8892B0] mb-8 italic">
            "While you're 'thinking about it', someone else just contacted YOUR perfect client."
          </p>
          <Link to="/search">
            <Button size="lg" className="gap-2 bg-destructive hover:bg-destructive/90 text-white font-bold">
              No More Waiting — Start Now <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="container py-28">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mx-auto mb-12 max-w-lg text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Questions? We've Got Answers.</h2>
        </motion.div>
        <div className="max-w-2xl mx-auto space-y-2">
          {faq.map((item, i) => (
            <div key={i} className="glass-card rounded-xl overflow-hidden">
              <button onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                <span className="text-sm font-medium">{item.q}</span>
                {faqOpen === i ? <ChevronUp className="h-4 w-4 text-[#8892B0] shrink-0" /> : <ChevronDown className="h-4 w-4 text-[#8892B0] shrink-0" />}
              </button>
              <AnimatePresence>
                {faqOpen === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <p className="px-4 pb-4 text-sm text-[#8892B0]">{item.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="container pb-28">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#5B5FEF] via-[#7C3AED] to-[#5B5FEF] p-14 text-center md:p-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent)]" />
          <div className="absolute inset-0 grid-pattern opacity-20" />
          <div className="relative">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-white md:text-5xl">
              Ready to 10× Your Client Pipeline?
            </h2>
            <p className="mb-6 text-lg text-white/80 max-w-xl mx-auto">
              Join 12,847 Indian freelancers who stopped struggling and started winning.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
              <Link to="/search">
                <Button variant="secondary" size="lg" className="h-14 gap-2 px-10 text-base font-bold shadow-lg animate-glow-pulse">
                  Start Free — 25 Credits <ChevronRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/upgrade">
                <Button size="lg" className="h-14 gap-2 px-8 text-base bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-black font-bold">
                  Upgrade to Pro — 40% Off <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-white/80">
              <span>✓ No credit card required</span>
              <span>✓ Setup in 5 minutes</span>
              <span>✓ Cancel anytime</span>
              <span>✓ 60-day guarantee</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[rgba(255,255,255,0.06)] py-8">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8892B0]">
          <div className="flex items-center gap-2">
            <img src={logoWhite} alt="AutoClient AI" className="h-4 w-4" />
            <span className="font-mono">AutoClient AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
          <span>Made with ❤️ for Indian Freelancers 🇮🇳</span>
        </div>
      </footer>
    </div>
  );
}
