import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LogoutButton } from "./logout-button";
import { NavLink } from "@/components/dashboard/nav-link";
import { LanguageSwitcher } from "@/components/dashboard/language-switcher";
import { MobileSidebarToggle } from "@/components/dashboard/mobile-sidebar-toggle";
import { BottomNav } from "@/components/mobile/bottom-nav";
import { LocationFilterWrapper } from "@/components/locations/location-filter-wrapper";
import { getImpersonationInfo } from "@/lib/auth/get-current-dealer";
import { ImpersonationBanner } from "@/components/admin/impersonation-banner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  // Check for impersonation BEFORE onboarding redirect
  const impersonation = await getImpersonationInfo();
  let isImpersonating = false;
  let impersonatedDealerName = '';
  
  if (impersonation && isPlatformAdmin) {
    isImpersonating = true;
    // Override dealer with impersonated dealer
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
    <div className="min-h-screen bg-slate-50">
      {/* Impersonation Banner */}
      {isImpersonating && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <ImpersonationBanner dealerName={impersonatedDealerName} />
        </div>
      )}
      
      {/* Sidebar with Mobile Toggle */}
      <MobileSidebarToggle>
        <div className="p-4 border-b border-slate-200">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <span className="text-2xl transition-transform group-hover:scale-110 duration-200">🚗</span>
            <span className="text-xl font-bold">Dealer OS</span>
          </Link>
          <div className="mt-2">
            <LanguageSwitcher />
          </div>
        </div>

        {/* Location Filter */}
        {dealer?.id && (
          <div className="px-4 py-3 border-b border-slate-200">
            <LocationFilterWrapper dealerId={dealer.id} />
          </div>
        )}
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto" aria-label="Hauptnavigation">
          <NavLink href="/dashboard" icon="📊" exact>Übersicht</NavLink>
          <NavLink href="/dashboard/vehicles" icon="🚙">Bestand</NavLink>
          <NavLink href="/dashboard/leads" icon="💬">Anfragen</NavLink>
          <NavLink href="/dashboard/whatsapp" icon="💬">WhatsApp</NavLink>
          
          <div className="pt-4 pb-2">
            <span className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Verkauf</span>
          </div>
          <NavLink href="/dashboard/customers" icon="👥">Kunden</NavLink>
          <NavLink href="/dashboard/quotes" icon="📄">Offerten</NavLink>
          <NavLink href="/dashboard/invoices" icon="🧾">Rechnungen</NavLink>
          
          <div className="pt-4 pb-2">
            <span className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Kommunikation</span>
          </div>
          <NavLink href="/dashboard/email-templates" icon="📧">E-Mail-Vorlagen</NavLink>
          
          <div className="pt-4 pb-2">
            <span className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Analyse</span>
          </div>
          <NavLink href="/dashboard/analytics" icon="📈">Auswertungen</NavLink>
        </nav>

        <div className="p-4 border-t border-slate-200 space-y-1">
          <div className="text-sm text-slate-600 mb-3 truncate px-3 py-1 bg-slate-50 rounded-lg">
            <span className="text-xs text-slate-400 block">Angemeldet als</span>
            {dealer?.company_name || user.email}
          </div>
          {isPlatformAdmin && (
            <NavLink href="/admin" icon="👑">Admin Dashboard</NavLink>
          )}
          <NavLink href="/dashboard/settings" icon="⚙️">Einstellungen</NavLink>
          <NavLink href="/dashboard/help" icon="❓">Hilfe</NavLink>
          <LogoutButton />
        </div>
      </MobileSidebarToggle>

      {/* Main Content */}
      <main className="lg:ml-64 p-4 lg:p-8 pt-16 lg:pt-8 pb-20 lg:pb-8 min-h-screen page-transition">
        {children}
      </main>

      {/* Bottom Navigation for Mobile */}
      <BottomNav />
    </div>
  );
}
