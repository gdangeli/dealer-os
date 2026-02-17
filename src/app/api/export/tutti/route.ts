import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Vehicle } from "@/types/vehicle";

// tutti.ch verwendet einfacheres Format
const TUTTI_FUEL_MAP: Record<string, string> = {
  petrol: "Benzin",
  diesel: "Diesel",
  electric: "Elektro",
  hybrid: "Hybrid",
  plugin_hybrid: "Plug-in-Hybrid",
  gas: "Gas",
};

const TUTTI_TRANSMISSION_MAP: Record<string, string> = {
  manual: "Manuell",
  automatic: "Automatik",
};

// tutti.ch CSV Header (vereinfachtes Format für Kleinanzeigen-Portal)
const CSV_HEADERS = [
  "Titel",
  "Beschreibung",
  "Preis",
  "Marke",
  "Modell",
  "Jahrgang",
  "Kilometer",
  "Treibstoff",
  "Getriebe",
  "Farbe",
  "Leistung_PS",
  "Bild_URL",
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

// Jahr aus Datum extrahieren
function getYear(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).getFullYear().toString();
}

// kW zu PS umrechnen
function kwToPs(kw: number | null): string {
  if (!kw) return "";
  return Math.round(kw * 1.36).toString();
}

// Titel für tutti.ch generieren
function generateTitle(vehicle: Vehicle): string {
  const parts = [vehicle.make, vehicle.model];
  if (vehicle.variant) parts.push(vehicle.variant);
  const year = getYear(vehicle.first_registration);
  if (year) parts.push(year);
  return parts.join(" ");
}

// Beschreibung für tutti.ch generieren
function generateDescription(vehicle: Vehicle): string {
  const lines = [];
  
  // Basisdaten
  if (vehicle.mileage) {
    lines.push(`Kilometerstand: ${vehicle.mileage.toLocaleString("de-CH")} km`);
  }
  if (vehicle.first_registration) {
    lines.push(`Erstzulassung: ${getYear(vehicle.first_registration)}`);
  }
  if (vehicle.fuel_type) {
    lines.push(`Treibstoff: ${TUTTI_FUEL_MAP[vehicle.fuel_type] || vehicle.fuel_type}`);
  }
  if (vehicle.transmission) {
    lines.push(`Getriebe: ${TUTTI_TRANSMISSION_MAP[vehicle.transmission] || vehicle.transmission}`);
  }
  if (vehicle.power_kw) {
    lines.push(`Leistung: ${vehicle.power_kw} kW (${kwToPs(vehicle.power_kw)} PS)`);
  }
  if (vehicle.color) {
    lines.push(`Farbe: ${vehicle.color}`);
  }
  
  // Eigene Beschreibung anhängen
  if (vehicle.description) {
    lines.push("");
    lines.push(vehicle.description);
  }
  
  return lines.join("\n");
}

// Generiere CSV Zeile aus Vehicle
function vehicleToCSVRow(vehicle: Vehicle, imageUrl: string = ""): string {
  const fields = [
    escapeCSVField(generateTitle(vehicle)),
    escapeCSVField(generateDescription(vehicle)),
    escapeCSVField(vehicle.asking_price),
    escapeCSVField(vehicle.make),
    escapeCSVField(vehicle.model),
    escapeCSVField(getYear(vehicle.first_registration)),
    escapeCSVField(vehicle.mileage),
    escapeCSVField(vehicle.fuel_type ? TUTTI_FUEL_MAP[vehicle.fuel_type] || vehicle.fuel_type : ""),
    escapeCSVField(vehicle.transmission ? TUTTI_TRANSMISSION_MAP[vehicle.transmission] || vehicle.transmission : ""),
    escapeCSVField(vehicle.color),
    escapeCSVField(kwToPs(vehicle.power_kw)),
    escapeCSVField(imageUrl),
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
    
    // Fahrzeuge laden
    let query = supabase
      .from("vehicles")
      .select("*")
      .eq("dealer_id", dealer.id)
      .in("status", ["in_stock", "reserved"]);
    
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
    
    // Hauptbild für jedes Fahrzeug laden
    const vehicleImageMap: Record<string, string> = {};
    
    try {
      const { data: images } = await supabase
        .from("vehicle_images")
        .select("vehicle_id, url, is_main, position")
        .in("vehicle_id", vehicles.map(v => v.id))
        .order("position", { ascending: true });
      
      if (images) {
        for (const img of images) {
          // Nur erstes/Hauptbild speichern
          if (!vehicleImageMap[img.vehicle_id]) {
            vehicleImageMap[img.vehicle_id] = img.url;
          }
        }
      }
    } catch {
      console.log("vehicle_images table might not exist yet");
    }
    
    // CSV generieren
    const BOM = "\uFEFF";
    const headerRow = CSV_HEADERS.join(";");
    const dataRows = vehicles.map((vehicle: Vehicle) => 
      vehicleToCSVRow(vehicle, vehicleImageMap[vehicle.id] || "")
    );
    
    const csvContent = BOM + headerRow + "\n" + dataRows.join("\n");
    
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="tutti_export_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
    
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
