"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Play,
  X,
  Car,
  Clock,
  Users,
  BarChart3,
  Check,
  ArrowRight,
  TrendingUp,
  Plus,
} from "lucide-react";

interface DemoVideoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Feature screens for the animated demo
const demoScreens = [
  {
    id: "dashboard",
    title: "Dashboard Übersicht",
    subtitle: "Alle wichtigen Kennzahlen auf einen Blick",
    icon: BarChart3,
    color: "sky",
    content: DashboardScreen,
  },
  {
    id: "vehicles",
    title: "Fahrzeug erfassen",
    subtitle: "Fahrzeuge in Sekunden anlegen",
    icon: Car,
    color: "emerald",
    content: VehicleScreen,
  },
  {
    id: "leads",
    title: "Leads verwalten",
    subtitle: "Keine Anfrage geht mehr verloren",
    icon: Users,
    color: "violet",
    content: LeadsScreen,
  },
  {
    id: "analytics",
    title: "Standzeit-Analyse",
    subtitle: "Langsteher sofort erkennen",
    icon: Clock,
    color: "amber",
    content: AnalyticsScreen,
  },
];

function DashboardScreen() {
  return (
    <div className="p-4 space-y-3 animate-fadeIn">
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Fahrzeuge" value="32" trend="+4" />
        <StatCard label="Ø Standzeit" value="38 Tage" trend="-12%" positive />
        <StatCard label="Offene Leads" value="8" trend="2 neu" />
        <StatCard label="Ø Marge" value="CHF 2'840" trend="+8%" positive />
      </div>
      <div className="bg-white rounded-lg p-3 border border-slate-200">
        <div className="text-xs font-medium text-slate-500 mb-2">Letzte Aktivität</div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
            <TrendingUp className="h-3 w-3 text-emerald-600" />
          </div>
          <div className="text-xs">
            <span className="font-medium text-slate-900">BMW 320d</span>
            <span className="text-slate-500"> verkauft · CHF 3'200 Marge</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function VehicleScreen() {
  return (
    <div className="p-4 space-y-3 animate-fadeIn">
      <div className="bg-white rounded-lg p-3 border border-slate-200">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center">
            <Plus className="h-4 w-4 text-sky-600" />
          </div>
          <div className="text-sm font-medium text-slate-900">Neues Fahrzeug</div>
        </div>
        <div className="space-y-2">
          <FormField label="Marke / Modell" value="Audi A4 Avant" />
          <FormField label="Erstzulassung" value="03/2021" />
          <FormField label="Kilometerstand" value="45'000 km" />
          <FormField label="Einkaufspreis" value="CHF 28'500" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="flex-1 h-16 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-xs">
          📷 Fotos hochladen
        </div>
        <div className="flex-1 h-16 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-xs">
          📄 Dokumente
        </div>
      </div>
    </div>
  );
}

function LeadsScreen() {
  return (
    <div className="p-4 space-y-2 animate-fadeIn">
      <LeadCard 
        name="Hans Meier" 
        vehicle="Audi A4 Avant" 
        time="vor 45 Min." 
        status="new"
      />
      <LeadCard 
        name="Sandra Keller" 
        vehicle="BMW 320d Touring" 
        time="vor 2 Std." 
        status="pending"
      />
      <LeadCard 
        name="Marco Brunner" 
        vehicle="VW Golf VII" 
        time="gestern" 
        status="done"
      />
      <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
        <div className="flex items-center gap-2 text-amber-700 text-xs">
          <Clock className="h-3 w-3" />
          <span className="font-medium">Erinnerung:</span>
          <span>2 Leads ohne Antwort seit 24h</span>
        </div>
      </div>
    </div>
  );
}

function AnalyticsScreen() {
  return (
    <div className="p-4 space-y-3 animate-fadeIn">
      <div className="bg-white rounded-lg p-3 border border-slate-200">
        <div className="text-xs font-medium text-slate-500 mb-2">Standzeit-Verteilung</div>
        <div className="flex items-end gap-1 h-16">
          <Bar height={30} color="emerald" label="0-30" />
          <Bar height={60} color="sky" label="30-60" />
          <Bar height={45} color="amber" label="60-90" />
          <Bar height={20} color="red" label="90+" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-red-50 rounded-lg p-3 border border-red-200">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-3 w-3 text-red-600" />
            <span className="text-xs font-medium text-red-900">Langsteher</span>
          </div>
          <div className="text-lg font-bold text-red-700">3</div>
          <div className="text-xs text-red-600">&gt; 90 Tage</div>
        </div>
        <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-3 w-3 text-emerald-600" />
            <span className="text-xs font-medium text-emerald-900">Trend</span>
          </div>
          <div className="text-lg font-bold text-emerald-700">-12%</div>
          <div className="text-xs text-emerald-600">vs. Vormonat</div>
        </div>
      </div>
    </div>
  );
}

// Helper components
function StatCard({ label, value, trend, positive }: { 
  label: string; 
  value: string; 
  trend: string;
  positive?: boolean;
}) {
  return (
    <div className="bg-white rounded-lg p-3 border border-slate-200">
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className="text-lg font-bold text-slate-900">{value}</div>
      <div className={`text-xs ${positive ? 'text-emerald-600' : 'text-slate-500'}`}>
        {trend}
      </div>
    </div>
  );
}

function FormField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900 bg-slate-50 px-2 py-1 rounded">{value}</span>
    </div>
  );
}

