import { motion } from "framer-motion";
import { Trophy, Zap, ShieldCheck, Leaf, Factory, Cookie, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface MealScoreProps {
  score: number;
  classification: string;
  xp: number;
  hasProtein: boolean;
  hasVegetables: boolean;
  processingLevel: string;
  junkLevel: string;
  report?: string | null;
}

const classColors: Record<string, string> = {
  Excelente: "text-success",
  Boa: "text-primary",
  Regular: "text-streak",
  Ruim: "text-destructive",
};

const classBgColors: Record<string, string> = {
  Excelente: "bg-success/15 border-success/30",
  Boa: "bg-primary/15 border-primary/30",
  Regular: "bg-streak/15 border-streak/30",
  Ruim: "bg-destructive/15 border-destructive/30",
};

const classRingColors: Record<string, string> = {
  Excelente: "stroke-success",
  Boa: "stroke-primary",
  Regular: "stroke-streak",
  Ruim: "stroke-destructive",
};

const processingLabels: Record<string, string> = {
  baixo: "Baixo",
  medio: "Médio",
  alto: "Alto",
};

const junkLabels: Record<string, string> = {
  nenhum: "Nenhum",
  moderado: "Moderado",
  alto: "Alto",
};

export default function MealScoreCard({
  score,
  classification,
  xp,
  hasProtein,
  hasVegetables,
  processingLevel,
  junkLevel,
  report,
}: MealScoreProps) {
  const circumference = 2 * Math.PI * 42;
  const strokeDash = (score / 100) * circumference;

  return (
    <motion.div
      className={cn("rounded-2xl border p-5 card-elevated", classBgColors[classification] || "bg-card border-border")}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
    >
      {/* Score ring + classification */}
      <div className="flex items-center gap-5 mb-5">
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--secondary))" strokeWidth="6" />
            <motion.circle
              cx="50" cy="50" r="42" fill="none"
              className={classRingColors[classification] || "stroke-primary"}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: circumference - strokeDash }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className={cn("text-2xl font-display font-extrabold", classColors[classification] || "text-foreground")}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, type: "spring" }}
            >
              {score}
            </motion.span>
            <span className="text-[9px] text-muted-foreground font-medium">/ 100</span>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <Trophy size={16} className={classColors[classification] || "text-primary"} />
            <span className={cn("text-lg font-display font-bold", classColors[classification] || "text-foreground")}>
              {classification}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap size={14} className="text-xp" />
            <span className="text-sm font-bold text-xp">+{xp} XP</span>
          </div>
        </div>
      </div>

      {/* Criteria breakdown */}
      <div className="grid grid-cols-2 gap-2">
        <CriteriaChip
          icon={<ShieldCheck size={13} />}
          label="Proteína"
          value={hasProtein ? "Sim" : "Não"}
          positive={hasProtein}
        />
        <CriteriaChip
          icon={<Leaf size={13} />}
          label="Vegetais"
          value={hasVegetables ? "Sim" : "Não"}
          positive={hasVegetables}
        />
        <CriteriaChip
          icon={<Factory size={13} />}
          label="Processamento"
          value={processingLabels[processingLevel] || processingLevel}
          positive={processingLevel === "baixo"}
        />
        <CriteriaChip
          icon={<Cookie size={13} />}
          label="Junk food"
          value={junkLabels[junkLevel] || junkLevel}
          positive={junkLevel === "nenhum"}
        />
      </div>
    </motion.div>
  );
}

function CriteriaChip({
  icon,
  label,
  value,
  positive,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  positive: boolean;
}) {
  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium",
      positive
        ? "bg-success/10 border-success/20 text-success"
        : "bg-destructive/10 border-destructive/20 text-destructive"
    )}>
      {icon}
      <div>
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className="font-bold">{value}</p>
      </div>
    </div>
  );
}
