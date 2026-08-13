import { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken } from '../_utils/../_utils/auth.js';
import { createRazorpayOrder } from '../_services/subscriptionService.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' });
  }

  const method = req.method;
  if (method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
  }

  try {
    const { planId } = req.body;
    if (!planId) {
      return res.status(400).json({ success: false, message: 'planId is required' });
    }

    const orderData = await createRazorpayOrder(user.id, Number(planId));
    return res.status(200).json({
      success: true,
      message: 'Razorpay order created successfully',
      data: orderData,
    });
  } catch (err: unknown) {
    console.error('Error in create-order API:', err);
    return res.status(400).json({
      success: false,
      message: err instanceof Error ? err.message : 'Razorpay order creation failed',
    });
  }
}
