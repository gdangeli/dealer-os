import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { 
  testDriveBookingDealerEmail, 
  testDriveConfirmationCustomerEmail 
} from "@/lib/email/templates";

// Public endpoint for booking test drives (no auth required)
// Uses service role key to bypass RLS

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.dealeros.ch";

export async function POST(request: NextRequest) {
  // CORS headers for widget embedding
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // Handle preflight
  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 200, headers });
  }

  try {
    const body = await request.json();
    const {
      dealer_id,
      vehicle_id,
      customer_name,
      customer_email,
      customer_phone,
      scheduled_at,
      notes,
    } = body;

    // Validate required fields
    if (!dealer_id || !customer_name || !scheduled_at) {
      return NextResponse.json(
        { error: "dealer_id, customer_name, and scheduled_at are required" },
        { status: 400, headers }
      );
    }

    // Validate email or phone is provided
    if (!customer_email && !customer_phone) {
      return NextResponse.json(
        { error: "Either customer_email or customer_phone is required" },
        { status: 400, headers }
      );
    }

    // Validate scheduled_at is in the future
    const scheduledDate = new Date(scheduled_at);
    if (scheduledDate < new Date()) {
      return NextResponse.json(
        { error: "scheduled_at must be in the future" },
        { status: 400, headers }
      );
    }

    // Use service role to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify dealer exists
    const { data: dealer, error: dealerError } = await supabase
      .from("dealers")
      .select("id, company_name, email")
      .eq("id", dealer_id)
      .single();

    if (dealerError || !dealer) {
      return NextResponse.json(
        { error: "Dealer not found" },
        { status: 404, headers }
      );
    }

    // If vehicle_id provided, verify it belongs to the dealer and get details
    let vehicleData: { make: string; model: string; variant?: string } | null = null;
    if (vehicle_id) {
      const { data: vehicle, error: vehicleError } = await supabase
        .from("vehicles")
        .select("id, make, model, variant")
        .eq("id", vehicle_id)
        .eq("dealer_id", dealer_id)
        .single();

      if (vehicleError || !vehicle) {
        return NextResponse.json(
          { error: "Vehicle not found or does not belong to dealer" },
          { status: 404, headers }
        );
      }
      vehicleData = vehicle;
    }

    // Create test drive
    const { data, error } = await supabase
      .from("test_drives")
      .insert({
        dealer_id,
        vehicle_id: vehicle_id || null,
        customer_name,
        customer_email: customer_email || null,
        customer_phone: customer_phone || null,
        scheduled_at,
        duration_minutes: 30,
        notes: notes || null,
        source: "widget",
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating test drive:", error);
      return NextResponse.json(
        { error: "Failed to create booking" },
        { status: 500, headers }
      );
    }

    // Send notification email to dealer
    if (dealer.email) {
      const dealerEmailHtml = testDriveBookingDealerEmail({
        dealerName: dealer.company_name,
        customerName: customer_name,
        customerEmail: customer_email,
        customerPhone: customer_phone,
        vehicleMake: vehicleData?.make,
        vehicleModel: vehicleData?.model,
        vehicleVariant: vehicleData?.variant,
        scheduledAt: scheduled_at,
        notes,
        dashboardUrl: `${APP_URL}/de/dashboard/test-drives`,
        settingsUrl: `${APP_URL}/de/dashboard/settings`,
      });

      await sendEmail({
        to: dealer.email,
        subject: `🚗 Neue Probefahrt-Anfrage von ${customer_name}`,
        html: dealerEmailHtml,
      });
    }

    // Send confirmation email to customer
    if (customer_email) {
      // Get dealer address for the email
      const { data: dealerDetails } = await supabase
        .from("dealers")
        .select("phone, street, zip, city")
        .eq("id", dealer_id)
        .single();

      const dealerAddress = dealerDetails?.street && dealerDetails?.zip && dealerDetails?.city
        ? `${dealerDetails.street}, ${dealerDetails.zip} ${dealerDetails.city}`
        : undefined;

      const customerEmailHtml = testDriveConfirmationCustomerEmail({
        customerName: customer_name,
        dealerName: dealer.company_name,
        dealerPhone: dealerDetails?.phone,
        dealerAddress,
        vehicleMake: vehicleData?.make,
        vehicleModel: vehicleData?.model,
        vehicleVariant: vehicleData?.variant,
        scheduledAt: scheduled_at,
      });

      await sendEmail({
        to: customer_email,
        subject: `Ihre Probefahrt-Anfrage bei ${dealer.company_name}`,
        html: customerEmailHtml,
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Probefahrt erfolgreich gebucht!",
        booking_id: data.id,
      },
      { status: 201, headers }
    );
  } catch (error) {
    console.error("Error in public test drive booking:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Get available vehicles for a dealer (for widget)
export async function GET(request: NextRequest) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  const { searchParams } = new URL(request.url);
  const dealerId = searchParams.get("dealer_id");

  if (!dealerId) {
    return NextResponse.json(
      { error: "dealer_id is required" },
      { status: 400, headers }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Get dealer info
  const { data: dealer } = await supabase
    .from("dealers")
    .select("id, company_name")
    .eq("id", dealerId)
    .single();

  if (!dealer) {
    return NextResponse.json(
      { error: "Dealer not found" },
      { status: 404, headers }
    );
  }

  // Get available vehicles
  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("id, make, model, variant, asking_price")
    .eq("dealer_id", dealerId)
    .eq("status", "in_stock")
    .order("make", { ascending: true });

  return NextResponse.json(
    {
      dealer: {
        id: dealer.id,
        name: dealer.company_name,
      },
      vehicles: vehicles || [],
    },
    { headers }
  );
}
