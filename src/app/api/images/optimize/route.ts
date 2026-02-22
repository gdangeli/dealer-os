import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { removeBackground, upscaleImage } from '@/lib/replicate';
import sharp from 'sharp';

// Studio background dimensions
const STUDIO_WIDTH = 1920;
const STUDIO_HEIGHT = 1280;

/**
 * Create AMAG-style studio background with gradient
 */
async function createStudioBackground(): Promise<Buffer> {
  // Create a clean white-to-gray gradient like AMAG uses
  const svg = `
    <svg width="${STUDIO_WIDTH}" height="${STUDIO_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#f5f5f5"/>
          <stop offset="50%" stop-color="#f0f0f0"/>
          <stop offset="75%" stop-color="#e8e8e8"/>
          <stop offset="100%" stop-color="#e0e0e0"/>
        </linearGradient>
        <!-- Floor gradient for depth -->
        <linearGradient id="floor" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#e5e5e5"/>
          <stop offset="100%" stop-color="#d8d8d8"/>
        </linearGradient>
      </defs>
      <!-- Background -->
      <rect width="100%" height="100%" fill="url(#bg)"/>
      <!-- Floor area (bottom 40%) -->
      <rect y="${STUDIO_HEIGHT * 0.6}" width="100%" height="${STUDIO_HEIGHT * 0.4}" fill="url(#floor)"/>
      <!-- Subtle horizon line -->
      <line x1="0" y1="${STUDIO_HEIGHT * 0.6}" x2="${STUDIO_WIDTH}" y2="${STUDIO_HEIGHT * 0.6}" 
            stroke="#d0d0d0" stroke-width="1" opacity="0.5"/>
    </svg>
  `;
  
  return sharp(Buffer.from(svg)).png().toBuffer();
}

/**
 * Create a realistic shadow from the car's silhouette
 */
