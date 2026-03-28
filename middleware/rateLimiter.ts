// Simple in-memory sliding-window rate limiter (single-instance MVP)
// Replace with Redis-backed implementation for multi-instance deployments

interface Window {
  count: number;
  resetAt: number;
}

const minuteWindows = new Map<string, Window>();
const hourWindows = new Map<string, Window>();

const LIMIT_PER_MINUTE = parseInt(process.env.RATE_LIMIT_PER_MINUTE ?? "10", 10);
const LIMIT_PER_HOUR = parseInt(process.env.RATE_LIMIT_PER_HOUR ?? "60", 10);

function check(map: Map<string, Window>, key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const existing = map.get(key);

  if (!existing || now >= existing.resetAt) {
    map.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (existing.count >= limit) return false;

  existing.count++;
  return true;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfter?: number; // seconds
  remaining: number;
  reset: number; // Unix timestamp
}

export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const minuteKey = `minute:${ip}`;
  const hourKey = `hour:${ip}`;

  const minuteWindow = minuteWindows.get(minuteKey);
  const hourWindow = hourWindows.get(hourKey);

  const minuteReset = minuteWindow?.resetAt ?? now + 60_000;
  const minuteRemaining = minuteWindow
    ? Math.max(0, LIMIT_PER_MINUTE - minuteWindow.count)
    : LIMIT_PER_MINUTE;

  const minuteAllowed = check(minuteWindows, minuteKey, LIMIT_PER_MINUTE, 60_000);
  const hourAllowed = minuteAllowed && check(hourWindows, hourKey, LIMIT_PER_HOUR, 3_600_000);

  if (!minuteAllowed || !hourAllowed) {
    const retryAfter = Math.ceil((minuteReset - now) / 1000);
    return {
      allowed: false,
      retryAfter,
      remaining: 0,
      reset: Math.floor(minuteReset / 1000),
    };
  }

  return {
    allowed: true,
    remaining: minuteRemaining - 1,
    reset: Math.floor(minuteReset / 1000),
  };
}
