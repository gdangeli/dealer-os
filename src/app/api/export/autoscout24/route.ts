import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Vehicle, FuelType, Transmission, fuelTypeLabels, transmissionLabels } from "@/types/vehicle";

// AutoScout24 CSV Format Mapping
const AUTOSCOUT_FUEL_MAP: Record<string, string> = {
  petrol: "Benzin",
  diesel: "Diesel",
  electric: "Elektro",
  hybrid: "Hybrid",
  plugin_hybrid: "Plug-in-Hybrid",
  gas: "Erdgas (CNG)",
};

const AUTOSCOUT_TRANSMISSION_MAP: Record<string, string> = {
  manual: "Schaltgetriebe",
  automatic: "Automatik",
};

// CSV Header gemäss AutoScout24 Spezifikation
const CSV_HEADERS = [
  "Marke",
  "Modell",
  "Variante",
  "Erstzulassung",
  "Kilometer",
  "Treibstoff",
  "Getriebe",
  "Leistung",
  "Farbe",
  "Preis",
  "Beschreibung",
  "Bild1",
  "Bild2",
  "Bild3",
  "Bild4",
  "Bild5",
];

// Datumsformat für AutoScout24: MM/YYYY
function formatDateForAutoscout(dateStr: string | null): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${month}/${year}`;
}

// Escape CSV Feld (Semikolon-separated)
function escapeCSVField(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  // Wenn das Feld Semikolon, Anführungszeichen oder Newlines enthält, in Anführungszeichen setzen
  if (str.includes(";") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// Generiere CSV Zeile aus Vehicle
function vehicleToCSVRow(vehicle: Vehicle, imageUrls: string[] = []): string {
  const fields = [
    escapeCSVField(vehicle.make),
    escapeCSVField(vehicle.model),
    escapeCSVField(vehicle.variant),
    escapeCSVField(formatDateForAutoscout(vehicle.first_registration)),
    escapeCSVField(vehicle.mileage),
    escapeCSVField(vehicle.fuel_type ? AUTOSCOUT_FUEL_MAP[vehicle.fuel_type] || vehicle.fuel_type : ""),
    escapeCSVField(vehicle.transmission ? AUTOSCOUT_TRANSMISSION_MAP[vehicle.transmission] || vehicle.transmission : ""),
    escapeCSVField(vehicle.power_kw),
    escapeCSVField(vehicle.color),
    escapeCSVField(vehicle.asking_price),
    escapeCSVField(vehicle.description),
    // Bis zu 5 Bilder
    escapeCSVField(imageUrls[0] || ""),
    escapeCSVField(imageUrls[1] || ""),
    escapeCSVField(imageUrls[2] || ""),
    escapeCSVField(imageUrls[3] || ""),
    escapeCSVField(imageUrls[4] || ""),
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
    const vehicleIds: string[] | null = body.vehicleIds; // null = alle Fahrzeuge
    
    // Fahrzeuge laden
    let query = supabase
      .from("vehicles")
      .select("*")
      .eq("dealer_id", dealer.id)
      .in("status", ["in_stock", "reserved"]); // Nur verfügbare/reservierte Fahrzeuge exportieren
    
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
    
    // Bilder für jedes Fahrzeug laden (falls vehicle_images Tabelle existiert)
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
      // Falls die vehicle_images Tabelle noch nicht existiert, ignorieren
      console.log("vehicle_images table might not exist yet");
    }
    
    // CSV generieren
    // UTF-8 BOM für Excel-Kompatibilität
    const BOM = "\uFEFF";
    const headerRow = CSV_HEADERS.join(";");
    const dataRows = vehicles.map((vehicle: Vehicle) => 
      vehicleToCSVRow(vehicle, vehicleImageMap[vehicle.id] || [])
    );
    
    const csvContent = BOM + headerRow + "\n" + dataRows.join("\n");
    
    // Response mit CSV
    const response = new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="autoscout24_export_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
    
    return response;
    
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
