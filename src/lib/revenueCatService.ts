// RevenueCat Service
// Handles RevenueCat integration for cross-platform subscriptions
// Web uses Stripe directly, but RevenueCat syncs mobile purchases

import { supabase } from '@/lib/supabase';

// RevenueCat Public API Key (safe for client-side)
export const REVENUECAT_API_KEY = import.meta.env.VITE_REVENUECAT_API_KEY || 'test_NsbPkLJgEuCyHtnPyWjHwdEFMxz';

// RevenueCat API base URL
const REVENUECAT_API_URL = 'https://api.revenuecat.com/v1';

// Entitlement identifiers (configure these in RevenueCat dashboard)
export const ENTITLEMENTS = {
  PRO: 'pro', // Main pro entitlement
} as const;

// Product identifiers (must match RevenueCat dashboard)
export const PRODUCTS = {
  PRO_MONTHLY: 'paranet_pro_monthly',
  PRO_YEARLY: 'paranet_pro_yearly', // For future use
} as const;

interface CustomerInfo {
  originalAppUserId: string;
  entitlements: {
    active: Record<string, {
      productIdentifier: string;
      expirationDate: string | null;
      isActive: boolean;
    }>;
  };
  activeSubscriptions: string[];
  managementURL: string | null;
}

/**
 * Get or create a RevenueCat customer for the current user
 */
export async function getRevenueCatCustomer(userId: string): Promise<CustomerInfo | null> {
  try {
    const response = await fetch(`${REVENUECAT_API_URL}/subscribers/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${REVENUECAT_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 404) {
      // Customer doesn't exist, create one
      return await createRevenueCatCustomer(userId);
    }

    if (!response.ok) {
      console.error('RevenueCat API error:', response.status);
      return null;
    }

    const data = await response.json();
    return {
      originalAppUserId: data.subscriber.original_app_user_id,
      entitlements: {
        active: data.subscriber.entitlements || {},
      },
      activeSubscriptions: data.subscriber.subscriptions
        ? Object.keys(data.subscriber.subscriptions).filter(
            k => data.subscriber.subscriptions[k].unsubscribe_detected_at === null
          )
        : [],
      managementURL: data.subscriber.management_url,
    };
  } catch (error) {
    console.error('Error fetching RevenueCat customer:', error);
    return null;
  }
}

/**
 * Create a new RevenueCat customer
 */
async function createRevenueCatCustomer(userId: string): Promise<CustomerInfo | null> {
  try {
    const response = await fetch(`${REVENUECAT_API_URL}/subscribers/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${REVENUECAT_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Platform': 'web',
      },
    });

    if (!response.ok) {
      console.error('Error creating RevenueCat customer:', response.status);
      return null;
    }

    const data = await response.json();
    return {
      originalAppUserId: data.subscriber.original_app_user_id,
      entitlements: { active: {} },
      activeSubscriptions: [],
      managementURL: null,
    };
  } catch (error) {
    console.error('Error creating RevenueCat customer:', error);
    return null;
  }
}

/**
 * Check if user has an active pro entitlement
 */
export async function hasProEntitlement(userId: string): Promise<boolean> {
  const customer = await getRevenueCatCustomer(userId);
  if (!customer) return false;

  const proEntitlement = customer.entitlements.active[ENTITLEMENTS.PRO];
  return proEntitlement?.isActive || false;
}

/**
 * Sync RevenueCat subscription status with our database
 * Called by webhook or manually
 */
export async function syncSubscriptionStatus(
  userId: string,
  organizationId: string
): Promise<boolean> {
  try {
    const customer = await getRevenueCatCustomer(userId);
    if (!customer) return false;

    const hasActiveSub = customer.activeSubscriptions.length > 0;
    const proEntitlement = customer.entitlements.active[ENTITLEMENTS.PRO];

    const { error } = await supabase
      .from('organizations')
      .update({
        subscription_status: hasActiveSub ? 'active' : 'free',
        subscription_plan: hasActiveSub ? 'pro' : 'free',
        features_enabled: hasActiveSub
          ? ['video_meetings', 'custom_branding', 'analytics', 'priority_support']
          : [],
        updated_at: new Date().toISOString(),
      })
      .eq('id', organizationId);

    if (error) {
      console.error('Error syncing subscription:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error syncing subscription status:', error);
    return false;
  }
}

/**
 * Get offerings (available products) from RevenueCat
 * Useful for displaying pricing dynamically
 */
export async function getOfferings(): Promise<unknown | null> {
  try {
    // Note: Offerings are typically fetched via the SDK on mobile
    // For web, we use static product configuration
    return {
      current: {
        identifier: 'default',
        availablePackages: [
          {
            identifier: '$rc_monthly',
            product: {
              identifier: PRODUCTS.PRO_MONTHLY,
              priceString: '$0.99',
              price: 0.99,
            },
          },
        ],
      },
    };
  } catch (error) {
    console.error('Error fetching offerings:', error);
    return null;
  }
}

/**
 * Restore purchases - syncs any existing purchases from app stores
 * Primarily used on mobile, but can verify web purchases too
 */
export async function restorePurchases(userId: string): Promise<boolean> {
  const customer = await getRevenueCatCustomer(userId);
  return customer !== null && customer.activeSubscriptions.length > 0;
}

/**
 * Log subscription event for analytics
 */
export async function logRevenueCatEvent(
  organizationId: string,
  eventType: string,
  eventData: Record<string, unknown>
): Promise<void> {
  try {
    await supabase.from('subscription_events').insert({
      organization_id: organizationId,
      event_type: `revenuecat.${eventType}`,
      event_data: eventData,
    });
  } catch (error) {
    console.error('Error logging RevenueCat event:', error);
  }
}
