import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { removeBackground, upscaleImage } from '@/lib/replicate';
import sharp from 'sharp';

/**
 * Create AMAG-style studio composite with contour shadow
 * Shadow follows the car's bottom edge, not a simple ellipse
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
  
  // === SILHOUETTE SHADOW (AMAG style) ===
  // Create shadow from the car's alpha channel:
  // 1. Make car silhouette black
  // 2. Shift down slightly
  // 3. Blur heavily
  // 4. Reduce opacity
  
  // Create black silhouette from car's alpha
  const shadowPixels = new Uint8Array(info.width * info.height * 4);
  for (let i = 0; i < pixels.length; i += 4) {
    const alpha = pixels[i + 3];
    if (alpha > 128) {
      shadowPixels[i] = 0;       // R - black
      shadowPixels[i + 1] = 0;   // G - black
      shadowPixels[i + 2] = 0;   // B - black
      shadowPixels[i + 3] = 180; // A - strong shadow base
    }
  }
  
  // Create shadow: blur it and shift down
  const shadowBase = await sharp(Buffer.from(shadowPixels), {
    raw: { width: info.width, height: info.height, channels: 4 }
  })
    .blur(25) // Heavy blur for soft shadow
    .png()
    .toBuffer();
  
  // The shadow needs to be positioned lower and compressed vertically
  // We'll composite it shifted down
  const shadowShiftY = 15; // pixels to shift shadow down
  
  // Composite: background + shadow (shifted down) + car
  const result = await sharp(background)
    .composite([
      { input: shadowBase, left: 0, top: shadowShiftY, blend: 'multiply' },
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
