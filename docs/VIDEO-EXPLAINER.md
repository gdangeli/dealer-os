# Dealer OS Explainer Video

## Übersicht

Das Explainer Video für Dealer OS wurde mit **Remotion** erstellt - einer React-basierten Video-Erstellungs-Library. Das Video ist 90 Sekunden lang und erklärt die Kernfunktionen von Dealer OS.

## Video-Struktur

```
src/video/
├── index.tsx              # Remotion Root & Compositions
├── DealerOSExplainer.tsx  # Hauptvideo mit allen Szenen
├── remotion.config.ts     # Remotion Konfiguration
├── scenes/
│   ├── ProblemScene.tsx   # 0-15s: Das Problem zeigen
│   ├── SolutionScene.tsx  # 15-30s: Dealer OS als Lösung
│   ├── FeaturesScene.tsx  # 30-60s: Features & Dashboard
│   ├── SocialProofScene.tsx # 60-75s: Social Proof
│   └── CTAScene.tsx       # 75-90s: Call to Action
└── components/
    └── transitions.tsx    # Wiederverwendbare Animationen
```

## Video bearbeiten

### Voraussetzungen
```bash
npm install
```

### Studio starten (Live-Preview)
```bash
npm run video:studio
```
Öffnet Remotion Studio unter http://localhost:3000 wo du das Video live bearbeiten kannst.

### Video rendern
```bash
# Full HD Version (1920x1080)
npm run video:render

# Social Media Square (1080x1080)
npm run video:render:short
```

Das gerenderte Video wird in `public/videos/explainer.mp4` gespeichert.

## Szenen-Timing

| Szene | Zeit | Frames | Beschreibung |
|-------|------|--------|--------------|
| Problem | 0-15s | 0-450 | Excel-Chaos, verpasste Anfragen, Langsteher |
| Solution | 15-30s | 450-900 | Dealer OS Logo, Benefits |
| Features | 30-60s | 900-1800 | Dashboard, Feature Cards |
| Social Proof | 60-75s | 1800-2250 | "50+ Garagen", Testimonial |
| CTA | 75-90s | 2250-2700 | "14 Tage gratis", URL |

## Farben (Brand)

```typescript
const COLORS = {
  skyLight: '#E0F2FE',
  sky: '#0EA5E9',
  skyDark: '#0284C7',
  slate: '#1E293B',
  slateMuted: '#64748B',
  white: '#FFFFFF',
  red: '#DC2626',
  emerald: '#10B981',
  amber: '#F59E0B',
};
```

## Anpassungen machen

### Text ändern
Öffne die entsprechende Scene-Datei und ändere den Text direkt.

### Timing anpassen
In `DealerOSExplainer.tsx` kannst du die `VIDEO_CONFIG.scenes` anpassen:

```typescript
scenes: {
  problem: { start: 0, duration: 15 * 30 },      // 15s = 450 frames
  solution: { start: 15 * 30, duration: 15 * 30 },
  // ...
}
```

### Neue Animation hinzufügen
Nutze die Transitions aus `components/transitions.tsx`:

```tsx
import { FadeIn, ScaleIn, SlideIn } from '../components/transitions';

<FadeIn delay={0.5}>
  <h1>Titel</h1>
</FadeIn>
```

### Animierte Zahlen
```tsx
import { AnimatedCounter } from '../components/transitions';

<AnimatedCounter from={0} to={50} delay={1} suffix="+" />
```

## Deployment

### Option 1: Self-Hosted (empfohlen)
1. `npm run video:render`
2. Video wird in `public/videos/explainer.mp4` gespeichert
3. Next.js liefert das Video automatisch aus

### Option 2: YouTube Embed
1. Video auf YouTube hochladen
2. In `demo-video-modal.tsx` die YouTube ID setzen:
```typescript
const VIDEO_CONFIG = {
  youtube: "DEINE_VIDEO_ID",
  // ...
};
```

### Option 3: Externes CDN
1. Video auf CDN hochladen (z.B. Cloudflare Stream, Bunny.net)
2. URL in `VIDEO_CONFIG.external` setzen

## Tipps

- **Performance**: Das Video ist ~10-20MB. Für schnelleres Laden, erwäge WebM als zusätzliches Format.
- **Mobile**: Das Modal ist responsive, aber teste auf echten Geräten.
- **Accessibility**: Das Modal hat einen sr-only DialogTitle für Screen Reader.

## Troubleshooting

### "Cannot find module 'remotion'"
```bash
npm install
```

### Video rendert nicht
Stelle sicher, dass ffmpeg installiert ist:
```bash
# macOS
brew install ffmpeg

# Ubuntu
sudo apt install ffmpeg
```

### Schriftarten fehlen
Remotion nutzt System-Fonts. Für konsistente Darstellung auf allen Systemen, erwäge @remotion/google-fonts.

## Weiterentwicklung

- [ ] Voice-Over hinzufügen
- [ ] Musik/Soundeffekte
- [ ] Mehrsprachige Versionen (DE/FR/IT)
- [ ] Kürzere Social Media Versionen
