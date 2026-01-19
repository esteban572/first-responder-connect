// Stripe Webhook Handler
// Handles subscription lifecycle events from Stripe

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@13.10.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return new Response('Missing signature', { status: 400 });
  }

  try {
    const body = await req.text();

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    // Create Supabase admin client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`Processing event: ${event.type}`);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const organizationId = session.metadata?.organization_id;

        if (organizationId && session.subscription) {
          // Get subscription details
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );

          await updateOrganizationSubscription(
            supabase,
            organizationId,
            'active',
            'pro',
            session.customer as string,
            new Date(subscription.current_period_end * 1000).toISOString()
          );

          await logEvent(supabase, organizationId, 'checkout.completed', {
            session_id: session.id,
            subscription_id: subscription.id,
          });
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const organizationId = subscription.metadata?.organization_id;

        if (organizationId) {
          const status = mapStripeStatus(subscription.status);
          const plan = subscription.status === 'active' ? 'pro' : 'free';

          await updateOrganizationSubscription(
            supabase,
            organizationId,
            status,
            plan,
            subscription.customer as string,
            new Date(subscription.current_period_end * 1000).toISOString()
          );

          await logEvent(supabase, organizationId, event.type, {
            subscription_id: subscription.id,
            status: subscription.status,
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const organizationId = subscription.metadata?.organization_id;

        if (organizationId) {
          await updateOrganizationSubscription(
            supabase,
            organizationId,
            'canceled',
            'free'
          );

          await logEvent(supabase, organizationId, 'subscription.canceled', {
            subscription_id: subscription.id,
          });
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const organizationId = subscription.metadata?.organization_id;

          if (organizationId) {
            await updateOrganizationSubscription(
              supabase,
              organizationId,
              'active',
              'pro',
              invoice.customer as string,
              new Date(subscription.current_period_end * 1000).toISOString()
            );

            await logEvent(supabase, organizationId, 'payment.succeeded', {
              invoice_id: invoice.id,
              amount: invoice.amount_paid,
            });
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const organizationId = subscription.metadata?.organization_id;

          if (organizationId) {
            await updateOrganizationSubscription(
              supabase,
              organizationId,
              'past_due',
              'pro' // Keep pro but mark as past_due
            );

            await logEvent(supabase, organizationId, 'payment.failed', {
              invoice_id: invoice.id,
            });
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(`Webhook Error: ${error.message}`, { status: 500 });
  }
});

// Helper function to update organization subscription
async function updateOrganizationSubscription(
  supabase: ReturnType<typeof createClient>,
  organizationId: string,
  status: string,
  plan: string,
  customerId?: string,
  currentPeriodEnd?: string
) {
  const updates: Record<string, unknown> = {
    subscription_status: status,
    subscription_plan: plan,
    updated_at: new Date().toISOString(),
  };

  if (customerId) {
    updates.revenuecat_customer_id = customerId;
  }

  // Update features based on plan
  if (plan === 'pro') {
    updates.features_enabled = [
      'video_meetings',
      'custom_branding',
      'analytics',
      'priority_support',
    ];
    updates.max_members = 50;
  } else {
    updates.features_enabled = [];
    updates.max_members = 5;
  }

  const { error } = await supabase
    .from('organizations')
    .update(updates)
    .eq('id', organizationId);

  if (error) {
    console.error('Error updating organization:', error);
    throw error;
  }

  console.log(`Updated organization ${organizationId} to ${plan} (${status})`);
}

// Helper to log subscription events
async function logEvent(
  supabase: ReturnType<typeof createClient>,
  organizationId: string,
  eventType: string,
  eventData: Record<string, unknown>
) {
  await supabase.from('subscription_events').insert({
    organization_id: organizationId,
    event_type: eventType,
    event_data: eventData,
  });
}

// Map Stripe subscription status to our status
function mapStripeStatus(stripeStatus: string): string {
  switch (stripeStatus) {
    case 'active':
      return 'active';
    case 'trialing':
      return 'trialing';
    case 'past_due':
      return 'past_due';
    case 'canceled':
    case 'unpaid':
    case 'incomplete_expired':
      return 'canceled';
    default:
      return 'free';
  }
}
