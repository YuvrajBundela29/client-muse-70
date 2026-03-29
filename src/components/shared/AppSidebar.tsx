import {
  Search, LayoutDashboard, Bookmark, Clock, GitBranch,
  LogOut, BarChart3, Settings, Zap, BookmarkCheck, Command,
} from "lucide-react";
import logoWhite from "@/assets/logo-white.png";
import logoHorizontal from "@/assets/logo-horizontal-white.png";
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
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Search Clients", url: "/search", icon: Search, pulse: true },
  { title: "Saved Leads", url: "/saved", icon: Bookmark },
  { title: "Pipeline CRM", url: "/pipeline", icon: GitBranch },
  { title: "Search History", url: "/history", icon: Clock },
  { title: "Saved Searches", url: "/saved-searches", icon: BookmarkCheck },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Settings", url: "/settings", icon: Settings },
];

function UserAvatar({ email }: { email: string }) {
  const initials = email.slice(0, 2).toUpperCase();
  let hash = 0;
  for (let i = 0; i < email.length; i++) hash = email.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash % 360);
  return (
    <div
      className="h-8 w-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
      style={{ background: `hsl(${hue}, 60%, 45%)` }}
    >
      {initials}
    </div>
  );
}

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { user, signOut } = useAuth();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="bg-[rgba(10,15,30,0.95)] backdrop-blur-[20px] border-r border-[rgba(255,255,255,0.06)]">
        {/* Logo */}
        <div className={`flex items-center px-4 py-5 ${collapsed ? "justify-center" : ""}`}>
          {collapsed ? (
            <div className="relative">
              <img src={logoWhite} alt="Client Muse" className="h-7 w-7 shrink-0" />
              <div className="absolute inset-0 blur-lg bg-primary/20 rounded-full" />
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="relative group">
                <div className="h-7 w-7 relative">
                  <svg viewBox="0 0 28 28" className="h-7 w-7 text-primary group-hover:animate-spin-slow transition-transform">
                    <polygon points="14,1 26,8 26,20 14,27 2,20 2,8" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>
              </div>
              <span className="text-[15px] font-semibold tracking-tight text-foreground">Client Muse</span>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="section-label px-4">
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
                        className={`relative rounded-lg px-3 py-2 text-sm transition-all duration-150 ${
                          isActive
                            ? "bg-[rgba(91,95,239,0.15)] text-foreground font-medium border-l-2 border-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-[rgba(255,255,255,0.04)]"
                        }`}
                        activeClassName=""
                      >
                        {isActive && (
                          <motion.div
                            layoutId="sidebar-active"
                            className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary rounded-r-full"
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          />
                        )}
                        <item.icon className={`mr-2.5 h-4 w-4 ${isActive ? "text-primary" : ""}`} />
                        {!collapsed && (
                          <span className="flex-1">{item.title}</span>
                        )}
                        {!collapsed && item.pulse && (
                          <span className="h-[6px] w-[6px] rounded-full bg-success animate-pulse-slow" />
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-[rgba(255,255,255,0.06)] bg-[rgba(10,15,30,0.95)]">
        <NavLink
          to="/upgrade"
          className="relative flex items-center gap-2 px-3 py-2.5 text-sm rounded-xl bg-[rgba(91,95,239,0.1)] text-primary hover:bg-[rgba(91,95,239,0.18)] transition-all duration-300 border border-primary/20 mb-3 font-medium overflow-hidden gradient-border"
          activeClassName=""
        >
          <Zap className="h-4 w-4" />
          {!collapsed && "Upgrade to Pro"}
        </NavLink>

        {!collapsed && user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg w-full hover:bg-[rgba(255,255,255,0.04)] transition-colors">
                <UserAvatar email={user.email || ""} />
                <div className="min-w-0 text-left">
                  <p className="text-xs font-medium text-foreground truncate">
                    {user.user_metadata?.full_name || user.email?.split("@")[0]}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate font-mono">{user.email}</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 glass-strong">
              <DropdownMenuItem onClick={() => signOut()} className="text-destructive gap-2">
                <LogOut className="h-3.5 w-3.5" /> Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {collapsed && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground hover:text-destructive"
            onClick={() => signOut()}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
