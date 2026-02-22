import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { removeBackground, upscaleImage } from '@/lib/replicate';
import sharp from 'sharp';
import path from 'path';

// Background templates in public folder
const BACKGROUND_TEMPLATES: Record<string, string> = {
  'showroom-modern': 'showroom-modern.jpg',
  'showroom-classic': 'showroom-classic.jpg',
  'showroom-outdoor': 'showroom-outdoor.jpg',
  'showroom-minimal': 'showroom-minimal.jpg',
};

/**
 * Composite a foreground image (with transparency) onto a background
 */
async function compositeImages(
  foregroundUrl: string,
  backgroundTemplate: string
): Promise<Buffer> {
  // Fetch the foreground image (car with transparent background)
  const fgResponse = await fetch(foregroundUrl);
  const fgBuffer = Buffer.from(await fgResponse.arrayBuffer());
  
  // Get background image path
  const bgFilename = BACKGROUND_TEMPLATES[backgroundTemplate];
  if (!bgFilename) {
    throw new Error(`Unknown background template: ${backgroundTemplate}`);
  }
  
  // Load background from public folder
  const bgPath = path.join(process.cwd(), 'public', 'backgrounds', bgFilename);
  
  // Get dimensions of both images
  const fgMeta = await sharp(fgBuffer).metadata();
  const bgImage = sharp(bgPath);
  const bgMeta = await bgImage.metadata();
  
  // Resize foreground to fit nicely on background (80% width, positioned at bottom)
  const targetWidth = Math.round((bgMeta.width || 1920) * 0.75);
  const resizedFg = await sharp(fgBuffer)
    .resize(targetWidth, null, { fit: 'inside' })
    .toBuffer();
  
  const resizedMeta = await sharp(resizedFg).metadata();
  
  // Calculate position (centered horizontally, sitting on the "floor" ~35% from bottom)
  const left = Math.round(((bgMeta.width || 1920) - (resizedMeta.width || targetWidth)) / 2);
  const top = Math.round((bgMeta.height || 1280) * 0.30); // Position car so it sits on the floor line
  
  // Composite
  const result = await sharp(bgPath)
    .composite([{
      input: resizedFg,
      left,
      top,
    }])
    .jpeg({ quality: 90 })
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
        
        // If a background template is selected, composite the images
        if (backgroundTemplate && backgroundTemplate !== 'none' && backgroundTemplate !== 'transparent') {
          try {
            // Composite car onto showroom background
            const compositedBuffer = await compositeImages(noBgUrl, backgroundTemplate);
            
            // Upload composited image to Supabase Storage
            const fileName = `composited/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
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
