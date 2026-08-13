import { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken, hasRole } from '../../../../api-lib/utils/auth.js';
import { db } from '../../../../api-lib/utils/db.js';
import { startBooking } from '../../../../api-lib/services/bookingService.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' });
  }

  if (!hasRole(user, ['PROVIDER'])) {
    return res.status(403).json({ success: false, message: 'Forbidden: Provider role required' });
  }

  const { id } = req.query;
  const paramId = Array.isArray(id) ? id[0] : id;

  if (!paramId) {
    return res.status(400).json({ success: false, message: 'Missing booking ID parameter' });
  }

  const method = req.method;
  if (method !== 'PATCH') {
    res.setHeader('Allow', ['PATCH']);
    return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
  }

  try {
    const provider = await db.providerProfile.findUnique({
      where: { userId: user.id },
    });
    if (!provider) {
      return res.status(400).json({ success: false, message: 'Provider profile not found' });
    }

    const booking = await startBooking(paramId, provider.id);
    return res.status(200).json({
      success: true,
      message: 'Booking status updated to IN_PROGRESS',
      data: booking,
    });
  } catch (err: any) {
    const msg = err.message || '';
    if (msg.includes('not found')) {
      return res.status(404).json({ success: false, message: msg });
    }
    return res.status(400).json({ success: false, message: msg });
  }
}
