import { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken, hasRole } from '../../utils/auth.js';
import { getProviderAvailability, updateProviderAvailability } from '../../services/consultationService.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' });
  }

  if (!hasRole(user, ['PROVIDER'])) {
    return res.status(403).json({ success: false, message: 'Forbidden: Provider access required' });
  }

  const method = req.method;

  if (method === 'GET') {
    try {
      const schedule = await getProviderAvailability(user.id);
      return res.status(200).json({ success: true, data: schedule });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  } else if (method === 'PUT') {
    try {
      const schedule = req.body.availabilities;
      if (!Array.isArray(schedule)) {
        return res.status(400).json({ success: false, message: 'Missing or invalid availabilities array' });
      }

      await updateProviderAvailability(user.id, schedule);
      return res.status(200).json({
        success: true,
        message: 'Consultation availability updated successfully.',
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  res.setHeader('Allow', ['GET', 'PUT']);
  return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
}
