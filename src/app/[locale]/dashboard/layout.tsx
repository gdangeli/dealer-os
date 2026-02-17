import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LogoutButton } from "./logout-button";

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

  // Dealer-Profil holen oder erstellen
  let { data: dealer } = await supabase
    .from('dealers')
    .select('company_name')
    .eq('user_id', user.id)
    .single();

  // Auto-create dealer if doesn't exist
  if (!dealer) {
    const { data: newDealer } = await supabase
      .from('dealers')
      .insert({
        user_id: user.id,
        email: user.email,
        company_name: user.user_metadata?.company_name || user.email?.split('@')[0] || 'Meine Garage',
        contact_name: user.user_metadata?.contact_name || '',
        status: 'active'
      })
      .select('company_name')
      .single();
    
    dealer = newDealer;
  }

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
        
        <nav className="flex-1 p-4 space-y-1">
          <NavLink href="/dashboard" icon="📊">Übersicht</NavLink>
          <NavLink href="/dashboard/vehicles" icon="🚙">Bestand</NavLink>
          <NavLink href="/dashboard/leads" icon="💬">Anfragen</NavLink>
          <NavLink href="/dashboard/whatsapp" icon="💬">WhatsApp</NavLink>
          <NavLink href="/dashboard/analytics" icon="📈">Auswertungen</NavLink>
        </nav>

        <div className="p-4 border-t border-slate-200">
          <div className="text-sm text-slate-600 mb-2 truncate">
            {dealer?.company_name || user.email}
          </div>
          <NavLink href="/dashboard/settings" icon="⚙️">Einstellungen</NavLink>
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
