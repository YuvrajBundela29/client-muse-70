import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, Zap, Clock, Mail, TrendingDown,
  Search, Brain, Users, Shield, Star, ChevronRight, Sparkles,
} from "lucide-react";
import logoWhite from "@/assets/logo-white.png";
import { LiveActivity } from "@/components/landing/LiveActivity";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const painPoints = [
  {
    icon: Clock,
    title: "Wasting 5+ Hours on Manual Research",
    description: "You're Googling businesses one by one, copy-pasting into spreadsheets, while your competitors use AI to find 50 leads in 60 seconds.",
  },
  {
    icon: Mail,
    title: "Sending Generic Cold Emails That Get Ignored",
    description: "Your outreach sounds like everyone else's. No personalization, no insight into their actual problems. Straight to spam.",
  },
  {
    icon: TrendingDown,
    title: "Losing Deals to Faster Competitors",
    description: "By the time you find a prospect and craft a message, someone else already closed them. Speed wins in client acquisition.",
  },
];

const steps = [
  { icon: Search, title: "Enter Your Niche", description: "Tell us your industry, target location, and service. Takes 10 seconds." },
  { icon: Brain, title: "AI Researches Everything", description: "We scan Google Maps, scrape websites, and analyze marketing gaps with AI." },
  { icon: Users, title: "Get Ready-to-Close Clients", description: "Receive a list of businesses with problems you can solve — plus personalized outreach." },
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
  return <>{count.toLocaleString()}{suffix}</>;
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-[hsl(228,50%,8%)] text-[#F0F4FF]">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(10,15,30,0.8)] backdrop-blur-[20px]">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2.5 font-semibold tracking-tight">
            <div className="relative">
              <img src={logoWhite} alt="Client Muse" className="h-6 w-6" />
              <div className="absolute inset-0 blur-lg bg-[#5B5FEF]/30" />
            </div>
            <span className="text-gradient">Client Muse</span>
          </div>
          <Link to="/search">
            <Button size="sm" className="gap-1.5 bg-[#5B5FEF] hover:bg-[#5B5FEF]/90 shadow-glow">
              Start Free <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 mesh-gradient" />
        <div className="absolute inset-0 grid-pattern" />
        <div className="absolute top-20 left-1/4 w-64 h-64 bg-[#5B5FEF]/8 rounded-full blur-[100px] animate-float" />
        <div className="absolute top-40 right-1/4 w-48 h-48 bg-[#A78BFA]/8 rounded-full blur-[80px] animate-float" style={{ animationDelay: "1.5s" }} />
        
        <div className="container relative py-28 md:py-40">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mx-auto max-w-3xl text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#5B5FEF]/30 bg-[#5B5FEF]/10 px-4 py-1.5 text-xs font-medium text-[#5B5FEF] backdrop-blur-sm"
            >
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              Free for your first 10 searches — no card required
            </motion.div>
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight md:text-6xl lg:text-7xl">
              Your competitors are
              <br />
              <span className="text-gradient">stealing your clients</span>
              <br />
              right now.
            </h1>
            <p className="mb-10 text-lg text-[#8892B0] md:text-xl max-w-2xl mx-auto">
              While you manually research prospects, they're using AI to find businesses
              with <span className="font-semibold text-[#F0F4FF]">real problems they can solve</span> — and closing deals before you even send your first email.
            </p>
            <Link to="/search">
              <Button size="lg" className="h-14 gap-2 px-10 text-base bg-gradient-to-r from-[#5B5FEF] to-[#7C3AED] hover:brightness-110 shadow-glow-lg animate-glow-pulse">
                Find My Clients Now
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <p className="mt-4 text-xs text-[#8892B0] font-mono">
              No signup needed · Results in 60 seconds · Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>

      <LiveActivity />

      {/* Counter bar */}
      <section className="border-y border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">
        <div className="container grid grid-cols-3 divide-x divide-[rgba(255,255,255,0.06)] py-10">
          {[
            { target: 10847, suffix: "+", label: "Leads discovered" },
            { target: 2413, suffix: "+", label: "Freelancers using this" },
            { target: 437, suffix: "", label: "Found clients today" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-bold tracking-tight md:text-4xl font-mono text-gradient">
                <AnimatedCounter target={s.target} suffix={s.suffix} />
              </div>
              <div className="text-sm text-[#8892B0] mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pain points */}
      <section className="container py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-16 max-w-lg text-center"
        >
          <h2 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
            This is costing you <span className="text-destructive">thousands</span> every month
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
              <h3 className="mb-2 font-bold text-lg">{p.title}</h3>
              <p className="text-sm leading-relaxed text-[#8892B0]">{p.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section className="border-y border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] py-28 relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-50" />
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto mb-16 max-w-lg text-center"
          >
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success border border-success/20">
              <Shield className="h-3.5 w-3.5" /> The Solution
            </div>
            <h2 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
              From zero to <span className="text-gradient">client-ready</span> in 60 seconds
            </h2>
            <p className="text-[#8892B0]">Three steps. No learning curve. Just results.</p>
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
                <p className="text-sm leading-relaxed text-[#8892B0]">{s.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="container py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <div className="mb-6 flex items-center justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-[#F59E0B] text-[#F59E0B]" />
            ))}
          </div>
          <blockquote className="mb-6 text-xl font-medium italic leading-relaxed md:text-2xl">
            "I found 12 qualified leads in my first search and closed 2 of them within a week.
            This replaced my entire manual prospecting workflow."
          </blockquote>
          <div className="text-sm text-[#8892B0]">
            — <span className="font-semibold text-[#F0F4FF]">Sarah K.</span>, Freelance Digital Marketer
          </div>
        </motion.div>
      </section>

      {/* Final CTA */}
      <section className="container pb-28">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#5B5FEF] via-[#7C3AED] to-[#5B5FEF] p-14 text-center md:p-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent)]" />
          <div className="absolute inset-0 grid-pattern opacity-20" />
          <div className="relative">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-white md:text-5xl">
              Stop losing clients to faster competitors
            </h2>
            <p className="mb-10 text-lg text-white/80 max-w-xl mx-auto">
              Your next 10 searches are free. No credit card. No signup. Just results.
            </p>
            <Link to="/search">
              <Button variant="secondary" size="lg" className="h-14 gap-2 px-10 text-base font-bold shadow-lg">
                Start Finding Clients
                <ChevronRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[rgba(255,255,255,0.06)] py-8">
        <div className="container flex items-center justify-between text-xs text-[#8892B0]">
          <div className="flex items-center gap-2">
            <img src={logoWhite} alt="Client Muse" className="h-4 w-4" />
            <span className="font-mono">Client Muse</span>
          </div>
          <span>Built for freelancers who want to grow</span>
        </div>
      </footer>
    </div>
  );
}
