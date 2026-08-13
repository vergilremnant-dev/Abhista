import { VercelResponse } from '@vercel/node';
import { db } from '../_utils/../_utils/db.js';
import crypto from 'crypto';
import { logSecurityEvent } from '../_services/auditService.js';
import { VercelRequestWithUser } from '../_middleware/authMiddleware.js';

export default async function handler(req: VercelRequestWithUser, res: VercelResponse) {
  const method = req.method;

  if (method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
  }

  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, message: 'Verification token is required' });
  }

  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const sessionTokenKey = `EMAIL_VERIFY:${hashedToken}`;

    const session = await db.userSession.findUnique({
      where: { token: sessionTokenKey },
      include: { user: true },
    });

    if (!session) {
      return res.status(400).json({ success: false, message: 'Invalid or expired email verification token' });
    }

    if (new Date() > session.expiresAt) {
      await db.userSession.delete({ where: { id: session.id } });
      return res.status(400).json({ success: false, message: 'Email verification token has expired' });
    }

    // Activate user and mark profile verified if provider
    await db.user.update({
      where: { id: session.userId },
      data: { status: 'ACTIVE' },
    });

    if (session.user.role === 'PROVIDER') {
      await db.providerProfile.updateMany({
        where: { userId: session.userId },
        data: { verificationStatus: 'VERIFIED' },
      });
    }

    // Delete token session
    await db.userSession.delete({ where: { id: session.id } });

    await logSecurityEvent(session.userId, 'PROFILE_UPDATE', 'Email verification completed successfully.');

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully. Your account is now active.',
    });
    } catch (_error: any) {
    return res.status(500).json({ success: false, message: 'An internal server error occurred during verification.' });
  }
}
