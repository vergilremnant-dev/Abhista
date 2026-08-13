import { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken, hasRole } from '../../utils/auth.js';
import { createConsultationBooking, getCustomerConsultations } from '../../services/consultationService.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' });
  }

  if (!hasRole(user, ['CUSTOMER'])) {
    return res.status(403).json({ success: false, message: 'Forbidden: Customer access required' });
  }

  const method = req.method;

  if (method === 'POST') {
    try {
      const booking = await createConsultationBooking(user.id, req.body);
      return res.status(201).json({
        success: true,
        message: 'Consultation request submitted successfully.',
        data: booking,
      });
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.includes('active subscription')) {
        return res.status(403).json({ success: false, message: msg });
      }
      return res.status(400).json({ success: false, message: msg });
    }
  } else if (method === 'GET') {
    try {
      const list = await getCustomerConsultations(user.id);
      return res.status(200).json({ success: true, data: list });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
}
