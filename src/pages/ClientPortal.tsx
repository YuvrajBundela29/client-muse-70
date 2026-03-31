import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Send, CheckCircle2, Globe, Star, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { z } from "zod";

const responseSchema = z.object({
  respondent_name: z.string().trim().min(1, "Name is required").max(100),
  respondent_email: z.string().trim().email("Invalid email").max(255),
  message: z.string().trim().min(1, "Message is required").max(2000),
  interest_level: z.enum(["interested", "maybe", "not_interested"]),
});

interface PortalData {
  id: string;
  message: string | null;
  is_active: boolean;
  freelancer_name: string;
  freelancer_service: string | null;
  lead_name: string;
  lead_industry: string;
  lead_city: string;
  recommended_service: string | null;
  website_problem: string | null;
  growth_opportunity: string | null;
}

export default function ClientPortal() {
  const { token } = useParams<{ token: string }>();
  const [portal, setPortal] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({
    respondent_name: "",
    respondent_email: "",
    message: "",
    interest_level: "interested" as "interested" | "maybe" | "not_interested",
  });

  useEffect(() => {
    if (!token) return;
    loadPortal();
  }, [token]);

  const loadPortal = async () => {
    const { data: link, error } = await supabase
      .from("client_portal_links")
      .select("id, message, is_active, user_id, lead_id")
      .eq("token", token)
      .eq("is_active", true)
      .single();

    if (error || !link) {
      setLoading(false);
      return;
    }

    // Get freelancer info
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, service")
      .eq("id", link.user_id)
      .single();

    // Get lead info
    const { data: lead } = await supabase
      .from("leads")
      .select("business_name, industry, city, recommended_service, website_problem, growth_opportunity")
      .eq("id", link.lead_id)
      .single();

    setPortal({
      id: link.id,
      message: link.message,
      is_active: link.is_active,
      freelancer_name: profile?.full_name || "A Freelancer",
      freelancer_service: profile?.service || null,
      lead_name: lead?.business_name || "Your Business",
      lead_industry: lead?.industry || "",
      lead_city: lead?.city || "",
      recommended_service: lead?.recommended_service || null,
      website_problem: lead?.website_problem || null,
      growth_opportunity: lead?.growth_opportunity || null,
    });
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = responseSchema.safeParse(form);
    if (!parsed.success) {
      const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
      toast.error(firstError || "Invalid input");
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase.from("client_responses").insert({
        portal_link_id: portal!.id,
        ...parsed.data,
      });
      if (error) throw error;
      setSubmitted(true);
      toast.success("Response sent successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to send response");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!portal) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center p-6">
        <Shield className="h-12 w-12 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Link Expired or Invalid</h1>
        <p className="text-muted-foreground mb-6">This portal link is no longer active.</p>
        <Link to="/">
          <Button>Visit AutoClient AI</Button>
        </Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center p-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
          <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
        </motion.div>
        <h1 className="text-2xl font-bold mb-2">Response Sent!</h1>
        <p className="text-muted-foreground mb-6">
          {portal.freelancer_name} will get back to you shortly.
        </p>
        <p className="text-xs text-muted-foreground">Powered by AutoClient AI</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container flex h-14 items-center justify-between">
          <span className="text-sm font-semibold text-gradient">AutoClient AI</span>
          <span className="text-xs text-muted-foreground">Client Portal</span>
        </div>
      </header>

      <div className="container max-w-2xl py-12 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Proposal header */}
          <div className="glass-card p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Proposal for {portal.lead_name}</h1>
                <p className="text-xs text-muted-foreground">From {portal.freelancer_name}</p>
              </div>
            </div>

            {portal.message && (
              <div className="mb-4 p-4 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-sm leading-relaxed">{portal.message}</p>
              </div>
            )}

            {/* AI insights */}
            <div className="grid gap-3">
              {portal.recommended_service && (
                <div className="flex items-start gap-2">
                  <Star className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-primary">Recommended Service</p>
                    <p className="text-sm text-muted-foreground">{portal.recommended_service}</p>
                  </div>
                </div>
              )}
              {portal.growth_opportunity && (
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-success">Growth Opportunity</p>
                    <p className="text-sm text-muted-foreground">{portal.growth_opportunity}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Response form */}
          <div className="glass-card p-6">
            <h2 className="text-base font-semibold mb-4">Your Response</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Your Name *</label>
                  <Input
                    value={form.respondent_name}
                    onChange={(e) => setForm({ ...form, respondent_name: e.target.value })}
                    placeholder="John Doe"
                    className="glass-input"
                    maxLength={100}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Email *</label>
                  <Input
                    type="email"
                    value={form.respondent_email}
                    onChange={(e) => setForm({ ...form, respondent_email: e.target.value })}
                    placeholder="john@example.com"
                    className="glass-input"
                    maxLength={255}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Interest Level</label>
                <div className="flex gap-2">
                  {[
                    { key: "interested", label: "Interested", color: "bg-success/10 text-success border-success/20" },
                    { key: "maybe", label: "Maybe Later", color: "bg-warning/10 text-warning border-warning/20" },
                    { key: "not_interested", label: "Not Now", color: "bg-muted text-muted-foreground border-border" },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setForm({ ...form, interest_level: opt.key as any })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        form.interest_level === opt.key ? opt.color : "bg-transparent text-muted-foreground border-border"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Your Message *</label>
                <Textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="I'd love to learn more about how you can help..."
                  className="glass-input min-h-[100px]"
                  maxLength={2000}
                  required
                />
              </div>

              <Button type="submit" className="w-full gap-2" disabled={sending}>
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Send Response
              </Button>
            </form>
          </div>

          <p className="text-center text-[10px] text-muted-foreground mt-6">
            Powered by <Link to="/" className="text-primary hover:underline">AutoClient AI</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
