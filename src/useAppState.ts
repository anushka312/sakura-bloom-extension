import { useState, useEffect, useCallback } from 'react';
import { AppState, DEFAULT_STATE, getTodayISO, QUOTES, Ritual } from './types';

const STORAGE_KEY = 'sakura_bloom_state';

export function useAppState() {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadState = async () => {
      const chrome = (window as any).chrome;
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        const result = await new Promise<any>((resolve) => {
          chrome.storage.local.get([STORAGE_KEY], resolve);
        });
        if (result[STORAGE_KEY]) {
          setState({ ...DEFAULT_STATE, ...result[STORAGE_KEY] });
        }
      } else {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          try {
            setState({ ...DEFAULT_STATE, ...JSON.parse(saved) });
          } catch (e) {
            console.error("Failed to parse state", e);
          }
        }
      }
      setIsLoaded(true);
    };
    loadState();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    
    const chrome = (window as any).chrome;
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ [STORAGE_KEY]: state });
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
    document.documentElement.setAttribute('data-theme', state.theme);
  }, [state, isLoaded]);

  const updateState = useCallback((updater: (prev: AppState) => AppState) => {
    setState(prev => {
      const next = updater(prev);
      return next;
    });
  }, []);

  const addRitual = (name: string, frequency: Ritual['frequency'], reminderTime?: string) => {
    const newRitual: Ritual = {
      id: crypto.randomUUID(),
      name,
      frequency,
      colorTag: '#F3A2BE',
      streak: 0,
      lastCompleted: null,
      createdAt: new Date().toISOString(),
      reminderTime
    };
    updateState(s => ({ ...s, rituals: [...s.rituals, newRitual] }));
  };

  const updateRitual = (id: string, updates: Partial<Ritual>) => {
    updateState(s => ({
      ...s,
      rituals: s.rituals.map(r => r.id === id ? { ...r, ...updates } : r)
    }));
  };

  const addTask = (text: string) => {
    const today = getTodayISO();
    const newTask = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      date: today
    };
    updateState(s => ({ ...s, tasks: [...s.tasks, newTask] }));
  };

  const toggleTask = (id: string) => {
    updateState(s => ({
      ...s,
      tasks: s.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    }));
  };

  const deleteTask = (id: string) => {
    updateState(s => ({
      ...s,
      tasks: s.tasks.filter(t => t.id !== id)
    }));
  };

  const addFocusSession = (duration: number, type: any) => {
    const session = {
      id: crypto.randomUUID(),
      duration,
      date: getTodayISO(),
      type
    };
    updateState(s => ({
      ...s,
      focusSessions: [...s.focusSessions, session],
      points: s.points + Math.floor(duration / 5) // XP for focus
    }));
  };

  const toggleRitual = (id: string) => {
    const today = getTodayISO();
    updateState(s => {
      const ritual = s.rituals.find(r => r.id === id);
      if (!ritual) return s;

      const isCompletedToday = s.logs[today]?.includes(id);
      let newLogs = { ...s.logs };
      let newRituals = [...s.rituals];
      let newPoints = s.points;
      let newTotalCompleted = s.stats.totalCompleted;

      if (isCompletedToday) {
        // Undo completion
        newLogs[today] = newLogs[today].filter(rid => rid !== id);
        newRituals = newRituals.map(r => r.id === id ? { ...r, lastCompleted: null, streak: Math.max(0, r.streak - 1) } : r);
        // Note: In a real app we might want to be more careful about XP undoing
      } else {
        // Complete ritual
        if (!newLogs[today]) newLogs[today] = [];
        newLogs[today].push(id);
        
        const xpMap = { daily: 10, every2days: 15, weekly: 25 };
        newPoints += xpMap[ritual.frequency];
        newTotalCompleted += 1;

        newRituals = newRituals.map(r => r.id === id ? { ...r, lastCompleted: today, streak: r.streak + 1 } : r);
      }

      // Level up logic
      const newLevel = Math.floor(newPoints / 150) + 1;
      
      return {
        ...s,
        logs: newLogs,
        rituals: newRituals,
        points: newPoints,
        level: newLevel,
        stats: {
          ...s.stats,
          totalCompleted: newTotalCompleted
        }
      };
    });
  };

  const deleteRitual = (id: string) => {
    const today = getTodayISO();
    updateState(s => {
      const newLogs = { ...s.logs };
      if (newLogs[today]) {
        newLogs[today] = newLogs[today].filter(rid => rid !== id);
      }
      return {
        ...s,
        rituals: s.rituals.filter(r => r.id !== id),
        logs: newLogs
      };
    });
  };

  const addEvent = (text: string, date: string) => {
    const newEvent = {
      id: crypto.randomUUID(),
      text,
      date
    };
    updateState(s => ({ ...s, events: [...s.events, newEvent] }));
  };

  const deleteEvent = (id: string) => {
    updateState(s => ({ ...s, events: s.events.filter(e => e.id !== id) }));
  };

  const updateProfile = (data: Partial<AppState['user']>) => {
    updateState(s => ({
      ...s,
      user: { ...s.user, ...data }
    }));
  };

  const setDailyStatus = (status: string) => {
    const today = getTodayISO();
    updateState(s => ({
      ...s,
      user: {
        ...s.user,
        dailyStatus: status,
        lastStatusDate: today
      }
    }));
  };

  const saveReflection = (text: string, mood: string) => {
    const today = getTodayISO();
    updateState(s => ({
      ...s,
      reflections: {
        ...s.reflections,
        [today]: { text, mood }
      }
    }));
  };

  const setTheme = (theme: AppState['theme']) => {
    updateState(s => ({ ...s, theme }));
  };

  return {
    state,
    addRitual,
    updateRitual,
    toggleRitual,
    deleteRitual,
    addTask,
    toggleTask,
    deleteTask,
    addFocusSession,
    addEvent,
    deleteEvent,
    updateProfile,
    setDailyStatus,
    saveReflection,
    setTheme,
    updateState
  };
}
