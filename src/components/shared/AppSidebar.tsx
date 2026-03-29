import {
  Search, LayoutDashboard, Bookmark, Clock, GitBranch,
  LogOut, BarChart3, Settings, Zap, BookmarkCheck,
} from "lucide-react";
import logoWhite from "@/assets/logo-white.png";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Search Clients", url: "/search", icon: Search },
  { title: "Saved Leads", url: "/saved", icon: Bookmark },
  { title: "Pipeline CRM", url: "/pipeline", icon: GitBranch },
  { title: "Search History", url: "/history", icon: Clock },
  { title: "Saved Searches", url: "/saved-searches", icon: BookmarkCheck },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { user, signOut } = useAuth();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="bg-sidebar border-r border-sidebar-border">
        {/* Logo */}
        <div className={`flex items-center gap-2.5 px-4 py-5 ${collapsed ? "justify-center" : ""}`}>
          <div className="relative">
            <img src={logoWhite} alt="AutoClient AI" className="h-7 w-7 shrink-0" />
            <div className="absolute inset-0 blur-lg bg-primary/20 rounded-full" />
          </div>
          {!collapsed && (
            <span className="font-bold text-lg tracking-tight text-gradient">
              AutoClient AI
            </span>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.15em] font-semibold text-muted-foreground/60 px-4">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-2 space-y-0.5">
              {mainItems.map((item) => {
                const isActive = location.pathname === item.url || location.pathname.startsWith(item.url + "/");
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={item.url === "/dashboard"}
                        className={`relative rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
                          isActive
                            ? "bg-primary/10 text-primary font-medium glow-border"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                        }`}
                        activeClassName=""
                      >
                        {isActive && (
                          <motion.div
                            layoutId="sidebar-active"
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary shadow-glow"
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          />
                        )}
                        <item.icon className={`mr-2.5 h-4 w-4 ${isActive ? "text-primary" : ""}`} />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-sidebar-border bg-sidebar">
        <NavLink
          to="/upgrade"
          className="flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg bg-gradient-to-r from-primary/15 to-glow-violet/15 text-primary hover:from-primary/25 hover:to-glow-violet/25 transition-all duration-300 border border-primary/20 glow-border mb-2 font-medium"
          activeClassName=""
        >
          <Zap className="h-4 w-4" />
          {!collapsed && "Upgrade Plan"}
        </NavLink>
        {!collapsed && user && (
          <div className="mb-2 px-2 text-xs text-muted-foreground truncate font-mono">
            {user.email}
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive transition-colors"
          onClick={() => signOut()}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && "Sign Out"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
