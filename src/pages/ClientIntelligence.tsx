import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Crosshair, ArrowLeft, Mail, Globe, Phone, MapPin, Star, Copy,
  CheckCircle2, Send, Loader2, MessageSquare, Clock, Zap, Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Lead } from "@/types/lead";
import { enrichLead } from "@/lib/enrich-lead";
import { EnrichedLead } from "@/types/lead";
import { fetchPipeline, upsertPipelineEntry, PipelineWithLead } from "@/lib/pipeline-api";
import { detectServiceTrack, getTrackLabel, getTrackEmoji } from "@/lib/service-tracks";
import { SERVICE_TRACKS, getRecommendedPackage } from "@/lib/pricing";
import { ConfidenceArc } from "@/components/results/ConfidenceArc";
import { AuditBars } from "@/components/results/AuditBars";
import { useCredits, CREDIT_COSTS } from "@/hooks/useCredits";

export default function ClientIntelligence() {
  const { id } = useParams<{ id: string }>();
  const [lead, setLead] = useState<Lead | null>(null);
  const [enriched, setEnriched] = useState<EnrichedLead | null>(null);
  const [pipeline, setPipeline] = useState<PipelineWithLead | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingEmail, setGeneratingEmail] = useState(false);
  const [emailVariants, setEmailVariants] = useState<{ professional: string; friendly: string; aggressive: string } | null>(null);
  const [replyText, setReplyText] = useState("");
  const [classifyingReply, setClassifyingReply] = useState(false);
  const [replyResult, setReplyResult] = useState<{ classification: string; suggestedReply: string } | null>(null);
  const { deductCredits, canAfford, credits } = useCredits();

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      setLoading(true);
      try {
        const { data: leadData, error } = await supabase.from("leads").select("*").eq("id", id).single();
        if (error) throw new Error(error.message);
        const l = leadData as unknown as Lead;
        setLead(l);
        setEnriched(enrichLead(l));
        const pipelineData = await fetchPipeline();
        const entry = pipelineData.find((p) => p.lead_id === id);
        setPipeline(entry || null);
        if (!entry) {
          const track = detectServiceTrack(l.industry, l.growth_opportunity);
          await upsertPipelineEntry(l.id, { pipeline_status: "not_contacted", service_track: track });
        }
      } catch (err: any) { toast.error(err.message); }
      finally { setLoading(false); }
    }
    loadData();
  }, [id]);

  const serviceTrack = lead ? detectServiceTrack(lead.industry, lead.growth_opportunity) : null;
  const trackData = serviceTrack ? SERVICE_TRACKS[serviceTrack] : null;
  const recommendedPkg = enriched ? getRecommendedPackage(enriched.confidence_score) : "Starter";

  const handleGenerateEmail = async () => {
    if (!lead) return;
    if (!canAfford("ai_email")) {
      toast.error(`Not enough credits. AI email costs ${CREDIT_COSTS.ai_email} credits.`, {
        action: { label: "Buy Credits", onClick: () => window.location.href = "/upgrade" },
      });
      return;
    }
    setGeneratingEmail(true);
    try {
      const ok = await deductCredits("ai_email");
      if (!ok) { setGeneratingEmail(false); return; }
      const { data, error } = await supabase.functions.invoke("analyze-client", { body: { lead_id: lead.id } });
      if (error) throw new Error(error.message);
      if (data?.emails) { setEmailVariants(data.emails); toast.success("AI emails generated! (2 credits used)"); }
    } catch (err: any) { toast.error(err.message || "Failed to generate emails"); }
    finally { setGeneratingEmail(false); }
  };

  const handleClassifyReply = async () => {
    if (!replyText.trim() || !lead) return;
    if (!canAfford("ai_email")) {
      toast.error(`Not enough credits. Reply classification costs ${CREDIT_COSTS.ai_email} credits.`);
      return;
    }
    setClassifyingReply(true);
    try {
      const ok = await deductCredits("ai_email");
      if (!ok) { setClassifyingReply(false); return; }
      const { data, error } = await supabase.functions.invoke("classify-reply", {
        body: { reply_text: replyText, lead_context: { business_name: lead.business_name, industry: lead.industry } },
      });
      if (error) throw new Error(error.message);
      setReplyResult(data);
      toast.success("Reply classified! (2 credits used)");
    } catch (err: any) { toast.error(err.message || "Failed to classify reply"); }
    finally { setClassifyingReply(false); }
  };

  const copyToClipboard = (text: string) => { navigator.clipboard.writeText(text); toast.success("Copied to clipboard!"); };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div className="absolute inset-0 blur-xl bg-primary/20" />
        </div>
      </div>
    );
  }

  if (!lead || !enriched) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Lead not found</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <Link to="/pipeline" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mb-2">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Pipeline
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <div className="relative">
              <Zap className="h-5 w-5 text-primary" />
              <div className="absolute inset-0 blur-md bg-primary/30" />
            </div>
            {lead.business_name}
          </h1>
        </div>
      </motion.div>

      {/* Client Brief */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card className="glass border-border/50 hover:border-primary/20 transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent" />
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 font-mono uppercase tracking-wider text-sm">
              📋 Client Brief
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{lead.city}</span>
                </div>
                {lead.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a href={lead.website} target="_blank" rel="noopener" className="text-sm text-primary hover:underline truncate">{lead.website}</a>
                  </div>
                )}
                {lead.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-mono">{lead.email}</span>
                  </div>
                )}
                {lead.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-mono">{lead.phone}</span>
                  </div>
                )}
                {lead.google_rating && (
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-warning" />
                    <span className="text-sm">{lead.google_rating}/5</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col items-center gap-2">
                <ConfidenceArc score={enriched.confidence_score} size={100} />
                <Badge className={`${enriched.urgency === "high" ? "bg-destructive/15 text-destructive border-destructive/30" : enriched.urgency === "medium" ? "bg-warning/15 text-warning border-warning/30" : "bg-muted text-muted-foreground border-border"}`}>
                  {enriched.urgency.toUpperCase()} URGENCY
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Intent Signal</p>
                <p className="text-sm font-medium">{enriched.intent_signal}</p>
                <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider mt-2">Why this match?</p>
                <p className="text-sm">{enriched.why_match}</p>
              </div>
            </div>

            {lead.website_problem && (
              <div className="rounded-xl bg-destructive/5 border border-destructive/20 p-4">
                <p className="text-[10px] font-semibold text-destructive mb-1 font-mono uppercase tracking-wider">Pain Point Detected</p>
                <p className="text-sm">{lead.website_problem}</p>
              </div>
            )}
            {lead.growth_opportunity && (
              <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
                <p className="text-[10px] font-semibold text-primary mb-1 font-mono uppercase tracking-wider">Growth Opportunity</p>
                <p className="text-sm">{lead.growth_opportunity}</p>
              </div>
            )}

            <div>
              <p className="text-[10px] font-semibold text-muted-foreground mb-2 font-mono uppercase tracking-wider">AI Audit Snapshot</p>
              <AuditBars ux={enriched.audit_ux} seo={enriched.audit_seo} speed={enriched.audit_speed} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Service Track */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="glass border-border/50 hover:border-primary/20 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-sm font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              🎯 Service Track Detection
            </CardTitle>
          </CardHeader>
          <CardContent>
            {serviceTrack && trackData ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getTrackEmoji(serviceTrack)}</span>
                  <div>
                    <p className="font-semibold">{getTrackLabel(serviceTrack)}</p>
                    <p className="text-sm text-muted-foreground">{trackData.description}</p>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {trackData.packages.map((pkg) => (
                    <div
                      key={pkg.name}
                      className={`rounded-xl border p-4 transition-all duration-300 ${
                        pkg.name === recommendedPkg
                          ? "border-primary/40 bg-primary/5 glow-border"
                          : "border-border/50 glass hover:border-primary/20"
                      }`}
                    >
                      {pkg.name === recommendedPkg && (
                        <Badge className="mb-2 bg-primary/15 text-primary text-[10px] border border-primary/30">Recommended</Badge>
                      )}
                      <p className="font-semibold text-sm">{pkg.name}</p>
                      <p className="text-xl font-bold text-primary mt-1 font-mono">${pkg.price.toLocaleString()}</p>
                      <ul className="mt-2 space-y-1">
                        {pkg.features.map((f) => (
                          <li key={f} className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-success flex-shrink-0" /> {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No track auto-detected for industry "{lead.industry}". You can manually assign one.
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* AI Email Construction */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="glass border-border/50 hover:border-primary/20 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-sm font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              ✉️ AI Email Construction
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleGenerateEmail} disabled={generatingEmail} className="gap-2 shadow-glow">
              {generatingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {generatingEmail ? "AI is researching & writing..." : "Generate Personalized Emails"}
            </Button>

            {emailVariants && (
              <div className="grid gap-4 md:grid-cols-3">
                {(["professional", "friendly", "aggressive"] as const).map((tone) => (
                  <div key={tone} className="rounded-xl glass border-border/50 p-4 hover:border-primary/20 transition-all duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-[10px] capitalize font-mono">{tone}</Badge>
                      <Button size="sm" variant="ghost" onClick={() => copyToClipboard(emailVariants[tone])} className="h-7 w-7 p-0 hover:text-primary">
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <p className="text-xs whitespace-pre-wrap leading-relaxed">{emailVariants[tone]}</p>
                  </div>
                ))}
              </div>
            )}

            {!emailVariants && lead.outreach_message && (
              <div className="rounded-xl glass border-border/50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-semibold text-muted-foreground font-mono uppercase tracking-wider">Existing Outreach Message</p>
                  <Button size="sm" variant="ghost" onClick={() => copyToClipboard(lead.outreach_message!)} className="h-7 w-7 p-0 hover:text-primary">
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <p className="text-sm whitespace-pre-wrap">{lead.outreach_message}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Reply Handler */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="glass border-border/50 hover:border-primary/20 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-sm font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              💬 Reply Handler
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste the client's reply here..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={4}
              className="glass border-border/50 focus:border-primary/50"
            />
            <Button onClick={handleClassifyReply} disabled={classifyingReply || !replyText.trim()} className="gap-2 shadow-glow">
              {classifyingReply ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
              {classifyingReply ? "Classifying..." : "Classify & Generate Response"}
            </Button>

            {replyResult && (
              <div className="space-y-3">
                <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
                  <p className="text-[10px] font-semibold text-primary mb-1 font-mono uppercase tracking-wider">Classification</p>
                  <p className="text-sm font-semibold">{replyResult.classification}</p>
                </div>
                <div className="rounded-xl glass border-border/50 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-semibold text-muted-foreground font-mono uppercase tracking-wider">Suggested Response</p>
                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(replyResult.suggestedReply)} className="h-7 w-7 p-0 hover:text-primary">
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{replyResult.suggestedReply}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
