import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { processImagesFromUrls, VUMO_CONFIGS, VumoConfigKey } from '@/lib/vumo';

/**
 * Map UI background template to Vumo config
 */
function getVumoConfig(backgroundTemplate?: string): string {
  const normalizedTemplate = backgroundTemplate?.toLowerCase().replace(/[\s-]+/g, '_') || '';
  
  const templateMapping: Record<string, VumoConfigKey> = {
    'showroom_modern': 'modern',
    'showroom_classic': 'classic',
    'showroom_outdoor': 'outdoor',
    'showroom_minimal': 'white',
    'none': 'white',
    'modern': 'modern',
    'classic': 'classic',
    'outdoor': 'outdoor',
    'white': 'white',
  };
  
  const configKey = templateMapping[normalizedTemplate] || 'modern';
  return VUMO_CONFIGS[configKey];
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
    const { 
      images, // Array of { id: string, url: string }
      backgroundTemplate,
    } = body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 });
    }

    if (images.length > 20) {
      return NextResponse.json({ error: 'Maximum 20 images per batch' }, { status: 400 });
    }

    const vumoConfig = getVumoConfig(backgroundTemplate);
    console.log(`[Batch Optimize] Processing ${images.length} images with config: ${vumoConfig}`);

    // Extract URLs for Vumo
    const imageUrls = images.map((img: { url: string }) => img.url);

    // Process all images with Vumo
    const vumoResults = await processImagesFromUrls(imageUrls, vumoConfig, {
      customerId: `dealer-os-batch-${user.id}`,
    });

    // Save results to Supabase storage and update URLs
    const results: Array<{
      id: string;
      originalUrl: string;
      newUrl?: string;
      error?: string;
    }> = [];

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const vumoResult = vumoResults[i];

      if (vumoResult.error || !vumoResult.urlPhoto) {
        results.push({
          id: image.id,
          originalUrl: image.url,
          error: vumoResult.error || 'Processing failed',
        });
        continue;
      }

      try {
        // Download the processed image from Vumo
        const imageResponse = await fetch(vumoResult.urlPhoto);
        if (!imageResponse.ok) {
          throw new Error('Failed to download processed image');
        }
        const imageBuffer = await imageResponse.arrayBuffer();

        // Upload to Supabase storage
        const fileName = `vumo-batch/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
        const { error: uploadError } = await adminClient
          .storage
          .from('vehicle-images')
          .upload(fileName, imageBuffer, { 
            contentType: 'image/jpeg',
            upsert: true,
          });

        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`);
        }

        const { data: publicUrl } = adminClient.storage
          .from('vehicle-images')
          .getPublicUrl(fileName);

        results.push({
          id: image.id,
          originalUrl: image.url,
          newUrl: publicUrl.publicUrl,
        });

      } catch (err) {
        console.error(`Error saving image ${image.id}:`, err);
        results.push({
          id: image.id,
          originalUrl: image.url,
          error: err instanceof Error ? err.message : 'Save failed',
        });
      }
    }

    const successful = results.filter(r => r.newUrl).length;
    const failed = results.filter(r => r.error).length;

    console.log(`[Batch Optimize] Complete: ${successful} successful, ${failed} failed`);

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: images.length,
        successful,
        failed,
      },
    });

  } catch (error) {
    console.error('Batch optimization error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Batch processing failed' },
      { status: 500 }
    );
  }
}
