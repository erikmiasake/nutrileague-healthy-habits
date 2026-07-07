import nutrileagueLogo from "@/assets/nutrileague-logo.png.asset.json";
import { cn } from "@/lib/utils";

/**
 * Tamanhos padronizados da logo (mobile-first).
 * Use estes presets em vez de valores arbitrários para manter consistência.
 */
const SIZE_PRESETS = {
  sm: { icon: "h-7", text: "text-[22px]" },   // header / navbar
  md: { icon: "h-10", text: "text-[32px]" },  // cards, seções internas
  lg: { icon: "h-14", text: "text-5xl" },     // splash / hero
} as const;

type LogoSize = keyof typeof SIZE_PRESETS;

interface NutriLeagueLogoProps {
  /** Tamanho padronizado: "sm" (header, padrão), "md" (interno), "lg" (splash) */
  size?: LogoSize;
  /** Esconder o texto (apenas ícone) */
  iconOnly?: boolean;
  /** Esconder o ícone (apenas texto) */
  textOnly?: boolean;
  className?: string;
}

/**
 * Logo oficial do NutriLeague — ícone da chama + wordmark em Poppins bold.
 * Sempre use os tamanhos padrão via prop `size` para manter consistência.
 */
export function NutriLeagueLogo({
  size = "sm",
  iconOnly = false,
  textOnly = false,
  className,
}: NutriLeagueLogoProps) {
  const { icon, text } = SIZE_PRESETS[size];

  return (
    <div className={cn("flex items-end gap-0.5", className)}>
      {!textOnly && (
        <img
          src={nutrileagueLogo.url}
          alt="NutriLeague"
          className={cn(icon, "w-auto")}
        />
      )}
      {!iconOnly && (
        <span
          className={cn(
            text,
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

