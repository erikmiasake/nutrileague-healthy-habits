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
  <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-1.9 1.4-4.4 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.6 39.6 16.2 44 24 44z"/>
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.6l6.2 5.2C41.6 35.7 44 30.3 44 24c0-1.3-.1-2.4-.4-3.5z"/>
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
        .input-glow:focus,
        .input-glow:focus-visible {
          border-color: hsl(var(--primary) / 0.55) !important;
          box-shadow: 0 0 0 3px hsl(var(--primary) / 0.15), 0 0 18px -4px hsl(var(--primary) / 0.35);
          outline: none;
        }
      `}</style>

      {/* Warm radial glow (marca) + vignette */}
      <div
        className="pointer-events-none fixed inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 42%, hsl(24 90% 45% / 0.22) 0%, hsl(20 80% 20% / 0.10) 35%, transparent 70%), radial-gradient(ellipse at center, transparent 40%, hsl(var(--background)) 100%)",
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
          <Card className="border-border/50 bg-card/80 backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6),0_8px_30px_-10px_hsl(var(--primary)/0.25)] rounded-2xl overflow-hidden">
            <CardHeader className="text-center pt-9 pb-2 px-8">
              <div className="flex justify-center mb-4">
                <NutriLeagueLogo size="md" />
              </div>
              <CardTitle className="text-[1.6rem] font-bold leading-tight tracking-tight">
                {isSignUp ? "Crie sua conta" : "Bem-vindo de volta"}
              </CardTitle>
              <CardDescription className="text-muted-foreground text-[13px] mt-2 leading-relaxed">
                {isSignUp
                  ? "Comece hoje a construir hábitos que duram"
                  : "Sua jornada de hábitos saudáveis começa aqui"}
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
                        className="input-glow h-11 pl-10 rounded-xl bg-secondary/60 border-border/60 text-foreground placeholder:text-muted-foreground/50 transition-all"
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
                      className="input-glow h-11 pl-10 rounded-xl bg-secondary/60 border-border/60 text-foreground placeholder:text-muted-foreground/50 transition-all"

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
                      className="input-glow h-11 pl-10 pr-11 rounded-xl bg-secondary/60 border-border/60 text-foreground placeholder:text-muted-foreground/50 transition-all"
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
                  <GoogleIcon className="h-[18px] w-[18px]" />
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
