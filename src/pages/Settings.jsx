import { useState } from 'react';
import { useHabits } from '../context/HabitContext';
import { Trash2, RefreshCw, Info, Plus, Check } from 'lucide-react';

const PRESET_COLORS = [
  '#60A5FA','#F472B6','#34D399','#FBBF24','#A78BFA',
  '#FB923C','#38BDF8','#4ADE80','#E879F9','#F87171',
  '#FCD34D','#6EE7B7','#818CF8','#C084FC','#94A3B8',
];

export default function Settings() {
  const { habits, removeHabit, addHabit } = useHabits();

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    const trimName = name.trim();
    const trimIcon = icon.trim();
    if (!trimName || !trimIcon) return;
    addHabit({ name: trimName, icon: trimIcon, color });
    setName('');
    setIcon('');
    setColor(PRESET_COLORS[0]);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const clearAllHabits = () => {
    if (window.confirm(`Remove all ${habits.length} habits? This cannot be undone.`)) {
      [...habits].forEach(h => removeHabit(h.id));
    }
  };

  const clearCompletions = () => {
    if (window.confirm('Clear all completion data? This cannot be undone.')) {
      localStorage.removeItem('ht_completions');
      window.location.reload();
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Settings</h1>
        <p className="text-sm text-slate-500">Manage your habits and data</p>
      </div>

      <div className="space-y-4">

        {/* Add Habit */}
        <div className="bg-[#13131D] border border-[#1E1E2E] rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-[#1E1E2E]">
            <h2 className="text-sm font-semibold text-white">Add New Habit</h2>
            <p className="text-xs text-slate-500 mt-0.5">Build your personal habit list</p>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex gap-3">
              {/* Emoji */}
              <div className="w-20">
                <label className="text-xs text-slate-500 mb-1 block">Emoji</label>
                <input
                  type="text"
                  value={icon}
                  onChange={e => setIcon(e.target.value)}
                  placeholder="💪"
                  maxLength={2}
                  className="w-full bg-[#0A0A0F] border border-[#2A2A3E] rounded-xl px-3 py-2.5 text-center text-xl focus:outline-none focus:border-indigo-500"
                />
              </div>
              {/* Name */}
              <div className="flex-1">
                <label className="text-xs text-slate-500 mb-1 block">Habit Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAdd()}
                  placeholder="e.g. Morning Workout"
                  className="w-full bg-[#0A0A0F] border border-[#2A2A3E] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Color picker */}
            <div>
              <label className="text-xs text-slate-500 mb-2 block">Color</label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className="w-7 h-7 rounded-lg transition-transform hover:scale-110 relative"
                    style={{ backgroundColor: c }}
                  >
                    {color === c && (
                      <Check size={12} className="absolute inset-0 m-auto text-white" strokeWidth={3} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview + Add button */}
            <div className="flex items-center gap-3">
              {name && icon && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm" style={{ background: color + '22' }}>
                  <span>{icon}</span>
                  <span style={{ color }}>{name}</span>
                </div>
              )}
              <button
                onClick={handleAdd}
                disabled={!name.trim() || !icon.trim()}
                className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: added ? '#34D399' : color, color: '#fff' }}
              >
                {added ? <><Check size={14} /> Added!</> : <><Plus size={14} /> Add Habit</>}
              </button>
            </div>
          </div>
        </div>

        {/* Habit List */}
        <div className="bg-[#13131D] border border-[#1E1E2E] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-[#1E1E2E]">
            <div>
              <h2 className="text-sm font-semibold text-white">Current Habits</h2>
              <p className="text-xs text-slate-500 mt-0.5">{habits.length} habits tracked</p>
            </div>
            {habits.length > 0 && (
              <button
                onClick={clearAllHabits}
                className="text-xs text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-all"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="divide-y divide-[#1E1E2E]">
            {habits.length === 0 && (
              <p className="text-xs text-slate-600 text-center py-6">No habits yet — add some above.</p>
            )}
            {habits.map(h => (
              <div key={h.id} className="flex items-center gap-3 px-5 py-3">
                <span className="text-lg">{h.icon}</span>
                <p className="text-sm text-slate-200 flex-1">{h.name}</p>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: h.color }} />
                <button
                  onClick={() => removeHabit(h.id)}
                  className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Data */}
        <div className="bg-[#13131D] border border-[#1E1E2E] rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white mb-3">Data Management</h2>
          <button
            onClick={clearCompletions}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-sm transition-all"
          >
            <RefreshCw size={14} /> Reset All Completion Data
          </button>
          <p className="text-xs text-slate-600 mt-2">Clears all checked habits. Your habit list stays.</p>
        </div>

        {/* About */}
        <div className="bg-[#13131D] border border-[#1E1E2E] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Info size={14} className="text-indigo-400" />
            <h2 className="text-sm font-semibold text-white">About HabitOS</h2>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            HabitOS is your personal habit tracker built to help you stay consistent, visualize progress, and build the life you want. Data is synced to the cloud via Firebase.
          </p>
        </div>

      </div>
    </div>
  );
}
