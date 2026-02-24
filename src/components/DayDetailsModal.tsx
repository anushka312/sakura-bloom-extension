import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, ListTodo, StickyNote, Calendar, Plus, Trash2 } from 'lucide-react';
import { Card, Button } from './UI';
import { AppState } from '../types';
import { cn } from '../utils';

interface DayDetailsModalProps {
  date: string;
  state: AppState;
  onClose: () => void;
  onAddEvent: (text: string, date: string) => void;
  onDeleteEvent: (id: string) => void;
}

export const DayDetailsModal = ({ date, state, onClose, onAddEvent, onDeleteEvent }: DayDetailsModalProps) => {
  const ritualsDone = state.logs[date] || [];
  const tasksForDay = state.tasks.filter(t => t.date === date);
  const eventsForDay = state.events.filter(e => e.date === date);
  const reflection = state.reflections[date];
  const [newEventText, setNewEventText] = useState('');

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEventText.trim()) {
      onAddEvent(newEventText.trim(), date);
      setNewEventText('');
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-lg"
      >
        <Card className="max-h-[85vh] overflow-y-auto p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-display flex items-center gap-3">
              <span className="text-4xl">🌸</span> {date}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full">
              <X size={24} />
            </button>
          </div>

          <div className="space-y-8">
            {/* Garden Events */}
            <section>
              <h3 className="text-xs font-mono uppercase opacity-40 mb-4 tracking-widest flex items-center gap-2">
                <Calendar size={14} /> Garden Events
              </h3>
              <form onSubmit={handleAddEvent} className="flex gap-2 mb-4">
                <input 
                  type="text" 
                  placeholder="Add a special event..." 
                  className="flex-1 p-3 border-4 border-[var(--color-text)] focus:outline-none text-sm font-bold"
                  value={newEventText}
                  onChange={(e) => setNewEventText(e.target.value)}
                />
                <Button type="submit" className="px-4"><Plus size={18} /></Button>
              </form>
              <div className="space-y-2">
                {eventsForDay.length > 0 ? eventsForDay.map(event => (
                  <div key={event.id} className="p-3 bg-white border-4 border-[var(--color-text)] text-sm font-bold flex justify-between items-center shadow-[2px_2px_0px_var(--color-text)]">
                    <span>✨ {event.text}</span>
                    <button onClick={() => onDeleteEvent(event.id)} className="text-red-400 hover:scale-110 transition-transform">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )) : <p className="text-xs opacity-40 italic">No events bloomed today.</p>}
              </div>
            </section>

            <section>
              <h3 className="text-xs font-mono uppercase opacity-40 mb-4 tracking-widest flex items-center gap-2">
                <CheckCircle2 size={14} /> Completed Rituals
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {ritualsDone.length > 0 ? ritualsDone.map(id => {
                  const ritual = state.rituals.find(r => r.id === id);
                  return (
                    <div key={id} className="p-3 bg-[var(--color-primary)]/10 border-4 border-[var(--color-text)] text-sm font-bold flex items-center gap-2">
                      <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full animate-pulse" />
                      {ritual?.name || "Past Ritual"}
                    </div>
                  );
                }) : <p className="text-xs opacity-40 italic">No rituals completed this day.</p>}
              </div>
            </section>

            <section>
              <h3 className="text-xs font-mono uppercase opacity-40 mb-4 tracking-widest flex items-center gap-2">
                <ListTodo size={14} /> Daily Tasks
              </h3>
              <div className="space-y-2">
                {tasksForDay.length > 0 ? tasksForDay.map(task => (
                  <div key={task.id} className="p-3 border-4 border-[var(--color-text)] text-sm flex items-center gap-3 bg-white/50">
                    {task.completed ? <CheckCircle2 size={16} className="text-green-500" /> : <div className="w-4 h-4 border-4 border-[var(--color-text)]" />}
                    <span className={cn("font-bold", task.completed && "line-through opacity-50")}>{task.text}</span>
                  </div>
                )) : <p className="text-xs opacity-40 italic">No tasks recorded.</p>}
              </div>
            </section>

            <section>
              <h3 className="text-xs font-mono uppercase opacity-40 mb-4 tracking-widest flex items-center gap-2">
                <StickyNote size={14} /> Daily Notes
              </h3>
              {reflection ? (
                <div className="p-6 bg-[var(--color-secondary)]/10 border-4 border-[var(--color-text)] border-dashed relative">
                  <div className="absolute -top-3 -right-3 text-4xl transform rotate-12">{reflection.mood}</div>
                  <p className="text-lg italic font-display">"{reflection.text}"</p>
                </div>
              ) : <p className="text-xs opacity-40 italic">The soil of memory is empty for today.</p>}
            </section>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
