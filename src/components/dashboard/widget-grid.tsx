'use client';

import { useState, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableWidget } from './sortable-widget';
import { Button } from '@/components/ui/button';
import { Settings, RotateCcw, Save, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { WidgetConfig, WidgetType, DEFAULT_WIDGETS } from './types';
import { KPICards } from './widgets/kpi-cards';
import { RecentLeads } from './widgets/recent-leads';
import { LongStanding } from './widgets/long-standing';
import { QuickActions } from './widgets/quick-actions';

interface WidgetGridProps {
  initialConfig?: WidgetConfig[];
  stats: {
    totalVehicles: number;
    inStockVehicles: number;
    newLeads: number;
  };
  dealer: any;
  recentLeads: any[];
  longStanding: any[];
  onSaveConfig: (config: WidgetConfig[]) => Promise<void>;
}

const WIDGET_LABELS: Record<WidgetType, string> = {
  'kpi-cards': 'KPI-Übersicht',
  'recent-leads': 'Neue Anfragen',
  'long-standing': 'Langsteher-Warnung',
  'quick-actions': 'Schnellaktionen',
};

export function WidgetGrid({
  initialConfig = DEFAULT_WIDGETS,
  stats,
  dealer,
  recentLeads,
  longStanding,
  onSaveConfig,
}: WidgetGridProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [widgets, setWidgets] = useState<WidgetConfig[]>(initialConfig);
  const [isSaving, setIsSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const enabledWidgets = useMemo(
    () => widgets.filter(w => w.enabled).sort((a, b) => a.order - b.order),
    [widgets]
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setWidgets((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        const newItems = arrayMove(items, oldIndex, newIndex);
        return newItems.map((item, index) => ({ ...item, order: index }));
      });
    }
  };

  const toggleWidget = (id: WidgetType) => {
    setWidgets((items) =>
      items.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      )
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveConfig(widgets);
      setIsEditMode(false);
    } catch (error) {
      console.error('Failed to save config:', error);
      alert('Fehler beim Speichern der Konfiguration');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setWidgets(DEFAULT_WIDGETS);
  };

  const handleCancel = () => {
    setWidgets(initialConfig);
    setIsEditMode(false);
  };

  const renderWidget = (widgetId: WidgetType) => {
    switch (widgetId) {
      case 'kpi-cards':
        return <KPICards stats={stats} dealer={dealer} />;
      case 'recent-leads':
        return <RecentLeads leads={recentLeads} />;
      case 'long-standing':
        return <LongStanding vehicles={longStanding} />;
      case 'quick-actions':
        return <QuickActions totalVehicles={stats.totalVehicles} />;
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Control Bar */}
      <div className="flex justify-end mb-6 gap-2">
        {!isEditMode ? (
          <Button variant="outline" onClick={() => setIsEditMode(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Dashboard anpassen
          </Button>
        ) : (
          <>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Zurücksetzen
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              <X className="w-4 h-4 mr-2" />
              Abbrechen
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Speichern...' : 'Speichern'}
            </Button>
          </>
        )}
      </div>

      {/* Widget Toggle Panel */}
      {isEditMode && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold mb-3">Widgets anzeigen/ausblenden</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {widgets.map((widget) => (
              <div key={widget.id} className="flex items-center space-x-2">
                <Switch
                  id={widget.id}
                  checked={widget.enabled}
                  onCheckedChange={() => toggleWidget(widget.id)}
                />
                <Label htmlFor={widget.id} className="cursor-pointer">
                  {WIDGET_LABELS[widget.id]}
                </Label>
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-600 mt-3">
            💡 Ziehen Sie die Widgets unten, um die Reihenfolge zu ändern
          </p>
        </div>
      )}

      {/* Widgets */}
      {isEditMode ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={enabledWidgets.map(w => w.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-6">
              {enabledWidgets.map((widget) => (
                <SortableWidget key={widget.id} id={widget.id}>
                  {renderWidget(widget.id)}
                </SortableWidget>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="space-y-6">
          {enabledWidgets.map((widget) => (
            <div key={widget.id}>
              {renderWidget(widget.id)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
