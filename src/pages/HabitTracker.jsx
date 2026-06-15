import { useState } from 'react';
import { useHabits, WEEK_COLORS } from '../context/HabitContext';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';

const WEEK_BG = ['#60A5FA22', '#F472B622', '#34D39922', '#FBBF2422', '#A78BFA22'];

function getWeekIdx(day) {
  return Math.floor((day - 1) / 7);
}

export default function HabitTracker() {
  const { habits, completions, toggleCompletion, toDateStr, addHabit, removeHabit } = useHabits();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [showAdd, setShowAdd] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: '', icon: '✅', color: '#818CF8' });

  const daysInMonth = new Date(year, month, 0).getDate();
  const todayStr = toDateStr(today);

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const getDateStr = (day) =>
    `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;

  const getHabitPct = (habitId) => {
    let done = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      if (completions[habitId]?.[getDateStr(d)]) done++;
    }
    return daysInMonth ? Math.round((done / daysInMonth) * 100) : 0;
  };

  const getDayTotal = (day) => {
    const dateStr = getDateStr(day);
    return habits.filter(h => completions[h.id]?.[dateStr]).length;
  };

  const getDayPct = (day) => {
    const dateStr = getDateStr(day);
    const done = habits.filter(h => completions[h.id]?.[dateStr]).length;
    return habits.length ? Math.round((done / habits.length) * 100) : 0;
  };

  // Group days into weeks
  const weeks = [];
  let d = 1;
  while (d <= daysInMonth) {
    weeks.push(Array.from({ length: Math.min(7, daysInMonth - d + 1) }, (_, i) => d + i));
    d += 7;
  }

  const handleAdd = () => {
    if (!newHabit.name.trim()) return;
    addHabit(newHabit);
    setNewHabit({ name: '', icon: '✅', color: '#818CF8' });
    setShowAdd(false);
  };

  const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });

  return (
    <div className="p-6 max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Habit Tracker</h1>
          <p className="text-sm text-slate-500">Check off your daily habits</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="p-2 rounded-lg bg-[#13131D] border border-[#1E1E2E] text-slate-400 hover:text-white hover:border-indigo-500/50 transition-all">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-semibold text-white min-w-[120px] text-center">{monthName} {year}</span>
          <button onClick={nextMonth} className="p-2 rounded-lg bg-[#13131D] border border-[#1E1E2E] text-slate-400 hover:text-white hover:border-indigo-500/50 transition-all">
            <ChevronRight size={16} />
          </button>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all">
            <Plus size={14} /> Add Habit
          </button>
        </div>
      </div>

      {/* Add Habit Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[#13131D] border border-[#1E1E2E] rounded-2xl p-6 w-full max-w-sm">
            <h2 className="text-base font-semibold text-white mb-4">New Habit</h2>
            <div className="space-y-3">
              <input
                className="w-full bg-[#0A0A0F] border border-[#2A2A3E] rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                placeholder="Habit name..."
                value={newHabit.name}
                onChange={e => setNewHabit(p => ({ ...p, name: e.target.value }))}
                autoFocus
              />
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-slate-500 mb-1 block">Icon</label>
                  <input
                    className="w-full bg-[#0A0A0F] border border-[#2A2A3E] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    value={newHabit.icon}
                    onChange={e => setNewHabit(p => ({ ...p, icon: e.target.value }))}
                    maxLength={2}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-slate-500 mb-1 block">Color</label>
                  <input
                    type="color"
                    className="w-full h-10 bg-[#0A0A0F] border border-[#2A2A3E] rounded-xl px-2 py-1 cursor-pointer"
                    value={newHabit.color}
                    onChange={e => setNewHabit(p => ({ ...p, color: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowAdd(false)} className="flex-1 px-4 py-2 rounded-xl border border-[#2A2A3E] text-slate-400 text-sm hover:text-white transition-all">Cancel</button>
              <button onClick={handleAdd} className="flex-1 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all">Add</button>
            </div>
          </div>
        </div>
      )}

      {/* Tracker Grid */}
      <div className="bg-[#13131D] border border-[#1E1E2E] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max text-xs">
            <thead>
              {/* Week headers */}
              <tr className="border-b border-[#1E1E2E]">
                <th className="sticky left-0 bg-[#13131D] z-10 px-4 py-3 text-left text-slate-500 font-medium min-w-[160px]">
                  HABIT
                </th>
                {weeks.map((weekDays, wi) => (
                  <th
                    key={wi}
                    colSpan={weekDays.length}
                    className="px-2 py-2 text-center font-semibold"
                    style={{ backgroundColor: WEEK_BG[wi % WEEK_BG.length], color: WEEK_COLORS[wi % WEEK_COLORS.length] }}
                  >
                    Week {wi + 1}
                  </th>
                ))}
                <th className="px-3 py-2 text-slate-500 font-medium text-center">DONE</th>
                <th className="px-3 py-2 text-slate-500 font-medium text-center">%</th>
              </tr>
              {/* Day numbers */}
              <tr className="border-b border-[#1E1E2E]">
                <th className="sticky left-0 bg-[#13131D] z-10 px-4 py-2 text-slate-500" />
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const dateStr = getDateStr(day);
                  const isToday = dateStr === todayStr;
                  const wi = getWeekIdx(day);
                  return (
                    <th
                      key={day}
                      className="px-1 py-1 text-center font-medium w-8"
                      style={{
                        backgroundColor: WEEK_BG[wi % WEEK_BG.length],
                        color: isToday ? WEEK_COLORS[wi] : '#64748B'
                      }}
                    >
                      {isToday ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-xs" style={{ backgroundColor: WEEK_COLORS[wi] }}>
                          {day}
                        </span>
                      ) : day}
                    </th>
                  );
                })}
                <th className="px-3 py-2 text-slate-500" />
                <th className="px-3 py-2 text-slate-500" />
              </tr>
            </thead>

            <tbody>
              {habits.map(h => {
                const pct = getHabitPct(h.id);
                const doneCount = Array.from({ length: daysInMonth }, (_, i) => i + 1)
                  .filter(d => completions[h.id]?.[getDateStr(d)]).length;
                return (
                  <tr key={h.id} className="border-b border-[#1E1E2E] hover:bg-white/[0.02] group">
                    <td className="sticky left-0 bg-[#13131D] group-hover:bg-[#1A1A28] z-10 px-4 py-2">
                      <div className="flex items-center gap-2">
                        <span>{h.icon}</span>
                        <span className="text-slate-200 text-xs font-medium truncate max-w-[100px]">{h.name}</span>
                        <button
                          onClick={() => removeHabit(h.id)}
                          className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all ml-auto"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </td>

                    {Array.from({ length: daysInMonth }, (_, i) => {
                      const day = i + 1;
                      const dateStr = getDateStr(day);
                      const done = completions[h.id]?.[dateStr];
                      const wi = getWeekIdx(day);
                      const isToday = dateStr === todayStr;
                      return (
                        <td
                          key={day}
                          className="text-center p-1 cursor-pointer"
                          style={{ backgroundColor: WEEK_BG[wi % WEEK_BG.length] }}
                          onClick={() => toggleCompletion(h.id, dateStr)}
                        >
                          <div
                            className="w-5 h-5 mx-auto rounded flex items-center justify-center transition-all"
                            style={{
                              backgroundColor: done ? h.color + '33' : 'transparent',
                              border: done ? `1.5px solid ${h.color}` : isToday ? '1.5px dashed #4B5563' : '1.5px solid #2A2A3E',
                            }}
                          >
                            {done && (
                              <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                                <path d="M1 3.5L3.5 6L8 1" stroke={h.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </div>
                        </td>
                      );
                    })}

                    <td className="px-3 py-2 text-center font-bold" style={{ color: h.color }}>
                      {doneCount}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className={`text-xs font-semibold ${pct >= 80 ? 'text-emerald-400' : pct >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                        {pct}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            <tfoot>
              {/* Day completion % */}
              <tr className="border-t border-[#1E1E2E] bg-[#0A0A0F]">
                <td className="sticky left-0 bg-[#0A0A0F] z-10 px-4 py-2 text-slate-500 font-medium">DAILY %</td>
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const pct = getDayPct(day);
                  const wi = getWeekIdx(day);
                  return (
                    <td key={day} className="text-center py-1" style={{ backgroundColor: WEEK_BG[wi % WEEK_BG.length] }}>
                      <span className="text-[9px] font-bold" style={{ color: WEEK_COLORS[wi] }}>
                        {pct > 0 ? `${pct}%` : '—'}
                      </span>
                    </td>
                  );
                })}
                <td className="px-3 py-2" />
                <td className="px-3 py-2" />
              </tr>
              {/* Day count */}
              <tr className="bg-[#0A0A0F]">
                <td className="sticky left-0 bg-[#0A0A0F] z-10 px-4 py-2 text-slate-500 font-medium">COUNT</td>
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const count = getDayTotal(day);
                  const wi = getWeekIdx(day);
                  return (
                    <td key={day} className="text-center py-1" style={{ backgroundColor: WEEK_BG[wi % WEEK_BG.length] }}>
                      <span className="text-[9px] font-bold text-slate-400">
                        {count > 0 ? count : '—'}
                      </span>
                    </td>
                  );
                })}
                <td className="px-3 py-2" />
                <td className="px-3 py-2" />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Week legend */}
      <div className="flex items-center gap-4 mt-4 flex-wrap">
        {weeks.map((_, wi) => (
          <div key={wi} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: WEEK_COLORS[wi] }} />
            <span className="text-xs text-slate-500">Week {wi + 1}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 ml-4">
          <div className="w-3 h-3 rounded-sm bg-emerald-400" />
          <span className="text-xs text-slate-500">≥80%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-amber-400" />
          <span className="text-xs text-slate-500">60–79%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-red-400" />
          <span className="text-xs text-slate-500">&lt;60%</span>
        </div>
      </div>
    </div>
  );
}
