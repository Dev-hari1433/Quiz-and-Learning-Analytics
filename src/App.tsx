import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import GenerateQuiz from "./pages/GenerateQuiz";
import Quiz from "./pages/Quiz";
import Leaderboard from "./pages/Leaderboard";
import Analytics from "./pages/Analytics";
import SmartResearch from "./pages/SmartResearch";
import History from "./pages/History";
import Achievements from "./pages/Achievements";
import Auth from "./pages/Auth";
import AuthGuard from "./components/layout/AuthGuard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
          <Route path="/generate-quiz" element={<AuthGuard><GenerateQuiz /></AuthGuard>} />
          <Route path="/quiz" element={<AuthGuard><Quiz /></AuthGuard>} />
          <Route path="/leaderboard" element={<AuthGuard><Leaderboard /></AuthGuard>} />
          <Route path="/analytics" element={<AuthGuard><Analytics /></AuthGuard>} />
          <Route path="/research" element={<AuthGuard><SmartResearch /></AuthGuard>} />
          <Route path="/history" element={<AuthGuard><History /></AuthGuard>} />
          <Route path="/achievements" element={<AuthGuard><Achievements /></AuthGuard>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
