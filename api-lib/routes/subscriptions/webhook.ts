import { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { db } from '../../utils/db.js';
import { PaymentStatus, SubscriptionStatus } from '@prisma/client';

export interface VercelRequestWithRawBody extends VercelRequest {
  rawBody?: string;
}

export default async function handler(req: VercelRequestWithRawBody, res: VercelResponse) {
  const method = req.method;
  if (method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
  }

  // 1. Signature Verification
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'] as string;

  if (!webhookSecret || !signature) {
    console.error('Webhook verification configuration missing');
    return res.status(400).json({ success: false, message: 'Invalid headers or configurations' });
  }

  const payloadStr = req.rawBody || JSON.stringify(req.body);
  const hmac = crypto.createHmac('sha256', webhookSecret);
  hmac.update(payloadStr);
  const expectedSignature = hmac.digest('hex');

  let isValidSignature = false;
  try {
    isValidSignature = crypto.timingSafeEqual(
      Buffer.from(signature, 'utf-8'),
      Buffer.from(expectedSignature, 'utf-8')
    );
  } catch {
    isValidSignature = false;
  }

  if (!isValidSignature) {
    console.error('Webhook signature verification failed');
    return res.status(400).json({ success: false, message: 'Invalid signature' });
  }

  // 2. Process Webhook Event
  const { event, payload } = req.body;
  if (!event || !payload) {
    return res.status(400).json({ success: false, message: 'Invalid payload schema' });
  }

  console.log(`Processing Razorpay Webhook Event: ${event}`);

  try {
    if (event === 'order.paid' || event === 'payment.captured') {
      const paymentEntity = payload.payment?.entity;
      const orderId = paymentEntity?.order_id || payload.order?.entity?.id;
      const paymentId = paymentEntity?.id;

      if (!orderId || !paymentId) {
        return res.status(400).json({ success: false, message: 'Missing order_id or payment_id in payload' });
      }

      // Safe, transactional, idempotent payment and subscription updates
      await db.$transaction(async (tx) => {
        const payment = await tx.payment.findFirst({
          where: { txRef: orderId },
          include: { plan: true },
        });

        if (!payment) {
          throw new Error(`Payment record not found for Razorpay Order ID: ${orderId}`);
        }

        // Idempotency check: if status is already SUCCESS, return early
        if (payment.status === PaymentStatus.SUCCESS) {
          console.log(`Payment already processed successfully for Order ID: ${orderId}`);
          return;
        }

        // Verify webhook amount (in paise) against stored payment amount (in rupees)
        const webhookAmountRupees = (paymentEntity?.amount || payload.order?.entity?.amount) / 100;
        if (Math.abs(payment.amount - webhookAmountRupees) > 0.01) {
          throw new Error(`Amount mismatch. Expected: ${payment.amount}, Received: ${webhookAmountRupees}`);
        }

        // Update payment status to SUCCESS
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.SUCCESS,
            razorpayPaymentId: paymentId,
            razorpaySignature: signature,
          },
        });

        // Expire existing active subscriptions
        await tx.userSubscription.updateMany({
          where: { userId: payment.userId, status: SubscriptionStatus.ACTIVE },
          data: { status: SubscriptionStatus.EXPIRED },
        });

        // Create new active subscription
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + payment.plan!.durationDays);

        await tx.userSubscription.create({
          data: {
            userId: payment.userId,
            planId: payment.planId!,
            status: SubscriptionStatus.ACTIVE,
            startDate,
            endDate,
            transactionReference: paymentId,
          },
        });

        console.log(`Subscription activated successfully via Webhook for User ID: ${payment.userId}`);
      });

    } else if (event === 'payment.failed') {
      const paymentEntity = payload.payment?.entity;
      const orderId = paymentEntity?.order_id;

      if (orderId) {
        const payment = await db.payment.findFirst({ where: { txRef: orderId } });
        if (payment && payment.status === PaymentStatus.PENDING) {
          await db.payment.update({
            where: { id: payment.id },
            data: { status: PaymentStatus.FAILED },
          });
          console.log(`Payment marked as FAILED via Webhook for Order ID: ${orderId}`);
        }
      }
    }

    return res.status(200).json({ success: true, message: 'Webhook processed successfully' });
  } catch (err: any) {
    console.error('Error processing Razorpay Webhook:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}
