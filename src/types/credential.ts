export type CredentialStatus = 'valid' | 'expiring_soon' | 'expired';

export type CredentialCategory = 'EMS' | 'Fire' | 'Tactical' | 'Operations' | 'Other';

export interface Credential {
  id: string;
  user_id: string;
  credential_type: string;
  credential_name: string;
  issuing_organization?: string;
  issue_date?: string;
  expiration_date?: string;
  credential_number?: string;
  document_url?: string;
  document_path?: string;
  notes?: string;
  is_verified: boolean;
  is_public: boolean;
  status: CredentialStatus;
  notification_days: number;
  created_at: string;
  updated_at: string;
}

export interface CredentialCreate {
  credential_type: string;
  credential_name: string;
  issuing_organization?: string;
  issue_date?: string;
  expiration_date?: string;
  credential_number?: string;
  document_url?: string;
  document_path?: string;
  notes?: string;
  is_public?: boolean;
  notification_days?: number;
}

export interface CredentialUpdate {
  credential_type?: string;
  credential_name?: string;
  issuing_organization?: string;
  issue_date?: string;
  expiration_date?: string;
  credential_number?: string;
  document_url?: string;
  document_path?: string;
  notes?: string;
  is_verified?: boolean;
  is_public?: boolean;
  notification_days?: number;
}

export interface CredentialType {
  id: string;
  name: string;
  category: CredentialCategory;
}

// Predefined credential types
export const CREDENTIAL_TYPES: CredentialType[] = [
  // EMS
  { id: 'NREMT', name: 'National Registry of EMTs', category: 'EMS' },
  { id: 'ACLS', name: 'Advanced Cardiovascular Life Support', category: 'EMS' },
  { id: 'PALS', name: 'Pediatric Advanced Life Support', category: 'EMS' },
  { id: 'PHTLS', name: 'Prehospital Trauma Life Support', category: 'EMS' },
  { id: 'NRP', name: 'Neonatal Resuscitation Program', category: 'EMS' },
  { id: 'CCP', name: 'Critical Care Paramedic', category: 'EMS' },
  { id: 'FP', name: 'Flight Paramedic', category: 'EMS' },
  { id: 'EMT-B', name: 'EMT - Basic', category: 'EMS' },
  { id: 'EMTA', name: 'EMT - Advanced', category: 'EMS' },
  { id: 'EMT-P', name: 'EMT - Paramedic', category: 'EMS' },
  { id: 'CCT', name: 'Critical Care Transport', category: 'EMS' },
  { id: 'REMS', name: 'Remote Emergency Medical Services', category: 'EMS' },
  // Fire
  { id: 'RED_CARD', name: 'Red Card (Wildland Firefighter)', category: 'Fire' },
  { id: 'S130', name: 'Firefighter Training (S-130)', category: 'Fire' },
  { id: 'S190', name: 'Wildland Fire Behavior (S-190)', category: 'Fire' },
  { id: 'TYPE1_FF', name: 'Type 1 Firefighter', category: 'Fire' },
  { id: 'TYPE2_FF', name: 'Type 2 Firefighter', category: 'Fire' },
  { id: 'RT130', name: 'Annual Wildfire Safety Refresher', category: 'Fire' },
  // Tactical
  { id: 'TCCC', name: 'Tactical Combat Casualty Care', category: 'Tactical' },
  // Operations
  { id: 'EVOC', name: 'Emergency Vehicle Operator Course', category: 'Operations' },
];

// Group credential types by category
export const CREDENTIAL_CATEGORIES: { value: CredentialCategory; label: string }[] = [
  { value: 'EMS', label: 'EMS' },
  { value: 'Fire', label: 'Fire' },
  { value: 'Tactical', label: 'Tactical' },
  { value: 'Operations', label: 'Operations' },
  { value: 'Other', label: 'Other' },
];

// Status configuration for UI
export const CREDENTIAL_STATUS_CONFIG: Record<CredentialStatus, { label: string; color: string; bgColor: string }> = {
  valid: {
    label: 'Valid',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  expiring_soon: {
    label: 'Expiring Soon',
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
  },
  expired: {
    label: 'Expired',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
};

// Helper to get credential type info
export function getCredentialTypeInfo(typeId: string): CredentialType | undefined {
  return CREDENTIAL_TYPES.find((t) => t.id === typeId);
}

// Helper to get credential types by category
export function getCredentialTypesByCategory(category: CredentialCategory): CredentialType[] {
  return CREDENTIAL_TYPES.filter((t) => t.category === category);
}
