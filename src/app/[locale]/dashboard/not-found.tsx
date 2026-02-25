"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search, ArrowLeft, FileQuestion } from "lucide-react";

export default function DashboardNotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center relative">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-sky-100 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-100 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="relative">
        {/* Icon */}
        <div className="relative mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto">
            <FileQuestion className="w-10 h-10 text-slate-400" />
          </div>
        </div>

        {/* 404 Badge */}
        <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-600 rounded-full px-4 py-1.5 mb-4 text-sm font-medium">
          <span>Fehler 404</span>
        </div>
        
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
          Seite nicht gefunden
        </h1>
        
        <p className="text-slate-600 mb-8 max-w-md">
          Die angeforderte Seite existiert nicht oder wurde verschoben. 
          Überprüfen Sie die URL oder navigieren Sie zurück.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <Button 
            asChild 
            size="lg"
            className="bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700"
          >
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

        {/* Back Link */}
        <button 
          onClick={() => window.history.back()} 
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Zurück zur vorherigen Seite</span>
        </button>
      </div>
    </div>
  );
}
