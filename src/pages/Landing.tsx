import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Crosshair, Search, Globe, MessageSquare, ArrowRight, Zap, Target, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Search,
    title: "Auto-Discovery",
    description: "Search Google Maps and the web to find businesses in any niche and location.",
  },
  {
    icon: Globe,
    title: "Website Analysis",
    description: "AI scans each business website to detect marketing gaps and opportunities.",
  },
  {
    icon: MessageSquare,
    title: "Outreach Messages",
    description: "Generate personalized cold outreach that references real problems you can solve.",
  },
];

const stats = [
  { value: "20+", label: "Leads per search" },
  { value: "< 60s", label: "Analysis time" },
  { value: "3x", label: "Reply rate vs generic" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2 font-semibold tracking-tight">
            <Crosshair className="h-5 w-5 text-primary" />
            <span>AI Client Hunter</span>
          </div>
          <Link to="/finder">
            <Button size="sm">Start Finding Clients</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="container py-24 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Zap className="h-3 w-3" />
            AI-Powered Lead Generation
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
            Find clients.
            <br />
            <span className="text-primary">Close deals.</span>
          </h1>
          <p className="mb-8 text-lg text-muted-foreground">
            Automatically discover businesses, analyze their marketing weaknesses, and generate personalized outreach — all in one search.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link to="/finder">
              <Button size="lg" className="gap-2">
                Start Finding Clients
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="border-y bg-muted/30">
        <div className="container grid grid-cols-3 divide-x py-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="container py-20">
        <div className="mx-auto mb-12 max-w-md text-center">
          <h2 className="mb-2 text-2xl font-bold tracking-tight">How it works</h2>
          <p className="text-muted-foreground">Three steps from search to signed client.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="rounded-lg bg-card p-6 shadow-card transition-shadow hover:shadow-card-hover"
            >
              <div className="mb-3 inline-flex rounded-md bg-primary/10 p-2">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mb-1 font-semibold tracking-tight">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-20">
        <div className="rounded-lg bg-primary p-12 text-center text-primary-foreground">
          <Target className="mx-auto mb-4 h-8 w-8" />
          <h2 className="mb-2 text-2xl font-bold tracking-tight">Ready to hunt?</h2>
          <p className="mb-6 text-primary-foreground/80">
            Stop cold-emailing blindly. Start with data.
          </p>
          <Link to="/finder">
            <Button variant="secondary" size="lg" className="gap-2">
              Launch Finder
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Crosshair className="h-3.5 w-3.5" />
            AI Client Hunter
          </div>
          <span>Built for agencies & freelancers</span>
        </div>
      </footer>
    </div>
  );
}
