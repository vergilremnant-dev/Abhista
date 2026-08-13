import { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken, hasRole } from '../../../_utils/auth.js';
import { rescheduleConsultation } from '../../../_services/consultationService.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' });
  }

  if (!hasRole(user, ['PROVIDER'])) {
    return res.status(403).json({ success: false, message: 'Forbidden: Provider access required' });
  }

  const { id } = req.query;
  const paramId = Array.isArray(id) ? id[0] : id;

  if (!paramId) {
    return res.status(400).json({ success: false, message: 'Missing consultation ID parameter' });
  }

  const method = req.method;

  if (method === 'PATCH') {
    try {
      const { newDate, newTime } = req.body;
      if (!newDate || !newTime) {
        return res.status(400).json({ success: false, message: 'Missing newDate or newTime parameters' });
      }

      const updated = await rescheduleConsultation(paramId, user.id, newDate, newTime);
      return res.status(200).json({
        success: true,
        message: 'Consultation rescheduled successfully.',
        data: updated,
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  res.setHeader('Allow', ['PATCH']);
  return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
}
