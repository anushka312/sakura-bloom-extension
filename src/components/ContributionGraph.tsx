import React from 'react';
import { AppState } from '../types';
import { cn } from '../utils';

interface ContributionGraphProps {
  state: AppState;
}

export const ContributionGraph = ({ state }: ContributionGraphProps) => {
  const today = new Date();
  const daysToShow = 182; // 26 weeks (approx 6 months)
  
  const dates = [...Array(daysToShow)].map((_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (daysToShow - 1 - i));
    return d.toISOString().split('T')[0];
  });

  const getIntensity = (date: string) => {
    const ritualCount = state.logs[date]?.length || 0;
    const taskCount = state.tasks.filter(t => t.date === date && t.completed).length;
    const total = ritualCount + taskCount;
    
    if (total === 0) return 'bg-black/[0.03]';
    if (total === 1) return 'bg-[var(--color-primary)] opacity-25';
    if (total === 2) return 'bg-[var(--color-primary)] opacity-50';
    if (total === 3) return 'bg-[var(--color-primary)] opacity-75';
    return 'bg-[var(--color-primary)]';
  };

  // Group dates into weeks (columns)
  const weeks: string[][] = [];
  for (let i = 0; i < dates.length; i += 7) {
    weeks.push(dates.slice(i, i + 7));
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="relative pt-8">
        {/* Month Labels */}
        <div className="absolute top-0 left-0 w-full flex text-[10px] font-mono uppercase font-bold opacity-40 pointer-events-none">
          {weeks.map((week, i) => {
            const date = new Date(week[0]);
            const isFirstWeekOfMonth = date.getDate() <= 7;
            if (isFirstWeekOfMonth || i === 0) {
              return (
                <div key={i} className="absolute" style={{ left: `${i * 19}px` }}>
                  {months[date.getMonth()]}
                </div>
              );
            }
            return null;
          })}
        </div>

        <div className="flex gap-[4px] overflow-x-auto pb-4 scrollbar-hide no-scrollbar">
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="flex flex-col gap-[4px]">
              {week.map(date => {
                const ritualCount = state.logs[date]?.length || 0;
                const taskCount = state.tasks.filter(t => t.date === date && t.completed).length;
                const total = ritualCount + taskCount;
                
                return (
                  <div 
                    key={date}
                    title={`${date}: ${total} activities (${ritualCount} rituals, ${taskCount} tasks)`}
                    className={cn(
                      "w-[15px] h-[15px] rounded-[3px] transition-all hover:ring-2 hover:ring-[var(--color-text)] hover:z-10 cursor-help",
                      getIntensity(date)
                    )}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-dashed border-black/10 pt-4">
        <div className="flex gap-4 text-[11px] font-mono uppercase font-bold opacity-50">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-[var(--color-primary)]" /> Activity Intensity
          </div>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono uppercase font-bold opacity-50">
          <span>Less</span>
          <div className="flex gap-[3px]">
            <div className="w-[12px] h-[12px] rounded-[2px] bg-black/[0.03]" />
            <div className="w-[12px] h-[12px] rounded-[2px] bg-[var(--color-primary)] opacity-25" />
            <div className="w-[12px] h-[12px] rounded-[2px] bg-[var(--color-primary)] opacity-50" />
            <div className="w-[12px] h-[12px] rounded-[2px] bg-[var(--color-primary)] opacity-75" />
            <div className="w-[12px] h-[12px] rounded-[2px] bg-[var(--color-primary)]" />
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
};
