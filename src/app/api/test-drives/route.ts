import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET all test drives for dealer
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get dealer
  const { data: dealer } = await supabase
    .from("dealers")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!dealer) {
    // Check team membership
    const { data: teamMember } = await supabase
      .from("team_members")
      .select("dealer_id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();
    
    if (!teamMember) {
      return NextResponse.json({ error: "No dealer found" }, { status: 404 });
    }
  }

  const dealerId = dealer?.id || (await supabase
    .from("team_members")
    .select("dealer_id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .single()).data?.dealer_id;

  // Parse query params
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const upcoming = searchParams.get("upcoming") === "true";

  let query = supabase
    .from("test_drives")
    .select(`
      *,
      vehicles (make, model, variant)
    `)
    .eq("dealer_id", dealerId)
    .order("scheduled_at", { ascending: true });

  if (status) {
    query = query.eq("status", status);
  }

  if (upcoming) {
    query = query
      .gte("scheduled_at", new Date().toISOString())
      .in("status", ["pending", "confirmed"]);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching test drives:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST create new test drive
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  
  const body = await request.json();
  const { 
    dealer_id, 
    vehicle_id, 
    customer_name, 
    customer_email, 
    customer_phone,
    scheduled_at,
    duration_minutes = 30,
    notes,
    source = "manual"
  } = body;

  // Validate required fields
  if (!dealer_id || !customer_name || !scheduled_at) {
    return NextResponse.json(
      { error: "dealer_id, customer_name, and scheduled_at are required" },
      { status: 400 }
    );
  }

  // Validate scheduled_at is in the future
  if (new Date(scheduled_at) < new Date()) {
    return NextResponse.json(
      { error: "scheduled_at must be in the future" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("test_drives")
    .insert({
      dealer_id,
      vehicle_id,
      customer_name,
      customer_email,
      customer_phone,
      scheduled_at,
      duration_minutes,
      notes,
      source,
      status: "pending"
    })
    .select(`
      *,
      vehicles (make, model, variant)
    `)
    .single();

  if (error) {
    console.error("Error creating test drive:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // TODO: Send notification email to dealer
  // TODO: Send confirmation email to customer

  return NextResponse.json(data, { status: 201 });
}
