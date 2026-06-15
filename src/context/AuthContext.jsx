import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

const AuthContext = createContext();

const GRANTED_KEY = 'habitos_access_granted';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (u) setIsDemo(false);
    });
    return unsubscribe;
  }, []);

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
  const enterDemoMode = () => setIsDemo(true);
  const exitDemoMode = () => setIsDemo(false);

  return (
    <AuthContext.Provider value={{
      user, loading, isDemo,
      signInWithGoogle, logout,
      verifyCode, hasAccess,
      enterDemoMode, exitDemoMode,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
