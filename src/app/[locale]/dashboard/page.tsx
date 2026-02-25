import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Car, Users, FileText, TrendingUp, Clock } from "lucide-react";
import { getCurrentDealer, getImpersonationInfo } from "@/lib/auth/get-current-dealer";
import { getTranslations } from "next-intl/server";

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Get dealer profile via team_members (handles impersonation)
  const dealer = await getCurrentDealer();

  // Check if impersonating
  const impersonation = await getImpersonationInfo();
  const isImpersonating = !!impersonation;

  // Use admin client when impersonating to bypass RLS
  const queryClient = isImpersonating ? createAdminClient() : supabase;

  // Redirect to onboarding if not completed (skip if impersonating)
  if (dealer && !dealer.onboarding_completed && !impersonation) {
    redirect('/onboarding');
  }

  // Calculate dates once (safe in Server Components)
  // eslint-disable-next-line react-hooks/purity
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();

  // Get stats
  const [
    { count: totalVehicles },
    { count: inStockVehicles },
    { count: newLeads },
    { count: openQuotes },
    { data: recentLeads },
    { data: longStanding },
  ] = await Promise.all([
    queryClient.from('vehicles').select('*', { count: 'exact', head: true }).eq('dealer_id', dealer?.id),
    queryClient.from('vehicles').select('*', { count: 'exact', head: true }).eq('dealer_id', dealer?.id).eq('status', 'in_stock'),
    queryClient.from('leads').select('*', { count: 'exact', head: true }).eq('dealer_id', dealer?.id).eq('status', 'new'),
    queryClient.from('quotes').select('*', { count: 'exact', head: true }).eq('dealer_id', dealer?.id).eq('status', 'draft'),
    queryClient.from('leads')
      .select('*, vehicles(make, model)')
      .eq('dealer_id', dealer?.id)
      .order('created_at', { ascending: false })
      .limit(5),
    queryClient.from('vehicles')
      .select('*')
      .eq('dealer_id', dealer?.id)
      .eq('status', 'in_stock')
      .lt('acquired_at', thirtyDaysAgo)
      .order('acquired_at', { ascending: true })
      .limit(5),
  ]);

  return (
    <div className="space-y-8" data-testid="dashboard">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {t("welcomeBack")}{dealer?.contact_name ? `, ${dealer.contact_name.split(' ')[0]}` : ''}!
        </h1>
        <p className="text-gray-600">{dealer?.company_name || t("yourDashboard")}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t("vehicles")}
          value={totalVehicles || 0}
          subtitle={t("inStock", { count: inStockVehicles || 0 })}
          icon={<Car className="w-6 h-6 text-blue-500" />}
          href="/dashboard/vehicles"
        />
        <StatCard
          title={t("newLeads")}
          value={newLeads || 0}
          icon={<Users className="w-6 h-6 text-green-500" />}
          href="/dashboard/leads"
        />
        <StatCard
          title={t("openQuotes")}
          value={openQuotes || 0}
          icon={<FileText className="w-6 h-6 text-purple-500" />}
          href="/dashboard/quotes"
        />
        <StatCard
          title={t("longStanding")}
          value={longStanding?.length || 0}
          subtitle={t("moreThan30Days")}
          icon={<Clock className="w-6 h-6 text-orange-500" />}
          href="/dashboard/vehicles?filter=long-standing"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">{t("newLeads")}</h2>
            <Link href="/dashboard/leads" className="text-sm text-blue-600 hover:text-blue-700">
              {t("viewAll")}
            </Link>
          </div>
          {recentLeads && recentLeads.length > 0 ? (
            <div className="space-y-3">
              {recentLeads.map((lead: {
                id: string;
                name: string;
                email: string;
                phone: string;
                status: string;
                created_at: string;
                vehicles?: { make: string; model: string };
              }) => (
                <Link
                  key={lead.id}
                  href={`/dashboard/leads/${lead.id}`}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition"
                >
                  <div>
                    <p className="font-medium text-gray-900">{lead.name}</p>
                    <p className="text-sm text-gray-600">
                      {lead.vehicles?.make} {lead.vehicles?.model}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      {t("new")}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(lead.created_at).toLocaleDateString('de-CH')}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              {t("noNewLeads")}
            </p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("quickActions")}</h2>
          <div className="grid grid-cols-2 gap-4">
            <QuickAction
              icon={<Car className="w-5 h-5" />}
              label={t("newVehicle")}
              href="/dashboard/vehicles/new"
            />
            <QuickAction
              icon={<Users className="w-5 h-5" />}
              label={t("newCustomer")}
              href="/dashboard/customers/new"
            />
            <QuickAction
              icon={<FileText className="w-5 h-5" />}
              label={t("newQuote")}
              href="/dashboard/quotes/new"
            />
            <QuickAction
              icon={<TrendingUp className="w-5 h-5" />}
              label={t("analytics")}
              href="/dashboard/analytics"
            />
          </div>
        </div>
      </div>

      {/* Long Standing Warning */}
      {longStanding && longStanding.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-orange-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-semibold text-gray-900">{t("longStandingWarning")}</h2>
            </div>
            <Link href="/dashboard/vehicles?filter=long-standing" className="text-sm text-blue-600 hover:text-blue-700">
              {t("viewAll")}
            </Link>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            {t("longStandingDescription")}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {longStanding.slice(0, 3).map((vehicle: {
              id: string;
              make: string;
              model: string;
              year: number;
              price: number;
              acquired_at: string;
            }) => {
              const days = Math.floor((now - new Date(vehicle.acquired_at).getTime()) / (1000 * 60 * 60 * 24));
              return (
                <Link
                  key={vehicle.id}
                  href={`/dashboard/vehicles/${vehicle.id}`}
                  className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition"
                >
                  <p className="font-medium text-gray-900">
                    {vehicle.make} {vehicle.model}
                  </p>
                  <p className="text-sm text-gray-600">{vehicle.year}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-medium text-gray-900">
                      CHF {vehicle.price?.toLocaleString('de-CH')}
                    </span>
                    <span className="text-xs text-orange-700 font-medium">
                      {days} {t("days")}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  subtitle,
  icon, 
  href 
}: { 
  title: string; 
  value: number; 
  subtitle?: string;
  icon: React.ReactNode; 
  href: string;
}) {
  return (
    <Link href={href} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          {icon}
        </div>
      </div>
    </Link>
  );
}

function QuickAction({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition"
    >
      <div className="text-blue-600">{icon}</div>
      <span className="font-medium text-gray-900">{label}</span>
    </Link>
  );
}