function LeadCard({ name, vehicle, time, status }: {
  name: string;
  vehicle: string;
  time: string;
  status: "new" | "pending" | "done";
}) {
  const statusConfig = {
    new: { bg: "bg-sky-100", text: "text-sky-700", label: "Neu" },
    pending: { bg: "bg-amber-100", text: "text-amber-700", label: "Offen" },
    done: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Erledigt" },
  };
  const config = statusConfig[status];
  
  return (
    <div className="bg-white rounded-lg p-3 border border-slate-200 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center text-white text-xs font-medium">
          {name.charAt(0)}
        </div>
        <div>
          <div className="text-xs font-medium text-slate-900">{name}</div>
          <div className="text-xs text-slate-500">{vehicle}</div>
        </div>
      </div>
      <div className="text-right">
        <div className={`text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.text}`}>
          {config.label}
        </div>
        <div className="text-xs text-slate-400 mt-1">{time}</div>
      </div>
    </div>
  );
}

function Bar({ height, color, label }: { height: number; color: string; label: string }) {
  const colorClasses = {
    emerald: "bg-emerald-500",
    sky: "bg-sky-500",
    amber: "bg-amber-500",
    red: "bg-red-500",
  };
  
  return (
    <div className="flex-1 flex flex-col items-center gap-1">
      <div 
        className={`w-full rounded-t ${colorClasses[color as keyof typeof colorClasses]}`}
        style={{ height: `${height}%` }}
      />
      <span className="text-[10px] text-slate-500">{label}</span>
    </div>
  );
}

export function DemoVideoModal({ open, onOpenChange }: DemoVideoModalProps) {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showCTA, setShowCTA] = useState(false);

  // Auto-advance screens
  useEffect(() => {
    if (!open || !isPlaying) return;

    const interval = setInterval(() => {
      setCurrentScreen((prev) => {
        const next = prev + 1;
        if (next >= demoScreens.length) {
          setIsPlaying(false);
          setShowCTA(true);
          return prev;
        }
        return next;
      });
    }, 4000); // 4 seconds per screen

    return () => clearInterval(interval);
  }, [open, isPlaying]);

  // Reset when modal opens
  useEffect(() => {
    if (open) {
      setCurrentScreen(0);
      setIsPlaying(true);
      setShowCTA(false);
    }
  }, [open]);

  const handleReplay = () => {
    setCurrentScreen(0);
    setIsPlaying(true);
    setShowCTA(false);
  };

  const screen = demoScreens[currentScreen];
  const ScreenContent = screen.content;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-2xl p-0 overflow-hidden bg-slate-50 gap-0"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Dealer OS Demo</DialogTitle>
        
        {/* Header */}
        <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              screen.color === "sky" ? "bg-sky-100" :
              screen.color === "emerald" ? "bg-emerald-100" :
              screen.color === "violet" ? "bg-violet-100" : "bg-amber-100"
            }`}>
              <screen.icon className={`h-5 w-5 ${
                screen.color === "sky" ? "text-sky-600" :
                screen.color === "emerald" ? "text-emerald-600" :
                screen.color === "violet" ? "text-violet-600" : "text-amber-600"
              }`} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">{screen.title}</h3>
              <p className="text-sm text-slate-500">{screen.subtitle}</p>
            </div>
          </div>
          <button 
            onClick={() => onOpenChange(false)}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        {/* Content Area - Phone Mockup */}
        <div className="p-6 flex justify-center">
          <div className="relative w-[280px]">
            {/* Phone Frame */}
            <div className="bg-slate-900 rounded-[2rem] p-2 shadow-2xl">
              <div className="bg-slate-50 rounded-[1.5rem] overflow-hidden">
                {/* Phone Notch */}
                <div className="h-6 bg-white flex items-center justify-center">
                  <div className="w-20 h-4 bg-slate-900 rounded-full" />
                </div>
                
                {/* Screen Content */}
                <div className="h-[380px] bg-slate-50 overflow-hidden">
                  <ScreenContent />
                </div>
                
                {/* Home Bar */}
                <div className="h-5 bg-white flex items-center justify-center">
                  <div className="w-24 h-1 bg-slate-300 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress & Controls */}
        <div className="bg-white border-t border-slate-200 p-4">
          {/* Progress Bar */}
          <div className="flex gap-1.5 mb-4">
            {demoScreens.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => {
                  setCurrentScreen(idx);
                  setIsPlaying(false);
                  setShowCTA(false);
                }}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  idx === currentScreen
                    ? "bg-sky-600"
                    : idx < currentScreen
                    ? "bg-sky-300"
                    : "bg-slate-200"
                }`}
              />
            ))}
          </div>

          {/* CTA Section */}
          {showCTA ? (
            <div className="space-y-3 animate-fadeIn">
              <div className="text-center">
                <p className="text-sm font-medium text-slate-900 mb-1">
                  Überzeugt? Starten Sie noch heute.
                </p>
                <p className="text-xs text-slate-500">
                  14 Tage kostenlos · Keine Kreditkarte
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={handleReplay}>
                  <Play className="h-4 w-4" />
                  Nochmal
                </Button>
                <Button className="flex-1 bg-sky-600 hover:bg-sky-700" asChild>
                  <Link href="/register">
                    Jetzt kostenlos testen
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                {isPlaying ? (
                  <>
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    Demo läuft...
                  </>
                ) : (
                  <>Klick auf Balken zum Navigieren</>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">
                  {currentScreen + 1} / {demoScreens.length}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="text-xs"
                >
                  {isPlaying ? "Pause" : "Play"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Trigger Button Component
export function DemoVideoButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        size="lg"
        variant="outline"
        onClick={() => setOpen(true)}
        className={className}
      >
        <Play className="h-4 w-4" />
        Live-Demo ansehen
      </Button>
      <DemoVideoModal open={open} onOpenChange={setOpen} />
    </>
  );
}
