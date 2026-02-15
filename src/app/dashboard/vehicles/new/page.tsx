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
      <VehicleForm dealerId={userData.dealer_id} />
    </div>
  );
}
