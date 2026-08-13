import { VercelResponse } from '@vercel/node';
import { logoutAllUserSessions } from '../_services/authService.js';
import { withAuth, VercelRequestWithUser } from '../_middleware/authMiddleware.js';
import { clearCookie } from '../_utils/../_utils/cookies.js';

async function handler(req: VercelRequestWithUser, res: VercelResponse) {
  const method = req.method;

  if (method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
  }

  try {
    const userId = req.user!.id;

    await logoutAllUserSessions(userId);
    clearCookie(res, 'refresh_token', '/api/auth');

    return res.status(200).json({ success: true, message: 'Logged out of all devices successfully' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export default withAuth(handler);
