import React from 'react';
import { GardenEvent } from '../types';
import { cn } from '../utils';

interface BloomGridProps {
  logs: Record<string, string[]>;
  events: GardenEvent[];
  onDayClick: (date: string) => void;
}

export const BloomGrid = ({ logs, events = [], onDayClick }: BloomGridProps) => {
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const monthName = today.toLocaleString('default', { month: 'long' });
  
  const cells = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const count = logs[dateStr]?.length || 0;
    const intensity = Math.min(4, count);
    const hasEvents = events.some(e => e.date === dateStr);
    
    return { dateStr, count, intensity, hasEvents };
  });

  return (
    <div className="mt-4">
      <h3 className="text-sm font-mono uppercase mb-4 opacity-60 text-center">{monthName} Bloom</h3>
      <div className="grid grid-cols-7 gap-2">
        {cells.map((cell, i) => (
          <button
            key={i}
            onClick={() => onDayClick(cell.dateStr)}
            className="w-full aspect-square border-2 border-[var(--color-text)] transition-all hover:scale-110 hover:z-10 flex items-center justify-center relative group"
            style={{
              backgroundColor: cell.intensity === 0 ? 'transparent' : `rgba(243, 162, 190, ${cell.intensity * 0.25 + 0.2})`
            }}
          >
            <span className="text-[10px] font-bold opacity-40 group-hover:opacity-100">{i + 1}</span>
            {cell.hasEvents && (
              <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full shadow-[0_0_4px_var(--color-primary)]" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
