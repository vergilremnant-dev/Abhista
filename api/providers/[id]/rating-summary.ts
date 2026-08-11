import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../utils/db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  const providerId = Array.isArray(id) ? id[0] : id;

  if (!providerId) {
    return res.status(400).json({ success: false, message: 'Provider ID is required' });
  }

  const method = req.method;
  if (method === 'GET') {
    try {
      const provider = await db.providerProfile.findUnique({
        where: { id: providerId },
        select: {
          averageRating: true,
          totalReviews: true,
          rating1Count: true,
          rating2Count: true,
          rating3Count: true,
          rating4Count: true,
          rating5Count: true,
        },
      });

      if (!provider) {
        return res.status(404).json({ success: false, message: 'Provider profile not found' });
      }

      return res.status(200).json({ success: true, data: provider });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  res.setHeader('Allow', ['GET']);
  return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
}
