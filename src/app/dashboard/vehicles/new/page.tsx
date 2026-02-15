import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { VehicleForm } from "@/components/vehicles/vehicle-form";

export default async function NewVehiclePage() {
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
          Kein Händler-Profil gefunden
        </h2>
        <p className="text-slate-600 mt-2">
          Bitte kontaktieren Sie den Administrator.
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
          <h1 className="text-3xl font-bold">Neues Fahrzeug</h1>
          <p className="text-slate-600">
            Fügen Sie ein neues Fahrzeug zu Ihrem Bestand hinzu
          </p>
        </div>
      </div>

      {/* Formular */}
      <VehicleForm dealerId={dealer.id} />
    </div>
  );
}
