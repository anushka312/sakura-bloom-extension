import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Settings, 
  User as UserIcon, 
  Calendar, 
  Moon, 
  Sun, 
  Award, 
  TrendingUp,
  X,
  Check,
  ChevronRight,
  ChevronLeft,
  Download,
  Upload,
  Camera,
  Timer,
  ListTodo,
  StickyNote,
  Bell,
  ExternalLink
} from 'lucide-react';
import { useAppState } from './useAppState';
import { cn } from './utils';
import { Card, Button } from './components/UI';
import { SakuraSpirit } from './components/SakuraSpirit';
import { ProgressCircle } from './components/ProgressCircle';
import { BloomGrid } from './components/BloomGrid';
import { FocusTimer } from './components/FocusTimer';
import { DayDetailsModal } from './components/DayDetailsModal';
import { Analysis } from './components/Analysis';
import { RitualStreakGraph } from './components/RitualStreakGraph';
import { getTodayISO, QUOTES, REWARDS, Ritual } from './types';

export default function App() {
  const { 
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
  } = useAppState();

  const [isFirstLaunch, setIsFirstLaunch] = useState(!state.user.name);
  const [showSettings, setShowSettings] = useState(false);
  const [newRitualName, setNewRitualName] = useState('');
  const [newTaskText, setNewTaskText] = useState('');
  const [reflectionText, setReflectionText] = useState('');
  const [selectedMood, setSelectedMood] = useState('😊');
  const [activeTab, setActiveTab] = useState<'rituals' | 'tasks' | 'focus' | 'stats' | 'notes' | 'analysis'>('rituals');
  const [editingRitual, setEditingRitual] = useState<Ritual | null>(null);
  const [newRitualReminder, setNewRitualReminder] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(state.user.name);
  const [editTagline, setEditTagline] = useState(state.user.profileMessage);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPopup = new URLSearchParams(window.location.search).get('mode') === 'popup';

  const today = getTodayISO();
  const ritualsCompletedToday = state.logs[today]?.length || 0;
  const totalRituals = state.rituals.length;
  const tasksToday = state.tasks.filter(t => t.date === today);
  
  const spiritState = ritualsCompletedToday === 0 
    ? 'sleeping' 
    : ritualsCompletedToday === totalRituals && totalRituals > 0 
      ? 'radiant' 
      : 'awake';

  const notifiedRef = useRef<Record<string, string>>({}); // ritualId -> lastNotifiedDate

  useEffect(() => {
    if (!state.settings.notifications) return;

    let interval: number;
    const checkReminders = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const todayISO = getTodayISO();

      state.rituals.forEach(ritual => {
        if (ritual.reminderTime === currentTime) {
          const lastNotified = notifiedRef.current[ritual.id];
          const isCompletedToday = state.logs[todayISO]?.includes(ritual.id);

          if (lastNotified !== todayISO && !isCompletedToday) {
            if (Notification.permission === 'granted') {
              new Notification("Sakura Bloom", {
                body: `Time for your ritual: ${ritual.name} 🌸`,
                icon: "/icon128.png"
              });
            }
            notifiedRef.current[ritual.id] = todayISO;
          }
        }
      });
    };

    // Sync with the next minute start
    const now = new Date();
    const delay = (60 - now.getSeconds()) * 1000;
    
    const timeout = window.setTimeout(() => {
      checkReminders();
      interval = window.setInterval(checkReminders, 60000);
    }, delay);

    checkReminders(); // Initial check

    return () => {
      window.clearTimeout(timeout);
      if (interval) window.clearInterval(interval);
    };
  }, [state.rituals, state.settings.notifications, state.logs]);

  useEffect(() => {
    if (state.settings.notifications && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [state.settings.notifications]);

  const handleOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get('name') as string;
    if (name.length >= 2) {
      updateProfile({ name });
      setIsFirstLaunch(false);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateProfile({ avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim()) {
      addTask(newTaskText);
      setNewTaskText('');
    }
  };

  const openDashboard = () => {
    const chrome = (window as any).chrome;
    if (chrome && chrome.tabs && chrome.tabs.create) {
      chrome.tabs.create({ url: 'index.html' });
    } else {
      const url = new URL(window.location.href);
      url.searchParams.delete('mode');
      window.open(url.toString(), '_blank');
    }
  };

  if (isPopup) {
    return (
      <div className="w-[400px] min-h-[500px] bg-[var(--color-bg)] text-[var(--color-text)] p-4 font-sans overflow-x-hidden">
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <SakuraSpirit state={spiritState} size={32} />
            <h1 className="text-xl font-display">Sakura Bloom</h1>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={openDashboard}
              className="p-2 bg-white border-2 border-[var(--color-text)] rounded-full hover:bg-black/5 transition-all shadow-[2px_2px_0px_var(--color-text)]"
              title="Open Full Dashboard"
            >
              <ExternalLink size={16} />
            </button>
            <button 
              onClick={() => setShowSettings(true)}
              className="p-2 bg-white border-2 border-[var(--color-text)] rounded-full hover:bg-black/5 transition-all shadow-[2px_2px_0px_var(--color-text)]"
            >
              <Settings size={16} />
            </button>
          </div>
        </header>

        <div className="space-y-6">
          <section className="bg-white/40 p-4 border-4 border-[var(--color-text)] shadow-[4px_4px_0px_var(--color-text)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg flex items-center gap-2">
                <Timer size={18} /> Focus
              </h2>
              <div className="text-[10px] font-mono uppercase opacity-50">Level {state.level}</div>
            </div>
            <FocusTimer onComplete={addFocusSession} />
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-lg flex items-center gap-2">
              <Award size={18} /> Rituals
            </h2>
            <div className="space-y-2">
              {state.rituals.slice(0, 3).map(ritual => {
                const isDone = state.logs[today]?.includes(ritual.id);
                return (
                  <div key={ritual.id} className={cn("flex items-center justify-between p-3 bg-white border-2 border-[var(--color-text)] shadow-[2px_2px_0px_var(--color-text)] transition-all", isDone && "opacity-50 grayscale")}>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => toggleRitual(ritual.id)}
                        className={cn("w-6 h-6 border-2 border-[var(--color-text)] flex items-center justify-center transition-all", isDone ? "bg-[var(--color-primary)]" : "bg-white")}
                      >
                        {isDone && <Check size={14} className="text-white" />}
                      </button>
                      <span className="font-bold text-sm">{ritual.name}</span>
                    </div>
                    <span className="text-[10px] font-mono opacity-50">🔥 {ritual.streak}</span>
                  </div>
                );
              })}
              {state.rituals.length > 3 && (
                <button onClick={openDashboard} className="w-full py-2 text-[10px] font-mono uppercase opacity-40 hover:opacity-100 transition-opacity">
                  + {state.rituals.length - 3} more rituals in dashboard
                </button>
              )}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-lg flex items-center gap-2">
              <ListTodo size={18} /> Tasks
            </h2>
            <div className="space-y-2">
              {tasksToday.slice(0, 3).map(task => (
                <div key={task.id} className="flex items-center gap-3 p-2 bg-white/40 border-2 border-[var(--color-text)]">
                  <button 
                    onClick={() => toggleTask(task.id)}
                    className={cn("w-5 h-5 border-2 border-[var(--color-text)] flex items-center justify-center", task.completed ? "bg-green-400" : "bg-white")}
                  >
                    {task.completed && <Check size={12} className="text-white" />}
                  </button>
                  <span className={cn("text-xs", task.completed && "line-through opacity-50")}>{task.text}</span>
                </div>
              ))}
              <form onSubmit={handleAddTask} className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Quick add..." 
                  className="flex-1 p-2 text-xs border-2 border-[var(--color-text)] focus:outline-none bg-white/80"
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                />
                <button type="submit" className="p-2 bg-[var(--color-accent)] border-2 border-[var(--color-text)] shadow-[2px_2px_0px_var(--color-text)]">
                  <Plus size={14} />
                </button>
              </form>
            </div>
          </section>
        </div>

        <footer className="mt-8 pt-4 border-t-2 border-[var(--color-text)] border-dashed">
          <button 
            onClick={openDashboard}
            className="w-full py-3 bg-white border-4 border-[var(--color-text)] shadow-[4px_4px_0px_var(--color-text)] font-display flex items-center justify-center gap-2 hover:bg-[var(--color-primary)] hover:text-white transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            <ExternalLink size={18} /> Open Full Dashboard
          </button>
        </footer>

        {showSettings && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[var(--color-bg)] border-4 border-[var(--color-text)] shadow-[8px_8px_0px_var(--color-text)] w-full max-w-sm p-6 animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-display">Settings</h2>
                <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-black/5 rounded-full transition-colors"><X size={24} /></button>
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-2">
                  <label className="text-xs font-mono uppercase opacity-50">Theme</label>
                  <div className="flex gap-2">
                    {(['bubbleMint', 'lavenderPop', 'raspberryCitrus'] as const).map(t => (
                      <button 
                        key={t}
                        onClick={() => setTheme(t)}
                        className={cn(
                          "flex-1 py-2 border-2 border-[var(--color-text)] text-[10px] font-mono uppercase font-bold transition-all",
                          state.theme === t ? "bg-[var(--color-primary)] text-white shadow-[2px_2px_0px_var(--color-text)]" : "bg-white hover:bg-black/5"
                        )}
                      >
                        {t.replace(/([A-Z])/g, ' $1')}
                      </button>
                    ))}
                  </div>
                </div>
                <Button className="w-full" onClick={() => setShowSettings(false)}>Close</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const handleAddRitual = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRitualName.trim()) {
      addRitual(newRitualName.trim(), 'daily', newRitualReminder || undefined);
      setNewRitualName('');
      setNewRitualReminder('');
    }
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "sakura_bloom_backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string);
          updateState(() => imported);
          alert("Garden Restored! 🌸");
        } catch (err) { alert("Invalid File"); }
      };
      reader.readAsText(file);
    }
  };

  if (isFirstLaunch) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-bg)]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <Card className="text-center">
            <h1 className="text-3xl font-display mb-4">Welcome to Sakura Bloom</h1>
            <p className="mb-6 opacity-70">Let's start by naming your gardener.</p>
            <form onSubmit={handleOnboarding} className="space-y-4">
              <input 
                name="name"
                type="text" 
                placeholder="Your Name" 
                className="w-full p-3 border-4 border-[var(--color-text)] focus:outline-none font-bold"
                required
                minLength={2}
                maxLength={20}
              />
              <Button type="submit" className="w-full">Start Blooming 🌸</Button>
            </form>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] font-sans pb-20 selection:bg-[var(--color-primary)] selection:text-white relative overflow-hidden">
      <div className="fixed top-20 -left-10 text-6xl opacity-10 pointer-events-none rotate-12">🌸</div>
      <div className="fixed bottom-40 -right-10 text-6xl opacity-10 pointer-events-none -rotate-12">🌺</div>
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20rem] opacity-[0.03] pointer-events-none select-none">💮</div>
      
      {/* Header */}
      <header className="p-6 flex justify-between items-center max-w-5xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="w-12 h-12 rounded-full border-4 border-[var(--color-text)] overflow-hidden bg-white flex items-center justify-center text-2xl shadow-[4px_4px_0px_var(--color-text)]">
              {state.user.avatar.startsWith('data:') ? (
                <img src={state.user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span>{state.user.avatar}</span>
              )}
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute -top-1 -right-1 p-1 bg-[var(--color-primary)] text-white rounded-full border-2 border-[var(--color-text)] opacity-0 group-hover:opacity-100 transition-opacity shadow-[2px_2px_0px_var(--color-text)]"
            >
              <Camera size={10} />
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
          </div>
          <h1 className="text-2xl font-display leading-none">Sakura Bloom</h1>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => updateState(s => ({ ...s, settings: { ...s.settings, focusMode: !s.settings.focusMode } }))}
            className={cn("p-2 rounded-full transition-all border-2 border-[var(--color-text)]", state.settings.focusMode ? "bg-[var(--color-text)] text-white" : "bg-white hover:bg-black/5")}
          >
            <Timer size={20} />
          </button>
          <button 
            onClick={() => setShowSettings(true)}
            className="p-2 bg-white border-2 border-[var(--color-text)] rounded-full hover:bg-black/5 transition-all shadow-[2px_2px_0px_var(--color-text)]"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 space-y-8">
        {!state.settings.focusMode ? (
          <>
            {/* Hero Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 flex flex-col md:flex-row items-center gap-8 p-8 bg-white/40 backdrop-blur-md border-dashed relative">
                <div className="relative shrink-0">
                  <div className="w-32 h-32 rounded-full border-8 border-[var(--color-text)] overflow-hidden bg-white flex items-center justify-center text-6xl shadow-[8px_8px_0px_var(--color-text)]">
                    {state.user.avatar.startsWith('data:') ? (
                      <img src={state.user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center">
                        <span className="text-4xl mb-1">{state.user.avatar}</span>
                        <SakuraSpirit state={spiritState} size={60} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 text-center md:text-left space-y-4">
                  {isEditingProfile ? (
                    <div className="space-y-3 animate-in fade-in slide-in-from-left-2 bg-white/60 p-4 border-4 border-[var(--color-text)] shadow-[4px_4px_0px_var(--color-text)]">
                      <div>
                        <label className="text-[10px] font-mono uppercase opacity-50 block mb-1">Gardener Name</label>
                        <input 
                          type="text" 
                          className="text-2xl font-display bg-white border-2 border-[var(--color-text)] p-2 w-full focus:outline-none"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Your Name"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-mono uppercase opacity-50 block mb-1">Garden Tagline</label>
                        <input 
                          type="text" 
                          className="text-sm italic opacity-60 bg-white border-2 border-[var(--color-text)] p-2 w-full focus:outline-none"
                          value={editTagline}
                          onChange={(e) => setEditTagline(e.target.value)}
                          placeholder="Your Tagline"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button onClick={() => {
                          updateProfile({ name: editName, profileMessage: editTagline });
                          setIsEditingProfile(false);
                        }}>Save Changes</Button>
                        <Button className="bg-white text-[var(--color-text)]" onClick={() => {
                          setEditName(state.user.name);
                          setEditTagline(state.user.profileMessage);
                          setIsEditingProfile(false);
                        }}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="group/profile relative">
                      <div className="flex items-center gap-3 justify-center md:justify-start">
                        <h2 className="text-4xl font-display">Hello, {state.user.name}!</h2>
                        <button 
                          onClick={() => setIsEditingProfile(true)}
                          className="p-2 bg-white border-2 border-[var(--color-text)] rounded-full hover:bg-[var(--color-primary)] hover:text-white transition-all shadow-[2px_2px_0px_var(--color-text)]"
                          title="Edit Profile"
                        >
                          <Settings size={14} />
                        </button>
                      </div>
                      <p className="text-lg opacity-60 italic mt-1">"{state.user.profileMessage}"</p>
                      <p className="text-[10px] font-mono uppercase tracking-widest opacity-40 mt-2">Level {state.level} Gardener</p>
                    </div>
                  )}
                  
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-[10px] font-mono uppercase font-bold">
                      <span>XP Progress</span>
                      <span>{state.points % 150} / 150</span>
                    </div>
                    <div className="w-full bg-white h-6 border-4 border-[var(--color-text)] relative overflow-hidden shadow-[4px_4px_0px_var(--color-text)]">
                      <motion.div 
                        className="absolute inset-y-0 left-0 bg-[var(--color-primary)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${(state.points % 150) / 1.5}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="flex flex-col items-center justify-center p-8 bg-white/40 backdrop-blur-md">
                <ProgressCircle current={ritualsCompletedToday} total={totalRituals} size={160} />
                <div className="mt-4 text-center">
                  <p className="text-xs font-mono uppercase opacity-50">Daily Rituals</p>
                  <p className="text-lg font-bold">{ritualsCompletedToday === totalRituals && totalRituals > 0 ? "Fully Bloomed! ✨" : "Keep Growing 🌸"}</p>
                </div>
              </Card>
            </div>

            {/* Navigation Tabs */}
            <div className="flex overflow-x-auto scrollbar-hide gap-2 border-b-4 border-[var(--color-text)] pb-2 relative no-scrollbar">
              <div className="absolute -top-6 right-0 text-xl animate-bounce">🌻</div>
              {[
                { id: 'rituals', label: 'Rituals', icon: <Award size={16} /> },
                { id: 'tasks', label: 'Garden Chores', icon: <ListTodo size={16} /> },
                { id: 'focus', label: 'Sunlight Focus', icon: <Timer size={16} /> },
                { id: 'notes', label: 'Petal Thoughts', icon: <StickyNote size={16} /> },
                { id: 'analysis', label: 'Bloom Analysis', icon: <TrendingUp size={16} /> },
                { id: 'stats', label: 'My Garden', icon: <Calendar size={16} /> },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "px-6 py-3 font-display text-sm flex items-center gap-2 transition-all border-t-4 border-x-4 border-transparent -mb-3 flex-shrink-0 whitespace-nowrap",
                    activeTab === tab.id 
                      ? "bg-[var(--color-text)] text-white border-[var(--color-text)] rounded-t-xl" 
                      : "hover:bg-black/5 opacity-60"
                  )}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'rituals' && (
                <motion.div key="rituals" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                  <form onSubmit={handleAddRitual} className="flex flex-col md:flex-row gap-4">
                    <input 
                      type="text" 
                      placeholder="Add a new ritual..." 
                      className="flex-1 p-4 border-4 border-[var(--color-text)] focus:outline-none bg-white/80 font-bold"
                      value={newRitualName}
                      onChange={(e) => setNewRitualName(e.target.value)}
                    />
                    <div className="flex gap-4">
                      <div className="relative flex items-center bg-white border-4 border-[var(--color-text)] px-4">
                        <Bell size={16} className="mr-2 opacity-40" />
                        <input 
                          type="time" 
                          className="bg-transparent focus:outline-none font-mono text-sm"
                          value={newRitualReminder}
                          onChange={(e) => setNewRitualReminder(e.target.value)}
                        />
                      </div>
                      <Button type="submit" className="px-8 flex items-center gap-2">
                        <Plus size={20} /> Add
                      </Button>
                    </div>
                  </form>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {state.rituals.map(ritual => {
                      const isDone = state.logs[today]?.includes(ritual.id);
                      return (
                        <Card key={ritual.id} className={cn("flex items-center justify-between group transition-all", isDone && "opacity-50 grayscale")}>
                          <div className="flex items-center gap-4">
                            <button 
                              onClick={() => toggleRitual(ritual.id)}
                              className={cn("w-10 h-10 border-4 border-[var(--color-text)] flex items-center justify-center transition-all", isDone ? "bg-[var(--color-primary)] rotate-12" : "bg-white hover:scale-110")}
                            >
                              {isDone && <Check size={24} className="text-white" />}
                            </button>
                            <div>
                              <h3 className="font-bold text-lg">{ritual.name}</h3>
                              <div className="flex gap-2 text-[10px] font-mono uppercase opacity-50">
                                <span>🔥 {ritual.streak} Streak</span>
                                <span>•</span>
                                <span>{ritual.frequency}</span>
                                {ritual.reminderTime && (
                                  <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1"><Bell size={10} /> {ritual.reminderTime}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => setEditingRitual(ritual)}
                              className="p-2 text-[var(--color-text)] opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Settings size={18} />
                            </button>
                            <button onClick={() => deleteRitual(ritual.id)} className="p-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Ritual Consistency Board */}
                  {state.rituals.length > 0 && (
                    <section className="mt-12 space-y-6">
                      <div className="flex items-center gap-3">
                        <TrendingUp size={24} className="text-[var(--color-primary)]" />
                        <h3 className="text-2xl font-display">Consistency Board</h3>
                      </div>
                      <div className="grid grid-cols-1 gap-6">
                        {state.rituals.map(ritual => (
                          <Card key={`graph-${ritual.id}`} className="p-6 bg-white/60 relative overflow-hidden">
                            <div className="absolute -top-4 -right-4 text-6xl opacity-5 rotate-12">💮</div>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                              <div>
                                <h4 className="font-bold text-xl">{ritual.name}</h4>
                                <p className="text-[10px] font-mono uppercase opacity-40 tracking-widest">20 Week Bloom History</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="px-3 py-1 bg-[var(--color-primary)] text-white rounded-full text-xs font-bold shadow-[2px_2px_0px_var(--color-text)] border-2 border-[var(--color-text)]">
                                  🔥 {ritual.streak} Day Streak
                                </span>
                              </div>
                            </div>
                            <div className="overflow-x-auto pb-2 scrollbar-hide">
                              <RitualStreakGraph ritualId={ritual.id} logs={state.logs} variant="large" />
                            </div>
                          </Card>
                        ))}
                      </div>
                    </section>
                  )}
                </motion.div>
              )}

              {activeTab === 'analysis' && (
                <motion.div key="analysis" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <Analysis state={state} />
                </motion.div>
              )}

              {activeTab === 'tasks' && (
                <motion.div key="tasks" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase opacity-50 mb-2">
                    <ListTodo size={12} /> Daily Chores for the Garden
                  </div>
                  <form onSubmit={handleAddTask} className="flex gap-4">
                    <input 
                      type="text" 
                      placeholder="What needs to be done today?" 
                      className="flex-1 p-4 border-4 border-[var(--color-text)] focus:outline-none bg-white/80 font-bold"
                      value={newTaskText}
                      onChange={(e) => setNewTaskText(e.target.value)}
                    />
                    <Button type="submit" className="px-8 bg-[var(--color-accent)]">
                      <Plus size={20} /> Task
                    </Button>
                  </form>
                  <div className="space-y-3">
                    {tasksToday.map(task => (
                      <Card key={task.id} className={cn("flex items-center justify-between group", task.completed && "opacity-50")}>
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={() => toggleTask(task.id)}
                            className={cn("w-8 h-8 border-4 border-[var(--color-text)] flex items-center justify-center", task.completed ? "bg-green-400" : "bg-white")}
                          >
                            {task.completed && <Check size={18} className="text-white" />}
                          </button>
                          <span className={cn("font-bold", task.completed && "line-through")}>{task.text}</span>
                        </div>
                        <button onClick={() => deleteTask(task.id)} className="p-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 size={18} />
                        </button>
                      </Card>
                    ))}
                  </div>

                  {state.rituals.length > 0 && (
                    <section className="pt-8 space-y-6">
                      <h3 className="text-2xl font-display flex items-center gap-2">
                        <TrendingUp size={24} className="text-[var(--color-primary)]" /> Ritual Growth
                      </h3>
                      <div className="grid grid-cols-1 gap-8">
                        {state.rituals.map(ritual => (
                          <div key={`growth-${ritual.id}`} className="space-y-3">
                            <div className="flex justify-between items-end">
                              <h4 className="font-bold text-lg">{ritual.name}</h4>
                              <span className="text-[10px] font-mono uppercase opacity-40">Last 20 Weeks</span>
                            </div>
                            <RitualStreakGraph ritualId={ritual.id} logs={state.logs} variant="large" />
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </motion.div>
              )}

              {activeTab === 'focus' && (
                <motion.div key="focus" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <FocusTimer onComplete={(duration, type) => addFocusSession(duration, type)} />
                </motion.div>
              )}

              {activeTab === 'notes' && (
                <motion.div key="notes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                  <Card className="p-8 relative overflow-hidden">
                    <div className="absolute -top-4 -right-4 text-6xl opacity-5 rotate-12">🍃</div>
                    <h3 className="text-2xl font-display mb-6 flex items-center gap-2">
                      <StickyNote size={24} /> Petal Thoughts
                    </h3>
                    <div className="flex gap-4 mb-6">
                      {['😊', '😐', '😔', '😴', '🌟'].map(mood => (
                        <button
                          key={mood}
                          onClick={() => setSelectedMood(mood)}
                          className={cn(
                            "text-3xl p-3 border-4 border-transparent transition-all hover:scale-125",
                            selectedMood === mood ? "border-[var(--color-text)] bg-white shadow-[4px_4px_0px_var(--color-text)]" : "opacity-40"
                          )}
                        >
                          {mood}
                        </button>
                      ))}
                    </div>
                    <textarea 
                      className="w-full h-48 p-6 border-4 border-[var(--color-text)] focus:outline-none resize-none bg-white font-medium text-lg"
                      placeholder="Write your heart out..."
                      value={reflectionText}
                      onChange={(e) => setReflectionText(e.target.value)}
                    />
                    <div className="flex justify-end mt-4">
                      <Button onClick={() => {
                        saveReflection(reflectionText, selectedMood);
                        alert("Thoughts preserved in your garden. 🌸");
                      }}>Save Note</Button>
                    </div>
                  </Card>
                </motion.div>
              )}

              {activeTab === 'stats' && (
                <motion.div key="stats" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="text-center p-6 bg-white/60">
                      <TrendingUp className="mx-auto mb-2 opacity-40" />
                      <div className="text-3xl font-display">{state.stats.totalCompleted}</div>
                      <div className="text-[10px] font-mono uppercase opacity-50">Blooms Harvested</div>
                    </Card>
                    <Card className="text-center p-6 bg-white/60">
                      <Award className="mx-auto mb-2 opacity-40" />
                      <div className="text-3xl font-display">{state.level}</div>
                      <div className="text-[10px] font-mono uppercase opacity-50">Gardener Rank</div>
                    </Card>
                    <Card className="text-center p-6 bg-white/60">
                      <Calendar className="mx-auto mb-2 opacity-40" />
                      <div className="text-3xl font-display">{Object.keys(state.logs).length}</div>
                      <div className="text-[10px] font-mono uppercase opacity-50">Days Tended</div>
                    </Card>
                    <Card className="text-center p-6 bg-white/60">
                      <Timer className="mx-auto mb-2 opacity-40" />
                      <div className="text-3xl font-display">{state.focusSessions.reduce((acc, s) => acc + s.duration, 0)}m</div>
                      <div className="text-[10px] font-mono uppercase opacity-50">Sunlight Exposure</div>
                    </Card>
                  </div>

                  <Card className="p-8 bg-white/80 relative overflow-hidden">
                    <div className="absolute top-2 right-2 text-2xl opacity-20">🌻</div>
                    <div className="absolute bottom-2 left-2 text-2xl opacity-20">🌼</div>
                    <BloomGrid 
                      logs={state.logs} 
                      events={state.events}
                      onDayClick={(date) => setSelectedDate(date)} 
                    />
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          /* Focus Mode UI */
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-12 space-y-12">
            <div className="text-center">
              <SakuraSpirit state="awake" />
              <h2 className="text-4xl font-display mt-4">Deep Focus Time</h2>
              <p className="opacity-50">Minimize distractions, maximize growth.</p>
            </div>
            
            <div className="w-full max-w-md">
              <FocusTimer onComplete={(duration, type) => addFocusSession(duration, type)} />
            </div>

            <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-6 bg-white/40">
                <h3 className="font-display mb-4 flex items-center gap-2"><Award size={18} /> Rituals</h3>
                <div className="space-y-2">
                  {state.rituals.map(r => (
                    <div key={r.id} className="flex items-center gap-3 text-sm font-bold">
                      <div className={cn("w-4 h-4 border-2 border-[var(--color-text)]", state.logs[today]?.includes(r.id) ? "bg-[var(--color-primary)]" : "bg-white")} />
                      {r.name}
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="p-6 bg-white/40">
                <h3 className="font-display mb-4 flex items-center gap-2"><ListTodo size={18} /> Tasks</h3>
                <div className="space-y-2">
                  {tasksToday.map(t => (
                    <div key={t.id} className="flex items-center gap-3 text-sm font-bold">
                      <div className={cn("w-4 h-4 border-2 border-[var(--color-text)]", t.completed ? "bg-green-400" : "bg-white")} />
                      {t.text}
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <Button onClick={() => updateState(s => ({ ...s, settings: { ...s.settings, focusMode: false } }))} className="bg-[var(--color-text)] text-white">
              Exit Focus Mode
            </Button>
          </motion.div>
        )}

        {/* Petal of the Day */}
        <Card className="bg-[var(--color-secondary)]/20 border-none text-center py-12 px-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent opacity-30" />
          <div className="text-4xl mb-6">💮</div>
          <p className="text-2xl font-display italic mb-4 leading-tight">"{state.quoteOfDay.quote.text}"</p>
          <p className="text-sm font-mono uppercase tracking-widest opacity-40">— {state.quoteOfDay.quote.author}</p>
        </Card>
      </main>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowSettings(false)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-lg">
              <Card className="max-h-[85vh] overflow-y-auto p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-display">Settings</h2>
                  <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-black/5 rounded-full"><X size={28} /></button>
                </div>

                <div className="space-y-8">
                  <section>
                    <h3 className="text-xs font-mono uppercase opacity-40 mb-4 tracking-widest">Theme & Aesthetic</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {(['bubbleMint', 'lavenderPop', 'raspberryCitrus'] as const).map(t => (
                        <button 
                          key={t}
                          onClick={() => setTheme(t)}
                          className={cn(
                            "p-4 border-4 text-left flex justify-between items-center font-bold transition-all",
                            state.theme === t ? "border-[var(--color-text)] bg-white shadow-[4px_4px_0px_var(--color-text)]" : "border-transparent bg-black/5 opacity-60"
                          )}
                        >
                          <span className="capitalize">{t.replace(/([A-Z])/g, ' $1')}</span>
                          {state.theme === t && <Check size={20} />}
                        </button>
                      ))}
                    </div>
                  </section>

                  <section>
                    <h3 className="text-xs font-mono uppercase opacity-40 mb-4 tracking-widest">Notifications</h3>
                    <div className="flex items-center justify-between p-4 bg-black/5 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Bell size={20} />
                        <span className="font-bold">Enable Reminders</span>
                      </div>
                      <button 
                        onClick={() => updateState(s => ({ ...s, settings: { ...s.settings, notifications: !s.settings.notifications } }))}
                        className={cn("w-12 h-6 rounded-full border-2 border-[var(--color-text)] relative transition-colors", state.settings.notifications ? "bg-[var(--color-primary)]" : "bg-white")}
                      >
                        <motion.div 
                          animate={{ x: state.settings.notifications ? 24 : 2 }}
                          className="w-4 h-4 bg-[var(--color-text)] rounded-full absolute top-0.5"
                        />
                      </button>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-xs font-mono uppercase opacity-40 mb-4 tracking-widest">Data Management</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Button onClick={handleExport} className="flex items-center justify-center gap-2"><Download size={18} /> Export</Button>
                      <label className="flex-1">
                        <div className="pixel-button bg-[var(--color-accent)] text-white font-bold hover:opacity-90 flex items-center justify-center gap-2 cursor-pointer h-full">
                          <Upload size={18} /> Import
                        </div>
                        <input type="file" className="hidden" onChange={handleImport} accept=".json" />
                      </label>
                    </div>
                  </section>

                  <Button className="w-full bg-red-400" onClick={() => { if(confirm("Reset Garden?")) { localStorage.clear(); window.location.reload(); } }}>Reset Everything</Button>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Day Details Modal */}
      <AnimatePresence>
        {selectedDate && (
          <DayDetailsModal 
            date={selectedDate} 
            state={state} 
            onClose={() => setSelectedDate(null)} 
            onAddEvent={addEvent}
            onDeleteEvent={deleteEvent}
          />
        )}
      </AnimatePresence>

      {/* Ritual Edit Modal */}
      <AnimatePresence>
        {editingRitual && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setEditingRitual(null)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-md">
              <Card className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-display">Edit Ritual</h2>
                  <button onClick={() => setEditingRitual(null)} className="p-2 hover:bg-black/5 rounded-full"><X size={24} /></button>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-mono uppercase opacity-40 mb-2 block">Ritual Name</label>
                    <input 
                      type="text" 
                      className="w-full p-4 border-4 border-[var(--color-text)] focus:outline-none font-bold"
                      value={editingRitual.name}
                      onChange={(e) => setEditingRitual({ ...editingRitual, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono uppercase opacity-40 mb-2 block">Reminder Time</label>
                    <input 
                      type="time" 
                      className="w-full p-4 border-4 border-[var(--color-text)] focus:outline-none font-mono"
                      value={editingRitual.reminderTime || ''}
                      onChange={(e) => setEditingRitual({ ...editingRitual, reminderTime: e.target.value })}
                    />
                  </div>
                  <Button className="w-full" onClick={() => {
                    updateRitual(editingRitual.id, { name: editingRitual.name, reminderTime: editingRitual.reminderTime });
                    setEditingRitual(null);
                  }}>Save Changes</Button>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="p-12 text-center opacity-30 text-[10px] font-mono uppercase tracking-[0.2em]">
        Sakura Bloom • Pixel Garden Habit System • v2.0
      </footer>
    </div>
  );
}
