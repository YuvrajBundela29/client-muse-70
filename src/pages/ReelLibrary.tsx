import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Crosshair, Plus, Trash2, Film, Search, ExternalLink, Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { fetchReels, insertReel, deleteReel, ReelEntry } from "@/lib/pipeline-api";

export default function ReelLibrary() {
  const [reels, setReels] = useState<ReelEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  // Form fields
  const [reelCode, setReelCode] = useState("");
  const [description, setDescription] = useState("");
  const [industryTags, setIndustryTags] = useState("");
  const [keywords, setKeywords] = useState("");
  const [driveLink, setDriveLink] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      setReels(await fetchReels());
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reelCode || !description || !driveLink) {
      toast.error("Fill in all required fields");
      return;
    }
    try {
      await insertReel({
        reel_code: reelCode,
        description,
        industry_tags: industryTags.split(",").map((t) => t.trim()).filter(Boolean),
        keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean),
        drive_link: driveLink,
      });
      toast.success("Reel added!");
      setReelCode(""); setDescription(""); setIndustryTags(""); setKeywords(""); setDriveLink("");
      setShowForm(false);
      await load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteReel(id);
      toast.success("Reel deleted");
      setReels((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const filtered = reels.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.reel_code.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.industry_tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold tracking-tight">
            <Crosshair className="h-5 w-5 text-primary" />
            <span>Client Muse</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link to="/pipeline"><Button size="sm" variant="ghost" className="gap-1.5"><Zap className="h-3.5 w-3.5" /> Pipeline</Button></Link>
            <Link to="/search"><Button size="sm" variant="ghost" className="gap-1.5"><Search className="h-3.5 w-3.5" /> Search</Button></Link>
            <Link to="/history"><Button size="sm" variant="ghost" className="gap-1.5"><Clock className="h-3.5 w-3.5" /> History</Button></Link>
          </nav>
        </div>
      </header>

      <div className="container py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Film className="h-6 w-6 text-primary" /> Reel Library
            </h1>
            <p className="text-sm text-muted-foreground">{reels.length} reels in library</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search reels..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-48 bg-card pl-9 border-border"
              />
            </div>
            <Button size="sm" onClick={() => setShowForm(!showForm)} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Add Reel
            </Button>
          </div>
        </div>

        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="mb-6 border-border bg-card">
              <CardContent className="p-6">
                <form onSubmit={handleAdd} className="grid gap-4 sm:grid-cols-2">
                  <Input placeholder="Reel Code (e.g. REEL_002)" value={reelCode} onChange={(e) => setReelCode(e.target.value)} className="bg-card border-border" />
                  <Input placeholder="Drive Link" value={driveLink} onChange={(e) => setDriveLink(e.target.value)} className="bg-card border-border" />
                  <Input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="bg-card border-border sm:col-span-2" />
                  <Input placeholder="Industry Tags (comma separated)" value={industryTags} onChange={(e) => setIndustryTags(e.target.value)} className="bg-card border-border" />
                  <Input placeholder="Keywords (comma separated)" value={keywords} onChange={(e) => setKeywords(e.target.value)} className="bg-card border-border" />
                  <div className="sm:col-span-2 flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                    <Button type="submit">Save Reel</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1,2,3].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-xl bg-card border border-border" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center">
            <Film className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
            <h2 className="mb-2 text-xl font-bold">No reels found</h2>
            <p className="text-muted-foreground mb-4">Add your first reel to start matching clients with existing content.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((reel) => (
              <motion.div key={reel.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-border bg-card hover:border-primary/40 transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="outline" className="text-xs font-mono">{reel.reel_code}</Badge>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(reel.id)} className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <p className="text-sm mb-3 leading-relaxed">{reel.description}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {reel.industry_tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                      ))}
                    </div>
                    <a href={reel.drive_link} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                      <ExternalLink className="h-3 w-3" /> View on Drive
                    </a>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
