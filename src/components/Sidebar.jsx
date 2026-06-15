import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, BarChart2, Target, Flame, Settings, Brain, X, Menu, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tracker', icon: CheckSquare, label: 'Habit Tracker' },
  { to: '/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/goals', icon: Target, label: 'Goals' },
  { to: '/streaks', icon: Flame, label: 'Streaks' },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  const initials = user?.displayName
    ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const nav = (
    <nav className="flex flex-col gap-1 flex-1">
      {NAV.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              isActive
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`
          }
        >
          <Icon size={18} />
          {label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <>
      <button
        className="fixed top-4 left-4 z-50 lg:hidden bg-[#13131D] border border-[#1E1E2E] rounded-lg p-2 text-slate-400"
        onClick={() => setOpen(o => !o)}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setOpen(false)} />
      )}

      <aside className={`
        fixed lg:static top-0 left-0 h-full lg:h-screen z-40
        w-60 bg-[#13131D] border-r border-[#1E1E2E]
        flex flex-col py-6 px-3 shrink-0
        transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center gap-3 px-3 mb-8">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Brain size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">HabitOS</p>
            <p className="text-xs text-slate-500">Track. Grow. Repeat.</p>
          </div>
        </div>

        {nav}

        <div className="mt-auto pt-4 border-t border-[#1E1E2E] space-y-1">
          <NavLink
            to="/settings"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`
            }
          >
            <Settings size={18} />
            Settings
          </NavLink>

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={18} />
            Sign Out
          </button>

          <div className="flex items-center gap-3 px-4 py-3">
            {user?.photoURL ? (
              <img src={user.photoURL} className="w-8 h-8 rounded-full" alt="avatar" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-200 truncate">{user?.displayName || 'User'}</p>
              <p className="text-xs text-slate-500">Stay consistent!</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
