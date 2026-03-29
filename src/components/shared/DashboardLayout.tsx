import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/shared/AppSidebar";
import { useAuth } from "@/hooks/useAuth";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center border-b border-border/50 glass-strong px-4 shrink-0 sticky top-0 z-40">
            <SidebarTrigger />
            <div className="ml-auto flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                <span className="text-[11px] font-mono text-muted-foreground">
                  {user?.email}
                </span>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto grid-pattern">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
