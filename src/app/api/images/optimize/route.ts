import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { removeBackground, upscaleImage } from '@/lib/replicate';
import sharp from 'sharp';

/**
 * Create AMAG-style studio composite
 */
async function createStudioComposite(foregroundUrl: string): Promise<Buffer> {
  // Fetch the car image
  const fgResponse = await fetch(foregroundUrl);
  const fgBuffer = Buffer.from(await fgResponse.arrayBuffer());
  
  // Get dimensions
  const carMeta = await sharp(fgBuffer).metadata();
  const outputWidth = carMeta.width || 1200;
  const outputHeight = carMeta.height || 800;
  
  // Sharpen the car edges by thresholding alpha channel
  // This removes the semi-transparent halo from rembg
  const sharpCar = await sharp(fgBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  
  const { data, info } = sharpCar;
  const pixels = new Uint8Array(data);
  
  // Threshold alpha: if > 128, set to 255; else set to 0
  for (let i = 3; i < pixels.length; i += 4) {
    pixels[i] = pixels[i] > 128 ? 255 : 0;
  }
  
  const sharpenedCar = await sharp(pixels, {
    raw: { width: info.width, height: info.height, channels: 4 }
  }).png().toBuffer();
  
  // Transition at 35% from top
  const transitionY = Math.round(outputHeight * 0.35);
  
  // Background
  const bgSvg = `
    <svg width="${outputWidth}" height="${outputHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wall" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#f8f8f8"/>
          <stop offset="100%" stop-color="#f0f0f0"/>
        </linearGradient>
        <linearGradient id="floor" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#e8e8e8"/>
          <stop offset="100%" stop-color="#dedede"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="${transitionY}" fill="url(#wall)"/>
      <rect y="${transitionY}" width="100%" height="${outputHeight - transitionY}" fill="url(#floor)"/>
    </svg>
  `;
  const background = await sharp(Buffer.from(bgSvg)).png().toBuffer();
  
  // Find where the car actually ends (bottom-most non-transparent pixel)
  let carBottomY = outputHeight;
  for (let y = info.height - 1; y >= 0; y--) {
    let hasPixel = false;
    for (let x = 0; x < info.width; x++) {
      const idx = (y * info.width + x) * 4 + 3;
      if (pixels[idx] > 128) {
        hasPixel = true;
        break;
      }
    }
    if (hasPixel) {
      carBottomY = y;
      break;
    }
  }
  
  // Shadow like ceiling light: directly under the car, soft and centered
  const shadowWidth = Math.round(outputWidth * 0.55);
  const shadowHeight = 60; // Taller for softer gradient
  const shadowY = carBottomY - 10; // Just slightly overlapping car bottom
  
  const shadowSvg = `
    <svg width="${shadowWidth}" height="${shadowHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="shadow" cx="50%" cy="30%" rx="50%" ry="70%">
          <stop offset="0%" stop-color="#000" stop-opacity="0.22"/>
          <stop offset="40%" stop-color="#000" stop-opacity="0.12"/>
          <stop offset="70%" stop-color="#000" stop-opacity="0.05"/>
          <stop offset="100%" stop-color="#000" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <ellipse cx="${shadowWidth/2}" cy="${shadowHeight * 0.35}" rx="${shadowWidth/2}" ry="${shadowHeight * 0.6}" fill="url(#shadow)"/>
    </svg>
  `;
  const shadow = await sharp(Buffer.from(shadowSvg)).png().toBuffer();
  const shadowLeft = Math.round((outputWidth - shadowWidth) / 2);
  
  // Composite
  const result = await sharp(background)
    .composite([
      { input: shadow, left: shadowLeft, top: shadowY, blend: 'multiply' },
      { input: sharpenedCar, left: 0, top: 0 },
    ])
    .jpeg({ quality: 95 })
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
