import { useHabits } from '../context/HabitContext';
import { Trash2, RefreshCw, Info } from 'lucide-react';

export default function Settings() {
  const { habits, removeHabit } = useHabits();

  const clearAll = () => {
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
        {/* Habit List */}
        <div className="bg-[#13131D] border border-[#1E1E2E] rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-[#1E1E2E]">
            <h2 className="text-sm font-semibold text-white">Manage Habits</h2>
            <p className="text-xs text-slate-500 mt-0.5">Remove habits you no longer track</p>
          </div>
          <div className="divide-y divide-[#1E1E2E]">
            {habits.map(h => (
              <div key={h.id} className="flex items-center gap-3 px-5 py-3">
                <span className="text-lg">{h.icon}</span>
                <div className="flex-1">
                  <p className="text-sm text-slate-200">{h.name}</p>
                </div>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: h.color }} />
                <button
                  onClick={() => removeHabit(h.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
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
            onClick={clearAll}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-sm transition-all"
          >
            <RefreshCw size={14} /> Reset All Completion Data
          </button>
          <p className="text-xs text-slate-600 mt-2">This will clear all checked habits. Your habit list will remain.</p>
        </div>

        {/* About */}
        <div className="bg-[#13131D] border border-[#1E1E2E] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Info size={14} className="text-indigo-400" />
            <h2 className="text-sm font-semibold text-white">About HabitOS</h2>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            HabitOS is your personal habit tracker built to help you stay consistent, visualize progress, and build the life you want. All data is stored locally in your browser.
          </p>
        </div>
      </div>
    </div>
  );
}
