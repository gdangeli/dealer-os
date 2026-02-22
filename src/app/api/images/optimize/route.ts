import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { removeBackground, upscaleImage } from '@/lib/replicate';
import sharp from 'sharp';

// Output dimensions (4:3 aspect ratio like AMAG)
const OUTPUT_WIDTH = 1200;
const OUTPUT_HEIGHT = 900;

/**
 * Create AMAG-style studio background
 * Clean white gradient with subtle floor
 */
async function createStudioBackground(): Promise<Buffer> {
  // AMAG style: very clean white at top, subtle gray at bottom
  const svg = `
    <svg width="${OUTPUT_WIDTH}" height="${OUTPUT_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Very subtle top-to-bottom gradient -->
        <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#fafafa"/>
          <stop offset="60%" stop-color="#f5f5f5"/>
          <stop offset="100%" stop-color="#ebebeb"/>
        </linearGradient>
        <!-- Floor gradient (bottom 35%) -->
        <linearGradient id="floor" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#e8e8e8"/>
          <stop offset="100%" stop-color="#e0e0e0"/>
        </linearGradient>
      </defs>
      <!-- Background -->
      <rect width="100%" height="100%" fill="url(#bg)"/>
      <!-- Floor -->
      <rect y="${OUTPUT_HEIGHT * 0.65}" width="100%" height="${OUTPUT_HEIGHT * 0.35}" fill="url(#floor)"/>
    </svg>
  `;
  
  return sharp(Buffer.from(svg)).png().toBuffer();
}

/**
 * Create realistic contact shadow (AMAG style)
 * Shadow is directly under the car, darkest at contact point
 */
async function createContactShadow(
  carWidth: number,
  carHeight: number
): Promise<Buffer> {
  // Shadow dimensions - wide and flat, directly under car
  const shadowWidth = Math.round(carWidth * 0.9);
  const shadowHeight = Math.round(carHeight * 0.08); // Very flat shadow
  
  // Create multi-layer shadow for realism
  const svg = `
    <svg width="${shadowWidth}" height="${shadowHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Main contact shadow - darkest in center -->
        <radialGradient id="contactShadow" cx="50%" cy="30%" rx="50%" ry="70%">
          <stop offset="0%" stop-color="#000000" stop-opacity="0.35"/>
          <stop offset="40%" stop-color="#000000" stop-opacity="0.20"/>
          <stop offset="70%" stop-color="#000000" stop-opacity="0.08"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <!-- Shadow ellipse -->
      <ellipse cx="${shadowWidth / 2}" cy="${shadowHeight * 0.4}" 
               rx="${shadowWidth * 0.48}" ry="${shadowHeight * 0.5}" 
               fill="url(#contactShadow)"/>
    </svg>
  `;
  
  // Apply blur for softness
  return sharp(Buffer.from(svg))
    .blur(3)
    .png()
    .toBuffer();
}

/**
 * Create AMAG-style studio composite
 */
async function createStudioComposite(foregroundUrl: string): Promise<Buffer> {
  // Fetch the car image (with transparent background)
  const fgResponse = await fetch(foregroundUrl);
  const fgBuffer = Buffer.from(await fgResponse.arrayBuffer());
  
  // Get car dimensions
  const carMeta = await sharp(fgBuffer).metadata();
  const carOrigWidth = carMeta.width || 1000;
  const carOrigHeight = carMeta.height || 600;
  
  // Resize car to fit (75% of output width max)
  const maxCarWidth = Math.round(OUTPUT_WIDTH * 0.75);
  const scale = Math.min(maxCarWidth / carOrigWidth, 1);
  const carWidth = Math.round(carOrigWidth * scale);
  const carHeight = Math.round(carOrigHeight * scale);
  
  const resizedCar = await sharp(fgBuffer)
    .resize(carWidth, carHeight, { fit: 'inside' })
    .png()
    .toBuffer();
  
  const finalMeta = await sharp(resizedCar).metadata();
  const finalCarWidth = finalMeta.width || carWidth;
  const finalCarHeight = finalMeta.height || carHeight;
  
  // Create background
  const background = await createStudioBackground();
  
  // Create shadow
  const shadow = await createContactShadow(finalCarWidth, finalCarHeight);
  const shadowMeta = await sharp(shadow).metadata();
  const shadowWidth = shadowMeta.width || finalCarWidth;
  const shadowHeight = shadowMeta.height || 50;
  
  // Position calculations
  // Floor line is at 65% from top
  const floorY = Math.round(OUTPUT_HEIGHT * 0.65);
  
  // Car bottom should sit exactly on the floor line
  // Adjust for the fact that car images often have some padding at bottom
  const carBottom = floorY + Math.round(finalCarHeight * 0.02); // Tiny offset to "ground" it
  const carTop = carBottom - finalCarHeight;
  const carLeft = Math.round((OUTPUT_WIDTH - finalCarWidth) / 2);
  
  // Shadow sits directly on floor, centered under car
  const shadowTop = floorY - Math.round(shadowHeight * 0.5);
  const shadowLeft = carLeft + Math.round((finalCarWidth - shadowWidth) / 2);
  
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

    // Optionally save to Supabase Storage
    const saveToStorage = body.saveToStorage;
    if (saveToStorage && resultUrl.startsWith('http')) {
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
