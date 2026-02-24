import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Play, Pause, RotateCcw, Coffee, Brain, Check } from 'lucide-react';
import { Button, Card } from './UI';

interface FocusTimerProps {
  onComplete: (duration: number, type: 'pomodoro' | 'short-break' | 'long-break') => void;
}

export const FocusTimer = ({ onComplete }: FocusTimerProps) => {
  const [customDurations, setCustomDurations] = useState({
    pomodoro: 25,
    'short-break': 5,
    'long-break': 15
  });
  const [mode, setMode] = useState<'pomodoro' | 'short-break' | 'long-break'>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(customDurations[mode] * 60);
  const [isActive, setIsActive] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setTimeLeft(customDurations[mode] * 60);
  }, [mode, customDurations]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      onComplete(customDurations[mode], mode);
      // Simple notification
      if (Notification.permission === 'granted') {
        new Notification("Focus Session Complete! 🌸", {
          body: mode === 'pomodoro' ? "Time for a break!" : "Back to work?",
        });
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, onComplete, customDurations]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(customDurations[mode] * 60);
  };

  const switchMode = (newMode: typeof mode) => {
    setMode(newMode);
    setIsActive(false);
  };

  const handleDurationChange = (val: string) => {
    const num = parseInt(val) || 1;
    setCustomDurations(prev => ({ ...prev, [mode]: num }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="flex flex-col items-center p-6 bg-white/80 backdrop-blur-sm relative overflow-hidden">
      <div className="flex gap-2 mb-6">
        {(['pomodoro', 'short-break', 'long-break'] as const).map((m) => (
          <button 
            key={m}
            onClick={() => switchMode(m)}
            className={cn(
              "px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider transition-all border-2", 
              mode === m 
                ? "bg-[var(--color-text)] text-white border-[var(--color-text)]" 
                : "bg-white border-transparent opacity-60 hover:opacity-100"
            )}
          >
            {m.replace('-', ' ')}
          </button>
        ))}
      </div>

      <div className="relative group">
        <div 
          className={cn(
            "text-7xl font-display mb-6 tracking-tighter cursor-pointer transition-all",
            !isActive ? "hover:text-[var(--color-primary)] hover:scale-105" : "opacity-80"
          )}
          onClick={() => !isActive && setIsEditing(!isEditing)}
        >
          {formatTime(timeLeft)}
        </div>
        {!isActive && !isEditing && (
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-4 text-[10px] font-mono opacity-40 whitespace-nowrap animate-pulse">
            Click time to adjust duration
          </div>
        )}
      </div>

      {isEditing && !isActive && (
        <div className="mb-8 p-4 bg-white border-4 border-[var(--color-text)] shadow-[4px_4px_0px_var(--color-text)] animate-in zoom-in-95">
          <div className="flex items-center gap-3">
            <input 
              type="number" 
              min="1" 
              max="120"
              autoFocus
              value={customDurations[mode]}
              onChange={(e) => handleDurationChange(e.target.value)}
              className="w-20 p-2 text-2xl font-display border-4 border-[var(--color-text)] text-center focus:outline-none focus:bg-[var(--color-primary)]/10"
            />
            <div className="flex flex-col">
              <span className="font-mono text-[10px] uppercase font-bold">Minutes</span>
              <button 
                onClick={() => setIsEditing(false)} 
                className="mt-1 px-3 py-1 bg-[var(--color-text)] text-white text-[10px] font-mono uppercase font-bold hover:bg-[var(--color-primary)] transition-colors"
              >
                Set Time
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <button 
          onClick={toggleTimer}
          className="w-14 h-14 rounded-full bg-[var(--color-text)] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-[4px_4px_0px_rgba(0,0,0,0.1)]"
        >
          {isActive ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
        </button>
        <button 
          onClick={resetTimer}
          className="w-14 h-14 rounded-full border-4 border-[var(--color-text)] bg-white flex items-center justify-center hover:scale-110 transition-transform"
        >
          <RotateCcw size={24} />
        </button>
      </div>
    </Card>
  );
};

import { cn } from '../utils';
