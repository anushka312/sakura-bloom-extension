import React from 'react';
import { cn } from '../utils';

interface RitualStreakGraphProps {
  ritualId: string;
  logs: Record<string, string[]>;
  days?: number;
  variant?: 'compact' | 'large';
}

export const RitualStreakGraph = ({ ritualId, logs, days = 56, variant = 'compact' }: RitualStreakGraphProps) => {
  const today = new Date();
  
  const actualDays = variant === 'large' ? 140 : days; // 20 weeks for large
  
  // Generate last N days
  const data = Array.from({ length: actualDays }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (actualDays - 1 - i));
    const dateStr = d.toISOString().split('T')[0];
    const isCompleted = logs[dateStr]?.includes(ritualId);
    return { dateStr, isCompleted };
  });

  // Group into weeks (columns of 7)
  const weeks: { dateStr: string; isCompleted: boolean }[][] = [];
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7));
  }

  const cellSize = variant === 'large' ? 'w-3 h-3' : 'w-1.5 h-1.5';
  const gap = variant === 'large' ? 'gap-1.5' : 'gap-1';

  return (
    <div className={cn("flex w-fit rounded-md", variant === 'large' ? "gap-1.5 p-4 bg-white/40 border-4 border-[var(--color-text)] shadow-[4px_4px_0px_var(--color-text)]" : "gap-1 p-1 bg-black/[0.02]")}>
      {weeks.map((week, weekIndex) => (
        <div key={weekIndex} className={cn("flex flex-col", gap)}>
          {week.map((day, dayIndex) => (
            <div
              key={day.dateStr}
              title={day.dateStr}
              className={cn(
                cellSize,
                "rounded-[2px] transition-all duration-300",
                day.isCompleted 
                  ? "bg-[var(--color-primary)] scale-110 shadow-[0_0_8px_var(--color-primary)]" 
                  : "bg-black/[0.05]"
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
};
