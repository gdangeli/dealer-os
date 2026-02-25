"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, Home, ArrowLeft } from "lucide-react";

export default function DashboardNotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
      <div className="text-8xl mb-6">🔍</div>
      
      <h1 className="text-2xl font-bold text-slate-900 mb-2">
        Seite nicht gefunden
      </h1>
      
      <p className="text-slate-600 mb-6 max-w-md">
        Die angeforderte Seite existiert nicht oder wurde verschoben. 
        Überprüfen Sie die URL oder navigieren Sie zurück zur Übersicht.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button asChild size="lg">
          <Link href="/dashboard">
            <Home className="w-4 h-4 mr-2" />
            Zur Übersicht
          </Link>
        </Button>
        <Button variant="outline" size="lg" asChild>
          <Link href="/dashboard/vehicles">
            <Search className="w-4 h-4 mr-2" />
            Fahrzeuge suchen
          </Link>
        </Button>
      </div>

      <p className="mt-8 text-sm text-slate-500">
        <ArrowLeft className="w-4 h-4 inline mr-1" />
        <button 
          onClick={() => window.history.back()} 
          className="hover:underline"
        >
          Zurück zur vorherigen Seite
        </button>
      </p>
    </div>
  );
}
