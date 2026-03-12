import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Flame, ArrowRight } from "lucide-react";

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 streak-glow">
            <Flame className="text-primary" size={32} />
          </div>
          <h1 className="text-3xl font-display font-bold">NutriLeague</h1>
          <p className="text-muted-foreground text-sm mt-1">Hábitos saudáveis, juntos.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <input
              type="text"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-12 rounded-lg bg-secondary px-4 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary transition"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-12 rounded-lg bg-secondary px-4 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary transition"
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-12 rounded-lg bg-secondary px-4 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary transition"
          />
          <button
            type="submit"
            className="w-full h-12 rounded-lg bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            {isSignUp ? "Criar conta" : "Entrar"}
            <ArrowRight size={18} />
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {isSignUp ? "Já tem conta?" : "Não tem conta?"}{" "}
          <button onClick={() => setIsSignUp(!isSignUp)} className="text-primary font-medium">
            {isSignUp ? "Entrar" : "Criar conta"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
