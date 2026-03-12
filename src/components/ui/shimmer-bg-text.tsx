'use client';
import React from 'react';

interface TextHoverEffectProps {
  text?: string;
  className?: string;
  icon?: string;
}

export default function TextHoverEffect({ text = "Hover Me", className = "", icon }: TextHoverEffectProps) {
  return (
    <div className={`relative inline-flex items-center group cursor-pointer ${className}`}>
      {icon

      }
      <span className="relative z-10 text-base font-display font-extrabold text-foreground transition-colors duration-300 group-hover:text-primary-foreground/90 px-2.5 py-1.5">
        {text}
      </span>
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-shimmer -z-0"
        style={{
          background: "linear-gradient(90deg, hsl(24 80% 30% / 0.85) 0%, hsl(24 90% 40% / 0.85) 50%, hsl(24 80% 30% / 0.85) 100%)",
          backgroundSize: "200% 100%"
        }} />
      
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-shimmer {
          animation: shimmer 2.2s linear infinite;
        }
      `}</style>
    </div>);

}