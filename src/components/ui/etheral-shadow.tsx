'use client';

import React, { useRef, useId, useEffect, CSSProperties } from 'react';
import { animate, useMotionValue, AnimationPlaybackControls } from 'framer-motion';

interface AnimationConfig {
  preview?: boolean;
  scale: number;
  speed: number;
}

interface NoiseConfig {
  opacity: number;
  scale: number;
}

interface EtheralShadowProps {
  color?: string;
  animation?: AnimationConfig;
  noise?: NoiseConfig;
  style?: CSSProperties;
  className?: string;
}

function mapRange(
  value: number,
  fromLow: number,
  fromHigh: number,
  toLow: number,
  toHigh: number
): number {
  if (fromLow === fromHigh) return toLow;
  const percentage = (value - fromLow) / (fromHigh - fromLow);
  return toLow + percentage * (toHigh - toLow);
}

const useInstanceId = (): string => {
  const id = useId();
  const cleanId = id.replace(/:/g, '');
  return `shadowoverlay-${cleanId}`;
};

export function EtheralShadow({
  color = 'rgba(128, 128, 128, 1)',
  animation,
  noise,
  style,
  className,
}: EtheralShadowProps) {
  const id = useInstanceId();
  const animationEnabled = animation && animation.scale > 0;
  const feColorMatrixRef = useRef<SVGFEColorMatrixElement>(null);
  const hueRotateMotionValue = useMotionValue(180);
  const hueRotateAnimation = useRef<AnimationPlaybackControls | null>(null);

  const displacementScale = animation ? mapRange(animation.scale, 1, 100, 20, 100) : 0;
  const animationDuration = animation ? mapRange(animation.speed, 1, 100, 1000, 50) : 1;

  useEffect(() => {
    if (feColorMatrixRef.current && animationEnabled) {
      if (hueRotateAnimation.current) {
        hueRotateAnimation.current.stop();
      }
      hueRotateMotionValue.set(0);
      hueRotateAnimation.current = animate(hueRotateMotionValue, 360, {
        duration: animationDuration / 25,
        repeat: Infinity,
        repeatType: 'loop',
        repeatDelay: 0,
        ease: 'linear',
        delay: 0,
        onUpdate: (value: number) => {
          if (feColorMatrixRef.current) {
            feColorMatrixRef.current.setAttribute('values', String(value));
          }
        },
      });

      return () => {
        if (hueRotateAnimation.current) {
          hueRotateAnimation.current.stop();
        }
      };
    }
  }, [animationEnabled, animationDuration, hueRotateMotionValue]);

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 50% 50%, ${color}, transparent 70%)`,
          filter: animationEnabled ? `url(#${id}-filter)` : undefined,
        }}
      >
        {animationEnabled && (
          <svg style={{ position: 'absolute', width: 0, height: 0 }}>
            <defs>
              <filter id={`${id}-filter`}>
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.01"
                  numOctaves={3}
                  seed={2}
                  result="turbulence"
                />
                <feColorMatrix
                  ref={feColorMatrixRef}
                  type="hueRotate"
                  values="180"
                  in="turbulence"
                  result="hueRotated"
                />
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="hueRotated"
                  scale={displacementScale}
                  xChannelSelector="R"
                  yChannelSelector="G"
                />
              </filter>
            </defs>
          </svg>
        )}
      </div>

      {noise && noise.opacity > 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: noise.opacity,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundSize: `${noise.scale * 100}%`,
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  );
}
