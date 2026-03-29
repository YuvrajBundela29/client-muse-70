import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Bookmark, Trash2, MessageSquare, Calendar, ArrowUpDown,
  Search, ExternalLink, Mail, Phone, Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface SavedLead {
  id: string;
  lead_id: string;
  notes: string | null;
  pipeline_stage: string;
  last_contacted_at: string | null;
  follow_up_due_at: string | null;
  created_at: string;
  lead: {
    business_name: string;
    industry: string;
    city: string;
    email: string | null;
    phone: string | null;
    website: string | null;
    google_rating: number | null;
    growth_opportunity: string | null;
    website_problem: string | null;
  };
}

const STAGES = [
  { value: "new", label: "New", color: "bg-primary/10 text-primary border-primary/20" },
  { value: "contacted", label: "Contacted", color: "bg-warning/10 text-warning border-warning/20" },
  { value: "replied", label: "Replied", color: "bg-success/10 text-success border-success/20" },
  { value: "closed", label: "Closed", color: "bg-glow-violet/10 text-glow-violet border-glow-violet/20" },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.03 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

export default function SavedLeads() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<SavedLead[]>([]);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  useEffect(() => { if (user) loadLeads(); }, [user]);

  async function loadLeads() {
    const { data, error } = await supabase.from("saved_leads").select("*, lead:leads(*)").eq("user_id", user!.id).order("created_at", { ascending: false });
    if (error) { toast.error("Failed to load saved leads"); console.error(error); }
    else setLeads((data as unknown as SavedLead[]) || []);
    setLoading(false);
  }

  async function updateStage(id: string, stage: string) {
    const updates: Record<string, unknown> = { pipeline_stage: stage, updated_at: new Date().toISOString() };
    if (stage === "contacted") updates.last_contacted_at = new Date().toISOString();
    await supabase.from("saved_leads").update(updates).eq("id", id);
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, pipeline_stage: stage } : l));
    toast.success(`Stage updated to ${stage}`);
  }

  async function saveNotes(id: string) {
    await supabase.from("saved_leads").update({ notes: noteText, updated_at: new Date().toISOString() }).eq("id", id);
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, notes: noteText } : l));
    setEditingNotes(null);
    toast.success("Notes saved");
  }

  async function removeLead(id: string) {
    await supabase.from("saved_leads").delete().eq("id", id);
    setLeads((prev) => prev.filter((l) => l.id !== id));
    toast.success("Lead removed from saved");
  }

  const filtered = leads.filter((l) => {
    const matchSearch = !search || l.lead.business_name.toLowerCase().includes(search.toLowerCase()) || l.lead.industry.toLowerCase().includes(search.toLowerCase());
    const matchStage = stageFilter === "all" || l.pipeline_stage === stageFilter;
    return matchSearch && matchStage;
  });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <div className="relative">
              <Bookmark className="h-5 w-5 text-primary" />
              <div className="absolute inset-0 blur-md bg-primary/30" />
            </div>
            Saved Leads
          </h1>
          <p className="text-sm text-muted-foreground font-mono">{leads.length} leads saved</p>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search saved leads..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 glass border-border/50 focus:border-primary/50" />
        </div>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-40 glass border-border/50">
            <SelectValue placeholder="All stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {STAGES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground font-mono">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <Bookmark className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <h3 className="font-medium text-muted-foreground">No saved leads yet</h3>
          <p className="text-sm text-muted-foreground/70">Search for clients and save the best ones here</p>
        </div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
          {filtered.map((saved) => (
            <motion.div key={saved.id} variants={item}>
              <Card className="p-4 glass border-border/50 hover:border-primary/20 hover:shadow-card-hover transition-all duration-300">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{saved.lead.business_name}</h3>
                      <Badge variant="outline" className="text-xs shrink-0 border-border/50">{saved.lead.industry}</Badge>
                      {STAGES.map((s) =>
                        s.value === saved.pipeline_stage ? (
                          <Badge key={s.value} className={`text-xs border ${s.color}`}>{s.label}</Badge>
                        ) : null
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2 font-mono">{saved.lead.city}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-2">
                      {saved.lead.email && (
                        <a href={`mailto:${saved.lead.email}`} className="flex items-center gap-1 hover:text-primary transition-colors font-mono">
                          <Mail className="h-3 w-3" /> {saved.lead.email}
                        </a>
                      )}
                      {saved.lead.phone && (
                        <span className="flex items-center gap-1 font-mono"><Phone className="h-3 w-3" /> {saved.lead.phone}</span>
                      )}
                      {saved.lead.website && (
                        <a href={saved.lead.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors">
                          <Globe className="h-3 w-3" /> Website
                        </a>
                      )}
                    </div>
                    {saved.lead.growth_opportunity && (
                      <p className="text-xs text-muted-foreground/80 line-clamp-2">{saved.lead.growth_opportunity}</p>
                    )}
                    {editingNotes === saved.id ? (
                      <div className="mt-2 space-y-2">
                        <Textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Add notes..." className="text-sm glass border-border/50" rows={2} />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => saveNotes(saved.id)} className="shadow-glow">Save</Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingNotes(null)}>Cancel</Button>
                        </div>
                      </div>
                    ) : saved.notes ? (
                      <p className="mt-2 text-xs bg-muted/50 p-2.5 rounded-lg cursor-pointer border border-border/50 hover:border-primary/20 transition-colors" onClick={() => { setEditingNotes(saved.id); setNoteText(saved.notes || ""); }}>
                        📝 {saved.notes}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <Select value={saved.pipeline_stage} onValueChange={(v) => updateStage(saved.id, v)}>
                      <SelectTrigger className="w-32 h-8 text-xs glass border-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STAGES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Button size="sm" variant="ghost" className="h-8 text-xs gap-1" onClick={() => { setEditingNotes(saved.id); setNoteText(saved.notes || ""); }}>
                      <MessageSquare className="h-3 w-3" /> Notes
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 text-xs text-destructive gap-1" onClick={() => removeLead(saved.id)}>
                      <Trash2 className="h-3 w-3" /> Remove
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
