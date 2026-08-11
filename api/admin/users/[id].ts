import { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken, hasRole } from '../../utils/auth.js';
import { db } from '../../utils/db.js';
import { UserStatus, Role } from '@prisma/client';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const adminUser = verifyToken(req);
  if (!adminUser) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' });
  }

  if (!hasRole(adminUser, ['ADMIN'])) {
    return res.status(403).json({ success: false, message: 'Forbidden: Admin access required' });
  }

  const { id } = req.query;
  const userId = Array.isArray(id) ? id[0] : id;

  if (!userId) {
    return res.status(400).json({ success: false, message: 'Missing user ID parameter' });
  }

  const method = req.method;

  if (method === 'PATCH') {
    try {
      const { status, role } = req.body;
      const updateData: any = {};

      if (status) {
        if (!Object.values(UserStatus).includes(status)) {
          return res.status(400).json({ success: false, message: 'Invalid user status value' });
        }
        updateData.status = status;
      }

      if (role) {
        if (!Object.values(Role).includes(role)) {
          return res.status(400).json({ success: false, message: 'Invalid user role value' });
        }
        updateData.role = role;
      }

      const updatedUser = await db.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
        },
      });

      return res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: updatedUser,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  } else if (method === 'DELETE') {
    try {
      // Soft Delete: update status to INACTIVE
      const softDeletedUser = await db.user.update({
        where: { id: userId },
        data: { status: UserStatus.INACTIVE },
        select: { id: true, email: true, status: true },
      });

      return res.status(200).json({
        success: true,
        message: 'User soft-deleted successfully (marked INACTIVE)',
        data: softDeletedUser,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  res.setHeader('Allow', ['PATCH', 'DELETE']);
  return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
}
