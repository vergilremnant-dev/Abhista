import { VercelRequest, VercelResponse } from '@vercel/node';
import { logoutUserSession } from '../_services/authService.js';
import { parseCookies, clearCookie } from '../_utils/../_utils/cookies.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const method = req.method;

  if (method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
  }

  try {
    const cookies = parseCookies(req);
    const refreshToken = cookies['refresh_token'];

    if (refreshToken) {
      await logoutUserSession(refreshToken);
    }

    clearCookie(res, 'refresh_token', '/api/auth');

    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
