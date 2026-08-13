import { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken, hasRole } from '../../_utils/auth.js';
import { db } from '../../_utils/db.js';
import { cancelBooking } from '../../_services/bookingService.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' });
  }

  if (!hasRole(user, ['CUSTOMER'])) {
    return res.status(403).json({ success: false, message: 'Forbidden: Customer role required' });
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
    const customer = await db.customerProfile.findUnique({
      where: { userId: user.id },
    });
    if (!customer) {
      return res.status(400).json({ success: false, message: 'Customer profile not found' });
    }

    const booking = await cancelBooking(paramId, customer.id);
    return res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
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
