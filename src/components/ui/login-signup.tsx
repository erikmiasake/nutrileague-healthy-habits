"use client";

import * as React from "react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { NutriLeagueLogo } from "@/components/NutriLeagueLogo";

const GoogleIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-1.9 1.4-4.4 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.6 39.6 16.2 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.6l6.2 5.2C41.6 35.7 44 30.3 44 24c0-1.3-.1-2.4-.4-3.5z" />
  </svg>
);

interface LoginCardSectionProps {
  isSignUp?: boolean;
  onToggleMode?: () => void;
  onSubmit?: (data: { email: string; password: string; name?: string }) => void;
  onGoogleLogin?: () => void;
  loading?: boolean;
}

export default function LoginCardSection({
  isSignUp: isSignUpProp,
  onToggleMode,
  onSubmit,
  onGoogleLogin,
  loading = false,
}: LoginCardSectionProps = {}) {
  const [internalIsSignUp, setInternalIsSignUp] = useState(false);
  const isSignUp = isSignUpProp !== undefined ? isSignUpProp : internalIsSignUp;

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.({ email, password, ...(isSignUp ? { name } : {}) });
  };

  const handleToggle = () => {
    if (onToggleMode) onToggleMode();
    else setInternalIsSignUp((v) => !v);
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


        {/* Title */}
        <div className="mb-10">
          <h1 className="text-[26px] font-bold tracking-tight leading-tight">
            {isSignUp ? "Crie sua conta" : "Entre na sua conta"}
          </h1>
          <p className="mt-2 text-[15px] text-muted-foreground">
            {isSignUp ? "Já tem conta?" : "Ainda não tem conta?"}{" "}
            <button
              type="button"
              onClick={handleToggle}
              className="font-semibold text-foreground hover:text-primary transition-colors"
            >
              {isSignUp ? "Entrar" : "Criar conta"}
            </button>
          </p>
        </div>

        {/* Google */}
        <Button
          type="button"
          variant="outline"
          onClick={onGoogleLogin}
          disabled={loading}
          className="w-full h-12 rounded-xl border-border/60 bg-secondary/40 hover:bg-secondary/70 text-foreground font-medium gap-3 transition-all"
        >
          <GoogleIcon className="h-[18px] w-[18px]" />
          Entrar com Google
        </Button>

        {/* Divider */}
        <div className="relative flex items-center py-6">
          <div className="flex-1 h-px bg-border/50" />
          <span className="px-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider bg-background">
            ou
          </span>
          <div className="flex-1 h-px bg-border/50" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[15px] font-semibold">Nome</Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="nl-input h-12 rounded-xl bg-secondary/30 border-border/60 placeholder:text-muted-foreground/50 transition-all"
                required
              />
            </div>
          )}

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

          <div className="space-y-2">
            <Label htmlFor="password" className="text-[15px] font-semibold">Senha</Label>
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

          <div className="pt-3">
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl font-semibold text-[15px] bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_8px_24px_-8px_hsl(var(--primary)/0.6)] transition-all"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : isSignUp ? (
                "Criar conta"
              ) : (
                "Entrar"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
