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
      const reviews = await db.review.findMany({
        where: {
          providerId,
          isVisible: true,
        },
        include: {
          customer: {
            select: {
              fullName: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return res.status(200).json({ success: true, data: reviews });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  res.setHeader('Allow', ['GET']);
  return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
}
