import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { runPhotoAI } from '@/lib/runpod';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verify auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      imageUrl, 
      imageBase64,
      operations = ['enhance'],
      backgroundTemplate,
      backgroundImage,
      blurStrength = 51
    } = body;

    // Get image as base64
    let base64Image = imageBase64;
    if (!base64Image && imageUrl) {
      // Fetch image from URL and convert to base64
      const imageResponse = await fetch(imageUrl);
      const arrayBuffer = await imageResponse.arrayBuffer();
      base64Image = Buffer.from(arrayBuffer).toString('base64');
    }

    if (!base64Image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Prepare background image if template selected
    let bgImageBase64: string | undefined;
    if (backgroundTemplate && operations.includes('remove_background')) {
      // Load template from our assets
      bgImageBase64 = await getBackgroundTemplate(backgroundTemplate);
    } else if (backgroundImage) {
      bgImageBase64 = backgroundImage;
    }

    // Call RunPod
    const result = await runPhotoAI({
      image: base64Image,
      operations: operations as any[],
      background_image: bgImageBase64,
      blur_strength: blurStrength,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Processing failed' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      images: result.images,
      final: result.final,
    });

  } catch (error) {
    console.error('Image optimization error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Processing failed' },
      { status: 500 }
    );
  }
}

// Background templates
const BACKGROUND_TEMPLATES: Record<string, string> = {
  'showroom-modern': '/backgrounds/showroom-modern.jpg',
  'showroom-classic': '/backgrounds/showroom-classic.jpg',
  'showroom-outdoor': '/backgrounds/showroom-outdoor.jpg',
  'showroom-minimal': '/backgrounds/showroom-minimal.jpg',
  'white': '', // Solid white
  'gradient-blue': '', // Gradient
};

async function getBackgroundTemplate(templateId: string): Promise<string | undefined> {
  const templatePath = BACKGROUND_TEMPLATES[templateId];
  
  if (!templatePath) {
    // Solid colors
    if (templateId === 'white') {
      // Return a white background placeholder - will be handled by color option
      return undefined;
    }
    return undefined;
  }

  // In production, load from Supabase Storage or public assets
  // For now, return undefined and handle in the RunPod handler
  return undefined;
}
