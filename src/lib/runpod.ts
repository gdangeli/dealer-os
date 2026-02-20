/**
 * RunPod Serverless API Client
 * For AI image processing (background removal, plate blur, enhancement)
 */

const RUNPOD_API_KEY = process.env.RUNPOD_API_KEY;
const RUNPOD_ENDPOINT_ID = process.env.RUNPOD_ENDPOINT_ID;

interface RunPodInput {
  image: string; // base64
  operations: ('remove_background' | 'blur_plates' | 'enhance')[];
  background_color?: [number, number, number];
  background_image?: string; // base64
  blur_strength?: number;
}

interface RunPodOutput {
  success: boolean;
  images?: {
    background_removed?: string;
    plates_blurred?: string;
    enhanced?: string;
  };
  final?: string;
  error?: string;
}

export async function runPhotoAI(input: RunPodInput): Promise<RunPodOutput> {
  if (!RUNPOD_API_KEY || !RUNPOD_ENDPOINT_ID) {
    throw new Error('RunPod credentials not configured');
  }

  const response = await fetch(`https://api.runpod.ai/v2/${RUNPOD_ENDPOINT_ID}/runsync`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RUNPOD_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input }),
  });

  if (!response.ok) {
    throw new Error(`RunPod API error: ${response.status}`);
  }

  const result = await response.json();
  
  if (result.status === 'COMPLETED') {
    return result.output;
  } else if (result.status === 'FAILED') {
    throw new Error(result.error || 'RunPod job failed');
  } else {
    // Job is still running, poll for result
    return await pollRunPodJob(result.id);
  }
}

async function pollRunPodJob(jobId: string, maxAttempts = 60): Promise<RunPodOutput> {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    
    const response = await fetch(`https://api.runpod.ai/v2/${RUNPOD_ENDPOINT_ID}/status/${jobId}`, {
      headers: {
        'Authorization': `Bearer ${RUNPOD_API_KEY}`,
      },
    });

    const result = await response.json();
    
    if (result.status === 'COMPLETED') {
      return result.output;
    } else if (result.status === 'FAILED') {
      throw new Error(result.error || 'RunPod job failed');
    }
  }
  
  throw new Error('RunPod job timed out');
}

// Async version for batch processing
export async function runPhotoAIAsync(input: RunPodInput): Promise<string> {
  if (!RUNPOD_API_KEY || !RUNPOD_ENDPOINT_ID) {
    throw new Error('RunPod credentials not configured');
  }

  const response = await fetch(`https://api.runpod.ai/v2/${RUNPOD_ENDPOINT_ID}/run`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RUNPOD_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input }),
  });

  if (!response.ok) {
    throw new Error(`RunPod API error: ${response.status}`);
  }

  const result = await response.json();
  return result.id; // Return job ID for later polling
}

export async function getJobStatus(jobId: string): Promise<{ status: string; output?: RunPodOutput }> {
  if (!RUNPOD_API_KEY || !RUNPOD_ENDPOINT_ID) {
    throw new Error('RunPod credentials not configured');
  }

  const response = await fetch(`https://api.runpod.ai/v2/${RUNPOD_ENDPOINT_ID}/status/${jobId}`, {
    headers: {
      'Authorization': `Bearer ${RUNPOD_API_KEY}`,
    },
  });

  return await response.json();
}
