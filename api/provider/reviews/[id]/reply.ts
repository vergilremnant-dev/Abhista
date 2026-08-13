import { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken, hasRole } from '../../../_utils/auth.js';
import { db } from '../../../_utils/db.js';
import { submitProviderReply } from '../../../_services/reviewService.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' });
  }

  if (!hasRole(user, ['PROVIDER'])) {
    return res.status(403).json({ success: false, message: 'Forbidden: Provider access required' });
  }

  const { id } = req.query;
  const reviewId = Array.isArray(id) ? id[0] : id;

  if (!reviewId) {
    return res.status(400).json({ success: false, message: 'Review ID is required' });
  }

  const method = req.method;
  if (method === 'POST') {
    try {
      const providerProfile = await db.providerProfile.findUnique({
        where: { userId: user.id },
      });
      if (!providerProfile) {
        return res.status(400).json({ success: false, message: 'Provider profile required' });
      }

      const { response } = req.body;
      if (response === undefined) {
        return res.status(400).json({ success: false, message: 'response field is required' });
      }

      const updated = await submitProviderReply(providerProfile.id, reviewId, response);
      return res.status(200).json({
        success: true,
        message: 'Reply submitted successfully',
        data: updated,
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  res.setHeader('Allow', ['POST']);
  return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
}
