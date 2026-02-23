import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET single test drive
export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("test_drives")
    .select(`
      *,
      vehicles (make, model, variant)
    `)
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(data);
}

// PATCH update test drive
export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const allowedFields = [
    "vehicle_id",
    "customer_name", 
    "customer_email",
    "customer_phone",
    "scheduled_at",
    "duration_minutes",
    "status",
    "notes",
    "cancellation_reason"
  ];

  // Filter to only allowed fields
  const updates: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updates[field] = body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("test_drives")
    .update(updates)
    .eq("id", id)
    .select(`
      *,
      vehicles (make, model, variant)
    `)
    .single();

  if (error) {
    console.error("Error updating test drive:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // TODO: Send notification if status changed to confirmed/cancelled

  return NextResponse.json(data);
}

// DELETE test drive
export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("test_drives")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting test drive:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
