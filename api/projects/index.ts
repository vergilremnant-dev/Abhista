import { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken } from '../_utils/../_utils/auth.js';
import { db } from '../_utils/../_utils/db.js';
import { ProjectStatus } from '@prisma/client';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const method = req.method;

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
  }

  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' });
  }

  try {
    const { status, limit = '10', offset = '0' } = req.query;
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const offsetNum = Math.max(0, Number(offset));

    const whereClause: any = {};

    // Filter by role
    const userProfile = await db.user.findUnique({ where: { id: user.id } });

    if (userProfile?.role === 'PROVIDER') {
      const providerProfile = await db.providerProfile.findFirst({ where: { userId: user.id } });
      whereClause.providerId = providerProfile?.id || 'non-existent';
    } else if (userProfile?.role === 'CUSTOMER') {
      const customerProfile = await db.customerProfile.findUnique({ where: { userId: user.id } });
      whereClause.customerId = customerProfile?.id || 'non-existent';
    }

    if (status) {
      whereClause.status = status as ProjectStatus;
    }

    const projects = await db.project.findMany({
      where: whereClause,
      take: limitNum,
      skip: offsetNum,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true,
        provider: true,
        requirement: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
