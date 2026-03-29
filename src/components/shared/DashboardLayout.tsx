import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/shared/AppSidebar";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { CommandPalette } from "@/components/shared/CommandPalette";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center border-b border-[rgba(255,255,255,0.06)] bg-[rgba(10,15,30,0.8)] backdrop-blur-[20px] px-4 shrink-0 sticky top-0 z-40">
            <SidebarTrigger />
            <div className="ml-auto flex items-center gap-3">
              <kbd className="hidden sm:inline-flex items-center gap-1 rounded-md border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
                ⌘K
              </kbd>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-success animate-pulse-slow" />
                <span className="text-[11px] font-mono text-muted-foreground">
                  {user?.email}
                </span>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto mesh-gradient relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="h-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
      <CommandPalette />
    </SidebarProvider>
  );
}
