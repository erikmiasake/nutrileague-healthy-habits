import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type Status = "loading" | "success" | "error";

const AuthConfirm = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("Confirmando seu email...");

  useEffect(() => {
    const run = async () => {
      try {
        // Supabase returns tokens in the URL hash after verify redirect
        const hash = window.location.hash.startsWith("#")
          ? window.location.hash.slice(1)
          : window.location.hash;
        const params = new URLSearchParams(hash);
        const errorDescription = params.get("error_description");
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");

        if (errorDescription) {
          setStatus("error");
          setMessage(decodeURIComponent(errorDescription));
          return;
        }

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) throw error;
          setStatus("success");
          setMessage("Email confirmado com sucesso!");
          return;
        }

        // Fallback: check if already signed in
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          setStatus("success");
          setMessage("Email confirmado com sucesso!");
        } else {
          setStatus("error");
          setMessage("Link inválido ou expirado.");
        }
      } catch (e) {
        setStatus("error");
        setMessage(e instanceof Error ? e.message : "Erro ao confirmar email.");
      }
    };
    void run();
  }, []);

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background px-6">
      <motion.div
        className="w-full max-w-[380px] text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div
          className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 ${
            status === "success"
              ? "bg-primary/10"
              : status === "error"
              ? "bg-destructive/10"
              : "bg-muted"
          }`}
        >
          {status === "loading" && <Loader2 size={36} className="text-muted-foreground animate-spin" />}
          {status === "success" && <CheckCircle2 size={36} className="text-primary" />}
          {status === "error" && <XCircle size={36} className="text-destructive" />}
        </div>

        <h1 className="text-2xl font-display font-bold mb-3">
          {status === "loading" && "Confirmando..."}
          {status === "success" && "Tudo certo!"}
          {status === "error" && "Ops!"}
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed mb-8">{message}</p>

        {status === "success" && (
          <Button
            onClick={() => navigate("/", { replace: true })}
            className="w-full h-12 rounded-xl font-semibold"
          >
            Entrar no NutriLeague
          </Button>
        )}
        {status === "error" && (
          <Button
            onClick={() => navigate("/login", { replace: true })}
            variant="outline"
            className="w-full h-12 rounded-xl font-semibold"
          >
            Voltar ao login
          </Button>
        )}
      </motion.div>
    </div>
  );
};

export default AuthConfirm;
