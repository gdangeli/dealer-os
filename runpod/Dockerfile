# DealerOS Photo AI - RunPod Serverless Handler
FROM nvidia/cuda:11.8-cudnn8-runtime-ubuntu22.04

ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    libgl1-mesa-glx \
    libglib2.0-0 \
    wget \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install Python packages
RUN pip3 install --no-cache-dir \
    runpod \
    torch \
    torchvision \
    transformers \
    pillow \
    numpy \
    opencv-python-headless \
    huggingface_hub \
    ultralytics

# Create app directory
WORKDIR /app

# Download models at build time for faster cold starts
RUN python3 -c "from huggingface_hub import hf_hub_download; hf_hub_download('briaai/RMBG-1.4', 'model.pth')"
RUN python3 -c "from ultralytics import YOLO; YOLO('yolov8n.pt')"

# Copy handler
COPY handler.py /app/handler.py

# Start the handler
CMD ["python3", "-u", "/app/handler.py"]
