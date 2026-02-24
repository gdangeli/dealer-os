import { NextRequest, NextResponse } from "next/server";

const UNLOCK_PASSWORD = process.env.COMING_SOON_PASSWORD || "dealeros2026";
const COOKIE_NAME = "dealer_os_preview";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (key === UNLOCK_PASSWORD) {
    const response = NextResponse.redirect(new URL("/", request.url));
    
    response.cookies.set(COOKIE_NAME, "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });

    return response;
  }

  return NextResponse.json({ error: "Invalid key" }, { status: 401 });
}
