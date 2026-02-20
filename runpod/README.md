# DealerOS Photo AI - RunPod Serverless

AI-powered image processing for vehicle photos.

## Features

- **Background Removal** - RMBG-1.4 model
- **License Plate Detection & Blur** - YOLOv8
- **Image Enhancement** - Auto-contrast, sharpness, color

## Deployment

### Option A: GitHub Actions (Recommended)

1. Push changes to `runpod/` folder
2. GitHub Action builds and pushes to GHCR
3. In RunPod Console:
   - Create new Serverless Endpoint
   - Container Image: `ghcr.io/gdangeli/dealer-os/photo-ai:latest`
   - GPU: RTX 3080 or similar
   - Min Workers: 0
   - Max Workers: 3

### Option B: Manual Build

```bash
cd runpod
docker build -t dealer-os-photo-ai .
docker tag dealer-os-photo-ai:latest ghcr.io/gdangeli/dealer-os/photo-ai:latest
docker push ghcr.io/gdangeli/dealer-os/photo-ai:latest
```

## Environment Variables

Add to `.env.local`:

```
RUNPOD_API_KEY=your_api_key
RUNPOD_ENDPOINT_ID=your_endpoint_id
```

## API Usage

```typescript
const result = await runPhotoAI({
  image: base64Image,
  operations: ['enhance', 'blur_plates', 'remove_background'],
  background_image: base64Background, // optional
});
```

## Cost Estimate

- ~$0.01-0.02 per image (depending on GPU type)
- Cold start: ~30-60 seconds
- Processing: ~2-5 seconds per image
