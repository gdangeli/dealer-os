'use client';

import { useState, useEffect, useCallback } from 'react';
import { TeamMember, TeamInvitation, TeamRole, hasPermission, Permission } from '@/types/team';

interface UseTeamOptions {
  dealerId: string;
}

interface UseTeamReturn {
  members: TeamMember[];
  invitations: TeamInvitation[];
  currentUserRole: TeamRole | null;
  isLoading: boolean;
  error: string | null;
  canManageTeam: boolean;
  canManageBilling: boolean;
  hasPermission: (permission: Permission) => boolean;
  refresh: () => Promise<void>;
  inviteMember: (email: string, role: TeamRole) => Promise<void>;
  updateRole: (memberId: string, role: TeamRole) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  cancelInvitation: (invitationId: string) => Promise<void>;
}

export function useTeam({ dealerId }: UseTeamOptions): UseTeamReturn {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<TeamRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeamData = useCallback(async () => {
    if (!dealerId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`/api/team?dealerId=${dealerId}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to fetch team data');
      }
      
      const data = await res.json();
      setMembers(data.members || []);
      setInvitations(data.invitations || []);
      setCurrentUserRole(data.currentUserRole || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [dealerId]);

  useEffect(() => {
    fetchTeamData();
  }, [fetchTeamData]);

  const inviteMember = useCallback(async (email: string, role: TeamRole) => {
    const res = await fetch('/api/team/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dealerId, email, role }),
    });
    
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to send invitation');
    }
    
    await fetchTeamData();
  }, [dealerId, fetchTeamData]);

  const updateRole = useCallback(async (memberId: string, role: TeamRole) => {
    const res = await fetch(`/api/team/members/${memberId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to update role');
    }
    
    await fetchTeamData();
  }, [fetchTeamData]);

  const removeMember = useCallback(async (memberId: string) => {
    const res = await fetch(`/api/team/members/${memberId}`, {
      method: 'DELETE',
    });
    
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to remove member');
    }
    
    await fetchTeamData();
  }, [fetchTeamData]);

  const cancelInvitationFn = useCallback(async (invitationId: string) => {
    const res = await fetch(`/api/team/invitations/${invitationId}`, {
      method: 'DELETE',
    });
    
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to cancel invitation');
    }
    
    await fetchTeamData();
  }, [fetchTeamData]);

  const checkPermission = useCallback((permission: Permission): boolean => {
    if (!currentUserRole) return false;
    return hasPermission(currentUserRole, permission);
  }, [currentUserRole]);

  return {
    members,
    invitations,
    currentUserRole,
    isLoading,
    error,
    canManageTeam: checkPermission('canManageTeam'),
    canManageBilling: checkPermission('canManageBilling'),
    hasPermission: checkPermission,
    refresh: fetchTeamData,
    inviteMember,
    updateRole,
    removeMember,
    cancelInvitation: cancelInvitationFn,
  };
}
