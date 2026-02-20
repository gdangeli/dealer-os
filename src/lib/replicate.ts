/**
 * Replicate API Client for AI image processing
 * Uses pre-hosted models - no Docker setup needed
 */

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

// Model versions (stable)
const MODELS = {
  // Background removal
  rembg: "cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003",
  // Image upscaling
  realEsrgan: "nightmareai/real-esrgan:f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa",
};

interface ReplicateInput {
  image: string; // URL or base64 data URI
}

export async function removeBackground(imageUrl: string): Promise<string> {
  if (!REPLICATE_API_TOKEN) {
    throw new Error('Replicate API token not configured');
  }

  const response = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      "Authorization": `Token ${REPLICATE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version: MODELS.rembg.split(":")[1],
      input: { image: imageUrl },
    }),
  });

  if (!response.ok) {
    throw new Error(`Replicate API error: ${response.status}`);
  }

  const prediction = await response.json();
  
  // Poll for result
  return await pollPrediction(prediction.id);
}

export async function upscaleImage(imageUrl: string, scale: number = 2): Promise<string> {
  if (!REPLICATE_API_TOKEN) {
    throw new Error('Replicate API token not configured');
  }

  const response = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      "Authorization": `Token ${REPLICATE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version: MODELS.realEsrgan.split(":")[1],
      input: { 
        image: imageUrl,
        scale,
        face_enhance: false,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Replicate API error: ${response.status}`);
  }

  const prediction = await response.json();
  return await pollPrediction(prediction.id);
}

async function pollPrediction(predictionId: string, maxAttempts = 60): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: {
        "Authorization": `Token ${REPLICATE_API_TOKEN}`,
      },
    });

    const prediction = await response.json();

    if (prediction.status === "succeeded") {
      // Return the output URL
      return prediction.output;
    } else if (prediction.status === "failed") {
      throw new Error(prediction.error || "Prediction failed");
    }

    // Wait 1 second before next poll
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  throw new Error("Prediction timed out");
}

// License plate blur using OpenCV (client-side or simple server processing)
export async function blurLicensePlates(imageUrl: string): Promise<string> {
  // For now, return the original image
  // TODO: Implement with custom model or OpenCV
  return imageUrl;
}
