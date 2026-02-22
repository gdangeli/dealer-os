import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { removeBackground, upscaleImage } from '@/lib/replicate';
import sharp from 'sharp';

/**
 * Create AMAG-style shadow from car silhouette
 * The shadow is derived from the car's actual shape, flipped and compressed
 */
async function createSilhouetteShadow(carBuffer: Buffer, carWidth: number, carHeight: number): Promise<Buffer> {
  // Create shadow from car silhouette:
  // 1. Extract alpha channel (car shape)
  // 2. Fill with dark color
  // 3. Flip vertically
  // 4. Compress vertically (flatten)
  // 5. Blur for softness
  // 6. Reduce opacity
  
  const shadowHeight = Math.round(carHeight * 0.15); // Shadow is 15% of car height
  
  // Create silhouette: extract shape, fill black, flip, compress
  const silhouette = await sharp(carBuffer)
    .ensureAlpha()
    .extractChannel('alpha')
    .negate() // Invert so car area is white
    .resize(carWidth, shadowHeight, { fit: 'fill' }) // Compress vertically
    .flip() // Flip vertically for reflection effect
    .blur(8) // Soft blur
    .toBuffer();
  
  // Create the shadow with proper opacity
  const shadow = await sharp({
    create: {
      width: carWidth,
      height: shadowHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite([{
      input: await sharp(silhouette)
        .ensureAlpha()
        .modulate({ brightness: 0.3 }) // Darken
        .toBuffer(),
      blend: 'over'
    }])
    .png()
    .toBuffer();
  
  return shadow;
}

/**
 * Create AMAG-style studio composite
 * Shadow is derived from car silhouette, positioned at contact point
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
  
  // Create background - clean white to light gray gradient
  const bgSvg = `
    <svg width="${outputWidth}" height="${outputHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="60%" stop-color="#fafafa"/>
          <stop offset="85%" stop-color="#f0f0f0"/>
          <stop offset="100%" stop-color="#e8e8e8"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)"/>
    </svg>
  `;
  const background = await sharp(Buffer.from(bgSvg)).png().toBuffer();
  
  // Create silhouette-based shadow
  let shadow: Buffer;
  let shadowHeight: number;
  try {
    shadow = await createSilhouetteShadow(trimmedCar, carWidth, carHeight);
    shadowHeight = Math.round(carHeight * 0.15);
  } catch {
    // Fallback to simple ellipse shadow if silhouette fails
    shadowHeight = Math.round(carHeight * 0.08);
    const shadowSvg = `
      <svg width="${carWidth}" height="${shadowHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="shadow" cx="50%" cy="50%" rx="50%" ry="50%">
            <stop offset="0%" stop-color="#000" stop-opacity="0.2"/>
            <stop offset="100%" stop-color="#000" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <ellipse cx="${carWidth/2}" cy="${shadowHeight/2}" rx="${carWidth*0.45}" ry="${shadowHeight*0.45}" fill="url(#shadow)"/>
      </svg>
    `;
    shadow = await sharp(Buffer.from(shadowSvg)).blur(2).png().toBuffer();
  }
  
  // Position car: centered, wheels near bottom (90% of image)
  const wheelLineY = Math.round(outputHeight * 0.90);
  const carLeft = Math.round((outputWidth - carWidth) / 2);
  const carTop = wheelLineY - carHeight;
  
  // Shadow starts RIGHT at the bottom of the car (contact point)
  const shadowTop = wheelLineY - Math.round(shadowHeight * 0.1); // Slight overlap
  const shadowLeft = carLeft;
  
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
