"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useTranslations } from "next-intl";

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
import {
  Building2,
  MapPin,
  User,
  Users,
  Bell,
  Mail,
  Radio,
  Globe,
  CreditCard,
  AlertTriangle,
} from "lucide-react";
import { EmailTemplateManager } from "@/components/email/email-template-manager";
import { TeamManagement } from "@/components/settings/team-management";
import { LanguageSwitcher } from "@/components/dashboard/language-switcher";
import { WidgetSettings } from "@/components/settings/widget-settings";

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
  widget_enabled?: boolean;
  widget_config?: Record<string, unknown>;
}

interface SettingsClientProps {
  initialDealer: Dealer;
  userEmail: string;
}

// Validation Schemas with i18n
const createCompanyProfileSchema = (t: (key: string) => string) => z.object({
  company_name: z.string().min(2, t("settings.companyProfile.companyNameError")),
  contact_name: z.string().optional(),
  email: z.string().email(t("settings.companyProfile.emailError")),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
});

const createUserSettingsSchema = (t: (key: string) => string) => z.object({
  contact_name: z.string().min(2, t("settings.user.nameError")),
});

const createPasswordSchema = (t: (key: string) => string) => z.object({
  currentPassword: z.string().min(6, t("settings.password.minChars")),
  newPassword: z.string().min(6, t("settings.password.minChars")),
  confirmPassword: z.string().min(6, t("settings.password.minChars")),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: t("settings.password.noMatch"),
  path: ["confirmPassword"],
});

type CompanyProfileFormData = z.infer<ReturnType<typeof createCompanyProfileSchema>>;
type UserSettingsFormData = z.infer<ReturnType<typeof createUserSettingsSchema>>;
type PasswordFormData = z.infer<ReturnType<typeof createPasswordSchema>>;

