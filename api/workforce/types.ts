import { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken } from '../utils/auth.js';
import { db } from '../utils/db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const method = req.method;

  try {
    if (method === 'GET') {
      const types = await db.workforceType.findMany({
        orderBy: { displayName: 'asc' },
      });
      return res.status(200).json({ success: true, data: types });
    }

    // Write endpoints require admin auth
    const user = verifyToken(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' });
    }

    const userProfile = await db.user.findUnique({ where: { id: user.id } });
    if (userProfile?.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Forbidden: Admin access required' });
    }

    if (method === 'POST') {
      const { name, displayName, isActive } = req.body;
      if (!name || !displayName) {
        return res.status(400).json({ success: false, message: 'Missing parameters: name, displayName' });
      }

      const existing = await db.workforceType.findUnique({ where: { name } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Workforce type name already exists' });
      }

      const type = await db.workforceType.create({
        data: {
          name,
          displayName,
          isActive: isActive !== undefined ? isActive : true,
        },
      });

      return res.status(201).json({ success: true, data: type, message: 'Workforce type created successfully' });
    }

    if (method === 'PUT') {
      const { id, displayName, isActive } = req.body;
      if (!id) {
        return res.status(400).json({ success: false, message: 'Missing parameter: id' });
      }

      const updated = await db.workforceType.update({
        where: { id },
        data: {
          displayName: displayName !== undefined ? displayName : undefined,
          isActive: isActive !== undefined ? isActive : undefined,
        },
      });

      return res.status(200).json({ success: true, data: updated, message: 'Workforce type updated successfully' });
    }

    res.setHeader('Allow', ['GET', 'POST', 'PUT']);
    return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
