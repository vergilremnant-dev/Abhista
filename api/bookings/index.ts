import { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken, hasRole } from '../_utils/../_utils/auth.js';
import { db } from '../_utils/../_utils/db.js';
import { createBooking } from '../_services/bookingService.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' });
  }

  const method = req.method;
  if (method === 'POST') {
    if (!hasRole(user, ['CUSTOMER'])) {
      return res.status(403).json({ success: false, message: 'Forbidden: Only customers can create bookings' });
    }

    try {
      // Find customer profile matching authenticated user ID
      const customer = await db.customerProfile.findUnique({
        where: { userId: user.id },
      });
      if (!customer) {
        return res.status(400).json({ success: false, message: 'Customer profile not found. Please complete profile first.' });
      }

      const booking = await createBooking(customer.id, req.body);
      return res.status(201).json({
        success: true,
        message: 'Booking request created successfully',
        data: booking,
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  res.setHeader('Allow', ['POST']);
  return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
}
