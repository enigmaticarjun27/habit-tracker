import { useAuth } from '../context/AuthContext';
import { Eye, LogIn } from 'lucide-react';

export default function DemoBanner() {
  const { exitDemoMode } = useAuth();

  return (
    <div className="w-full bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between shrink-0 z-30">
      <div className="flex items-center gap-2 text-amber-400 text-xs">
        <Eye size={13} />
        <span>Demo Mode — data is not saved. Explore freely!</span>
      </div>
      <button
        onClick={exitDemoMode}
        className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-white bg-amber-500/20 hover:bg-amber-500/40 px-3 py-1.5 rounded-lg transition-all"
      >
        <LogIn size={12} />
        Sign in with code →
      </button>
    </div>
  );
}
