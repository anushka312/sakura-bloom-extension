import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { AppState, REWARDS } from '../types';
import { Card } from './UI';
import { Award, Check, X, TrendingUp, Zap, Heart, Calendar } from 'lucide-react';
import { cn } from '../utils';
import { ContributionGraph } from './ContributionGraph';

interface AnalysisProps {
  state: AppState;
}

export function Analysis({ state }: AnalysisProps) {
  // Prepare data for Ritual Completion (Last 7 days)
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const ritualData = last7Days.map(date => ({
    date: date.split('-').slice(1).join('/'),
    completed: state.logs[date]?.length || 0,
    total: state.rituals.length
  }));

  // Prepare data for Focus Sessions (Last 7 days)
  const focusData = last7Days.map(date => ({
    date: date.split('-').slice(1).join('/'),
    minutes: state.focusSessions
      .filter(s => s.date === date)
      .reduce((acc, s) => acc + s.duration, 0)
  }));

  // Prepare data for Moods
  const moodCounts: Record<string, number> = {};
  Object.values(state.reflections).forEach(r => {
    moodCounts[r.mood] = (moodCounts[r.mood] || 0) + 1;
  });
  const moodData = Object.entries(moodCounts).map(([name, value]) => ({ name, value }));
  const COLORS = ['#F3A2BE', '#A2D2FF', '#BDE0FE', '#FFC8DD', '#FFAFCC'];

  return (
    <div className="space-y-8 pb-10">
      {/* Global Contribution Graph */}
      <Card className="p-8 overflow-hidden bg-white/60 backdrop-blur-md border-dashed">
        <h3 className="text-xl font-display mb-8 flex items-center gap-3">
          <Calendar size={48} className="text-[var(--color-primary)]" /> Garden Bloom History
        </h3>
        <ContributionGraph state={state} />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ritual Trends */}
        <Card className="p-6">
          <h3 className="text-lg font-display mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-[var(--color-primary)]" /> Ritual Consistency
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ritualData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '4px solid black', fontFamily: 'sans-serif' }}
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                />
                <Bar dataKey="completed" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Focus Trends */}
        <Card className="p-6">
          <h3 className="text-lg font-display mb-6 flex items-center gap-2">
            <Zap size={20} className="text-yellow-500" /> Focus Energy (min)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={focusData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '4px solid black', fontFamily: 'sans-serif' }}
                />
                <Line type="monotone" dataKey="minutes" stroke="var(--color-accent)" strokeWidth={4} dot={{ r: 6, fill: 'var(--color-accent)' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Mood Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-display mb-6 flex items-center gap-2">
            <Heart size={20} className="text-red-400" /> Garden Moods
          </h3>
          <div className="h-64 w-full flex items-center justify-center">
            {moodData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={moodData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {moodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="opacity-40 italic">No mood data yet...</p>
            )}
          </div>
        </Card>

        {/* Stats Summary */}
        <Card className="p-6 bg-[var(--color-primary)]/5">
          <h3 className="text-lg font-display mb-6">Quick Insights</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-60">Best Streak</span>
              <span className="font-bold text-xl">🔥 {state.stats.bestStreak} days</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-60">Total Rituals Done</span>
              <span className="font-bold text-xl">🌸 {state.stats.totalCompleted}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-60">Focus Level</span>
              <span className="font-bold text-xl">⚡ {Math.floor(state.focusSessions.reduce((acc, s) => acc + s.duration, 0) / 60)}h total</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Rewards & Achievements Section */}
      <section className="space-y-6">
        <h3 className="text-2xl font-display flex items-center gap-2">
          <Award size={28} className="text-[var(--color-primary)]" /> Your Achievements
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {REWARDS.map(reward => {
            const isUnlocked = state.level >= reward.level;
            return (
              <Card key={reward.id} className={cn(
                "relative overflow-hidden transition-all border-4",
                isUnlocked ? "border-[var(--color-text)] bg-white shadow-[4px_4px_0px_var(--color-text)]" : "opacity-40 grayscale border-dashed border-black/10"
              )}>
                <div className="flex items-center gap-4">
                  <div className="text-5xl">{reward.name.split(' ')[0]}</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg leading-tight">{reward.name.split(' ').slice(1).join(' ')}</h4>
                    <p className="text-[10px] opacity-60 mt-1">{reward.description}</p>
                    {!isUnlocked && (
                      <div className="mt-2 flex items-center gap-1 text-[10px] font-mono text-[var(--color-primary)] font-bold uppercase">
                        <X size={10} /> Unlocks at Level {reward.level}
                      </div>
                    )}
                    {isUnlocked && (
                      <div className="mt-2 flex items-center gap-1 text-[10px] font-mono text-green-500 font-bold uppercase">
                        <Check size={10} /> Achieved
                      </div>
                    )}
                  </div>
                </div>
                {isUnlocked && (
                  <div className="absolute top-0 right-0 w-10 h-10 bg-[var(--color-primary)]/10 rounded-bl-full flex items-center justify-center">
                    <Check size={16} className="text-[var(--color-primary)]" />
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
