"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  getAccessToken,
  getRefreshToken,
  secondsUntilExpiry,
  silentRefresh,
  clearSession,
} from "@/lib/auth";

// Refresh proactively when <5 min (300s) remain on the access token
const REFRESH_THRESHOLD_SEC = 300;
// How often to check (every 2 minutes)
const CHECK_INTERVAL_MS = 2 * 60 * 1000;

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const activityRef = useRef(false);

  const logout = useCallback(() => {
    clearSession();
    router.replace("/login");
  }, [router]);

  const tryRefresh = useCallback(async () => {
    const token = await silentRefresh();
    if (!token) {
      logout();
    }
  }, [logout]);

  // On mount: validate session
  useEffect(() => {
    const access = getAccessToken();
    const refresh = getRefreshToken();

    if (!access && !refresh) {
      router.replace("/login");
      return;
    }

    if (access && secondsUntilExpiry(access) > 30) {
      setReady(true);
      return;
    }

    // Access token missing or expired — try refresh
    if (refresh && secondsUntilExpiry(refresh) > 0) {
      silentRefresh().then((newToken) => {
        if (newToken) {
          setReady(true);
        } else {
          router.replace("/login");
        }
      });
    } else {
      router.replace("/login");
    }
  }, [router]);

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
        // Expired — try refresh regardless
        await tryRefresh();
        return;
      }

      if (secs < REFRESH_THRESHOLD_SEC && activityRef.current) {
        // Near expiry and user was active — silent refresh
        activityRef.current = false;
        const newToken = await silentRefresh();
        if (!newToken) logout();
      }
    }, CHECK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [logout, tryRefresh]);

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
