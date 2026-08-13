import { VercelRequest, VercelResponse } from '@vercel/node';
import { getCallbackStatus } from '../_services/callbackService.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const method = req.method;

  if (method === 'GET') {
    const { referenceNumber } = req.query;
    const ref = Array.isArray(referenceNumber) ? referenceNumber[0] : referenceNumber;

    if (!ref) {
      return res.status(400).json({ success: false, message: 'Missing referenceNumber parameter' });
    }

    try {
      const status = await getCallbackStatus(ref);
      return res.status(200).json({ success: true, data: status });
    } catch (err: any) {
      return res.status(404).json({ success: false, message: err.message });
    }
  }

  res.setHeader('Allow', ['GET']);
  return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
}
