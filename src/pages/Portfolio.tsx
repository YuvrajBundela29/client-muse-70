import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Globe, Mail, Star, Zap, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface PortfolioData {
  full_name: string;
  email: string | null;
  industry: string | null;
  service: string | null;
  country: string | null;
  avatar_url: string | null;
  plan: string;
  created_at: string;
}

export default function Portfolio() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<PortfolioData | null>(null);
  const [stats, setStats] = useState({ leads: 0, closed: 0 });
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadPortfolio();
  }, [id]);

  const loadPortfolio = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, email, industry, service, country, avatar_url, plan, created_at")
      .eq("id", id)
      .eq("onboarding_complete", true)
      .single();

    if (error || !data) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setProfile(data as PortfolioData);

    // Get public stats
    const { count: leadCount } = await supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("user_id", id);

    const { count: closedCount } = await supabase
      .from("client_pipeline")
      .select("id", { count: "exact", head: true })
      .eq("user_id", id)
      .eq("pipeline_status", "closed");

    setStats({ leads: leadCount || 0, closed: closedCount || 0 });
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center p-6">
        <h1 className="text-2xl font-bold mb-2">Portfolio Not Found</h1>
        <p className="text-muted-foreground mb-6">This freelancer hasn't set up their public profile yet.</p>
        <Link to="/">
          <Button>Go Home</Button>
        </Link>
      </div>
    );
  }

  const initials = (profile.full_name || "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const memberSince = new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/" className="text-sm font-semibold text-gradient">AutoClient AI</Link>
          <Link to="/auth">
            <Button size="sm" variant="outline" className="text-xs">Join AutoClient AI</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 mesh-gradient" />
        <div className="container relative py-16 md:py-24 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mx-auto mb-6 h-24 w-24 rounded-2xl bg-primary/20 flex items-center justify-center text-3xl font-bold text-primary border-2 border-primary/30">
              {initials}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{profile.full_name}</h1>
            <p className="text-lg text-muted-foreground mb-4">
              {profile.service || "Freelancer"} {profile.industry ? `· ${profile.industry}` : ""}
            </p>
            {profile.country && (
              <p className="text-sm text-muted-foreground mb-6">📍 {profile.country}</p>
            )}

            {/* Stats */}
            <div className="flex items-center justify-center gap-6 mb-8">
              <div className="text-center">
                <p className="text-2xl font-bold font-mono text-primary">{stats.leads}</p>
                <p className="text-xs text-muted-foreground">Leads Found</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <p className="text-2xl font-bold font-mono text-success">{stats.closed}</p>
                <p className="text-xs text-muted-foreground">Deals Closed</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <p className="text-2xl font-bold font-mono text-amber-400">{memberSince}</p>
                <p className="text-xs text-muted-foreground">Member Since</p>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
              {profile.plan !== "free" && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-medium border border-amber-500/20">
                  <Star className="h-3 w-3" /> {profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1)} Member
                </span>
              )}
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                <Zap className="h-3 w-3" /> Verified on AutoClient AI
              </span>
              {stats.closed >= 5 && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-success/10 text-success text-xs font-medium border border-success/20">
                  <CheckCircle2 className="h-3 w-3" /> Top Closer
                </span>
              )}
            </div>

            {/* CTA */}
            {profile.email && (
              <a href={`mailto:${profile.email}`}>
                <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90">
                  <Mail className="h-4 w-4" /> Contact {profile.full_name?.split(" ")[0]}
                </Button>
              </a>
            )}
          </motion.div>
        </div>
      </div>

      {/* Services */}
      <div className="container py-16">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-bold mb-6 text-center">What I Do</h2>
          <div className="glass-card p-8 text-center">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 mb-4">
              <Globe className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{profile.service || "Digital Services"}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Specializing in {profile.industry || "various industries"} {profile.country ? `based in ${profile.country}` : ""}
            </p>
            <p className="text-xs text-muted-foreground">
              Using AI-powered tools to find and close the perfect clients
            </p>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="border-t border-border py-12 text-center bg-card/30">
        <h3 className="text-lg font-semibold mb-2">Want a profile like this?</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Join AutoClient AI and find your next clients with AI
        </p>
        <Link to="/auth">
          <Button className="gap-2">
            Get Started Free <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
