"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEffect } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, CheckCircle2, XCircle, RefreshCw, Link2Off, ExternalLink, AlertTriangle, Users, FileText } from "lucide-react";

interface BexioDealer {
  id: string;
  isConnected: boolean;
  companyName: string | null;
  companyId: number | null;
  connectedAt: string | null;
  lastSyncAt: string | null;
  lastError: string | null;
}

interface SyncStats {
  customers: {
    total: number;
    synced: number;
  };
  invoices: {
    total: number;
    synced: number;
  };
}

interface BexioSettingsClientProps {
  dealer: BexioDealer;
  stats: SyncStats;
}

export function BexioSettingsClient({ dealer: initialDealer, stats: initialStats }: BexioSettingsClientProps) {
  const [dealer, setDealer] = useState(initialDealer);
  const [stats, setStats] = useState(initialStats);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Handle URL params for success/error messages
  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    const message = searchParams.get('message');
    const company = searchParams.get('company');

    if (success === 'connected') {
      toast.success(`Erfolgreich mit Bexio verbunden${company ? ` (${company})` : ''}`);
      // Update local state
      setDealer(prev => ({
        ...prev,
        isConnected: true,
        companyName: company || prev.companyName,
        connectedAt: new Date().toISOString(),
      }));
      // Clear URL params
      router.replace('/dashboard/settings/bexio');
    } else if (error) {
      toast.error(message || 'Verbindung fehlgeschlagen');
      router.replace('/dashboard/settings/bexio');
    }
  }, [searchParams, router]);

  const handleConnect = () => {
    // Redirect to OAuth connect endpoint
    window.location.href = '/api/bexio/connect';
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      const response = await fetch('/api/bexio/disconnect', {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Verbindung konnte nicht getrennt werden');
      }

      toast.success('Bexio-Verbindung erfolgreich getrennt');
      setDealer(prev => ({
        ...prev,
        isConnected: false,
        companyName: null,
        companyId: null,
        connectedAt: null,
        lastSyncAt: null,
        lastError: null,
      }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Fehler beim Trennen');
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleSync = async (type: 'full' | 'customers' | 'invoices' = 'full') => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/bexio/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Synchronisation fehlgeschlagen');
      }

      if (data.success) {
        toast.success('Synchronisation erfolgreich', {
          description: `${data.stats.customersCreated + data.stats.customersUpdated} Kunden, ${data.stats.invoicesCreated} Rechnungen synchronisiert`,
        });
      } else {
        toast.warning('Synchronisation mit Fehlern abgeschlossen', {
          description: data.errors?.[0] || 'Einige Einträge konnten nicht synchronisiert werden',
        });
      }

      // Update stats
      setDealer(prev => ({
        ...prev,
        lastSyncAt: new Date().toISOString(),
        lastError: data.errors?.length > 0 ? data.errors[0] : null,
      }));

      // Refresh stats from API
      const statusResponse = await fetch('/api/bexio/sync');
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        setStats(statusData.stats);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Synchronisation fehlgeschlagen');
    } finally {
      setIsSyncing(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '–';
    return new Date(dateString).toLocaleString('de-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const customerProgress = stats.customers.total > 0 
    ? (stats.customers.synced / stats.customers.total) * 100 
    : 0;
  
  const invoiceProgress = stats.invoices.total > 0 
    ? (stats.invoices.synced / stats.invoices.total) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <a href="/dashboard/settings">
            <ArrowLeft className="h-5 w-5" />
          </a>
        </Button>
        <div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">Bexio-Integration</h1>
          <p className="text-slate-600">Verbinden Sie DealerOS mit Ihrer Bexio-Buchhaltung</p>
        </div>
      </div>

      {/* Connection Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-blue-600" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Bexio
                  {dealer.isConnected ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Verbunden
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <XCircle className="w-3 h-3 mr-1" />
                      Nicht verbunden
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {dealer.isConnected && dealer.companyName
                    ? `Verbunden mit ${dealer.companyName}`
                    : 'Synchronisieren Sie Kunden und Rechnungen automatisch'}
                </CardDescription>
              </div>
            </div>
            
            {dealer.isConnected ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-red-600 hover:text-red-700" disabled={isDisconnecting}>
                    <Link2Off className="w-4 h-4 mr-2" />
                    Trennen
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Bexio-Verbindung trennen?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Die Verbindung zu Bexio wird getrennt. Bereits synchronisierte Daten bleiben erhalten,
                      aber es werden keine neuen Daten mehr synchronisiert.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDisconnect}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Verbindung trennen
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <Button onClick={handleConnect}>
                Mit Bexio verbinden
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardHeader>

        {dealer.isConnected && (
          <CardContent className="border-t pt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-slate-500">Firma</span>
                <p className="font-medium">{dealer.companyName || '–'}</p>
              </div>
              <div>
                <span className="text-slate-500">Verbunden seit</span>
                <p className="font-medium">{formatDate(dealer.connectedAt)}</p>
              </div>
              <div>
                <span className="text-slate-500">Letzte Sync</span>
                <p className="font-medium">{formatDate(dealer.lastSyncAt)}</p>
              </div>
              <div>
                <span className="text-slate-500">Status</span>
                <p className="font-medium">
                  {dealer.lastError ? (
                    <span className="text-amber-600 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      Fehler
                    </span>
                  ) : (
                    <span className="text-green-600">OK</span>
                  )}
                </p>
              </div>
            </div>

            {dealer.lastError && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                <strong>Letzter Fehler:</strong> {dealer.lastError}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Sync Status */}
      {dealer.isConnected && (
        <>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Customers Sync */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-slate-500" />
                    Kunden
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleSync('customers')}
                    disabled={isSyncing}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                    Sync
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Synchronisiert</span>
                    <span className="font-medium">{stats.customers.synced} / {stats.customers.total}</span>
                  </div>
                  <Progress value={customerProgress} className="h-2" />
                  <p className="text-xs text-slate-500">
                    {stats.customers.total - stats.customers.synced} Kunden noch nicht in Bexio
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Invoices Sync */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5 text-slate-500" />
                    Rechnungen
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleSync('invoices')}
                    disabled={isSyncing}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                    Sync
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Synchronisiert</span>
                    <span className="font-medium">{stats.invoices.synced} / {stats.invoices.total}</span>
                  </div>
                  <Progress value={invoiceProgress} className="h-2" />
                  <p className="text-xs text-slate-500">
                    {stats.invoices.total - stats.invoices.synced} Rechnungen noch nicht in Bexio
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Full Sync Button */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Vollständige Synchronisation</h3>
                  <p className="text-sm text-slate-500">
                    Synchronisiert alle Kunden und Rechnungen zu Bexio
                  </p>
                </div>
                <Button onClick={() => handleSync('full')} disabled={isSyncing}>
                  {isSyncing ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Synchronisiere...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Alles synchronisieren
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Info Card for not connected */}
      {!dealer.isConnected && (
        <Card className="bg-slate-50 border-dashed">
          <CardContent className="pt-6">
            <div className="text-center max-w-md mx-auto">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg viewBox="0 0 24 24" className="w-10 h-10 text-blue-600" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Bexio-Integration einrichten</h3>
              <p className="text-slate-600 mb-4">
                Verbinden Sie Ihr Bexio-Konto, um Kunden und Rechnungen automatisch zu synchronisieren.
                Die Verbindung ist sicher und kann jederzeit getrennt werden.
              </p>
              <div className="space-y-2 text-left text-sm mb-6">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>Kunden automatisch synchronisieren</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>Rechnungen direkt in Bexio erstellen</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>Sichere OAuth 2.0 Verbindung</span>
                </div>
              </div>
              <Button onClick={handleConnect} size="lg">
                Mit Bexio verbinden
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Hilfe & Support</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-600">
          <div>
            <strong>Welche Daten werden synchronisiert?</strong>
            <p>Kundendaten (Name, Adresse, Kontakt) und Rechnungen werden zu Bexio übertragen. 
               Die Synchronisation ist einseitig (DealerOS → Bexio).</p>
          </div>
          <div>
            <strong>Wie oft wird synchronisiert?</strong>
            <p>Momentan wird manuell synchronisiert. Automatische Synchronisation kommt bald.</p>
          </div>
          <div>
            <strong>Probleme mit der Verbindung?</strong>
            <p>Trennen Sie die Verbindung und verbinden Sie sich erneut. 
               Bei weiteren Problemen kontaktieren Sie unseren Support.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
