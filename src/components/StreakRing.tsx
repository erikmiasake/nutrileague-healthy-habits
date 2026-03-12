interface StreakRingProps {
  days: number;
  goal?: number;
}

const StreakRing = ({ days, goal = 30 }: StreakRingProps) => {
  const progress = Math.min(days / goal, 1);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
        <circle
          cx="60" cy="60" r={radius} fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-display font-bold text-primary animate-pulse-streak">{days}</span>
        <span className="text-xs text-muted-foreground font-medium">dias</span>
      </div>
    </div>
  );
};

export default StreakRing;
