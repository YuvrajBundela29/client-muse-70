import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "./pages/Landing";
import SearchIntake from "./pages/SearchIntake";
import Results from "./pages/Results";
import History from "./pages/History";
import Pipeline from "./pages/Pipeline";
import ClientIntelligence from "./pages/ClientIntelligence";
import ReelLibrary from "./pages/ReelLibrary";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/search" element={<SearchIntake />} />
          <Route path="/results" element={<Results />} />
          <Route path="/history" element={<History />} />
          <Route path="/pipeline" element={<Pipeline />} />
          <Route path="/pipeline/:id" element={<ClientIntelligence />} />
          <Route path="/reel-library" element={<ReelLibrary />} />
          <Route path="/finder" element={<Navigate to="/search" replace />} />
          <Route path="/dashboard" element={<Navigate to="/results" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
