import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import BottomNav from "@/components/BottomNav";
import FloatingAddButton from "@/components/FloatingAddButton";
import SplashScreen from "@/components/SplashScreen";
import Index from "./pages/Index";
import Login from "./pages/Login";
import RegisterMeal from "./pages/RegisterMeal";
import Challenges from "./pages/Challenges";
import Leagues from "./pages/Leagues";
import NoLeagueOnboarding from "./pages/NoLeagueOnboarding";
import LeagueDetail from "./pages/LeagueDetail";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ session, children }: { session: Session | null; children: React.ReactNode }) => {
  const location = useLocation();
  if (!session) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
};

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (loading) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute session={session}><Index /></ProtectedRoute>} />
            <Route path="/registrar" element={<ProtectedRoute session={session}><RegisterMeal /></ProtectedRoute>} />
            <Route path="/desafios" element={<ProtectedRoute session={session}><Challenges /></ProtectedRoute>} />
            <Route path="/ligas" element={<ProtectedRoute session={session}><Leagues /></ProtectedRoute>} />
            <Route path="/ligas/:id" element={<ProtectedRoute session={session}><LeagueDetail /></ProtectedRoute>} />
            <Route path="/perfil" element={<ProtectedRoute session={session}><Profile /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <BottomNav />
          <FloatingAddButton />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
