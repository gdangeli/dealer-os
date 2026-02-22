import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { removeBackground, upscaleImage } from '@/lib/replicate';
import sharp from 'sharp';

/**
 * Create AMAG-style studio composite
 * - Clean white gradient background
 * - Soft contact shadow directly under car
 * - Car positioned low (wheels near bottom)
 */
async function createStudioComposite(foregroundUrl: string): Promise<Buffer> {
  // Fetch the car image
  const fgResponse = await fetch(foregroundUrl);
  const fgBuffer = Buffer.from(await fgResponse.arrayBuffer());
  
  // Get original dimensions
  const originalMeta = await sharp(fgBuffer).metadata();
  const outputWidth = originalMeta.width || 1200;
  const outputHeight = originalMeta.height || 800;
  
  // Trim transparent pixels
  const trimmedCar = await sharp(fgBuffer)
    .trim({ threshold: 10 })
    .toBuffer();
  
  const carMeta = await sharp(trimmedCar).metadata();
  const carWidth = carMeta.width || outputWidth;
  const carHeight = carMeta.height || outputHeight;
  
  // AMAG-style background: wall + floor with visible transition
  // Wall: light gray (#f5f5f5), Floor: slightly darker (#e0e0e0)
  // Transition at 65% from top (slightly above wheel level)
  const transitionY = Math.round(outputHeight * 0.65);
  
  const bgSvg = `
    <svg width="${outputWidth}" height="${outputHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Wall gradient (top) -->
        <linearGradient id="wall" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#f8f8f8"/>
          <stop offset="100%" stop-color="#f0f0f0"/>
        </linearGradient>
        <!-- Floor gradient (bottom) -->
        <linearGradient id="floor" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#e8e8e8"/>
          <stop offset="100%" stop-color="#dedede"/>
        </linearGradient>
      </defs>
      <!-- Wall -->
      <rect width="100%" height="${transitionY}" fill="url(#wall)"/>
      <!-- Floor -->
      <rect y="${transitionY}" width="100%" height="${outputHeight - transitionY}" fill="url(#floor)"/>
    </svg>
  `;
  const background = await sharp(Buffer.from(bgSvg)).png().toBuffer();
  
  // Position car: centered, wheels at ~85% (above the floor transition)
  const wheelLineY = Math.round(outputHeight * 0.85);
  const carLeft = Math.round((outputWidth - carWidth) / 2);
  const carTop = wheelLineY - carHeight;
  
  // AMAG-style contact shadow - visible but soft
  const shadowWidth = Math.round(carWidth * 0.9);
  const shadowHeight = Math.round(carHeight * 0.12); // Taller for visibility
  
  const shadowSvg = `
    <svg width="${shadowWidth}" height="${shadowHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="shadow" cx="50%" cy="0%" rx="50%" ry="100%">
          <stop offset="0%" stop-color="#000" stop-opacity="0.25"/>
          <stop offset="30%" stop-color="#000" stop-opacity="0.15"/>
          <stop offset="60%" stop-color="#000" stop-opacity="0.06"/>
          <stop offset="100%" stop-color="#000" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <ellipse cx="${shadowWidth/2}" cy="0" rx="${shadowWidth/2}" ry="${shadowHeight}" fill="url(#shadow)"/>
    </svg>
  `;
  
  const shadow = await sharp(Buffer.from(shadowSvg))
    .blur(2)
    .png()
    .toBuffer();
  
  // Shadow position: directly under car at wheel contact point
  const shadowLeft = Math.round((outputWidth - shadowWidth) / 2);
  const shadowTop = wheelLineY - Math.round(shadowHeight * 0.1);
  
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
