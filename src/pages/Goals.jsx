import { useState } from 'react';
import { useHabits } from '../context/HabitContext';
import { Plus, Trash2, Edit3, Check, X, Target } from 'lucide-react';
import { PieChart, Pie, Cell } from 'recharts';

const PRESET_COLORS = ['#60A5FA', '#F472B6', '#34D399', '#FBBF24', '#A78BFA', '#FB923C', '#38BDF8', '#4ADE80'];

function GoalCard({ goal, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(goal.progress);
  const pct = Math.min(100, Math.round((goal.progress / goal.target) * 100));

  const pieData = [
    { value: pct, fill: goal.color },
    { value: 100 - pct, fill: '#1E1E2E' },
  ];

  const handleSave = () => {
    onUpdate(goal.id, { progress: Number(val) });
    setEditing(false);
  };

  return (
    <div className="bg-[#13131D] border border-[#1E1E2E] rounded-2xl p-5 hover:border-white/10 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: goal.color + '22' }}>
            <Target size={18} style={{ color: goal.color }} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">{goal.title}</h3>
            <p className="text-xs text-slate-500">{goal.unit}</p>
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
          <button onClick={() => setEditing(e => !e)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5">
            <Edit3 size={13} />
          </button>
          <button onClick={() => onDelete(goal.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Donut */}
      <div className="flex items-center gap-4">
        <div className="relative shrink-0" style={{ width: 100, height: 100 }}>
          <PieChart width={100} height={100}>
            <Pie data={pieData} cx={50} cy={50} innerRadius={32} outerRadius={45} dataKey="value" startAngle={90} endAngle={-270} stroke="none">
              {pieData.map((e, i) => <Cell key={i} fill={e.fill} />)}
            </Pie>
          </PieChart>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-lg font-bold text-white">{pct}%</span>
          </div>
        </div>

        <div className="flex-1">
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Progress</span>
              <span className="font-semibold text-white">{goal.progress} / {goal.target} {goal.unit}</span>
            </div>
            <div className="h-2 bg-[#1E1E2E] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: goal.color }} />
            </div>
          </div>

          {editing ? (
            <div className="flex gap-2">
              <input
                type="number"
                className="flex-1 bg-[#0A0A0F] border border-[#2A2A3E] rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
                value={val}
                onChange={e => setVal(e.target.value)}
                autoFocus
              />
              <button onClick={handleSave} className="p-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40">
                <Check size={13} />
              </button>
              <button onClick={() => { setEditing(false); setVal(goal.progress); }} className="p-1.5 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/40">
                <X size={13} />
              </button>
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              {goal.target - goal.progress > 0
                ? `${goal.target - goal.progress} ${goal.unit} remaining`
                : 'Goal achieved! 🎉'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Goals() {
  const { goals, addGoal, updateGoal, removeGoal } = useHabits();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', progress: 0, target: 100, unit: 'days', color: '#60A5FA' });

  const handleAdd = () => {
    if (!form.title.trim()) return;
    addGoal({ ...form, progress: Number(form.progress), target: Number(form.target) });
    setForm({ title: '', progress: 0, target: 100, unit: 'days', color: '#60A5FA' });
    setShowAdd(false);
  };

  const totalGoals = goals.length;
  const completed = goals.filter(g => g.progress >= g.target).length;
  const overallPct = totalGoals ? Math.round(
    goals.reduce((s, g) => s + Math.min(100, (g.progress / g.target) * 100), 0) / totalGoals
  ) : 0;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Goals</h1>
          <p className="text-sm text-slate-500">Track your bigger ambitions</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all"
        >
          <Plus size={14} /> New Goal
        </button>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Goals', value: totalGoals, color: '#818CF8' },
          { label: 'Completed', value: completed, color: '#34D399' },
          { label: 'Overall Progress', value: `${overallPct}%`, color: '#FBBF24' },
        ].map(s => (
          <div key={s.label} className="bg-[#13131D] border border-[#1E1E2E] rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[#13131D] border border-[#1E1E2E] rounded-2xl p-6 w-full max-w-sm">
            <h2 className="text-base font-semibold text-white mb-4">New Goal</h2>
            <div className="space-y-3">
              <input
                className="w-full bg-[#0A0A0F] border border-[#2A2A3E] rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                placeholder="Goal title..."
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                autoFocus
              />
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-slate-500 mb-1 block">Current</label>
                  <input type="number" className="w-full bg-[#0A0A0F] border border-[#2A2A3E] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    value={form.progress} onChange={e => setForm(p => ({ ...p, progress: e.target.value }))} />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-slate-500 mb-1 block">Target</label>
                  <input type="number" className="w-full bg-[#0A0A0F] border border-[#2A2A3E] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    value={form.target} onChange={e => setForm(p => ({ ...p, target: e.target.value }))} />
                </div>
              </div>
              <input
                className="w-full bg-[#0A0A0F] border border-[#2A2A3E] rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                placeholder="Unit (days, km, books, ₹...)"
                value={form.unit}
                onChange={e => setForm(p => ({ ...p, unit: e.target.value }))}
              />
              <div>
                <label className="text-xs text-slate-500 mb-2 block">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setForm(p => ({ ...p, color: c }))}
                      className="w-7 h-7 rounded-full border-2 transition-all"
                      style={{ backgroundColor: c, borderColor: form.color === c ? 'white' : 'transparent' }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowAdd(false)} className="flex-1 px-4 py-2 rounded-xl border border-[#2A2A3E] text-slate-400 text-sm hover:text-white transition-all">Cancel</button>
              <button onClick={handleAdd} className="flex-1 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all">Add Goal</button>
            </div>
          </div>
        </div>
      )}

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <div className="text-center py-20">
          <Target size={40} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No goals yet. Add your first goal!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map(g => (
            <GoalCard key={g.id} goal={g} onUpdate={updateGoal} onDelete={removeGoal} />
          ))}
        </div>
      )}
    </div>
  );
}
