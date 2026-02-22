/**
 * Generate showroom background images using Sharp
 * Run: node scripts/generate-backgrounds.mjs
 */

import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.join(__dirname, '../public/backgrounds');

const WIDTH = 1920;
const HEIGHT = 1280;

// Background configurations
const backgrounds = {
  'showroom-modern': {
    // Clean white/light gray gradient - modern car dealership look
    gradient: {
      stops: [
        { pos: 0, color: '#f8f9fa' },
        { pos: 0.6, color: '#e9ecef' },
        { pos: 1, color: '#dee2e6' }
      ]
    },
    floor: '#d1d5db',
    floorHeight: 0.35
  },
  'showroom-classic': {
    // Warm beige/cream tones - classic dealership
    gradient: {
      stops: [
        { pos: 0, color: '#faf5f0' },
        { pos: 0.5, color: '#f5ebe0' },
        { pos: 1, color: '#e8dcc8' }
      ]
    },
    floor: '#c9b99a',
    floorHeight: 0.35
  },
  'showroom-outdoor': {
    // Light blue sky gradient with concrete floor
    gradient: {
      stops: [
        { pos: 0, color: '#87ceeb' },
        { pos: 0.4, color: '#b0e0e6' },
        { pos: 0.7, color: '#e0f0f5' }
      ]
    },
    floor: '#9ca3af',
    floorHeight: 0.4
  },
  'showroom-minimal': {
    // Pure white minimal background
    gradient: {
      stops: [
        { pos: 0, color: '#ffffff' },
        { pos: 1, color: '#f3f4f6' }
      ]
    },
    floor: '#e5e7eb',
    floorHeight: 0.3
  }
};

async function createGradientSVG(config) {
  const { gradient, floor, floorHeight } = config;
  const floorY = HEIGHT * (1 - floorHeight);
  
  // Create gradient stops
  const stops = gradient.stops
    .map(s => `<stop offset="${s.pos * 100}%" stop-color="${s.color}"/>`)
    .join('\n      ');
  
  return `
    <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
          ${stops}
        </linearGradient>
        <linearGradient id="floor" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="${floor}" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="${floor}" stop-opacity="1"/>
        </linearGradient>
      </defs>
      <!-- Background gradient -->
      <rect width="100%" height="100%" fill="url(#bg)"/>
      <!-- Floor with subtle gradient -->
      <rect y="${floorY}" width="100%" height="${HEIGHT - floorY}" fill="url(#floor)"/>
      <!-- Subtle floor line -->
      <line x1="0" y1="${floorY}" x2="${WIDTH}" y2="${floorY}" 
            stroke="${floor}" stroke-width="2" opacity="0.3"/>
    </svg>
  `;
}

async function generateBackgrounds() {
  console.log('Generating showroom backgrounds...\n');
  
  for (const [name, config] of Object.entries(backgrounds)) {
    const svg = await createGradientSVG(config);
    const outputPath = path.join(outputDir, `${name}.jpg`);
    
    await sharp(Buffer.from(svg))
      .jpeg({ quality: 90 })
      .toFile(outputPath);
    
    console.log(`✓ Created ${name}.jpg`);
  }
  
  console.log('\nDone! Backgrounds saved to public/backgrounds/');
}

generateBackgrounds().catch(console.error);
