"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home, MessageCircle } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
      <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6 animate-bounce-gentle">
        <AlertTriangle className="w-10 h-10 text-red-500" />
      </div>
      
      <h1 className="text-2xl font-bold text-slate-900 mb-2">
        Ein Fehler ist aufgetreten
      </h1>
      
      <p className="text-slate-600 mb-6 max-w-md">
        Wir konnten diese Seite nicht laden. Das kann an einer temporären 
        Verbindungsstörung liegen. Bitte versuchen Sie es erneut.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <Button onClick={reset} size="lg">
          <RefreshCw className="w-4 h-4 mr-2" />
          Erneut versuchen
        </Button>
        <Button variant="outline" size="lg" asChild>
          <a href="/dashboard">
            <Home className="w-4 h-4 mr-2" />
            Zur Übersicht
          </a>
        </Button>
      </div>

      <div className="text-sm text-slate-500">
        <p>Das Problem besteht weiterhin?</p>
        <a 
          href="mailto:support@dealeros.ch" 
          className="inline-flex items-center gap-1 text-primary hover:underline mt-1"
        >
          <MessageCircle className="w-4 h-4" />
          Support kontaktieren
        </a>
      </div>

      {process.env.NODE_ENV === "development" && (
        <details className="mt-8 text-left w-full max-w-2xl">
          <summary className="text-sm text-slate-500 cursor-pointer hover:text-slate-700">
            Technische Details (nur in Entwicklung)
          </summary>
          <pre className="mt-2 p-4 bg-slate-100 rounded-lg text-xs text-red-600 overflow-auto">
            {error.message}
            {error.stack && `\n\n${error.stack}`}
            {error.digest && `\n\nDigest: ${error.digest}`}
          </pre>
        </details>
      )}
    </div>
  );
}
