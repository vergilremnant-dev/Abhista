import { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken, hasRole } from '../../../api-lib/utils/auth.js';
import { getCallbackAnalytics } from '../../../api-lib/services/callbackService.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' });
  }

  if (!hasRole(user, ['ADMIN'])) {
    return res.status(403).json({ success: false, message: 'Forbidden: Admin access required' });
  }

  const method = req.method;

  if (method === 'GET') {
    try {
      const stats = await getCallbackAnalytics();
      return res.status(200).json({ success: true, data: stats });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  res.setHeader('Allow', ['GET']);
  return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
}
