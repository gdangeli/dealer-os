import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { removeBackground, upscaleImage } from '@/lib/replicate';

// Background templates stored in Supabase Storage
const BACKGROUND_TEMPLATES: Record<string, string> = {
  'showroom-modern': 'backgrounds/showroom-modern.jpg',
  'showroom-classic': 'backgrounds/showroom-classic.jpg',
  'showroom-outdoor': 'backgrounds/showroom-outdoor.jpg',
  'showroom-minimal': 'backgrounds/showroom-minimal.jpg',
};

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
        if (backgroundTemplate && backgroundTemplate !== 'none') {
          // For now, just return the transparent version
          // TODO: Composite with background template
          resultUrl = noBgUrl;
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
