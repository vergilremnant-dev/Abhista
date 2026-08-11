import { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken, hasRole } from '../../utils/auth.js';
import { db } from '../../utils/db.js';

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
      const { status, page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const whereClause: any = {};
      if (status) {
        whereClause.status = status;
      }

      const [subsList, totalCount] = await Promise.all([
        db.userSubscription.findMany({
          where: whereClause,
          include: {
            user: {
              select: {
                email: true,
                customerProfile: { select: { fullName: true } },
                providerProfile: { select: { fullName: true } },
              },
            },
            plan: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          skip,
          take: Number(limit),
        }),
        db.userSubscription.count({ where: whereClause }),
      ]);

      return res.status(200).json({
        success: true,
        data: subsList,
        total: totalCount,
        page: Number(page),
        limit: Number(limit),
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  res.setHeader('Allow', ['GET']);
  return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
}
