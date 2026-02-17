'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { WhatsAppConnection } from '@/types/whatsapp';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, XCircle, Loader2, Phone } from 'lucide-react';

interface WhatsAppSettingsClientProps {
  dealerId: string;
  initialConnection: WhatsAppConnection | null;
}

const setupSchema = z.object({
  phone_number_id: z.string().min(1, 'Phone Number ID ist erforderlich'),
  phone_number: z.string().min(1, 'Telefonnummer ist erforderlich'),
  waba_id: z.string().min(1, 'WhatsApp Business Account ID ist erforderlich'),
  access_token: z.string().min(1, 'Access Token ist erforderlich'),
  verify_token: z.string().optional(),
  display_name: z.string().optional(),
});

const autoReplySchema = z.object({
  auto_reply_enabled: z.boolean(),
  auto_reply_message: z.string().min(1, 'Auto-Reply Nachricht ist erforderlich').max(1000),
});

type SetupFormData = z.infer<typeof setupSchema>;
type AutoReplyFormData = z.infer<typeof autoReplySchema>;

export function WhatsAppSettingsClient({ dealerId, initialConnection }: WhatsAppSettingsClientProps) {
  const [connection, setConnection] = useState<WhatsAppConnection | null>(initialConnection);
  const [isLoading, setIsLoading] = useState(false);
  const [showSetup, setShowSetup] = useState(!initialConnection);
  const supabase = createClient();

  // Setup form
  const setupForm = useForm<SetupFormData>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      phone_number_id: connection?.phone_number_id || '',
      phone_number: connection?.phone_number || '',
      waba_id: connection?.waba_id || '',
      access_token: connection?.access_token || '',
      verify_token: connection?.verify_token || `dealer-os-${dealerId}`,
      display_name: connection?.display_name || '',
    },
  });

  // Auto-reply form
  const autoReplyForm = useForm<AutoReplyFormData>({
    resolver: zodResolver(autoReplySchema),
    defaultValues: {
      auto_reply_enabled: connection?.auto_reply_enabled || false,
      auto_reply_message:
        connection?.auto_reply_message ||
        'Danke für Ihre Nachricht! Wir melden uns so schnell wie möglich bei Ihnen.',
    },
  });

  const onSetupSubmit = async (data: SetupFormData) => {
    setIsLoading(true);
    try {
      if (connection) {
        // Update existing connection
        const { error } = await supabase
          .from('whatsapp_connections')
          .update({
            phone_number_id: data.phone_number_id,
            phone_number: data.phone_number,
            waba_id: data.waba_id,
            access_token: data.access_token,
            verify_token: data.verify_token,
            display_name: data.display_name,
            status: 'active',
          })
          .eq('id', connection.id);

        if (error) throw error;
        toast.success('WhatsApp-Verbindung aktualisiert!');
      } else {
        // Create new connection
        const { data: newConnection, error } = await supabase
          .from('whatsapp_connections')
          .insert({
            dealer_id: dealerId,
            phone_number_id: data.phone_number_id,
            phone_number: data.phone_number,
            waba_id: data.waba_id,
            access_token: data.access_token,
            verify_token: data.verify_token,
            display_name: data.display_name,
            status: 'active',
          })
          .select()
          .single();

        if (error) throw error;
        setConnection(newConnection);
        setShowSetup(false);
        toast.success('WhatsApp erfolgreich verbunden!');
      }

      // Refresh connection data
      const { data: refreshed } = await supabase
        .from('whatsapp_connections')
        .select('*')
        .eq('dealer_id', dealerId)
        .single();

      if (refreshed) setConnection(refreshed);
    } catch (error) {
      console.error('Setup error:', error);
      toast.error('Fehler beim Speichern der Verbindung');
    } finally {
      setIsLoading(false);
    }
  };

  const onAutoReplySubmit = async (data: AutoReplyFormData) => {
    if (!connection) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('whatsapp_connections')
        .update({
          auto_reply_enabled: data.auto_reply_enabled,
          auto_reply_message: data.auto_reply_message,
        })
        .eq('id', connection.id);

      if (error) throw error;

      setConnection({
        ...connection,
        auto_reply_enabled: data.auto_reply_enabled,
        auto_reply_message: data.auto_reply_message,
      });

      toast.success('Auto-Reply Einstellungen gespeichert!');
    } catch (error) {
      console.error('Auto-reply error:', error);
      toast.error('Fehler beim Speichern der Auto-Reply Einstellungen');
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWhatsApp = async () => {
    if (!connection) return;

    if (!confirm('Möchten Sie die WhatsApp-Verbindung wirklich trennen?')) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('whatsapp_connections')
        .update({ status: 'disconnected' })
        .eq('id', connection.id);

      if (error) throw error;

      setConnection(null);
      setShowSetup(true);
      toast.success('WhatsApp-Verbindung getrennt');
    } catch (error) {
      console.error('Disconnect error:', error);
      toast.error('Fehler beim Trennen der Verbindung');
    } finally {
      setIsLoading(false);
    }
  };

  const webhookUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/webhooks/whatsapp`
    : '';

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Verbindungsstatus
          </CardTitle>
        </CardHeader>
        <CardContent>
          {connection && connection.status === 'active' ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="font-medium">Verbunden</span>
                <Badge variant="outline" className="ml-auto">
                  {connection.phone_number}
                </Badge>
              </div>
              {connection.display_name && (
                <div className="text-sm text-slate-600">
                  Display Name: <span className="font-medium">{connection.display_name}</span>
                </div>
              )}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowSetup(!showSetup)}>
                  {showSetup ? 'Setup ausblenden' : 'Setup bearbeiten'}
                </Button>
                <Button variant="outline" size="sm" onClick={disconnectWhatsApp} disabled={isLoading}>
                  Trennen
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-slate-400" />
              <span>Nicht verbunden</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Setup Form */}
      {showSetup && (
        <Card>
          <CardHeader>
            <CardTitle>WhatsApp Business Setup</CardTitle>
            <CardDescription>
              Verbinden Sie Ihre WhatsApp Business Nummer mit DealerOS
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={setupForm.handleSubmit(onSetupSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="phone_number">Telefonnummer</Label>
                <Input
                  id="phone_number"
                  placeholder="+41791234567"
                  {...setupForm.register('phone_number')}
                />
                {setupForm.formState.errors.phone_number && (
                  <p className="text-sm text-red-600 mt-1">
                    {setupForm.formState.errors.phone_number.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="phone_number_id">Phone Number ID</Label>
                <Input
                  id="phone_number_id"
                  placeholder="Von Meta Developer Console"
                  {...setupForm.register('phone_number_id')}
                />
                {setupForm.formState.errors.phone_number_id && (
                  <p className="text-sm text-red-600 mt-1">
                    {setupForm.formState.errors.phone_number_id.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="waba_id">WhatsApp Business Account ID (WABA ID)</Label>
                <Input
                  id="waba_id"
                  placeholder="Von Meta Developer Console"
                  {...setupForm.register('waba_id')}
                />
                {setupForm.formState.errors.waba_id && (
                  <p className="text-sm text-red-600 mt-1">
                    {setupForm.formState.errors.waba_id.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="access_token">Access Token</Label>
                <Input
                  id="access_token"
                  type="password"
                  placeholder="Von Meta Developer Console"
                  {...setupForm.register('access_token')}
                />
                {setupForm.formState.errors.access_token && (
                  <p className="text-sm text-red-600 mt-1">
                    {setupForm.formState.errors.access_token.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="display_name">Display Name (optional)</Label>
                <Input
                  id="display_name"
                  placeholder="z.B. Autohaus Müller"
                  {...setupForm.register('display_name')}
                />
              </div>

              <div className="border-t pt-4">
                <Label htmlFor="verify_token">Webhook Verify Token</Label>
                <Input
                  id="verify_token"
                  {...setupForm.register('verify_token')}
                  readOnly
                  className="bg-slate-50"
                />
                <p className="text-sm text-slate-600 mt-1">
                  Verwenden Sie diesen Token bei der Webhook-Konfiguration in Meta
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <Label className="text-sm font-medium">Webhook URL</Label>
                <code className="block mt-1 text-xs bg-white p-2 rounded border">
                  {webhookUrl}
                </code>
                <p className="text-sm text-slate-600 mt-2">
                  Tragen Sie diese URL in Ihrer WhatsApp Business App-Konfiguration ein
                </p>
              </div>

              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {connection ? 'Verbindung aktualisieren' : 'Verbinden'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Auto-Reply Settings */}
      {connection && connection.status === 'active' && (
        <Card>
          <CardHeader>
            <CardTitle>Auto-Reply Einstellungen</CardTitle>
            <CardDescription>
              Automatische Antwort bei neuen Konversationen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={autoReplyForm.handleSubmit(onAutoReplySubmit)} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto_reply_enabled">Auto-Reply aktivieren</Label>
                  <p className="text-sm text-slate-600">
                    Sendet automatisch eine Nachricht bei neuen Leads
                  </p>
                </div>
                <Switch
                  id="auto_reply_enabled"
                  checked={autoReplyForm.watch('auto_reply_enabled')}
                  onCheckedChange={(checked) =>
                    autoReplyForm.setValue('auto_reply_enabled', checked)
                  }
                />
              </div>

              {autoReplyForm.watch('auto_reply_enabled') && (
                <div>
                  <Label htmlFor="auto_reply_message">Auto-Reply Nachricht</Label>
                  <Textarea
                    id="auto_reply_message"
                    rows={4}
                    placeholder="Ihre automatische Nachricht..."
                    {...autoReplyForm.register('auto_reply_message')}
                  />
                  {autoReplyForm.formState.errors.auto_reply_message && (
                    <p className="text-sm text-red-600 mt-1">
                      {autoReplyForm.formState.errors.auto_reply_message.message}
                    </p>
                  )}
                  <p className="text-sm text-slate-600 mt-1">
                    Diese Nachricht wird bei neuen WhatsApp-Konversationen automatisch gesendet
                  </p>
                </div>
              )}

              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Speichern
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
