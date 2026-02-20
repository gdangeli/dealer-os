"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EmailTemplateManager } from "@/components/email/email-template-manager";
import { TeamManagement } from "@/components/settings/team-management";
import { LanguageSwitcher } from "@/components/dashboard/language-switcher";

// Types
interface Dealer {
  id: string;
  user_id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  subscription_plan?: string;
  notification_new_lead?: boolean;
  notification_daily_summary?: boolean;
  notification_longstanding_days?: number;
  notification_quote_expiry?: boolean;
  notification_quote_expiry_days?: number;
  notification_invoice_overdue?: boolean;
}

interface SettingsClientProps {
  initialDealer: Dealer;
  userEmail: string;
}

// Validation Schemas
const companyProfileSchema = z.object({
  company_name: z.string().min(2, "Firmenname muss mindestens 2 Zeichen haben"),
  contact_name: z.string().optional(),
  email: z.string().email("Ungültige E-Mail-Adresse"),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
});

const userSettingsSchema = z.object({
  contact_name: z.string().min(2, "Name muss mindestens 2 Zeichen haben"),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, "Mindestens 6 Zeichen"),
  newPassword: z.string().min(6, "Mindestens 6 Zeichen"),
  confirmPassword: z.string().min(6, "Mindestens 6 Zeichen"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwörter stimmen nicht überein",
  path: ["confirmPassword"],
});

const notificationSchema = z.object({
  notification_new_lead: z.boolean(),
  notification_daily_summary: z.boolean(),
  notification_longstanding_days: z.number().min(1).max(365),
});

type CompanyProfileFormData = z.infer<typeof companyProfileSchema>;
type UserSettingsFormData = z.infer<typeof userSettingsSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;
type NotificationFormData = z.infer<typeof notificationSchema>;

