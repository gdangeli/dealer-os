export type WidgetType = 
  | 'kpi-cards'
  | 'recent-leads'
  | 'long-standing'
  | 'quick-actions';

export interface WidgetConfig {
  id: WidgetType;
  enabled: boolean;
  order: number;
}

export interface DashboardConfig {
  widgets: WidgetConfig[];
}

export const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: 'kpi-cards', enabled: true, order: 0 },
  { id: 'recent-leads', enabled: true, order: 1 },
  { id: 'long-standing', enabled: true, order: 2 },
  { id: 'quick-actions', enabled: true, order: 3 },
];
