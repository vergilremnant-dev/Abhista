import { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken } from '../../../api-lib/utils/auth.js';
import { db } from '../../../api-lib/utils/db.js';
import { getBookingById } from '../../../api-lib/services/bookingService.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' });
  }

  const { id } = req.query;
  const paramId = Array.isArray(id) ? id[0] : id;

  if (!paramId) {
    return res.status(400).json({ success: false, message: 'Missing booking ID parameter' });
  }

  const method = req.method;
  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
  }

  try {
    const booking = await getBookingById(paramId);

    // Verify ownership: customer, provider, or admin
    const customer = await db.customerProfile.findUnique({
      where: { userId: user.id },
    });
    const provider = await db.providerProfile.findUnique({
      where: { userId: user.id },
    });

    const isCustomerOwner = customer && booking.customerId === customer.id;
    const isProviderOwner = provider && booking.providerId === provider.id;
    const isAdmin = user.role === 'ADMIN';

    if (!isCustomerOwner && !isProviderOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Forbidden: You do not have permission to view this booking' });
    }

    return res.status(200).json({ success: true, data: booking });
  } catch (err: any) {
    if (err.message.includes('not found')) {
      return res.status(404).json({ success: false, message: err.message });
    }
    return res.status(500).json({ success: false, message: err.message });
  }
}
