import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { removeBackground, upscaleImage } from '@/lib/replicate';
import sharp from 'sharp';

/**
 * Create AMAG-style studio composite
 * - Same dimensions as input image
 * - Car trimmed and positioned so wheels touch ground
 * - Contact shadow directly under wheels
 */
async function createStudioComposite(foregroundUrl: string): Promise<Buffer> {
  // Fetch the car image (with transparent background)
  const fgResponse = await fetch(foregroundUrl);
  const fgBuffer = Buffer.from(await fgResponse.arrayBuffer());
  
  // Get original dimensions BEFORE any processing
  const originalMeta = await sharp(fgBuffer).metadata();
  const outputWidth = originalMeta.width || 1200;
  const outputHeight = originalMeta.height || 800;
  
  // Trim transparent pixels to get actual car bounds
  const trimmedCar = await sharp(fgBuffer)
    .trim({ threshold: 10 })
    .toBuffer();
  
  const trimmedMeta = await sharp(trimmedCar).metadata();
  const carWidth = trimmedMeta.width || outputWidth;
  const carHeight = trimmedMeta.height || outputHeight;
  
  // Create AMAG-style background (same size as original image)
  // Floor starts at 75% from top
  const floorY = Math.round(outputHeight * 0.75);
  
  const bgSvg = `
    <svg width="${outputWidth}" height="${outputHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#f8f8f8"/>
          <stop offset="70%" stop-color="#f3f3f3"/>
          <stop offset="100%" stop-color="#ededed"/>
        </linearGradient>
        <linearGradient id="floor" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#e9e9e9"/>
          <stop offset="100%" stop-color="#e2e2e2"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)"/>
      <rect y="${floorY}" width="100%" height="${outputHeight - floorY}" fill="url(#floor)"/>
    </svg>
  `;
  const background = await sharp(Buffer.from(bgSvg)).png().toBuffer();
  
  // Create contact shadow - wide ellipse directly under car
  const shadowWidth = Math.round(carWidth * 0.85);
  const shadowHeight = Math.round(carHeight * 0.06);
  
  const shadowSvg = `
    <svg width="${shadowWidth}" height="${shadowHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="shadow" cx="50%" cy="40%" rx="50%" ry="60%">
          <stop offset="0%" stop-color="#000" stop-opacity="0.3"/>
          <stop offset="50%" stop-color="#000" stop-opacity="0.15"/>
          <stop offset="100%" stop-color="#000" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <ellipse cx="${shadowWidth/2}" cy="${shadowHeight/2}" rx="${shadowWidth*0.48}" ry="${shadowHeight*0.45}" fill="url(#shadow)"/>
    </svg>
  `;
  const shadow = await sharp(Buffer.from(shadowSvg)).blur(2).png().toBuffer();
  
  // Position car: centered horizontally, bottom touching floor line
  const carLeft = Math.round((outputWidth - carWidth) / 2);
  const carTop = floorY - carHeight;
  
  // Position shadow: centered under car, on the floor
  const shadowLeft = Math.round((outputWidth - shadowWidth) / 2);
  const shadowTop = floorY - Math.round(shadowHeight * 0.4);
  
  // Composite: background → shadow → car
  const result = await sharp(background)
    .composite([
      { input: shadow, left: shadowLeft, top: shadowTop, blend: 'multiply' },
      { input: trimmedCar, left: carLeft, top: carTop },
    ])
    .jpeg({ quality: 92 })
    .toBuffer();
  
  return result;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { imageUrl, operations = ['enhance'], backgroundTemplate } = body;

    if (!imageUrl) {
      return NextResponse.json({ error: 'No image URL provided' }, { status: 400 });
    }

    let resultUrl = imageUrl;
    const results: Record<string, string> = {};

    for (const op of operations) {
      if (op === 'remove_background') {
        const noBgUrl = await removeBackground(resultUrl);
        results.background_removed = noBgUrl;
        
        if (backgroundTemplate && backgroundTemplate !== 'none' && backgroundTemplate !== 'transparent') {
          try {
            const compositedBuffer = await createStudioComposite(noBgUrl);
            
            const fileName = `studio/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
            const { data: uploadData, error: uploadError } = await adminClient
              .storage
              .from('vehicle-images')
              .upload(fileName, compositedBuffer, { contentType: 'image/jpeg' });
            
            if (!uploadError && uploadData) {
              const { data: publicUrl } = adminClient.storage
                .from('vehicle-images')
                .getPublicUrl(fileName);
              resultUrl = publicUrl.publicUrl;
              results.composited = resultUrl;
            } else {
              resultUrl = noBgUrl;
            }
          } catch (compError) {
            console.error('Compositing error:', compError);
            resultUrl = noBgUrl;
          }
        } else {
          resultUrl = noBgUrl;
        }
      }
      
      if (op === 'enhance' || op === 'upscale') {
        const enhancedUrl = await upscaleImage(resultUrl, 2);
        results.enhanced = enhancedUrl;
        resultUrl = enhancedUrl;
      }
      
      if (op === 'blur_plates') {
        results.plates_blurred = resultUrl;
      }
    }

    if (body.saveToStorage && resultUrl.startsWith('http')) {
      const imageResponse = await fetch(resultUrl);
      const imageBuffer = await imageResponse.arrayBuffer();
      const fileName = `optimized/${Date.now()}-${Math.random().toString(36).slice(2)}.png`;
      
      const { data: uploadData, error: uploadError } = await adminClient
        .storage
        .from('vehicle-images')
        .upload(fileName, imageBuffer, { contentType: 'image/png' });
      
      if (!uploadError && uploadData) {
        const { data: publicUrl } = adminClient.storage
          .from('vehicle-images')
          .getPublicUrl(fileName);
        resultUrl = publicUrl.publicUrl;
      }
    }

    return NextResponse.json({ success: true, images: results, final: resultUrl });

  } catch (error) {
    console.error('Image optimization error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Processing failed' },
      { status: 500 }
    );
  }
}
