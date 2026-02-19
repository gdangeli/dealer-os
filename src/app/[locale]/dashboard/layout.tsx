import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LogoutButton } from "./logout-button";
import { LanguageSwitcher } from "@/components/dashboard/language-switcher";
import { LocationFilterWrapper } from "@/components/locations/location-filter-wrapper";

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

  // Redirect to onboarding if not completed
  if (dealer && !dealer.onboarding_completed) {
    redirect('/onboarding');
  }

  // Check if user is platform admin
  const { data: platformAdmin } = await supabase
    .from('platform_admins')
    .select('id')
    .eq('user_id', user.id)
    .single();
  
  const isPlatformAdmin = !!platformAdmin;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 w-64 h-screen bg-white border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl">🚗</span>
            <span className="text-xl font-bold">Dealer OS</span>
          </Link>
          <Badge variant="secondary" className="mt-2">Beta</Badge>
        </div>

        {/* Location Filter */}
        {dealer?.id && (
          <div className="px-4 py-3 border-b border-slate-200">
            <LocationFilterWrapper dealerId={dealer.id} />
          </div>
        )}
        
        <nav className="flex-1 p-4 space-y-1">
          <NavLink href="/dashboard" icon="📊">Übersicht</NavLink>
          <NavLink href="/dashboard/vehicles" icon="🚙">Bestand</NavLink>
          <NavLink href="/dashboard/leads" icon="💬">Anfragen</NavLink>
          <NavLink href="/dashboard/whatsapp" icon="💬">WhatsApp</NavLink>
          
          <div className="pt-3 pb-1">
            <span className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Verkauf</span>
          </div>
          <NavLink href="/dashboard/customers" icon="👥">Kunden</NavLink>
          <NavLink href="/dashboard/quotes" icon="📄">Offerten</NavLink>
          <NavLink href="/dashboard/invoices" icon="🧾">Rechnungen</NavLink>
          
          <div className="pt-3 pb-1">
            <span className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Kommunikation</span>
          </div>
          <NavLink href="/dashboard/email-templates" icon="📧">E-Mail-Vorlagen</NavLink>
          
          <div className="pt-3 pb-1">
            <span className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Analyse</span>
          </div>
          <NavLink href="/dashboard/analytics" icon="📈">Auswertungen</NavLink>
        </nav>

        <div className="p-4 border-t border-slate-200 space-y-1">
          <div className="text-sm text-slate-600 mb-2 truncate">
            {dealer?.company_name || user.email}
          </div>
          {isPlatformAdmin && (
            <NavLink href="/admin" icon="👑">Admin Dashboard</NavLink>
          )}
          <NavLink href="/dashboard/settings" icon="⚙️">Einstellungen</NavLink>
          <NavLink href="/dashboard/help" icon="❓">Hilfe</NavLink>
          <LanguageSwitcher />
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  );
}

function NavLink({ href, icon, children }: { href: string; icon: string; children: React.ReactNode }) {
  return (
    <Link 
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
    >
      <span>{icon}</span>
      <span>{children}</span>
    </Link>
  );
}
