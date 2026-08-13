import { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken } from '../_utils/../_utils/auth.js';
import { getMySubscription } from '../_services/subscriptionService.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' });
  }

  const method = req.method;
  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
  }

  try {
    const subscription = await getMySubscription(user.id);
    return res.status(200).json({ success: true, data: subscription });
  } catch (err: unknown) {
    return res.status(500).json({ success: false, message: err instanceof Error ? err.message : 'Internal Server Error' });
  }
}
