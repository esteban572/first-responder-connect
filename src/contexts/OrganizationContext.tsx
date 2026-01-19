// Organization Context for Multi-Tenant White-Label Support
// Provides organization data and dynamic theming across the app

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import {
  Organization,
  OrganizationMember,
  OrgRole,
  SubscriptionPlan,
  PLAN_FEATURES,
  planHasFeature,
} from '@/types/organization';
import {
  getCurrentOrganization,
  getUserOrganizations,
  getMemberRole,
  getOrganizationBySlug,
} from '@/lib/organizationService';

interface OrganizationContextType {
  // Current organization
  organization: Organization | null;
  organizations: Organization[];
  isLoading: boolean;
  error: string | null;

  // User's role in current org
  role: OrgRole | null;
  isOwner: boolean;
  isAdmin: boolean;
  isMember: boolean;

  // Subscription helpers
  subscriptionPlan: SubscriptionPlan;
  isSubscribed: boolean;
  hasFeature: (feature: string) => boolean;
  canAddMembers: (currentCount: number) => boolean;

  // Actions
  setOrganization: (org: Organization | null) => void;
  switchOrganization: (orgId: string) => Promise<void>;
  refreshOrganization: () => Promise<void>;
  loadOrganizationBySlug: (slug: string) => Promise<Organization | null>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

interface OrganizationProviderProps {
  children: ReactNode;
}

export function OrganizationProvider({ children }: OrganizationProviderProps) {
  const { user } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [role, setRole] = useState<OrgRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user's organizations on auth change
  useEffect(() => {
    if (user) {
      loadOrganizations();
    } else {
      setOrganization(null);
      setOrganizations([]);
      setRole(null);
      setIsLoading(false);
    }
  }, [user]);

  // Load user's role when organization changes
  useEffect(() => {
    if (user && organization) {
      loadUserRole();
    } else {
      setRole(null);
    }
  }, [user, organization?.id]);

  // Apply dynamic theming when organization changes
  useEffect(() => {
    applyOrganizationTheme(organization);
  }, [organization?.primary_color, organization?.secondary_color]);

  const loadOrganizations = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const orgs = await getUserOrganizations();
      setOrganizations(orgs);

      // Load current org from localStorage or use first org
      const savedOrgId = localStorage.getItem('currentOrganizationId');
      const currentOrg = savedOrgId
        ? orgs.find(o => o.id === savedOrgId) || orgs[0]
        : orgs[0];

      setOrganization(currentOrg || null);

      if (currentOrg) {
        localStorage.setItem('currentOrganizationId', currentOrg.id);
      }
    } catch (err) {
      console.error('Error loading organizations:', err);
      setError('Failed to load organizations');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserRole = async () => {
    if (!organization) return;

    const userRole = await getMemberRole(organization.id);
    setRole(userRole);
  };

  const switchOrganization = async (orgId: string) => {
    const org = organizations.find(o => o.id === orgId);
    if (org) {
      setOrganization(org);
      localStorage.setItem('currentOrganizationId', orgId);
    }
  };

  const refreshOrganization = async () => {
    if (!organization) return;

    const updated = await getCurrentOrganization();
    if (updated) {
      setOrganization(updated);
      // Also refresh the list
      const orgs = await getUserOrganizations();
      setOrganizations(orgs);
    }
  };

  const loadOrganizationBySlug = async (slug: string): Promise<Organization | null> => {
    return await getOrganizationBySlug(slug);
  };

  // Role helpers
  const isOwner = role === 'owner';
  const isAdmin = role === 'owner' || role === 'admin';
  const isMember = !!role;

  // Subscription helpers
  const subscriptionPlan: SubscriptionPlan = organization?.subscription_plan || 'free';
  const isSubscribed = organization?.subscription_status === 'active' || organization?.subscription_status === 'trialing';

  const hasFeature = (feature: string): boolean => {
    if (!organization) return false;

    // Check if feature is explicitly enabled
    if (organization.features_enabled?.includes(feature)) {
      return true;
    }

    // Check plan features
    return planHasFeature(subscriptionPlan, feature);
  };

  const canAddMembers = (currentCount: number): boolean => {
    if (!organization) return false;
    return currentCount < organization.max_members;
  };

  const value: OrganizationContextType = {
    organization,
    organizations,
    isLoading,
    error,
    role,
    isOwner,
    isAdmin,
    isMember,
    subscriptionPlan,
    isSubscribed,
    hasFeature,
    canAddMembers,
    setOrganization,
    switchOrganization,
    refreshOrganization,
    loadOrganizationBySlug,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}

// ============================================
// DYNAMIC THEMING
// ============================================

function applyOrganizationTheme(org: Organization | null) {
  const root = document.documentElement;

  if (org?.primary_color) {
    // Convert hex to HSL for CSS variables
    const primaryHsl = hexToHsl(org.primary_color);
    root.style.setProperty('--org-primary', org.primary_color);
    root.style.setProperty('--org-primary-hsl', primaryHsl);
  } else {
    root.style.removeProperty('--org-primary');
    root.style.removeProperty('--org-primary-hsl');
  }

  if (org?.secondary_color) {
    const secondaryHsl = hexToHsl(org.secondary_color);
    root.style.setProperty('--org-secondary', org.secondary_color);
    root.style.setProperty('--org-secondary-hsl', secondaryHsl);
  } else {
    root.style.removeProperty('--org-secondary');
    root.style.removeProperty('--org-secondary-hsl');
  }
}

function hexToHsl(hex: string): string {
  // Remove # if present
  hex = hex.replace(/^#/, '');

  // Parse hex
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

// ============================================
// FEATURE GATE COMPONENT
// ============================================

interface FeatureGateProps {
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function FeatureGate({ feature, children, fallback }: FeatureGateProps) {
  const { hasFeature, isSubscribed } = useOrganization();

  if (!isSubscribed || !hasFeature(feature)) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}

// ============================================
// SUBSCRIPTION GATE COMPONENT
// ============================================

interface SubscriptionGateProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function SubscriptionGate({ children, fallback }: SubscriptionGateProps) {
  const { isSubscribed } = useOrganization();

  if (!isSubscribed) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}

// ============================================
// ROLE GATE COMPONENT
// ============================================

interface RoleGateProps {
  roles: OrgRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleGate({ roles, children, fallback }: RoleGateProps) {
  const { role } = useOrganization();

  if (!role || !roles.includes(role)) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}
