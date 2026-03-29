import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import {
  Search, LayoutDashboard, Bookmark, Clock, GitBranch,
  BarChart3, Settings, BookmarkCheck, Zap,
} from "lucide-react";

const pages = [
  { name: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { name: "Search Clients", url: "/search", icon: Search },
  { name: "Saved Leads", url: "/saved", icon: Bookmark },
  { name: "Pipeline CRM", url: "/pipeline", icon: GitBranch },
  { name: "Search History", url: "/history", icon: Clock },
  { name: "Saved Searches", url: "/saved-searches", icon: BookmarkCheck },
  { name: "Analytics", url: "/analytics", icon: BarChart3 },
  { name: "Settings", url: "/settings", icon: Settings },
  { name: "Upgrade Plan", url: "/upgrade", icon: Zap },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = useCallback((url: string) => {
    setOpen(false);
    navigate(url);
  }, [navigate]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search pages, actions..." className="text-base" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="PAGES">
          {pages.map((page) => (
            <CommandItem key={page.url} onSelect={() => runCommand(page.url)} className="gap-2.5">
              <page.icon className="h-4 w-4 text-muted-foreground" />
              <span>{page.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="ACTIONS">
          <CommandItem onSelect={() => runCommand("/search")} className="gap-2.5">
            <Search className="h-4 w-4 text-muted-foreground" />
            <span>New Search</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
