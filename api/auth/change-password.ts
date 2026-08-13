import { VercelResponse } from '@vercel/node';
import { db } from '../_utils/../_utils/db.js';
import bcrypt from 'bcryptjs';
import { validatePasswordStrength } from '../_utils/../_utils/validation.js';
import { logSecurityEvent } from '../_services/auditService.js';
import { withAuth, VercelRequestWithUser } from '../_middleware/authMiddleware.js';

async function handler(req: VercelRequestWithUser, res: VercelResponse) {
  const method = req.method;

  if (method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
  }

  const { currentPassword, newPassword } = req.body;
  const userId = req.user!.id;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Current and new passwords are required' });
  }

  const passwordErrors = validatePasswordStrength(newPassword);
  if (passwordErrors.length > 0) {
    return res.status(400).json({ success: false, message: passwordErrors.join(' ') });
  }

  try {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      await logSecurityEvent(userId, 'PASSWORD_CHANGE', 'Failed password change attempt: incorrect current password');
      return res.status(400).json({ success: false, message: 'Incorrect current password' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await db.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Invalidate all other active sessions for security!
    await db.userSession.deleteMany({
      where: {
        userId,
        NOT: {
          // Keep the current refresh token session if available?
          // Since we might not know the current token here, we can terminate all sessions
          // and ask the user to log in again, or just let them re-auth.
        }
      }
    });

    await logSecurityEvent(userId, 'PASSWORD_CHANGE', 'Password changed successfully. Other active sessions revoked.');

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully.',
    });
    } catch (_error: any) {
    return res.status(500).json({ success: false, message: 'An internal server error occurred.' });
  }
}

export default withAuth(handler);
