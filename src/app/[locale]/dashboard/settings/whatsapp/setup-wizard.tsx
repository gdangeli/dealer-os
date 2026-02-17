'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ExternalLink,
  Copy,
  CheckCheck,
  Rocket,
  Building2,
  Code,
  Phone,
  Key,
  Webhook,
  MessageSquare,
  PartyPopper,
  HelpCircle,
} from 'lucide-react';

interface SetupWizardProps {
  dealerId: string;
  onComplete?: () => void;
}

interface WizardData {
  hasMetaAccount: boolean;
  hasAppCreated: boolean;
  phoneNumberType: 'test' | 'production' | null;
  phoneNumberId: string;
  phoneNumber: string;
  wabaId: string;
  accessToken: string;
  verifyToken: string;
  webhookConfigured: boolean;
  displayName: string;
}

export function SetupWizard({ dealerId, onComplete }: SetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  
  const supabase = createClient();
  
  const [data, setData] = useState<WizardData>({
    hasMetaAccount: false,
    hasAppCreated: false,
    phoneNumberType: null,
    phoneNumberId: '',
    phoneNumber: '',
    wabaId: '',
    accessToken: '',
    verifyToken: `dealer-os-${dealerId}-${Math.random().toString(36).substring(7)}`,
    webhookConfigured: false,
    displayName: '',
  });

  const totalSteps = 8;
  const progress = (currentStep / totalSteps) * 100;

  const webhookUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/api/webhooks/whatsapp` 
    : '';

  const copyToClipboard = async (text: string, type: 'webhook' | 'token') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'webhook') {
        setCopiedWebhook(true);
        setTimeout(() => setCopiedWebhook(false), 2000);
      } else {
        setCopiedToken(true);
        setTimeout(() => setCopiedToken(false), 2000);
      }
      toast.success('In Zwischenablage kopiert');
    } catch (error) {
      toast.error('Kopieren fehlgeschlagen');
    }
  };

  const testToken = async () => {
    if (!data.accessToken || !data.phoneNumberId) {
      toast.error('Bitte Access Token und Phone Number ID eingeben');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/whatsapp/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: data.accessToken,
          phoneNumberId: data.phoneNumberId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setTestSuccess(true);
        toast.success('Token erfolgreich getestet! ✅');
        
        // Update display name if provided by Meta
        if (result.displayName) {
          setData(prev => ({ ...prev, displayName: result.displayName }));
        }
      } else {
        toast.error(result.error || 'Token-Test fehlgeschlagen');
      }
    } catch (error) {
      console.error('Test error:', error);
      toast.error('Verbindung konnte nicht getestet werden');
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestMessage = async () => {
    if (!data.phoneNumber) {
      toast.error('Bitte eine Test-Telefonnummer eingeben');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumberId: data.phoneNumberId,
          accessToken: data.accessToken,
          to: data.phoneNumber,
          message: '🎉 Herzlich willkommen bei DealerOS! Ihre WhatsApp Business Integration ist erfolgreich eingerichtet.',
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Test-Nachricht erfolgreich gesendet! 📱');
      } else {
        toast.error(result.error || 'Nachricht konnte nicht gesendet werden');
      }
    } catch (error) {
      console.error('Send error:', error);
      toast.error('Fehler beim Senden der Nachricht');
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfiguration = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('whatsapp_connections')
        .upsert({
          dealer_id: dealerId,
          phone_number_id: data.phoneNumberId,
          phone_number: data.phoneNumber,
          waba_id: data.wabaId,
          access_token: data.accessToken,
          verify_token: data.verifyToken,
          display_name: data.displayName,
          status: 'active',
        }, {
          onConflict: 'dealer_id',
        });

      if (error) throw error;

      toast.success('🎉 WhatsApp erfolgreich konfiguriert!');
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Fehler beim Speichern der Konfiguration');
    } finally {
      setIsLoading(false);
    }
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        return true;
      case 2:
        return data.hasMetaAccount;
      case 3:
        return data.hasAppCreated;
      case 4:
        return data.phoneNumberType !== null && data.phoneNumberId.length > 0;
      case 5:
        return data.accessToken.length > 0 && testSuccess;
      case 6:
        return data.webhookConfigured;
      case 7:
        return true;
      case 8:
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (canGoNext()) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center py-8">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <Rocket className="h-10 w-10 text-green-600" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Willkommen beim WhatsApp Setup! 🚀
              </h2>
              <p className="text-lg text-slate-600 mb-6 max-w-2xl mx-auto">
                In den nächsten Schritten richten wir Ihre WhatsApp Business Integration ein.
                Damit können Sie direkt mit Ihren Kunden über WhatsApp kommunizieren.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6 max-w-xl mx-auto">
                <h3 className="font-semibold text-slate-900 mb-3">Was Sie damit erreichen:</h3>
                <ul className="text-left space-y-2 text-slate-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Direkte Kommunikation mit Leads über WhatsApp</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Automatische Antworten bei neuen Anfragen</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Zentrale Verwaltung aller Konversationen</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Professionelles WhatsApp Business Profil</span>
                  </li>
                </ul>
              </div>

              <div className="flex items-center justify-center gap-2 text-slate-500">
                <span className="text-sm">⏱️ Geschätzte Zeit: 15-20 Minuten</span>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Meta Business Account</h2>
                <p className="text-slate-600">Erstellen Sie einen Meta Business Account</p>
              </div>
            </div>

            <Alert>
              <AlertDescription>
                <div className="space-y-3">
                  <p className="font-medium">Schritt-für-Schritt Anleitung:</p>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Besuchen Sie <strong>business.facebook.com</strong></li>
                    <li>Klicken Sie auf "Konto erstellen"</li>
                    <li>Geben Sie Ihre Unternehmensdaten ein</li>
                    <li>Bestätigen Sie Ihre E-Mail-Adresse</li>
                  </ol>
                </div>
              </AlertDescription>
            </Alert>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open('https://business.facebook.com', '_blank')}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              business.facebook.com öffnen
            </Button>

            <div className="border-t pt-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="hasMetaAccount"
                  checked={data.hasMetaAccount}
                  onCheckedChange={(checked) => 
                    setData(prev => ({ ...prev, hasMetaAccount: checked as boolean }))
                  }
                />
                <div className="space-y-1">
                  <label
                    htmlFor="hasMetaAccount"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Ich habe einen Meta Business Account erstellt
                  </label>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowHelp(!showHelp)}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
            >
              <HelpCircle className="h-4 w-4" />
              Was ist ein Meta Business Account?
            </button>

            {showHelp && (
              <div className="bg-slate-50 border rounded-lg p-4 text-sm text-slate-700">
                <p className="mb-2">
                  <strong>Meta Business Account</strong> ist die zentrale Verwaltungsplattform für
                  alle geschäftlichen Aktivitäten auf Facebook, Instagram und WhatsApp.
                </p>
                <p>
                  Damit können Sie Ihr WhatsApp Business Profil verwalten, Team-Mitglieder hinzufügen
                  und auf erweiterte Funktionen zugreifen.
                </p>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Code className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Developer App erstellen</h2>
                <p className="text-slate-600">Erstellen Sie eine WhatsApp Business App</p>
              </div>
            </div>

            <Alert>
              <AlertDescription>
                <div className="space-y-3">
                  <p className="font-medium">So erstellen Sie Ihre App:</p>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Gehen Sie zu <strong>developers.facebook.com</strong></li>
                    <li>Klicken Sie auf "Meine Apps" → "App erstellen"</li>
                    <li>Wählen Sie <strong>Typ: Business</strong></li>
                    <li>Geben Sie einen App-Namen ein (z.B. "Autohaus WhatsApp")</li>
                    <li>Fügen Sie das Produkt <strong>"WhatsApp"</strong> hinzu</li>
                    <li>Wählen Sie Ihr Meta Business Account aus</li>
                  </ol>
                </div>
              </AlertDescription>
            </Alert>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open('https://developers.facebook.com/apps', '_blank')}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              developers.facebook.com öffnen
            </Button>

            <div className="border-t pt-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="hasAppCreated"
                  checked={data.hasAppCreated}
                  onCheckedChange={(checked) => 
                    setData(prev => ({ ...prev, hasAppCreated: checked as boolean }))
                  }
                />
                <div className="space-y-1">
                  <label
                    htmlFor="hasAppCreated"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    App erstellt und WhatsApp Produkt hinzugefügt
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Phone className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Telefonnummer verbinden</h2>
                <p className="text-slate-600">Wählen Sie eine Nummer für WhatsApp Business</p>
              </div>
            </div>

            <div className="space-y-4">
              <div
                onClick={() => setData(prev => ({ ...prev, phoneNumberType: 'test' }))}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  data.phoneNumberType === 'test'
                    ? 'border-green-500 bg-green-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {data.phoneNumberType === 'test' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <div className="h-5 w-5 border-2 border-slate-300 rounded-full" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1">
                      Option A: Test-Nummer verwenden
                    </h3>
                    <p className="text-sm text-slate-600">
                      Meta stellt eine Test-Nummer zur Verfügung. Ideal für erste Tests und Entwicklung.
                    </p>
                    <Badge variant="outline" className="mt-2">Empfohlen für Testing</Badge>
                  </div>
                </div>
              </div>

              <div
                onClick={() => setData(prev => ({ ...prev, phoneNumberType: 'production' }))}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  data.phoneNumberType === 'production'
                    ? 'border-green-500 bg-green-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {data.phoneNumberType === 'production' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <div className="h-5 w-5 border-2 border-slate-300 rounded-full" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1">
                      Option B: Eigene Nummer verbinden
                    </h3>
                    <p className="text-sm text-slate-600">
                      Verwenden Sie Ihre eigene Geschäftsnummer. Erfordert Verifizierung per SMS.
                    </p>
                    <Badge variant="outline" className="mt-2">Für Produktion</Badge>
                  </div>
                </div>
              </div>
            </div>

            {data.phoneNumberType && (
              <div className="space-y-4 pt-4 border-t">
                <div>
                  <Label htmlFor="phoneNumberId">Phone Number ID *</Label>
                  <Input
                    id="phoneNumberId"
                    placeholder="123456789012345"
                    value={data.phoneNumberId}
                    onChange={(e) => setData(prev => ({ ...prev, phoneNumberId: e.target.value }))}
                    className="mt-1"
                  />
                  <p className="text-sm text-slate-500 mt-1">
                    Finden Sie die Phone Number ID in Ihrer WhatsApp App-Konfiguration unter "API Setup"
                  </p>
                </div>

                {data.phoneNumberType === 'production' && (
                  <div>
                    <Label htmlFor="phoneNumber">Telefonnummer</Label>
                    <Input
                      id="phoneNumber"
                      placeholder="+41791234567"
                      value={data.phoneNumber}
                      onChange={(e) => setData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="wabaId">WhatsApp Business Account ID (WABA ID) *</Label>
                  <Input
                    id="wabaId"
                    placeholder="123456789012345"
                    value={data.wabaId}
                    onChange={(e) => setData(prev => ({ ...prev, wabaId: e.target.value }))}
                    className="mt-1"
                  />
                  <p className="text-sm text-slate-500 mt-1">
                    Die WABA ID finden Sie in Ihrem Meta Business Manager
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Key className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Access Token generieren</h2>
                <p className="text-slate-600">Erstellen Sie einen dauerhaften Access Token</p>
              </div>
            </div>

            <Alert>
              <AlertDescription>
                <div className="space-y-3">
                  <p className="font-medium">So generieren Sie den Token:</p>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Gehen Sie zu Meta Business Settings → System Users</li>
                    <li>Erstellen Sie einen neuen System User (oder wählen Sie einen bestehenden)</li>
                    <li>Klicken Sie auf "Token generieren"</li>
                    <li>Wählen Sie Ihre WhatsApp App aus</li>
                    <li>Aktivieren Sie diese Permissions:
                      <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                        <li><code className="text-xs bg-slate-100 px-1 py-0.5 rounded">whatsapp_business_management</code></li>
                        <li><code className="text-xs bg-slate-100 px-1 py-0.5 rounded">whatsapp_business_messaging</code></li>
                      </ul>
                    </li>
                    <li>Kopieren Sie den generierten Token (60 Tage oder dauerhaft)</li>
                  </ol>
                </div>
              </AlertDescription>
            </Alert>

            <div>
              <Label htmlFor="accessToken">Access Token *</Label>
              <Input
                id="accessToken"
                type="password"
                placeholder="EAAxxxxxxxxxxxxxxxxx..."
                value={data.accessToken}
                onChange={(e) => setData(prev => ({ ...prev, accessToken: e.target.value }))}
                className="mt-1 font-mono text-sm"
              />
              <p className="text-sm text-slate-500 mt-1">
                Der Token beginnt üblicherweise mit "EAA"
              </p>
            </div>

            {data.accessToken && data.phoneNumberId && (
              <Button
                onClick={testToken}
                disabled={isLoading || testSuccess}
                variant={testSuccess ? 'default' : 'outline'}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Teste Verbindung...
                  </>
                ) : testSuccess ? (
                  <>
                    <CheckCheck className="mr-2 h-4 w-4" />
                    Token erfolgreich getestet! ✅
                  </>
                ) : (
                  'Token jetzt testen'
                )}
              </Button>
            )}

            {testSuccess && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Verbindung erfolgreich! Sie können zum nächsten Schritt übergehen.
                </AlertDescription>
              </Alert>
            )}
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <Webhook className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Webhook konfigurieren</h2>
                <p className="text-slate-600">Empfangen Sie Nachrichten in DealerOS</p>
              </div>
            </div>

            <Alert>
              <AlertDescription>
                <p className="font-medium mb-2">Kopieren Sie die folgenden Werte:</p>
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <Label>Webhook URL</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={webhookUrl}
                    readOnly
                    className="font-mono text-sm bg-slate-50"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(webhookUrl, 'webhook')}
                  >
                    {copiedWebhook ? (
                      <CheckCheck className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <Label>Verify Token</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={data.verifyToken}
                    readOnly
                    className="font-mono text-sm bg-slate-50"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(data.verifyToken, 'token')}
                  >
                    {copiedToken ? (
                      <CheckCheck className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <Alert>
              <AlertDescription>
                <div className="space-y-3">
                  <p className="font-medium">Webhook in Meta konfigurieren:</p>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Öffnen Sie Ihre WhatsApp App in developers.facebook.com</li>
                    <li>Gehen Sie zu WhatsApp → Configuration</li>
                    <li>Klicken Sie bei "Webhook" auf "Edit"</li>
                    <li>Fügen Sie die <strong>Webhook URL</strong> ein</li>
                    <li>Fügen Sie den <strong>Verify Token</strong> ein</li>
                    <li>Klicken Sie auf "Verify and Save"</li>
                    <li>Aktivieren Sie die Webhook-Felder:
                      <ul className="list-disc list-inside ml-4 mt-1">
                        <li>messages</li>
                        <li>message_status</li>
                      </ul>
                    </li>
                  </ol>
                </div>
              </AlertDescription>
            </Alert>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open('https://developers.facebook.com/apps', '_blank')}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Zur WhatsApp App-Konfiguration
            </Button>

            <div className="border-t pt-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="webhookConfigured"
                  checked={data.webhookConfigured}
                  onCheckedChange={(checked) => 
                    setData(prev => ({ ...prev, webhookConfigured: checked as boolean }))
                  }
                />
                <div className="space-y-1">
                  <label
                    htmlFor="webhookConfigured"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Webhook erfolgreich konfiguriert und verifiziert
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-pink-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Test-Nachricht senden</h2>
                <p className="text-slate-600">Überprüfen Sie Ihre Konfiguration</p>
              </div>
            </div>

            <Alert>
              <AlertDescription>
                Senden Sie eine Test-Nachricht an Ihre WhatsApp-Nummer, um zu überprüfen,
                dass alles korrekt eingerichtet ist.
              </AlertDescription>
            </Alert>

            <div>
              <Label htmlFor="testPhoneNumber">Test-Telefonnummer</Label>
              <Input
                id="testPhoneNumber"
                placeholder="+41791234567"
                value={data.phoneNumber}
                onChange={(e) => setData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                className="mt-1"
              />
              <p className="text-sm text-slate-500 mt-1">
                Die Nummer muss im internationalen Format (+41...) angegeben werden
              </p>
            </div>

            <Button
              onClick={sendTestMessage}
              disabled={isLoading || !data.phoneNumber}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sende Nachricht...
                </>
              ) : (
                <>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Test-Nachricht jetzt senden
                </>
              )}
            </Button>

            <div className="bg-slate-50 border rounded-lg p-4">
              <p className="text-sm text-slate-700">
                <strong>Hinweis:</strong> Wenn Sie die Test-Nachricht erfolgreich empfangen haben,
                ist Ihre WhatsApp Integration vollständig eingerichtet! 🎉
              </p>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <div className="text-center py-8">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <PartyPopper className="h-10 w-10 text-green-600" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Fertig! 🎉
              </h2>
              <p className="text-lg text-slate-600 mb-6 max-w-2xl mx-auto">
                Ihre WhatsApp Business Integration ist jetzt vollständig eingerichtet und einsatzbereit!
              </p>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6 max-w-xl mx-auto text-left">
                <h3 className="font-semibold text-slate-900 mb-3">Zusammenfassung Ihrer Konfiguration:</h3>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span><strong>Telefonnummer:</strong> {data.phoneNumber || 'Test-Nummer'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span><strong>Phone Number ID:</strong> {data.phoneNumberId}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span><strong>WABA ID:</strong> {data.wabaId}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span><strong>Access Token:</strong> Konfiguriert ✅</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span><strong>Webhook:</strong> Konfiguriert ✅</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3 max-w-md mx-auto">
                <Button
                  onClick={saveConfiguration}
                  disabled={isLoading}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Speichere Konfiguration...
                    </>
                  ) : (
                    'Konfiguration speichern und abschließen'
                  )}
                </Button>

                <p className="text-sm text-slate-500">
                  Nach dem Speichern können Sie Ihre WhatsApp-Konversationen verwalten
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700">
            Schritt {currentStep} von {totalSteps}
          </span>
          <span className="text-sm text-slate-500">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="pt-6">
          {renderStep()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Zurück
        </Button>

        {currentStep < totalSteps && (
          <Button
            onClick={nextStep}
            disabled={!canGoNext()}
          >
            Weiter
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Completed Steps Indicator */}
      <div className="flex items-center justify-center gap-2 mt-6">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={`h-2 w-2 rounded-full transition-all ${
              index + 1 < currentStep
                ? 'bg-green-500'
                : index + 1 === currentStep
                ? 'bg-blue-500 w-4'
                : 'bg-slate-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
