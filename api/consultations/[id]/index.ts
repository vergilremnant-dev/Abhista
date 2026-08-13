import { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken } from '../../_utils/auth.js';
import { getConsultationDetail } from '../../_services/consultationService.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' });
  }

  const { id } = req.query;
  const paramId = Array.isArray(id) ? id[0] : id;

  if (!paramId) {
    return res.status(400).json({ success: false, message: 'Missing consultation ID parameter' });
  }

  const method = req.method;

  if (method === 'GET') {
    try {
      const details = await getConsultationDetail(paramId, user.id, user.role);
      return res.status(200).json({ success: true, data: details });
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.includes('Forbidden')) {
        return res.status(403).json({ success: false, message: msg });
      }
      return res.status(400).json({ success: false, message: msg });
    }
  }

  res.setHeader('Allow', ['GET']);
  return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
}
