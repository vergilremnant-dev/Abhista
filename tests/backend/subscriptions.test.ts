import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import crypto from 'crypto';
import { SubscriptionStatus, PaymentStatus, PaymentType } from '@prisma/client';

// Mock DB
vi.mock('../../api-lib/utils/db.js', () => {
  const mockPlan = {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  };
  const mockSub = {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
  };
  const mockPay = {
    create: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
  };
  const mockDb = {
    subscriptionPlan: mockPlan,
    userSubscription: mockSub,
    payment: mockPay,
    $transaction: vi.fn(),
  };

  mockDb.$transaction.mockImplementation(async (cb: any) => {
    return await cb(mockDb);
  });

  return {
    db: mockDb,
  };
});

// Mock Razorpay
const mockOrdersCreate = vi.fn();
vi.mock('razorpay', () => {
  function MockRazorpay() {
    return {
      orders: {
        create: mockOrdersCreate,
      },
    };
  }
  return {
    default: MockRazorpay,
  };
});

import { db } from '../../api-lib/utils/db.js';
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from '../../api-lib/services/subscriptionService.js';
import webhookHandler from '../../api-lib/routes/subscriptions/webhook.js';

describe('Razorpay Payment Flow Integration & Webhooks', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = {
      ...originalEnv,
      RAZORPAY_KEY_ID: 'rzp_test_mock_key_id',
      RAZORPAY_KEY_SECRET: 'mock_key_secret_1234567890',
      RAZORPAY_WEBHOOK_SECRET: 'mock_webhook_secret_99999',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('createRazorpayOrder', () => {
    it('should throw if RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing', async () => {
      delete process.env.RAZORPAY_KEY_ID;
      vi.mocked(db.subscriptionPlan.findUnique).mockResolvedValueOnce({
        id: 1,
        name: 'Pro Pass',
        price: 999,
        durationDays: 30,
        isActive: true,
        description: 'Test',
        features: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      vi.mocked(db.userSubscription.findFirst).mockResolvedValueOnce(null);

      await expect(createRazorpayOrder('user_123', 1)).rejects.toThrow(
        'Razorpay API keys are not configured in environment variables'
      );
    });

    it('should throw if the user already has an active subscription', async () => {
      vi.mocked(db.subscriptionPlan.findUnique).mockResolvedValueOnce({
        id: 1,
        name: 'Pro Pass',
        price: 999,
        durationDays: 30,
        isActive: true,
        description: 'Test',
        features: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 15);
      vi.mocked(db.userSubscription.findFirst).mockResolvedValueOnce({
        id: 'sub_10',
        userId: 'user_123',
        planId: 1,
        status: SubscriptionStatus.ACTIVE,
        startDate: new Date(),
        endDate: futureDate,
        transactionReference: 'tx_123',
        createdAt: new Date(),
      });

      await expect(createRazorpayOrder('user_123', 1)).rejects.toThrow(
        'You already have an active subscription'
      );
    });

    it('should successfully create order and return safe client payload without exposing secret', async () => {
      vi.mocked(db.subscriptionPlan.findUnique).mockResolvedValueOnce({
        id: 1,
        name: 'Pro Pass',
        price: 999,
        durationDays: 30,
        isActive: true,
        description: 'Test',
        features: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      vi.mocked(db.userSubscription.findFirst).mockResolvedValueOnce(null);
      mockOrdersCreate.mockResolvedValueOnce({
        id: 'order_test_12345',
        amount: 99900,
        currency: 'INR',
      });
      vi.mocked(db.payment.create).mockResolvedValueOnce({
        id: 'pay_1',
        userId: 'user_123',
        amount: 999,
        paymentType: PaymentType.SUBSCRIPTION,
        status: PaymentStatus.PENDING,
        txRef: 'order_test_12345',
        razorpayOrderId: 'order_test_12345',
        razorpayPaymentId: null,
        razorpaySignature: null,
        planId: 1,
        createdAt: new Date(),
      });

      const res = await createRazorpayOrder('user_123', 1);

      expect(res).toEqual({
        orderId: 'order_test_12345',
        amount: 99900,
        currency: 'INR',
        keyId: 'rzp_test_mock_key_id',
      });
      expect((res as Record<string, unknown>).keySecret).toBeUndefined();
      expect(mockOrdersCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 99900,
          currency: 'INR',
        })
      );
    });
  });

  describe('verifyRazorpayPayment', () => {
    const orderId = 'order_test_999';
    const paymentId = 'pay_test_888';
    const secret = 'mock_key_secret_1234567890';

    const validSignature = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    it('should reject invalid Razorpay signature and update payment status to FAILED', async () => {
      vi.mocked(db.payment.findFirst).mockResolvedValueOnce({
        id: 'pay_rec_1',
        userId: 'user_123',
        amount: 999,
        paymentType: PaymentType.SUBSCRIPTION,
        status: PaymentStatus.PENDING,
        txRef: orderId,
        razorpayOrderId: orderId,
        razorpayPaymentId: null,
        razorpaySignature: null,
        planId: 1,
        createdAt: new Date(),
      });

      await expect(
        verifyRazorpayPayment('user_123', orderId, paymentId, 'invalid_signature_hex')
      ).rejects.toThrow('Payment signature verification failed');

      expect(db.payment.update).toHaveBeenCalledWith({
        where: { id: 'pay_rec_1' },
        data: { status: PaymentStatus.FAILED },
      });
    });

    it('should successfully verify payment, activate subscription, and update payment status to SUCCESS', async () => {
      const mockPlan = {
        id: 1,
        name: 'Pro Pass',
        price: 999,
        durationDays: 30,
        isActive: true,
        description: 'Test',
        features: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.payment.findFirst).mockResolvedValueOnce({
        id: 'pay_rec_1',
        userId: 'user_123',
        amount: 999,
        paymentType: PaymentType.SUBSCRIPTION,
        status: PaymentStatus.PENDING,
        txRef: orderId,
        razorpayOrderId: orderId,
        razorpayPaymentId: null,
        razorpaySignature: null,
        planId: 1,
        plan: mockPlan,
        createdAt: new Date(),
      } as any);

      vi.mocked(db.userSubscription.findFirst).mockResolvedValueOnce(null);
      vi.mocked(db.userSubscription.create).mockResolvedValueOnce({
        id: 'sub_101',
        userId: 'user_123',
        planId: 1,
        status: SubscriptionStatus.ACTIVE,
        startDate: new Date(),
        endDate: new Date(),
        transactionReference: paymentId,
        createdAt: new Date(),
        plan: mockPlan,
      });

      const subscription = await verifyRazorpayPayment(
        'user_123',
        orderId,
        paymentId,
        validSignature
      );

      expect(subscription).toBeDefined();
      expect(subscription.status).toBe(SubscriptionStatus.ACTIVE);
      expect(db.payment.update).toHaveBeenCalledWith({
        where: { id: 'pay_rec_1' },
        data: {
          status: PaymentStatus.SUCCESS,
          razorpayPaymentId: paymentId,
          razorpaySignature: validSignature,
        },
      });
    });
  });

  describe('Razorpay Webhook Handler', () => {
    const orderId = 'order_test_999';
    const paymentId = 'pay_test_888';
    const secret = 'mock_webhook_secret_99999';

    const testBody = {
      event: 'order.paid',
      payload: {
        payment: {
          entity: {
            id: paymentId,
            order_id: orderId,
            amount: 99900,
            status: 'captured',
          },
        },
      },
    };

    const validSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(testBody))
      .digest('hex');

    it('should reject webhooks with invalid signatures', async () => {
      const req = {
        method: 'POST',
        headers: {
          'x-razorpay-signature': 'invalid_signature_hex',
        },
        body: testBody,
        rawBody: JSON.stringify(testBody),
      } as any;

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as any;

      await webhookHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Invalid signature' }));
    });

    it('should process success webhooks atomically and idempotently', async () => {
      const mockPlan = {
        id: 1,
        name: 'Pro Pass',
        price: 999,
        durationDays: 30,
      };

      vi.mocked(db.payment.findFirst).mockResolvedValueOnce({
        id: 'pay_rec_1',
        userId: 'user_123',
        amount: 999,
        status: PaymentStatus.PENDING,
        txRef: orderId,
        planId: 1,
        plan: mockPlan,
      } as any);

      const req = {
        method: 'POST',
        headers: {
          'x-razorpay-signature': validSignature,
        },
        body: testBody,
        rawBody: JSON.stringify(testBody),
      } as any;

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as any;

      await webhookHandler(req, res);

      expect(res.status).not.toHaveBeenCalledWith(400);
      expect(res.status).not.toHaveBeenCalledWith(500);

      expect(db.payment.update).toHaveBeenCalledWith({
        where: { id: 'pay_rec_1' },
        data: expect.objectContaining({
          status: PaymentStatus.SUCCESS,
          razorpayPaymentId: paymentId,
        }),
      });
    });
  });
});
