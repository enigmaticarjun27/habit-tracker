import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

const HabitContext = createContext();

export const WEEK_COLORS = ['#60A5FA', '#F472B6', '#34D399', '#FBBF24', '#A78BFA'];

const DEFAULT_HABITS = [
  { id: '1',  name: 'Morning Workout',          icon: '💪', color: '#60A5FA' },
  { id: '2',  name: 'Drink 8 Glasses Water',    icon: '💧', color: '#38BDF8' },
  { id: '3',  name: 'Wake up by 4:00 AM',       icon: '⏰', color: '#FBBF24' },
  { id: '4',  name: 'Cold Shower',              icon: '🚿', color: '#E879F9' },
  { id: '5',  name: 'Stretch / Mobility',       icon: '🤸', color: '#34D399' },
  { id: '6',  name: 'Meditate (10 min)',         icon: '🧘', color: '#A78BFA' },
  { id: '7',  name: 'Journal / Brain Dump',     icon: '📝', color: '#FB923C' },
  { id: '8',  name: 'No Phone First 30 Min',    icon: '📵', color: '#F87171' },
  { id: '9',  name: 'Study Core Subjects',      icon: '📚', color: '#818CF8' },
  { id: '10', name: 'Work on Project',          icon: '💻', color: '#4ADE80' },
  { id: '11', name: 'Watch Educational Video',  icon: '🎓', color: '#FCD34D' },
  { id: '12', name: 'Revise Yesterday\'s Notes',icon: '🔄', color: '#6EE7B7' },
  { id: '13', name: 'Learn Something New',      icon: '🌱', color: '#C084FC' },
  { id: '14', name: 'Plan Tomorrow (5 min)',    icon: '📋', color: '#94A3B8' },
  { id: '15', name: 'Evening Walk / Run',       icon: '🏃', color: '#F472B6' },
];

const DEFAULT_GOALS = [
  { id: '1', title: 'Run a 5K', progress: 3, target: 5, unit: 'km', color: '#60A5FA' },
  { id: '2', title: 'Read 12 Books', progress: 4, target: 12, unit: 'books', color: '#F472B6' },
  { id: '3', title: 'Meditate 100 Days', progress: 23, target: 100, unit: 'days', color: '#34D399' },
  { id: '4', title: 'Save ₹50,000', progress: 12500, target: 50000, unit: '₹', color: '#FBBF24' },
];

export function toDateStr(date) {
  return date.toISOString().split('T')[0];
}

