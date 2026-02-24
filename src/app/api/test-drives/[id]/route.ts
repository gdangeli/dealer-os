import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { testDriveConfirmedEmail, testDriveCancelledEmail } from "@/lib/email/templates";

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

  // Get current test drive to check status change
  const { data: currentTestDrive } = await supabase
    .from("test_drives")
    .select("status, customer_email, customer_name, scheduled_at, dealer_id")
    .eq("id", id)
    .single();

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

  // Send email notification if status changed to confirmed or cancelled
  if (currentTestDrive && body.status && currentTestDrive.status !== body.status) {
    const shouldSendEmail = ['confirmed', 'cancelled'].includes(body.status);
    
    if (shouldSendEmail && data.customer_email) {
      // Get dealer info
      const { data: dealer } = await supabase
        .from("dealers")
        .select("company_name, phone, street, zip, city")
        .eq("id", data.dealer_id)
        .single();

      if (dealer) {
        const dealerAddress = dealer.street && dealer.zip && dealer.city
          ? `${dealer.street}, ${dealer.zip} ${dealer.city}`
          : undefined;

        const emailData = {
          customerName: data.customer_name,
          dealerName: dealer.company_name,
          dealerPhone: dealer.phone,
          dealerAddress,
          vehicleMake: data.vehicles?.make,
          vehicleModel: data.vehicles?.model,
          vehicleVariant: data.vehicles?.variant,
          scheduledAt: data.scheduled_at,
          cancellationReason: body.cancellation_reason,
        };

        if (body.status === 'confirmed') {
          await sendEmail({
            to: data.customer_email,
            subject: `✅ Probefahrt bestätigt - ${dealer.company_name}`,
            html: testDriveConfirmedEmail(emailData),
          });
        } else if (body.status === 'cancelled') {
          await sendEmail({
            to: data.customer_email,
            subject: `Probefahrt abgesagt - ${dealer.company_name}`,
            html: testDriveCancelledEmail(emailData),
          });
        }
      }
    }
  }

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
