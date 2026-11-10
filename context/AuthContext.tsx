import { createContext, useCallback, useContext, useEffect, useState, type PropsWithChildren } from 'react';

import { logIn, logOut, signUp as signUpRequest } from '../lib/auth';
import { clearSessionToken, getSessionToken, saveSessionToken } from '../lib/session';

type AuthContextValue = {
  token: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  handleUnauthorized: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      try {
        const savedToken = await getSessionToken();
        if (mounted) {
          setToken(savedToken);
        }
      } catch {
        if (mounted) {
          setToken(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void restoreSession();
    return () => {
      mounted = false;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const session = await logIn(email, password);
    await saveSessionToken(session.token);
    setToken(session.token);
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const session = await signUpRequest(email, password);
    await saveSessionToken(session.token);
    setToken(session.token);
  }, []);

  const signOut = useCallback(async () => {
    const sessionToken = token;
    setToken(null);

    try {
      await clearSessionToken();
    } catch {
      // The in-memory session is still cleared when storage is unavailable.
    }

    if (sessionToken) {
      try {
        await logOut(sessionToken);
      } catch {
        // Signing out locally does not depend on the server being reachable.
      }
    }
  }, [token]);

  const handleUnauthorized = useCallback(() => {
    setToken(null);
    void clearSessionToken().catch(() => undefined);
  }, []);

  return (
    <AuthContext.Provider value={{ token, loading, signIn, signUp, signOut, handleUnauthorized }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
