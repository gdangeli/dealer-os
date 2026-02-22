import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { sourceUrl, originalUrl } = body;
    
    if (!sourceUrl) {
      return NextResponse.json({ error: "No source URL provided" }, { status: 400 });
    }

    // Download the image from Replicate (or other source)
    const imageResponse = await fetch(sourceUrl);
    if (!imageResponse.ok) {
      return NextResponse.json({ error: "Failed to download image" }, { status: 500 });
    }
    const imageBuffer = await imageResponse.arrayBuffer();
    const buffer = new Uint8Array(imageBuffer);

    // Extract vehicle ID from original URL if possible
    // URL format: .../vehicle-images/{vehicleId}/{filename}
    let vehicleId = 'optimized';
    if (originalUrl) {
      const match = originalUrl.match(/vehicle-images\/([^/]+)\//);
      if (match) {
        vehicleId = match[1];
      }
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const filename = `${vehicleId}/optimized-${timestamp}-${randomStr}.png`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("vehicle-images")
      .upload(filename, buffer, {
        cacheControl: "31536000",
        contentType: "image/png",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("vehicle-images")
      .getPublicUrl(filename);

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error("Error in upload-optimized:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