// Generates realistic demo data for the previous calendar month
// Generates demo data for previous full month + current month up to yesterday
function generateDemoData(habits) {
  const today = new Date();
  // Rates matched to each habit's realistic difficulty
  const baseRates = [0.78, 0.88, 0.62, 0.74, 0.82, 0.76, 0.69, 0.71, 0.84, 0.73, 0.80, 0.77, 0.70, 0.85, 0.75];
  const weekBoosts = [0.10, -0.08, 0.04, 0.08, 0.06];

  const completions = {};
  habits.forEach((h, idx) => { completions[h.id] = {}; });

  // Previous full month
  const prevMonth = today.getMonth() === 0 ? 12 : today.getMonth();
  const prevYear = today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();
  const daysInPrevMonth = new Date(prevYear, prevMonth, 0).getDate();

  habits.forEach((h, idx) => {
    const base = baseRates[idx % baseRates.length];
    for (let day = 1; day <= daysInPrevMonth; day++) {
      const dateStr = `${prevYear}-${String(prevMonth).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
      const weekBoost = weekBoosts[Math.min(Math.floor((day - 1) / 7), weekBoosts.length - 1)];
      const dow = new Date(prevYear, prevMonth - 1, day).getDay();
      const rate = Math.max(0.08, Math.min(0.97, base + weekBoost + (dow === 0 || dow === 6 ? -0.14 : 0)));
      completions[h.id][dateStr] = Math.random() < rate;
    }
  });

  // Current month up to yesterday
  const curYear = today.getFullYear();
  const curMonth = today.getMonth() + 1;
  const yesterday = today.getDate() - 1;

  habits.forEach((h, idx) => {
    const base = baseRates[idx % baseRates.length];
    for (let day = 1; day <= yesterday; day++) {
      const dateStr = `${curYear}-${String(curMonth).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
      const weekBoost = weekBoosts[Math.min(Math.floor((day - 1) / 7), weekBoosts.length - 1)];
      const dow = new Date(curYear, curMonth - 1, day).getDay();
      const rate = Math.max(0.08, Math.min(0.97, base + weekBoost + (dow === 0 || dow === 6 ? -0.14 : 0)));
      completions[h.id][dateStr] = Math.random() < rate;
    }
  });

  return completions;
}

export function HabitProvider({ children }) {
  const { user, isDemo } = useAuth();
  const [habits, setHabits] = useState(DEFAULT_HABITS);
  const [completions, setCompletions] = useState({});
  const [goals, setGoals] = useState(DEFAULT_GOALS);
  const [loaded, setLoaded] = useState(false);
  const saveTimer = useRef(null);
  const isFirstLoad = useRef(true);

  // Load demo data when in demo mode
  useEffect(() => {
    if (!isDemo) return;
    const demoCompletions = generateDemoData(DEFAULT_HABITS);
    setHabits(DEFAULT_HABITS);
    setCompletions(demoCompletions);
    setGoals(DEFAULT_GOALS);
    setLoaded(true);
    isFirstLoad.current = false;
  }, [isDemo]);

  // Load data from Firestore when user logs in
  useEffect(() => {
    if (!user) { if (!isDemo) setLoaded(false); return; }

    const load = async () => {
      try {
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setHabits(data.habits || DEFAULT_HABITS);
          setCompletions(data.completions || {});
          setGoals(data.goals || DEFAULT_GOALS);
        } else {
          // New user — generate demo data for previous month so charts look great
          const demoCompletions = generateDemoData(DEFAULT_HABITS);
          setCompletions(demoCompletions);
          setGoals(DEFAULT_GOALS);
          await setDoc(ref, { habits: DEFAULT_HABITS, completions: demoCompletions, goals: DEFAULT_GOALS });
        }
      } catch (e) {
        console.error('Failed to load from Firestore:', e);
      }
      setLoaded(true);
      isFirstLoad.current = false;
    };

    load();
  }, [user]);

  // Save to Firestore whenever data changes (debounced 1.5s) — skip in demo mode
  useEffect(() => {
    if (!loaded || !user || isDemo || isFirstLoad.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await setDoc(doc(db, 'users', user.uid), { habits, completions, goals });
      } catch (e) {
        console.error('Failed to save:', e);
      }
    }, 1500);
  }, [habits, completions, goals]);

  const toggleCompletion = (habitId, dateStr) => {
    setCompletions(prev => ({
      ...prev,
      [habitId]: { ...prev[habitId], [dateStr]: !prev[habitId]?.[dateStr] }
    }));
  };

  const getStreak = (habitId) => {
    let streak = 0;
    const d = new Date();
    if (!completions[habitId]?.[toDateStr(d)]) d.setDate(d.getDate() - 1);
    while (completions[habitId]?.[toDateStr(d)]) {
      streak++;
      d.setDate(d.getDate() - 1);
    }
    return streak;
  };

  const getLongestStreak = (habitId) => {
    const dates = Object.keys(completions[habitId] || {}).sort();
    let longest = 0, cur = 0;
    for (let i = 0; i < dates.length; i++) {
      if (completions[habitId][dates[i]]) { cur++; if (cur > longest) longest = cur; }
      else cur = 0;
    }
    return longest;
  };

  const getMonthlyData = (year, month) => {
    const daysInMonth = new Date(year, month, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
      const done = habits.filter(h => completions[h.id]?.[dateStr]).length;
      return { day, done, total: habits.length, pct: habits.length ? Math.round((done / habits.length) * 100) : 0 };
    });
  };

  const getWeeklyStats = (year, month) => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const weeks = [];
    let weekStart = 1, wIdx = 0;
    while (weekStart <= daysInMonth) {
      const weekEnd = Math.min(weekStart + 6, daysInMonth);
      let done = 0, total = 0;
      for (let d = weekStart; d <= weekEnd; d++) {
        const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        habits.forEach(h => { total++; if (completions[h.id]?.[dateStr]) done++; });
      }
      weeks.push({
        label: `Week ${wIdx + 1}`, done, total,
        pct: total ? Math.round((done / total) * 100) : 0,
        color: WEEK_COLORS[wIdx % WEEK_COLORS.length],
        days: Array.from({ length: weekEnd - weekStart + 1 }, (_, i) => weekStart + i),
      });
      weekStart = weekEnd + 1; wIdx++;
    }
    return weeks;
  };

  const addHabit = (habit) => setHabits(prev => [...prev, { ...habit, id: Date.now().toString() }]);
  const removeHabit = (id) => setHabits(prev => prev.filter(h => h.id !== id));
  const addGoal = (goal) => setGoals(prev => [...prev, { ...goal, id: Date.now().toString() }]);
  const updateGoal = (id, updates) => setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  const removeGoal = (id) => setGoals(prev => prev.filter(g => g.id !== id));

  return (
    <HabitContext.Provider value={{
      habits, completions, goals, loaded,
      toggleCompletion, getStreak, getLongestStreak,
      getMonthlyData, getWeeklyStats,
      addHabit, removeHabit,
      addGoal, updateGoal, removeGoal,
      toDateStr,
    }}>
      {children}
    </HabitContext.Provider>
  );
}

export const useHabits = () => useContext(HabitContext);
