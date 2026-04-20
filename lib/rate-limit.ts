interface RateLimitEntry {
  timestamp: number;
}

interface RateLimitResult {
  allowed: boolean;
  retryAfter?: number;
}

const WINDOW_MS = 60_000; // 1 minute
const store = new Map<string, RateLimitEntry>();

export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const entry = store.get(ip);

  if (entry && now - entry.timestamp < WINDOW_MS) {
    const retryAfter = Math.ceil((WINDOW_MS - (now - entry.timestamp)) / 1000);
    return { allowed: false, retryAfter };
  }

  store.set(ip, { timestamp: now });

  // Cleanup old entries every 100 checks
  if (store.size > 1000) {
    for (const [key, val] of store) {
      if (now - val.timestamp > WINDOW_MS) {
        store.delete(key);
      }
    }
  }

  return { allowed: true };
}

export function _resetForTest(): void {
  store.clear();
}
