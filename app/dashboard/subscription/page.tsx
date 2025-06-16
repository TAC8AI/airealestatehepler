'use client';

import React, { useState, useEffect } from 'react';
import { FiCheck } from 'react-icons/fi';
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
        '5 Listings per month',
        '3 Contract analyses per month',
        'Basic social media templates',
        'Email support'
      ]
    },
    {
      id: 'pro',
      name: 'Professional',
      price: 29,
      interval: 'month',
      features: [
        'Unlimited listings',
        '20 Contract analyses per month',
        'Advanced social media templates',
        'Priority email support',
        'Custom branding'
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
        'Premium social media templates',
        'Priority phone support',
        'Custom branding',
        'Team accounts (up to 5)',
        'API access'
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
    
    // Simulate payment processing
    setTimeout(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          return;
        }
        
        // Update subscription in database
        const { error } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: session.user.id,
            plan_id: planId,
            status: 'active',
            start_date: new Date().toISOString(),
            // In a real app, you would include more details like payment info, end date, etc.
          });
        
        if (error) {
          console.error('Error updating subscription:', error);
          alert('Failed to update subscription. Please try again.');
        } else {
          setCurrentPlan(planId);
        }
      } catch (error) {
        console.error('Error processing subscription:', error);
        alert('An unexpected error occurred. Please try again.');
      } finally {
        setProcessingPayment(false);
      }
    }, 1500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Subscription</h1>
      
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-2">Current Plan</h2>
        <p className="text-secondary-600">
          You are currently on the <span className="font-medium">{plans.find(p => p.id === currentPlan)?.name || 'Free'}</span> plan.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = plan.id === currentPlan;
          
          return (
            <div 
              key={plan.id}
              className={`border rounded-lg overflow-hidden ${
                plan.isPopular 
                  ? 'border-primary-500 shadow-sm' 
                  : 'border-secondary-200'
              }`}
            >
              {plan.isPopular && (
                <div className="bg-primary-500 text-white text-center py-1 text-sm font-medium">
                  Most Popular
                </div>
              )}
              
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                
                <div className="mb-4">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="text-secondary-500">/{plan.interval}</span>
                </div>
                
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <FiCheck className="text-primary-500 mt-1 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isCurrentPlan || processingPayment}
                  className={`w-full py-2 px-4 rounded-md transition-colors ${
                    isCurrentPlan
                      ? 'bg-secondary-100 text-secondary-800 cursor-default'
                      : plan.isPopular
                        ? 'bg-primary-600 hover:bg-primary-700 text-white'
                        : 'bg-secondary-200 hover:bg-secondary-300 text-secondary-800'
                  }`}
                >
                  {isCurrentPlan ? 'Current Plan' : `Subscribe to ${plan.name}`}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-8 p-4 bg-secondary-50 rounded-md border border-secondary-200">
        <h3 className="font-medium mb-2">Need a custom plan?</h3>
        <p className="text-secondary-600 text-sm">
          Contact our sales team at <a href="mailto:sales@airealestate.com" className="text-primary-600 hover:underline">sales@airealestate.com</a> for custom enterprise solutions tailored to your business needs.
        </p>
      </div>
    </div>
  );
}
