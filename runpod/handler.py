"""
DealerOS Photo AI - RunPod Serverless Handler
Features:
1. Background Removal (RMBG-1.4)
2. License Plate Detection & Blur (YOLOv8)
3. Image Enhancement (basic + Real-ESRGAN later)
"""

import runpod
import torch
import base64
import io
import cv2
import numpy as np
from PIL import Image
from huggingface_hub import hf_hub_download
from ultralytics import YOLO

# Global model instances (loaded once)
rmbg_model = None
yolo_model = None

def load_models():
    """Load AI models into memory"""
    global rmbg_model, yolo_model
    
    # Load RMBG-1.4 for background removal
    if rmbg_model is None:
        print("Loading RMBG-1.4 model...")
        from transformers import pipeline
        rmbg_model = pipeline("image-segmentation", model="briaai/RMBG-1.4", trust_remote_code=True, device=0)
        print("RMBG-1.4 loaded!")
    
    # Load YOLOv8 for object detection (license plates)
    if yolo_model is None:
        print("Loading YOLOv8 model...")
        yolo_model = YOLO('yolov8n.pt')
        print("YOLOv8 loaded!")

def image_from_base64(base64_string: str) -> Image.Image:
    """Convert base64 string to PIL Image"""
    if base64_string.startswith('data:'):
        base64_string = base64_string.split(',')[1]
    image_data = base64.b64decode(base64_string)
    return Image.open(io.BytesIO(image_data)).convert('RGB')

def image_to_base64(image: Image.Image, format: str = 'PNG') -> str:
    """Convert PIL Image to base64 string"""
    buffer = io.BytesIO()
    image.save(buffer, format=format, quality=95)
    return base64.b64encode(buffer.getvalue()).decode('utf-8')

def remove_background(image: Image.Image, background_color: tuple = None, background_image: Image.Image = None) -> Image.Image:
    """Remove background and optionally replace with color or image"""
    global rmbg_model
    
    # Get mask from RMBG model
    result = rmbg_model(image)
    mask = result[0]['mask'] if isinstance(result, list) else result['mask']
    
    # Convert to RGBA
    image_rgba = image.convert('RGBA')
    mask_array = np.array(mask.convert('L'))
    
    if background_image is not None:
        # Composite onto background image
        bg = background_image.resize(image.size).convert('RGBA')
        fg = image_rgba.copy()
        fg.putalpha(Image.fromarray(mask_array))
        bg.paste(fg, (0, 0), fg)
        return bg.convert('RGB')
    elif background_color is not None:
        # Replace with solid color
        bg = Image.new('RGBA', image.size, background_color + (255,))
        fg = image_rgba.copy()
        fg.putalpha(Image.fromarray(mask_array))
        bg.paste(fg, (0, 0), fg)
        return bg.convert('RGB')
    else:
        # Return with transparency
        image_rgba.putalpha(Image.fromarray(mask_array))
        return image_rgba

def detect_and_blur_plates(image: Image.Image, blur_strength: int = 51) -> Image.Image:
    """Detect license plates and blur them"""
    global yolo_model
    
    # Convert to OpenCV format
    img_cv = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
    
    # Run YOLO detection
    results = yolo_model(img_cv, verbose=False)
    
    # Look for objects that might be license plates
    # YOLOv8n detects general objects, we look for small rectangular objects
    # For production, use a specialized plate detection model
    for result in results:
        boxes = result.boxes
        for box in boxes:
            # Get bounding box
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            w, h = x2 - x1, y2 - y1
            
            # License plate heuristics: aspect ratio typically 2:1 to 5:1, small relative to image
            aspect_ratio = w / max(h, 1)
            relative_size = (w * h) / (image.width * image.height)
            
            if 1.5 < aspect_ratio < 6 and 0.001 < relative_size < 0.05:
                # Likely a plate, blur it
                roi = img_cv[y1:y2, x1:x2]
                blurred_roi = cv2.GaussianBlur(roi, (blur_strength, blur_strength), 0)
                img_cv[y1:y2, x1:x2] = blurred_roi
    
    # Convert back to PIL
    return Image.fromarray(cv2.cvtColor(img_cv, cv2.COLOR_BGR2RGB))

def enhance_image(image: Image.Image) -> Image.Image:
    """Basic image enhancement: auto-contrast, brightness, sharpness"""
    from PIL import ImageEnhance, ImageOps
    
    # Auto contrast
    image = ImageOps.autocontrast(image, cutoff=1)
    
    # Slight sharpness boost
    enhancer = ImageEnhance.Sharpness(image)
    image = enhancer.enhance(1.2)
    
    # Slight saturation boost
    enhancer = ImageEnhance.Color(image)
    image = enhancer.enhance(1.1)
    
    return image

def handler(job):
    """Main RunPod handler"""
    load_models()
    
    job_input = job["input"]
    
    # Get input image
    image_base64 = job_input.get("image")
    if not image_base64:
        return {"error": "No image provided"}
    
    image = image_from_base64(image_base64)
    
    # Get operation(s) to perform
    operations = job_input.get("operations", ["enhance"])
    
    result_images = {}
    
    for op in operations:
        if op == "remove_background":
            # Background removal
            bg_color = job_input.get("background_color")  # e.g., [255, 255, 255]
            bg_image_b64 = job_input.get("background_image")
            bg_image = image_from_base64(bg_image_b64) if bg_image_b64 else None
            
            processed = remove_background(
                image, 
                background_color=tuple(bg_color) if bg_color else None,
                background_image=bg_image
            )
            result_images["background_removed"] = image_to_base64(processed)
            image = processed  # Chain operations
            
        elif op == "blur_plates":
            # License plate detection and blur
            blur_strength = job_input.get("blur_strength", 51)
            processed = detect_and_blur_plates(image, blur_strength)
            result_images["plates_blurred"] = image_to_base64(processed)
            image = processed
            
        elif op == "enhance":
            # Image enhancement
            processed = enhance_image(image)
            result_images["enhanced"] = image_to_base64(processed)
            image = processed
    
    # Return final result
    return {
        "success": True,
        "images": result_images,
        "final": image_to_base64(image)
    }

# Start RunPod serverless handler
runpod.serverless.start({"handler": handler})
