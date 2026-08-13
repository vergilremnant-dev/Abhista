import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../api-lib/utils/db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const method = req.method;

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
  }

  try {
    const { workforceName, workforceTypeId } = req.query;

    const whereClause: any = {
      isActive: true,
      deletedAt: null,
    };

    if (workforceTypeId) {
      whereClause.workforceTypeId = workforceTypeId as string;
    } else if (workforceName) {
      const type = await db.workforceType.findUnique({
        where: { name: workforceName as string },
      });
      if (type) {
        whereClause.workforceTypeId = type.id;
      } else {
        // Force empty array if type doesn't exist
        whereClause.workforceTypeId = 'non-existent-uuid';
      }
    }

    const categories = await db.serviceCategory.findMany({
      where: whereClause,
      include: {
        workforceType: true,
        children: {
          where: { isActive: true, deletedAt: null },
          include: {
            children: {
              where: { isActive: true, deletedAt: null },
            },
          },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });

    return res.status(200).json({ success: true, data: categories });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
