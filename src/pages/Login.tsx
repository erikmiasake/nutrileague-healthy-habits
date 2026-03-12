"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import LoginCardSection from "@/components/ui/login-signup";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (session) {
        const { data: memberships } = await supabase
          .from("league_members")
          .select("league_id")
          .eq("user_id", session.user.id)
          .limit(1);

        if (memberships && memberships.length > 0) {
          navigate("/", { replace: true });
        } else {
          navigate("/ligas", { replace: true });
        }
      }
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/", { replace: true });
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (data: { email: string; password: string; name?: string }) => {
    if (loading) return;
    setLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: { data: { name: data.name }, emailRedirectTo: window.location.origin },
      });
      if (error) { toast.error(error.message); setLoading(false); return; }
      toast.success("Conta criada! Verifique seu email para confirmar.");
      setLoading(false);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: data.email, password: data.password });
      if (error) { toast.error("Email ou senha incorretos."); setLoading(false); return; }
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) toast.error("Erro ao entrar com Google.");
  };

  return (
    <LoginCardSection
      isSignUp={isSignUp}
      onToggleMode={() => setIsSignUp((v) => !v)}
      onSubmit={handleSubmit}
      onGoogleLogin={handleGoogleLogin}
      loading={loading}
    />
  );
}
