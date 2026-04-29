const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export function getAccessToken(): string | null {
  return localStorage.getItem("sms_token");
}

export function getRefreshToken(): string | null {
  return localStorage.getItem("sms_refresh_token");
}

export function clearSession() {
  localStorage.removeItem("sms_token");
  localStorage.removeItem("sms_refresh_token");
  localStorage.removeItem("sms_user");
}

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

/** Returns true if the access token is valid and not about to expire (>30s left). */
export function isAccessTokenFresh(): boolean {
  const token = getAccessToken();
  if (!token) return false;
  return secondsUntilExpiry(token) > 30;
}

/** Attempt a silent refresh. Returns the new access token or null on failure. */
export async function silentRefresh(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  // Don't bother if refresh token itself is expired
  if (secondsUntilExpiry(refreshToken) <= 0) return null;

  try {
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    localStorage.setItem("sms_token", data.access_token);
    return data.access_token;
  } catch {
    return null;
  }
}

/**
 * Returns a valid access token, refreshing silently if needed.
 * Returns null if the session is fully expired.
 */
export async function getValidToken(): Promise<string | null> {
  if (isAccessTokenFresh()) return getAccessToken();
  return silentRefresh();
}
