import { useHabits } from '../context/HabitContext';
import { useAuth } from '../context/AuthContext';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts';
import { Flame, CheckCircle2, TrendingUp, Calendar, Star } from 'lucide-react';
import { useState } from 'react';

const DAYS_SHORT = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function StatCard({ icon: Icon, label, value, sub, color = '#818CF8' }) {
  return (
    <div className="bg-[#13131D] border border-[#1E1E2E] rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + '22' }}>
          <Icon size={16} style={{ color }} />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1A1A28] border border-[#2A2A3E] rounded-xl p-3 text-xs">
      <p className="text-slate-400 mb-1">Day {label}</p>
      <p className="text-white font-semibold">{payload[0]?.value}% complete</p>
    </div>
  );
};

export default function Dashboard() {
  const { habits, completions, getStreak, getMonthlyData, toDateStr } = useHabits();
  const { user } = useAuth();
  const firstName = user?.displayName?.split(' ')[0] || 'there';
  const today = new Date();
  const todayStr = toDateStr(today);
  const [month] = useState(today.getMonth() + 1);
  const [year] = useState(today.getFullYear());

  const todayDone = habits.filter(h => completions[h.id]?.[todayStr]).length;
  const todayPct = habits.length ? Math.round((todayDone / habits.length) * 100) : 0;
  const bestStreak = Math.max(...habits.map(h => getStreak(h.id)));

  const monthlyData = getMonthlyData(year, month);
  const past30 = monthlyData.slice(0, today.getDate());

  // Weekly view (last 7 days)
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return { dateStr: toDateStr(d), dayOfWeek: i };
  });

  const topStreaks = habits
    .map(h => ({ ...h, streak: getStreak(h.id) }))
    .sort((a, b) => b.streak - a.streak)
    .slice(0, 5);

  const weeklyBarData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const dateStr = toDateStr(d);
    const done = habits.filter(h => completions[h.id]?.[dateStr]).length;
    return {
      day: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][d.getDay() === 0 ? 6 : d.getDay() - 1],
      done,
      total: habits.length,
    };
  });

  const greetingHour = today.getHours();
  const greeting = greetingHour < 12 ? 'Good Morning' : greetingHour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">{greeting}, {firstName}! 👋</h1>
        <p className="text-slate-400 text-sm mt-1">Let's make today count. You're on a roll!</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={CheckCircle2}
          label="Today's Habits"
          value={`${todayDone}/${habits.length}`}
          sub={`${todayPct}% complete`}
          color="#34D399"
        />
        <StatCard
          icon={Flame}
          label="Best Streak"
          value={`${bestStreak} days`}
          sub="Keep it going!"
          color="#F97316"
        />
        <StatCard
          icon={TrendingUp}
          label="Monthly Progress"
          value={`${past30.length ? Math.round(past30.reduce((s, d) => s + d.pct, 0) / past30.length) : 0}%`}
          sub={`${month}/${year} average`}
          color="#818CF8"
        />
        <StatCard
          icon={Calendar}
          label="Days Tracked"
          value={`${past30.filter(d => d.done > 0).length}`}
          sub={`of ${past30.length} days this month`}
          color="#FBBF24"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Monthly Trend */}
        <div className="lg:col-span-2 bg-[#13131D] border border-[#1E1E2E] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Monthly Trend</h2>
              <p className="text-xs text-slate-500">Daily completion % this month</p>
            </div>
            <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-lg">
              {today.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={past30} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="pctGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818CF8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#818CF8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="pct" stroke="#818CF8" strokeWidth={2} fill="url(#pctGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Bar */}
        <div className="bg-[#13131D] border border-[#1E1E2E] rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white mb-1">This Week</h2>
          <p className="text-xs text-slate-500 mb-4">Habits per day</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyBarData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <XAxis dataKey="day" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1A1A28', border: '1px solid #2A2A3E', borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="done" radius={[4, 4, 0, 0]}>
                {weeklyBarData.map((_, i) => (
                  <Cell key={i} fill={i === weeklyBarData.length - 1 ? '#818CF8' : '#2A2A3E'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Today's Habits + Top Streaks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Today's Habits */}
        <div className="bg-[#13131D] border border-[#1E1E2E] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Today's Habits</h2>
            <span className="text-xs text-slate-500">{todayStr}</span>
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {habits.map(h => {
              const done = completions[h.id]?.[todayStr];
              return (
                <div key={h.id} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${done ? 'bg-white/5' : 'hover:bg-white/5'}`}>
                  <span className="text-lg">{h.icon}</span>
                  <span className={`flex-1 text-sm ${done ? 'text-slate-400 line-through' : 'text-slate-200'}`}>{h.name}</span>
                  {done && <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />}
                  <div
                    className="w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center cursor-pointer transition-all"
                    style={{ borderColor: done ? h.color : '#2A2A3E', backgroundColor: done ? h.color + '33' : 'transparent' }}
                  >
                    {done && <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: h.color }} />}
                  </div>
                </div>
              );
            })}
          </div>
          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>{todayDone} completed</span>
              <span>{todayPct}%</span>
            </div>
            <div className="h-1.5 bg-[#1E1E2E] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all" style={{ width: `${todayPct}%` }} />
            </div>
          </div>
        </div>

        {/* Top Streaks + Week view */}
        <div className="space-y-4">
          {/* Week at a glance */}
          <div className="bg-[#13131D] border border-[#1E1E2E] rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-white mb-3">Week at a Glance</h2>
            <div className="flex gap-1 mb-3">
              {DAYS_SHORT.map((d, i) => (
                <div key={i} className="flex-1 text-center text-xs text-slate-500">{d}</div>
              ))}
            </div>
            {habits.slice(0, 4).map(h => (
              <div key={h.id} className="flex gap-1 mb-1">
                {weekDays.map(({ dateStr }, i) => {
                  const done = completions[h.id]?.[dateStr];
                  return (
                    <div key={i} className="flex-1 h-5 rounded flex items-center justify-center"
                      style={{ backgroundColor: done ? h.color + '44' : '#1E1E2E' }}>
                      {done && <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: h.color }} />}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Top Streaks */}
          <div className="bg-[#13131D] border border-[#1E1E2E] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Star size={14} className="text-amber-400" />
              <h2 className="text-sm font-semibold text-white">Top Streaks</h2>
            </div>
            <div className="space-y-3">
              {topStreaks.map((h, i) => (
                <div key={h.id} className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-4">{i + 1}</span>
                  <span className="text-base">{h.icon}</span>
                  <span className="flex-1 text-xs text-slate-300 truncate">{h.name}</span>
                  <div className="flex items-center gap-1">
                    <Flame size={12} className="text-orange-400" />
                    <span className="text-xs font-bold text-white">{h.streak}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
