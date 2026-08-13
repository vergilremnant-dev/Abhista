import { VercelRequest, VercelResponse } from '@vercel/node';
import { getSubscriptionPlans } from '../../services/subscriptionService.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const method = req.method;
  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
  }

  try {
    const plans = await getSubscriptionPlans(false);
    return res.status(200).json({ success: true, data: plans });
  } catch (err: unknown) {
    return res.status(500).json({ success: false, message: err instanceof Error ? err.message : 'Internal Server Error' });
  }
}
