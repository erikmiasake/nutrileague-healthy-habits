"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type Variant =
  | "default"
  | "secondary"
  | "destructive"
  | "red"
  | "blue"
  | "green"
  | "yellow"
  | "purple"
  | "pink"
  | "orange"
  | "cyan"
  | "indigo"
  | "violet"
  | "rose"
  | "amber"
  | "lime"
  | "emerald"
  | "sky"
  | "slate"
  | "fuchsia";

interface ShimmerTextProps {
  children: React.ReactNode;
  className?: string;
  variant?: Variant;
  duration?: number;
  delay?: number;
  spread?: number;
}

const variantMap: Record<Variant, string> = {
  default: "",
  secondary: "text-secondary-foreground",
  destructive: "text-destructive dark:text-destructive-foreground",
  red: "text-red-600 dark:text-red-400",
  blue: "text-blue-600 dark:text-blue-400",
  green: "text-green-600 dark:text-green-400",
  yellow: "text-yellow-600 dark:text-yellow-400",
  purple: "text-purple-600 dark:text-purple-400",
  pink: "text-pink-600 dark:text-pink-400",
  orange: "text-orange-600 dark:text-orange-400",
  cyan: "text-cyan-600 dark:text-cyan-400",
  indigo: "text-indigo-600 dark:text-indigo-400",
  violet: "text-violet-600 dark:text-violet-400",
  rose: "text-rose-600 dark:text-rose-400",
  amber: "text-amber-600 dark:text-amber-400",
  lime: "text-lime-600 dark:text-lime-400",
  emerald: "text-emerald-600 dark:text-emerald-400",
  sky: "text-sky-600 dark:text-sky-400",
  slate: "text-slate-600 dark:text-slate-400",
  fuchsia: "text-fuchsia-600 dark:text-fuchsia-400",
};

export function ShimmerText({
  children,
  className,
  variant = "default",
  duration = 1.5,
  delay = 1.5,
}: ShimmerTextProps) {
  return (
    <span className={cn("relative inline-block", variantMap[variant], className)}>
      <motion.span
        className="absolute inset-0 overflow-hidden"
        style={{ WebkitMaskImage: `linear-gradient(-75deg, hsl(var(--primary)) calc(var(--shimmer-x) - 25%), transparent calc(var(--shimmer-x)), hsl(var(--primary)) calc(var(--shimmer-x) + 25%))` } as React.CSSProperties}
        initial={{ "--shimmer-x": "-100%" } as any}
        animate={{ "--shimmer-x": "200%" } as any}
        transition={{
          repeat: Infinity,
          repeatType: "loop",
          duration,
          delay,
          ease: "linear",
        }}
      >
        <span className="opacity-50">
          {children}
        </span>
      </motion.span>
      {children}
    </span>
  );
}

export default ShimmerText;
