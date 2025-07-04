'use client';

import React, { useState, useEffect } from 'react';
import { FiCheck, FiStar, FiMail, FiArrowRight, FiCreditCard, FiUsers, FiZap, FiShield } from 'react-icons/fi';
import { supabase } from '../../../lib/supabase';

interface Plan {
  id: string;
  name: string;
  price: number;
  interval: string;
  features: string[];
  isPopular?: boolean;
}

export default function Subscription() {
  const [user, setUser] = useState<any>(null);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  const plans: Plan[] = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      interval: 'month',
      features: [
        '1 Listing per month',
        '1 Contract analysis per month',
        '1 Property valuation per month',
        'Email support'
      ]
    },
    {
      id: 'pro',
      name: 'Professional',
      price: 29,
      interval: 'month',
      features: [
        '5 Listings per month',
        '5 Contract analyses per month',
        '5 Property valuations per month',
        'Priority support'
      ],
      isPopular: true
    },
    {
      id: 'business',
      name: 'Business',
      price: 79,
      interval: 'month',
      features: [
        'Unlimited listings',
        'Unlimited contract analyses',
        'Unlimited property valuations',
        'Priority support',
        'One-on-one meetings'
      ]
    }
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          return;
        }
        
        setUser(session.user);
        
        // Fetch user's subscription
        const { data, error } = await supabase
          .from('subscriptions')
          .select('plan_id')
          .eq('user_id', session.user.id)
          .maybeSingle();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
          console.error('Error fetching subscription:', error);
        } else if (data) {
          setCurrentPlan(data.plan_id);
        } else {
          setCurrentPlan('free'); // Default to free plan
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  const handleSubscribe = async (planId: string) => {
    if (planId === currentPlan) return;
    
    setProcessingPayment(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert('Please log in to subscribe');
        return;
      }

      // Call the edge function instead of direct database update
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-subscription`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create subscription');
      }

      // If it's a free plan, update locally
      if (planId === 'free') {
        setCurrentPlan(planId);
        alert('Successfully switched to free plan!');
      } else {
        // For paid plans, redirect to Stripe checkout
        if (result.checkoutUrl) {
          window.location.href = result.checkoutUrl;
        } else {
          throw new Error('No checkout URL received');
        }
      }

    } catch (error) {
      console.error('Error processing subscription:', error);
      alert(`Failed to process subscription: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="relative z-10 flex items-center justify-center h-screen">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-white/10 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin absolute top-0"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-8">
        {/* Premium Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm border border-white/10 rounded-xl">
              <FiCreditCard className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent tracking-tight">
                Subscription
              </h1>
              <p className="text-lg text-gray-400 mt-1">Choose the perfect plan for your real estate business</p>
            </div>
          </div>
          
          {/* Current Plan Status */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <FiShield className="h-5 w-5 text-green-400" />
              <h2 className="text-lg font-medium text-white">Current Plan</h2>
            </div>
            <p className="text-gray-400">
              You are currently on the <span className="font-semibold text-white">{plans.find(p => p.id === currentPlan)?.name || 'Free'}</span> plan.
            </p>
          </div>
        </div>
        
        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => {
            const isCurrentPlan = plan.id === currentPlan;
            
            return (
              <div 
                key={plan.id}
                className={`bg-white/5 backdrop-blur-sm border rounded-3xl p-8 shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-3xl group relative ${
                  plan.isPopular 
                    ? 'border-blue-400/50 bg-gradient-to-b from-blue-500/10 to-purple-500/10' 
                    : 'border-white/10 hover:border-white/20'
                } ${isCurrentPlan ? 'ring-2 ring-green-400/50' : ''}`}
              >
                {/* Popular Badge */}
                {plan.isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-full text-sm font-medium shadow-lg backdrop-blur-sm border border-white/20">
                      <div className="flex items-center gap-2">
                        <FiStar className="h-4 w-4" />
                        Most Popular
                      </div>
                    </div>
                  </div>
                )}

                {/* Current Plan Badge */}
                {isCurrentPlan && (
                  <div className="absolute -top-4 right-4">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg backdrop-blur-sm border border-white/20">
                      <div className="flex items-center gap-2">
                        <FiCheck className="h-4 w-4" />
                        Current
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1 mb-4">
                    <span className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      ${plan.price}
                    </span>
                    <span className="text-gray-400">/{plan.interval}</span>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-5 h-5 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center">
                        <FiCheck className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={processingPayment || isCurrentPlan}
                  className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:scale-100 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl backdrop-blur-sm border ${
                    isCurrentPlan
                      ? 'bg-green-500/20 border-green-400/50 text-green-300 cursor-default'
                      : plan.isPopular
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 border-white/20 text-white'
                      : 'bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 border-white/10 text-white'
                  } ${processingPayment && !isCurrentPlan ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {processingPayment && !isCurrentPlan ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : isCurrentPlan ? (
                    <>
                      <FiCheck className="h-5 w-5" />
                      Current Plan
                    </>
                  ) : (
                    <>
                      {plan.price === 0 ? (
                        <>
                          <FiUsers className="h-5 w-5" />
                          Get Started
                        </>
                      ) : (
                        <>
                          <FiZap className="h-5 w-5" />
                          Upgrade Now
                        </>
                      )}
                      <FiArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* FAQ or Benefits */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <FiMail className="h-5 w-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Need Help?</h3>
            </div>
            <p className="text-gray-400 mb-4">
              Have questions about our plans? We're here to help you choose the right solution for your business.
            </p>
            <a 
              href="mailto:tucker@carlileadvisors.com"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <FiMail className="h-4 w-4" />
              Contact Support
            </a>
          </div>

          {/* Security */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <FiShield className="h-5 w-5 text-green-400" />
              <h3 className="text-lg font-semibold text-white">Secure & Reliable</h3>
            </div>
            <p className="text-gray-400 mb-4">
              Your data is protected with enterprise-grade security. Cancel anytime with no hidden fees.
            </p>
            <div className="flex items-center gap-2 text-green-400">
              <FiShield className="h-4 w-4" />
              <span className="text-sm">256-bit SSL encryption</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
