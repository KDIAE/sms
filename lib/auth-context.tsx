"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import {
  setAccessToken,
  getAccessToken,
  secondsUntilExpiry,
  clearSession,
  silentRefresh,
  fetchMe,
  serverLogout,
  AuthUser,
} from "./auth";

interface AuthContextValue {
  /** Whether initial session restoration has completed. */
  initialized: boolean;
  /** Current access token (in memory). null when logged out. */
  accessToken: string | null;
  /** Non-sensitive user info for UI rendering. Never trust for auth decisions. */
  user: AuthUser | null;
  /** Store token + user after a successful login response. */
  login: (token: string, user: AuthUser) => void;
  /** Restore auth session at app startup using refresh cookie + /auth/me. */
  restoreSession: () => Promise<boolean>;
  /** Perform a silent token refresh using the HttpOnly cookie. */
  refresh: () => Promise<string | null>;
  /** Clear memory state and tell the backend to clear the cookie. */
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [initialized, setInitialized] = useState(false);
  const [accessToken, setTokenState] = useState<string | null>(getAccessToken);
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = useCallback((token: string, newUser: AuthUser) => {
    setAccessToken(token);
    setTokenState(token);
    setUser(newUser);
    setInitialized(true);
  }, []);

  const restoreSession = useCallback(async (): Promise<boolean> => {
    let token = getAccessToken();

    if (!token || secondsUntilExpiry(token) <= 30) {
      token = await silentRefresh();
    }

    if (!token) {
      clearSession();
      setTokenState(null);
      setUser(null);
      return false;
    }

    const me = await fetchMe(token);
    if (!me) {
      clearSession();
      setTokenState(null);
      setUser(null);
      return false;
    }

    setAccessToken(token);
    setTokenState(token);
    setUser(me);
    return true;
  }, []);

  const refresh = useCallback(async () => {
    const token = await silentRefresh();
    if (!token) setUser(null);
    setTokenState(token);
    return token;
  }, []);

  const logout = useCallback(async () => {
    await serverLogout();
    clearSession();
    setTokenState(null);
    setUser(null);
  }, []);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      await restoreSession();
      if (mounted) setInitialized(true);
    };

    init();

    return () => {
      mounted = false;
    };
  }, [restoreSession]);

  return (
    <AuthContext.Provider
      value={{
        initialized,
        accessToken,
        user,
        login,
        restoreSession,
        refresh,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
