import { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken } from '../_utils/../_utils/auth.js';
import { db } from '../_utils/../_utils/db.js';
import { getProviderAvailableSlots, setProviderAvailabilityBlocks } from '../_services/appointmentService.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const method = req.method;
  const user = verifyToken(req);

  if (!user) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' });
  }

  try {
    if (method === 'GET') {
      const { providerId, date } = req.query;

      if (!providerId || !date) {
        return res.status(400).json({ success: false, message: 'Missing required parameters: providerId and date' });
      }

      const slots = await getProviderAvailableSlots(providerId as string, new Date(date as string));
      return res.status(200).json({ success: true, data: slots });
    }

    if (method === 'PUT') {
      const providerProfile = await db.providerProfile.findFirst({
        where: { userId: user.id },
      });

      if (!providerProfile) {
        return res.status(403).json({ success: false, message: 'Only registered provider profiles can configure availability blocks' });
      }

      const { blocks } = req.body;
      if (!blocks || !Array.isArray(blocks)) {
        return res.status(400).json({ success: false, message: 'Missing or invalid parameters: blocks array is required' });
      }

      const updatedBlocks = await setProviderAvailabilityBlocks(providerProfile.id, blocks);
      return res.status(200).json({
        success: true,
        data: updatedBlocks,
        message: 'Availability blocks configured successfully',
      });
    }

    res.setHeader('Allow', ['GET', 'PUT']);
    return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
