import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Lead {
  id: string;
  name: string;
  created_at: string;
  vehicles?: {
    make: string;
    model: string;
  };
}

interface RecentLeadsProps {
  leads: Lead[];
}

export function RecentLeads({ leads }: RecentLeadsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Neue Anfragen</CardTitle>
        <CardDescription>Diese Kunden warten auf Ihre Antwort</CardDescription>
      </CardHeader>
      <CardContent>
        {leads && leads.length > 0 ? (
          <div className="space-y-4">
            {leads.map((lead) => (
              <Link key={lead.id} href={`/dashboard/leads/${lead.id}`}>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div>
                    <div className="font-medium">{lead.name}</div>
                    <div className="text-sm text-slate-600">
                      {lead.vehicles ? `${lead.vehicles.make} ${lead.vehicles.model}` : 'Allgemeine Anfrage'}
                    </div>
                  </div>
                  <div className="text-sm text-slate-500">
                    {new Date(lead.created_at).toLocaleDateString('de-CH')}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-center py-8">Keine neuen Anfragen – Zeit für eine Pause ☕</p>
        )}
        <Link href="/dashboard/leads">
          <Button variant="outline" className="w-full mt-4">
            Alle Anfragen
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
