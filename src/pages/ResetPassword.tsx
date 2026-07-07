"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [checking, setChecking] = useState(true);
  const [validSession, setValidSession] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        // Recovery links return tokens in the URL hash
        const hash = window.location.hash.startsWith("#")
          ? window.location.hash.slice(1)
          : window.location.hash;
        const params = new URLSearchParams(hash);
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        const type = params.get("type");
        const errorDescription = params.get("error_description");

        if (errorDescription) {
          toast.error(decodeURIComponent(errorDescription));
          setChecking(false);
          return;
        }

        if (accessToken && refreshToken && type === "recovery") {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) throw error;
          // Clean URL
          window.history.replaceState(null, "", window.location.pathname);
          setValidSession(true);
          setChecking(false);
          return;
        }

        // Fallback: existing session (e.g. Supabase already handled the hash)
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          setValidSession(true);
        }
        setChecking(false);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Link inválido ou expirado.");
        setChecking(false);
      }
    };
    void init();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (password.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast.error(error.message || "Erro ao atualizar senha.");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    setTimeout(() => navigate("/", { replace: true }), 1600);
  };

  return (
    <div className="relative min-h-screen w-full bg-background text-foreground">
      <style>{`
        .nl-input:focus,
        .nl-input:focus-visible {
          border-color: hsl(var(--primary) / 0.6) !important;
          box-shadow: 0 0 0 3px hsl(var(--primary) / 0.15);
          outline: none;
        }
      `}</style>

      <div className="relative mx-auto flex min-h-screen w-full max-w-[440px] flex-col justify-center px-6 py-10">
        {checking ? (
          <div className="flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : success ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-[26px] font-bold tracking-tight leading-tight mb-3">
              Senha redefinida
            </h1>
            <p className="text-[15px] text-muted-foreground">
              Redirecionando você para o app...
            </p>
          </motion.div>
        ) : !validSession ? (
          <div className="text-center">
            <h1 className="text-[26px] font-bold tracking-tight leading-tight mb-3">
              Link inválido
            </h1>
            <p className="text-[15px] text-muted-foreground mb-8">
              Este link de recuperação é inválido ou expirou. Solicite um novo email de recuperação.
            </p>
            <Button
              onClick={() => navigate("/forgot-password", { replace: true })}
              className="w-full h-12 rounded-xl font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Solicitar novo link
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-10">
              <h1 className="text-[26px] font-bold tracking-tight leading-tight">
                Nova senha
              </h1>
              <p className="mt-2 text-[15px] text-muted-foreground">
                Escolha uma nova senha para sua conta.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[15px] font-semibold">Nova senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="nl-input h-12 pr-11 rounded-xl bg-secondary/30 border-border/60 placeholder:text-muted-foreground/50 transition-all"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70 hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm" className="text-[15px] font-semibold">Confirmar senha</Label>
                <Input
                  id="confirm"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="nl-input h-12 rounded-xl bg-secondary/30 border-border/60 placeholder:text-muted-foreground/50 transition-all"
                  required
                  minLength={6}
                />
              </div>

              <div className="pt-3">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl font-semibold text-[15px] bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_8px_24px_-8px_hsl(var(--primary)/0.6)] transition-all"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Redefinir senha"}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
