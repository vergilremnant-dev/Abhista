import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscriptionApi } from '../services/subscription/subscriptionService';
import { useAuth } from '../hooks/auth/useAuth';
import { AuthChallengeModal } from '../components/auth/AuthChallengeModal';
import { BRAND } from '../config/branding';
import type { SubscriptionPlan } from '../types/subscription/subscriptionTypes';

export function SubscriptionsPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Authentication interceptor states
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingPlanId, setPendingPlanId] = useState<number | null>(null);

  useEffect(() => {
    async function loadPlans() {
      try {
        setLoading(true);
        const list = await subscriptionApi.listPlans();
        setPlans(list);
      } catch {
        setError('Failed to load subscription plans.');
      } finally {
        setLoading(false);
      }
    }
    loadPlans();
  }, []);

  interface RazorpaySuccessResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }

  interface RazorpayFailureResponse {
    error: {
      code?: string;
      description?: string;
      source?: string;
      step?: string;
      reason?: string;
    };
  }

  interface RazorpayInstance {
    open: () => void;
    on: (event: string, handler: (response: RazorpayFailureResponse) => void) => void;
  }

  interface RazorpayConstructor {
    new (options: Record<string, unknown>): RazorpayInstance;
  }

  function loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      const win = window as unknown as { Razorpay?: RazorpayConstructor };
      if (win.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  async function handlePurchase(planId: number) {
    if (!isAuthenticated) {
      setPendingPlanId(planId);
      setIsAuthModalOpen(true);
      return;
    }

    if (user?.role !== 'ROLE_CUSTOMER') {
      setError('Only customers can purchase subscription passes.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccessMsg('');

      // 1. Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        throw new Error('Failed to load Razorpay SDK. Please check your internet connection.');
      }

      // 2. Create Razorpay order on backend
      const orderData = await subscriptionApi.createRazorpayOrder(planId);

      // 3. Open Razorpay checkout modal
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'DBC Abhista',
        description: 'Premium Subscription Pass',
        order_id: orderData.orderId,
        handler: async function (response: RazorpaySuccessResponse) {
          try {
            setLoading(true);
            setError('');
            
            // 4. Verify payment on backend
            await subscriptionApi.verifyRazorpayPayment(
              orderData.orderId,
              response.razorpay_payment_id,
              response.razorpay_signature
            );

            setSuccessMsg(`Subscription purchased successfully! Welcome to ${BRAND.name} Premium.`);
            setTimeout(() => navigate('/workspace/overview'), 1500);
          } catch (err: unknown) {
            const apiError = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setError(apiError || (err instanceof Error ? err.message : 'Payment verification failed.'));
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          email: user?.email || '',
          contact: user?.phone || '',
        },
        theme: {
          color: '#047857', // emerald-700
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const win = window as unknown as { Razorpay: RazorpayConstructor };
      const rzp = new win.Razorpay(options);
      rzp.on('payment.failed', function (response: RazorpayFailureResponse) {
        setError(response.error.description || 'Payment failed.');
        setLoading(false);
      });
      rzp.open();
    } catch (err: unknown) {
      const apiError = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(apiError || (err instanceof Error ? err.message : 'Subscription purchase initialization failed.'));
      setLoading(false);
    }
  }

  return (
    <div className="bg-warm-cream text-stone-950 font-sans flex flex-col">

      <main className="mx-auto max-w-4xl w-full px-4 py-16 sm:px-6 space-y-12 flex-1">
        
        {/* Banner */}
        <div className="text-center space-y-4 max-w-xl mx-auto">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
            Premium Marketplace Access
          </span>
          <h1 className="text-3xl font-extrabold text-stone-900 font-serif sm:text-5xl leading-tight">
            Unlock Expert Capabilities
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 leading-relaxed font-medium">
            Get direct WhatsApp contact links, reveal verified partner phone numbers, and book design consultation appointments with industry experts.
          </p>
        </div>

        {/* Message Alerts */}
        {error && <div className="rounded-lg bg-red-50 border border-red-100 p-4 text-xs font-semibold text-red-700">{error}</div>}
        {successMsg && <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-4 text-xs font-semibold text-emerald-800">{successMsg}</div>}

        {/* Plans Grid */}
        {loading && plans.length === 0 ? (
  <div className="text-center py-12 text-stone-400 text-xs animate-pulse">
    Loading plans table...
  </div>
) : (
  <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
    {plans.map((p) => {
      const isAbhista =
        p.name.toLowerCase().includes("abhista");

      const isConsultant =
        p.name.toLowerCase().includes("consult");

      return (
        <div
          key={p.id}
          className="rounded-2xl border border-emerald-500 ring-2 ring-emerald-500/10 bg-white p-6 sm:p-8 flex flex-col justify-between shadow-sm transition duration-300 hover:shadow-lg hover:-translate-y-1"
        >
          <div className="space-y-5">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-bold text-stone-900 font-serif">
                {p.name}
              </h3>

              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-800 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-full">
                Recommended
              </span>
            </div>

            {/* PRICE */}

            <div className="space-y-1">

              {isAbhista && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-sm line-through text-stone-400 font-semibold">
                      ₹999
                    </span>

                    <span className="bg-red-100 text-red-700 text-[10px] font-bold rounded-full px-2 py-0.5">
                      70% OFF
                    </span>
                  </div>

                  <div className="text-4xl font-black text-emerald-700 font-serif">
                    ₹299
                  </div>
                </>
              )}

              {isConsultant && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-sm line-through text-stone-400 font-semibold">
                      ₹4,999
                    </span>

                    <span className="bg-red-100 text-red-700 text-[10px] font-bold rounded-full px-2 py-0.5">
                      50% OFF
                    </span>
                  </div>

                  <div className="text-4xl font-black text-emerald-700 font-serif">
                    ₹2,499
                  </div>
                </>
              )}

            </div>

            <p className="text-xs text-stone-500 leading-relaxed">
              {p.description ||
                "Unlock premium construction platform benefits."}
            </p>

            {/* FEATURES */}

            <ul className="text-[11px] font-semibold text-stone-700 space-y-3 pt-5 border-t border-stone-100">

              <li className="flex items-start gap-2">
                <span className="text-emerald-600 mt-0.5">✓</span>
                Browse verified providers & portfolios
              </li>

              <li className="flex items-start gap-2">
                <span className="text-emerald-600 mt-0.5">✓</span>
                Submit service request bookings
              </li>

              <li className="flex items-start gap-2">
                <span className="text-emerald-600 mt-0.5">✓</span>

                <span>
                  Unmask the customer contact number for direct coordination
                  between the customer and the service provider.
                </span>
              </li>

              <li className="flex items-start gap-2">
                <span className="text-emerald-600 mt-0.5">✓</span>

                Open WhatsApp chat for seamless communication.
              </li>

              <li className="flex items-start gap-2">
                <span className="text-emerald-600 mt-0.5">✓</span>

                <span>
                  {isAbhista
                    ? "Digital Vastu Consultation with an experienced Vastu Consultant."
                    : "On-site Vastu Consultation where a Vastu Consultant visits your project location for discussion and guidance."}
                </span>
              </li>

            </ul>
          </div>

          <div className="mt-8">

            <button
              onClick={() => handlePurchase(p.id)}
              disabled={loading}
              className="w-full rounded-lg py-3 text-sm font-bold transition shadow-sm bg-emerald-700 hover:bg-emerald-800 text-white"
            >
              Purchase Plan
            </button>

          </div>
        </div>
      );
    })}
  </div>
)}

      </main>

      {/* Auth Modal Challenge */}
      <AuthChallengeModal
        isOpen={isAuthModalOpen}
        message="You must be signed in to purchase a premium subscription plan."
        onClose={() => {
          setIsAuthModalOpen(false);
          setPendingPlanId(null);
        }}
        onSuccess={() => {
          setIsAuthModalOpen(false);
          if (pendingPlanId) {
            handlePurchase(pendingPlanId);
            setPendingPlanId(null);
          }
        }}
      />
    </div>
  );
}
