'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Pencil, Eye, Building2, CheckCircle2 } from 'lucide-react';

interface InviteAcceptClientProps {
  token: string;
  invitation: {
    email: string;
    role: string;
    expiresAt: string;
    companyName: string;
  };
  isLoggedIn: boolean;
  userEmail?: string;
  locale: string;
}

export function InviteAcceptClient({ 
  token, 
  invitation, 
  isLoggedIn, 
  userEmail,
  locale 
}: InviteAcceptClientProps) {
  const router = useRouter();
  const [isAccepting, setIsAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="h-5 w-5 text-blue-500" />;
      case 'member': return <Pencil className="h-5 w-5 text-green-500" />;
      case 'viewer': return <Eye className="h-5 w-5 text-slate-500" />;
      default: return null;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'member': return 'Mitarbeiter';
      case 'viewer': return 'Betrachter';
      default: return role;
    }
  };

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      const res = await fetch('/api/team/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Fehler beim Annehmen der Einladung');
      }

      setAccepted(true);
      toast.success('Willkommen im Team!');
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push(`/${locale}/dashboard`);
      }, 2000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
      setIsAccepting(false);
    }
  };

  // Email mismatch - user logged in with different email
  const emailMismatch = isLoggedIn && userEmail && userEmail.toLowerCase() !== invitation.email.toLowerCase();

  if (accepted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Willkommen im Team!
            </h1>
            <p className="text-slate-600 mb-4">
              Sie sind jetzt Mitglied bei {invitation.companyName}.
            </p>
            <p className="text-sm text-slate-500">
              Sie werden zum Dashboard weitergeleitet...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Team-Einladung</CardTitle>
          <CardDescription>
            Sie wurden eingeladen, einem Team auf DealerOS beizutreten.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Company Info */}
          <div className="p-4 bg-slate-50 rounded-lg text-center">
            <div className="text-sm text-slate-500 mb-1">Unternehmen</div>
            <div className="text-xl font-semibold">{invitation.companyName}</div>
          </div>

          {/* Role Info */}
          <div className="flex items-center justify-center gap-3">
            <span className="text-slate-600">Ihre Rolle:</span>
            <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1">
              {getRoleIcon(invitation.role)}
              {getRoleLabel(invitation.role)}
            </Badge>
          </div>

          {/* Invited Email */}
          <div className="text-center text-sm text-slate-500">
            Einladung für: <span className="font-medium">{invitation.email}</span>
          </div>

          {/* Expiry */}
          <div className="text-center text-sm text-slate-500">
            Gültig bis: {new Date(invitation.expiresAt).toLocaleDateString('de-CH')}
          </div>

          {/* Email Mismatch Warning */}
          {emailMismatch && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
              <strong>Achtung:</strong> Sie sind als {userEmail} angemeldet, aber die Einladung ist für {invitation.email}. 
              Bitte melden Sie sich mit der richtigen E-Mail-Adresse an.
            </div>
          )}

          {/* Actions */}
          {isLoggedIn ? (
            <Button 
              className="w-full" 
              size="lg"
              onClick={handleAccept}
              disabled={isAccepting || emailMismatch}
            >
              {isAccepting ? 'Wird verarbeitet...' : 'Einladung annehmen'}
            </Button>
          ) : (
            <div className="space-y-3">
              <p className="text-center text-slate-600 text-sm">
                Bitte melden Sie sich an, um die Einladung anzunehmen.
              </p>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => router.push(`/${locale}/login?redirect=/invite/${token}`)}
                >
                  Anmelden
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => router.push(`/${locale}/register?email=${encodeURIComponent(invitation.email)}&redirect=/invite/${token}`)}
                >
                  Registrieren
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
