import { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken } from './auth.js';
import { verifyActiveSubscription } from '../services/subscriptionService.js';

export async function requireActiveSubscription(req: VercelRequest, res: VercelResponse): Promise<boolean> {
  const user = verifyToken(req);
  if (!user) {
    res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' });
    return false;
  }

  // Admins bypass subscription requirements
  if (user.role === 'ADMIN') {
    return true;
  }

  const hasActive = await verifyActiveSubscription(user.id);
  if (!hasActive) {
    res.status(403).json({
      success: false,
      message: 'Forbidden: Active subscription required to access this premium feature.',
    });
    return false;
  }

  return true;
}
