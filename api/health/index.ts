import { VercelResponse, VercelRequest } from '@vercel/node';
import { db } from '../_utils/../_utils/db.js';
import { validateEnvironment } from '../_utils/../_utils/envValidator.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const method = req.method;

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
  }

  // 1. Validate environment
  try {
    validateEnvironment();
  } catch (_envError: any) {
    return res.status(500).json({
      status: 'unhealthy',
      checks: {
        environment: 'failed',
      },
    });
  }

  // 2. Perform DB Readiness check
  let dbStatus = 'healthy';
  try {
    // Perform simple raw query to test database connection responsiveness
    await db.$executeRawUnsafe('SELECT 1;');
  } catch (_dbError) {
    dbStatus = 'unhealthy';
  }

  const memory = process.memoryUsage();

  const healthPayload = {
    status: dbStatus === 'healthy' ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    checks: {
      database: dbStatus,
      environment: 'healthy',
    },
    system: {
      memoryUsedMb: Math.round(memory.heapUsed / 1024 / 1024),
      nodeVersion: process.version,
    },
  };

  const httpStatus = healthPayload.status === 'healthy' ? 200 : 503;
  return res.status(httpStatus).json(healthPayload);
}
