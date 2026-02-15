import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🚗</span>
            <span className="text-xl font-bold text-white">Dealer OS</span>
            <Badge variant="secondary" className="ml-2">Beta</Badge>
          </div>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-white">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Kostenlos testen</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <main className="container mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <Badge className="mb-4">Für Schweizer Autohändler & Garagisten</Badge>
          <h1 className="text-5xl font-bold text-white mb-6">
            Weniger Admin.<br />Mehr Verkauf.
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            Das Betriebssystem für Ihren Autohandel. Bestand, Inserate, Kunden — alles in einem.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8">
                Jetzt Beta-Zugang sichern
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Mehr erfahren
              </Button>
            </Link>
          </div>
        </div>

        {/* Pain Points */}
        <div className="mt-24 text-center">
          <p className="text-slate-400 mb-8">Kommt Ihnen das bekannt vor?</p>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-red-400">😤 Zeitfresser</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300">
                Jedes Auto auf 5 Plattformen hochladen. Immer wieder dieselben Fotos, dieselben Texte.
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-red-400">📱 Chaos</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300">
                Anfragen auf WhatsApp, E-Mail, Telefon. Wer hat wann was gefragt? Keine Ahnung.
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-red-400">💸 Bauchgefühl</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300">
                Preise nach Gefühl. Steht das Auto 3 Monate? Zu teuer. Nach 2 Tagen weg? Zu billig.
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features */}
        <div id="features" className="mt-24">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Eine Lösung für alles
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">📸 Fahrzeug-Erfassung</CardTitle>
                <CardDescription>Fotos, Daten, Zustand — strukturiert erfasst</CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">🚀 1-Click Publishing</CardTitle>
                <CardDescription>Einmal erfassen, überall inserieren</CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">💬 Kunden-Inbox</CardTitle>
                <CardDescription>Alle Anfragen an einem Ort</CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">🤖 AI-Preisempfehlung</CardTitle>
                <CardDescription>Optimaler Preis basierend auf Marktdaten</CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">📊 Standzeit-Tracking</CardTitle>
                <CardDescription>Wissen, welche Autos sich bewegen</CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">🔔 Follow-up Reminders</CardTitle>
                <CardDescription>Nie wieder einen Lead vergessen</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-24 text-center">
          <Card className="bg-gradient-to-r from-blue-600 to-blue-700 border-0 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-white text-2xl">Beta-Programm</CardTitle>
              <CardDescription className="text-blue-100">
                Wir suchen 30 Händler, die Dealer OS mitgestalten wollen.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/register">
                <Button size="lg" variant="secondary" className="text-lg">
                  Jetzt bewerben — kostenlos während der Beta
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-20 border-t border-slate-700">
        <div className="flex justify-between items-center text-slate-400">
          <div>© 2026 Dealer OS</div>
          <div className="flex gap-6">
            <Link href="/impressum" className="hover:text-white">Impressum</Link>
            <Link href="/datenschutz" className="hover:text-white">Datenschutz</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
