import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { ChevronRight, ChevronLeft, X } from 'lucide-react';

// Convert hex color to rgba string
const rgba = (hex, alpha) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

const STEPS = [
  {
    emoji: '👋',
    title: 'Welcome to HabitOS!',
    description: 'Your personal habit tracker designed to help you build consistency, visualize progress, and become the best version of yourself. Let\'s take a quick tour!',
    target: null,
    placement: 'center',
    size: 'lg',
    color: '#818CF8',
    note: null,
  },
  {
    emoji: '📊',
    title: 'Sample Data Loaded',
    description: "We've pre-loaded last month's sample data so you can immediately see how every chart, graph and stat looks after a full month of tracking.",
    target: null,
    placement: 'top-center',
    size: 'md',
    color: '#34D399',
    note: '💡 This is just for exploration — your real journey starts from today!',
  },
  {
    emoji: '🏠',
    title: 'Dashboard',
    description: 'Your command center. See today\'s habits, best streak, monthly trend chart, weekly bar chart, and top streaks — all at a glance.',
    target: '[data-tour="nav-/"]',
    placement: 'right-of-target',
    size: 'sm',
    color: '#60A5FA',
    note: '👆 Click this to open the Dashboard anytime.',
  },
  {
    emoji: '✅',
    title: 'Habit Tracker',
    description: 'A full calendar grid where you check off habits daily. Color-coded by week — blue, pink, teal, yellow — just like a real habit journal. Click any cell to mark it done.',
    target: '[data-tour="nav-/tracker"]',
    placement: 'right-of-target',
    size: 'md',
    color: '#F472B6',
    note: '💡 Your data is saved to the cloud the moment you check a habit.',
  },
  {
    emoji: '📈',
    title: 'Analytics',
    description: 'Deep dive into your performance. Monthly area chart, 4 weekly donut rings showing completion %, habit distribution pie chart, and per-habit stats with current and longest streaks.',
    target: '[data-tour="nav-/analytics"]',
    placement: 'right-of-target',
    size: 'lg',
    color: '#A78BFA',
    note: '💡 Navigate to previous months using the arrows to review your history.',
  },
  {
    emoji: '🎯',
    title: 'Goals',
    description: 'Set bigger ambitions beyond daily habits — like reading 12 books, running a 5K, or saving ₹50,000. Each goal shows a beautiful progress ring.',
    target: '[data-tour="nav-/goals"]',
    placement: 'right-of-target',
    size: 'sm',
    color: '#FBBF24',
    note: '💡 Click the edit icon on any goal card to update your progress.',
  },
  {
    emoji: '🔥',
    title: 'Streaks',
    description: 'See your current and longest streak for every habit ranked on a leaderboard. A 30-day heatmap shows your consistency — the brighter the tile, the better the day.',
    target: '[data-tour="nav-/streaks"]',
    placement: 'right-of-target',
    size: 'md',
    color: '#FB923C',
    note: '⚠️ Streaks reset if you miss a day — stay consistent!',
  },
  {
    emoji: '🔄',
    title: 'Syncs Everywhere',
    description: 'Your data is saved to the cloud in real time. Open HabitOS on your phone, tablet, or any other device — everything stays perfectly in sync automatically.',
    target: '[data-tour="logout"]',
    placement: 'right-of-target',
    size: 'sm',
    color: '#38BDF8',
    note: '💡 Bookmark this link on your phone for quick daily access.',
  },
  {
    emoji: '🚀',
    title: "You're All Set!",
    description: 'Start by checking off today\'s habits in the Habit Tracker. The more consistent you are, the more impressive your stats become. Small steps every day — that\'s the real secret.',
    target: null,
    placement: 'center',
    size: 'lg',
    color: '#34D399',
    note: null,
    cta: true,
  },
];

// SVG overlay with a spotlight "hole" at the target rect
function SpotlightOverlay({ rect, color }) {
  const pad = 8;
  const rx = rect ? rect.left - pad : 0;
  const ry = rect ? rect.top - pad : 0;
  const rw = rect ? rect.width + pad * 2 : 0;
  const rh = rect ? rect.height + pad * 2 : 0;

  return (
    <svg
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 50 }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <mask id="ht-mask">
          <rect width="100%" height="100%" fill="white" />
          {rect && <rect x={rx} y={ry} width={rw} height={rh} rx="10" fill="black" />}
        </mask>
      </defs>
      {/* Main dark layer with hole */}
      <rect width="100%" height="100%" fill="rgba(0,0,0,0.82)" mask="url(#ht-mask)" />
      {/* Color tint layer */}
      <rect width="100%" height="100%" fill={rgba(color, 0.13)} mask="url(#ht-mask)" />
      {/* Glow ring around spotlight */}
      {rect && (
        <rect
          x={rx - 2} y={ry - 2}
          width={rw + 4} height={rh + 4}
          rx="12" fill="none"
          stroke={color} strokeWidth="2" opacity="0.8"
        />
      )}
    </svg>
  );
}

