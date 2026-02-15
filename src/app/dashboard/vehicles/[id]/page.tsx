import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { VehicleForm } from "@/components/vehicles/vehicle-form";
import { Vehicle } from "@/types/vehicle";
import { DeleteVehicleButton } from "./delete-button";

interface EditVehiclePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditVehiclePage({
  params,
}: EditVehiclePageProps) {
  const supabase = await createClient();
  const { id } = await params;

  // User und Dealer holen
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Dealer-ID aus der users-Tabelle holen
  const { data: userData } = await supabase
    .from("users")
    .select("dealer_id")
    .eq("id", user.id)
    .single();

  if (!userData?.dealer_id) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-red-600">
          Kein Händler zugewiesen
        </h2>
        <p className="text-slate-600 mt-2">
          Bitte kontaktieren Sie den Administrator.
        </p>
      </div>
    );
  }

  // Fahrzeug laden
  const { data: vehicle, error } = await supabase
    .from("vehicles")
    .select("*")
    .eq("id", id)
    .eq("dealer_id", userData.dealer_id) // Sicherheitscheck
    .single();

  if (error || !vehicle) {
    notFound();
  }

  // Standzeit berechnen
  const calculateDaysOnLot = (createdAt: string): number => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysOnLot = calculateDaysOnLot(vehicle.created_at);

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/vehicles">
            <Button variant="ghost" size="sm">
              ← Zurück
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">
              {vehicle.brand} {vehicle.model}
            </h1>
            <p className="text-slate-600">
              {vehicle.variant && `${vehicle.variant} • `}
              Im Bestand seit {daysOnLot} Tagen
            </p>
          </div>
        </div>
        <DeleteVehicleButton vehicleId={vehicle.id} vehicleName={`${vehicle.brand} ${vehicle.model}`} />
      </div>

      {/* Formular */}
      <VehicleForm vehicle={vehicle as Vehicle} dealerId={userData.dealer_id} />
    </div>
  );
}
