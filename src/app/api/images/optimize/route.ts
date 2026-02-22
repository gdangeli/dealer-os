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
  
  // === CONTOUR SHADOW ===
  // Find the bottom contour of the car (for each x, find the lowest visible pixel)
  const bottomContour: number[] = new Array(info.width).fill(-1);
  
  for (let x = 0; x < info.width; x++) {
    for (let y = info.height - 1; y >= 0; y--) {
      const idx = (y * info.width + x) * 4 + 3;
      if (pixels[idx] > 128) {
        bottomContour[x] = y;
        break;
      }
    }
  }
  
  // Create shadow by drawing the contour and blurring it
  // We'll create a grayscale image where the contour line is white
  const shadowCanvas = new Uint8Array(info.width * info.height * 4);
  
  // Draw the bottom contour as a thick line (shadow base)
  const shadowThickness = 8; // pixels thick
  for (let x = 0; x < info.width; x++) {
    const contourY = bottomContour[x];
    if (contourY > 0) {
      // Draw shadow below the contour point
      for (let dy = 0; dy < shadowThickness; dy++) {
        const y = contourY + dy;
        if (y < info.height) {
          const idx = (y * info.width + x) * 4;
          // Gradient: darker near contour, lighter below
          const intensity = Math.round(80 * (1 - dy / shadowThickness));
          shadowCanvas[idx] = 0;     // R
          shadowCanvas[idx + 1] = 0; // G
          shadowCanvas[idx + 2] = 0; // B
          shadowCanvas[idx + 3] = intensity; // A
        }
      }
    }
  }
  
  // Create the shadow image and blur it for soft edges
  const shadowImage = await sharp(Buffer.from(shadowCanvas), {
    raw: { width: info.width, height: info.height, channels: 4 }
  })
    .blur(12) // Soft gaussian blur
    .png()
    .toBuffer();
  
  // Composite: background + shadow + car
  const result = await sharp(background)
    .composite([
      { input: shadowImage, left: 0, top: 0, blend: 'multiply' },
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
