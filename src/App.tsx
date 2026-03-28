import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardLayout } from "@/components/shared/DashboardLayout";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import SearchIntake from "./pages/SearchIntake";
import Results from "./pages/Results";
import SavedLeads from "./pages/SavedLeads";
import History from "./pages/History";
import Pipeline from "./pages/Pipeline";
import ClientIntelligence from "./pages/ClientIntelligence";
import ReelLibrary from "./pages/ReelLibrary";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedWithLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />

            {/* Protected with sidebar layout */}
            <Route path="/dashboard" element={<ProtectedWithLayout><Dashboard /></ProtectedWithLayout>} />
            <Route path="/search" element={<ProtectedWithLayout><SearchIntake /></ProtectedWithLayout>} />
            <Route path="/results" element={<ProtectedWithLayout><Results /></ProtectedWithLayout>} />
            <Route path="/saved" element={<ProtectedWithLayout><SavedLeads /></ProtectedWithLayout>} />
            <Route path="/history" element={<ProtectedWithLayout><History /></ProtectedWithLayout>} />
            <Route path="/pipeline" element={<ProtectedWithLayout><Pipeline /></ProtectedWithLayout>} />
            <Route path="/pipeline/:id" element={<ProtectedWithLayout><ClientIntelligence /></ProtectedWithLayout>} />
            <Route path="/reel-library" element={<ProtectedWithLayout><ReelLibrary /></ProtectedWithLayout>} />

            {/* Redirects */}
            <Route path="/finder" element={<Navigate to="/search" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
