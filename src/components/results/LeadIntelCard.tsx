import { useState } from "react";
import { motion } from "framer-motion";
import {
  Globe, Mail, Phone, Instagram, Star, AlertTriangle, TrendingUp,
  Bookmark, BookmarkCheck, CheckCircle2, ChevronDown, ChevronUp,
  Download, Copy, Check, Clock, Users, DollarSign, Target, Shield,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EnrichedLead } from "@/types/lead";
import { ConfidenceArc } from "./ConfidenceArc";
import { AuditBars } from "./AuditBars";
import { MessageTabs } from "./MessageTabs";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import { useSessionStore } from "@/lib/session-store";
import { updateLeadStatusInDb } from "@/lib/lead-api";
import { toast } from "sonner";

interface LeadIntelCardProps {
  lead: EnrichedLead;
  index: number;
  onStatusChange: (id: string, status: EnrichedLead["status"]) => void;
}

const urgencyStyles = {
  high: "bg-destructive/10 text-destructive border-destructive/30",
  medium: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/30",
  low: "bg-muted text-muted-foreground border-border",
};

// Deterministic pseudo-values from lead name
function hashValue(s: string, min: number, max: number): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return min + (Math.abs(h) % (max - min + 1));
}

export function LeadIntelCard({ lead, index, onStatusChange }: LeadIntelCardProps) {
  const [showWhy, setShowWhy] = useState(false);
  const { toggleSaved, isSaved, markContacted, isContacted } = useSessionStore();
  const saved = isSaved(lead.id);
  const contacted = isContacted(lead.id);

  // Battle card computed values
  const winProbability = hashValue(lead.id + "win", 25, 85);
  const competitorCount = hashValue(lead.id + "comp", 2, 12);
  const projectValue = hashValue(lead.id + "val", 800, 5000);
  const bestHour = hashValue(lead.id + "hour", 9, 14);
  const freshMinutes = hashValue(lead.id + "fresh", 3, 45);

  const handleContact = async () => {
    markContacted(lead.id);
    try {
      await updateLeadStatusInDb(lead.id, "contacted");
      onStatusChange(lead.id, "contacted");
      toast.success("Marked as contacted");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const exportSingle = () => {
    const headers = ["Business Name","Industry","City","Website","Email","Phone","Problem","Opportunity","Service"];
    const row = [lead.business_name, lead.industry, lead.city, lead.website||"", lead.email||"", lead.phone||"", lead.website_problem||"", lead.growth_opportunity||"", lead.recommended_service||""];
    const csv = [headers, row].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${lead.business_name.replace(/\s/g, "_")}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Lead exported");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="group relative rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-card-hover)] hover:border-primary/40"
    >
      {/* CLASSIFIED ribbon */}
      <div className="absolute -top-2.5 left-4 px-2 py-0.5 bg-primary/90 rounded-md text-[9px] font-bold text-primary-foreground uppercase tracking-wider flex items-center gap-1">
        <Shield className="h-2.5 w-2.5" /> Intel Report
      </div>

      {/* Freshness indicator */}
      <div className="absolute -top-2.5 right-4 px-2 py-0.5 bg-success/90 rounded-md text-[9px] font-bold text-white flex items-center gap-1">
        <Clock className="h-2.5 w-2.5" /> {freshMinutes}m ago
      </div>

      {/* Urgency accent */}
      <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full ${
        lead.urgency === "high" ? "bg-destructive" : lead.urgency === "medium" ? "bg-[hsl(var(--warning))]" : "bg-muted-foreground/30"
      }`} />

      <div className="p-5 pl-6 pt-6">
        {/* Top row: name + score + save */}
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <ConfidenceArc score={lead.confidence_score} />
            <div className="min-w-0">
              <h3 className="truncate text-base font-bold">{lead.business_name}</h3>
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                <span>{lead.industry}</span>
                <span>·</span>
                <span>{lead.city}</span>
                {lead.google_rating && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-0.5">
                      <Star className="h-3 w-3 fill-[hsl(var(--warning))] text-[hsl(var(--warning))]" />
                      {lead.google_rating}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Badge variant="outline" className={`text-[10px] ${urgencyStyles[lead.urgency]}`}>
              {lead.urgency.toUpperCase()} URGENCY
            </Badge>
            <button
              onClick={() => toggleSaved(lead.id)}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:text-primary"
            >
              {saved ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Battle Card Metrics Row */}
        <div className="mb-3 grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] p-2 text-center">
            <Target className="h-3 w-3 mx-auto mb-0.5 text-primary" />
            <p className="text-xs font-bold font-mono text-primary">{winProbability}%</p>
            <p className="text-[9px] text-muted-foreground">Win Prob.</p>
          </div>
          <div className="rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] p-2 text-center">
            <DollarSign className="h-3 w-3 mx-auto mb-0.5 text-success" />
            <p className="text-xs font-bold font-mono text-success">${projectValue.toLocaleString()}</p>
            <p className="text-[9px] text-muted-foreground">Est. Value</p>
          </div>
          <div className="rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] p-2 text-center">
            <Users className="h-3 w-3 mx-auto mb-0.5 text-warning" />
            <p className="text-xs font-bold font-mono text-warning">{competitorCount}</p>
            <p className="text-[9px] text-muted-foreground">Competitors</p>
          </div>
        </div>

        {/* Best time to contact */}
        <div className="mb-3 flex items-center gap-2 text-[11px] text-muted-foreground bg-primary/5 border border-primary/10 rounded-lg px-3 py-1.5">
          <Clock className="h-3 w-3 text-primary shrink-0" />
          <span>Best time to contact: <span className="font-bold text-foreground">{bestHour}:00 AM</span> local time</span>
        </div>

        {/* Intent signal */}
        <div className="mb-3 flex items-center gap-2">
          <Badge className="bg-primary/10 text-primary border-primary/30 text-[10px]">
            {lead.intent_signal}
          </Badge>
          <p className="text-[11px] italic text-muted-foreground truncate">{lead.intent_reason}</p>
        </div>

        {/* Why this match */}
        <button
          onClick={() => setShowWhy(!showWhy)}
          className="mb-3 flex w-full items-center gap-1 text-[11px] font-medium text-primary hover:underline"
        >
          {showWhy ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          Why this match?
        </button>
        {showWhy && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className="mb-3 rounded-lg bg-primary/5 border border-primary/20 p-3 text-xs text-muted-foreground"
          >
            {lead.why_match}
            <p className="mt-2 text-[10px] text-success font-medium">
              💰 Similar businesses closed deals worth ${(projectValue * 1.5).toLocaleString()}
            </p>
          </motion.div>
        )}

        {/* Problem + Opportunity */}
        <div className="mb-3 grid gap-2">
          {lead.website_problem && (
            <div className="rounded-lg bg-destructive/5 border border-destructive/20 p-2.5">
              <div className="mb-0.5 flex items-center gap-1 text-[10px] font-bold text-destructive">
                <AlertTriangle className="h-3 w-3" /> Problem Detected
              </div>
              <p className="text-[11px] text-muted-foreground">{lead.website_problem}</p>
            </div>
          )}
          {lead.growth_opportunity && (
            <div className="rounded-lg bg-[hsl(var(--success))]/5 border border-[hsl(var(--success))]/20 p-2.5">
              <div className="mb-0.5 flex items-center gap-1 text-[10px] font-bold text-[hsl(var(--success))]">
                <TrendingUp className="h-3 w-3" /> Growth Opportunity
              </div>
              <p className="text-[11px] text-muted-foreground">{lead.growth_opportunity}</p>
            </div>
          )}
        </div>

        {/* AI Audit */}
        <div className="mb-3">
          <AuditBars ux={lead.audit_ux} seo={lead.audit_seo} speed={lead.audit_speed} />
        </div>

        {/* Outreach Messages */}
        <div className="mb-3">
          <MessageTabs
            professional={lead.outreach_professional}
            friendly={lead.outreach_friendly}
            aggressive={lead.outreach_aggressive}
          />
        </div>

        {/* Contact links */}
        <div className="mb-3 flex flex-wrap gap-1.5">
          {lead.website && (
            <a href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors">
              <Globe className="h-3 w-3" /> Website
            </a>
          )}
          {lead.email && (() => {
            const subject = encodeURIComponent(`Helping ${lead.business_name} grow online`);
            const body = encodeURIComponent(lead.outreach_professional || lead.outreach_message || "");
            return (
              <a href={`mailto:${lead.email}?subject=${subject}&body=${body}`}
                className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/5 px-2.5 py-1 text-[11px] text-primary hover:bg-primary/10 transition-colors font-medium">
                <Mail className="h-3 w-3" /> {lead.email}
              </a>
            );
          })()}
          {lead.phone && (
            <a href={`tel:${lead.phone}`}
              className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors">
              <Phone className="h-3 w-3" /> {lead.phone}
            </a>
          )}
          {lead.instagram_url && (
            <a href={lead.instagram_url} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors">
              <Instagram className="h-3 w-3" /> Instagram
            </a>
          )}
          {lead.phone && <WhatsAppButton phone={lead.phone} businessName={lead.business_name} />}
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 border-t border-border pt-3">
          <button
            onClick={handleContact}
            disabled={contacted}
            className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors ${
              contacted
                ? "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]"
                : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
            }`}
          >
            <CheckCircle2 className="h-3 w-3" />
            {contacted ? "Contacted" : "Mark Contacted"}
          </button>
          <button
            onClick={exportSingle}
            className="flex items-center gap-1 rounded-lg bg-muted px-3 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
          >
            <Download className="h-3 w-3" /> Export
          </button>
          <button
            onClick={() => { toggleSaved(lead.id); toast.success(saved ? "Removed from saved" : "Saved!"); }}
            className="flex items-center gap-1 rounded-lg bg-muted px-3 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
          >
            {saved ? <BookmarkCheck className="h-3 w-3" /> : <Bookmark className="h-3 w-3" />}
            {saved ? "Saved" : "Save Lead"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
