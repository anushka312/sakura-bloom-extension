import { v4 as uuidv4 } from 'uuid';

export interface Quote {
  text: string;
  author: string;
}

export interface User {
  name: string;
  avatar: string; // Base64 or URL
  profileMessage: string;
  dailyStatus: string;
  lastStatusDate: string;
}

export interface Ritual {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'every2days';
  colorTag: string;
  streak: number;
  lastCompleted: string | null;
  createdAt: string;
  reminderTime?: string; // HH:mm format
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  date: string;
}

export interface FocusSession {
  id: string;
  duration: number; // minutes
  date: string;
  type: 'pomodoro' | 'short-break' | 'long-break';
}

export interface GardenEvent {
  id: string;
  text: string;
  date: string;
}

export interface AppState {
  version: number;
  user: User;
  rituals: Ritual[];
  tasks: Task[];
  focusSessions: FocusSession[];
  events: GardenEvent[];
  logs: Record<string, string[]>; // date -> ritualIds
  reflections: Record<string, { text: string; mood: string }>;
  points: number;
  level: number;
  xpToNextLevel: number;
  rewardsUnlocked: string[];
  achievements: string[];
  stats: {
    totalCompleted: number;
    bestStreak: number;
  };
  quoteOfDay: {
    quote: Quote;
    date: string;
  };
  lastGreetingDate: string;
  theme: 'bubbleMint' | 'lavenderPop' | 'raspberryCitrus';
  settings: {
    animations: boolean;
    sparkles: boolean;
    focusMode: boolean;
    notifications: boolean;
  };
}

export const DEFAULT_STATE: AppState = {
  version: 4,
  user: {
    name: "",
    avatar: "🌸",
    profileMessage: "Growing my garden one step at a time.",
    dailyStatus: "",
    lastStatusDate: ""
  },
  rituals: [],
  tasks: [],
  focusSessions: [],
  events: [],
  logs: {},
  reflections: {},
  points: 0,
  level: 1,
  xpToNextLevel: 150,
  rewardsUnlocked: [],
  achievements: [],
  stats: {
    totalCompleted: 0,
    bestStreak: 0
  },
  quoteOfDay: {
    quote: { text: "The smallest step is still progress.", author: "Sakura Spirit" },
    date: ""
  },
  lastGreetingDate: "",
  theme: "bubbleMint",
  settings: {
    animations: true,
    sparkles: true,
    focusMode: false,
    notifications: true
  }
};

export const QUOTES: Quote[] = [
  { text: "A garden requires patient labor and attention.", author: "Liberty Hyde Bailey" },
  { text: "To plant a garden is to believe in tomorrow.", author: "Audrey Hepburn" },
  { text: "Every flower blooms in its own time.", author: "Ken Petti" },
  { text: "The earth laughs in flowers.", author: "Ralph Waldo Emerson" },
  { text: "Where flowers bloom so does hope.", author: "Lady Bird Johnson" },
  { text: "Deep in their roots, all flowers keep the light.", author: "Theodore Roethke" },
  { text: "Flowers are the music of the ground.", author: "Edwin Curran" },
  { text: "Happiness held is the seed; Happiness shared is the flower.", author: "John Harrigan" },
  { text: "The flower that follows the sun does so even on cloudy days.", author: "Robert Leighton" },
  { text: "Love is the flower you've got to let grow.", author: "John Lennon" }
];

export const REWARDS = [
  { level: 2, id: 'sakura_badge', name: '🌸 Sakura Badge', description: 'A symbol of your first steps.' },
  { level: 3, id: 'sparkle_aura', name: '✨ Sparkle Aura', description: 'Your spirit begins to glow.' },
  { level: 5, id: 'lavender_theme', name: '🎨 Lavender Pop Theme', description: 'Unlock a new aesthetic.' },
  { level: 7, id: 'golden_bloom', name: '🌟 Golden Bloom Badge', description: 'You are a dedicated gardener.' },
  { level: 10, id: 'master_gardener', name: '💮 Master Gardener Title', description: 'The ultimate recognition.' }
];

export function getTodayISO() {
  return new Date().toISOString().split('T')[0];
}

export function generateId() {
  return uuidv4();
}
