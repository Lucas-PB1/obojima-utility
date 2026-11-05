import React from 'react';

interface XpBarProps {
  progress: number;
  className?: string;
  label?: string;
}

export function XpBar({ progress, className = 'h-2', label }: XpBarProps) {
  const percent = Math.round(Math.min(1, Math.max(0, progress)) * 100);
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      aria-label={label}
      className={`relative w-full overflow-hidden rounded-full bg-totoro-blue/10 ${className}`}
    >
      <div
        className="xp-bar-shine relative h-full overflow-hidden rounded-full bg-gradient-to-r from-totoro-green to-totoro-blue transition-[width] duration-700 ease-out"
        style={{ width: `${Math.max(percent, 3)}%` }}
      />
    </div>
  );
}
