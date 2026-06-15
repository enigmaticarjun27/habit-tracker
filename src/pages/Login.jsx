import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Brain, CheckCircle2, BarChart2, RefreshCw, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function Login() {
  const { signInWithGoogle, verifyCode, hasAccess, enterDemoMode } = useAuth();
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [code, setCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [error, setError] = useState('');
  const [granted, setGranted] = useState(hasAccess);

  const handleVerify = () => {
    if (verifyCode(code)) {
      setGranted(true);
      setError('');
      setCode('');
    } else {
      setError('Incorrect code. Ask the creator for access.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-4">
            <Brain size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">HabitOS</h1>
          <p className="text-slate-400 mt-2">Turn your life into a game.</p>
        </div>

        {/* Features */}
        <div className="bg-[#13131D] border border-[#1E1E2E] rounded-2xl p-5 mb-4">
          <div className="space-y-3">
            {[
              { icon: CheckCircle2, color: '#34D399', text: 'Track daily habits with a beautiful grid' },
              { icon: BarChart2, color: '#818CF8', text: 'Visualize progress with charts & analytics' },
              { icon: RefreshCw, color: '#FBBF24', text: 'Syncs across all your devices automatically' },
            ].map(({ icon: Icon, color, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: color + '22' }}>
                  <Icon size={16} style={{ color }} />
                </div>
                <p className="text-sm text-slate-300">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Demo button */}
        <button
          onClick={enterDemoMode}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-[#2A2A3E] text-slate-300 hover:text-white hover:border-slate-500 hover:bg-white/5 transition-all text-sm font-medium mb-3"
        >
          <Eye size={16} />
          Browse Demo — no account needed
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 h-px bg-[#1E1E2E]" />
          <span className="text-xs text-slate-600">or sign in with your account</span>
          <div className="flex-1 h-px bg-[#1E1E2E]" />
        </div>

        {/* Google sign-in (shown if already granted) */}
        {granted ? (
          <div>
            <div className="flex items-center gap-2 text-xs text-emerald-400 mb-3 justify-center">
              <CheckCircle2 size={13} />
              Access granted — sign in with Google below
            </div>
            <button
              onClick={signInWithGoogle}
              className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-semibold py-3.5 px-6 rounded-xl hover:bg-gray-100 active:scale-95 transition-all shadow-lg"
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
              </svg>
              Continue with Google
            </button>
          </div>
        ) : (
          /* Passcode gate */
          <div className="bg-[#13131D] border border-[#1E1E2E] rounded-2xl p-5">
            {!showCodeInput ? (
              <button
                onClick={() => setShowCodeInput(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white transition-colors"
              >
                <Lock size={14} />
                Have an access code?
                <ArrowRight size={14} />
              </button>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Lock size={14} className="text-indigo-400" />
                  <span className="text-sm font-medium text-slate-300">Enter access code</span>
                </div>
                <div className="flex gap-2 mb-2">
                  <div className="relative flex-1">
                    <input
                      type={showCode ? 'text' : 'password'}
                      value={code}
                      onChange={e => { setCode(e.target.value); setError(''); }}
                      onKeyDown={e => e.key === 'Enter' && handleVerify()}
                      placeholder="Access code"
                      className="w-full bg-[#0A0A0F] border border-[#2A2A3E] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 pr-10"
                      autoFocus
                    />
                    <button
                      onClick={() => setShowCode(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showCode ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  <button
                    onClick={handleVerify}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors"
                  >
                    Verify
                  </button>
                </div>
                {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
                <p className="text-xs text-slate-600 mt-2">
                  No code? Ask the creator for access.
                </p>
              </div>
            )}
          </div>
        )}

        <p className="text-xs text-slate-600 mt-4 text-center">
          Accounts are private — your data is only visible to you.
        </p>
      </div>
    </div>
  );
}
