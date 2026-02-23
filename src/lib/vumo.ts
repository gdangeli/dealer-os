/**
 * Vumo.ai / Vumography API Client
 * Professional car photo background replacement and optimization
 * 
 * API Docs: https://code.vumography.vumo.ai/
 */

// Token cache
let tokenCache: { 
  access_token: string; 
  refresh_token: string; 
  expires_at: number;
} | null = null;

const VUMO_AUTH_URL = 'https://auth.vumo.ai';
const VUMO_API_URL = 'https://api.vumography.vumo.ai';

// Credentials from environment
const VUMO_USERNAME = process.env.VUMO_USERNAME || 'carauktion';
const VUMO_PASSWORD = process.env.VUMO_PASSWORD || '';

/**
 * Available Vumo configurations mapped to user-friendly names
 */
export const VUMO_CONFIGS = {
  // Showroom backgrounds
  'modern': 'default_platform_bright',      // Bright modern showroom
  'classic': 'default_platform_23',          // Classic showroom with depth
  'outdoor': 'default_fog',                  // Foggy outdoor setting
  'white': 'default_simple',                 // Clean white background
  'checkered': 'default_checkered_platfor',  // Checkered platform
  'led': 'default_led_platform',             // LED platform
  'concrete': 'default_platform_18',         // Concrete platform
  
  // Utility configs
  'blur_plate': 'default_onlyplate_blur',    // Blur license plate + white bg
  'gray_plate': 'default_onlyplate_gray',    // Gray license plate + white bg
  'blur_background': 'default_blurBackground', // Blur original background
  'interior': 'default_interior_simple',     // Interior cutout (360°)
  
  // Analysis only
  'analyze': 'default_classification',       // Just classify the image
} as const;

export type VumoConfigKey = keyof typeof VUMO_CONFIGS;

/**
 * Get access token, using cache if valid
 */
async function getAccessToken(): Promise<string> {
  // Check if we have a valid cached token (with 5 min buffer)
  if (tokenCache && tokenCache.expires_at > Date.now() + 5 * 60 * 1000) {
    return tokenCache.access_token;
  }
  
  // Try to refresh if we have a refresh token
  if (tokenCache?.refresh_token) {
    try {
      const refreshed = await refreshToken(tokenCache.refresh_token);
      return refreshed;
    } catch {
      // Refresh failed, get new token
      tokenCache = null;
    }
  }
  
  // Get new token
  const response = await fetch(`${VUMO_AUTH_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: VUMO_USERNAME,
      password: VUMO_PASSWORD,
      system: 'autography',
    }),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`Vumo auth failed: ${error.message || response.statusText}`);
  }
  
  const data = await response.json();
  
  tokenCache = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + (data.expires_in * 1000),
  };
  
  return data.access_token;
}

/**
 * Refresh an expired token
 */
async function refreshToken(refresh_token: string): Promise<string> {
  const response = await fetch(`${VUMO_AUTH_URL}/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token }),
  });
  
  if (!response.ok) {
    throw new Error('Token refresh failed');
  }
  
  const data = await response.json();
  
  tokenCache = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + (data.expires_in * 1000),
  };
  
  return data.access_token;
}

/**
 * Process an image with Vumo
 * Returns the processed image as a Buffer
 */
export async function processImage(
  imageBuffer: Buffer,
  config: VumoConfigKey | string,
  options?: {
    customerId?: string;
    returnUrl?: boolean;
  }
): Promise<Buffer> {
  const token = await getAccessToken();
  const configName = VUMO_CONFIGS[config as VumoConfigKey] || config;
  
  const url = new URL(`/v2/process/${configName}/image`, VUMO_API_URL);
  if (options?.customerId) {
    url.searchParams.set('customerId', options.customerId);
  }
  
  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'image/jpeg',
    },
    body: new Uint8Array(imageBuffer),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(`Vumo processing failed: ${error.message || error.errorCode || response.statusText}`);
  }
  
  const resultBuffer = Buffer.from(await response.arrayBuffer());
  return resultBuffer;
}

/**
 * Process an image from URL
 * Returns JSON with result URLs
 */
export async function processImageFromUrl(
  imageUrl: string,
  config: VumoConfigKey | string,
  options?: {
    customerId?: string;
  }
): Promise<{ urlPhoto: string; urlMask?: string }> {
  const token = await getAccessToken();
  const configName = VUMO_CONFIGS[config as VumoConfigKey] || config;
  
  const response = await fetch(`${VUMO_API_URL}/v2/process/urls/${configName}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([{
      url: imageUrl,
      customerId: options?.customerId || 'dealer-os',
    }]),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(`Vumo processing failed: ${error.message || error.errorCode}`);
  }
  
  const result = await response.json();
  
  if (!result.photos?.[0]) {
    throw new Error('No result returned from Vumo');
  }
  
  return {
    urlPhoto: result.photos[0].urlPhoto,
    urlMask: result.photos[0].urlMask,
  };
}

/**
 * Analyze an image (classification, quality check)
 */
export async function analyzeImage(imageBuffer: Buffer): Promise<{
  class: string;
  type: { name: string; score: number };
  quality: { brightness: number; darkness: number; blurred: number };
  bodyType?: { name: string; score: number };
  bodyColor?: { name: string; score: number };
}> {
  const token = await getAccessToken();
  
  const response = await fetch(`${VUMO_API_URL}/v2/analysis`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'image/jpeg',
    },
    body: new Uint8Array(imageBuffer),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(`Vumo analysis failed: ${error.message || error.errorCode}`);
  }
  
  const result = await response.json();
  return result.photos?.[0]?.analysis || {};
}

/**
 * Get available configurations for this account
 */
export async function getConfigurations(): Promise<Array<{
  name: string;
  cost: number;
  uiConfiguration?: {
    thumbnail?: string;
    nameDescriptions?: Record<string, { name: string; description: string }>;
  };
}>> {
  const token = await getAccessToken();
  
  const response = await fetch(`${VUMO_API_URL}/v1/configuration/`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch Vumo configurations');
  }
  
  return response.json();
}

/**
 * Map UI background template to Vumo config
 */
export function mapTemplateToConfig(template: string): VumoConfigKey {
  const mapping: Record<string, VumoConfigKey> = {
    'modern_showroom': 'modern',
    'classic_showroom': 'classic',
    'outdoor': 'outdoor',
    'white': 'white',
    'minimalist': 'white',
    'transparent': 'white', // Will need post-processing for transparency
  };
  
  return mapping[template] || 'modern';
}
// Env vars update trigger 20260223-145259
