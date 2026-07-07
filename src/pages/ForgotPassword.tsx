"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast.error("Erro ao enviar email. Tente novamente.");
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
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
        <Link
          to="/login"
          className="absolute top-8 left-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>

        {sent ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Mail className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-[26px] font-bold tracking-tight leading-tight mb-3">
              Email enviado
            </h1>
            <p className="text-[15px] text-muted-foreground leading-relaxed mb-8">
              Enviamos um link de recuperação para{" "}
              <span className="text-foreground font-medium">{email}</span>. Verifique sua caixa de entrada e clique no link para redefinir sua senha.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => { setSent(false); setEmail(""); }}
              className="w-full h-12 rounded-xl border-border/60 bg-secondary/40 hover:bg-secondary/70 font-medium"
            >
              Enviar para outro email
            </Button>
          </motion.div>
        ) : (
          <>
            <div className="mb-10">
              <h1 className="text-[26px] font-bold tracking-tight leading-tight">
                Recuperar senha
              </h1>
              <p className="mt-2 text-[15px] text-muted-foreground">
                Digite seu email e enviaremos um link para você redefinir sua senha.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[15px] font-semibold">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="voce@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="nl-input h-12 rounded-xl bg-secondary/30 border-border/60 placeholder:text-muted-foreground/50 transition-all"
                  required
                />
              </div>

              <div className="pt-3">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl font-semibold text-[15px] bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_8px_24px_-8px_hsl(var(--primary)/0.6)] transition-all"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Enviar link"}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
