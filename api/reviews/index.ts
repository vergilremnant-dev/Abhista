import { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken, hasRole } from '../../api-lib/utils/auth.js';
import { db } from '../../api-lib/utils/db.js';
import { submitReview } from '../../api-lib/services/reviewService.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' });
  }

  if (!hasRole(user, ['CUSTOMER'])) {
    return res.status(403).json({ success: false, message: 'Forbidden: Only customers can write reviews' });
  }

  const method = req.method;
  if (method === 'POST') {
    try {
      const customerProfile = await db.customerProfile.findUnique({
        where: { userId: user.id },
      });
      if (!customerProfile) {
        return res.status(400).json({ success: false, message: 'Customer profile required to write reviews' });
      }

      const review = await submitReview(customerProfile.id, req.body);
      return res.status(201).json({
        success: true,
        message: 'Review submitted successfully',
        data: review,
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  res.setHeader('Allow', ['POST']);
  return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
}
