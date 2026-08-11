import { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken } from '../../utils/auth.js';
import { getSubscriptionsAnalytics } from '../../services/analyticsService.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = verifyToken(req);
  if (!user || user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Access denied: Admin role required' });
  }

  const { startDate, endDate, categoryId, city } = req.query;

  try {
    const data = await getSubscriptionsAnalytics({
      startDate: startDate ? String(startDate) : undefined,
      endDate: endDate ? String(endDate) : undefined,
      categoryId: categoryId ? Number(categoryId) : undefined,
      city: city ? String(city) : undefined,
    });
    return res.status(200).json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
