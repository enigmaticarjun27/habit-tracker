import { createContext, useContext, useState, useEffect } from 'react';

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

function toDateStr(date) {
  return date.toISOString().split('T')[0];
}

function generateDemo(habits) {
  const c = {};
  const today = new Date();
  const rates = [0.9, 0.85, 0.95, 0.8, 0.75, 0.88, 0.7, 0.92, 0.65, 0.85, 0.78, 0.83];
  habits.forEach((h, idx) => {
    c[h.id] = {};
    for (let i = 90; i >= 1; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      c[h.id][toDateStr(d)] = Math.random() < (rates[idx] || 0.8);
    }
  });
  return c;
}

export function HabitProvider({ children }) {
  const [habits, setHabits] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ht_habits')) || DEFAULT_HABITS; } catch { return DEFAULT_HABITS; }
  });

  const [completions, setCompletions] = useState(() => {
    try {
      const saved = localStorage.getItem('ht_completions');
      if (saved) return JSON.parse(saved);
    } catch {}
    const demo = generateDemo(DEFAULT_HABITS);
    localStorage.setItem('ht_completions', JSON.stringify(demo));
    return demo;
  });

  const [goals, setGoals] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ht_goals')) || [
      { id: '1', title: 'Run a 5K', progress: 68, target: 100, unit: 'km', color: '#60A5FA' },
      { id: '2', title: 'Read 12 Books', progress: 7, target: 12, unit: 'books', color: '#F472B6' },
      { id: '3', title: 'Meditate 100 Days', progress: 72, target: 100, unit: 'days', color: '#34D399' },
      { id: '4', title: 'Save ₹50,000', progress: 32000, target: 50000, unit: '₹', color: '#FBBF24' },
    ]; } catch { return []; }
  });

  useEffect(() => { localStorage.setItem('ht_habits', JSON.stringify(habits)); }, [habits]);
  useEffect(() => { localStorage.setItem('ht_completions', JSON.stringify(completions)); }, [completions]);
  useEffect(() => { localStorage.setItem('ht_goals', JSON.stringify(goals)); }, [goals]);

  const toggleCompletion = (habitId, dateStr) => {
    setCompletions(prev => ({
      ...prev,
      [habitId]: { ...prev[habitId], [dateStr]: !prev[habitId]?.[dateStr] }
    }));
  };

  const getStreak = (habitId) => {
    let streak = 0;
    const d = new Date();
    // if today not done, start from yesterday
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
      if (completions[habitId][dates[i]]) {
        cur++;
        if (cur > longest) longest = cur;
      } else cur = 0;
    }
    return longest;
  };

  const getMonthlyData = (year, month) => {
    const daysInMonth = new Date(year, month, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
      const done = habits.filter(h => completions[h.id]?.[dateStr]).length;
      const total = habits.length;
      return { day, done, total, pct: total ? Math.round((done / total) * 100) : 0 };
    });
  };

  const getWeeklyStats = (year, month) => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const weeks = [];
    let weekStart = 1;
    let wIdx = 0;
    while (weekStart <= daysInMonth) {
      const weekEnd = Math.min(weekStart + 6, daysInMonth);
      let done = 0, total = 0;
      for (let d = weekStart; d <= weekEnd; d++) {
        const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        habits.forEach(h => {
          total++;
          if (completions[h.id]?.[dateStr]) done++;
        });
      }
      weeks.push({
        label: `Week ${wIdx + 1}`,
        done, total,
        pct: total ? Math.round((done / total) * 100) : 0,
        color: WEEK_COLORS[wIdx % WEEK_COLORS.length],
        days: Array.from({ length: weekEnd - weekStart + 1 }, (_, i) => weekStart + i),
      });
      weekStart = weekEnd + 1;
      wIdx++;
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
      habits, completions, goals,
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
