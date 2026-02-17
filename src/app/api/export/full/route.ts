import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Vehicle, fuelTypeLabels, transmissionLabels, statusLabels, FuelType, Transmission, VehicleStatus } from "@/types/vehicle";

// Vollständiger Export ALLER Felder
const CSV_HEADERS = [
  "ID",
  "Marke",
  "Modell",
  "Variante",
  "Erstzulassung",
  "Kilometerstand",
  "Treibstoff",
  "Getriebe",
  "Leistung_kW",
  "Leistung_PS",
  "Farbe",
  "Fahrgestellnummer",
  "Einkaufspreis",
  "Verkaufspreis",
  "KI_Preisvorschlag",
  "Beschreibung",
  "Interne_Notizen",
  "Status",
  "Eingekauft_am",
  "Verkauft_am",
  "Erfasst_am",
  "Aktualisiert_am",
  "Standzeit_Tage",
  "Bild1",
  "Bild2",
  "Bild3",
  "Bild4",
  "Bild5",
  "Bild6",
  "Bild7",
  "Bild8",
  "Bild9",
  "Bild10",
];

// Escape CSV Feld (Semikolon-separated)
function escapeCSVField(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(";") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// Deutsches Datumsformat
function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("de-CH");
}

// Standzeit berechnen
function calculateDaysOnLot(createdAt: string): number {
  const created = new Date(createdAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - created.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// kW zu PS
function kwToPs(kw: number | null): string {
  if (!kw) return "";
  return Math.round(kw * 1.36).toString();
}

// Generiere CSV Zeile aus Vehicle
function vehicleToCSVRow(vehicle: Vehicle, imageUrls: string[] = []): string {
  const fields = [
    escapeCSVField(vehicle.id),
    escapeCSVField(vehicle.make),
    escapeCSVField(vehicle.model),
    escapeCSVField(vehicle.variant),
    escapeCSVField(formatDate(vehicle.first_registration)),
    escapeCSVField(vehicle.mileage),
    escapeCSVField(vehicle.fuel_type ? fuelTypeLabels[vehicle.fuel_type as FuelType] || vehicle.fuel_type : ""),
    escapeCSVField(vehicle.transmission ? transmissionLabels[vehicle.transmission as Transmission] || vehicle.transmission : ""),
    escapeCSVField(vehicle.power_kw),
    escapeCSVField(kwToPs(vehicle.power_kw)),
    escapeCSVField(vehicle.color),
    escapeCSVField(vehicle.vin),
    escapeCSVField(vehicle.purchase_price),
    escapeCSVField(vehicle.asking_price),
    escapeCSVField(vehicle.ai_suggested_price),
    escapeCSVField(vehicle.description),
    escapeCSVField(vehicle.internal_notes),
    escapeCSVField(statusLabels[vehicle.status as VehicleStatus] || vehicle.status),
    escapeCSVField(formatDate(vehicle.acquired_at)),
    escapeCSVField(formatDate(vehicle.sold_at)),
    escapeCSVField(formatDate(vehicle.created_at)),
    escapeCSVField(formatDate(vehicle.updated_at)),
    escapeCSVField(calculateDaysOnLot(vehicle.created_at)),
    // Bis zu 10 Bilder
    ...Array.from({ length: 10 }, (_, i) => escapeCSVField(imageUrls[i] || "")),
  ];
  return fields.join(";");
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // User authentifizieren
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
    }
    
    // Dealer-ID holen
    const { data: dealer } = await supabase
      .from("dealers")
      .select("id")
      .eq("user_id", user.id)
      .single();
    
    if (!dealer?.id) {
      return NextResponse.json({ error: "Kein Händler-Konto gefunden" }, { status: 403 });
    }
    
    // Request Body parsen
    const body = await request.json();
    const vehicleIds: string[] | null = body.vehicleIds;
    const includeAll: boolean = body.includeAll || false; // Auch verkaufte inkludieren
    
    // Fahrzeuge laden
    let query = supabase
      .from("vehicles")
      .select("*")
      .eq("dealer_id", dealer.id)
      .order("created_at", { ascending: false });
    
    // Bei Full Export standardmässig ALLE Status, ausser vehicleIds ist gesetzt
    if (!includeAll && vehicleIds === null) {
      query = query.in("status", ["in_stock", "reserved"]);
    }
    
    if (vehicleIds && vehicleIds.length > 0) {
      query = query.in("id", vehicleIds);
    }
    
    const { data: vehicles, error } = await query;
    
    if (error) {
      console.error("Error fetching vehicles:", error);
      return NextResponse.json({ error: "Fehler beim Laden der Fahrzeuge" }, { status: 500 });
    }
    
    if (!vehicles || vehicles.length === 0) {
      return NextResponse.json({ error: "Keine Fahrzeuge zum Exportieren gefunden" }, { status: 404 });
    }
    
    // Alle Bilder für jedes Fahrzeug laden
    const vehicleImageMap: Record<string, string[]> = {};
    
    try {
      const { data: images } = await supabase
        .from("vehicle_images")
        .select("vehicle_id, url, position")
        .in("vehicle_id", vehicles.map(v => v.id))
        .order("position", { ascending: true });
      
      if (images) {
        for (const img of images) {
          if (!vehicleImageMap[img.vehicle_id]) {
            vehicleImageMap[img.vehicle_id] = [];
          }
          vehicleImageMap[img.vehicle_id].push(img.url);
        }
      }
    } catch {
      console.log("vehicle_images table might not exist yet");
    }
    
    // CSV generieren
    const BOM = "\uFEFF";
    const headerRow = CSV_HEADERS.join(";");
    const dataRows = vehicles.map((vehicle: Vehicle) => 
      vehicleToCSVRow(vehicle, vehicleImageMap[vehicle.id] || [])
    );
    
    const csvContent = BOM + headerRow + "\n" + dataRows.join("\n");
    
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="fahrzeuge_export_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
    
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
