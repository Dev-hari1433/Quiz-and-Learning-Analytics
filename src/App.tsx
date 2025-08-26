import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import RealTimeAchievementNotification from '@/components/achievements/RealTimeAchievementNotification';

// Lazy load all pages for better performance
const Index = lazy(() => import("./pages/Index"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const GenerateQuiz = lazy(() => import("./pages/GenerateQuiz"));
const Quiz = lazy(() => import("./pages/Quiz"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Analytics = lazy(() => import("./pages/Analytics"));
const SmartResearch = lazy(() => import("./pages/SmartResearch"));
const History = lazy(() => import("./pages/History"));
const Achievements = lazy(() => import("./pages/Achievements"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Optimized query client configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

// Loading component for better UX
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/generate-quiz" element={<GenerateQuiz />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/smart-research" element={<SmartResearch />} />
            <Route path="/history" element={<History />} />
            <Route path="/achievements" element={<Achievements />} />
            {/* Redirect /research to /smart-research for backwards compatibility */}
            <Route path="/research" element={<SmartResearch />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <RealTimeAchievementNotification />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
