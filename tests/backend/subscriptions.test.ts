import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import crypto from 'crypto';
import { SubscriptionStatus, PaymentStatus, PaymentType } from '@prisma/client';

// Mock DB
vi.mock('../../api/utils/db.js', () => {
  return {
    db: {
      subscriptionPlan: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      userSubscription: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      payment: {
        create: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
      },
    },
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

import { db } from '../../api/utils/db.js';
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from '../../api/services/subscriptionService.js';

describe('Razorpay Payment Flow Integration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = {
      ...originalEnv,
      RAZORPAY_KEY_ID: 'rzp_test_mock_key_id',
      RAZORPAY_KEY_SECRET: 'mock_key_secret_1234567890',
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
      vi.mocked(db.userSubscription.findMany).mockResolvedValueOnce([]);

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
      vi.mocked(db.userSubscription.findMany).mockResolvedValueOnce([
        {
          id: 10,
          userId: 'user_123',
          planId: 1,
          status: SubscriptionStatus.ACTIVE,
          startDate: new Date(),
          endDate: futureDate,
          transactionReference: 'tx_123',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

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
      vi.mocked(db.userSubscription.findMany).mockResolvedValueOnce([]);
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
        updatedAt: new Date(),
      });

      const res = await createRazorpayOrder('user_123', 1);

      expect(res).toEqual({
        orderId: 'order_test_12345',
        amount: 99900,
        currency: 'INR',
        keyId: 'rzp_test_mock_key_id',
      });
      // Ensure secret is never returned in client payload
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

    // Generate valid signature using HMAC SHA256
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
        updatedAt: new Date(),
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
        updatedAt: new Date(),
      } as any);

      vi.mocked(db.userSubscription.findMany).mockResolvedValueOnce([]);
      vi.mocked(db.userSubscription.create).mockResolvedValueOnce({
        id: 101,
        userId: 'user_123',
        planId: 1,
        status: SubscriptionStatus.ACTIVE,
        startDate: new Date(),
        endDate: new Date(),
        transactionReference: paymentId,
        createdAt: new Date(),
        updatedAt: new Date(),
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
});
