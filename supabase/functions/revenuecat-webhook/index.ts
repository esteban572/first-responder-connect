// RevenueCat Webhook Handler
// Syncs subscription status from RevenueCat to Supabase

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// RevenueCat event types we care about
const SUBSCRIPTION_EVENTS = [
  'INITIAL_PURCHASE',
  'RENEWAL',
  'CANCELLATION',
  'UNCANCELLATION',
  'EXPIRATION',
  'BILLING_ISSUE',
  'PRODUCT_CHANGE',
  'TRANSFER',
];

// Map RevenueCat product IDs to our subscription plans
const PRODUCT_TO_PLAN: Record<string, string> = {
  'paranet_starter_monthly': 'starter',
  'paranet_starter_annual': 'starter',
  'paranet_pro_monthly': 'pro',
  'paranet_pro_annual': 'pro',
  'paranet_enterprise_monthly': 'enterprise',
  'paranet_enterprise_annual': 'enterprise',
};

// Plan limits
const PLAN_LIMITS: Record<string, { maxMembers: number; features: string[] }> = {
  free: { maxMembers: 5, features: [] },
  starter: { maxMembers: 15, features: ['video_meetings', 'events'] },
  pro: { maxMembers: 50, features: ['video_meetings', 'events', 'analytics', 'custom_branding'] },
  enterprise: { maxMembers: 1000, features: ['video_meetings', 'events', 'analytics', 'custom_branding', 'api_access', 'sso', 'priority_support'] },
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify RevenueCat webhook signature (optional but recommended)
    const authHeader = req.headers.get('Authorization');
    const expectedAuth = Deno.env.get('REVENUECAT_WEBHOOK_AUTH');

    if (expectedAuth && authHeader !== `Bearer ${expectedAuth}`) {
      console.error('Invalid webhook authorization');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const event = await req.json();
    console.log('RevenueCat event:', JSON.stringify(event, null, 2));

    // Extract event data
    const eventType = event.event?.type;
    const appUserId = event.event?.app_user_id;
    const productId = event.event?.product_id;
    const entitlements = event.event?.entitlements || {};

    if (!eventType || !appUserId) {
      console.error('Missing event type or app user ID');
      return new Response(JSON.stringify({ error: 'Invalid event data' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Only process subscription events
    if (!SUBSCRIPTION_EVENTS.includes(eventType)) {
      console.log('Ignoring non-subscription event:', eventType);
      return new Response(JSON.stringify({ status: 'ignored' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Determine subscription status from entitlements
    // RevenueCat sends entitlements object with is_active boolean
    const isActive = Object.values(entitlements).some(
      (ent: any) => ent.is_active === true
    );

    // Determine plan from product ID
    const plan = PRODUCT_TO_PLAN[productId] || 'free';
    const planLimits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;

    // Determine status based on event type
    let subscriptionStatus = 'free';
    if (isActive) {
      subscriptionStatus = 'active';
    } else {
      switch (eventType) {
        case 'CANCELLATION':
          subscriptionStatus = 'canceled';
          break;
        case 'BILLING_ISSUE':
          subscriptionStatus = 'past_due';
          break;
        case 'EXPIRATION':
          subscriptionStatus = 'free';
          break;
        default:
          subscriptionStatus = isActive ? 'active' : 'free';
      }
    }

    console.log(`Processing: user=${appUserId}, event=${eventType}, status=${subscriptionStatus}, plan=${plan}`);

    // Update organization by owner_id (app_user_id should be Supabase user ID)
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .update({
        subscription_status: subscriptionStatus,
        subscription_plan: plan,
        max_members: planLimits.maxMembers,
        features_enabled: planLimits.features,
        revenuecat_customer_id: event.event?.subscriber_id,
        updated_at: new Date().toISOString(),
      })
      .eq('owner_id', appUserId)
      .select()
      .single();

    if (orgError) {
      console.error('Error updating organization:', orgError);

      // If org not found, maybe try by revenuecat_customer_id
      if (event.event?.subscriber_id) {
        const { error: retryError } = await supabase
          .from('organizations')
          .update({
            subscription_status: subscriptionStatus,
            subscription_plan: plan,
            max_members: planLimits.maxMembers,
            features_enabled: planLimits.features,
            updated_at: new Date().toISOString(),
          })
          .eq('revenuecat_customer_id', event.event.subscriber_id);

        if (retryError) {
          console.error('Retry error:', retryError);
        }
      }
    }

    // Log the subscription event
    const { error: logError } = await supabase
      .from('subscription_events')
      .insert({
        organization_id: org?.id,
        event_type: eventType,
        product_id: productId,
        entitlement_id: Object.keys(entitlements)[0] || null,
        revenue_cat_event_id: event.event?.id,
        event_data: event.event,
      });

    if (logError) {
      console.error('Error logging event:', logError);
    }

    return new Response(
      JSON.stringify({
        status: 'success',
        subscription_status: subscriptionStatus,
        plan: plan,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
