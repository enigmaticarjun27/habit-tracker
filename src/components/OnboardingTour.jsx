import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ChevronRight, ChevronLeft, X, LayoutDashboard, CheckSquare, BarChart2, Target, Flame } from 'lucide-react';

const STEPS = [
  {
    emoji: '👋',
    title: 'Welcome to HabitOS!',
    description: 'Your personal habit tracker designed to help you build consistency, visualize progress, and become the best version of yourself.',
    note: null,
    page: null,
    color: '#818CF8',
  },
  {
    emoji: '📊',
    title: 'Sample Data Loaded',
    description: "We've pre-loaded last month's sample data so you can immediately see how the app looks after a full month of tracking.",
    note: '💡 This is just for exploration. Your real journey starts from today!',
    page: null,
    color: '#34D399',
  },
  {
    emoji: '🏠',
    title: 'Dashboard',
    description: "Your command center. See today's habits, your best streak, monthly trend chart, and a week-at-a-glance view — all in one place.",
    note: '👈 Click Dashboard in the sidebar to explore it.',
    page: { icon: LayoutDashboard, label: 'Dashboard' },
    color: '#60A5FA',
  },
  {
    emoji: '✅',
    title: 'Habit Tracker',
    description: 'A full calendar grid where you check off each habit every day. Weeks are color-coded — blue, pink, teal, yellow — just like a real habit journal.',
    note: '💡 Click any cell to mark a habit as done. Your data saves instantly.',
    page: { icon: CheckSquare, label: 'Habit Tracker' },
    color: '#F472B6',
  },
  {
    emoji: '📈',
    title: 'Analytics',
    description: 'Deep dive into your performance. Monthly area chart, weekly donut rings showing completion %, and per-habit stats with streaks.',
    note: '💡 Navigate to previous months to review your history.',
    page: { icon: BarChart2, label: 'Analytics' },
    color: '#A78BFA',
  },
  {
    emoji: '🎯',
    title: 'Goals',
    description: 'Set bigger ambitions beyond daily habits — like reading 12 books, running a 5K, or saving ₹50,000. Track them with beautiful progress rings.',
    note: '💡 Click any goal card to update your progress.',
    page: { icon: Target, label: 'Goals' },
    color: '#FBBF24',
  },
  {
    emoji: '🔥',
    title: 'Streaks',
    description: 'See your current and longest streak for every habit. A 30-day heatmap shows your consistency — the darker the tile, the better the day.',
    note: '💡 Streaks reset if you miss a day — so stay consistent!',
    page: { icon: Flame, label: 'Streaks' },
    color: '#FB923C',
  },
  {
    emoji: '🔄',
    title: 'Syncs Everywhere',
    description: 'Your data is saved to the cloud in real time. Open HabitOS on your phone, laptop, or any device — everything stays perfectly in sync.',
    note: '💡 Bookmark the link on your phone for quick access.',
    page: null,
    color: '#38BDF8',
  },
  {
    emoji: '🚀',
    title: "You're All Set!",
    description: "Start by checking off today's habits. The more consistent you are, the more impressive your stats become. Small steps every day — that's the secret.",
    note: null,
    page: null,
    color: '#34D399',
    cta: true,
  },
];

export default function OnboardingTour({ onComplete }) {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (!user) return;
    const key = `habitos_tour_${user.uid}`;
    if (!localStorage.getItem(key)) {
      setTimeout(() => setVisible(true), 800);
    }
  }, [user]);

  const markDone = () => {
    localStorage.setItem(`habitos_tour_${user.uid}`, 'done');
    setVisible(false);
    onComplete?.();
  };

  const goTo = (next) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setStep(next);
      setAnimating(false);
    }, 200);
  };

  if (!visible) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const isFirst = step === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Blurred backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={markDone}
      />

      {/* Card */}
      <div
        className={`relative w-full max-w-md bg-[#13131D] border border-[#2A2A3E] rounded-3xl shadow-2xl overflow-hidden transition-all duration-200 ${animating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
      >
        {/* Top color bar */}
        <div className="h-1 w-full" style={{ backgroundColor: current.color }} />

        {/* Close button */}
        <button
          onClick={markDone}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors p-1"
        >
          <X size={16} />
        </button>

        <div className="p-8">
          {/* Emoji */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-5 mx-auto"
            style={{ backgroundColor: current.color + '22' }}
          >
            {current.emoji}
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-white text-center mb-3">
            {current.title}
          </h2>

          {/* Description */}
          <p className="text-slate-400 text-sm text-center leading-relaxed mb-4">
            {current.description}
          </p>

          {/* Page highlight */}
          {current.page && (
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-xl mb-4 border"
              style={{ backgroundColor: current.color + '11', borderColor: current.color + '33' }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: current.color + '22' }}>
                <current.page.icon size={16} style={{ color: current.color }} />
              </div>
              <div>
                <p className="text-xs font-semibold" style={{ color: current.color }}>Go explore →</p>
                <p className="text-xs text-slate-400">Click <span className="font-semibold text-slate-300">"{current.page.label}"</span> in the sidebar</p>
              </div>
            </div>
          )}

          {/* Note */}
          {current.note && (
            <div className="bg-white/5 rounded-xl px-4 py-2.5 mb-4">
              <p className="text-xs text-slate-400 text-center">{current.note}</p>
            </div>
          )}

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1.5 mb-6">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="rounded-full transition-all"
                style={{
                  width: i === step ? 20 : 6,
                  height: 6,
                  backgroundColor: i === step ? current.color : '#2A2A3E',
                }}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            {!isFirst && (
              <button
                onClick={() => goTo(step - 1)}
                className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-[#2A2A3E] text-slate-400 hover:text-white hover:border-slate-600 text-sm transition-all"
              >
                <ChevronLeft size={14} /> Back
              </button>
            )}

            {isLast ? (
              <button
                onClick={markDone}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                style={{ backgroundColor: current.color }}
              >
                Start Tracking! 🚀
              </button>
            ) : (
              <button
                onClick={() => goTo(step + 1)}
                className="flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ backgroundColor: current.color }}
              >
                {step === 0 ? "Let's go!" : 'Next'} <ChevronRight size={14} />
              </button>
            )}
          </div>

          {/* Skip */}
          {!isLast && (
            <button
              onClick={markDone}
              className="w-full text-xs text-slate-600 hover:text-slate-400 mt-3 transition-colors"
            >
              Skip tour
            </button>
          )}
        </div>

        {/* Step counter */}
        <div className="absolute top-4 left-4 text-xs text-slate-600">
          {step + 1} / {STEPS.length}
        </div>
      </div>
    </div>
  );
}
