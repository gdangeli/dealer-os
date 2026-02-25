import Link from "next/link";
import { Car, Home, ArrowLeft } from "lucide-react";

export default function RootNotFound() {
  return (
    <html lang="de">
      <body className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 flex flex-col">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-sky-200/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200/30 rounded-full blur-3xl" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative">
          {/* Icon with Animation */}
          <div className="relative mb-8">
            <div 
              className="absolute inset-0 rounded-3xl blur-xl opacity-20"
              style={{ background: 'linear-gradient(to bottom right, #0ea5e9, #6366f1)' }}
            />
            <div 
              className="relative w-24 h-24 rounded-3xl flex items-center justify-center shadow-xl"
              style={{ background: 'linear-gradient(to bottom right, #0ea5e9, #6366f1)' }}
            >
              <Car className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* 404 Text */}
          <h1 
            className="text-8xl sm:text-9xl font-extrabold mb-4"
            style={{ 
              background: 'linear-gradient(to right, #0ea5e9, #6366f1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
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
              className="inline-flex items-center justify-center h-12 px-6 rounded-lg text-white font-semibold shadow-lg"
              style={{ background: 'linear-gradient(to right, #0ea5e9, #6366f1)' }}
            >
              <Home className="w-5 h-5 mr-2" />
              Zur Startseite
            </Link>
            <Link 
              href="/dashboard"
              className="inline-flex items-center justify-center h-12 px-6 rounded-lg font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              Zum Dashboard
            </Link>
          </div>

          {/* Decorative Road */}
          <div className="mt-16 w-full max-w-lg">
            <div className="h-2 rounded-full" style={{ background: 'linear-gradient(to right, transparent, #e2e8f0, transparent)' }} />
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
