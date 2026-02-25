"use client";

import Link from "next/link";
import "@/app/globals.css";

export default function RootNotFound() {
  return (
    <html lang="de">
      <head>
        <title>404 - Seite nicht gefunden | DealerOS</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 flex flex-col">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-sky-200/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200/30 rounded-full blur-3xl" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative">
          {/* Icon */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-400 to-indigo-500 rounded-3xl blur-xl opacity-20" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-xl shadow-sky-500/20">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 17h8M9 13h6M10 9h4" />
                <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={2} />
              </svg>
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
            <Link 
              href="/"
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl text-white font-semibold shadow-lg shadow-sky-500/25 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Zur Startseite
            </Link>
            <Link 
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Zum Dashboard
            </Link>
          </div>

          {/* Back Link */}
          <button 
            onClick={() => window.history.back()} 
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
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
      </body>
    </html>
  );
}
