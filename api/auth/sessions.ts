import { VercelResponse } from '@vercel/node';
import { getUserSessions, revokeUserSession } from '../../api-lib/services/authService.js';
import { withAuth, VercelRequestWithUser } from '../../api-lib/middleware/authMiddleware.js';

async function handler(req: VercelRequestWithUser, res: VercelResponse) {
  const method = req.method;
  const userId = req.user!.id;

  if (method === 'GET') {
    try {
      const list = await getUserSessions(userId);
      return res.status(200).json({ success: true, data: list });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  } else if (method === 'DELETE') {
    try {
      const { sessionId } = req.body;
      if (!sessionId) {
        return res.status(400).json({ success: false, message: 'sessionId is required' });
      }

      await revokeUserSession(userId, sessionId);
      return res.status(200).json({ success: true, message: 'Session revoked successfully' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  res.setHeader('Allow', ['GET', 'DELETE']);
  return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
}

export default withAuth(handler);
