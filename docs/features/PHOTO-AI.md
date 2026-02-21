# 🤖 Photo AI / Image Optimizer

KI-gestützte Bildbearbeitung für professionelle Fahrzeugfotos.

## Features

### ✨ Auto-Optimierung
Automatische Verbesserung von:
- Helligkeit & Kontrast
- Schärfe
- Farbbalance

Verwendet **Real-ESRGAN** für Upscaling und Qualitätsverbesserung.

### 🎨 Hintergrund entfernen
Professionelle Freistellung mit **rembg** (RemoveBackground):
- Präzise Fahrzeug-Erkennung
- Transparenter Hintergrund
- Perfekt für Compositing

### 🏢 Virtueller Showroom
Ersetze unschöne Hintergründe durch professionelle Settings:

| Template | Beschreibung |
|----------|--------------|
| Modern Showroom | Moderner Ausstellungsraum |
| Classic Showroom | Klassischer Showroom-Look |
| Outdoor Setting | Natürliche Outdoor-Umgebung |
| Minimal White | Sauberer weisser Hintergrund |
| Transparent | Nur Freistellung, kein Hintergrund |

### 🔒 Kennzeichen verpixeln (geplant)
Automatische Erkennung und Blur von Nummernschildern für Datenschutz.

## Tech Stack

### Replicate API
Wir verwenden [Replicate](https://replicate.com) für serverless ML:

```typescript
// src/lib/replicate.ts
const MODELS = {
  rembg: "cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003",
  realEsrgan: "nightmareai/real-esrgan:f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa",
};
```

**Vorteile:**
- Keine GPU-Server nötig
- Pay-per-use Abrechnung
- Stabile, gehostete Modelle
- Einfache Integration

### API Endpoint

```
POST /api/images/optimize
```

**Request Body:**
```json
{
  "imageUrl": "https://...",
  "operations": ["enhance", "blur_plates", "remove_background"],
  "backgroundTemplate": "showroom-modern",
  "saveToStorage": true
}
```

**Operations:**
- `enhance` — Bildverbesserung mit Real-ESRGAN
- `blur_plates` — Kennzeichen verpixeln (geplant)
- `remove_background` — Hintergrund entfernen

**Response:**
```json
{
  "success": true,
  "images": {
    "enhanced": "https://...",
    "background_removed": "https://...",
    "plates_blurred": "https://..."
  },
  "final": "https://..."
}
```

## UI Component

```tsx
import { ImageOptimizer } from "@/components/vehicles/image-optimizer";

<ImageOptimizer
  open={isOpen}
  onClose={() => setIsOpen(false)}
  imageUrl={currentImage.url}
  onOptimized={(newUrl) => handleImageUpdate(newUrl)}
/>
```

## Setup

### 1. Replicate API Token

1. Erstelle Account auf [replicate.com](https://replicate.com)
2. Generiere API Token unter Settings
3. Füge zu `.env.local` hinzu:

```env
REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxx
```

### 2. Hintergrund-Templates (optional)

Templates werden in Supabase Storage gespeichert:

```
vehicle-images/
  backgrounds/
    showroom-modern.jpg
    showroom-classic.jpg
    showroom-outdoor.jpg
    showroom-minimal.jpg
```

## Kosten (Replicate)

| Modell | Kosten pro Run |
|--------|----------------|
| rembg | ~$0.0023 |
| Real-ESRGAN | ~$0.0046 |

Bei 100 Bildern/Tag: ~$20/Monat

## Architektur

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│  API Route   │────▶│  Replicate   │
│  ImageOptim  │     │ /api/images  │     │   (rembg)    │
└──────────────┘     └──────────────┘     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │   Supabase   │
                     │   Storage    │
                     └──────────────┘
```

## Testing

E2E Tests in `e2e/photo-ai.spec.ts`:

```bash
npm run test:e2e -- photo-ai
```

## Roadmap

- [x] Hintergrund entfernen (rembg)
- [x] Bildverbesserung (Real-ESRGAN)
- [x] Virtuelle Showroom-Hintergründe
- [ ] Kennzeichen-Erkennung & Blur
- [ ] Batch-Verarbeitung für mehrere Bilder
- [ ] AI-gestützte Bildauswahl (beste Fotos vorschlagen)

---

*Dokumentation erstellt: 2026-02-21*
