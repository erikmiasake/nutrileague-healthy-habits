'use client'
import React from 'react';

interface TextHoverEffectProps {
  text?: string;
  className?: string;
}

export default function TextHoverEffect({ text = "Hover Me", className = "" }: TextHoverEffectProps) {
  return (
    <div className={`relative inline-block group cursor-pointer ${className}`}>
      <span className="relative z-10 text-4xl font-display font-extrabold text-foreground transition-colors duration-300 group-hover:text-primary-foreground px-4 py-2">
        {text}
      </span>
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-shimmer -z-0"
        style={{
          background: "linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--streak-glow)) 50%, hsl(var(--primary)) 100%)",
          backgroundSize: "200% 100%",
        }}
      />
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-shimmer {
          animation: shimmer 2.2s linear infinite;
        }
      `}</style>
    </div>
  );
}
