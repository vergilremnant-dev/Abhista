import { VercelRequest, VercelResponse } from '@vercel/node';
import { refreshUserToken } from '../../api-lib/services/authService.js';
import { parseCookies, setCookie } from '../../api-lib/utils/cookies.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const method = req.method;

  if (method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
  }

  try {
    const cookies = parseCookies(req);
    const refreshToken = cookies['refresh_token'];

    if (!refreshToken) {
      return res.status(200).json({ success: false, message: 'Session cookie not found' });
    }

    const userAgent = req.headers['user-agent'] as string;
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;

    const response = await refreshUserToken(refreshToken, userAgent, ipAddress);

    setCookie(res, 'refresh_token', response.refreshToken, {
      httpOnly: true,
      path: '/api/auth',
      maxAge: 7 * 24 * 60 * 60,
    });

    return res.status(200).json({
      success: true,
      accessToken: response.accessToken,
      user: response.user,
    });
  } catch (err: any) {
    return res.status(200).json({ success: false, message: err.message || 'Session invalid or expired' });
  }
}
