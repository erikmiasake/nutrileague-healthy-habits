'use client';
import React from 'react';

interface TextHoverEffectProps {
  text?: string;
  className?: string;
  icon?: string;
}

export default function TextHoverEffect({ text = "Hover Me", className = "" }: TextHoverEffectProps) {
  return (
    <span className={`text-base font-display font-extrabold text-foreground ${className}`}>
      {text}
    </span>
  );
}