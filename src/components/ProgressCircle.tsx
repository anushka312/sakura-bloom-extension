import React from 'react';
import { motion } from 'motion/react';

interface ProgressCircleProps {
  current: number;
  total: number;
  size?: number;
}

export const ProgressCircle = ({ current, total, size = 120 }: ProgressCircleProps) => {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = total > 0 ? (current / total) * 100 : 0;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--color-mint)"
          strokeWidth="10"
          fill="transparent"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--color-primary)"
          strokeWidth="10"
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-xl font-bold">{current} / {total}</span>
        <span className="text-[10px] uppercase opacity-50">Rituals</span>
      </div>
    </div>
  );
};
