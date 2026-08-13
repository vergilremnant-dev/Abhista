import { VercelRequest, VercelResponse } from '@vercel/node';
import { createCallbackRequest } from '../../services/callbackService.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const method = req.method;

  if (method === 'POST') {
    try {
      const request = await createCallbackRequest(req.body);
      return res.status(201).json({
        success: true,
        message: 'Callback request registered successfully.',
        data: request,
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  res.setHeader('Allow', ['POST']);
  return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
}
