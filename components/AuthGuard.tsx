"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken, secondsUntilExpiry, fetchMe } from "@/lib/auth";
import { useAuth } from "@/lib/auth-context";
// Refresh proactively when <5 min (300s) remain on the access token
const REFRESH_THRESHOLD_SEC = 300;
// How often to check (every 2 minutes)
const CHECK_INTERVAL_MS = 2 * 60 * 1000;

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const auth = useAuth();
  const [ready, setReady] = useState(false);
  const activityRef = useRef(false);

  const logout = useCallback(() => {
    auth.logout().then(() => router.replace("/login"));
  }, [auth, router]);

  const tryRefresh = useCallback(async () => {
    const token = await auth.refresh();
    if (!token) {
      logout();
      return null;
    }
    // Hydrate user info if not already set
    if (!auth.user) {
      const user = await fetchMe(token);
      if (user) auth.login(token, user);  // update user in context without re-refreshing
    }
    return token;
  }, [auth, logout]);

  // On mount: validate session
  useEffect(() => {
    const access = getAccessToken();

    if (access && secondsUntilExpiry(access) > 30) {
      // Token is fresh — ensure user info is loaded
      if (!auth.user) {
        fetchMe(access).then((user) => {
          if (user) auth.login(access, user);
        });
      }
      setReady(true);
      return;
    }

    // No valid token in memory — try silent refresh via cookie
    tryRefresh().then((token) => {
      if (token) setReady(true);
      // logout already called inside tryRefresh on failure
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Periodic check: refresh proactively if user has been active
  useEffect(() => {
    const interval = setInterval(async () => {
      const token = getAccessToken();
      if (!token) {
        logout();
        return;
      }

      const secs = secondsUntilExpiry(token);

      if (secs <= 0) {
        await tryRefresh();
        return;
      }

      if (secs < REFRESH_THRESHOLD_SEC && activityRef.current) {
        activityRef.current = false;
        const newToken = await auth.refresh();
        if (!newToken) logout();
      }
    }, CHECK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [auth, logout, tryRefresh]);

  // Track user activity
  useEffect(() => {
    const markActive = () => { activityRef.current = true; };
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, markActive, { passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, markActive));
  }, []);

  if (!ready) return null;

  return <>{children}</>;
}

