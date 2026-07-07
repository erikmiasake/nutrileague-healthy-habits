"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  User,
  Loader2,
} from "lucide-react";
import { NutriLeagueLogo } from "@/components/NutriLeagueLogo";

const GoogleIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      fill="#EA4335"
      d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.75-6-6.15S8.7 5.9 12 5.9c1.9 0 3.15.8 3.87 1.5l2.65-2.55C16.85 3.3 14.65 2.4 12 2.4 6.75 2.4 2.5 6.65 2.5 12s4.25 9.6 9.5 9.6c5.5 0 9.1-3.85 9.1-9.3 0-.62-.07-1.1-.16-1.6H12z"
    />
    <path
      fill="#34A853"
      d="M3.88 7.35l3.2 2.35C7.95 7.9 9.8 6.6 12 6.6c1.65 0 3.15.57 4.32 1.68l2.85-2.85C17.5 3.55 14.95 2.4 12 2.4 7.7 2.4 4 4.85 3.88 7.35z"
      opacity="0"
    />
    <path
      fill="#FBBC05"
      d="M12 21.6c2.85 0 5.25-.95 7-2.55l-3.35-2.6c-.9.65-2.1 1.05-3.65 1.05-2.8 0-5.2-1.9-6.05-4.5l-3.3 2.55C4.35 19.15 7.9 21.6 12 21.6z"
      opacity="0"
    />
    <path
      fill="#4285F4"
      d="M21.1 12.3c0-.62-.07-1.1-.16-1.6H12v3.9h5.5c-.22 1.28-1.5 3.75-5.5 3.75-3.3 0-6-2.75-6-6.15S8.7 5.9 12 5.9c1.9 0 3.15.8 3.87 1.5l2.65-2.55C16.85 3.3 14.65 2.4 12 2.4 6.75 2.4 2.5 6.65 2.5 12s4.25 9.6 9.5 9.6c5.5 0 9.1-3.85 9.1-9.3z"
      opacity="0"
    />
    <path fill="#4285F4" d="M21.35 12.24c0-.66-.06-1.3-.17-1.9H12v3.6h5.24c-.23 1.2-.92 2.22-1.96 2.9v2.4h3.17c1.86-1.72 2.9-4.25 2.9-7z"/>
    <path fill="#34A853" d="M12 21.6c2.64 0 4.85-.87 6.47-2.36l-3.17-2.4c-.87.6-2 .96-3.3.96-2.54 0-4.7-1.72-5.47-4.02H3.25v2.48C4.87 19.35 8.17 21.6 12 21.6z"/>
    <path fill="#FBBC05" d="M6.53 13.78A5.7 5.7 0 0 1 6.23 12c0-.62.1-1.22.28-1.78V7.74H3.25A9.6 9.6 0 0 0 2.4 12c0 1.55.37 3.02 1 4.32l3.13-2.54z"/>
    <path fill="#EA4335" d="M12 6.4c1.44 0 2.73.5 3.75 1.47l2.8-2.8C16.85 3.5 14.64 2.4 12 2.4c-3.83 0-7.13 2.25-8.75 5.34l3.28 2.48C7.3 8.12 9.46 6.4 12 6.4z"/>
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

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const setSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setSize();

    type P = { x: number; y: number; v: number; o: number };
    let ps: P[] = [];
    let raf = 0;

    const make = (): P => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      v: Math.random() * 0.25 + 0.05,
      o: Math.random() * 0.35 + 0.15,
    });

    const init = () => {
      ps = [];
      const count = Math.floor((canvas.width * canvas.height) / 9000);
      for (let i = 0; i < count; i++) ps.push(make());
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ps.forEach((p) => {
        p.y -= p.v;
        if (p.y < 0) {
          p.x = Math.random() * canvas.width;
          p.y = canvas.height + Math.random() * 40;
          p.v = Math.random() * 0.25 + 0.05;
          p.o = Math.random() * 0.35 + 0.15;
        }
        ctx.fillStyle = `rgba(251,146,60,${p.o * 0.4})`;
        ctx.fillRect(p.x, p.y, 0.7, 2.2);
      });
      raf = requestAnimationFrame(draw);
    };

    const onResize = () => {
      setSize();
      init();
    };

    window.addEventListener("resize", onResize);
    init();
    raf = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.({ email, password, ...(isSignUp ? { name } : {}) });
  };

  const handleToggle = () => {
    if (onToggleMode) {
      onToggleMode();
    } else {
      setInternalIsSignUp((v) => !v);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background">
      <style>{`
        @keyframes drawX{0%{transform:scaleX(0);opacity:0}60%{opacity:.95}100%{transform:scaleX(1);opacity:.7}}
        @keyframes drawY{0%{transform:scaleY(0);opacity:0}60%{opacity:.95}100%{transform:scaleY(1);opacity:.7}}
        .card-animate {
          opacity: 0;
          transform: translateY(20px);
          animation: fadeUp 0.8s cubic-bezier(.22,.61,.36,1) 0.4s forwards;
        }
        @keyframes fadeUp {
          to { opacity: 1; transform: translateY(0); }
        }
        .btn-glow {
          box-shadow: 0 0 20px hsl(var(--primary) / 0.3), 0 4px 12px hsl(var(--primary) / 0.2);
        }
        .btn-glow:hover {
          box-shadow: 0 0 28px hsl(var(--primary) / 0.4), 0 6px 16px hsl(var(--primary) / 0.3);
        }
      `}</style>

      {/* Subtle vignette */}
      <div
        className="pointer-events-none fixed inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, hsl(var(--background)) 100%)",
        }}
      />

      {/* Animated accent lines */}
      <div className="pointer-events-none fixed inset-0 z-[2] overflow-hidden opacity-50">
        {[20, 40, 60, 80].map((pos, i) => (
          <div
            key={`h-${i}`}
            className="absolute h-px w-full"
            style={{
              top: `${pos}%`,
              background:
                "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.08), transparent)",
              animation: `drawX 2.5s ease ${i * 0.3}s forwards`,
              transformOrigin: "left",
            }}
          />
        ))}
        {[25, 50, 75].map((pos, i) => (
          <div
            key={`v-${i}`}
            className="absolute w-px h-full"
            style={{
              left: `${pos}%`,
              background:
                "linear-gradient(180deg, transparent, hsl(var(--primary) / 0.06), transparent)",
              animation: `drawY 2.5s ease ${i * 0.4}s forwards`,
              transformOrigin: "top",
            }}
          />
        ))}
      </div>

      {/* Particles */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-[3]"
      />

      {/* Centered Login Card */}
      <div className="relative z-10 w-full max-w-[380px] px-5">
        <div className="card-animate">
          <Card className="border-border/40 bg-card/70 backdrop-blur-2xl shadow-[0_8px_40px_-12px_hsl(var(--primary)/0.15)] rounded-2xl overflow-hidden">
            <CardHeader className="text-center pt-10 pb-2 px-8">
              <CardTitle className="text-[1.75rem] font-bold leading-tight tracking-tight">
                {isSignUp ? "Criar conta" : "Seja Bem-Vindo"}
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm mt-1.5">
                {isSignUp
                  ? "Crie sua conta e comece a jogar"
                  : "Entre para continuar"}
              </CardDescription>
            </CardHeader>

            <CardContent className="px-8 pt-6 pb-2">
              <form onSubmit={handleSubmit} className="space-y-5">
                {isSignUp && (
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="text-xs font-medium text-muted-foreground"
                    >
                      Nome
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Seu nome"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-11 pl-10 rounded-xl bg-secondary/60 border-border/60 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 transition-all"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 pl-10 rounded-xl bg-secondary/60 border-border/60 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Senha
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Digite sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 pl-10 pr-11 rounded-xl bg-secondary/60 border-border/60 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 transition-all"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="pt-1">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-xl font-semibold text-[15px] gap-2 btn-glow transition-all duration-300"
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        {isSignUp ? "Criar conta" : "Entrar"}
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>

                {/* Divider */}
                <div className="relative flex items-center py-1">
                  <Separator className="flex-1 bg-border/40" />
                  <span className="px-3 text-[11px] text-muted-foreground/60 uppercase tracking-wider">
                    ou
                  </span>
                  <Separator className="flex-1 bg-border/40" />
                </div>

                {/* Google */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={onGoogleLogin}
                  className="w-full h-11 rounded-xl border-border/50 bg-secondary/30 hover:bg-secondary/60 text-foreground font-medium gap-2.5 transition-all"
                >
                  <Chrome className="h-4 w-4" />
                  Entrar com Google
                </Button>
              </form>
            </CardContent>

            <CardFooter className="flex justify-center pt-4 pb-8 px-8">
              <p className="text-sm text-muted-foreground">
                {isSignUp ? "Já tem conta?" : "Ainda não tem conta?"}{" "}
                <button
                  onClick={handleToggle}
                  className="text-primary font-semibold hover:underline underline-offset-2 transition-all"
                >
                  {isSignUp ? "Entrar" : "Criar conta"}
                </button>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
