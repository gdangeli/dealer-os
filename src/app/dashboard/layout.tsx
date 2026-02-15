import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 w-64 h-screen bg-white border-r border-slate-200 p-4">
        <div className="flex items-center gap-2 mb-8">
          <span className="text-2xl">🚗</span>
          <span className="text-xl font-bold">Dealer OS</span>
          <Badge variant="secondary" className="ml-auto">Beta</Badge>
        </div>
        
        <nav className="space-y-2">
          <Link href="/dashboard">
            <Button variant="ghost" className="w-full justify-start">
              📊 Dashboard
            </Button>
          </Link>
          <Link href="/dashboard/vehicles">
            <Button variant="ghost" className="w-full justify-start">
              🚙 Fahrzeuge
            </Button>
          </Link>
          <Link href="/dashboard/leads">
            <Button variant="ghost" className="w-full justify-start">
              💬 Anfragen
            </Button>
          </Link>
          <Link href="/dashboard/publish">
            <Button variant="ghost" className="w-full justify-start">
              🚀 Inserieren
            </Button>
          </Link>
          <Link href="/dashboard/analytics">
            <Button variant="ghost" className="w-full justify-start">
              📈 Analytics
            </Button>
          </Link>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <Link href="/dashboard/settings">
            <Button variant="ghost" className="w-full justify-start">
              ⚙️ Einstellungen
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  );
}
