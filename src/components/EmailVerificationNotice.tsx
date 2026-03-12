import { motion } from "framer-motion";
import { Mail, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmailVerificationNoticeProps {
  email: string;
  onResend: () => void;
  onBack: () => void;
}

const EmailVerificationNotice = ({ email, onResend, onBack }: EmailVerificationNoticeProps) => {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background px-6">
      <motion.div
        className="w-full max-w-[380px] text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
      >
        {/* Icon */}
        <motion.div
          className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-8"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Mail size={36} className="text-primary" />
        </motion.div>

        <h1 className="text-2xl font-display font-bold mb-2">Verifique seu email</h1>
        <p className="text-sm text-muted-foreground leading-relaxed mb-2">
          Enviamos um link de verificação para
        </p>
        <p className="text-sm font-semibold text-foreground mb-8">{email}</p>

        <p className="text-xs text-muted-foreground leading-relaxed mb-8">
          Clique no link enviado para ativar sua conta. Após a verificação, você poderá fazer login normalmente.
        </p>

        <div className="space-y-3">
          <Button
            onClick={onResend}
            variant="outline"
            className="w-full h-12 rounded-xl font-semibold gap-2 border-border/60"
          >
            <RefreshCw size={16} />
            Reenviar email
          </Button>

          <Button
            onClick={onBack}
            variant="ghost"
            className="w-full h-12 rounded-xl font-semibold gap-2 text-muted-foreground"
          >
            <ArrowLeft size={16} />
            Voltar ao login
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default EmailVerificationNotice;
