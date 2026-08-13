import { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken } from '../../utils/auth.js';
import { db } from '../../utils/db.js';
import { updateUserPresence } from '../../services/chatService.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const method = req.method;
  const user = verifyToken(req);

  if (!user) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' });
  }

  try {
    if (method === 'GET') {
      const { userId } = req.query;
      const targetUserId = (Array.isArray(userId) ? userId[0] : userId) || user.id;

      const presence = await db.userPresence.findUnique({
        where: { userId: targetUserId },
      });

      return res.status(200).json({
        success: true,
        data: presence || { status: 'OFFLINE', lastSeenAt: new Date(0) },
      });
    }

    if (method === 'PUT') {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ success: false, message: 'Missing parameter: status' });
      }

      const presence = await updateUserPresence(user.id, status);
      return res.status(200).json({ success: true, data: presence });
    }

    res.setHeader('Allow', ['GET', 'PUT']);
    return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
