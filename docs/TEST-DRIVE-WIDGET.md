# Probefahrt-Widget (Test Drive Booking)

Das Probefahrt-Widget ermöglicht es Autohändlern, ein Buchungsformular für Probefahrten auf ihrer eigenen Website einzubetten.

## Features

- **Mehrsprachig** — Unterstützt DE, EN, FR, IT
- **Responsive** — Funktioniert auf Desktop und Mobile
- **Anpassbar** — Farben, Dark Mode, Fahrzeug-Vorauswahl
- **E-Mail Benachrichtigungen** — Automatische Bestätigung an Kunden und Händler
- **CORS-enabled** — Funktioniert auf jeder Domain

## Embed URL

```
https://www.dealeros.ch/embed/[DEALER_ID]/test-drive
```

Ersetze `[DEALER_ID]` mit der UUID des Händlers aus DealerOS.

## Query Parameter

| Parameter | Typ | Default | Beschreibung |
|-----------|-----|---------|--------------|
| `color` | Hex-Farbe | `#2563eb` | Primärfarbe des Widgets (z.B. `#ff6600`) |
| `dark` | boolean | `false` | Dark Mode aktivieren (`true`/`false`) |
| `vehicle` | UUID | - | Fahrzeug vorauswählen (Vehicle-ID) |
| `locale` | string | `de` | Sprache (`de`, `en`, `fr`, `it`) |

## Beispiele

### Standard-Embed (iFrame)

```html
<iframe 
  src="https://www.dealeros.ch/embed/abc123-dealer-id/test-drive"
  width="100%" 
  height="600"
  frameborder="0"
  style="border: none; border-radius: 12px;">
</iframe>
```

### Mit Custom Farbe

```html
<iframe 
  src="https://www.dealeros.ch/embed/abc123-dealer-id/test-drive?color=%23ff6600"
  width="100%" 
  height="600"
  frameborder="0">
</iframe>
```

> **Hinweis:** `#` muss als `%23` URL-encoded werden.

### Dark Mode

```html
<iframe 
  src="https://www.dealeros.ch/embed/abc123-dealer-id/test-drive?dark=true"
  width="100%" 
  height="600"
  frameborder="0">
</iframe>
```

### Fahrzeug vorausgewählt (z.B. von Fahrzeug-Detailseite)

```html
<iframe 
  src="https://www.dealeros.ch/embed/abc123-dealer-id/test-drive?vehicle=xyz789-vehicle-id"
  width="100%" 
  height="600"
  frameborder="0">
</iframe>
```

### Französische Version

```html
<iframe 
  src="https://www.dealeros.ch/embed/abc123-dealer-id/test-drive?locale=fr"
  width="100%" 
  height="600"
  frameborder="0">
</iframe>
```

### Alle Parameter kombiniert

```html
<iframe 
  src="https://www.dealeros.ch/embed/abc123-dealer-id/test-drive?color=%232563eb&dark=true&locale=en&vehicle=xyz789"
  width="100%" 
  height="600"
  frameborder="0"
  style="border: none;">
</iframe>
```

## Parent Window Events

Nach erfolgreicher Buchung sendet das Widget eine Message an das Parent Window:

```javascript
// Im Parent Window lauschen:
window.addEventListener('message', (event) => {
  if (event.origin !== 'https://www.dealeros.ch') return;
  
  if (event.data.type === 'TESTDRIVE_BOOKED') {
    console.log('Probefahrt gebucht:', event.data.booking);
    // z.B. Analytics tracken, Success-Message anzeigen, etc.
  }
});
```

**Event-Daten:**
```javascript
{
  type: 'TESTDRIVE_BOOKED',
  booking: {
    vehicleId: 'xyz789-vehicle-id',
    date: '2026-03-15',
    time: '14:00',
    customerName: 'Max Mustermann',
    customerEmail: 'max@example.com'
  }
}
```

## E-Mail Benachrichtigungen

Bei jeder Buchung werden automatisch zwei E-Mails versendet:

### 1. Händler-Benachrichtigung
- Betreff: "Neue Probefahrt-Anfrage: [Fahrzeug]"
- Enthält: Kundendaten, Fahrzeugdetails, gewünschtes Datum/Uhrzeit
- Geht an: E-Mail des Dealer-Accounts

### 2. Kunden-Bestätigung
- Betreff: "Ihre Probefahrt-Anfrage bei [Händler]"
- Enthält: Bestätigung der Anfrage, Fahrzeugdetails, Händler-Kontakt
- Mehrsprachig basierend auf Widget-Locale

## Responsive Sizing

Empfohlene iFrame-Höhen:

| Kontext | Höhe |
|---------|------|
| Desktop | `600px` |
| Mobile | `700px` (mehr Platz für Form-Elements) |
| Mit vielen Fahrzeugen | `700-800px` |

Für automatische Höhenanpassung:

```html
<iframe 
  id="testdrive-widget"
  src="https://www.dealeros.ch/embed/abc123/test-drive"
  width="100%" 
  height="600"
  frameborder="0"
  onload="this.style.height = this.contentWindow.document.body.scrollHeight + 'px';">
</iframe>
```

## Troubleshooting

### Widget zeigt "Händler nicht gefunden"
- Prüfe ob die Dealer-ID korrekt ist
- Der Dealer muss mindestens ein aktives Fahrzeug haben

### Farbe wird nicht angewendet
- Stelle sicher, dass `#` als `%23` encodiert ist
- Nur gültige Hex-Farben werden akzeptiert (z.B. `%23ff6600`)

### E-Mails kommen nicht an
- Prüfe Spam-Ordner
- Stelle sicher, dass RESEND_API_KEY konfiguriert ist
- Dealer muss eine gültige E-Mail-Adresse haben

## API Endpoint

Das Widget nutzt den öffentlichen API-Endpunkt:

```
POST /api/public/test-drives
```

**Request Body:**
```json
{
  "dealer_id": "uuid",
  "vehicle_id": "uuid",
  "customer_name": "Max Mustermann",
  "customer_email": "max@example.com",
  "customer_phone": "+41 79 123 45 67",
  "preferred_date": "2026-03-15",
  "preferred_time": "14:00",
  "message": "Optional message"
}
```

**Response:**
```json
{
  "success": true,
  "id": "booking-uuid",
  "message": "Test drive request created successfully"
}
```

---

## Siehe auch

- [Website Widget](./dashboard-widgets.md) — Fahrzeug-Listing Widget
- [Vehicle Import](./VEHICLE_IMPORT.md) — Fahrzeuge importieren
