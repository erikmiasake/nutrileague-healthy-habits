import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "w-7 h-7 text-[10px]",
  md: "w-9 h-9 text-xs",
  lg: "w-12 h-12 text-sm",
  xl: "w-20 h-20 text-2xl",
};

// Vivid palette derived from brand tokens — never grey
const FALLBACK_PALETTE = [
  { bg: "bg-primary/20 border-primary/40", fg: "text-primary" },
  { bg: "bg-xp/20 border-xp/40", fg: "text-xp" },
  { bg: "bg-success/20 border-success/40", fg: "text-success" },
  { bg: "bg-accent/25 border-accent/50", fg: "text-accent-foreground" },
  { bg: "bg-[hsl(340_82%_52%/0.2)] border-[hsl(340_82%_52%/0.45)]", fg: "text-[hsl(340_82%_62%)]" },
  { bg: "bg-[hsl(260_75%_60%/0.2)] border-[hsl(260_75%_60%/0.45)]", fg: "text-[hsl(260_75%_72%)]" },
  { bg: "bg-[hsl(190_80%_50%/0.2)] border-[hsl(190_80%_50%/0.45)]", fg: "text-[hsl(190_80%_60%)]" },
];

function hashName(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return h;
}

const UserAvatar = ({ name, avatarUrl, size = "md", className }: UserAvatarProps) => {
  const initials = name
    .split(" ")
    .map(w => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const palette = FALLBACK_PALETTE[hashName(name) % FALLBACK_PALETTE.length];

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-display font-bold shrink-0 overflow-hidden border-2",
        avatarUrl ? "bg-transparent border-border" : `${palette.bg} ${palette.fg}`,
        sizeClasses[size],
        className
      )}
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};

export default UserAvatar;
