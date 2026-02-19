'use client';

import { useState } from 'react';
import { useTeam } from '@/hooks/use-team';
import { TeamRole, getRoleDisplayName } from '@/types/team';
import { getPlanLimits, PLANS } from '@/lib/stripe/config';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Users, 
  UserPlus, 
  MoreVertical, 
  Mail, 
  Shield, 
  Crown,
  Eye,
  Pencil,
  Trash2,
  Clock,
  AlertCircle,
} from 'lucide-react';

interface TeamManagementProps {
  dealerId: string;
  dealerPlan: string;
}

export function TeamManagement({ dealerId, dealerPlan }: TeamManagementProps) {
  const {
    members,
    invitations,
    currentUserRole,
    isLoading,
    error,
    canManageTeam,
    inviteMember,
    updateRole,
    removeMember,
    cancelInvitation,
    refresh,
  } = useTeam({ dealerId });

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamRole>('member');
  const [isInviting, setIsInviting] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);
  const [invitationToCancel, setInvitationToCancel] = useState<string | null>(null);

  const planLimits = getPlanLimits(dealerPlan as keyof typeof PLANS);
  const currentMemberCount = members.length;
  const pendingInvitations = invitations.length;
  const totalSlots = planLimits.users === -1 ? '∞' : planLimits.users;
  const usedSlots = currentMemberCount + pendingInvitations;
  const canInviteMore = planLimits.users === -1 || usedSlots < planLimits.users;

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.error('Bitte geben Sie eine E-Mail-Adresse ein');
      return;
    }

    setIsInviting(true);
    try {
      await inviteMember(inviteEmail.trim(), inviteRole);
      toast.success('Einladung gesendet!');
      setInviteDialogOpen(false);
      setInviteEmail('');
      setInviteRole('member');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Fehler beim Senden der Einladung');
    } finally {
      setIsInviting(false);
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: TeamRole) => {
    try {
      await updateRole(memberId, newRole);
      toast.success('Rolle aktualisiert');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Fehler beim Aktualisieren');
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    try {
      await removeMember(memberToRemove);
      toast.success('Teammitglied entfernt');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Fehler beim Entfernen');
    } finally {
      setMemberToRemove(null);
    }
  };

  const handleCancelInvitation = async () => {
    if (!invitationToCancel) return;
    try {
      await cancelInvitation(invitationToCancel);
      toast.success('Einladung zurückgezogen');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Fehler beim Zurückziehen');
    } finally {
      setInvitationToCancel(null);
    }
  };

  const getRoleIcon = (role: TeamRole) => {
    switch (role) {
      case 'owner': return <Crown className="h-4 w-4 text-amber-500" />;
      case 'admin': return <Shield className="h-4 w-4 text-blue-500" />;
      case 'member': return <Pencil className="h-4 w-4 text-green-500" />;
      case 'viewer': return <Eye className="h-4 w-4 text-slate-500" />;
    }
  };

  const getRoleBadgeVariant = (role: TeamRole) => {
    switch (role) {
      case 'owner': return 'default';
      case 'admin': return 'secondary';
      case 'member': return 'outline';
      case 'viewer': return 'outline';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-10">
          <div className="flex items-center justify-center text-slate-500">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3" />
            Team wird geladen...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-10">
          <div className="flex flex-col items-center justify-center text-red-500 gap-2">
            <AlertCircle className="h-8 w-8" />
            <p>Fehler: {error}</p>
            <Button variant="outline" onClick={refresh}>Erneut versuchen</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team verwalten
              </CardTitle>
              <CardDescription>
                Laden Sie Teammitglieder ein und verwalten Sie deren Berechtigungen.
              </CardDescription>
            </div>
            {canManageTeam && (
              <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                <DialogTrigger asChild>
                  <Button disabled={!canInviteMore}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Einladen
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Teammitglied einladen</DialogTitle>
                    <DialogDescription>
                      Senden Sie eine Einladung per E-Mail. Der Empfänger kann dann Ihrem Team beitreten.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">E-Mail-Adresse</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="mitarbeiter@beispiel.ch"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Rolle</Label>
                      <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as TeamRole)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-blue-500" />
                              Administrator – Volle Rechte (ohne Billing)
                            </div>
                          </SelectItem>
                          <SelectItem value="member">
                            <div className="flex items-center gap-2">
                              <Pencil className="h-4 w-4 text-green-500" />
                              Mitarbeiter – Kann alles bearbeiten
                            </div>
                          </SelectItem>
                          <SelectItem value="viewer">
                            <div className="flex items-center gap-2">
                              <Eye className="h-4 w-4 text-slate-500" />
                              Betrachter – Nur lesen
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                      Abbrechen
                    </Button>
                    <Button onClick={handleInvite} disabled={isInviting}>
                      {isInviting ? 'Wird gesendet...' : 'Einladung senden'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Plan Limits */}
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
            <div className="flex-1">
              <div className="text-sm text-slate-600">Benutzer</div>
              <div className="text-2xl font-bold">
                {currentMemberCount} <span className="text-slate-400 text-lg">/ {totalSlots}</span>
              </div>
            </div>
            {pendingInvitations > 0 && (
              <div className="flex-1">
                <div className="text-sm text-slate-600">Ausstehende Einladungen</div>
                <div className="text-2xl font-bold text-amber-600">{pendingInvitations}</div>
              </div>
            )}
            {!canInviteMore && planLimits.users !== -1 && (
              <Badge variant="destructive">Limit erreicht</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Teammitglieder</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                    {getRoleIcon(member.role)}
                  </div>
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {member.user?.user_metadata?.full_name || member.user?.email || 'Unbekannt'}
                      {member.role === 'owner' && (
                        <Badge variant="default" className="bg-amber-500">Inhaber</Badge>
                      )}
                    </div>
                    <div className="text-sm text-slate-500">{member.user?.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getRoleBadgeVariant(member.role)}>
                    {getRoleDisplayName(member.role)}
                  </Badge>
                  {canManageTeam && member.role !== 'owner' && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {currentUserRole === 'owner' && (
                          <>
                            <DropdownMenuItem onClick={() => handleUpdateRole(member.id, 'admin')}>
                              <Shield className="h-4 w-4 mr-2 text-blue-500" />
                              Zum Admin machen
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem onClick={() => handleUpdateRole(member.id, 'member')}>
                          <Pencil className="h-4 w-4 mr-2 text-green-500" />
                          Zum Mitarbeiter machen
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateRole(member.id, 'viewer')}>
                          <Eye className="h-4 w-4 mr-2 text-slate-500" />
                          Zum Betrachter machen
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => setMemberToRemove(member.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Entfernen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              Ausstehende Einladungen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {invitations.map((invitation) => (
                <div key={invitation.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <div className="font-medium">{invitation.email}</div>
                      <div className="text-sm text-slate-500">
                        Eingeladen als {getRoleDisplayName(invitation.role)} · 
                        Läuft ab am {new Date(invitation.expires_at).toLocaleDateString('de-CH')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-amber-600 border-amber-300">
                      Ausstehend
                    </Badge>
                    {canManageTeam && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setInvitationToCancel(invitation.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Role Explanation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Rollen-Übersicht</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 font-medium mb-2">
                <Crown className="h-4 w-4 text-amber-500" />
                Inhaber
              </div>
              <p className="text-sm text-slate-600">
                Volle Kontrolle inkl. Abrechnung, Team-Verwaltung und Kontolöschung.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 font-medium mb-2">
                <Shield className="h-4 w-4 text-blue-500" />
                Administrator
              </div>
              <p className="text-sm text-slate-600">
                Kann Team verwalten und alle Einstellungen ändern (ohne Abrechnung).
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 font-medium mb-2">
                <Pencil className="h-4 w-4 text-green-500" />
                Mitarbeiter
              </div>
              <p className="text-sm text-slate-600">
                Kann Fahrzeuge, Kunden, Offerten und Rechnungen bearbeiten.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 font-medium mb-2">
                <Eye className="h-4 w-4 text-slate-500" />
                Betrachter
              </div>
              <p className="text-sm text-slate-600">
                Kann alle Daten einsehen, aber nichts bearbeiten.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Remove Member Dialog */}
      <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Teammitglied entfernen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Person verliert sofort den Zugriff auf Ihr DealerOS-Konto.
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveMember} className="bg-red-600 hover:bg-red-700">
              Entfernen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Invitation Dialog */}
      <AlertDialog open={!!invitationToCancel} onOpenChange={() => setInvitationToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Einladung zurückziehen?</AlertDialogTitle>
            <AlertDialogDescription>
              Der Einladungslink wird ungültig und die Person kann nicht mehr beitreten.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelInvitation}>
              Zurückziehen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