export function SettingsClient({ initialDealer, userEmail }: SettingsClientProps) {
  const [dealer, setDealer] = useState(initialDealer);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const supabase = createClient();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Einstellungen</h1>
        <p className="text-slate-600">Verwalten Sie Ihr Konto und Ihre Präferenzen.</p>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="bg-white border inline-flex w-max sm:w-auto sm:flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="company" className="whitespace-nowrap text-xs sm:text-sm">🏢 Firma</TabsTrigger>
            <TabsTrigger value="locations" className="whitespace-nowrap text-xs sm:text-sm">📍 Standorte</TabsTrigger>
            <TabsTrigger value="user" className="whitespace-nowrap text-xs sm:text-sm">👤 Benutzer</TabsTrigger>
            <TabsTrigger value="team" className="whitespace-nowrap text-xs sm:text-sm">👥 Team</TabsTrigger>
            <TabsTrigger value="notifications" className="whitespace-nowrap text-xs sm:text-sm">🔔 Alerts</TabsTrigger>
            <TabsTrigger value="email-templates" className="whitespace-nowrap text-xs sm:text-sm">✉️ E-Mails</TabsTrigger>
            <TabsTrigger value="channels" className="whitespace-nowrap text-xs sm:text-sm">📡 Kanäle</TabsTrigger>
            <TabsTrigger value="billing" className="whitespace-nowrap text-xs sm:text-sm">💳 Abo</TabsTrigger>
            <TabsTrigger value="danger" className="whitespace-nowrap text-xs sm:text-sm">⚠️ Gefahr</TabsTrigger>
          </TabsList>
        </div>

        {/* Firmenprofil Tab */}
        <TabsContent value="company">
          <CompanyProfileForm 
            dealer={dealer} 
            onUpdate={setDealer} 
            supabase={supabase} 
          />
        </TabsContent>

        {/* Standorte Tab */}
        <TabsContent value="locations">
          <LocationsRedirect />
        </TabsContent>

        {/* Benutzer Tab */}
        <TabsContent value="user">
          <UserSettingsForm 
            dealer={dealer}
            userEmail={userEmail}
            onUpdate={setDealer}
            supabase={supabase}
          />
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team">
          <TeamManagement 
            dealerId={dealer.id}
            dealerPlan={dealer.subscription_plan || 'starter'}
          />
        </TabsContent>

        {/* Benachrichtigungen Tab */}
        <TabsContent value="notifications">
          <NotificationsForm 
            dealer={dealer}
            onUpdate={setDealer}
            supabase={supabase}
          />
        </TabsContent>

        {/* E-Mail-Vorlagen Tab */}
        <TabsContent value="email-templates">
          <EmailTemplateManager dealerId={dealer.id} />
        </TabsContent>

        {/* Inserate-Kanäle Tab */}
        <TabsContent value="channels">
          <ChannelsPlaceholder />
        </TabsContent>

        {/* Abo & Rechnung Tab */}
        <TabsContent value="billing">
          <BillingPlaceholder />
        </TabsContent>

        {/* Gefahrenzone Tab */}
        <TabsContent value="danger">
          <DangerZone 
            dealer={dealer}
            isDeleting={isDeleting}
            setIsDeleting={setIsDeleting}
            deleteConfirmOpen={deleteConfirmOpen}
            setDeleteConfirmOpen={setDeleteConfirmOpen}
            deleteConfirmText={deleteConfirmText}
            setDeleteConfirmText={setDeleteConfirmText}
            supabase={supabase}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================================
// Firmenprofil Form
// ============================================================================
function CompanyProfileForm({ 
  dealer, 
  onUpdate, 
  supabase 
}: { 
  dealer: Dealer; 
  onUpdate: (d: Dealer) => void;
  supabase: ReturnType<typeof createClient>;
}) {
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<CompanyProfileFormData>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: {
      company_name: dealer.company_name || "",
      contact_name: dealer.contact_name || "",
      email: dealer.email || "",
      phone: dealer.phone || "",
      address: dealer.address || "",
      city: dealer.city || "",
      postal_code: dealer.postal_code || "",
    },
  });

  const onSubmit = async (data: CompanyProfileFormData) => {
    setIsLoading(true);
    try {
      const { data: updated, error } = await supabase
        .from('dealers')
        .update(data)
        .eq('id', dealer.id)
        .select()
        .single();

      if (error) throw error;
      
      onUpdate(updated);
      toast.success("Firmenprofil gespeichert");
    } catch (error) {
      console.error(error);
      toast.error("Fehler beim Speichern");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Firmenprofil</CardTitle>
        <CardDescription>
          Ihre Firmendaten werden auf Anfrage-E-Mails und in Inseraten angezeigt.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company_name">Firmenname *</Label>
              <Input 
                id="company_name" 
                {...register("company_name")} 
                placeholder="Muster Garage AG"
              />
              {errors.company_name && (
                <p className="text-sm text-red-500">{errors.company_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_name">Kontaktperson</Label>
              <Input 
                id="contact_name" 
                {...register("contact_name")} 
                placeholder="Hans Muster"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-Mail *</Label>
              <Input 
                id="email" 
                type="email"
                {...register("email")} 
                placeholder="info@garage.ch"
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input 
                id="phone" 
                type="tel"
                {...register("phone")} 
                placeholder="+41 44 123 45 67"
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-4">Adresse</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Strasse & Nr.</Label>
                <Input 
                  id="address" 
                  {...register("address")} 
                  placeholder="Hauptstrasse 1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postal_code">PLZ</Label>
                <Input 
                  id="postal_code" 
                  {...register("postal_code")} 
                  placeholder="8000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Ort</Label>
                <Input 
                  id="city" 
                  {...register("city")} 
                  placeholder="Zürich"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Speichern..." : "Änderungen speichern"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Benutzer-Einstellungen Form
// ============================================================================
function UserSettingsForm({ 
  dealer, 
  userEmail,
  onUpdate, 
  supabase 
}: { 
  dealer: Dealer; 
  userEmail: string;
  onUpdate: (d: Dealer) => void;
  supabase: ReturnType<typeof createClient>;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const { register: registerUser, handleSubmit: handleSubmitUser, formState: { errors: userErrors } } = useForm<UserSettingsFormData>({
    resolver: zodResolver(userSettingsSchema),
    defaultValues: {
      contact_name: dealer.contact_name || "",
    },
  });

  const { register: registerPassword, handleSubmit: handleSubmitPassword, formState: { errors: passwordErrors }, reset: resetPassword } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmitUser = async (data: UserSettingsFormData) => {
    setIsLoading(true);
    try {
      const { data: updated, error } = await supabase
        .from('dealers')
        .update({ contact_name: data.contact_name })
        .eq('id', dealer.id)
        .select()
        .single();

      if (error) throw error;
      
      onUpdate(updated);
      toast.success("Benutzerdaten gespeichert");
    } catch (error) {
      console.error(error);
      toast.error("Fehler beim Speichern");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitPassword = async (data: PasswordFormData) => {
    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword
      });

      if (error) throw error;
      
      toast.success("Passwort wurde geändert");
      resetPassword();
    } catch (error: unknown) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Fehler beim Ändern des Passworts";
      toast.error(errorMessage);
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sprache */}
      <Card>
        <CardHeader>
          <CardTitle>🌐 Sprache</CardTitle>
          <CardDescription>
            Wählen Sie Ihre bevorzugte Sprache für die Benutzeroberfläche.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LanguageSwitcher />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Benutzerdaten</CardTitle>
          <CardDescription>
            Ihre persönlichen Angaben für Ihr Dealer OS Konto.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitUser(onSubmitUser)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user_contact_name">Name</Label>
              <Input 
                id="user_contact_name" 
                {...registerUser("contact_name")} 
                placeholder="Ihr Name"
              />
              {userErrors.contact_name && (
                <p className="text-sm text-red-500">{userErrors.contact_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>E-Mail-Adresse</Label>
              <Input 
                value={userEmail}
                disabled
                className="bg-slate-50"
              />
              <p className="text-sm text-slate-500">
                E-Mail-Änderung ist momentan nicht verfügbar.
              </p>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Speichern..." : "Speichern"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Passwort ändern</CardTitle>
          <CardDescription>
            Wählen Sie ein sicheres Passwort mit mindestens 6 Zeichen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Aktuelles Passwort</Label>
              <Input 
                id="currentPassword" 
                type="password"
                {...registerPassword("currentPassword")} 
              />
              {passwordErrors.currentPassword && (
                <p className="text-sm text-red-500">{passwordErrors.currentPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Neues Passwort</Label>
              <Input 
                id="newPassword" 
                type="password"
                {...registerPassword("newPassword")} 
              />
              {passwordErrors.newPassword && (
                <p className="text-sm text-red-500">{passwordErrors.newPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
              <Input 
                id="confirmPassword" 
                type="password"
                {...registerPassword("confirmPassword")} 
              />
              {passwordErrors.confirmPassword && (
                <p className="text-sm text-red-500">{passwordErrors.confirmPassword.message}</p>
              )}
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isChangingPassword}>
                {isChangingPassword ? "Ändern..." : "Passwort ändern"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// Benachrichtigungen Form
// ============================================================================
function NotificationsForm({ 
  dealer, 
  onUpdate, 
  supabase 
}: { 
  dealer: Dealer; 
  onUpdate: (d: Dealer) => void;
  supabase: ReturnType<typeof createClient>;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [notifyNewLead, setNotifyNewLead] = useState(dealer.notification_new_lead ?? true);
  const [notifyDailySummary, setNotifyDailySummary] = useState(dealer.notification_daily_summary ?? false);
  const [longstandingDays, setLongstandingDays] = useState(dealer.notification_longstanding_days ?? 30);
  const [notifyQuoteExpiry, setNotifyQuoteExpiry] = useState(dealer.notification_quote_expiry ?? true);
  const [quoteExpiryDays, setQuoteExpiryDays] = useState(dealer.notification_quote_expiry_days ?? 3);
  const [notifyInvoiceOverdue, setNotifyInvoiceOverdue] = useState(dealer.notification_invoice_overdue ?? true);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { data: updated, error } = await supabase
        .from('dealers')
        .update({
          notification_new_lead: notifyNewLead,
          notification_daily_summary: notifyDailySummary,
          notification_longstanding_days: longstandingDays,
          notification_quote_expiry: notifyQuoteExpiry,
          notification_quote_expiry_days: quoteExpiryDays,
          notification_invoice_overdue: notifyInvoiceOverdue,
        })
        .eq('id', dealer.id)
        .select()
        .single();

      if (error) throw error;
      
      onUpdate(updated);
      toast.success("Benachrichtigungen gespeichert");
    } catch (error) {
      console.error(error);
      toast.error("Fehler beim Speichern");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Lead Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>🔔 Anfragen & Leads</CardTitle>
          <CardDescription>
            Benachrichtigungen zu Kundenanfragen.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Neue Anfragen</Label>
              <p className="text-sm text-slate-500">
                Sofort-E-Mail, wenn ein Kunde eine Anfrage stellt.
              </p>
            </div>
            <Switch 
              checked={notifyNewLead}
              onCheckedChange={setNotifyNewLead}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Tägliche Zusammenfassung</Label>
              <p className="text-sm text-slate-500">
                Jeden Morgen um 7:00 Uhr eine Übersicht.
              </p>
            </div>
            <Switch 
              checked={notifyDailySummary}
              onCheckedChange={setNotifyDailySummary}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quote & Invoice Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>📄 Offerten & Rechnungen</CardTitle>
          <CardDescription>
            Erinnerungen für ablaufende Offerten und überfällige Rechnungen.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Offerten-Erinnerung</Label>
              <p className="text-sm text-slate-500">
                E-Mail, wenn Offerten bald ablaufen.
              </p>
            </div>
            <Switch 
              checked={notifyQuoteExpiry}
              onCheckedChange={setNotifyQuoteExpiry}
            />
          </div>

          {notifyQuoteExpiry && (
            <div className="ml-4 pl-4 border-l-2 border-blue-200">
              <div className="space-y-2">
                <Label htmlFor="quote_expiry_days">Erinnerung vor Ablauf</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    id="quote_expiry_days"
                    type="number"
                    min={1}
                    max={14}
                    value={quoteExpiryDays}
                    onChange={(e) => setQuoteExpiryDays(parseInt(e.target.value) || 3)}
                    className="w-20"
                  />
                  <span className="text-slate-600">Tage vorher</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Überfällige Rechnungen</Label>
              <p className="text-sm text-slate-500">
                E-Mail, wenn Rechnungen überfällig sind (wöchentlich).
              </p>
            </div>
            <Switch 
              checked={notifyInvoiceOverdue}
              onCheckedChange={setNotifyInvoiceOverdue}
            />
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>🚗 Fahrzeug-Bestand</CardTitle>
          <CardDescription>
            Warnungen zu lange im Bestand stehenden Fahrzeugen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="longstanding_days">Langsteher-Warnung nach</Label>
            <div className="flex items-center gap-2">
              <Input 
                id="longstanding_days"
                type="number"
                min={1}
                max={365}
                value={longstandingDays}
                onChange={(e) => setLongstandingDays(parseInt(e.target.value) || 30)}
                className="w-24"
              />
              <span className="text-slate-600">Tagen im Bestand</span>
            </div>
            <p className="text-sm text-slate-500">
              Wöchentliche E-Mail mit Fahrzeugen, die länger als diese Anzahl Tage im Bestand sind.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading} size="lg">
          {isLoading ? "Speichern..." : "💾 Alle Einstellungen speichern"}
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// Inserate-Kanäle Placeholder
// ============================================================================
function ChannelsPlaceholder() {
  const channels = [
    { name: "AutoScout24", icon: "🚗", description: "Schweizer Automarktplatz Nr. 1", status: "coming_soon" },
    { name: "mobile.de", icon: "🇩🇪", description: "Deutscher Automarktplatz", status: "coming_soon" },
    { name: "tutti.ch", icon: "🏷️", description: "Schweizer Kleinanzeigen", status: "coming_soon" },
    { name: "Facebook Marketplace", icon: "📘", description: "Soziales Netzwerk", status: "coming_soon" },
  ];

  const communicationChannels = [
    { 
      name: "WhatsApp Business", 
      icon: "💬", 
      description: "Direkte Kommunikation mit Interessenten",
      status: "active",
      href: "/dashboard/settings/whatsapp"
    },
  ];

  const integrationChannels = [
    { 
      name: "Bexio", 
      icon: "📊", 
      description: "Buchhaltung und Rechnungen synchronisieren",
      status: "active",
      href: "/dashboard/settings/bexio"
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Kommunikations-Kanäle</CardTitle>
          <CardDescription>
            Verwalten Sie Ihre Kommunikations-Kanäle für Lead-Interaktionen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {communicationChannels.map((channel) => (
              <div 
                key={channel.name}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{channel.icon}</span>
                  <div>
                    <div className="font-medium">{channel.name}</div>
                    <div className="text-sm text-slate-500">{channel.description}</div>
                  </div>
                </div>
                <Button asChild size="sm">
                  <a href={channel.href}>Einrichten →</a>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integrationen</CardTitle>
          <CardDescription>
            Verbinden Sie externe Systeme für automatischen Datenaustausch.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {integrationChannels.map((channel) => (
              <div 
                key={channel.name}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{channel.icon}</span>
                  <div>
                    <div className="font-medium">{channel.name}</div>
                    <div className="text-sm text-slate-500">{channel.description}</div>
                  </div>
                </div>
                <Button asChild size="sm">
                  <a href={channel.href}>Einrichten →</a>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Inserate-Kanäle</CardTitle>
          <CardDescription>
            Verbinden Sie Ihre Plattformen, um Fahrzeuge automatisch zu publizieren.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800">
              🚀 <strong>Coming Soon!</strong> Bald können Sie Ihre Inserate-Kanäle hier verbinden 
              und Fahrzeuge mit einem Klick auf mehreren Plattformen gleichzeitig publizieren.
            </p>
          </div>

          <div className="space-y-4">
            {channels.map((channel) => (
              <div 
                key={channel.name}
                className="flex items-center justify-between p-4 border rounded-lg bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{channel.icon}</span>
                  <div>
                    <div className="font-medium">{channel.name}</div>
                    <div className="text-sm text-slate-500">{channel.description}</div>
                  </div>
                </div>
                <Badge variant="secondary">Coming Soon</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// Abo & Rechnung - Redirect to dedicated page
// ============================================================================
function BillingPlaceholder() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Abo & Rechnung</CardTitle>
        <CardDescription>
          Verwalten Sie Ihr Abonnement und Zahlungsmethoden.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center py-8">
        <p className="text-slate-600 mb-4">
          Die Abo-Verwaltung wurde auf eine eigene Seite verschoben.
        </p>
        <Button asChild>
          <a href="/dashboard/settings/billing">
            Zur Abo-Verwaltung →
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Gefahrenzone
// ============================================================================
function DangerZone({ 
  dealer,
  isDeleting,
  setIsDeleting,
  deleteConfirmOpen,
  setDeleteConfirmOpen,
  deleteConfirmText,
  setDeleteConfirmText,
  supabase,
}: {
  dealer: Dealer;
  isDeleting: boolean;
  setIsDeleting: (v: boolean) => void;
  deleteConfirmOpen: boolean;
  setDeleteConfirmOpen: (v: boolean) => void;
  deleteConfirmText: string;
  setDeleteConfirmText: (v: string) => void;
  supabase: ReturnType<typeof createClient>;
}) {
  const handleExportData = async () => {
    toast.info("Export wird vorbereitet...");
    
    try {
      // Fetch all dealer data
      const { data: vehicles } = await supabase
        .from('vehicles')
        .select('*')
        .eq('dealer_id', dealer.id);
      
      const { data: leads } = await supabase
        .from('leads')
        .select('*')
        .eq('dealer_id', dealer.id);

      const exportData = {
        exportDate: new Date().toISOString(),
        dealer: dealer,
        vehicles: vehicles || [],
        leads: leads || [],
      };

      // Create download
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dealer-os-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Daten exportiert!");
    } catch (error) {
      console.error(error);
      toast.error("Fehler beim Exportieren");
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "LÖSCHEN") return;
    
    setIsDeleting(true);
    try {
      // Delete all related data
      await supabase.from('leads').delete().eq('dealer_id', dealer.id);
      await supabase.from('vehicle_images').delete().match({ vehicle_id: dealer.id }); // Will be handled by cascade
      await supabase.from('vehicles').delete().eq('dealer_id', dealer.id);
      await supabase.from('dealers').delete().eq('id', dealer.id);
      
      // Sign out and redirect
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (error) {
      console.error(error);
      toast.error("Fehler beim Löschen des Kontos");
      setIsDeleting(false);
    }
  };

  const [isResettingOnboarding, setIsResettingOnboarding] = useState(false);

  const handleRestartOnboarding = async () => {
    setIsResettingOnboarding(true);
    try {
      const { error } = await supabase
        .from('dealers')
        .update({ onboarding_completed: false })
        .eq('id', dealer.id);

      if (error) throw error;
      
      toast.success("Onboarding wird neu gestartet...");
      // Redirect to onboarding
      window.location.href = '/onboarding';
    } catch (error) {
      console.error(error);
      toast.error("Fehler beim Zurücksetzen");
      setIsResettingOnboarding(false);
    }
  };

  return (
    <Card className="border-red-200">
      <CardHeader>
        <CardTitle className="text-red-700">⚠️ Gefahrenzone</CardTitle>
        <CardDescription>
          Vorsicht: Aktionen in diesem Bereich können nicht rückgängig gemacht werden.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Restart Onboarding */}
        <div className="flex items-center justify-between p-4 border rounded-lg border-blue-200 bg-blue-50">
          <div>
            <h3 className="font-medium text-blue-800">🚀 Onboarding wiederholen</h3>
            <p className="text-sm text-blue-600">
              Gehe den Einrichtungs-Wizard nochmals durch, um Einstellungen zu überprüfen.
            </p>
          </div>
          <Button 
            variant="outline" 
            className="border-blue-300 text-blue-700 hover:bg-blue-100"
            onClick={handleRestartOnboarding}
            disabled={isResettingOnboarding}
          >
            {isResettingOnboarding ? "Starte..." : "🔄 Wiederholen"}
          </Button>
        </div>

        {/* Export Data */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h3 className="font-medium">Alle Daten exportieren</h3>
            <p className="text-sm text-slate-500">
              Laden Sie alle Ihre Daten als JSON-Datei herunter.
            </p>
          </div>
          <Button variant="outline" onClick={handleExportData}>
            📥 Daten exportieren
          </Button>
        </div>

        {/* Delete Account */}
        <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
          <div>
            <h3 className="font-medium text-red-700">Konto löschen</h3>
            <p className="text-sm text-red-600">
              Alle Daten werden unwiderruflich gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
          </div>
          <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                🗑️ Konto löschen
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-red-700">Konto wirklich löschen?</DialogTitle>
                <DialogDescription>
                  Diese Aktion löscht unwiderruflich:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Ihr Dealer OS Konto</li>
                    <li>Alle Fahrzeuge und Bilder</li>
                    <li>Alle Kundenanfragen</li>
                    <li>Alle Einstellungen</li>
                  </ul>
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <p className="text-sm">
                  Geben Sie <strong>LÖSCHEN</strong> ein, um zu bestätigen:
                </p>
                <Input 
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="LÖSCHEN"
                  className="border-red-300"
                />
              </div>

              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setDeleteConfirmOpen(false);
                    setDeleteConfirmText("");
                  }}
                >
                  Abbrechen
                </Button>
                <Button 
                  variant="outline"
                  className="bg-red-600 text-white hover:bg-red-700"
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== "LÖSCHEN" || isDeleting}
                >
                  {isDeleting ? "Wird gelöscht..." : "Endgültig löschen"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Standorte Redirect
// ============================================================================
function LocationsRedirect() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>📍 Standorte verwalten</CardTitle>
        <CardDescription>
          Verwalten Sie Ihre Filialstandorte für Fahrzeuge, Leads und Kunden.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center py-8">
        <p className="text-slate-600 mb-4">
          Die Standort-Verwaltung wurde auf eine eigene Seite verschoben.
        </p>
        <Button asChild>
          <a href="/dashboard/settings/locations">
            Zur Standort-Verwaltung →
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