export default function OnboardingTour() {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [targetRect, setTargetRect] = useState(null);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const key = `habitos_tour_${user.uid}`;
    if (!localStorage.getItem(key)) {
      setTimeout(() => setVisible(true), 900);
    }
  }, [user]);

  const updateRect = useCallback((s) => {
    const t = STEPS[s].target;
    if (!t) { setTargetRect(null); return; }
    const el = document.querySelector(t);
    if (el) setTargetRect(el.getBoundingClientRect());
    else setTargetRect(null);
  }, []);

  useEffect(() => { if (visible) updateRect(step); }, [step, visible, updateRect]);

  // Re-measure on resize
  useEffect(() => {
    const handler = () => updateRect(step);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [step, updateRect]);

  const markDone = () => {
    localStorage.setItem(`habitos_tour_${user.uid}`, 'done');
    setVisible(false);
  };

  const goTo = (next) => {
    if (fading) return;
    setFading(true);
    setTimeout(() => { setStep(next); setFading(false); }, 180);
  };

  if (!visible) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const isFirst = step === 0;

  // Card width by size
  const widths = { sm: 280, md: 360, lg: 460 };
  const cardWidth = widths[current.size];

  // Card position
  const getCardStyle = () => {
    const margin = 18;
    switch (current.placement) {
      case 'center':
        return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
      case 'top-center':
        return { top: 72, left: '50%', transform: 'translateX(-50%)' };
      case 'bottom-right':
        return { bottom: 20, right: 20 };
      case 'right-of-target': {
        if (!targetRect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
        const cardTop = Math.max(16, Math.min(
          targetRect.top + targetRect.height / 2 - 120,
          window.innerHeight - 400
        ));
        return { top: cardTop, left: targetRect.right + margin };
      }
      default:
        return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }
  };

  const showArrow = current.placement === 'right-of-target' && targetRect;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 49, backdropFilter: 'blur(2px)' }}
        onClick={markDone}
      />

      {/* SVG spotlight overlay */}
      <SpotlightOverlay rect={targetRect} color={current.color} />

      {/* Tour card */}
      <div
        style={{
          position: 'fixed',
          zIndex: 55,
          width: cardWidth,
          maxWidth: 'calc(100vw - 32px)',
          transition: 'opacity 0.18s, transform 0.18s',
          opacity: fading ? 0 : 1,
          transform: fading ? 'scale(0.96)' : 'scale(1)',
          ...getCardStyle(),
        }}
      >
        {/* Arrow pointing left toward target */}
        {showArrow && (
          <div style={{
            position: 'absolute',
            left: -9,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 0,
            height: 0,
            borderTop: '9px solid transparent',
            borderBottom: '9px solid transparent',
            borderRight: `9px solid #1E1E2E`,
            zIndex: 1,
          }} />
        )}

        <div
          className="rounded-2xl overflow-hidden shadow-2xl"
          style={{ background: '#13131D', border: `1px solid #1E1E2E` }}
        >
          {/* Color accent bar */}
          <div style={{ height: 3, background: `linear-gradient(90deg, ${current.color}, ${rgba(current.color, 0.3)})` }} />

          {/* Close + counter */}
          <div className="flex items-center justify-between px-4 pt-3">
            <span className="text-xs text-slate-600">{step + 1} of {STEPS.length}</span>
            <button onClick={markDone} className="text-slate-600 hover:text-slate-300 transition-colors p-1">
              <X size={14} />
            </button>
          </div>

          <div className="px-5 pb-5 pt-2">
            {/* Emoji + title */}
            <div className="flex items-center gap-3 mb-3">
              <div
                className="text-2xl w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: rgba(current.color, 0.15) }}
              >
                {current.emoji}
              </div>
              <h2
                className="font-bold leading-tight"
                style={{
                  color: current.color,
                  fontSize: current.size === 'sm' ? 15 : current.size === 'md' ? 17 : 19,
                }}
              >
                {current.title}
              </h2>
            </div>

            {/* Description */}
            <p className="text-slate-400 leading-relaxed mb-3"
              style={{ fontSize: current.size === 'sm' ? 12 : 13 }}>
              {current.description}
            </p>

            {/* Note */}
            {current.note && (
              <div
                className="rounded-xl px-3 py-2 mb-3 text-xs"
                style={{ background: rgba(current.color, 0.08), color: rgba(current.color, 0.9) }}
              >
                {current.note}
              </div>
            )}

            {/* Progress dots */}
            <div className="flex items-center gap-1.5 mb-4">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  style={{
                    height: 5,
                    width: i === step ? 18 : 5,
                    borderRadius: 9999,
                    background: i === step ? current.color : '#2A2A3E',
                    transition: 'all 0.2s',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              {!isFirst && (
                <button
                  onClick={() => goTo(step - 1)}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl border border-[#2A2A3E] text-slate-400 hover:text-white hover:border-slate-500 transition-all text-xs"
                >
                  <ChevronLeft size={13} /> Back
                </button>
              )}
              {isLast ? (
                <button
                  onClick={markDone}
                  className="flex-1 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                  style={{ background: current.color }}
                >
                  Start Tracking! 🚀
                </button>
              ) : (
                <button
                  onClick={() => goTo(step + 1)}
                  className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{ background: current.color }}
                >
                  {step === 0 ? "Let's go!" : 'Next'} <ChevronRight size={13} />
                </button>
              )}
            </div>

            {!isLast && (
              <button
                onClick={markDone}
                className="w-full text-center text-xs text-slate-700 hover:text-slate-500 mt-2 transition-colors"
              >
                Skip tour
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
