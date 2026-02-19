// Team & Multi-User Types

export type TeamRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface TeamMember {
  id: string;
  dealer_id: string;
  user_id: string;
  role: TeamRole;
  invited_by?: string;
  invited_at: string;
  accepted_at?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  user?: {
    email: string;
    user_metadata?: {
      full_name?: string;
      avatar_url?: string;
    };
  };
}

export interface TeamInvitation {
  id: string;
  dealer_id: string;
  email: string;
  role: TeamRole;
  token: string;
  invited_by: string;
  expires_at: string;
  accepted_at?: string;
  created_at: string;
  // Joined data
  inviter?: {
    email: string;
    user_metadata?: {
      full_name?: string;
    };
  };
  dealer?: {
    company_name: string;
  };
}

export interface PlatformAdmin {
  id: string;
  user_id: string;
  email: string;
  name?: string;
  created_at: string;
}

// Role permissions matrix
export const ROLE_PERMISSIONS = {
  owner: {
    canManageTeam: true,
    canManageBilling: true,
    canDeleteDealer: true,
    canManageSettings: true,
    canManageIntegrations: true,
    canViewAnalytics: true,
    canManageVehicles: true,
    canManageLeads: true,
    canManageCustomers: true,
    canManageQuotes: true,
    canManageInvoices: true,
  },
  admin: {
    canManageTeam: true,
    canManageBilling: false,
    canDeleteDealer: false,
    canManageSettings: true,
    canManageIntegrations: true,
    canViewAnalytics: true,
    canManageVehicles: true,
    canManageLeads: true,
    canManageCustomers: true,
    canManageQuotes: true,
    canManageInvoices: true,
  },
  member: {
    canManageTeam: false,
    canManageBilling: false,
    canDeleteDealer: false,
    canManageSettings: false,
    canManageIntegrations: false,
    canViewAnalytics: true,
    canManageVehicles: true,
    canManageLeads: true,
    canManageCustomers: true,
    canManageQuotes: true,
    canManageInvoices: true,
  },
  viewer: {
    canManageTeam: false,
    canManageBilling: false,
    canDeleteDealer: false,
    canManageSettings: false,
    canManageIntegrations: false,
    canViewAnalytics: true,
    canManageVehicles: false,
    canManageLeads: false,
    canManageCustomers: false,
    canManageQuotes: false,
    canManageInvoices: false,
  },
} as const;

export type Permission = keyof typeof ROLE_PERMISSIONS.owner;

// Check if a role has a specific permission
export function hasPermission(role: TeamRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.[permission] ?? false;
}

// Get display name for role
export function getRoleDisplayName(role: TeamRole, locale: string = 'de'): string {
  const names: Record<TeamRole, Record<string, string>> = {
    owner: { de: 'Inhaber', en: 'Owner', fr: 'Propriétaire', it: 'Proprietario' },
    admin: { de: 'Administrator', en: 'Administrator', fr: 'Administrateur', it: 'Amministratore' },
    member: { de: 'Mitarbeiter', en: 'Member', fr: 'Membre', it: 'Membro' },
    viewer: { de: 'Betrachter', en: 'Viewer', fr: 'Observateur', it: 'Osservatore' },
  };
  return names[role]?.[locale] ?? names[role]?.en ?? role;
}
