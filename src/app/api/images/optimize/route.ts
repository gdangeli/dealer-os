import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { processImage, analyzeImage, VUMO_CONFIGS, VumoConfigKey } from '@/lib/vumo';

/**
 * Map UI options to Vumo configuration
 */
function selectVumoConfig(options: {
  backgroundTemplate?: string;
  blurPlates?: boolean;
  removeBackground?: boolean;
}): string {
  const { backgroundTemplate, blurPlates, removeBackground } = options;
  
  // If blur plates is the main operation
  if (blurPlates && !removeBackground) {
    return VUMO_CONFIGS['blur_plate'];
  }
  
  // Map background templates to Vumo configs
  // Handle various formats: "showroom-classic", "Moderner Showroom", etc.
  const normalizedTemplate = backgroundTemplate?.toLowerCase().replace(/[\s-]+/g, '_') || '';
  
  const templateMapping: Record<string, VumoConfigKey> = {
    // Frontend keys (showroom-xxx format)
    'showroom_modern': 'modern',
    'showroom_classic': 'classic',
    'outdoor': 'outdoor',
    'white': 'white',
    'transparent': 'white', // Vumo doesn't have transparent, use white
    
    // German UI names (with underscores after normalization)
    'moderner_showroom': 'modern',
    'klassischer_showroom': 'classic',
    'outdoor_setting': 'outdoor',
    'minimalistisch_weiss': 'white',
    
    // English variants
    'modern_showroom': 'modern',
    'classic_showroom': 'classic',
    'minimalist': 'white',
    
    // Short keys
    'modern': 'modern',
    'classic': 'classic',
    'checkered': 'checkered',
    'led': 'led',
  };
  
  console.log(`[Vumo] Template received: "${backgroundTemplate}" -> normalized: "${normalizedTemplate}"`);
  
  const configKey = templateMapping[normalizedTemplate] || 'modern';
  console.log(`[Vumo] Using config key: "${configKey}" -> "${VUMO_CONFIGS[configKey]}"`);
  
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
      imageUrl, 
      operations = ['enhance'], 
      backgroundTemplate,
      blurPlates = false,
      autoOptimize = true,
    } = body;

    if (!imageUrl) {
      return NextResponse.json({ error: 'No image URL provided' }, { status: 400 });
    }

    const results: Record<string, string> = {};
    let resultUrl = imageUrl;

    // Fetch the original image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: 400 });
    }
    let imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

    // Determine which operations to perform
    const shouldRemoveBackground = operations.includes('remove_background') || backgroundTemplate;
    const shouldBlurPlates = operations.includes('blur_plates') || blurPlates;
    const shouldEnhance = operations.includes('enhance') || autoOptimize;

    // Select the appropriate Vumo config based on options
    if (shouldRemoveBackground || shouldBlurPlates) {
      try {
        const vumoConfig = selectVumoConfig({
          backgroundTemplate,
          blurPlates: shouldBlurPlates,
          removeBackground: shouldRemoveBackground,
        });

        console.log(`Processing with Vumo config: ${vumoConfig}`);
        
        // Process with Vumo
        const processedBuffer = await processImage(imageBuffer, vumoConfig, {
          customerId: `dealer-os-${user.id}`,
        });

        // Save to Supabase storage
        const fileName = `vumo/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
        const { data: uploadData, error: uploadError } = await adminClient
          .storage
          .from('vehicle-images')
          .upload(fileName, processedBuffer, { 
            contentType: 'image/jpeg',
            upsert: true,
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error('Failed to save processed image');
        }

        const { data: publicUrl } = adminClient.storage
          .from('vehicle-images')
          .getPublicUrl(fileName);

        resultUrl = publicUrl.publicUrl;
        results.processed = resultUrl;

        if (shouldRemoveBackground) {
          results.background_removed = resultUrl;
        }
        if (shouldBlurPlates) {
          results.plates_blurred = resultUrl;
        }
        if (backgroundTemplate) {
          results.composited = resultUrl;
        }

      } catch (vumoError) {
        console.error('Vumo processing error:', vumoError);
        return NextResponse.json(
          { error: vumoError instanceof Error ? vumoError.message : 'Vumo processing failed' },
          { status: 500 }
        );
      }
    }

    // For enhance-only operations without background removal,
    // we could use Vumo's enhancement or keep existing logic
    if (shouldEnhance && !shouldRemoveBackground && !shouldBlurPlates) {
      // For now, return original - Vumo enhancement requires bg removal
      results.enhanced = resultUrl;
    }

    return NextResponse.json({ 
      success: true, 
      images: results, 
      final: resultUrl,
      provider: 'vumo',
    });

  } catch (error) {
    console.error('Image optimization error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Processing failed' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to analyze an image
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const imageUrl = request.nextUrl.searchParams.get('url');
    if (!imageUrl) {
      return NextResponse.json({ error: 'No image URL provided' }, { status: 400 });
    }

    // Fetch and analyze
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    
    const analysis = await analyzeImage(imageBuffer);

    return NextResponse.json({
      success: true,
      analysis,
    });

  } catch (error) {
    console.error('Image analysis error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    );
  }
}
