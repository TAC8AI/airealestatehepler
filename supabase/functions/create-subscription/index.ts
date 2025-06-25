import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Stripe price IDs for your plans
const STRIPE_PRICE_IDS = {
  'pro': 'price_1RdXAeP39gdAeIfcrTV2f0nx',
  'business': 'price_1RdXMuP39gdAeIfcTgZx2eag'
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get user from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Invalid user token');
    }

    // Parse request body
    const { planId } = await req.json();

    // Handle free plan - update directly
    if (planId === 'free') {
      // Create or update subscription record
      const { error } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: user.id,
          plan_id: 'free',
          status: 'active',
          start_date: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        throw new Error(`Failed to update subscription: ${error.message}`);
      }

      return new Response(
        JSON.stringify({ success: true, planId: 'free' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // For paid plans, create Stripe checkout session
    const stripeSecretKey = Deno.env.get('Stripe Key'); // Fixed to match your Supabase Secret name
    if (!stripeSecretKey) {
      throw new Error('Stripe secret key not configured');
    }

    const priceId = STRIPE_PRICE_IDS[planId];
    if (!priceId) {
      throw new Error(`Invalid plan ID: ${planId}`);
    }

    // Create Stripe checkout session
    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'payment_method_types[]': 'card',
        'line_items[0][price]': priceId,
        'line_items[0][quantity]': '1',
        'mode': 'subscription',
        'success_url': `${req.headers.get('origin')}/dashboard/subscription?success=true`,
        'cancel_url': `${req.headers.get('origin')}/dashboard/subscription?canceled=true`,
        'client_reference_id': user.id,
        'customer_email': user.email,
      }),
    });

    if (!stripeResponse.ok) {
      const errorText = await stripeResponse.text();
      throw new Error(`Stripe error: ${errorText}`);
    }

    const session = await stripeResponse.json();

    // Store pending subscription
    const { error: dbError } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: user.id,
        plan_id: planId,
        status: 'pending',
        stripe_session_id: session.id,
        start_date: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (dbError) {
      console.error('Database error:', dbError);
      // Don't throw here - let Stripe session proceed
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        checkoutUrl: session.url 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ Subscription creation error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
}); 