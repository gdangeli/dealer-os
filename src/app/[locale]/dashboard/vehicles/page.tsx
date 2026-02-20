import { createClient } from "@/lib/supabase/server";
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

  // User und Dealer holen
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Dealer-ID aus der dealers-Tabelle holen (user_id referenziert auth.users)
  const { data: dealer } = await supabase
    .from("dealers")
    .select("id")
    .eq("user_id", user.id)
    .single();

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
  let query = supabase
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Ihr Bestand</h1>
          <p className="text-slate-600">
            Alle Fahrzeuge auf einen Blick
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/vehicles/import">
            <Button variant="outline">📄 CSV/Excel Import</Button>
          </Link>
          <Link href="/dashboard/vehicles/new">
            <Button>+ Fahrzeug erfassen</Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Gesamt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">
              An Lager
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.inStock}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600">
              Reserviert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.reserved}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Verkauft
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-500">{stats.sold}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
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
