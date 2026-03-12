"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import LoginCardSection from "@/components/ui/login-signup";
import EmailVerificationNotice from "@/components/EmailVerificationNotice";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
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
          navigate("/onboarding", { replace: true });
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
      const { data: signUpData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: { data: { name: data.name }, emailRedirectTo: window.location.origin },
      });
      if (error) { toast.error(error.message); setLoading(false); return; }

      // Show verification notice
      if (signUpData.user && !signUpData.session) {
        setPendingEmail(data.email);
      }
      setLoading(false);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: data.email, password: data.password });
      if (error) {
        if (error.message.toLowerCase().includes("email not confirmed")) {
          toast.error("Verifique seu email antes de fazer login.");
        } else {
          toast.error("Email ou senha incorretos.");
        }
        setLoading(false);
        return;
      }
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) toast.error("Erro ao entrar com Google.");
  };

  const handleResendEmail = async () => {
    if (!pendingEmail) return;
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: pendingEmail,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) {
      toast.error("Erro ao reenviar email.");
    } else {
      toast.success("Email reenviado!");
    }
  };

  if (pendingEmail) {
    return (
      <EmailVerificationNotice
        email={pendingEmail}
        onResend={handleResendEmail}
        onBack={() => { setPendingEmail(null); setIsSignUp(false); }}
      />
    );
  }

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
