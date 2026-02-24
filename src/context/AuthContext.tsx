import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { DEV_MODE, MOCK_USER, clearDevDog } from '../constants/devMode';

interface MockUser {
  uid: string;
  email: string;
  displayName: string;
}

interface AuthContextValue {
  user: (User | MockUser) | null;
  loading: boolean;
  devLogin: () => void;
  devLogout: () => void;
  isDevMode: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<(User | MockUser) | null>(null);
  const [loading, setLoading] = useState(true);
  const [usingDevMode, setUsingDevMode] = useState(false);

  useEffect(() => {
    if (DEV_MODE) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const devLogin = useCallback(() => {
    setUser(MOCK_USER as MockUser);
    setUsingDevMode(true);
  }, []);

  const devLogout = useCallback(() => {
    setUser(null);
    setUsingDevMode(false);
    clearDevDog();
  }, []);

  const value = useMemo(
    () => ({ user, loading, devLogin, devLogout, isDevMode: usingDevMode || DEV_MODE }),
    [user, loading, devLogin, devLogout, usingDevMode]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
