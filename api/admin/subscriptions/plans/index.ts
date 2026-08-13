import { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken, hasRole } from '../../../../api-lib/utils/auth.js';
import { adminCreatePlan } from '../../../../api-lib/services/subscriptionService.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' });
  }

  if (!hasRole(user, ['ADMIN'])) {
    return res.status(403).json({ success: false, message: 'Forbidden: Admin access required' });
  }

  const method = req.method;
  if (method === 'POST') {
    try {
      const plan = await adminCreatePlan(req.body);
      return res.status(201).json({
        success: true,
        message: 'Subscription plan created successfully',
        data: plan,
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  res.setHeader('Allow', ['POST']);
  return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
}
