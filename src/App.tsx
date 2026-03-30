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
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import SearchIntake from "./pages/SearchIntake";
import Results from "./pages/Results";
import History from "./pages/History";
import Pipeline from "./pages/Pipeline";
import ClientIntelligence from "./pages/ClientIntelligence";

import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Upgrade from "./pages/Upgrade";
import Referrals from "./pages/Referrals";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import { CookieConsent } from "@/components/shared/CookieConsent";

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
            <Route path="/login" element={<Navigate to="/auth" replace />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/signup" element={<Navigate to="/auth" replace />} />

            {/* Onboarding (protected but no sidebar) */}
            <Route path="/onboarding" element={<ProtectedRoute skipOnboarding><Onboarding /></ProtectedRoute>} />

            {/* Protected with sidebar layout */}
            <Route path="/dashboard" element={<ProtectedWithLayout><Dashboard /></ProtectedWithLayout>} />
            <Route path="/search" element={<ProtectedWithLayout><SearchIntake /></ProtectedWithLayout>} />
            <Route path="/results" element={<ProtectedWithLayout><Results /></ProtectedWithLayout>} />
            <Route path="/saved" element={<Navigate to="/history" replace />} />
            <Route path="/history" element={<ProtectedWithLayout><History /></ProtectedWithLayout>} />
            <Route path="/pipeline" element={<ProtectedWithLayout><Pipeline /></ProtectedWithLayout>} />
            <Route path="/pipeline/:id" element={<ProtectedWithLayout><ClientIntelligence /></ProtectedWithLayout>} />
            
            <Route path="/analytics" element={<ProtectedWithLayout><Analytics /></ProtectedWithLayout>} />
            <Route path="/settings" element={<ProtectedWithLayout><Settings /></ProtectedWithLayout>} />
            <Route path="/referrals" element={<ProtectedWithLayout><Referrals /></ProtectedWithLayout>} />
            <Route path="/saved-searches" element={<Navigate to="/history" replace />} />
            <Route path="/upgrade" element={<ProtectedWithLayout><Upgrade /></ProtectedWithLayout>} />

            {/* Redirects */}
            <Route path="/finder" element={<Navigate to="/search" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
    <CookieConsent />
  </QueryClientProvider>
);

export default App;
