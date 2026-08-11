import { db } from './db.js';

/**
 * DB-Backed Rate Limiting for serverless environments.
 * Returns true if request is allowed, false if limit is exceeded.
 */
export async function checkRateLimit(
  ipAddress: string,
  limit: number = 30,
  windowMs: number = 60000
): Promise<boolean> {
  const cutoff = new Date(Date.now() - windowMs);
  
  try {
    const requestCount = await db.globalActivity.count({
      where: {
        description: { contains: `IP: ${ipAddress}` },
        createdAt: { gte: cutoff },
      },
    });

    return requestCount < limit;
  } catch {
    // If DB check fails, fail-safe to let request proceed
    return true;
  }
}
