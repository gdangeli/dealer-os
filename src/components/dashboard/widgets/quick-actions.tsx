import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface QuickActionsProps {
  totalVehicles: number;
}

export function QuickActions({ totalVehicles }: QuickActionsProps) {
  if (totalVehicles > 0) return null;

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader>
        <CardTitle>🚀 Los geht&apos;s!</CardTitle>
        <CardDescription>Erfassen Sie Ihr erstes Fahrzeug – dauert nur 2 Minuten.</CardDescription>
      </CardHeader>
      <CardContent>
        <Link href="/dashboard/vehicles/new">
          <Button>Erstes Fahrzeug erfassen</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
