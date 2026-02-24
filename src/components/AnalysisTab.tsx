import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { Card } from './UI';
import { AppState } from '../types';

interface AnalysisTabProps {
  state: AppState;
}

export const AnalysisTab = ({ state }: AnalysisTabProps) => {
  // Prepare data for completion trend (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    return {
      name: d.toLocaleDateString('en-US', { weekday: 'short' }),
      completions: state.logs[dateStr]?.length || 0,
      tasks: state.tasks.filter(t => t.date === dateStr && t.completed).length
    };
  });

  // Prepare data for focus time
  const focusData = state.focusSessions.reduce((acc: any[], session) => {
    const existing = acc.find(d => d.name === session.type);
    if (existing) {
      existing.value += session.duration;
    } else {
      acc.push({ name: session.type, value: session.duration });
    }
    return acc;
  }, []);

  const COLORS = ['#F3A2BE', '#81BFB7', '#704E98', '#FFAC54'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-display mb-4">Completion Trend</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={last7Days}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '2px solid var(--color-text)',
                    borderRadius: '8px',
                    fontFamily: 'inherit'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="completions" 
                  stroke="var(--color-primary)" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: 'var(--color-primary)' }}
                  name="Rituals"
                />
                <Line 
                  type="monotone" 
                  dataKey="tasks" 
                  stroke="var(--color-accent)" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: 'var(--color-accent)' }}
                  name="Tasks"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-display mb-4">Focus Distribution (min)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={focusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {focusData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {focusData.map((d: any, i: number) => (
              <div key={i} className="flex items-center gap-1 text-[10px] font-bold uppercase">
                <div className="w-2 h-2" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                {d.name}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-display mb-4">Ritual Consistency</h3>
        <div className="space-y-4">
          {state.rituals.map(ritual => {
            const completionRate = state.stats.totalCompleted > 0 
              ? Math.round((ritual.streak / (Object.keys(state.logs).length || 1)) * 100)
              : 0;
            return (
              <div key={ritual.id} className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span>{ritual.name}</span>
                  <span>{ritual.streak} Day Streak</span>
                </div>
                <div className="w-full bg-black/5 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[var(--color-primary)] transition-all duration-1000" 
                    style={{ width: `${Math.min(100, (ritual.streak / 30) * 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