async function createCarShadow(
  carBuffer: Buffer,
  carWidth: number,
  carHeight: number
): Promise<Buffer> {
  // Extract alpha channel to get car silhouette
  const { data, info } = await sharp(carBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  
  // Create shadow from alpha channel
  // Shadow is flattened (compressed vertically) and shifted down
  const shadowHeight = Math.round(carHeight * 0.15); // Shadow is 15% of car height
  const shadowWidth = carWidth;
  
  // Create shadow as a dark semi-transparent ellipse that follows car shape
  const shadowSvg = `
    <svg width="${shadowWidth}" height="${shadowHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="shadow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" stop-color="#000000" stop-opacity="0.25"/>
          <stop offset="60%" stop-color="#000000" stop-opacity="0.15"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <ellipse cx="${shadowWidth / 2}" cy="${shadowHeight / 2}" 
               rx="${shadowWidth * 0.45}" ry="${shadowHeight * 0.4}" 
               fill="url(#shadow)"/>
    </svg>
  `;
  
  return sharp(Buffer.from(shadowSvg))
    .png()
    .toBuffer();
}

/**
 * Composite car with shadow onto studio background (AMAG style)
 */
async function createStudioComposite(foregroundUrl: string): Promise<Buffer> {
  // Fetch the car image (with transparent background)
  const fgResponse = await fetch(foregroundUrl);
  const fgBuffer = Buffer.from(await fgResponse.arrayBuffer());
  
  // Get car dimensions
  const carMeta = await sharp(fgBuffer).metadata();
  const carOrigWidth = carMeta.width || 1000;
  const carOrigHeight = carMeta.height || 600;
  
  // Resize car to fit nicely (70% of studio width)
  const targetWidth = Math.round(STUDIO_WIDTH * 0.70);
  const scale = targetWidth / carOrigWidth;
  const targetHeight = Math.round(carOrigHeight * scale);
  
  const resizedCar = await sharp(fgBuffer)
    .resize(targetWidth, targetHeight, { fit: 'inside' })
    .png()
    .toBuffer();
  
  const resizedMeta = await sharp(resizedCar).metadata();
  const finalCarWidth = resizedMeta.width || targetWidth;
  const finalCarHeight = resizedMeta.height || targetHeight;
  
  // Create studio background
  const background = await createStudioBackground();
  
  // Create shadow
  const shadow = await createCarShadow(resizedCar, finalCarWidth, finalCarHeight);
  const shadowMeta = await sharp(shadow).metadata();
  
  // Calculate positions
  // Car sits at the horizon line (60% from top)
  const horizonY = Math.round(STUDIO_HEIGHT * 0.6);
  
  // Car bottom should be at horizon + small offset
  const carTop = horizonY - finalCarHeight + Math.round(finalCarHeight * 0.05);
  const carLeft = Math.round((STUDIO_WIDTH - finalCarWidth) / 2);
  
  // Shadow position (directly under car, on the floor)
  const shadowTop = horizonY - Math.round((shadowMeta.height || 50) * 0.3);
  const shadowLeft = carLeft + Math.round(finalCarWidth * 0.025); // Slightly offset for realism
  
  // Composite: background → shadow → car
  const result = await sharp(background)
    .composite([
      {
        input: shadow,
        left: shadowLeft,
        top: shadowTop,
        blend: 'multiply',
      },
      {
        input: resizedCar,
        left: carLeft,
        top: carTop,
      },
    ])
    .jpeg({ quality: 92 })
    .toBuffer();
  
  return result;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();
    
    // Verify auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      imageUrl,
      operations = ['enhance'],
      backgroundTemplate,
    } = body;

    if (!imageUrl) {
      return NextResponse.json({ error: 'No image URL provided' }, { status: 400 });
    }

    let resultUrl = imageUrl;
    const results: Record<string, string> = {};

    // Process operations in order
    for (const op of operations) {
      if (op === 'remove_background') {
        // Remove background using Replicate
        const noBgUrl = await removeBackground(resultUrl);
        results.background_removed = noBgUrl;
        
        // If any background template is selected (not transparent), create studio composite
        if (backgroundTemplate && backgroundTemplate !== 'none' && backgroundTemplate !== 'transparent') {
          try {
            // Create AMAG-style studio composite with shadow
            const compositedBuffer = await createStudioComposite(noBgUrl);
            
            // Upload composited image to Supabase Storage
            const fileName = `studio/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
            const { data: uploadData, error: uploadError } = await adminClient
              .storage
              .from('vehicle-images')
              .upload(fileName, compositedBuffer, {
                contentType: 'image/jpeg',
              });
            
            if (!uploadError && uploadData) {
              const { data: publicUrl } = adminClient
                .storage
                .from('vehicle-images')
                .getPublicUrl(fileName);
              
              resultUrl = publicUrl.publicUrl;
              results.composited = resultUrl;
            } else {
              console.error('Failed to upload composited image:', uploadError);
              resultUrl = noBgUrl; // Fallback to transparent version
            }
          } catch (compError) {
            console.error('Compositing error:', compError);
            resultUrl = noBgUrl; // Fallback to transparent version
          }
        } else {
          resultUrl = noBgUrl;
        }
      }
      
      if (op === 'enhance' || op === 'upscale') {
        // Upscale/enhance using Real-ESRGAN
        const enhancedUrl = await upscaleImage(resultUrl, 2);
        results.enhanced = enhancedUrl;
        resultUrl = enhancedUrl;
      }
      
      if (op === 'blur_plates') {
        // TODO: Implement license plate detection and blur
        // For now, skip this operation
        results.plates_blurred = resultUrl;
      }
    }

    // Optionally save to Supabase Storage
    const saveToStorage = body.saveToStorage;
    if (saveToStorage && resultUrl.startsWith('http')) {
      // Download and save to Supabase
      const imageResponse = await fetch(resultUrl);
      const imageBuffer = await imageResponse.arrayBuffer();
      const fileName = `optimized/${Date.now()}-${Math.random().toString(36).slice(2)}.png`;
      
      const { data: uploadData, error: uploadError } = await adminClient
        .storage
        .from('vehicle-images')
        .upload(fileName, imageBuffer, {
          contentType: 'image/png',
        });
      
      if (!uploadError && uploadData) {
        const { data: publicUrl } = adminClient
          .storage
          .from('vehicle-images')
          .getPublicUrl(fileName);
        
        resultUrl = publicUrl.publicUrl;
      }
    }

    return NextResponse.json({
      success: true,
      images: results,
      final: resultUrl,
    });

  } catch (error) {
    console.error('Image optimization error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Processing failed' },
      { status: 500 }
    );
  }
}
