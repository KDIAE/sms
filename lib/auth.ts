const API_URL = process.env.NEXT_PUBLIC_API_URL!;

// ── In-memory token storage ────────────────────────────────────────────────
// The access token lives only in memory (never localStorage / sessionStorage).
// The refresh token lives in an HttpOnly cookie set by the backend.

let _accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  _accessToken = token;
}

export function getAccessToken(): string | null {
  return _accessToken;
}

/** Clears the in-memory access token. Call this on logout. */
export function clearSession(): void {
  _accessToken = null;
}

// ── JWT helpers ─────────────────────────────────────────────────────────────

/** Decode JWT payload without verifying (client-side only for expiry checks). */
function decodePayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

/** Returns seconds until token expires. Negative = already expired. */
export function secondsUntilExpiry(token: string): number {
  const payload = decodePayload(token);
  if (!payload || typeof payload.exp !== "number") return -1;
  return payload.exp - Math.floor(Date.now() / 1000);
}

/** Returns true if the in-memory access token is valid and not about to expire (>30s left). */
export function isAccessTokenFresh(): boolean {
  const token = _accessToken;
  if (!token) return false;
  return secondsUntilExpiry(token) > 30;
}

// ── Refresh ──────────────────────────────────────────────────────────────────

/**
 * Attempt a silent refresh using the HttpOnly cookie (sent automatically by the browser).
 * Stores the new access token in memory and returns it, or null on failure.
 */
export async function silentRefresh(): Promise<string | null> {
  try {
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",   // sends the HttpOnly sms_refresh_token cookie
    });
    if (!res.ok) return null;
    const data = await res.json();
    setAccessToken(data.access_token);
    return data.access_token as string;
  } catch {
    return null;
  }
}

/**
 * Returns a valid access token, refreshing silently if needed.
 * Returns null if the session is fully expired.
 */
export async function getValidToken(): Promise<string | null> {
  if (isAccessTokenFresh()) return _accessToken;
  return silentRefresh();
}

// ── Logout ───────────────────────────────────────────────────────────────────

/** Calls the backend logout endpoint to clear the HttpOnly cookie. */
export async function serverLogout(): Promise<void> {
  try {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch {
    // best-effort
  }
}

// ── Fetch user from /me ───────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export async function fetchMe(token: string): Promise<AuthUser | null> {
  try {
    const res = await fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return (await res.json()) as AuthUser;
  } catch {
    return null;
  }
}
