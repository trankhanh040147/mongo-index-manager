export const ACCESS_TTL_MS = 10 * 60 * 1000;
export const REFRESH_TTL_MS = 24 * 60 * 60 * 1000;

export const nowMs = () => Date.now();

export const toNumberOrNull = (v) => {
  const n = typeof v === "string" ? Number(v) : v;
  return Number.isFinite(n) ? n : null;
};

export const computeExpiry = (ttlMs, baseMs = nowMs()) => baseMs + ttlMs;

export const isExpired = (expiresAtMs, skewMs = 0) => {
  const t = toNumberOrNull(expiresAtMs);
  if (t === null) return false;
  return nowMs() + skewMs >= t;
};

export const isRefreshUsable = (tokens) => {
  if (!tokens?.refresh_token) return false;
  return !isExpired(tokens.refresh_expires_at, 0);
};

