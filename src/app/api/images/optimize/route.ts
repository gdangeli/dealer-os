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
  
  // Get original dimensions - keep exactly as is for sharp edges
  const carMeta = await sharp(fgBuffer).metadata();
  const carWidth = carMeta.width || 1200;
  const carHeight = carMeta.height || 800;
  
  // Output same size as input
  const outputWidth = carWidth;
  const outputHeight = carHeight;
  
  // Transition at 35% from top
  const transitionY = Math.round(outputHeight * 0.35);
  
  // Background: wall + floor
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
  
  // Shadow: simple dark ellipse, clearly visible
  const shadowWidth = Math.round(carWidth * 0.7);
  const shadowHeight = Math.round(carHeight * 0.06);
  
  const shadowSvg = `
    <svg width="${shadowWidth}" height="${shadowHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="shadow" cx="50%" cy="50%" rx="50%" ry="50%">
          <stop offset="0%" stop-color="#000" stop-opacity="0.3"/>
          <stop offset="50%" stop-color="#000" stop-opacity="0.15"/>
          <stop offset="100%" stop-color="#000" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <ellipse cx="${shadowWidth/2}" cy="${shadowHeight/2}" rx="${shadowWidth/2}" ry="${shadowHeight/2}" fill="url(#shadow)"/>
    </svg>
  `;
  const shadow = await sharp(Buffer.from(shadowSvg)).png().toBuffer();
  
  // Position shadow at bottom of image (where wheels would be)
  // For rembg output, the car usually fills most of the image
  const shadowLeft = Math.round((outputWidth - shadowWidth) / 2);
  const shadowTop = Math.round(outputHeight * 0.88); // Near bottom
  
  // Car positioned at origin (0,0) - same size as output
  // Composite: background → shadow → car
  const result = await sharp(background)
    .composite([
      { input: shadow, left: shadowLeft, top: shadowTop, blend: 'multiply' },
      { input: fgBuffer, left: 0, top: 0 }, // Car at original position, sharp edges
    ])
    .jpeg({ quality: 95 }) // Higher quality
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
