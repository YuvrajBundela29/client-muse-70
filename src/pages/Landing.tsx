import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Crosshair, ArrowRight, Zap, Clock, Mail, TrendingDown,
  Search, Brain, Users, Shield, Star, ChevronRight,
} from "lucide-react";
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
    <div className="dark min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2 font-bold tracking-tight">
            <Crosshair className="h-5 w-5 text-primary" />
            <span>Client Muse</span>
          </div>
          <Link to="/search">
            <Button size="sm" className="gap-1.5">
              Start Free <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="container relative py-24 md:py-36">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
              <Zap className="h-3.5 w-3.5" />
              Free for your first 10 searches — no card required
            </div>
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight md:text-6xl">
              Your competitors are
              <br />
              <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                stealing your clients
              </span>
              <br />
              right now.
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              While you manually research prospects, they're using AI to find businesses
              with <span className="font-semibold text-foreground">real problems they can solve</span> — and closing deals before you even send your first email.
            </p>
            <Link to="/search">
              <Button size="lg" className="h-14 gap-2 px-10 text-base shadow-lg shadow-primary/25">
                Find My Clients Now
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <p className="mt-4 text-xs text-muted-foreground">
              No signup needed · Results in 60 seconds · Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>

      {/* Live counter bar */}
      <section className="border-y border-border/50 bg-card/50">
        <div className="container grid grid-cols-3 divide-x divide-border/50 py-8">
          {[
            { target: 10847, suffix: "+", label: "Leads discovered" },
            { target: 2413, suffix: "+", label: "Agencies using this" },
            { target: 437, suffix: "", label: "Found clients today" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-bold tracking-tight md:text-3xl">
                <AnimatedCounter target={s.target} suffix={s.suffix} />
              </div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pain points */}
      <section className="container py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-16 max-w-lg text-center"
        >
          <h2 className="mb-3 text-3xl font-bold tracking-tight">
            This is costing you <span className="text-destructive">thousands</span> every month
          </h2>
          <p className="text-muted-foreground">
            Every day without a system, you're bleeding revenue. Here's what's really happening:
          </p>
        </motion.div>
        <div className="grid gap-6 md:grid-cols-3">
          {painPoints.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl border border-destructive/20 bg-destructive/5 p-6"
            >
              <div className="mb-3 inline-flex rounded-lg bg-destructive/10 p-2.5">
                <p.icon className="h-5 w-5 text-destructive" />
              </div>
              <h3 className="mb-2 font-bold">{p.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{p.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Solution — 3 steps */}
      <section className="border-y border-border/50 bg-card/30 py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto mb-16 max-w-lg text-center"
          >
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-[hsl(var(--success))]">
              <Shield className="h-3.5 w-3.5" /> The Solution
            </div>
            <h2 className="mb-3 text-3xl font-bold tracking-tight">
              From zero to <span className="text-primary">client-ready</span> in 60 seconds
            </h2>
            <p className="text-muted-foreground">
              Three steps. No learning curve. Just results.
            </p>
          </motion.div>
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative rounded-xl border border-border bg-card p-8 shadow-[var(--shadow-card)]"
              >
                <div className="mb-1 text-xs font-bold uppercase tracking-widest text-primary">
                  Step {i + 1}
                </div>
                <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                  <s.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-bold">{s.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{s.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial / social proof */}
      <section className="container py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <div className="mb-6 flex items-center justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-[hsl(var(--warning))] text-[hsl(var(--warning))]" />
            ))}
          </div>
          <blockquote className="mb-6 text-xl font-medium italic leading-relaxed md:text-2xl">
            "I found 12 qualified leads in my first search and closed 2 of them within a week.
            This replaced my entire manual prospecting workflow."
          </blockquote>
          <div className="text-sm text-muted-foreground">
            — <span className="font-semibold text-foreground">Sarah K.</span>, Digital Marketing Agency Owner
          </div>
        </motion.div>
      </section>

      {/* Final CTA */}
      <section className="container pb-24">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-blue-700 p-12 text-center md:p-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)]" />
          <div className="relative">
            <h2 className="mb-3 text-3xl font-bold tracking-tight text-primary-foreground md:text-4xl">
              Stop losing clients to faster competitors
            </h2>
            <p className="mb-8 text-lg text-primary-foreground/80">
              Your next 10 searches are free. No credit card. No signup. Just results.
            </p>
            <Link to="/search">
              <Button variant="secondary" size="lg" className="h-14 gap-2 px-10 text-base font-bold">
                Start Finding Clients
                <ChevronRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Crosshair className="h-3.5 w-3.5" />
            Client Muse
          </div>
          <span>Built for agencies & freelancers who want to grow</span>
        </div>
      </footer>
    </div>
  );
}
