// Billing & Subscription Page
// Upgrade to Pro or manage existing subscription

import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  PRODUCTS,
  createCheckoutSession,
  createBillingPortalSession,
} from '@/lib/subscriptionService';
import {
  Check,
  Loader2,
  CreditCard,
  Sparkles,
  Video,
  Users,
  Palette,
  BarChart3,
  Zap,
  Shield,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function Billing() {
  const { user } = useAuth();
  const { organization, isSubscribed, subscriptionPlan, isOwner } = useOrganization();
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  const product = PRODUCTS.pro_monthly;

  const handleUpgrade = async () => {
    if (!organization) {
      toast.error('Please create an organization first');
      return;
    }

    if (!isOwner) {
      toast.error('Only organization owners can manage billing');
      return;
    }

    setLoading(true);

    const { url, error } = await createCheckoutSession(
      organization.id,
      'pro_monthly',
      `${window.location.origin}/billing?success=true`,
      `${window.location.origin}/billing?canceled=true`
    );

    setLoading(false);

    if (error) {
      toast.error(error);
      return;
    }

    if (url) {
      window.location.href = url;
    }
  };

  const handleManageBilling = async () => {
    if (!organization) return;

    setPortalLoading(true);

    const { url, error } = await createBillingPortalSession(
      organization.id,
      `${window.location.origin}/billing`
    );

    setPortalLoading(false);

    if (error) {
      toast.error(error);
      return;
    }

    if (url) {
      window.location.href = url;
    }
  };

  // Check for success/cancel URL params
  const urlParams = new URLSearchParams(window.location.search);
  const isSuccess = urlParams.get('success') === 'true';
  const isCanceled = urlParams.get('canceled') === 'true';

  if (!organization) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto py-12 px-4">
          <div className="feed-card p-8 text-center">
            <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">No Organization</h2>
            <p className="text-muted-foreground mb-6">
              Create or join an organization to manage billing.
            </p>
            <Link to="/organization/setup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto py-6 px-4">
        {/* Success Message */}
        {isSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-800">Payment Successful!</h3>
                <p className="text-sm text-green-700">
                  Welcome to ParaNet Pro! All features are now unlocked.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Canceled Message */}
        {isCanceled && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              Payment was canceled. No charges were made.
            </p>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold font-display mb-2">Billing & Subscription</h1>
          <p className="text-muted-foreground">
            {isSubscribed
              ? 'Manage your subscription and billing details'
              : 'Upgrade to unlock all features'}
          </p>
        </div>

        {/* Current Plan */}
        {isSubscribed ? (
          <div className="feed-card p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">ParaNet Pro</h3>
                  <p className="text-sm text-muted-foreground">
                    All features unlocked
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">$0.99</div>
                <div className="text-sm text-muted-foreground">/month</div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  Active
                </span>
              </div>
              <Button
                variant="outline"
                onClick={handleManageBilling}
                disabled={portalLoading}
              >
                {portalLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CreditCard className="h-4 w-4 mr-2" />
                )}
                Manage Billing
              </Button>
            </div>
          </div>
        ) : (
          /* Pricing Card */
          <div className="feed-card overflow-hidden mb-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5" />
                <span className="text-sm font-medium opacity-90">RECOMMENDED</span>
              </div>
              <h2 className="text-2xl font-bold mb-1">{product.name}</h2>
              <p className="opacity-90">{product.description}</p>
            </div>

            {/* Price */}
            <div className="p-6 border-b">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">{product.priceDisplay}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Cancel anytime. No questions asked.
              </p>
            </div>

            {/* Features */}
            <div className="p-6">
              <h4 className="font-semibold mb-4">Everything you need:</h4>
              <ul className="space-y-3">
                <FeatureItem icon={Video} text="Unlimited video meetings" />
                <FeatureItem icon={Users} text="Unlimited team members" />
                <FeatureItem icon={Palette} text="Custom branding & colors" />
                <FeatureItem icon={BarChart3} text="Advanced analytics" />
                <FeatureItem icon={Zap} text="Priority support" />
                <FeatureItem icon={Shield} text="Enhanced security" />
              </ul>
            </div>

            {/* CTA */}
            <div className="p-6 bg-gray-50">
              <Button
                className="w-full gap-2"
                size="lg"
                onClick={handleUpgrade}
                disabled={loading || !isOwner}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Upgrade Now
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
              {!isOwner && (
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Only organization owners can upgrade
                </p>
              )}
              <p className="text-xs text-center text-muted-foreground mt-2">
                Secure payment powered by Stripe
              </p>
            </div>
          </div>
        )}

        {/* FAQ */}
        <div className="feed-card p-6">
          <h3 className="font-semibold mb-4">Frequently Asked Questions</h3>
          <div className="space-y-4">
            <FaqItem
              question="Can I cancel anytime?"
              answer="Yes! You can cancel your subscription at any time. You'll continue to have access until the end of your billing period."
            />
            <FaqItem
              question="What payment methods do you accept?"
              answer="We accept all major credit cards (Visa, Mastercard, American Express) through our secure payment processor, Stripe."
            />
            <FaqItem
              question="Is there a free trial?"
              answer="We offer a limited free plan with basic features. Upgrade to Pro to unlock everything."
            />
            <FaqItem
              question="Will my data be safe?"
              answer="Absolutely. We use industry-standard encryption and never store your payment information directly."
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function FeatureItem({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <li className="flex items-center gap-3">
      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <span>{text}</span>
    </li>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div>
      <h4 className="font-medium mb-1">{question}</h4>
      <p className="text-sm text-muted-foreground">{answer}</p>
    </div>
  );
}
