import { useState } from 'react';
import { useHabits, WEEK_COLORS } from '../context/HabitContext';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
  PieChart, Pie,
} from 'recharts';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function DonutCard({ label, pct, color, done, total }) {
  const data = [
    { value: Math.max(pct, 0.01), fill: color },
    { value: Math.max(100 - pct, 0.01), fill: '#1E1E2E' },
  ];
  return (
    <div className="bg-[#13131D] border border-[#1E1E2E] rounded-2xl p-4 flex flex-col items-center gap-2">
      <p className="text-xs font-semibold text-slate-400">{label}</p>
      <div className="relative" style={{ width: 120, height: 120 }}>
        <PieChart width={120} height={120}>
          <Pie data={data} cx={60} cy={60} innerRadius={38} outerRadius={52} dataKey="value" startAngle={90} endAngle={-270} stroke="none">
            {data.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
          </Pie>
        </PieChart>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-bold text-white">{pct}%</span>
        </div>
      </div>
      <p className="text-xs text-slate-500">{done}/{total} done</p>
    </div>
  );
}

export default function Analytics() {
  const { habits, completions, getMonthlyData, getWeeklyStats, getStreak, getLongestStreak } = useHabits();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);

  const monthlyData = getMonthlyData(year, month);
  const weeklyStats = getWeeklyStats(year, month);

  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });

  const pieData = habits.slice(0, 6).map(h => {
    const done = monthlyData.filter(d => {
      const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(d.day).padStart(2,'0')}`;
      return completions[h.id]?.[dateStr];
    }).length;
    return { name: h.name, value: Math.max(done, 0.01), fill: h.color };
  });

  const habitStats = habits.map(h => {
    const done = monthlyData.filter(d => {
      const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(d.day).padStart(2,'0')}`;
      return completions[h.id]?.[dateStr];
    }).length;
    const pct = monthlyData.length ? Math.round((done / monthlyData.length) * 100) : 0;
    return { ...h, done, pct, streak: getStreak(h.id), longest: getLongestStreak(h.id) };
  }).sort((a, b) => b.pct - a.pct);

  const overallPct = monthlyData.length
    ? Math.round(monthlyData.reduce((s, d) => s + d.pct, 0) / monthlyData.length)
    : 0;

  const pieTotal = pieData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Analytics</h1>
          <p className="text-sm text-slate-500">Deep dive into your habit performance</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="p-2 rounded-lg bg-[#13131D] border border-[#1E1E2E] text-slate-400 hover:text-white transition-all">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-semibold text-white min-w-[120px] text-center">{monthName} {year}</span>
          <button onClick={nextMonth} className="p-2 rounded-lg bg-[#13131D] border border-[#1E1E2E] text-slate-400 hover:text-white transition-all">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-[#13131D] border border-[#1E1E2E] rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-white">Monthly Completion Trend</h2>
            <p className="text-xs text-slate-500 mt-0.5">Daily % of habits completed</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{overallPct}%</p>
            <p className="text-xs text-slate-500">Monthly avg</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={monthlyData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#818CF8" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#818CF8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} interval={1} />
            <YAxis tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`} />
            <Tooltip
              contentStyle={{ background: '#1A1A28', border: '1px solid #2A2A3E', borderRadius: 8, fontSize: 11, color: '#fff' }}
              formatter={(v) => [`${v}%`, 'Completion']}
              labelFormatter={l => `Day ${l}`}
            />
            <Area type="monotone" dataKey="pct" name="Completion" stroke="#818CF8" strokeWidth={2} fill="url(#areaGrad)" dot={false} activeDot={{ r: 4, fill: '#818CF8' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Weekly + Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-[#13131D] border border-[#1E1E2E] rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white mb-1">Weekly Breakdown</h2>
          <p className="text-xs text-slate-500 mb-4">Habits completed per week</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyStats} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
              <XAxis dataKey="label" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1A1A28', border: '1px solid #2A2A3E', borderRadius: 8, fontSize: 11, color: '#fff' }} />
              <Bar dataKey="done" name="Completed" radius={[6, 6, 0, 0]}>
                {weeklyStats.map((w, i) => <Cell key={i} fill={w.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Distribution Pie */}
        <div className="bg-[#13131D] border border-[#1E1E2E] rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white mb-1">Habit Distribution</h2>
          <p className="text-xs text-slate-500 mb-2">Completions by habit this month</p>
          {pieTotal > 0 ? (
            <div className="flex items-center gap-4">
              <div className="shrink-0" style={{ width: 160, height: 160 }}>
                <PieChart width={160} height={160}>
                  <Pie data={pieData} cx={80} cy={80} innerRadius={45} outerRadius={70} dataKey="value" stroke="none">
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                </PieChart>
              </div>
              <div className="flex-1 space-y-2">
                {pieData.map(d => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.fill }} />
                    <span className="text-xs text-slate-400 truncate flex-1">{d.name}</span>
                    <span className="text-xs font-bold text-white">{Math.round(d.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-slate-600 text-sm">No data for this period</div>
          )}
        </div>
      </div>

      {/* Weekly Donut Charts */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-white mb-4">Weekly Completion Rates</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {weeklyStats.map((w, i) => (
            <DonutCard key={i} label={w.label} pct={w.pct} color={w.color} done={w.done} total={w.total} />
          ))}
        </div>
      </div>

      {/* Per-Habit Stats Table */}
      <div className="bg-[#13131D] border border-[#1E1E2E] rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-[#1E1E2E]">
          <h2 className="text-sm font-semibold text-white">Habit Performance</h2>
          <p className="text-xs text-slate-500 mt-0.5">Ranked by completion rate this month</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1E1E2E]">
                <th className="text-left px-5 py-3 text-xs text-slate-500 font-medium">#</th>
                <th className="text-left px-5 py-3 text-xs text-slate-500 font-medium">HABIT</th>
                <th className="text-center px-4 py-3 text-xs text-slate-500 font-medium">DONE</th>
                <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium min-w-[140px]">PROGRESS</th>
                <th className="text-center px-4 py-3 text-xs text-slate-500 font-medium">STREAK</th>
                <th className="text-center px-4 py-3 text-xs text-slate-500 font-medium">LONGEST</th>
              </tr>
            </thead>
            <tbody>
              {habitStats.map((h, i) => (
                <tr key={h.id} className="border-b border-[#1E1E2E] hover:bg-white/[0.02]">
                  <td className="px-5 py-3 text-xs text-slate-500">{i + 1}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{h.icon}</span>
                      <span className="text-sm text-slate-200">{h.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm font-bold text-white">{h.done}</span>
                    <span className="text-xs text-slate-500">/{monthlyData.length}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-[#1E1E2E] rounded-full overflow-hidden min-w-[80px]">
                        <div className="h-full rounded-full transition-all" style={{ width: `${h.pct}%`, backgroundColor: h.color }} />
                      </div>
                      <span className="text-xs font-semibold" style={{ color: h.pct >= 80 ? '#34D399' : h.pct >= 60 ? '#FBBF24' : '#F87171' }}>
                        {h.pct}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm font-bold" style={{ color: h.color }}>{h.streak} 🔥</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm font-bold text-slate-400">{h.longest}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
