import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface KPICardsProps {
  stats: {
    totalVehicles: number;
    inStockVehicles: number;
    newLeads: number;
  };
  dealer: {
    status: string;
    subscription_plan?: string;
  } | null;
}

export function KPICards({ stats, dealer }: KPICardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Am Lager</CardDescription>
          <CardTitle className="text-3xl">{stats.inStockVehicles}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">{stats.totalVehicles} Fahrzeuge insgesamt</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Offene Anfragen</CardDescription>
          <CardTitle className="text-3xl text-blue-600">{stats.newLeads}</CardTitle>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard/leads?status=new">
            <Button variant="link" className="p-0 h-auto text-sm">Jetzt bearbeiten →</Button>
          </Link>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Ihr Konto</CardDescription>
          <CardTitle className="text-xl text-green-600">
            {dealer?.status === 'active' ? '✅ Aktiv' : '⏳ Wird geprüft'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">Abo: {dealer?.subscription_plan || 'Gratis Beta'}</p>
        </CardContent>
      </Card>
    </div>
  );
}
