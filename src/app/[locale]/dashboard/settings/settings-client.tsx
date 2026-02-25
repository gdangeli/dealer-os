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
import {
  WhatsAppIcon,
  BexioIcon,
  AutoScout24Icon,
  AutolinaIcon,
  CarauktionIcon,
} from "@/components/icons/brands";

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
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Building2 className="w-5 h-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-900">{t("settings.companyProfile.title")}</h2>
      </div>
      <p className="text-sm text-gray-500 mb-6">{t("settings.companyProfile.description")}</p>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-1">
              {t("settings.companyProfile.companyNameRequired")}
            </label>
            <input 
              id="company_name" 
              {...register("company_name")} 
              placeholder={t("settings.companyProfile.companyNamePlaceholder")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.company_name && (
              <p className="text-sm text-red-500 mt-1">{errors.company_name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="contact_name" className="block text-sm font-medium text-gray-700 mb-1">
              {t("settings.companyProfile.contactPerson")}
            </label>
            <input 
              id="contact_name" 
              {...register("contact_name")} 
              placeholder={t("settings.companyProfile.contactPersonPlaceholder")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              {t("settings.companyProfile.emailRequired")}
            </label>
            <input 
              id="email" 
              type="email"
              {...register("email")} 
              placeholder={t("settings.companyProfile.emailPlaceholder")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              {t("settings.companyProfile.phone")}
            </label>
            <input 
              id="phone" 
              type="tel"
              {...register("phone")} 
              placeholder={t("settings.companyProfile.phonePlaceholder")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-medium text-gray-900 mb-4">{t("settings.companyProfile.address")}</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                {t("settings.companyProfile.street")}
              </label>
              <input 
                id="address" 
                {...register("address")} 
                placeholder={t("settings.companyProfile.streetPlaceholder")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 mb-1">
                {t("settings.companyProfile.postalCode")}
              </label>
              <input 
                id="postal_code" 
                {...register("postal_code")} 
                placeholder={t("settings.companyProfile.postalCodePlaceholder")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                {t("settings.companyProfile.city")}
              </label>
              <input 
                id="city" 
                {...register("city")} 
                placeholder={t("settings.companyProfile.cityPlaceholder")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {isLoading ? t("settings.companyProfile.saving") : t("settings.companyProfile.saveChanges")}
          </button>
        </div>
      </form>
    </div>
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
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">{t("settings.language.title")}</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">{t("settings.language.description")}</p>
        <LanguageSwitcher />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">{t("settings.user.title")}</h2>
        </div>
        <p className="text-sm text-gray-500 mb-6">{t("settings.user.description")}</p>
        
        <form onSubmit={handleSubmitUser(onSubmitUser)} className="space-y-4">
          <div>
            <label htmlFor="user_contact_name" className="block text-sm font-medium text-gray-700 mb-1">
              {t("settings.user.name")}
            </label>
            <input 
              id="user_contact_name" 
              {...registerUser("contact_name")} 
              placeholder={t("settings.user.namePlaceholder")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {userErrors.contact_name && (
              <p className="text-sm text-red-500 mt-1">{userErrors.contact_name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("settings.user.emailLabel")}</label>
            <input 
              value={userEmail}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            />
            <p className="text-sm text-gray-500 mt-1">{t("settings.user.emailNote")}</p>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">
              {isLoading ? t("settings.user.saving") : t("settings.user.save")}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">{t("settings.password.title")}</h2>
        <p className="text-sm text-gray-500 mb-6">{t("settings.password.description")}</p>
        
        <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
              {t("settings.password.currentPassword")}
            </label>
            <input 
              id="currentPassword" 
              type="password"
              {...registerPassword("currentPassword")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {passwordErrors.currentPassword && (
              <p className="text-sm text-red-500 mt-1">{passwordErrors.currentPassword.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
              {t("settings.password.newPassword")}
            </label>
            <input 
              id="newPassword" 
              type="password"
              {...registerPassword("newPassword")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {passwordErrors.newPassword && (
              <p className="text-sm text-red-500 mt-1">{passwordErrors.newPassword.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              {t("settings.password.confirmPassword")}
            </label>
            <input 
              id="confirmPassword" 
              type="password"
              {...registerPassword("confirmPassword")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {passwordErrors.confirmPassword && (
              <p className="text-sm text-red-500 mt-1">{passwordErrors.confirmPassword.message}</p>
            )}
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={isChangingPassword} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">
              {isChangingPassword ? t("settings.password.changing") : t("settings.password.change")}
            </button>
          </div>
        </form>
      </div>
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
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">{t("settings.notifications.leadsTitle")}</h2>
        </div>
        <p className="text-sm text-gray-500 mb-6">{t("settings.notifications.leadsDescription")}</p>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{t("settings.notifications.newLeads")}</p>
              <p className="text-sm text-gray-500">{t("settings.notifications.newLeadsDescription")}</p>
            </div>
            <Switch 
              checked={notifyNewLead}
              onCheckedChange={setNotifyNewLead}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{t("settings.notifications.dailySummary")}</p>
              <p className="text-sm text-gray-500">{t("settings.notifications.dailySummaryDescription")}</p>
            </div>
            <Switch 
              checked={notifyDailySummary}
              onCheckedChange={setNotifyDailySummary}
            />
          </div>
        </div>
      </div>

      {/* Quote & Invoice Notifications */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">{t("settings.notifications.quotesTitle")}</h2>
        <p className="text-sm text-gray-500 mb-6">{t("settings.notifications.quotesDescription")}</p>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{t("settings.notifications.quoteExpiry")}</p>
              <p className="text-sm text-gray-500">{t("settings.notifications.quoteExpiryDescription")}</p>
            </div>
            <Switch 
              checked={notifyQuoteExpiry}
              onCheckedChange={setNotifyQuoteExpiry}
            />
          </div>

          {notifyQuoteExpiry && (
            <div className="ml-4 pl-4 border-l-2 border-blue-200">
              <div>
                <label htmlFor="quote_expiry_days" className="block text-sm font-medium text-gray-700 mb-1">
                  {t("settings.notifications.reminderBefore")}
                </label>
                <div className="flex items-center gap-2">
                  <input 
                    id="quote_expiry_days"
                    type="number"
                    min={1}
                    max={14}
                    value={quoteExpiryDays}
                    onChange={(e) => setQuoteExpiryDays(parseInt(e.target.value) || 3)}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="text-gray-600">{t("settings.notifications.daysBefore")}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{t("settings.notifications.invoiceOverdue")}</p>
              <p className="text-sm text-gray-500">{t("settings.notifications.invoiceOverdueDescription")}</p>
            </div>
            <Switch 
              checked={notifyInvoiceOverdue}
              onCheckedChange={setNotifyInvoiceOverdue}
            />
          </div>
        </div>
      </div>

      {/* Vehicle Notifications */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">{t("settings.notifications.vehiclesTitle")}</h2>
        <p className="text-sm text-gray-500 mb-6">{t("settings.notifications.vehiclesDescription")}</p>
        
        <div>
          <label htmlFor="longstanding_days" className="block text-sm font-medium text-gray-700 mb-1">
            {t("settings.notifications.longstanderWarning")}
          </label>
          <div className="flex items-center gap-2">
            <input 
              id="longstanding_days"
              type="number"
              min={1}
              max={365}
              value={longstandingDays}
              onChange={(e) => setLongstandingDays(parseInt(e.target.value) || 30)}
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="text-gray-600">{t("settings.notifications.daysInStock")}</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">{t("settings.notifications.longstanderNote")}</p>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={isLoading} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold">
          {isLoading ? t("settings.notifications.saving") : t("settings.notifications.saveAll")}
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Inserate-Kanäle Placeholder
// ============================================================================
function ChannelsPlaceholder() {
  const t = useTranslations();
  
  return (
    <div className="space-y-6">
      {/* Communication Channels */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Radio className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">{t("settings.channels.communicationTitle")}</h2>
        </div>
        <p className="text-sm text-gray-500 mb-6">{t("settings.channels.communicationDescription")}</p>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#25D366] flex items-center justify-center">
                <WhatsAppIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-medium text-gray-900">{t("settings.channels.whatsapp.name")}</div>
                <div className="text-sm text-gray-500">{t("settings.channels.whatsapp.description")}</div>
              </div>
            </div>
            <a href="/dashboard/settings/whatsapp" className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 font-medium">
              {t("settings.channels.setup")}
            </a>
          </div>
        </div>
      </div>

      {/* Integrations */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">{t("settings.channels.integrationsTitle")}</h2>
        <p className="text-sm text-gray-500 mb-6">{t("settings.channels.integrationsDescription")}</p>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#0d6efd] flex items-center justify-center">
                <BexioIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-medium text-gray-900">{t("settings.channels.bexio.name")}</div>
                <div className="text-sm text-gray-500">{t("settings.channels.bexio.description")}</div>
              </div>
            </div>
            <a href="/dashboard/settings/bexio" className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 font-medium">
              {t("settings.channels.setup")}
            </a>
          </div>
        </div>
      </div>

      {/* Listing Channels */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">{t("settings.channels.listingTitle")}</h2>
        <p className="text-sm text-gray-500 mb-6">{t("settings.channels.listingDescription")}</p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800">🚀 {t("settings.channels.comingSoonNote")}</p>
        </div>

        <div className="space-y-4">
          {/* AutoScout24 */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#ff7500] flex items-center justify-center">
                <AutoScout24Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-medium text-gray-900">{t("settings.channels.autoscout.name")}</div>
                <div className="text-sm text-gray-500">{t("settings.channels.autoscout.description")}</div>
              </div>
            </div>
            <Badge variant="secondary">{t("settings.channels.comingSoon")}</Badge>
          </div>

          {/* Autolina */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#00a651] flex items-center justify-center">
                <AutolinaIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-medium text-gray-900">{t("settings.channels.autolina.name")}</div>
                <div className="text-sm text-gray-500">{t("settings.channels.autolina.description")}</div>
              </div>
            </div>
            <Badge variant="secondary">{t("settings.channels.comingSoon")}</Badge>
          </div>

          {/* CARAUKTION */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#e63312] flex items-center justify-center">
                <CarauktionIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-medium text-gray-900">{t("settings.channels.carauktion.name")}</div>
                <div className="text-sm text-gray-500">{t("settings.channels.carauktion.description")}</div>
              </div>
            </div>
            <Badge variant="secondary">{t("settings.channels.comingSoon")}</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Abo & Rechnung - Redirect to dedicated page
// ============================================================================
function BillingPlaceholder() {
  const t = useTranslations();
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <CreditCard className="w-5 h-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-900">{t("settings.billing.title")}</h2>
      </div>
      <p className="text-sm text-gray-500 mb-6">{t("settings.billing.description")}</p>
      
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">{t("settings.billing.movedNote")}</p>
        <a href="/dashboard/settings/billing" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
          {t("settings.billing.goToBilling")}
        </a>
      </div>
    </div>
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
    <div className="bg-white rounded-xl border border-red-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-red-600" />
        <h2 className="text-lg font-semibold text-red-700">{t("settings.danger.title")}</h2>
      </div>
      <p className="text-sm text-gray-500 mb-6">{t("settings.danger.description")}</p>
      
      <div className="space-y-6">
        {/* Restart Onboarding */}
        <div className="flex items-center justify-between p-4 border border-blue-200 rounded-lg bg-blue-50">
          <div>
            <h3 className="font-medium text-blue-800">{t("settings.danger.restartOnboarding")}</h3>
            <p className="text-sm text-blue-600">{t("settings.danger.restartOnboardingDescription")}</p>
          </div>
          <button 
            onClick={handleRestartOnboarding}
            disabled={isResettingOnboarding}
            className="px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-100 disabled:opacity-50 font-medium"
          >
            {isResettingOnboarding ? t("settings.danger.restarting") : t("settings.danger.restart")}
          </button>
        </div>

        {/* Export Data */}
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <h3 className="font-medium text-gray-900">{t("settings.danger.exportData")}</h3>
            <p className="text-sm text-gray-500">{t("settings.danger.exportDataDescription")}</p>
          </div>
          <button onClick={handleExportData} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
            {t("settings.danger.export")}
          </button>
        </div>

        {/* Delete Account */}
        <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
          <div>
            <h3 className="font-medium text-red-700">{t("settings.danger.deleteAccount")}</h3>
            <p className="text-sm text-red-600">{t("settings.danger.deleteAccountDescription")}</p>
          </div>
          <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
            <DialogTrigger asChild>
              <button className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-100 font-medium">
                {t("settings.danger.deleteButton")}
              </button>
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
      </div>
    </div>
  );
}

// ============================================================================
// Standorte Redirect
// ============================================================================
function LocationsRedirect() {
  const t = useTranslations();
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-900">{t("settings.locations.title")}</h2>
      </div>
      <p className="text-sm text-gray-500 mb-6">{t("settings.locations.description")}</p>
      
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">{t("settings.locations.movedNote")}</p>
        <a href="/dashboard/settings/locations" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
          {t("settings.locations.goToLocations")}
        </a>
      </div>
    </div>
  );
}
