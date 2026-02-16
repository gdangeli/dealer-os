import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  asking_price?: number;
  acquired_at: string;
}

interface LongStandingProps {
  vehicles: Vehicle[];
}

export function LongStanding({ vehicles }: LongStandingProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-orange-600">⚠️ Brauchen Aufmerksamkeit</CardTitle>
        <CardDescription>Diese Fahrzeuge stehen über 30 Tage</CardDescription>
      </CardHeader>
      <CardContent>
        {vehicles && vehicles.length > 0 ? (
          <div className="space-y-4">
            {vehicles.map((vehicle) => {
              const days = Math.floor((Date.now() - new Date(vehicle.acquired_at).getTime()) / (1000 * 60 * 60 * 24));
              return (
                <Link key={vehicle.id} href={`/dashboard/vehicles/${vehicle.id}`}>
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors">
                    <div>
                      <div className="font-medium">{vehicle.make} {vehicle.model}</div>
                      <div className="text-sm text-slate-600">
                        CHF {vehicle.asking_price?.toLocaleString('de-CH')}
                      </div>
                    </div>
                    <div className="text-sm font-medium text-orange-600">{days} Tage</div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-slate-500 text-center py-8">Alles im grünen Bereich! 🎉</p>
        )}
        <Link href="/dashboard/vehicles">
          <Button variant="outline" className="w-full mt-4">
            Zum Bestand
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
