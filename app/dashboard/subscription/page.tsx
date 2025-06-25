'use client';

import React, { useState, useEffect } from 'react';
import { FiCheck, FiStar, FiMail, FiArrowRight } from 'react-icons/fi';
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
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-gray-800 border-t-transparent rounded-full animate-spin absolute top-0"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Premium Header */}
      <div className="mb-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-4xl font-semibold text-gray-900 mb-4">Subscription</h1>
          
          {/* Current Plan Status */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Current Plan</h2>
            <p className="text-gray-600">
              You are currently on the <span className="font-semibold text-gray-900">{plans.find(p => p.id === currentPlan)?.name || 'Free'}</span> plan.
            </p>
          </div>
        </div>
      </div>
      
      {/* Pricing Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {plans.map((plan) => {
          const isCurrentPlan = plan.id === currentPlan;
          
          return (
            <div 
              key={plan.id}
              className={`bg-white rounded-2xl shadow-sm border transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1 group ${
                plan.isPopular 
                  ? 'border-gray-300 relative' 
                  : 'border-gray-200'
              }`}
            >
              {/* Popular Badge */}
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gray-700 text-white px-4 py-1 rounded-lg text-xs font-medium">
                    Most Popular
                  </div>
                </div>
              )}
              
              <div className="p-8">
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                  
                  <div className="mb-6">
                    <span className="text-5xl font-semibold text-gray-900">${plan.price}</span>
                    <span className="text-lg text-gray-500">/{plan.interval}</span>
                  </div>
                </div>
                
                {/* Features List */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-5 h-5 bg-gray-100 rounded-lg flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                        <FiCheck className="h-3 w-3 text-gray-600" />
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {/* Action Button */}
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isCurrentPlan || processingPayment}
                  className={`w-full py-4 px-6 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 group-hover:scale-105 ${
                    isCurrentPlan
                      ? 'bg-gray-100 text-gray-500 cursor-default'
                      : plan.isPopular
                        ? 'bg-gray-900 hover:bg-gray-800 text-white shadow-lg hover:shadow-xl'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                >
                  {processingPayment ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : isCurrentPlan ? (
                    'Current Plan'
                  ) : (
                    <>
                      Subscribe to {plan.name}
                      <FiArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Enterprise Contact */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center flex-shrink-0">
            <FiMail className="h-6 w-6 text-gray-600" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Need a custom plan?</h3>
            <p className="text-gray-600 mb-4">
              Contact our sales team for custom enterprise solutions tailored to your business needs.
            </p>
            
            <a 
              href="mailto:tucker@carlileadvisors.com" 
              className="inline-flex items-center gap-2 text-gray-900 font-medium hover:text-gray-700 transition-colors group"
            >
              <FiMail className="h-4 w-4" />
              tucker@carlileadvisors.com
              <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
