"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search, ArrowLeft, Car } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 flex flex-col">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-sky-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200/30 rounded-full blur-3xl" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative">
        {/* Icon with Animation */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-400 to-indigo-500 rounded-3xl blur-xl opacity-20 animate-pulse" />
          <div className="relative w-24 h-24 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-xl shadow-sky-500/20">
            <Car className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* 404 Text */}
        <h1 className="text-8xl sm:text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-indigo-600 mb-4">
          404
        </h1>
        
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
          Seite nicht gefunden
        </h2>
        
        <p className="text-slate-600 mb-10 max-w-md text-lg">
          Die angeforderte Seite existiert nicht oder wurde verschoben. 
          Kein Problem — wir bringen Sie zurück auf die Spur.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Button 
            asChild 
            size="lg"
            className="h-12 px-6 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 shadow-lg shadow-sky-500/25"
          >
            <Link href="/">
              <Home className="w-5 h-5 mr-2" />
              Zur Startseite
            </Link>
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            asChild
            className="h-12 px-6 border-slate-200 hover:bg-slate-50"
          >
            <Link href="/dashboard">
              <Search className="w-5 h-5 mr-2" />
              Zum Dashboard
            </Link>
          </Button>
        </div>

        {/* Back Link */}
        <button 
          onClick={() => window.history.back()} 
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Zurück zur vorherigen Seite</span>
        </button>

        {/* Decorative Road */}
        <div className="mt-16 w-full max-w-lg">
          <div className="h-2 bg-gradient-to-r from-transparent via-slate-200 to-transparent rounded-full" />
          <div className="flex justify-center gap-4 mt-2">
            <div className="w-8 h-1 bg-slate-200 rounded-full" />
            <div className="w-8 h-1 bg-slate-200 rounded-full" />
            <div className="w-8 h-1 bg-slate-200 rounded-full" />
            <div className="w-8 h-1 bg-slate-200 rounded-full" />
            <div className="w-8 h-1 bg-slate-200 rounded-full" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 text-center">
        <p className="text-sm text-slate-400">
          © 2026 DealerOS • Made with ❤️ in Switzerland
        </p>
      </div>
    </div>
  );
}
