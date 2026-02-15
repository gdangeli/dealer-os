import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20">
        {/* Car Icon */}
        <div className="mb-8">
          <svg 
            className="w-32 h-32 text-slate-800" 
            viewBox="0 0 24 24" 
            fill="currentColor"
          >
            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
          </svg>
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 text-center mb-6">
          Autohandel,<br />vereinfacht.
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-slate-500 text-center max-w-lg mb-10">
          Wissen Sie Ihren Gewinn pro Fahrzeug. Erkennen Sie Langsteher. 
          Treffen Sie datenbasierte Entscheidungen.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/register">
            <button className="px-8 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors">
              Kostenlos starten
            </button>
          </Link>
          <Link href="/login">
            <button className="px-8 py-3 bg-white text-slate-900 rounded-lg font-medium border border-slate-300 hover:bg-slate-50 transition-colors">
              Anmelden
            </button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center">
        <p className="text-sm text-slate-400">
          Für Garagisten, die ihr Geschäft ernst nehmen.
        </p>
      </footer>
    </div>
  );
}
