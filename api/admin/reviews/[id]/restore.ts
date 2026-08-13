import { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken, hasRole } from '../../../_utils/auth.js';
import { restoreReview } from '../../../_services/reviewService.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' });
  }

  if (!hasRole(user, ['ADMIN'])) {
    return res.status(403).json({ success: false, message: 'Forbidden: Admin access required' });
  }

  const { id } = req.query;
  const reviewId = Array.isArray(id) ? id[0] : id;

  if (!reviewId) {
    return res.status(400).json({ success: false, message: 'Review ID is required' });
  }

  const method = req.method;
  if (method === 'PATCH') {
    try {
      const updated = await restoreReview(reviewId);
      return res.status(200).json({
        success: true,
        message: 'Review restored successfully',
        data: updated,
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  res.setHeader('Allow', ['PATCH']);
  return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
}
