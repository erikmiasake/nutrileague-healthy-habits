import nutrileagueLogo from "@/assets/nutrileague-logo.png.asset.json";
import { cn } from "@/lib/utils";

interface NutriLeagueLogoProps {
  /** Altura do ícone (Tailwind class), ex: "h-7", "h-9", "h-12" */
  iconSize?: string;
  /** Tamanho do texto (Tailwind class ou arbitrary), ex: "text-[22px]", "text-3xl" */
  textSize?: string;
  /** Esconder o texto (apenas ícone) */
  iconOnly?: boolean;
  /** Esconder o ícone (apenas texto) */
  textOnly?: boolean;
  className?: string;
}

/**
 * Logo oficial do NutriLeague — ícone da chama + wordmark em Poppins bold.
 * Alinhamento e proporções calibrados para casar com o logo de referência.
 */
export function NutriLeagueLogo({
  iconSize = "h-7",
  textSize = "text-[22px]",
  iconOnly = false,
  textOnly = false,
  className,
}: NutriLeagueLogoProps) {
  return (
    <div className={cn("flex items-end gap-0.5", className)}>
      {!textOnly && (
        <img
          src={nutrileagueLogo.url}
          alt="NutriLeague"
          className={cn(iconSize, "w-auto")}
        />
      )}
      {!iconOnly && (
        <span
          className={cn(
            textSize,
            "font-bold text-foreground tracking-tight leading-none",
          )}
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          NutriLeague
        </span>
      )}
    </div>
  );
}
