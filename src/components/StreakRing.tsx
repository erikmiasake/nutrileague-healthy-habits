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
    <div className="relative w-32 h-32 flex items-center justify-center">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="hsl(var(--secondary))" strokeWidth="6" />
        <circle
          cx="60" cy="60" r={radius} fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-700 ease-out"
          style={{ filter: 'drop-shadow(0 0 6px hsl(var(--primary) / 0.4))' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-display font-bold text-primary animate-pulse-streak">{days}</span>
        <span className="text-[11px] text-muted-foreground font-medium">dias</span>
      </div>
    </div>
  );
};

export default StreakRing;
