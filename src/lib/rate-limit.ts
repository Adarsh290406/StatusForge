type RateLimitRecord = {
  count: number;
  resetAt: number;
};

const limitMap = new Map<string, RateLimitRecord>();

export function checkRateLimit(email: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const limit = 5;
  const windowMs = 15 * 60 * 1000;

  const record = limitMap.get(email);

  if (!record) {
    limitMap.set(email, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (now > record.resetAt) {
    limitMap.set(email, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  record.count += 1;
  limitMap.set(email, record);

  return { allowed: true, remaining: limit - record.count };
}
