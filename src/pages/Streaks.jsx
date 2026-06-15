import { useHabits } from '../context/HabitContext';
import { Flame, Trophy, TrendingUp, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function Streaks() {
  const { habits, getStreak, getLongestStreak, completions, toDateStr } = useHabits();

  const today = new Date();

  const habitData = habits
    .map(h => ({
      ...h,
      current: getStreak(h.id),
      longest: getLongestStreak(h.id),
    }))
    .sort((a, b) => b.current - a.current);

  // Last 30 days heatmap data
  const last30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (29 - i));
    const dateStr = toDateStr(d);
    const done = habits.filter(h => completions[h.id]?.[dateStr]).length;
    return {
      date: dateStr,
      day: d.getDate(),
      label: d.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      done,
      pct: habits.length ? Math.round((done / habits.length) * 100) : 0,
    };
  });

  const bestCurrent = habitData[0]?.current || 0;
  const bestOverall = Math.max(...habitData.map(h => h.longest), 0);
  const totalActive = habitData.filter(h => h.current > 0).length;

  const getHeatColor = (pct) => {
    if (pct === 0) return '#1E1E2E';
    if (pct < 30) return '#312e81';
    if (pct < 60) return '#4338ca';
    if (pct < 80) return '#6366F1';
    return '#818CF8';
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Streaks</h1>
        <p className="text-sm text-slate-500">Your consistency is your superpower</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { icon: Flame, label: 'Best Current', value: `${bestCurrent} days`, color: '#F97316' },
          { icon: Trophy, label: 'Best Ever', value: `${bestOverall} days`, color: '#FBBF24' },
          { icon: TrendingUp, label: 'Active Streaks', value: totalActive, color: '#34D399' },
          { icon: Calendar, label: 'Habits Tracked', value: habits.length, color: '#818CF8' },
        ].map(s => (
          <div key={s.label} className="bg-[#13131D] border border-[#1E1E2E] rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <s.icon size={14} style={{ color: s.color }} />
              <span className="text-xs text-slate-500">{s.label}</span>
            </div>
            <p className="text-xl font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Streak Bar Chart */}
      <div className="bg-[#13131D] border border-[#1E1E2E] rounded-2xl p-5 mb-6">
        <h2 className="text-sm font-semibold text-white mb-1">Current vs Longest Streak</h2>
        <p className="text-xs text-slate-500 mb-4">Per habit comparison</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={habitData} margin={{ top: 5, right: 5, left: -10, bottom: 40 }} barGap={2}>
            <XAxis
              dataKey="name"
              tick={{ fill: '#64748B', fontSize: 9 }}
              axisLine={false} tickLine={false}
              angle={-35} textAnchor="end" interval={0}
            />
            <YAxis tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#1A1A28', border: '1px solid #2A2A3E', borderRadius: 8, fontSize: 11 }}
              formatter={(v, name) => [v + ' days', name]}
            />
            <Bar dataKey="longest" name="Longest" fill="#2A2A3E" radius={[4, 4, 0, 0]} />
            <Bar dataKey="current" name="Current" radius={[4, 4, 0, 0]}>
              {habitData.map((h, i) => <Cell key={i} fill={h.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Leaderboard */}
        <div className="bg-[#13131D] border border-[#1E1E2E] rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-[#1E1E2E]">
            <h2 className="text-sm font-semibold text-white">Streak Leaderboard</h2>
            <p className="text-xs text-slate-500 mt-0.5">Ranked by current streak</p>
          </div>
          <div className="divide-y divide-[#1E1E2E]">
            {habitData.map((h, i) => (
              <div key={h.id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02]">
                <span className="text-base w-6 text-center">
                  {i < 3 ? MEDALS[i] : <span className="text-xs text-slate-500">{i + 1}</span>}
                </span>
                <span className="text-lg">{h.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-200 truncate">{h.name}</p>
                  <p className="text-xs text-slate-500">Best: {h.longest} days</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {h.current > 0 ? (
                    <>
                      <Flame size={12} className="text-orange-400" />
                      <span className="text-sm font-bold" style={{ color: h.color }}>{h.current}</span>
                    </>
                  ) : (
                    <span className="text-xs text-slate-600">—</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 30-Day Heatmap */}
        <div className="bg-[#13131D] border border-[#1E1E2E] rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white mb-1">30-Day Activity</h2>
          <p className="text-xs text-slate-500 mb-4">Daily completion intensity</p>
          <div className="grid grid-cols-6 gap-1.5 mb-3">
            {last30.map((d, i) => (
              <div
                key={i}
                className="aspect-square rounded-lg flex items-center justify-center cursor-default group relative"
                style={{ backgroundColor: getHeatColor(d.pct) }}
                title={`${d.label}: ${d.pct}%`}
              >
                <span className="text-[9px] font-bold text-white/60">{d.day}</span>
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#1A1A28] border border-[#2A2A3E] rounded px-2 py-1 text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-10 transition-opacity">
                  {d.label}: {d.pct}%
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-slate-500">Less</span>
            {[0, 25, 50, 75, 100].map(pct => (
              <div key={pct} className="w-4 h-4 rounded" style={{ backgroundColor: getHeatColor(pct) }} />
            ))}
            <span className="text-xs text-slate-500">More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
