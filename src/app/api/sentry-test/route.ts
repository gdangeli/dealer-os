import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    throw new Error("DealerOS Sentry API Test - " + new Date().toISOString());
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ 
      success: true, 
      message: "Error sent to Sentry!",
      timestamp: new Date().toISOString()
    });
  }
}
