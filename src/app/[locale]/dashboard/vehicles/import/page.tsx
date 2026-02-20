import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { VehicleImport } from "@/components/vehicles/vehicle-import";

export default async function ImportVehiclesPage() {
  const supabase = await createClient();

  // User und Dealer holen
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Dealer-ID aus der dealers-Tabelle holen
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

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/vehicles">
          <Button variant="ghost" size="sm">
            ← Zurück
          </Button>
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Fahrzeuge importieren</h1>
          <p className="text-slate-600">
            CSV oder Excel-Datei hochladen und mehrere Fahrzeuge auf einmal importieren
          </p>
        </div>
      </div>

      {/* Import-Komponente */}
      <VehicleImport dealerId={dealer.id} />
    </div>
  );
}
