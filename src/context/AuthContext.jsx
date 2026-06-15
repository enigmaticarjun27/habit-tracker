import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

const AuthContext = createContext();

const GRANTED_KEY = 'habitos_access_granted';
const DEMO_EXPIRES_KEY = 'habitos_demo_expires';
const DEMO_DURATION_MS = 60 * 60 * 1000; // 60 minutes

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [demoExpiresAt, setDemoExpiresAt] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (u) exitDemoMode();
    });
    return unsubscribe;
  }, []);

  // Auto-expire demo after 60 minutes
  useEffect(() => {
    if (!isDemo || !demoExpiresAt) return;

    const tick = () => {
      if (Date.now() >= demoExpiresAt) {
        exitDemoMode();
      }
    };

    timerRef.current = setInterval(tick, 30_000); // check every 30s
    return () => clearInterval(timerRef.current);
  }, [isDemo, demoExpiresAt]);

  const verifyCode = (code) => {
    const expected = import.meta.env.VITE_ACCESS_CODE || 'habitos2026';
    if (code.trim() === expected) {
      localStorage.setItem(GRANTED_KEY, '1');
      return true;
    }
    return false;
  };

  const hasAccess = () => !!localStorage.getItem(GRANTED_KEY);

  const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
  const logout = () => signOut(auth);

  const enterDemoMode = () => {
    const expires = Date.now() + DEMO_DURATION_MS;
    sessionStorage.setItem(DEMO_EXPIRES_KEY, expires);
    setDemoExpiresAt(expires);
    setIsDemo(true);
  };

  const exitDemoMode = () => {
    clearInterval(timerRef.current);
    sessionStorage.removeItem(DEMO_EXPIRES_KEY);
    setDemoExpiresAt(null);
    setIsDemo(false);
  };

  // Remaining minutes for banner countdown
  const demoMinutesLeft = demoExpiresAt
    ? Math.max(0, Math.ceil((demoExpiresAt - Date.now()) / 60_000))
    : null;

  return (
    <AuthContext.Provider value={{
      user, loading, isDemo, demoMinutesLeft,
      signInWithGoogle, logout,
      verifyCode, hasAccess,
      enterDemoMode, exitDemoMode,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
