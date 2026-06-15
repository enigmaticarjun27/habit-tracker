import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

const HabitContext = createContext();

export const WEEK_COLORS = ['#60A5FA', '#F472B6', '#34D399', '#FBBF24', '#A78BFA'];

const DEFAULT_HABITS = [
  { id: '1', name: 'Morning Workout', icon: '💪', color: '#60A5FA' },
  { id: '2', name: 'Read 30 Minutes', icon: '📚', color: '#F472B6' },
  { id: '3', name: 'Drink 8 Glasses Water', icon: '💧', color: '#34D399' },
  { id: '4', name: 'Meditate 10 Min', icon: '🧘', color: '#FBBF24' },
  { id: '5', name: 'Study / Learn', icon: '🎓', color: '#A78BFA' },
  { id: '6', name: 'Journal Writing', icon: '📝', color: '#FB923C' },
  { id: '7', name: 'Sleep by 11 PM', icon: '😴', color: '#38BDF8' },
  { id: '8', name: 'Healthy Eating', icon: '🥗', color: '#4ADE80' },
  { id: '9', name: 'Cold Shower', icon: '🚿', color: '#E879F9' },
  { id: '10', name: 'Practice Skill', icon: '⚡', color: '#F87171' },
  { id: '11', name: 'No Screen After 9PM', icon: '📵', color: '#FCD34D' },
  { id: '12', name: 'Walk / Steps', icon: '🚶', color: '#6EE7B7' },
];

const DEFAULT_GOALS = [
  { id: '1', title: 'Run a 5K', progress: 0, target: 5, unit: 'km', color: '#60A5FA' },
  { id: '2', title: 'Read 12 Books', progress: 0, target: 12, unit: 'books', color: '#F472B6' },
  { id: '3', title: 'Meditate 100 Days', progress: 0, target: 100, unit: 'days', color: '#34D399' },
  { id: '4', title: 'Save ₹50,000', progress: 0, target: 50000, unit: '₹', color: '#FBBF24' },
];

export function toDateStr(date) {
  return date.toISOString().split('T')[0];
}

export function HabitProvider({ children }) {
  const { user } = useAuth();
  const [habits, setHabits] = useState(DEFAULT_HABITS);
  const [completions, setCompletions] = useState({});
  const [goals, setGoals] = useState(DEFAULT_GOALS);
  const [loaded, setLoaded] = useState(false);
  const saveTimer = useRef(null);
  const isFirstLoad = useRef(true);

  // Load data from Firestore when user logs in
  useEffect(() => {
    if (!user) { setLoaded(false); return; }

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
          // New user — save defaults
          await setDoc(ref, { habits: DEFAULT_HABITS, completions: {}, goals: DEFAULT_GOALS });
        }
      } catch (e) {
        console.error('Failed to load from Firestore:', e);
      }
      setLoaded(true);
      isFirstLoad.current = false;
    };

    load();
  }, [user]);

  // Save to Firestore whenever data changes (debounced 1.5s)
  useEffect(() => {
    if (!loaded || !user || isFirstLoad.current) return;
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
