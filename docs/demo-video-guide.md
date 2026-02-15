# Demo Video - Dokumentation

## Übersicht

Die Landing Page enthält einen "Live-Demo ansehen" Button, der ein interaktives Demo-Modal öffnet.

## Aktuelle Implementierung

**Typ:** Animierte CSS-basierte Demo (Option B/C Hybrid)

**Dateien:**
- `src/components/landing/demo-video-modal.tsx` - Hauptkomponente
- `src/app/globals.css` - Animationen (fadeIn)
- `src/app/page.tsx` - Integration auf Landing Page

**Features:**
- 4 animierte Screens (Dashboard, Fahrzeug erfassen, Leads, Standzeit-Analyse)
- Auto-Play mit 4 Sekunden pro Screen
- Manuelles Navigieren via Progress-Balken
- CTA nach Durchlauf ("Jetzt kostenlos testen")
- Responsives Phone-Mockup Design

## Video Update-Optionen

### Option 1: Echtes Video einbetten (empfohlen)

Ersetze den `ScreenContent`-Bereich mit einem Video-Player:

```tsx
// In demo-video-modal.tsx

// Video URL konfigurieren
const VIDEO_URL = "https://www.youtube.com/embed/VIDEO_ID";
// Oder: "https://www.loom.com/embed/VIDEO_ID"
// Oder: "/videos/demo.mp4" (für selbst-gehostetes Video)

// Im Modal Content ersetzen:
<div className="p-6 flex justify-center">
  <div className="w-full aspect-video rounded-lg overflow-hidden">
    <iframe
      src={VIDEO_URL}
      className="w-full h-full"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  </div>
</div>
```

### Option 2: Selbst-gehostetes Video

1. Video in `/public/videos/demo.mp4` ablegen
2. Component updaten:

```tsx
<video
  autoPlay
  controls
  className="w-full rounded-lg"
  onEnded={() => setShowCTA(true)}
>
  <source src="/videos/demo.mp4" type="video/mp4" />
</video>
```

### Option 3: Animierte Screens updaten

Die 4 Demo-Screens können individuell angepasst werden:

```tsx
const demoScreens = [
  {
    id: "dashboard",
    title: "Dashboard Übersicht",
    subtitle: "Alle wichtigen Kennzahlen auf einen Blick",
    icon: BarChart3,
    color: "sky",
    content: DashboardScreen, // ← Komponente anpassen
  },
  // ...
];
```

Jeder Screen ist eine React-Komponente die das Layout simuliert.

## Screen Recording erstellen (Empfehlung)

Für ein professionelles Demo-Video empfehlen wir:

### Tools
- **Loom** (schnell & einfach, mit Embed-Option)
- **Screen Studio** (macOS, professionelle Animationen)
- **OBS Studio** (kostenlos, mehr Kontrolle)

### Inhalt (60-90 Sekunden)
1. **0-15s:** Dashboard Übersicht - KPIs zeigen
2. **15-35s:** Neues Fahrzeug erfassen - Formular ausfüllen, Bilder hochladen
3. **35-55s:** Lead-Management - Neue Anfrage bearbeiten
4. **55-75s:** Standzeit-Analyse - Langsteher identifizieren
5. **75-90s:** CTA - "Jetzt kostenlos testen"

### Tipps
- Schweizerdeutsche Untertitel für Text
- Ruhiges, professionelles Tempo
- Echte Demo-Daten (keine Lorem Ipsum)
- Cursor-Highlighting für bessere Sichtbarkeit

## Remotion (zukünftige Option)

Falls programmatisch generierte Videos gewünscht:

```bash
npm install remotion @remotion/cli
npx remotion new
```

Remotion ermöglicht:
- React-Komponenten als Video
- Programmatische Änderungen
- Automatisierte Updates
- Mehrsprachige Versionen

Aufwand: ~1-2 Tage für initiales Setup.

## Deployment

Nach Änderungen:
```bash
npm run build
vercel --prod
```

## Support

Bei Fragen: info@dealeros.ch
