import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { EmbedClient } from "./embed-client";

interface PageProps {
  params: Promise<{ dealerId: string }>;
  searchParams: Promise<{
    primary?: string;
    font?: string;
    style?: string;
    dark?: string;
    layout?: string;
  }>;
}

export default async function EmbedPage({ params, searchParams }: PageProps) {
  const { dealerId } = await params;
  const query = await searchParams;
  const supabase = await createClient();

  // Get dealer
  const { data: dealer, error: dealerError } = await supabase
    .from("dealers")
    .select("id, company_name, widget_config, widget_enabled")
    .eq("id", dealerId)
    .single();

  if (dealerError || !dealer || !dealer.widget_enabled) {
    notFound();
  }

  // Get vehicles
  const { data: vehicles } = await supabase
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

  // Format vehicles
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

  // Get config from URL params (override) or dealer config
  const widgetConfig = dealer.widget_config || {};
  const config = {
    primaryColor: query.primary ? `#${query.primary}` : (widgetConfig.primary_color || "#2563eb"),
    fontFamily: query.font || widgetConfig.font_family || "system-ui",
    buttonStyle: query.style || widgetConfig.button_style || "rounded",
    darkMode: query.dark === "1" || widgetConfig.dark_mode || false,
    layout: query.layout || widgetConfig.layout || "grid",
    showPrice: widgetConfig.show_price !== false,
    contactUrl: widgetConfig.contact_url || null,
  };

  return (
    <EmbedClient
      dealer={{ id: dealer.id, name: dealer.company_name }}
      vehicles={formattedVehicles}
      config={config}
    />
  );
}
