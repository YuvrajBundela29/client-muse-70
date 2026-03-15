import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Download, Filter, ExternalLink, Star, Mail, Phone, Instagram, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AppHeader } from "@/components/shared/AppHeader";
import { useLeadStore } from "@/lib/lead-store";
import { Lead } from "@/types/lead";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statusConfig: Record<Lead["status"], { label: string; className: string }> = {
  new: { label: "New", className: "bg-primary/10 text-primary border-primary/20" },
  contacted: { label: "Contacted", className: "bg-warning/10 text-warning border-warning/20" },
  replied: { label: "Replied", className: "bg-success/10 text-success border-success/20" },
};

export default function Dashboard() {
  const { leads, updateLeadStatus } = useLeadStore();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      const matchSearch =
        !search ||
        l.business_name.toLowerCase().includes(search.toLowerCase()) ||
        l.city.toLowerCase().includes(search.toLowerCase()) ||
        l.industry.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || l.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [leads, search, statusFilter]);

  function copyMessage(lead: Lead) {
    if (!lead.outreach_message) return;
    navigator.clipboard.writeText(lead.outreach_message);
    setCopiedId(lead.id);
    toast.success("Message copied!");
    setTimeout(() => setCopiedId(null), 2000);
  }

  function exportCSV() {
    const headers = ["Business", "Industry", "City", "Website", "Email", "Phone", "Rating", "Problem", "Opportunity", "Status"];
    const rows = filtered.map((l) => [
      l.business_name, l.industry, l.city, l.website || "", l.email || "", l.phone || "",
      l.google_rating?.toString() || "", l.website_problem || "", l.growth_opportunity || "", l.status,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported!");
  }

  if (leads.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="container flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 rounded-full bg-muted p-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="mb-1 text-xl font-semibold tracking-tight">No leads yet</h2>
          <p className="mb-6 max-w-sm text-sm text-muted-foreground text-balance">
            Run a search from the Finder to discover and analyze potential clients.
          </p>
          <Link to="/finder">
            <Button>Go to Finder</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="container py-6">
        {/* Top bar */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Leads</h1>
            <p className="text-sm text-muted-foreground">{filtered.length} of {leads.length} leads</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter leads…"
                className="h-9 w-56 pl-8 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-32 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="replied">Replied</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={exportCSV} className="gap-1.5">
              <Download className="h-3.5 w-3.5" />
              Export
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg bg-card shadow-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs font-medium text-muted-foreground">
                <th className="px-4 py-3">Business</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Problem Detected</th>
                <th className="px-4 py-3">Opportunity</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead, i) => {
                const sc = statusConfig[lead.status];
                return (
                  <motion.tr
                    key={lead.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-border/50 transition-colors hover:bg-muted/30"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium">{lead.business_name}</div>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{lead.city}</span>
                        {lead.google_rating && (
                          <span className="flex items-center gap-0.5 tabular-nums">
                            <Star className="h-3 w-3 fill-warning text-warning" />
                            {lead.google_rating}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {lead.website && (
                          <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                        {lead.email && (
                          <a href={`mailto:${lead.email}`} className="text-muted-foreground hover:text-foreground">
                            <Mail className="h-3.5 w-3.5" />
                          </a>
                        )}
                        {lead.phone && (
                          <a href={`tel:${lead.phone}`} className="text-muted-foreground hover:text-foreground">
                            <Phone className="h-3.5 w-3.5" />
                          </a>
                        )}
                        {lead.instagram_url && (
                          <a href={lead.instagram_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                            <Instagram className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="max-w-[200px] px-4 py-3 text-xs text-muted-foreground">
                      {lead.website_problem}
                    </td>
                    <td className="max-w-[200px] px-4 py-3 text-xs text-muted-foreground">
                      {lead.growth_opportunity}
                    </td>
                    <td className="px-4 py-3">
                      <Select
                        value={lead.status}
                        onValueChange={(v) => updateLeadStatus(lead.id, v as Lead["status"])}
                      >
                        <SelectTrigger className="h-7 w-28 border-0 p-0 text-xs shadow-none">
                          <Badge variant="outline" className={sc.className}>
                            {sc.label}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="contacted">Contacted</SelectItem>
                          <SelectItem value="replied">Replied</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1.5 text-xs"
                        onClick={() => copyMessage(lead)}
                      >
                        {copiedId === lead.id ? (
                          <>
                            <Check className="h-3 w-3" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            Copy Message
                          </>
                        )}
                      </Button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
