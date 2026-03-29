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
import { fetchPipeline, upsertPipelineEntry, PipelineWithLead, fetchReels, findMatchingReel, ReelEntry } from "@/lib/pipeline-api";
import { detectServiceTrack, getTrackLabel, getTrackEmoji } from "@/lib/service-tracks";
import { SERVICE_TRACKS, getRecommendedPackage } from "@/lib/pricing";
import { ConfidenceArc } from "@/components/results/ConfidenceArc";
import { AuditBars } from "@/components/results/AuditBars";

export default function ClientIntelligence() {
  const { id } = useParams<{ id: string }>();
  const [lead, setLead] = useState<Lead | null>(null);
  const [enriched, setEnriched] = useState<EnrichedLead | null>(null);
  const [pipeline, setPipeline] = useState<PipelineWithLead | null>(null);
  const [reels, setReels] = useState<ReelEntry[]>([]);
  const [matchingReel, setMatchingReel] = useState<ReelEntry | null>(null);
  const [loading, setLoading] = useState(true);

  // AI email generation state
  const [generatingEmail, setGeneratingEmail] = useState(false);
  const [emailVariants, setEmailVariants] = useState<{ professional: string; friendly: string; aggressive: string } | null>(null);

  // Reply handler state
  const [replyText, setReplyText] = useState("");
  const [classifyingReply, setClassifyingReply] = useState(false);
  const [replyResult, setReplyResult] = useState<{ classification: string; suggestedReply: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      setLoading(true);
      try {
        // Fetch lead
        const { data: leadData, error } = await supabase
          .from("leads")
          .select("*")
          .eq("id", id)
          .single();
        if (error) throw new Error(error.message);
        const l = leadData as unknown as Lead;
        setLead(l);
        setEnriched(enrichLead(l));

        // Fetch pipeline entry
        const pipelineData = await fetchPipeline();
        const entry = pipelineData.find((p) => p.lead_id === id);
        setPipeline(entry || null);

        // Auto-create pipeline entry if missing
        if (!entry) {
          const track = detectServiceTrack(l.industry, l.growth_opportunity);
          await upsertPipelineEntry(l.id, {
            pipeline_status: "not_contacted",
            service_track: track,
          });
        }

        // Fetch reels
        const reelData = await fetchReels();
        setReels(reelData);
        setMatchingReel(findMatchingReel(reelData, l.industry, l.growth_opportunity));
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const serviceTrack = lead ? detectServiceTrack(lead.industry, lead.growth_opportunity) : null;
  const trackData = serviceTrack ? SERVICE_TRACKS[serviceTrack] : null;
  const recommendedPkg = enriched ? getRecommendedPackage(enriched.confidence_score) : "Starter";

  const handleGenerateEmail = async () => {
    if (!lead) return;
    setGeneratingEmail(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-client", {
        body: { lead_id: lead.id },
      });
      if (error) throw new Error(error.message);
      if (data?.emails) {
        setEmailVariants(data.emails);
        toast.success("AI emails generated!");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to generate emails");
    } finally {
      setGeneratingEmail(false);
    }
  };

  const handleClassifyReply = async () => {
    if (!replyText.trim() || !lead) return;
    setClassifyingReply(true);
    try {
      const { data, error } = await supabase.functions.invoke("classify-reply", {
        body: { reply_text: replyText, lead_context: { business_name: lead.business_name, industry: lead.industry } },
      });
      if (error) throw new Error(error.message);
      setReplyResult(data);
      toast.success("Reply classified!");
    } catch (err: any) {
      toast.error(err.message || "Failed to classify reply");
    } finally {
      setClassifyingReply(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="dark min-h-screen bg-background text-foreground flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!lead || !enriched) {
    return (
      <div className="dark min-h-screen bg-background text-foreground flex items-center justify-center">
        <p>Lead not found</p>
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold tracking-tight">
            <Crosshair className="h-5 w-5 text-primary" />
            <span>Client Muse</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link to="/pipeline"><Button size="sm" variant="ghost" className="gap-1.5"><ArrowLeft className="h-3.5 w-3.5" /> Pipeline</Button></Link>
            <Link to="/search"><Button size="sm" variant="ghost" className="gap-1.5"><Search className="h-3.5 w-3.5" /> Search</Button></Link>
            <Link to="/reel-library"><Button size="sm" variant="ghost" className="gap-1.5"><Film className="h-3.5 w-3.5" /> Reels</Button></Link>
          </nav>
        </div>
      </header>

      <div className="container py-8 space-y-8">
        {/* SECTION A — Client Brief */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                📋 Client Brief — {lead.business_name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{lead.city}</span>
                  </div>
                  {lead.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a href={lead.website} target="_blank" rel="noopener" className="text-sm text-primary hover:underline truncate">
                        {lead.website}
                      </a>
                    </div>
                  )}
                  {lead.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{lead.email}</span>
                    </div>
                  )}
                  {lead.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{lead.phone}</span>
                    </div>
                  )}
                  {lead.google_rating && (
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm">{lead.google_rating}/5</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-center gap-2">
                  <ConfidenceArc score={enriched.confidence_score} size={100} />
                  <Badge className={enriched.urgency === "high" ? "bg-red-500/20 text-red-400" : enriched.urgency === "medium" ? "bg-yellow-500/20 text-yellow-400" : "bg-muted text-muted-foreground"}>
                    {enriched.urgency.toUpperCase()} URGENCY
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Intent Signal</p>
                  <p className="text-sm font-medium">{enriched.intent_signal}</p>
                  <p className="text-xs text-muted-foreground mt-2">Why this match?</p>
                  <p className="text-sm">{enriched.why_match}</p>
                </div>
              </div>

              {lead.website_problem && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                  <p className="text-xs font-semibold text-destructive mb-1">Pain Point Detected</p>
                  <p className="text-sm">{lead.website_problem}</p>
                </div>
              )}
              {lead.growth_opportunity && (
                <div className="rounded-lg bg-primary/10 border border-primary/20 p-3">
                  <p className="text-xs font-semibold text-primary mb-1">Growth Opportunity</p>
                  <p className="text-sm">{lead.growth_opportunity}</p>
                </div>
              )}

              {/* AI Audit Snapshot */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">AI Audit Snapshot</p>
                <AuditBars ux={enriched.audit_ux} seo={enriched.audit_seo} speed={enriched.audit_speed} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* SECTION B — Service Track Detection */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
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
                        className={`rounded-lg border p-4 transition-all ${
                          pkg.name === recommendedPkg
                            ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                            : "border-border bg-card"
                        }`}
                      >
                        {pkg.name === recommendedPkg && (
                          <Badge className="mb-2 bg-primary/20 text-primary text-[10px]">Recommended</Badge>
                        )}
                        <p className="font-semibold text-sm">{pkg.name}</p>
                        <p className="text-xl font-bold text-primary mt-1">${pkg.price.toLocaleString()}</p>
                        <ul className="mt-2 space-y-1">
                          {pkg.features.map((f) => (
                            <li key={f} className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-green-400 flex-shrink-0" /> {f}
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

        {/* SECTION C — Reel Decision Check */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                🎬 Reel Decision Check
              </CardTitle>
            </CardHeader>
            <CardContent>
              {matchingReel ? (
                <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4">
                  <p className="font-semibold text-green-400 flex items-center gap-2">
                    ✅ REUSE: {matchingReel.reel_code} matches this client
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{matchingReel.description}</p>
                  <a href={matchingReel.drive_link} target="_blank" rel="noopener" className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline">
                    <Film className="h-3.5 w-3.5" /> View Reel
                  </a>
                </div>
              ) : (
                <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-4">
                  <p className="font-semibold text-yellow-400 flex items-center gap-2">
                    🔨 BUILD NEW: No existing reel matches
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Proceed to production engine to create a new reel for this client.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* SECTION D — AI Email Construction */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                ✉️ AI Email Construction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleGenerateEmail} disabled={generatingEmail} className="gap-2">
                {generatingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {generatingEmail ? "AI is researching & writing..." : "Generate Personalized Emails"}
              </Button>

              {emailVariants && (
                <div className="grid gap-4 md:grid-cols-3">
                  {(["professional", "friendly", "aggressive"] as const).map((tone) => (
                    <div key={tone} className="rounded-lg border border-border bg-card p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-[10px] capitalize">{tone}</Badge>
                        <Button size="sm" variant="ghost" onClick={() => copyToClipboard(emailVariants[tone])} className="h-7 w-7 p-0">
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <p className="text-xs whitespace-pre-wrap leading-relaxed">{emailVariants[tone]}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Fallback: show existing outreach message */}
              {!emailVariants && lead.outreach_message && (
                <div className="rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-muted-foreground">Existing Outreach Message</p>
                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(lead.outreach_message!)} className="h-7 w-7 p-0">
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{lead.outreach_message}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* SECTION E — Reply Handler */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                💬 Reply Handler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Paste the client's reply here..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={4}
                className="bg-card border-border"
              />
              <Button onClick={handleClassifyReply} disabled={classifyingReply || !replyText.trim()} className="gap-2">
                {classifyingReply ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
                {classifyingReply ? "Classifying..." : "Classify & Generate Response"}
              </Button>

              {replyResult && (
                <div className="space-y-3">
                  <div className="rounded-lg bg-primary/10 border border-primary/20 p-4">
                    <p className="text-xs font-semibold text-primary mb-1">Classification</p>
                    <p className="text-sm font-semibold">{replyResult.classification}</p>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-muted-foreground">Suggested Response</p>
                      <Button size="sm" variant="ghost" onClick={() => copyToClipboard(replyResult.suggestedReply)} className="h-7 w-7 p-0">
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
    </div>
  );
}
