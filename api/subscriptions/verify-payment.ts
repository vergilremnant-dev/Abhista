import { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken } from '../_utils/../_utils/auth.js';
import { verifyRazorpayPayment } from '../_services/subscriptionService.js';

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
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: 'razorpayOrderId, razorpayPaymentId, and razorpaySignature are required',
      });
    }

    const subscription = await verifyRazorpayPayment(
      user.id,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    return res.status(200).json({
      success: true,
      message: 'Payment verified and subscription activated successfully',
      data: subscription,
    });
  } catch (err: unknown) {
    console.error('Error in verify-payment API:', err);
    return res.status(400).json({
      success: false,
      message: err instanceof Error ? err.message : 'Payment verification failed',
    });
  }
}
