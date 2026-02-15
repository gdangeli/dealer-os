import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Vehicle,
  VehicleStatus,
  statusLabels,
  statusColors,
  fuelTypeLabels,
  FuelType,
} from "@/types/vehicle";
import { VehicleStatusFilter } from "./status-filter";

interface SearchParams {
  status?: string;
  sort?: string;
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

  // Fahrzeuge laden
  let query = supabase
    .from("vehicles")
    .select("*")
    .eq("dealer_id", dealer.id);

  // Filter nach Status
  const statusFilter = params.status as VehicleStatus | undefined;
  if (statusFilter && ["in_stock", "reserved", "sold"].includes(statusFilter)) {
    query = query.eq("status", statusFilter);
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

  // Standzeit berechnen (Tage seit Erstellung)
  const calculateDaysOnLot = (createdAt: string): number => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Preis formatieren
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("de-CH", {
      style: "currency",
      currency: "CHF",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Jahr aus Erstzulassung extrahieren
  const getYear = (dateStr: string | null): string => {
    if (!dateStr) return "";
    return new Date(dateStr).getFullYear().toString();
  };

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
          <h1 className="text-3xl font-bold">Ihr Bestand</h1>
          <p className="text-slate-600">
            Alle Fahrzeuge auf einen Blick
          </p>
        </div>
        <Link href="/dashboard/vehicles/new">
          <Button>+ Fahrzeug erfassen</Button>
        </Link>
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

      {/* Tabelle */}
      <Card>
        <CardContent className="pt-6">
          {vehicles && vehicles.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Bild</TableHead>
                  <TableHead>Fahrzeug</TableHead>
                  <TableHead>Preis</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Standzeit</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicles.map((vehicle: Vehicle) => {
                  const daysOnLot = calculateDaysOnLot(vehicle.created_at);
                  const isLongStanding = daysOnLot > 45;
                  const fuelLabel = vehicle.fuel_type 
                    ? fuelTypeLabels[vehicle.fuel_type as FuelType] || vehicle.fuel_type
                    : "";

                  return (
                    <TableRow key={vehicle.id}>
                      <TableCell>
                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-xl">
                          🚗
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {vehicle.make} {vehicle.model}
                        </div>
                        <div className="text-sm text-slate-500">
                          {getYear(vehicle.first_registration)} •{" "}
                          {vehicle.mileage?.toLocaleString("de-CH")} km •{" "}
                          {fuelLabel}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold">
                          {vehicle.asking_price ? formatPrice(vehicle.asking_price) : "-"}
                        </div>
                        {vehicle.purchase_price && (
                          <div className="text-xs text-slate-500">
                            EK: {formatPrice(vehicle.purchase_price)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[vehicle.status]}>
                          {statusLabels[vehicle.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`font-medium ${
                            isLongStanding ? "text-orange-600" : ""
                          }`}
                        >
                          {daysOnLot} Tage
                        </span>
                        {isLongStanding && (
                          <span className="ml-1 text-orange-500">⚠️</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/dashboard/vehicles/${vehicle.id}`}>
                          <Button variant="outline" size="sm">
                            Bearbeiten
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
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
