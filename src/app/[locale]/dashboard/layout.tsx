import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LogoutButton } from "./logout-button";
import { LanguageSwitcher } from "@/components/dashboard/language-switcher";
import { MobileSidebarToggle } from "@/components/dashboard/mobile-sidebar-toggle";
import { BottomNav } from "@/components/mobile/bottom-nav";
import { LocationFilterWrapper } from "@/components/locations/location-filter-wrapper";
import { getImpersonationInfo } from "@/lib/auth/get-current-dealer";
import { ImpersonationBanner } from "@/components/admin/impersonation-banner";
import { getTranslations } from "next-intl/server";
import { 
  LayoutDashboard, 
  Car, 
  Users, 
  MessageSquare, 
  FileText, 
  Receipt, 
  Mail,
  BarChart3,
  Settings, 
  HelpCircle,
  Crown
} from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("sidebar");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // First try to get dealer via team_members (multi-user)
  let dealer: { id: string; company_name: string | null; onboarding_completed: boolean | null } | null = null;
  
  const { data: membership } = await supabase
    .from('team_members')
    .select('dealer_id')
    .eq('user_id', user.id)
    .limit(1)
    .single();
  
  if (membership) {
    const { data } = await supabase
      .from('dealers')
      .select('id, company_name, onboarding_completed')
      .eq('id', membership.dealer_id)
      .single();
    dealer = data;
  } else {
    // Fallback to legacy user_id lookup
    const { data } = await supabase
      .from('dealers')
      .select('id, company_name, onboarding_completed')
      .eq('user_id', user.id)
      .single();
    dealer = data;
  }

  // Auto-create dealer if doesn't exist
  if (!dealer) {
    const { data: newDealer } = await supabase
      .from('dealers')
      .insert({
        user_id: user.id,
        email: user.email,
        company_name: user.user_metadata?.company_name || user.email?.split('@')[0] || 'Meine Garage',
        contact_name: user.user_metadata?.contact_name || '',
        status: 'active',
        onboarding_completed: false
      })
      .select('id, company_name, onboarding_completed')
      .single();
    
    // Also add to team_members as owner
    if (newDealer) {
      await supabase.from('team_members').insert({
        dealer_id: newDealer.id,
        user_id: user.id,
        role: 'owner',
        accepted_at: new Date().toISOString(),
      });
    }
    
    dealer = newDealer;
  }

  // Check if user is platform admin
  const { data: platformAdmin } = await supabase
    .from('platform_admins')
    .select('id')
    .eq('user_id', user.id)
    .single();
  
  const isPlatformAdmin = !!platformAdmin;

  // Check for impersonation
  const impersonation = await getImpersonationInfo();
  let isImpersonating = false;
  let impersonatedDealerName = '';
  
  if (impersonation && isPlatformAdmin) {
    isImpersonating = true;
    const { data: impersonatedDealer } = await supabase
      .from('dealers')
      .select('id, company_name, onboarding_completed')
      .eq('id', impersonation.dealerId)
      .single();
    
    if (impersonatedDealer) {
      dealer = impersonatedDealer;
      impersonatedDealerName = impersonatedDealer.company_name || 'Unbekannt';
    }
  }

  // Redirect to onboarding if not completed (skip if impersonating)
  if (dealer && !dealer.onboarding_completed && !isImpersonating) {
    redirect('/onboarding');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Impersonation Banner */}
      {isImpersonating && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <ImpersonationBanner dealerName={impersonatedDealerName} />
        </div>
      )}
      
      {/* Sidebar */}
      <MobileSidebarToggle>
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Car className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">DealerOS</span>
          </Link>
          <div className="mt-3">
            <LanguageSwitcher />
          </div>
        </div>

        {/* Location Filter */}
        {dealer?.id && (
          <div className="px-4 py-3 border-b border-gray-200">
            <LocationFilterWrapper dealerId={dealer.id} />
          </div>
        )}
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavLink href="/dashboard" icon={<LayoutDashboard className="w-5 h-5" />}>
            {t("dashboard")}
          </NavLink>
          <NavLink href="/dashboard/vehicles" icon={<Car className="w-5 h-5" />}>
            {t("vehicles")}
          </NavLink>
          <NavLink href="/dashboard/leads" icon={<MessageSquare className="w-5 h-5" />}>
            {t("leads")}
          </NavLink>
          <NavLink href="/dashboard/customers" icon={<Users className="w-5 h-5" />}>
            {t("customers")}
          </NavLink>
          <NavLink href="/dashboard/quotes" icon={<FileText className="w-5 h-5" />}>
            {t("quotes")}
          </NavLink>
          <NavLink href="/dashboard/invoices" icon={<Receipt className="w-5 h-5" />}>
            {t("invoices")}
          </NavLink>
          <NavLink href="/dashboard/email-templates" icon={<Mail className="w-5 h-5" />}>
            {t("emailTemplates")}
          </NavLink>
          <NavLink href="/dashboard/analytics" icon={<BarChart3 className="w-5 h-5" />}>
            {t("analytics")}
          </NavLink>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 space-y-1">
          {isPlatformAdmin && !isImpersonating && (
            <NavLink href="/admin" icon={<Crown className="w-5 h-5" />}>
              {t("adminDashboard")}
            </NavLink>
          )}
          <NavLink href="/dashboard/settings" icon={<Settings className="w-5 h-5" />}>
            {t("settings")}
          </NavLink>
          <NavLink href="/dashboard/help" icon={<HelpCircle className="w-5 h-5" />}>
            {t("help")}
          </NavLink>
          <LogoutButton />
        </div>
      </MobileSidebarToggle>

      {/* Main Content */}
      <main className="lg:ml-64 p-4 lg:p-8 pt-16 lg:pt-8 pb-20 lg:pb-8 min-h-screen">
        {children}
      </main>

      {/* Bottom Navigation for Mobile */}
      <BottomNav />
    </div>
  );
}

// Simple NavLink component matching GarageOS style
function NavLink({ 
  href, 
  icon, 
  children, 
}: { 
  href: string; 
  icon: React.ReactNode; 
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition"
    >
      {icon}
      {children}
    </Link>
  );
}