export function SettingsClient({ initialDealer, userEmail }: SettingsClientProps) {
  const [dealer, setDealer] = useState(initialDealer);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const supabase = createClient();
  const t = useTranslations();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">{t("settings.title")}</h1>
        <p className="text-slate-600">{t("settings.subtitle")}</p>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="bg-white border inline-flex w-max sm:w-auto sm:flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="company" className="whitespace-nowrap text-xs sm:text-sm flex items-center gap-1.5">
              <Building2 className="w-4 h-4" /><span className="hidden sm:inline">{t("settings.tabs.company")}</span>
            </TabsTrigger>
            <TabsTrigger value="locations" className="whitespace-nowrap text-xs sm:text-sm flex items-center gap-1.5">
              <MapPin className="w-4 h-4" /><span className="hidden sm:inline">{t("settings.tabs.locations")}</span>
            </TabsTrigger>
            <TabsTrigger value="user" className="whitespace-nowrap text-xs sm:text-sm flex items-center gap-1.5">
              <User className="w-4 h-4" /><span className="hidden sm:inline">{t("settings.tabs.user")}</span>
            </TabsTrigger>
            <TabsTrigger value="team" className="whitespace-nowrap text-xs sm:text-sm flex items-center gap-1.5">
              <Users className="w-4 h-4" /><span className="hidden sm:inline">{t("settings.tabs.team")}</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="whitespace-nowrap text-xs sm:text-sm flex items-center gap-1.5">
              <Bell className="w-4 h-4" /><span className="hidden sm:inline">{t("settings.tabs.notifications")}</span>
            </TabsTrigger>
            <TabsTrigger value="email-templates" className="whitespace-nowrap text-xs sm:text-sm flex items-center gap-1.5">
              <Mail className="w-4 h-4" /><span className="hidden sm:inline">{t("settings.tabs.emailTemplates")}</span>
            </TabsTrigger>
            <TabsTrigger value="channels" className="whitespace-nowrap text-xs sm:text-sm flex items-center gap-1.5">
              <Radio className="w-4 h-4" /><span className="hidden sm:inline">{t("settings.tabs.channels")}</span>
            </TabsTrigger>
            <TabsTrigger value="widget" className="whitespace-nowrap text-xs sm:text-sm flex items-center gap-1.5">
              <Globe className="w-4 h-4" /><span className="hidden sm:inline">{t("settings.tabs.widget")}</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="whitespace-nowrap text-xs sm:text-sm flex items-center gap-1.5">
              <CreditCard className="w-4 h-4" /><span className="hidden sm:inline">{t("settings.tabs.billing")}</span>
            </TabsTrigger>
            <TabsTrigger value="danger" className="whitespace-nowrap text-xs sm:text-sm flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /><span className="hidden sm:inline">{t("settings.tabs.danger")}</span>
            </TabsTrigger>
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

        {/* Website-Widget Tab */}
        <TabsContent value="widget">
          <WidgetSettings
            dealerId={dealer.id}
            initialEnabled={dealer.widget_enabled || false}
            initialConfig={dealer.widget_config || {}}
          />
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
  const t = useTranslations();
  
  const companyProfileSchema = createCompanyProfileSchema(t);
  
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
      toast.success(t("settings.companyProfile.saved"));
    } catch (error) {
      console.error(error);
      toast.error(t("settings.companyProfile.error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.companyProfile.title")}</CardTitle>
        <CardDescription>
          {t("settings.companyProfile.description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company_name">{t("settings.companyProfile.companyNameRequired")}</Label>
              <Input 
                id="company_name" 
                {...register("company_name")} 
                placeholder={t("settings.companyProfile.companyNamePlaceholder")}
              />
              {errors.company_name && (
                <p className="text-sm text-red-500">{errors.company_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_name">{t("settings.companyProfile.contactPerson")}</Label>
              <Input 
                id="contact_name" 
                {...register("contact_name")} 
                placeholder={t("settings.companyProfile.contactPersonPlaceholder")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t("settings.companyProfile.emailRequired")}</Label>
              <Input 
                id="email" 
                type="email"
                {...register("email")} 
                placeholder={t("settings.companyProfile.emailPlaceholder")}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{t("settings.companyProfile.phone")}</Label>
              <Input 
                id="phone" 
                type="tel"
                {...register("phone")} 
                placeholder={t("settings.companyProfile.phonePlaceholder")}
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-4">{t("settings.companyProfile.address")}</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">{t("settings.companyProfile.street")}</Label>
                <Input 
                  id="address" 
                  {...register("address")} 
                  placeholder={t("settings.companyProfile.streetPlaceholder")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postal_code">{t("settings.companyProfile.postalCode")}</Label>
                <Input 
                  id="postal_code" 
                  {...register("postal_code")} 
                  placeholder={t("settings.companyProfile.postalCodePlaceholder")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">{t("settings.companyProfile.city")}</Label>
                <Input 
                  id="city" 
                  {...register("city")} 
                  placeholder={t("settings.companyProfile.cityPlaceholder")}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t("settings.companyProfile.saving") : t("settings.companyProfile.saveChanges")}
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
  const t = useTranslations();

  const userSettingsSchema = createUserSettingsSchema(t);
  const passwordSchema = createPasswordSchema(t);

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
      toast.success(t("settings.user.saved"));
    } catch (error) {
      console.error(error);
      toast.error(t("settings.companyProfile.error"));
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
      
      toast.success(t("settings.password.changed"));
      resetPassword();
    } catch (error: unknown) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : t("settings.password.error");
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
          <CardTitle>{t("settings.language.title")}</CardTitle>
          <CardDescription>
            {t("settings.language.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LanguageSwitcher />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.user.title")}</CardTitle>
          <CardDescription>
            {t("settings.user.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitUser(onSubmitUser)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user_contact_name">{t("settings.user.name")}</Label>
              <Input 
                id="user_contact_name" 
                {...registerUser("contact_name")} 
                placeholder={t("settings.user.namePlaceholder")}
              />
              {userErrors.contact_name && (
                <p className="text-sm text-red-500">{userErrors.contact_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t("settings.user.emailLabel")}</Label>
              <Input 
                value={userEmail}
                disabled
                className="bg-slate-50"
              />
              <p className="text-sm text-slate-500">
                {t("settings.user.emailNote")}
              </p>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? t("settings.user.saving") : t("settings.user.save")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.password.title")}</CardTitle>
          <CardDescription>
            {t("settings.password.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">{t("settings.password.currentPassword")}</Label>
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
              <Label htmlFor="newPassword">{t("settings.password.newPassword")}</Label>
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
              <Label htmlFor="confirmPassword">{t("settings.password.confirmPassword")}</Label>
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
                {isChangingPassword ? t("settings.password.changing") : t("settings.password.change")}
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
  const t = useTranslations();

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
      toast.success(t("settings.notifications.saved"));
    } catch (error) {
      console.error(error);
      toast.error(t("settings.notifications.error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Lead Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.notifications.leadsTitle")}</CardTitle>
          <CardDescription>
            {t("settings.notifications.leadsDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t("settings.notifications.newLeads")}</Label>
              <p className="text-sm text-slate-500">
                {t("settings.notifications.newLeadsDescription")}
              </p>
            </div>
            <Switch 
              checked={notifyNewLead}
              onCheckedChange={setNotifyNewLead}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t("settings.notifications.dailySummary")}</Label>
              <p className="text-sm text-slate-500">
                {t("settings.notifications.dailySummaryDescription")}
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
          <CardTitle>{t("settings.notifications.quotesTitle")}</CardTitle>
          <CardDescription>
            {t("settings.notifications.quotesDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t("settings.notifications.quoteExpiry")}</Label>
              <p className="text-sm text-slate-500">
                {t("settings.notifications.quoteExpiryDescription")}
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
                <Label htmlFor="quote_expiry_days">{t("settings.notifications.reminderBefore")}</Label>
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
                  <span className="text-slate-600">{t("settings.notifications.daysBefore")}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t("settings.notifications.invoiceOverdue")}</Label>
              <p className="text-sm text-slate-500">
                {t("settings.notifications.invoiceOverdueDescription")}
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
          <CardTitle>{t("settings.notifications.vehiclesTitle")}</CardTitle>
          <CardDescription>
            {t("settings.notifications.vehiclesDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="longstanding_days">{t("settings.notifications.longstanderWarning")}</Label>
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
              <span className="text-slate-600">{t("settings.notifications.daysInStock")}</span>
            </div>
            <p className="text-sm text-slate-500">
              {t("settings.notifications.longstanderNote")}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading} size="lg">
          {isLoading ? t("settings.notifications.saving") : t("settings.notifications.saveAll")}
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// Inserate-Kanäle Placeholder
// ============================================================================
function ChannelsPlaceholder() {
  const t = useTranslations();
  
  const channels = [
    { name: t("settings.channels.autoscout.name"), icon: "🚗", description: t("settings.channels.autoscout.description"), status: "coming_soon" },
    { name: t("settings.channels.mobile.name"), icon: "🇩🇪", description: t("settings.channels.mobile.description"), status: "coming_soon" },
    { name: t("settings.channels.tutti.name"), icon: "🏷️", description: t("settings.channels.tutti.description"), status: "coming_soon" },
    { name: t("settings.channels.facebook.name"), icon: "📘", description: t("settings.channels.facebook.description"), status: "coming_soon" },
  ];

  const communicationChannels = [
    { 
      name: t("settings.channels.whatsapp.name"), 
      icon: "💬", 
      description: t("settings.channels.whatsapp.description"),
      status: "active",
      href: "/dashboard/settings/whatsapp"
    },
  ];

  const integrationChannels = [
    { 
      name: t("settings.channels.bexio.name"), 
      icon: "📊", 
      description: t("settings.channels.bexio.description"),
      status: "active",
      href: "/dashboard/settings/bexio"
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.channels.communicationTitle")}</CardTitle>
          <CardDescription>
            {t("settings.channels.communicationDescription")}
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
                  <a href={channel.href}>{t("settings.channels.setup")}</a>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.channels.integrationsTitle")}</CardTitle>
          <CardDescription>
            {t("settings.channels.integrationsDescription")}
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
                  <a href={channel.href}>{t("settings.channels.setup")}</a>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.channels.listingTitle")}</CardTitle>
          <CardDescription>
            {t("settings.channels.listingDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800">
              {t("settings.channels.comingSoonNote")}
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
                <Badge variant="secondary">{t("settings.channels.comingSoon")}</Badge>
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
  const t = useTranslations();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.billing.title")}</CardTitle>
        <CardDescription>
          {t("settings.billing.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center py-8">
        <p className="text-slate-600 mb-4">
          {t("settings.billing.movedNote")}
        </p>
        <Button asChild>
          <a href="/dashboard/settings/billing">
            {t("settings.billing.goToBilling")}
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
  const t = useTranslations();
  const [isResettingOnboarding, setIsResettingOnboarding] = useState(false);
  
  // Get the delete confirmation word based on locale
  const deleteWord = t("settings.danger.deleteConfirmPlaceholder");

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

      toast.success(t("settings.danger.exported"));
    } catch (error) {
      console.error(error);
      toast.error(t("settings.danger.exportError"));
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== deleteWord) return;
    
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
      toast.error(t("settings.danger.deleteError"));
      setIsDeleting(false);
    }
  };

  const handleRestartOnboarding = async () => {
    setIsResettingOnboarding(true);
    try {
      const { error } = await supabase
        .from('dealers')
        .update({ onboarding_completed: false })
        .eq('id', dealer.id);

      if (error) throw error;
      
      toast.success(t("settings.danger.onboardingRestarted"));
      // Redirect to onboarding
      window.location.href = '/onboarding';
    } catch (error) {
      console.error(error);
      toast.error(t("settings.companyProfile.error"));
      setIsResettingOnboarding(false);
    }
  };

  return (
    <Card className="border-red-200">
      <CardHeader>
        <CardTitle className="text-red-700">{t("settings.danger.title")}</CardTitle>
        <CardDescription>
          {t("settings.danger.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Restart Onboarding */}
        <div className="flex items-center justify-between p-4 border rounded-lg border-blue-200 bg-blue-50">
          <div>
            <h3 className="font-medium text-blue-800">{t("settings.danger.restartOnboarding")}</h3>
            <p className="text-sm text-blue-600">
              {t("settings.danger.restartOnboardingDescription")}
            </p>
          </div>
          <Button 
            variant="outline" 
            className="border-blue-300 text-blue-700 hover:bg-blue-100"
            onClick={handleRestartOnboarding}
            disabled={isResettingOnboarding}
          >
            {isResettingOnboarding ? t("settings.danger.restarting") : t("settings.danger.restart")}
          </Button>
        </div>

        {/* Export Data */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h3 className="font-medium">{t("settings.danger.exportData")}</h3>
            <p className="text-sm text-slate-500">
              {t("settings.danger.exportDataDescription")}
            </p>
          </div>
          <Button variant="outline" onClick={handleExportData}>
            {t("settings.danger.export")}
          </Button>
        </div>

        {/* Delete Account */}
        <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
          <div>
            <h3 className="font-medium text-red-700">{t("settings.danger.deleteAccount")}</h3>
            <p className="text-sm text-red-600">
              {t("settings.danger.deleteAccountDescription")}
            </p>
          </div>
          <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                {t("settings.danger.deleteButton")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-red-700">{t("settings.danger.deleteConfirmTitle")}</DialogTitle>
                <DialogDescription>
                  {t("settings.danger.deleteConfirmDescription")}
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>{t("settings.danger.deleteConfirmList.account")}</li>
                    <li>{t("settings.danger.deleteConfirmList.vehicles")}</li>
                    <li>{t("settings.danger.deleteConfirmList.leads")}</li>
                    <li>{t("settings.danger.deleteConfirmList.settings")}</li>
                  </ul>
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <p className="text-sm">
                  {t("settings.danger.deleteConfirmPrompt")}
                </p>
                <Input 
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder={deleteWord}
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
                  {t("settings.danger.cancel")}
                </Button>
                <Button 
                  variant="outline"
                  className="bg-red-600 text-white hover:bg-red-700"
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== deleteWord || isDeleting}
                >
                  {isDeleting ? t("settings.danger.deleting") : t("settings.danger.deleteFinal")}
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
  const t = useTranslations();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.locations.title")}</CardTitle>
        <CardDescription>
          {t("settings.locations.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center py-8">
        <p className="text-slate-600 mb-4">
          {t("settings.locations.movedNote")}
        </p>
        <Button asChild>
          <a href="/dashboard/settings/locations">
            {t("settings.locations.goToLocations")}
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
