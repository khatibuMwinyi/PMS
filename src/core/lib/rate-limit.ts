type RateLimitStore = Map<string, { count: number; resetTime: number }>;

const store: RateLimitStore = new Map();

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 10;

export function rateLimit(key: string): { success: boolean; remaining: number } {
  const now = Date.now();
  const record = store.get(key);

  if (!record || now > record.resetTime) {
    store.set(key, { count: 1, resetTime: now + WINDOW_MS });
    return { success: true, remaining: MAX_REQUESTS - 1 };
  }

  if (record.count >= MAX_REQUESTS) {
    return { success: false, remaining: 0 };
  }

  record.count++;
  return { success: true, remaining: MAX_REQUESTS - record.count };
}

setInterval(() => {
  const now = Date.now();
  for (const [key, record] of store) {
    if (now > record.resetTime) store.delete(key);
  }
}, 60 * 1000);