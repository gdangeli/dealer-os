import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Vehicle,
  VehicleStatus,
} from "@/types/vehicle";
import { VehicleStatusFilter } from "./status-filter";
import { VehicleListClient } from "@/components/vehicles/vehicle-list-client";
import { getCurrentDealer, getImpersonationInfo } from "@/lib/auth/get-current-dealer";

interface SearchParams {
  status?: string;
  sort?: string;
  location?: string;
}

export default async function VehiclesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const supabase = await createClient();
  const params = await searchParams;

  // User prüfen
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check for impersonation first
  const impersonation = await getImpersonationInfo();
  const isImpersonating = !!impersonation;
  
  console.log("[VehiclesPage] Debug:", {
    userId: user.id,
    impersonation,
    isImpersonating,
  });
  
  // Use admin client if impersonating (bypasses RLS)
  const queryClient = isImpersonating ? createAdminClient() : supabase;

  // Dealer holen (mit Impersonation-Support)
  let dealer;
  try {
    dealer = await getCurrentDealer();
  } catch (e) {
    console.error("Error getting dealer:", e);
    // Fallback to direct query
    const { data: fallbackDealer } = await supabase
      .from("dealers")
      .select("id")
      .eq("user_id", user.id)
      .single();
    dealer = fallbackDealer;
  }

  if (!dealer?.id) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-red-600">
          Kein Konto gefunden
        </h2>
        <p className="text-slate-600 mt-2">
          Bitte kontaktieren Sie uns: support@dealeros.ch
        </p>
      </div>
    );
  }

  // Fahrzeuge mit Hauptbild laden
  let query = queryClient
    .from("vehicles")
    .select(`
      *,
      vehicle_images (
        id,
        url,
        position,
        is_main
      )
    `)
    .eq("dealer_id", dealer.id);

  // Filter nach Status
  const statusFilter = params.status as VehicleStatus | undefined;
  if (statusFilter && ["in_stock", "reserved", "sold"].includes(statusFilter)) {
    query = query.eq("status", statusFilter);
  }

  // Filter nach Standort
  const locationFilter = params.location;
  if (locationFilter && locationFilter !== "all") {
    query = query.eq("location_id", locationFilter);
  }

  // Sortierung nach Erstellungsdatum (älteste zuerst = längste Standzeit)
  const sortOrder = params.sort === "newest" ? false : true;
  query = query.order("created_at", { ascending: sortOrder });

  const { data: vehicles, error } = await query;

  if (error) {
    console.error("Error fetching vehicles:", error);
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-red-600">
          Laden fehlgeschlagen
        </h2>
        <p className="text-slate-600 mt-2">Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.</p>
      </div>
    );
  }

  // Statistiken berechnen
  const stats = {
    total: vehicles?.length || 0,
    inStock: vehicles?.filter((v) => v.status === "in_stock").length || 0,
    reserved: vehicles?.filter((v) => v.status === "reserved").length || 0,
    sold: vehicles?.filter((v) => v.status === "sold").length || 0,
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Ihr Bestand</h1>
          <p className="text-slate-600 text-sm sm:text-base">
            Alle Fahrzeuge auf einen Blick
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/vehicles/import">
            <Button variant="outline" size="sm" className="text-xs sm:text-sm">📄 Import</Button>
          </Link>
          <Link href="/dashboard/vehicles/new">
            <Button size="sm" className="text-xs sm:text-sm">+ Erfassen</Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Card>
          <CardHeader className="pb-1 sm:pb-2 pt-3 sm:pt-4 px-3 sm:px-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-slate-600">
              Gesamt
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
            <div className="text-xl sm:text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 sm:pb-2 pt-3 sm:pt-4 px-3 sm:px-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-green-600">
              An Lager
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
            <div className="text-xl sm:text-2xl font-bold text-green-600">
              {stats.inStock}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 sm:pb-2 pt-3 sm:pt-4 px-3 sm:px-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-yellow-600">
              Reserviert
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
            <div className="text-xl sm:text-2xl font-bold text-yellow-600">
              {stats.reserved}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 sm:pb-2 pt-3 sm:pt-4 px-3 sm:px-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-slate-500">
              Verkauft
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
            <div className="text-xl sm:text-2xl font-bold text-slate-500">{stats.sold}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card className="mb-6">
        <CardContent className="pt-4 sm:pt-6 px-3 sm:px-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <span className="text-sm font-medium text-slate-600">
              Anzeigen:
            </span>
            <VehicleStatusFilter currentStatus={statusFilter} />
          </div>
        </CardContent>
      </Card>

      {/* Tabelle mit Export-Funktion */}
      <Card>
        <CardContent className="pt-6">
          {vehicles && vehicles.length > 0 ? (
            <VehicleListClient vehicles={vehicles as Vehicle[]} />
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🚗</div>
              <h3 className="text-lg font-medium text-slate-900">
                {statusFilter ? "Keine Treffer" : "Noch keine Fahrzeuge"}
              </h3>
              <p className="text-slate-600 mt-1">
                {statusFilter
                  ? "Keine Fahrzeuge mit diesem Status gefunden."
                  : "Erfassen Sie jetzt Ihr erstes Fahrzeug."}
              </p>
              {!statusFilter && (
                <Link href="/dashboard/vehicles/new">
                  <Button className="mt-4">+ Erstes Fahrzeug erfassen</Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
