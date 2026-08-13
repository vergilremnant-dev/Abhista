import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../_utils/../_utils/db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const method = req.method;

  if (method === 'GET') {
    try {
      const [latest, popular] = await Promise.all([
        db.article.findMany({
          where: { isPublished: true },
          include: { category: true },
          orderBy: { publishedAt: 'desc' },
          take: 3,
        }),
        db.article.findMany({
          where: { isPublished: true },
          include: { category: true },
          orderBy: { viewsCount: 'desc' },
          take: 3,
        }),
      ]);

      return res.status(200).json({
        success: true,
        data: { latest, popular },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  res.setHeader('Allow', ['GET']);
  return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
}
