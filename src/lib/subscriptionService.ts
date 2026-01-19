// Subscription Service Layer
// Handles Stripe checkout and subscription management

import { supabase } from '@/lib/supabase';

// Product configuration - $0.99 to unlock all features
export const PRODUCTS = {
  pro_monthly: {
    id: 'pro_monthly',
    name: 'ParaNet Pro',
    description: 'Unlock all features',
    price: 99, // cents
    priceDisplay: '$0.99',
    interval: 'month' as const,
    features: [
      'Unlimited video meetings',
      'Priority support',
      'Custom branding',
      'Advanced analytics',
      'API access',
    ],
  },
} as const;

export type ProductId = keyof typeof PRODUCTS;

// Create a Stripe checkout session
export async function createCheckoutSession(
  organizationId: string,
  productId: ProductId,
  successUrl: string,
  cancelUrl: string
): Promise<{ url: string | null; error: string | null }> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { url: null, error: 'Not authenticated' };
    }

    // Call our edge function to create a checkout session
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          organizationId,
          productId,
          successUrl,
          cancelUrl,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return { url: null, error: error.message || 'Failed to create checkout' };
    }

    const data = await response.json();
    return { url: data.url, error: null };
  } catch (err) {
    console.error('Error creating checkout:', err);
    return { url: null, error: 'Failed to create checkout session' };
  }
}

// Create a Stripe billing portal session (for managing subscription)
export async function createBillingPortalSession(
  organizationId: string,
  returnUrl: string
): Promise<{ url: string | null; error: string | null }> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { url: null, error: 'Not authenticated' };
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/billing-portal`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          organizationId,
          returnUrl,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return { url: null, error: error.message || 'Failed to open billing portal' };
    }

    const data = await response.json();
    return { url: data.url, error: null };
  } catch (err) {
    console.error('Error opening billing portal:', err);
    return { url: null, error: 'Failed to open billing portal' };
  }
}

// Get subscription status for an organization
export async function getSubscriptionStatus(organizationId: string): Promise<{
  isActive: boolean;
  plan: string;
  status: string;
  currentPeriodEnd?: string;
} | null> {
  const { data, error } = await supabase
    .from('organizations')
    .select('subscription_status, subscription_plan, settings')
    .eq('id', organizationId)
    .single();

  if (error || !data) {
    console.error('Error fetching subscription:', error);
    return null;
  }

  const isActive = data.subscription_status === 'active' || data.subscription_status === 'trialing';

  return {
    isActive,
    plan: data.subscription_plan,
    status: data.subscription_status,
    currentPeriodEnd: (data.settings as Record<string, unknown>)?.current_period_end as string | undefined,
  };
}

// Update subscription status (called by webhook)
export async function updateSubscriptionStatus(
  organizationId: string,
  status: 'active' | 'canceled' | 'past_due' | 'free',
  plan: string,
  stripeCustomerId?: string,
  currentPeriodEnd?: string
): Promise<boolean> {
  const updates: Record<string, unknown> = {
    subscription_status: status,
    subscription_plan: plan,
  };

  if (stripeCustomerId) {
    updates.revenuecat_customer_id = stripeCustomerId; // Using this field for Stripe customer ID too
  }

  if (currentPeriodEnd) {
    updates.settings = supabase.rpc('jsonb_set_key', {
      target: 'settings',
      key: 'current_period_end',
      value: currentPeriodEnd,
    });
  }

  const { error } = await supabase
    .from('organizations')
    .update(updates)
    .eq('id', organizationId);

  if (error) {
    console.error('Error updating subscription:', error);
    return false;
  }

  return true;
}

// Log subscription event
export async function logSubscriptionEvent(
  organizationId: string,
  eventType: string,
  eventData: Record<string, unknown>
): Promise<void> {
  await supabase
    .from('subscription_events')
    .insert({
      organization_id: organizationId,
      event_type: eventType,
      event_data: eventData,
    });
}
