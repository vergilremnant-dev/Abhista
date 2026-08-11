import { VercelResponse } from '@vercel/node';
import { VercelRequestWithUser } from '../../middleware/authMiddleware.js';
import { requirePermission } from '../../middleware/permissionMiddleware.js';
import { db } from '../../utils/db.js';

async function handler(req: VercelRequestWithUser, res: VercelResponse) {
  const method = req.method;

  if (method === 'GET') {
    try {
      const { search, role, status, page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const whereClause: any = {};

      if (role) {
        whereClause.role = role;
      }
      if (status) {
        whereClause.status = status;
      }
      if (search) {
        const searchStr = String(search).toLowerCase();
        whereClause.OR = [
          { email: { contains: searchStr, mode: 'insensitive' } },
          { customerProfile: { fullName: { contains: searchStr, mode: 'insensitive' } } },
          { providerProfile: { fullName: { contains: searchStr, mode: 'insensitive' } } },
        ];
      }

      const [usersList, totalCount] = await Promise.all([
        db.user.findMany({
          where: whereClause,
          include: {
            customerProfile: {
              select: {
                fullName: true,
                phoneNumber: true,
                city: true,
                state: true,
              },
            },
            providerProfile: {
              select: {
                fullName: true,
                businessName: true,
                phoneNumber: true,
                city: true,
                state: true,
                verificationStatus: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          skip,
          take: Number(limit),
        }),
        db.user.count({ where: whereClause }),
      ]);

      return res.status(200).json({
        success: true,
        data: usersList,
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

export default requirePermission('user:manage')(handler);
