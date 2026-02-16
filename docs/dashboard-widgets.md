# Dashboard Widgets - Konfigurierbare Dashboard-Ansicht

## Übersicht

Das Dashboard kann nun von jedem Benutzer individuell angepasst werden. Widgets können ein-/ausgeblendet und per Drag & Drop neu angeordnet werden.

## Features

### 1. Widget-Verwaltung
- **Ein-/Ausblenden**: Jedes Widget kann individuell aktiviert/deaktiviert werden
- **Drag & Drop**: Widgets können per Drag & Drop neu angeordnet werden
- **Persistenz**: Konfiguration wird pro User in Supabase gespeichert
- **Reset**: Zurücksetzen auf Standard-Konfiguration möglich

### 2. Verfügbare Widgets

| Widget | ID | Beschreibung |
|--------|-----|-------------|
| KPI-Übersicht | `kpi-cards` | Fahrzeuge, Leads, Umsatz, Account-Status |
| Neue Anfragen | `recent-leads` | Liste der 5 neuesten Leads |
| Langsteher-Warnung | `long-standing` | Fahrzeuge mit >30 Tagen Standzeit |
| Schnellaktionen | `quick-actions` | Onboarding-Hilfe für neue User |

## Technische Implementation

### Komponenten-Struktur

```
src/components/dashboard/
├── types.ts                      # TypeScript-Definitionen
├── widget-grid.tsx               # Haupt-Komponente mit DnD-Logik
├── sortable-widget.tsx           # Wrapper für draggable Widgets
└── widgets/
    ├── kpi-cards.tsx
    ├── recent-leads.tsx
    ├── long-standing.tsx
    └── quick-actions.tsx
```

### Verwendete Libraries

- **@dnd-kit/core** & **@dnd-kit/sortable**: Drag & Drop Funktionalität
- **@dnd-kit/utilities**: Helper für Transformationen
- **shadcn/ui**: Switch, Label, Button Komponenten

### Datenbank-Schema

```sql
ALTER TABLE dealers 
ADD COLUMN dashboard_config JSONB DEFAULT '{"widgets": [...]}'::jsonb;
```

Struktur der `dashboard_config`:
```typescript
{
  widgets: [
    { id: 'kpi-cards', enabled: true, order: 0 },
    { id: 'recent-leads', enabled: true, order: 1 },
    // ...
  ]
}
```

### Server Actions

`src/app/[locale]/dashboard/actions.ts`:
```typescript
export async function saveDashboardConfig(config: WidgetConfig[])
```

- Speichert Widget-Konfiguration für aktuellen User
- Validiert Authentication
- Revalidiert Dashboard-Page

## Verwendung

### Als Enduser

1. Öffne Dashboard
2. Klicke "Dashboard anpassen"
3. Im Edit-Mode:
   - Toggle Widgets mit Switches
   - Widgets mit Drag-Handle (⋮⋮) verschieben
4. "Speichern" oder "Abbrechen"
5. "Zurücksetzen" für Standard-Ansicht

### Als Entwickler - Neues Widget hinzufügen

1. **Widget-Komponente erstellen:**
```tsx
// src/components/dashboard/widgets/my-widget.tsx
export function MyWidget({ data }: MyWidgetProps) {
  return <Card>...</Card>;
}
```

2. **Type erweitern:**
```typescript
// src/components/dashboard/types.ts
export type WidgetType = 
  | 'kpi-cards'
  | 'my-widget'; // neu

const WIDGET_LABELS: Record<WidgetType, string> = {
  'my-widget': 'Mein Widget',
};
```

3. **In WidgetGrid registrieren:**
```tsx
// src/components/dashboard/widget-grid.tsx
const renderWidget = (widgetId: WidgetType) => {
  switch (widgetId) {
    case 'my-widget':
      return <MyWidget data={myData} />;
    // ...
  }
};
```

4. **Default-Config updaten:**
```typescript
export const DEFAULT_WIDGETS: WidgetConfig[] = [
  // ...
  { id: 'my-widget', enabled: true, order: 4 },
];
```

## Tests

E2E-Tests in `e2e/dashboard-widgets.spec.ts`:

- ✅ Customize Button sichtbar
- ✅ Edit-Mode aktivieren
- ✅ Widgets ein-/ausblenden
- ✅ Änderungen verwerfen (Cancel)
- ✅ Reset auf Default
- ✅ Konfiguration persistiert über Sessions
- ⏭️ Drag & Drop (TODO: complex test)

Test ausführen:
```bash
npx playwright test dashboard-widgets
```

## Migration bestehender User

Bestehende Dealer ohne `dashboard_config` erhalten automatisch die Default-Konfiguration durch den `DEFAULT` constraint in der Migration.

Für manuelle Migration:
```sql
UPDATE dealers 
SET dashboard_config = '{"widgets": [...]}'::jsonb
WHERE dashboard_config IS NULL;
```

## Performance-Überlegungen

- Widget-Komponenten sind unabhängig und können lazy-loaded werden
- Server-seitige Daten werden einmalig in Dashboard-Page geladen
- Client-Komponente nur für Edit-Mode und DnD-Interaktion
- Keine zusätzlichen API-Calls beim Neuordnen (nur beim Speichern)

## Zukünftige Erweiterungen

- [ ] Widget-Größen anpassen (Grid-Layout)
- [ ] Weitere Widgets (z.B. Umsatz-Chart, Aktivitäts-Feed)
- [ ] Export/Import von Konfigurationen
- [ ] Admin-Templates (vorgegebene Layouts)
- [ ] Widget-spezifische Einstellungen (z.B. Anzahl Leads)
