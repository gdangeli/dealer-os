import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { VehicleForm } from "@/components/vehicles/vehicle-form";
import { getCurrentDealer } from "@/lib/auth/get-current-dealer";

export default async function NewVehiclePage() {
  const supabase = await createClient();

  // User prüfen
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

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

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/vehicles">← Zurück</Link>
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Fahrzeug erfassen</h1>
          <p className="text-slate-600">
            Tragen Sie die wichtigsten Daten ein – fertig in 2 Minuten.
          </p>
        </div>
      </div>

      {/* Formular */}
      <VehicleForm dealerId={dealer.id} />
    </div>
  );
}
