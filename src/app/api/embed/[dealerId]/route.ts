import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// CORS headers for embed
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Will be restricted per dealer config
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ dealerId: string }> }
) {
  const { dealerId } = await params;
  const supabase = await createClient();

  // Get dealer info and widget config
  const { data: dealer, error: dealerError } = await supabase
    .from("dealers")
    .select("id, company_name, widget_config, widget_enabled")
    .eq("id", dealerId)
    .single();

  if (dealerError || !dealer) {
    return NextResponse.json(
      { error: "Dealer not found" },
      { status: 404, headers: corsHeaders }
    );
  }

  if (!dealer.widget_enabled) {
    return NextResponse.json(
      { error: "Widget not enabled for this dealer" },
      { status: 403, headers: corsHeaders }
    );
  }

  // Check origin against allowed domains
  const origin = request.headers.get("origin") || "";
  const widgetConfig = dealer.widget_config || {};
  const allowedDomains = widgetConfig.allowed_domains || [];
  
  // If domains are configured, check against them
  if (allowedDomains.length > 0) {
    const originHost = new URL(origin || "http://localhost").hostname;
    const isAllowed = allowedDomains.some((domain: string) => 
      originHost === domain || originHost.endsWith(`.${domain}`)
    );
    if (!isAllowed && origin) {
      return NextResponse.json(
        { error: "Domain not allowed" },
        { status: 403, headers: corsHeaders }
      );
    }
  }

  // Get vehicles
  const { data: vehicles, error: vehiclesError } = await supabase
    .from("vehicles")
    .select(`
      id,
      make,
      model,
      variant,
      first_registration,
      mileage,
      fuel_type,
      transmission,
      asking_price,
      status,
      vehicle_images (
        id,
        url,
        is_main,
        position
      )
    `)
    .eq("dealer_id", dealerId)
    .eq("status", "in_stock")
    .order("created_at", { ascending: false });

  if (vehiclesError) {
    return NextResponse.json(
      { error: "Failed to fetch vehicles" },
      { status: 500, headers: corsHeaders }
    );
  }

  // Format vehicles for embed
  const formattedVehicles = (vehicles || []).map((v) => {
    const mainImage = v.vehicle_images?.find((img: any) => img.is_main) 
      || v.vehicle_images?.[0];
    
    return {
      id: v.id,
      make: v.make,
      model: v.model,
      variant: v.variant,
      year: v.first_registration ? new Date(v.first_registration).getFullYear() : null,
      mileage: v.mileage,
      fuelType: v.fuel_type,
      transmission: v.transmission,
      price: v.asking_price,
      image: mainImage?.url || null,
    };
  });

  return NextResponse.json(
    {
      dealer: {
        id: dealer.id,
        name: dealer.company_name,
      },
      vehicles: formattedVehicles,
      config: {
        primaryColor: widgetConfig.primary_color || "#2563eb",
        fontFamily: widgetConfig.font_family || "system-ui",
        buttonStyle: widgetConfig.button_style || "rounded",
        darkMode: widgetConfig.dark_mode || false,
        showPrice: widgetConfig.show_price !== false,
        contactUrl: widgetConfig.contact_url || null,
      },
    },
    { headers: corsHeaders }
  );
}
