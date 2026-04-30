"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import {
  setAccessToken,
  getAccessToken,
  clearSession,
  silentRefresh,
  serverLogout,
  AuthUser,
} from "./auth";

interface AuthContextValue {
  /** Current access token (in memory). null when logged out. */
  accessToken: string | null;
  /** Non-sensitive user info for UI rendering. Never trust for auth decisions. */
  user: AuthUser | null;
  /** Store token + user after a successful login response. */
  login: (token: string, user: AuthUser) => void;
  /** Perform a silent token refresh using the HttpOnly cookie. */
  refresh: () => Promise<string | null>;
  /** Clear memory state and tell the backend to clear the cookie. */
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setTokenState] = useState<string | null>(getAccessToken);
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = useCallback((token: string, newUser: AuthUser) => {
    setAccessToken(token);
    setTokenState(token);
    setUser(newUser);
  }, []);

  const refresh = useCallback(async () => {
    const token = await silentRefresh();
    setTokenState(token);
    return token;
  }, []);

  const logout = useCallback(async () => {
    await serverLogout();
    clearSession();
    setTokenState(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ accessToken, user, login, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
